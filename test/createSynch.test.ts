import { describe, it, expect } from 'vitest';
import { createSynch } from '../src/createSynch';

describe('createSynch', () => {
  it('should create a synch instance with default config', () => {
    const synch = createSynch();
    expect(synch.run).toBeTypeOf('function');
    expect(synch.clearCache).toBeTypeOf('function');
    expect(synch.getStats).toBeTypeOf('function');
  });

  describe('run', () => {
    it('should execute a task and return result', async () => {
      const synch = createSynch();
      const result = await synch.run(
        { input: 'hello' },
        (text: string) => text.toUpperCase()
      );
      expect(result.output).toBe('HELLO');
      expect(result.cached).toBe(false);
    });

    it('should return cached result on duplicate input', async () => {
      const synch = createSynch();
      const task = (text: string) => text.toUpperCase();

      await synch.run({ input: 'hello' }, task);
      const result = await synch.run({ input: 'hello' }, task);

      expect(result.output).toBe('HELLO');
      expect(result.cached).toBe(true);
    });

    it('should reject invalid input', async () => {
      const synch = createSynch();
      await expect(
        synch.run({} as any, () => 'nope')
      ).rejects.toThrow('Invalid input structure');
    });
  });

  describe('clearCache', () => {
    it('should clear cached results', async () => {
      const synch = createSynch();
      const task = (x: string) => x;

      await synch.run({ input: 'test' }, task);
      synch.clearCache();

      const result = await synch.run({ input: 'test' }, task);
      expect(result.cached).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return execution statistics', async () => {
      const synch = createSynch();
      const task = (x: string) => x;

      await synch.run({ input: 'a' }, task);
      await synch.run({ input: 'a' }, task); // cache hit
      await synch.run({ input: 'b' }, task);

      const stats = synch.getStats();
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(2);
      expect(stats.totalExecutions).toBe(2);
      expect(stats.cacheSize).toBe(2);
    });
  });
});
