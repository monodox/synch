// Core configuration for Synch instance
export interface SynchConfig {
  cache?: CacheConfig;
  router?: RouterConfig;
  runtime?: RuntimeConfig;
}

// Cache configuration
export interface CacheConfig {
  enabled?: boolean;
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
}

// Router configuration
export interface RouterConfig {
  enabled?: boolean;
}

// Runtime configuration
export interface RuntimeConfig {
  maxConcurrency?: number;
  timeout?: number; // Timeout in milliseconds
}

// Input for task execution
export interface SynchInput<T = any> {
  input: T;
  id?: string;
  metadata?: Record<string, any>;
}

// Output from task execution
export interface SynchOutput<T = any> {
  output: T;
  cached: boolean;
  executionTime: number;
  timestamp: number;
}

// Cache entry structure
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  hits: number;
}

// State entry structure
export interface StateEntry<T = any> {
  id: string;
  data: T;
  createdAt: number;
  updatedAt: number;
}

// Task function signature
export type TaskFunction<I = any, O = any> = (input: I) => Promise<O> | O;

// Synch instance interface
export interface Synch {
  run<I = any, O = any>(input: SynchInput<I>, task: TaskFunction<I, O>): Promise<SynchOutput<O>>;
  clearCache(): void;
  getStats(): SynchStats;
}

// Statistics interface
export interface SynchStats {
  cacheHits: number;
  cacheMisses: number;
  totalExecutions: number;
  cacheSize: number;
}
