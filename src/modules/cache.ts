import { performanceMonitor } from './performance';

interface CacheItem<T> {
    value: T;
    timestamp: number;
    expiry: number;
    size: number;
}

interface CacheConfig {
    maxSize: number;
    defaultTTL: number;
}

class CacheManager {
    private cache: Map<string, CacheItem<any>> = new Map();
    private config: CacheConfig;
    private totalSize: number = 0;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            maxSize: config.maxSize || 50 * 1024 * 1024, // 50MB default
            defaultTTL: config.defaultTTL || 24 * 60 * 60 * 1000 // 24 hours default
        };
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
        return await performanceMonitor.measure('cache-set', async () => {
            try {
                const item: CacheItem<T> = {
                    value,
                    timestamp: Date.now(),
                    expiry: Date.now() + (ttl || this.config.defaultTTL),
                    size: this.calculateSize(value)
                };

                // Check if we need to make space
                if (this.totalSize + item.size > this.config.maxSize) {
                    await this.evictItems(item.size);
                }

                // Remove old item if it exists
                if (this.cache.has(key)) {
                    this.totalSize -= this.cache.get(key)!.size;
                }

                // Add new item
                this.cache.set(key, item);
                this.totalSize += item.size;

                return true;
            } catch (error) {
                console.error('Cache set error:', error);
                return false;
            }
        });
    }

    async get<T>(key: string): Promise<T | null> {
        return await performanceMonitor.measure('cache-get', async () => {
            try {
                const item = this.cache.get(key) as CacheItem<T>;
                
                if (!item) {
                    return null;
                }

                // Check if expired
                if (Date.now() > item.expiry) {
                    this.delete(key);
                    return null;
                }

                // Update access timestamp
                item.timestamp = Date.now();
                return item.value;
            } catch (error) {
                console.error('Cache get error:', error);
                return null;
            }
        });
    }

    async delete(key: string): Promise<boolean> {
        return await performanceMonitor.measure('cache-delete', async () => {
            try {
                if (this.cache.has(key)) {
                    this.totalSize -= this.cache.get(key)!.size;
                    this.cache.delete(key);
                }
                return true;
            } catch (error) {
                console.error('Cache delete error:', error);
                return false;
            }
        });
    }

    async clear(): Promise<void> {
        return await performanceMonitor.measure('cache-clear', async () => {
            this.cache.clear();
            this.totalSize = 0;
        });
    }

    private calculateSize(value: any): number {
        try {
            const str = JSON.stringify(value);
            return new TextEncoder().encode(str).length;
        } catch {
            return 0;
        }
    }

    private async evictItems(requiredSize: number): Promise<void> {
        return await performanceMonitor.measure('cache-evict', async () => {
            // Convert cache to array and sort by timestamp (oldest first)
            const items = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp);

            for (const [key] of items) {
                if (this.totalSize + requiredSize <= this.config.maxSize) {
                    break;
                }
                await this.delete(key);
            }
        });
    }

    getStats(): Record<string, any> {
        return {
            itemCount: this.cache.size,
            totalSize: this.totalSize,
            maxSize: this.config.maxSize,
            usagePercentage: (this.totalSize / this.config.maxSize) * 100
        };
    }
}

export const cacheManager = new CacheManager(); 