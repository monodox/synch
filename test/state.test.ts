import { describe, it, expect, beforeEach } from 'vitest';
import { State } from '../src/memory/state';

describe('State', () => {
  let state: State;

  beforeEach(() => {
    state = new State();
  });

  describe('get/set', () => {
    it('should store and retrieve data', () => {
      state.set('id1', { foo: 'bar' });
      expect(state.get('id1')).toEqual({ foo: 'bar' });
    });

    it('should return null for missing keys', () => {
      expect(state.get('missing')).toBeNull();
    });

    it('should overwrite existing entries', () => {
      state.set('id1', 'first');
      state.set('id1', 'second');
      expect(state.get('id1')).toBe('second');
    });
  });

  describe('has', () => {
    it('should return true for existing entries', () => {
      state.set('id1', 'data');
      expect(state.has('id1')).toBe(true);
    });

    it('should return false for missing entries', () => {
      expect(state.has('nope')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove an entry', () => {
      state.set('id1', 'data');
      expect(state.delete('id1')).toBe(true);
      expect(state.get('id1')).toBeNull();
    });

    it('should return false when deleting non-existent entry', () => {
      expect(state.delete('nope')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      state.set('a', 1);
      state.set('b', 2);
      state.clear();
      expect(state.size()).toBe(0);
    });
  });

  describe('keys', () => {
    it('should return all stored keys', () => {
      state.set('a', 1);
      state.set('b', 2);
      expect(state.keys()).toEqual(['a', 'b']);
    });
  });

  describe('getEntry', () => {
    it('should return full entry with metadata', () => {
      state.set('id1', 'data');
      const entry = state.getEntry('id1');
      expect(entry).not.toBeNull();
      expect(entry!.id).toBe('id1');
      expect(entry!.data).toBe('data');
      expect(entry!.createdAt).toBeTypeOf('number');
      expect(entry!.updatedAt).toBeTypeOf('number');
    });

    it('should preserve createdAt on update', () => {
      state.set('id1', 'first');
      const first = state.getEntry('id1')!;
      state.set('id1', 'second');
      const second = state.getEntry('id1')!;

      expect(second.createdAt).toBe(first.createdAt);
      expect(second.updatedAt).toBeGreaterThanOrEqual(first.updatedAt);
    });

    it('should return null for missing entry', () => {
      expect(state.getEntry('nope')).toBeNull();
    });
  });

  describe('entries', () => {
    it('should return all entries', () => {
      state.set('a', 1);
      state.set('b', 2);
      const entries = state.entries();
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe('a');
      expect(entries[1].id).toBe('b');
    });
  });
});
