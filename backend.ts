// Backend functionality for PG Waala
'use strict';

import { performanceMonitor } from '@/modules/performance';
import { cacheManager } from '@/modules/cache';
import { filterManager } from '@/modules/filters';
import { createVirtualScroll } from '@/modules/virtualScroll';
import { DOMElements, PG, FilterCriteria } from '@/types';

// Global state
let pgData: PG[] = [];
let virtualScroll = createVirtualScroll();
let activeAmenityFilters = new Set<string>();

// DOM Elements cache
const domElements: DOMElements = {
    locationSelect: null,
    priceRangeMin: null,
    priceRangeMax: null,
    priceDisplay: null,
    listingsContainer: null,
    heading: null,
    amenityChips: null,
    pgTypeCheckboxes: null,
    searchInput: null,
    loadingIndicator: null,
    resetFiltersBtn: null,
    errorContainer: null
};

// Configuration
const config = {
    defaultPriceRange: { min: 4000, max: 50000 },
    debounceDelay: 300,
    retryAttempts: 3,
    retryDelay: 1000,
    amenityIcons: {
        wifi: '<i class="fas fa-wifi"></i>',
        food: '<i class="fas fa-utensils"></i>',
        ac: '<i class="fas fa-snowflake"></i>',
        furnished: '<i class="fas fa-couch"></i>',
        laundry: '<i class="fas fa-tshirt"></i>',
        security: '<i class="fas fa-shield-alt"></i>',
        water: '<i class="fas fa-tint"></i>'
    } as Record<string, string>
};

// Initialize the application
export async function initializeBackend(): Promise<void> {
    await performanceMonitor.measure('init-backend', async () => {
        try {
            showLoadingIndicator();
            await cacheDOMElements();
            await loadDataAndInitialize();
            setupEventListeners();
            hideLoadingIndicator();
            console.log('Backend initialized successfully');
        } catch (error) {
            console.error('Backend initialization error:', error);
            showError('Failed to initialize application');
            hideLoadingIndicator();
        }
    });
}

// Cache DOM elements for better performance
async function cacheDOMElements(): Promise<void> {
    await performanceMonitor.measure('cache-dom', async () => {
        try {
            domElements.locationSelect = document.querySelector('select');
            domElements.priceRangeMin = document.querySelector('.price-range-min') as HTMLInputElement;
            domElements.priceRangeMax = document.querySelector('.price-range-max') as HTMLInputElement;
            domElements.priceDisplay = document.querySelector('.price-display');
            domElements.listingsContainer = document.getElementById('listings-container');
            domElements.heading = document.getElementById('listings-heading');
            domElements.amenityChips = document.querySelectorAll('.amenity-chip');
            domElements.pgTypeCheckboxes = document.querySelectorAll('input[type="checkbox"][name="pgType"]');
            domElements.searchInput = document.querySelector('input[type="text"]');
            domElements.loadingIndicator = document.getElementById('loading-indicator');
            domElements.resetFiltersBtn = document.querySelector('.reset-filters');
            domElements.errorContainer = document.getElementById('error-container');
        } catch (error) {
            console.error('Error caching DOM elements:', error);
            throw new Error('Failed to cache DOM elements');
        }
    });
}

// Load data and initialize the application
async function loadDataAndInitialize(): Promise<boolean> {
    return await performanceMonitor.measure('load-data', async () => {
        try {
            // Try to load from cache first
            const cachedData = await cacheManager.get<PG[]>('pg-data');
            if (cachedData) {
                pgData = cachedData;
                await filterManager.loadCachedIndexes();
            } else {
                const response = await fetch('pg_data.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                pgData = await response.json();
                
                if (!Array.isArray(pgData)) {
                    throw new Error('Invalid data format');
                }
                
                // Cache the data
                await cacheManager.set('pg-data', pgData);
                await filterManager.initialize(pgData);
            }
            
            initializeUI();
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    });
}

// Initialize UI components
function initializeUI(): void {
    if (!pgData.length) {
        showError('No PG data available');
        return;
    }

    initializeLocationFilter();
    initializePriceRangeFilter();
    initializeAmenityFilters();
    initializeVirtualScroll();
}

// Initialize virtual scroll
function initializeVirtualScroll(): void {
    if (!domElements.listingsContainer) return;
    
    virtualScroll.initialize(
        domElements.listingsContainer,
        pgData,
        (items) => {
            const fragment = document.createDocumentFragment();
            items.forEach(pg => fragment.appendChild(createPGCard(pg)));
            domElements.listingsContainer!.innerHTML = '';
            domElements.listingsContainer!.appendChild(fragment);
        }
    );
}

// Initialize location filter
function initializeLocationFilter() {
    if (!domElements.locationSelect) return;
    
    const locations = [...new Set(pgData.map(pg => pg.location))].sort();
    
    domElements.locationSelect.innerHTML = `
        <option value="all">All Locations</option>
        ${locations.map(location => `
            <option value="${location}">${location}</option>
        `).join('')}
    `;
}

// Initialize price range filter
function initializePriceRangeFilter() {
    if (!domElements.priceRangeMin || !domElements.priceRangeMax) return;
    
    const prices = pgData.map(pg => pg.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    // Set up min range input
    domElements.priceRangeMin.min = String(minPrice);
    domElements.priceRangeMin.max = String(maxPrice);
    domElements.priceRangeMin.value = String(minPrice);
    
    // Set up max range input
    domElements.priceRangeMax.min = String(minPrice);
    domElements.priceRangeMax.max = String(maxPrice);
    domElements.priceRangeMax.value = String(maxPrice);
    
    updatePriceDisplay();
}

// Initialize amenity filters
function initializeAmenityFilters() {
    const amenitiesContainer = document.querySelector('.amenity-chips');
    if (!amenitiesContainer) return;
    
    // Get unique amenities from all PGs
    const uniqueAmenities = [...new Set(pgData.flatMap(pg => pg.amenities))].sort();
    
    amenitiesContainer.innerHTML = uniqueAmenities.map(amenity => `
        <div class="amenity-chip" data-amenity="${amenity}">
            ${config.amenityIcons[amenity] || ''} ${amenity.charAt(0).toUpperCase() + amenity.slice(1)}
        </div>
    `).join('');
    
    // Cache the new amenity chips
    domElements.amenityChips = document.querySelectorAll('.amenity-chip');
}

// Setup event listeners
function setupEventListeners() {
    try {
        // Search input
        if (domElements.searchInput) {
            domElements.searchInput.addEventListener('input', debounce(() => {
                applyFilters();
            }, config.debounceDelay));
        }

        // Price range
        if (domElements.priceRangeMin && domElements.priceRangeMax) {
            domElements.priceRangeMin.addEventListener('input', () => {
                updatePriceDisplay();
                applyFilters();
            });
            domElements.priceRangeMax.addEventListener('input', () => {
                updatePriceDisplay();
                applyFilters();
            });
        }

        // Location select
        if (domElements.locationSelect) {
            domElements.locationSelect.addEventListener('change', () => {
                applyFilters();
            });
        }

        // PG type checkboxes
        domElements.pgTypeCheckboxes?.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                applyFilters();
            });
        });

        // Amenity chips
        domElements.amenityChips?.forEach(chip => {
            chip.addEventListener('click', () => {
                toggleAmenityFilter(chip);
                applyFilters();
            });
        });

        // Reset filters button
        if (domElements.resetFiltersBtn) {
            domElements.resetFiltersBtn.addEventListener('click', resetFilters);
        }

    } catch (error) {
        console.error('Error setting up event listeners:', error);
        showError('Failed to setup event listeners');
    }
}

// Toggle amenity filter
function toggleAmenityFilter(chip: HTMLElement) {
    const amenity = chip.dataset.amenity;
    if (!amenity) return;
    
    chip.classList.toggle('active');
    
    if (chip.classList.contains('active')) {
        activeAmenityFilters.add(amenity);
    } else {
        activeAmenityFilters.delete(amenity);
    }
}

// Reset all filters
function resetFilters() {
    // Reset search
    if (domElements.searchInput) {
        domElements.searchInput.value = '';
    }
    
    // Reset price range
    if (domElements.priceRangeMin && domElements.priceRangeMax) {
        const prices = pgData.map(pg => pg.price);
        domElements.priceRangeMin.value = String(Math.min(...prices));
        domElements.priceRangeMax.value = String(Math.max(...prices));
        updatePriceDisplay();
    }
    
    // Reset location
    if (domElements.locationSelect) {
        domElements.locationSelect.value = 'all';
    }
    
    // Reset PG types
    domElements.pgTypeCheckboxes?.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset amenities
    activeAmenityFilters.clear();
    domElements.amenityChips?.forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Apply reset filters
    applyFilters();
}

// Update price display
function updatePriceDisplay() {
    if (!domElements.priceDisplay || !domElements.priceRangeMin || !domElements.priceRangeMax) return;
    
    const minPrice = parseInt(domElements.priceRangeMin.value);
    const maxPrice = parseInt(domElements.priceRangeMax.value);
    
    domElements.priceDisplay.textContent = `₹${(minPrice/1000).toFixed(1)}K - ₹${(maxPrice/1000).toFixed(1)}K`;
}

// Apply all filters
async function applyFilters(): Promise<void> {
    await performanceMonitor.measure('apply-filters', async () => {
        try {
            const criteria: FilterCriteria = {
                searchTerm: domElements.searchInput?.value.toLowerCase() || '',
                minPrice: parseInt(domElements.priceRangeMin?.value || String(config.defaultPriceRange.min)),
                maxPrice: parseInt(domElements.priceRangeMax?.value || String(config.defaultPriceRange.max)),
                location: domElements.locationSelect?.value || 'all',
                type: Array.from(domElements.pgTypeCheckboxes || [])
                    .filter(cb => cb.checked)
                    .map(cb => cb.value),
                amenities: Array.from(activeAmenityFilters)
            };

            const filteredPGs = await filterManager.filter(criteria);
            virtualScroll.updateItems(filteredPGs);
            updateListingsHeading(filteredPGs.length);
        } catch (error) {
            console.error('Error applying filters:', error);
            showError('Failed to apply filters');
        }
    });
}

// Display PG listings
function displayPGListings(pgs: PG[]) {
    if (!domElements.listingsContainer) return;
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    if (pgs.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'text-center py-8 text-gray-500';
        noResults.textContent = 'No PGs found matching your criteria';
        fragment.appendChild(noResults);
    } else {
        pgs.forEach(pg => {
            fragment.appendChild(createPGCard(pg));
        });
    }
    
    domElements.listingsContainer.innerHTML = '';
    domElements.listingsContainer.appendChild(fragment);
    updateListingsHeading(pgs.length);
}

// Create PG card
function createPGCard(pg: PG) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow';
    
    const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBHIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    
    card.innerHTML = `
        <div class="relative">
            <img src="${pg.image || placeholderImage}" 
                alt="${pg.owner}'s PG" 
                class="w-full h-48 object-cover"
                onerror="this.onerror=null; this.src='${placeholderImage}';">
            <div class="absolute top-2 right-2 flex gap-2">
                <span class="bg-white px-2 py-1 rounded-full text-sm font-medium shadow-sm">
                    <i class="fas fa-star text-yellow-400"></i> ${pg.rating}
                </span>
            </div>
        </div>
        <div class="p-4">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-lg">${pg.owner}</h3>
                <span class="text-sm text-gray-500">${pg.reviews} reviews</span>
            </div>
            <p class="text-gray-600 mb-2">
                <i class="fas fa-map-marker-alt mr-1"></i> ${pg.location}
            </p>
            <p class="text-blue-600 font-bold mb-3">₹${pg.price.toLocaleString()}/month</p>
            <div class="flex flex-wrap gap-2 mb-3">
                ${pg.amenities.map(amenity => `
                    <span class="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                        ${config.amenityIcons[amenity] || ''} 
                        <span class="ml-1">${amenity.charAt(0).toUpperCase() + amenity.slice(1)}</span>
                    </span>
                `).join('')}
            </div>
            <button class="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Details
            </button>
        </div>
    `;
    
    return card;
}

// Update listings heading
function updateListingsHeading(count: number) {
    if (!domElements.heading) return;
    const location = domElements.locationSelect?.value;
    const locationText = location === 'all' ? '' : ` in ${location}`;
    domElements.heading.textContent = `${count} PG${count === 1 ? '' : 's'} found${locationText}`;
}

// Show loading indicator
function showLoadingIndicator() {
    if (domElements.loadingIndicator) {
        domElements.loadingIndicator.style.display = 'flex';
    }
}

// Hide loading indicator
function hideLoadingIndicator() {
    if (domElements.loadingIndicator) {
        domElements.loadingIndicator.style.display = 'none';
    }
}

// Show error message
function showError(message: string) {
    console.error(message);
    if (domElements.errorContainer) {
        const errorElement = document.createElement('div');
        errorElement.className = 'bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2';
        errorElement.textContent = message;
        domElements.errorContainer.appendChild(errorElement);
        setTimeout(() => errorElement.remove(), 5000);
    }
}

// Utility: Debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make the initialization function available globally
declare global {
    interface Window {
        initializeBackend: () => Promise<void>;
    }
}

// Export the initialization function
window.initializeBackend = initializeBackend;

// Log that the module has been loaded
console.log('Backend module loaded successfully');
