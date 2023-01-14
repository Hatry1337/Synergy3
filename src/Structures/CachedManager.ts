import NodeCache from "node-cache";

export default abstract class CachedManager<T> {
    protected cacheStorage: NodeCache;
    protected constructor(nodeCacheOptions?: NodeCache.Options) {
        if(!nodeCacheOptions) {
            nodeCacheOptions = { stdTTL: 100, checkperiod: 120, useClones: false };
        }
        this.cacheStorage = new NodeCache(nodeCacheOptions);
    }

    /**
     * Get object from cache (fetches on cache miss)
     * @param key
     */
    public get(key: string): Promise<T | undefined>;

    /**
     * Get multiple objects from cache (NOT fetches on cache miss)
     * @param keys
     */
    public get(keys: string[]): Promise<Map<string, T>>;

    public async get(key: string | string[]) {
        if(typeof key === "string"){
            let val = this.cacheStorage.get<T>(key);
            if(!val){
                val = await this.fetchOne(key);
            }
            return val;
        }else if(Array.isArray(key)){
            let res: Map<string, T> = new Map();
            for(let e of Object.entries(this.cacheStorage.mget<T>(key))) {
                res.set(e[0], e[1]);
            }
            return res;
        }
    }

    /**
     * Get all cached items keys
     */
    public getCachedKeys() {
        return this.cacheStorage.keys();
    }

    /**
     * Get cache stats (misses, hits, etc.)
     */
    public getCacheStats() {
        return this.cacheStorage.stats;
    }

    /**
     * Fetch object directly from storage
     * @param key
     */
    public abstract fetchOne(key: string): Promise<T | undefined>;

    /**
     * Fetch multiple objects directly from storage
     * @param keys
     */
    public abstract fetchBulk(keys: string[]): Promise<Map<string, T>>;

    /**
     * Free all resources used by cache manager (and save data if implemented)
     */
    public async destroy(): Promise<void> {
        this.cacheStorage.flushAll();
        this.cacheStorage.close();
    }
}