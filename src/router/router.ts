import { RouterConfig, SynchInput } from '../types';

export class Router {
  private config: Required<RouterConfig>;

  constructor(config: RouterConfig = {}) {
    this.config = {
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Route incoming request
   * Returns normalized input for processing
   */
  route<T = any>(input: SynchInput<T>): SynchInput<T> {
    if (!this.config.enabled) {
      return input;
    }

    // Generate ID if not provided
    if (!input.id) {
      input.id = this.generateId(input.input);
    }

    // Initialize metadata if not provided
    if (!input.metadata) {
      input.metadata = {};
    }

    // Add routing metadata
    input.metadata.routedAt = Date.now();

    return input;
  }

  /**
   * Generate unique ID from input
   */
  private generateId(input: any): string {
    const hash = this.simpleHash(JSON.stringify(input));
    return `synch-${hash}-${Date.now()}`;
  }

  /**
   * Simple hash function for ID generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Validate input structure
   */
  validate<T = any>(input: SynchInput<T>): boolean {
    return input && typeof input === 'object' && 'input' in input;
  }
}
