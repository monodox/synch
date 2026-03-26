import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Cache } from '../src/cache/cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    cache = new Cache();
  });

  describe('get/set', () => {
    it('should store and retrieve a value', () => {
      cache.set('hello', 'world');
      expect(cache.get('hello')).toBe('world');
    });

    it('should return null for missing keys', () => {
      expect(cache.get('missing')).toBeNull();
    });

    it('should handle object inputs as keys', () => {
      cache.set({ a: 1, b: 2 }, 'result');
      expect(cache.get({ a: 1, b: 2 })).toBe('result');
    });

    it('should overwrite existing entries', () => {
      cache.set('key', 'first');
      cache.set('key', 'second');
      expect(cache.get('key')).toBe('second');
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', () => {
      cache = new Cache({ ttl: 100 });
      cache.set('key', 'value');

      vi.useFakeTimers();
      vi.advanceTimersByTime(150);

      expect(cache.get('key')).toBeNull();
      vi.useRealTimers();
    });

    it('should not expire when ttl is 0', () => {
      cache = new Cache({ ttl: 0 });
      cache.set('key', 'value');

      vi.useFakeTimers();
      vi.advanceTimersByTime(999999);

      expect(cache.get('key')).toBe('value');
      vi.useRealTimers();
    });
  });

  describe('maxSize eviction', () => {
    it('should evict oldest entry when maxSize is reached', () => {
      cache = new Cache({ maxSize: 2 });
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      expect(cache.get('a')).toBeNull();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });
  });

  describe('disabled cache', () => {
    it('should always return null when disabled', () => {
      cache = new Cache({ enabled: false });
      cache.set('key', 'value');
      expect(cache.get('key')).toBeNull();
    });
  });

  describe('stats', () => {
    it('should track hits and misses', () => {
      cache.set('key', 'value');
      cache.get('key');   // hit
      cache.get('key');   // hit
      cache.get('nope');  // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3);
    });

    it('should reset stats on clear', () => {
      cache.set('key', 'value');
      cache.get('key');
      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.size).toBe(0);
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired entries', () => {
      cache.set('key', 'value');
      expect(cache.has('key')).toBe(true);
    });

    it('should return false for missing entries', () => {
      expect(cache.has('nope')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return the number of entries', () => {
      expect(cache.size()).toBe(0);
      cache.set('a', 1);
      cache.set('b', 2);
      expect(cache.size()).toBe(2);
    });
  });
});
