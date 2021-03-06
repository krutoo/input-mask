import { defineChanges } from '../changes';
import { Range } from '../range';

describe('defineChanges()', () => {
  describe('insert cases', () => {
    it('insertion to empty field', () => {
      const prev = { value: '', range: Range.of(0) };
      const next = { value: 'text', range: Range.of(4, 4) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 0,
        insertIndices: [0, 1, 2, 3],
      });
    });

    it('insertion to end of non empty field', () => {
      const prev = { value: 'foo', range: Range.of(3) };
      const next = { value: 'foobar', range: Range.of(6, 6) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 3,
        insertIndices: [3, 4, 5],
      });
    });

    it('insertion to start of non empty field', () => {
      const prev = { value: 'foo', range: Range.of(0) };
      const next = { value: 'barfoo', range: Range.of(3, 3) };

      const result = defineChanges(prev, next);

      expect(result.type).toBe('INSERT');
      expect(result.payload).toEqual({
        ...next,
        insertPosition: 0,
        insertIndices: [0, 1, 2],
      });
    });

    it('insertion to middle of non empty field', () => {
      const prev = { value: 'foobaz', range: Range.of(3) };
      const next = { value: 'foobarbaz', range: Range.of(6, 6) };

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
      it('delete from end: soft', () => {
        const prev = { value: 'text', range: Range.of(4) };
        const next = { value: 'tex', range: Range.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3],
          deleteDirection: 'backward',
        });
      });

      it('delete from end: hard', () => {
        const prev = { value: 'text', range: Range.of(4) };
        const next = { value: '', range: Range.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0, 1, 2, 3],
          deleteDirection: 'backward',
        });
      });

      it('delete from middle: soft', () => {
        const prev = { value: 'abcdef', range: Range.of(4) };
        const next = { value: 'abcef', range: Range.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3],
          deleteDirection: 'backward',
        });
      });

      it('delete from middle: hard', () => {
        const prev = { value: 'abcdef', range: Range.of(4) };
        const next = { value: 'ef', range: Range.of(0) };

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
      it('delete from start: soft', () => {
        const prev = { value: 'abcdef', range: Range.of(0) };
        const next = { value: 'bcdef', range: Range.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0],
          deleteDirection: 'forward',
        });
      });

      it('delete from start: hard', () => {
        const prev = { value: 'abcdef', range: Range.of(0) };
        const next = { value: '', range: Range.of(0) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [0, 1, 2, 3, 4, 5],
          deleteDirection: 'forward',
        });
      });

      it('delete from middle: soft', () => {
        const prev = { value: 'abcdef', range: Range.of(3) };
        const next = { value: 'abcef', range: Range.of(3) };

        const result = defineChanges(prev, next);

        expect(result.type).toBe('DELETE');
        expect(result.payload).toEqual({
          ...next,
          deleteIndices: [3],
          deleteDirection: 'forward',
        });
      });

      it('delete from middle: hard', () => {
        const prev = { value: 'abcdef', range: Range.of(3) };
        const next = { value: 'abc', range: Range.of(3) };

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
