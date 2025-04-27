/// <reference lib="dom" />

/* global HTMLSelectElement */

export interface PG {
    id: string;
    name: string;
    owner: string;
    location: string;
    price: number;
    type: 'boys' | 'girls' | 'co-ed';
    description: string;
    amenities: string[];
    image?: string;
    rating: number;
    reviews: number;
    nearby?: string;
    rules?: string;
}

export interface FilterCriteria {
    location?: string;
    priceRange?: {
        min: number;
        max: number;
    };
    type?: string[];
    amenities?: string[];
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
}

export interface DOMElements {
    locationSelect: HTMLSelectElement | null;
    priceRange: HTMLInputElement | null;
    priceDisplay: HTMLElement | null;
    listingsContainer: HTMLElement | null;
    loadingSkeleton: HTMLElement | null;
    darkModeToggle: HTMLButtonElement | null;
    mobileMenuButton: HTMLButtonElement | null;
    mobileMenu: HTMLElement | null;
    prevPage: HTMLButtonElement | null;
    nextPage: HTMLButtonElement | null;
}

export interface Config {
    defaultPriceRange: {
        min: number;
        max: number;
    };
    debounceDelay: number;
    retryAttempts: number;
    retryDelay: number;
    amenityIcons: Record<string, string>;
    cacheDuration: number;
    maxCacheSize: number;
} 