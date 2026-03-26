import { CacheConfig, CacheEntry } from '../types';

export class Cache {
  private store: Map<string, CacheEntry>;
  private config: Required<CacheConfig>;
  private hits: number = 0;
  private misses: number = 0;

  constructor(config: CacheConfig = {}) {
    this.store = new Map();
    this.config = {
      enabled: config.enabled ?? true,
      maxSize: config.maxSize ?? 1000,
      ttl: config.ttl ?? 3600000, // 1 hour default
    };
  }

  /**
   * Generate a cache key from input
   */
  private generateKey(input: any): string {
    return JSON.stringify(input);
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    if (this.config.ttl === 0) return false; // Never expire
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  /**
   * Evict oldest entries if cache exceeds max size
   */
  private evictIfNeeded(): void {
    if (this.store.size >= this.config.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }
  }

  /**
   * Get value from cache
   */
  get<T = any>(input: any): T | null {
    if (!this.config.enabled) {
      this.misses++;
      return null;
    }

    const key = this.generateKey(input);
    const entry = this.store.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    if (this.isExpired(entry)) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    entry.hits++;
    this.hits++;
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T = any>(input: any, value: T): void {
    if (!this.config.enabled) return;

    this.evictIfNeeded();

    const key = this.generateKey(input);
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      hits: 0,
    };

    this.store.set(key, entry);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.store.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0
        ? this.hits / (this.hits + this.misses)
        : 0,
    };
  }

  /**
   * Check if cache has entry
   */
  has(input: any): boolean {
    const key = this.generateKey(input);
    const entry = this.store.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.store.size;
  }
}
