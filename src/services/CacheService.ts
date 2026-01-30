import { CacheStats } from '../types';

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

export class LRUCache<K, V> {
    private cache: Map<K, CacheEntry<V>>;
    private capacity: number;
    private ttl: number;
    private stats: CacheStats;
    private cleanupInterval: NodeJS.Timeout;

    constructor(capacity: number = 100, ttlSeconds: number = 60) {
        this.cache = new Map<K, CacheEntry<V>>();
        this.capacity = capacity;
        this.ttl = ttlSeconds * 1000;
        this.stats = {
            hits: 0,
            misses: 0,
            size: 0,
        };

        // Background task to clear stale entries
        this.cleanupInterval = setInterval(() => {
            this.clearStale();
        }, 5000); // Check every 5 seconds
    }

    public get(key: K): V | undefined {
        if (!this.cache.has(key)) {
            this.stats.misses++;
            return undefined;
        }

        const entry = this.cache.get(key)!;

        // Check expiry
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            this.stats.misses++;
            this.stats.size = this.cache.size;
            return undefined;
        }

        // Refresh LRU position by deleting and re-inserting
        this.cache.delete(key);
        this.cache.set(key, entry);

        this.stats.hits++;
        return entry.value;
    }

    public set(key: K, value: V): void {
        // If exists, delete to update position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            // Evict LRU (first item in Map)
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }

        const entry: CacheEntry<V> = {
            value,
            expiry: Date.now() + this.ttl
        };

        this.cache.set(key, entry);
        this.stats.size = this.cache.size;
    }

    public getStats(): CacheStats {
        return { ...this.stats, size: this.cache.size };
    }

    public clear(): void {
        this.cache.clear();
        this.stats.size = 0;
        this.stats.hits = 0;
        this.stats.misses = 0;
    }

    private clearStale(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
        this.stats.size = this.cache.size;
    }

    public destroy(): void {
        clearInterval(this.cleanupInterval);
    }
}
