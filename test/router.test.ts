import { describe, it, expect, beforeEach } from 'vitest';
import { Router } from '../src/router/router';

describe('Router', () => {
  let router: Router;

  beforeEach(() => {
    router = new Router();
  });

  describe('validate', () => {
    it('should accept valid input with input property', () => {
      expect(router.validate({ input: 'test' })).toBe(true);
    });

    it('should reject null', () => {
      expect(router.validate(null as any)).toBeFalsy();
    });

    it('should reject objects without input property', () => {
      expect(router.validate({} as any)).toBe(false);
    });

    it('should reject non-objects', () => {
      expect(router.validate('string' as any)).toBe(false);
    });
  });

  describe('route', () => {
    it('should generate an id when not provided', () => {
      const result = router.route({ input: 'test' });
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^synch-/);
    });

    it('should preserve existing id', () => {
      const result = router.route({ input: 'test', id: 'my-id' });
      expect(result.id).toBe('my-id');
    });

    it('should initialize metadata if not provided', () => {
      const result = router.route({ input: 'test' });
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.routedAt).toBeTypeOf('number');
    });

    it('should add routedAt to existing metadata', () => {
      const result = router.route({ input: 'test', metadata: { custom: true } });
      expect(result.metadata!.custom).toBe(true);
      expect(result.metadata!.routedAt).toBeTypeOf('number');
    });

    it('should pass through when disabled', () => {
      router = new Router({ enabled: false });
      const input = { input: 'test' };
      const result = router.route(input);
      expect(result.id).toBeUndefined();
      expect(result.metadata).toBeUndefined();
    });
  });
});
