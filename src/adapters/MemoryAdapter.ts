import { IStorageAdapter } from '../interfaces/IStorageAdapter';

interface CacheItem<T> {
    value: T;
    expiresAt: number | null;
}

/**
 * Built-in memory storage adapter.
 * Useful for development or single-instance bots.
 */
export class MemoryAdapter implements IStorageAdapter {
    private cache: Map<string, CacheItem<any>>;
    private cleanupInterval!: NodeJS.Timeout;

    constructor() {
        this.cache = new Map();
        this.startCleanup();
    }

    private startCleanup(): void {
        // Clean expired items every 60 seconds
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (item.expiresAt !== null && item.expiresAt <= now) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
        this.cleanupInterval.unref();
    }

    private getFullKey(namespace: string, key: string): string {
        return `${namespace}:${key}`;
    }

    public async get<T>(namespace: string, key: string): Promise<T | null> {
        const fullKey = this.getFullKey(namespace, key);
        const item = this.cache.get(fullKey);

        if (!item) return null;

        if (item.expiresAt !== null && item.expiresAt <= Date.now()) {
            this.cache.delete(fullKey);
            return null;
        }

        return item.value as T;
    }

    public async set<T>(namespace: string, key: string, value: T, ttlSeconds?: number): Promise<void> {
        const fullKey = this.getFullKey(namespace, key);
        const expiresAt = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : null;

        this.cache.set(fullKey, { value, expiresAt });
    }

    public async delete(namespace: string, key: string): Promise<boolean> {
        const fullKey = this.getFullKey(namespace, key);
        return this.cache.delete(fullKey);
    }

    public async clear(namespace: string): Promise<void> {
        const prefix = `${namespace}:`;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }

    public async getKeys(namespace: string): Promise<string[]> {
        const prefix = `${namespace}:`;
        const keys: string[] = [];
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                // Return only the specific key part
                keys.push(key.substring(prefix.length));
            }
        }
        return keys;
    }

    public async getAll<T>(namespace: string): Promise<T[]> {
        const prefix = `${namespace}:`;
        const values: T[] = [];
        const now = Date.now();

        for (const [key, item] of this.cache.entries()) {
            if (key.startsWith(prefix)) {
                if (item.expiresAt === null || item.expiresAt > now) {
                    values.push(item.value as T);
                } else {
                    this.cache.delete(key);
                }
            }
        }
        return values;
    }

    public async disconnect(): Promise<void> {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.cache.clear();
    }
}
