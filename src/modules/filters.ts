import { PG, FilterCriteria } from '../types';
import { performanceMonitor } from './performance';
import { cacheManager } from './cache';

class FilterManager {
    private locationIndex: Map<string, Set<string>> = new Map();
    private priceIndex: Map<number, Set<string>> = new Map();
    private amenityIndex: Map<string, Set<string>> = new Map();
    private typeIndex: Map<string, Set<string>> = new Map();
    private searchIndex: Map<string, Set<string>> = new Map();
    private pgData: Map<string, PG> = new Map();

    async initialize(pgs: PG[]): Promise<void> {
        return await performanceMonitor.measure('filter-init', async () => {
            // Clear existing indexes
            this.clearIndexes();

            // Build indexes
            pgs.forEach(pg => {
                this.pgData.set(pg.id, pg);
                this.indexPG(pg);
            });

            // Cache the indexes
            await this.cacheIndexes();
        });
    }

    private indexPG(pg: PG): void {
        // Location index
        if (!this.locationIndex.has(pg.location)) {
            this.locationIndex.set(pg.location, new Set());
        }
        this.locationIndex.get(pg.location)!.add(pg.id);

        // Price index (rounded to nearest 1000)
        const priceKey = Math.floor(pg.price / 1000) * 1000;
        if (!this.priceIndex.has(priceKey)) {
            this.priceIndex.set(priceKey, new Set());
        }
        this.priceIndex.get(priceKey)!.add(pg.id);

        // Amenity index
        pg.amenities.forEach(amenity => {
            if (!this.amenityIndex.has(amenity)) {
                this.amenityIndex.set(amenity, new Set());
            }
            this.amenityIndex.get(amenity)!.add(pg.id);
        });

        // Type index
        if (!this.typeIndex.has(pg.type)) {
            this.typeIndex.set(pg.type, new Set());
        }
        this.typeIndex.get(pg.type)!.add(pg.id);

        // Search index
        const searchTerms = this.getSearchTerms(pg);
        searchTerms.forEach(term => {
            if (!this.searchIndex.has(term)) {
                this.searchIndex.set(term, new Set());
            }
            this.searchIndex.get(term)!.add(pg.id);
        });
    }

    private getSearchTerms(pg: PG): string[] {
        const terms = new Set<string>();
        const addTerm = (term: string) => {
            term.toLowerCase().split(/\s+/).forEach(t => {
                if (t.length > 2) terms.add(t);
            });
        };

        addTerm(pg.owner);
        addTerm(pg.location);
        addTerm(pg.type);
        addTerm(pg.description);
        pg.amenities.forEach(amenity => addTerm(amenity));

        return Array.from(terms);
    }

    async filter(criteria: FilterCriteria): Promise<PG[]> {
        return await performanceMonitor.measure('filter-search', async () => {
            let resultIds: Set<string> | null = null;

            // Location filter
            if (criteria.location && criteria.location !== 'all') {
                const locationIds = this.locationIndex.get(criteria.location);
                resultIds = locationIds ? new Set(locationIds) : new Set();
            }

            // Price filter
            if (criteria.minPrice !== undefined || criteria.maxPrice !== undefined) {
                const priceIds = this.getPriceRangeIds(
                    criteria.minPrice || 0,
                    criteria.maxPrice || Infinity
                );
                resultIds = this.intersectSets(resultIds, priceIds);
            }

            // Type filter
            if (criteria.type && criteria.type.length > 0) {
                const typeIds = this.getTypeIds(criteria.type);
                resultIds = this.intersectSets(resultIds, typeIds);
            }

            // Amenities filter
            if (criteria.amenities && criteria.amenities.length > 0) {
                const amenityIds = this.getAmenityIds(criteria.amenities);
                resultIds = this.intersectSets(resultIds, amenityIds);
            }

            // Search term filter
            if (criteria.searchTerm) {
                const searchIds = this.getSearchIds(criteria.searchTerm);
                resultIds = this.intersectSets(resultIds, searchIds);
            }

            // Convert result IDs to PG objects
            const results = Array.from(resultIds || this.pgData.keys())
                .map(id => this.pgData.get(id)!)
                .filter(pg => pg !== undefined);

            return results;
        });
    }

    private getPriceRangeIds(min: number, max: number): Set<string> {
        const result = new Set<string>();
        for (const [price, ids] of this.priceIndex) {
            if (price >= min && price <= max) {
                ids.forEach(id => result.add(id));
            }
        }
        return result;
    }

    private getTypeIds(types: string[]): Set<string> {
        const result = new Set<string>();
        types.forEach(type => {
            const ids = this.typeIndex.get(type);
            if (ids) {
                ids.forEach(id => result.add(id));
            }
        });
        return result;
    }

    private getAmenityIds(amenities: string[]): Set<string> {
        let result: Set<string> | null = null;
        amenities.forEach(amenity => {
            const ids = this.amenityIndex.get(amenity);
            if (ids) {
                result = result ? this.intersectSets(result, ids) : new Set(ids);
            }
        });
        return result || new Set();
    }

    private getSearchIds(searchTerm: string): Set<string> {
        const terms = searchTerm.toLowerCase().split(/\s+/);
        let result: Set<string> | null = null;

        terms.forEach(term => {
            if (term.length > 2) {
                const ids = this.searchIndex.get(term);
                if (ids) {
                    result = result ? this.unionSets(result, ids) : new Set(ids);
                }
            }
        });

        return result || new Set();
    }

    private intersectSets(a: Set<string> | null, b: Set<string> | null): Set<string> {
        if (!a) return b ? new Set(b) : new Set();
        if (!b) return new Set(a);

        return new Set([...a].filter(x => b.has(x)));
    }

    private unionSets(a: Set<string>, b: Set<string>): Set<string> {
        return new Set([...a, ...b]);
    }

    private clearIndexes(): void {
        this.locationIndex.clear();
        this.priceIndex.clear();
        this.amenityIndex.clear();
        this.typeIndex.clear();
        this.searchIndex.clear();
        this.pgData.clear();
    }

    private async cacheIndexes(): Promise<void> {
        await cacheManager.set('filter-indexes', {
            locationIndex: Array.from(this.locationIndex.entries()),
            priceIndex: Array.from(this.priceIndex.entries()),
            amenityIndex: Array.from(this.amenityIndex.entries()),
            typeIndex: Array.from(this.typeIndex.entries()),
            searchIndex: Array.from(this.searchIndex.entries()),
            pgData: Array.from(this.pgData.entries())
        });
    }

    async loadCachedIndexes(): Promise<boolean> {
        const cached = await cacheManager.get<any>('filter-indexes');
        if (cached) {
            this.locationIndex = new Map(cached.locationIndex);
            this.priceIndex = new Map(cached.priceIndex);
            this.amenityIndex = new Map(cached.amenityIndex);
            this.typeIndex = new Map(cached.typeIndex);
            this.searchIndex = new Map(cached.searchIndex);
            this.pgData = new Map(cached.pgData);
            return true;
        }
        return false;
    }
}

export const filterManager = new FilterManager(); 