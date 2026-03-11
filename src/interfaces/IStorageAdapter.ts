export interface IStorageAdapter {
    /**
     * Initialize the storage adapter (e.g. connect to DB)
     */
    connect?(): Promise<void>;

    /**
     * Close the adapter connection
     */
    disconnect?(): Promise<void>;

    /**
     * Get a value by key
     * @param namespace The namespace (e.g. "cooldowns", "ratelimits")
     * @param key The specific key
     */
    get<T>(namespace: string, key: string): Promise<T | null>;

    /**
     * Set a value
     * @param namespace The namespace
     * @param key The specific key
     * @param value The value to store
     * @param ttlSeconds Optional time-to-live in seconds
     */
    set<T>(namespace: string, key: string, value: T, ttlSeconds?: number): Promise<void>;

    /**
     * Delete a value
     * @param namespace The namespace
     * @param key The specific key
     * @returns true if deleted, false if not found
     */
    delete(namespace: string, key: string): Promise<boolean>;

    /**
     * Clear all values in a namespace
     * @param namespace The namespace to clear
     */
    clear(namespace: string): Promise<void>;

    /**
     * Get all keys in a namespace (optional, for stats)
     */
    getKeys?(namespace: string): Promise<string[]>;

    /**
     * Get all values in a namespace (optional, for stats)
     */
    getAll?<T>(namespace: string): Promise<T[]>;
}
