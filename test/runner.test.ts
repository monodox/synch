import { describe, it, expect, beforeEach } from 'vitest';
import { Runner } from '../src/runtime/runner';
import { Cache } from '../src/cache/cache';
import { State } from '../src/memory/state';

describe('Runner', () => {
  let runner: Runner;
  let cache: Cache;
  let state: State;

  beforeEach(() => {
    cache = new Cache();
    state = new State();
    runner = new Runner(cache, state);
  });

  describe('execute', () => {
    it('should execute a task and return output', async () => {
      const result = await runner.execute('hello', (input: string) => input.toUpperCase());
      expect(result.output).toBe('HELLO');
      expect(result.cached).toBe(false);
      expect(result.executionTime).toBeTypeOf('number');
      expect(result.timestamp).toBeTypeOf('number');
    });

    it('should return cached result on second call with same input', async () => {
      const task = (input: string) => input.toUpperCase();
      await runner.execute('hello', task);
      const result = await runner.execute('hello', task);
      expect(result.output).toBe('HELLO');
      expect(result.cached).toBe(true);
    });

    it('should handle async tasks', async () => {
      const task = async (n: number) => n * 2;
      const result = await runner.execute(5, task);
      expect(result.output).toBe(10);
    });

    it('should store state when id is provided', async () => {
      await runner.execute('data', (input: string) => input, 'task-1');
      expect(state.has('task-1')).toBe(true);
      const entry = state.get<{ input: string; output: string }>('task-1');
      expect(entry!.input).toBe('data');
      expect(entry!.output).toBe('data');
    });

    it('should not store state when id is not provided', async () => {
      await runner.execute('data', (input: string) => input);
      expect(state.size()).toBe(0);
    });
  });

  describe('concurrency', () => {
    it('should reject when concurrency limit is reached', async () => {
      runner = new Runner(cache, state, { maxConcurrency: 1 });

      const slow = () => new Promise((resolve) => setTimeout(resolve, 200));
      const first = runner.execute('a', slow);

      await expect(runner.execute('b', slow)).rejects.toThrow('Maximum concurrency limit');
      await first;
    });
  });

  describe('timeout', () => {
    it('should reject when task exceeds timeout', async () => {
      runner = new Runner(cache, state, { timeout: 50 });
      const slow = () => new Promise((resolve) => setTimeout(resolve, 200));

      await expect(runner.execute('input', slow)).rejects.toThrow('timeout');
    });
  });

  describe('getStats', () => {
    it('should track total executions', async () => {
      await runner.execute('a', (x: string) => x);
      await runner.execute('b', (x: string) => x);

      const stats = runner.getStats();
      expect(stats.totalExecutions).toBe(2);
      expect(stats.activeExecutions).toBe(0);
    });
  });
});
