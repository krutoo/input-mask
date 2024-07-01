import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import { defineChanges } from '../changes.ts';
import { RangeUtil } from '../range.ts';

describe('defineChanges()', () => {
  describe('insert cases', () => {
    test('insertion to empty field', () => {
      const prev = { value: '', range: RangeUtil.of(0) };
      const next = { value: 'text', range: RangeUtil.of(4, 4) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 0,
        insertIndices: [0, 1, 2, 3],
      });
    });

    test('insertion to end of non empty field', () => {
      const prev = { value: 'foo', range: RangeUtil.of(3) };
      const next = { value: 'foobar', range: RangeUtil.of(6, 6) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 3,
        insertIndices: [3, 4, 5],
      });
    });

    test('insertion to start of non empty field', () => {
      const prev = { value: 'foo', range: RangeUtil.of(0) };
      const next = { value: 'barfoo', range: RangeUtil.of(3, 3) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 0,
        insertIndices: [0, 1, 2],
      });
    });

    test('insertion to middle of non empty field', () => {
      const prev = { value: 'foobaz', range: RangeUtil.of(3) };
      const next = { value: 'foobarbaz', range: RangeUtil.of(6, 6) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 3,
        insertIndices: [3, 4, 5],
      });
    });
  });

  describe('delete cases', () => {
    describe('delete backward cases', () => {
      test('delete from end: soft', () => {
        const prev = { value: 'text', range: RangeUtil.of(4) };
        const next = { value: 'tex', range: RangeUtil.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3],
          deleteDirection: 'backward',
        });
      });

      test('delete from end: hard', () => {
        const prev = { value: 'text', range: RangeUtil.of(4) };
        const next = { value: '', range: RangeUtil.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0, 1, 2, 3],
          deleteDirection: 'backward',
        });
      });

      test('delete from middle: soft', () => {
        const prev = { value: 'abcdef', range: RangeUtil.of(4) };
        const next = { value: 'abcef', range: RangeUtil.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3],
          deleteDirection: 'backward',
        });
      });

      test('delete from middle: hard', () => {
        const prev = { value: 'abcdef', range: RangeUtil.of(4) };
        const next = { value: 'ef', range: RangeUtil.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0, 1, 2, 3],
          deleteDirection: 'backward',
        });
      });
    });

    describe('delete forward cases', () => {
      test('delete from start: soft', () => {
        const prev = { value: 'abcdef', range: RangeUtil.of(0) };
        const next = { value: 'bcdef', range: RangeUtil.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0],
          deleteDirection: 'forward',
        });
      });

      test('delete from start: hard', () => {
        const prev = { value: 'abcdef', range: RangeUtil.of(0) };
        const next = { value: '', range: RangeUtil.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0, 1, 2, 3, 4, 5],
          deleteDirection: 'forward',
        });
      });

      test('delete from middle: soft', () => {
        const prev = { value: 'abcdef', range: RangeUtil.of(3) };
        const next = { value: 'abcef', range: RangeUtil.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3],
          deleteDirection: 'forward',
        });
      });

      test('delete from middle: hard', () => {
        const prev = { value: 'abcdef', range: RangeUtil.of(3) };
        const next = { value: 'abc', range: RangeUtil.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3, 4, 5],
          deleteDirection: 'forward',
        });
      });
    });
  });
});
