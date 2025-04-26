export interface PG {
    id: string;
    owner: string;
    location: string;
    price: number;
    type: string;
    description: string;
    amenities: string[];
    image?: string;
    rating: number;
    reviews: number;
}

export interface FilterCriteria {
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    type?: string[];
    amenities?: string[];
}

export interface DOMElements {
    locationSelect: HTMLSelectElement | null;
    priceRangeMin: HTMLInputElement | null;
    priceRangeMax: HTMLInputElement | null;
    priceDisplay: HTMLElement | null;
    listingsContainer: HTMLElement | null;
    heading: HTMLElement | null;
    amenityChips: NodeListOf<HTMLElement> | null;
    pgTypeCheckboxes: NodeListOf<HTMLInputElement> | null;
    searchInput: HTMLInputElement | null;
    loadingIndicator: HTMLElement | null;
    resetFiltersBtn: HTMLElement | null;
    errorContainer: HTMLElement | null;
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