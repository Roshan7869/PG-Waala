export interface PG {
    id: string;
    owner: string;
    location: string;
    price: number;
    nearbyCoaching: string;
    waterFacility: string;
    wifi: boolean;
    independent: boolean;
    rules: string;
}

export type WaterFacility = '24/7 Available' | 'Limited Hours';
export type FilterOptions = {
    maxPrice?: number;
    hasWifi?: boolean;
    isIndependent?: boolean;
    waterFacility?: WaterFacility;
    location?: string;
    nearbyCoaching?: string;
}; 