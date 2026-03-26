import { RuntimeConfig, TaskFunction, SynchOutput } from '../types';
import { Cache } from '../cache/cache';
import { State } from '../memory/state';

export class Runner {
  private config: Required<RuntimeConfig>;
  private cache: Cache;
  private state: State;
  private activeExecutions: number = 0;
  private totalExecutions: number = 0;

  constructor(cache: Cache, state: State, config: RuntimeConfig = {}) {
    this.cache = cache;
    this.state = state;
    this.config = {
      maxConcurrency: config.maxConcurrency ?? 10,
      timeout: config.timeout ?? 30000,
    };
  }

  /**
   * Execute task with caching and state management
   */
  async execute<I = any, O = any>(
    input: I,
    task: TaskFunction<I, O>,
    id?: string
  ): Promise<SynchOutput<O>> {
    const startTime = Date.now();

    // Check cache first
    const cached = this.cache.get<O>(input);
    if (cached !== null) {
      return {
        output: cached,
        cached: true,
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    }

    // Check concurrency limit
    if (this.activeExecutions >= this.config.maxConcurrency) {
      throw new Error(`Maximum concurrency limit (${this.config.maxConcurrency}) reached`);
    }

    this.activeExecutions++;
    this.totalExecutions++;

    try {
      // Execute task with timeout
      const output = await this.executeWithTimeout(task, input);

      // Store in cache
      this.cache.set(input, output);

      // Update state if ID provided
      if (id) {
        this.state.set(id, {
          input,
          output,
          timestamp: Date.now(),
        });
      }

      return {
        output,
        cached: false,
        executionTime: Date.now() - startTime,
        timestamp: Date.now(),
      };
    } finally {
      this.activeExecutions--;
    }
  }

  /**
   * Execute task with timeout
   */
  private async executeWithTimeout<I, O>(
    task: TaskFunction<I, O>,
    input: I
  ): Promise<O> {
    return new Promise<O>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Task execution timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      Promise.resolve(task(input))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Get runner statistics
   */
  getStats() {
    return {
      activeExecutions: this.activeExecutions,
      totalExecutions: this.totalExecutions,
      maxConcurrency: this.config.maxConcurrency,
    };
  }

  /**
   * Wait for all active executions to complete
   */
  async waitForCompletion(): Promise<void> {
    while (this.activeExecutions > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
