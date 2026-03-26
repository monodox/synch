import { StateEntry } from '../types';

export class State {
  private store: Map<string, StateEntry>;

  constructor() {
    this.store = new Map();
  }

  /**
   * Set state entry
   */
  set<T = any>(id: string, data: T): void {
    const existing = this.store.get(id);
    const now = Date.now();

    const entry: StateEntry<T> = {
      id,
      data,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.store.set(id, entry);
  }

  /**
   * Get state entry
   */
  get<T = any>(id: string): T | null {
    const entry = this.store.get(id);
    return entry ? (entry.data as T) : null;
  }

  /**
   * Check if state has entry
   */
  has(id: string): boolean {
    return this.store.has(id);
  }

  /**
   * Delete state entry
   */
  delete(id: string): boolean {
    return this.store.delete(id);
  }

  /**
   * Clear all state entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get all state keys
   */
  keys(): string[] {
    return Array.from(this.store.keys());
  }

  /**
   * Get state size
   */
  size(): number {
    return this.store.size;
  }

  /**
   * Get full state entry with metadata
   */
  getEntry(id: string): StateEntry | null {
    return this.store.get(id) ?? null;
  }

  /**
   * Get all entries
   */
  entries(): StateEntry[] {
    return Array.from(this.store.values());
  }
}
