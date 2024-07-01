import type { Range } from './types.ts';

/**
 * Работа с числовыми диапазонами.
 */
export abstract class RangeUtil {
  static of(start: number, end = start): Range {
    return { start, end };
  }

  static clone(range: Range): Range {
    return { ...range };
  }

  static map(range: Range, callback: (n: number) => number): Range {
    return RangeUtil.of(callback(range.start), callback(range.end));
  }

  static equals(a: Range, b: Range): boolean {
    return a.start === b.start && a.end === b.end;
  }

  static size(range: Range): number {
    return Math.max(range.start, range.end) - Math.min(range.start, range.end);
  }

  static spread(range: Range): number[] {
    const result = [];

    if (range.start !== range.end) {
      for (let i = range.start; i < range.end; i++) {
        result.push(i);
      }
    }

    return result;
  }

  static spreadOf(start: number, end: number): number[] {
    return RangeUtil.spread(RangeUtil.of(start, end));
  }
}
