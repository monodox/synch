import { SynchConfig, Synch, SynchInput, SynchOutput, SynchStats, TaskFunction } from './types';
import { Cache } from './cache/cache';
import { State } from './memory/state';
import { Router } from './router/router';
import { Runner } from './runtime/runner';

/**
 * Create a new Synch instance
 */
export function createSynch(config: SynchConfig = {}): Synch {
  const cache = new Cache(config.cache);
  const state = new State();
  const router = new Router(config.router);
  const runner = new Runner(cache, state, config.runtime);

  return {
    /**
     * Run a task with the Synch execution pipeline
     */
    async run<I = any, O = any>(
      input: SynchInput<I>,
      task: TaskFunction<I, O>
    ): Promise<SynchOutput<O>> {
      // Validate input
      if (!router.validate(input)) {
        throw new Error('Invalid input structure');
      }

      // Route the input
      const routed = router.route(input);

      // Execute with runner
      return runner.execute(routed.input, task, routed.id);
    },

    /**
     * Clear all cached results
     */
    clearCache(): void {
      cache.clear();
    },

    /**
     * Get execution statistics
     */
    getStats(): SynchStats {
      const cacheStats = cache.getStats();
      const runnerStats = runner.getStats();

      return {
        cacheHits: cacheStats.hits,
        cacheMisses: cacheStats.misses,
        totalExecutions: runnerStats.totalExecutions,
        cacheSize: cacheStats.size,
      };
    },
  };
}
