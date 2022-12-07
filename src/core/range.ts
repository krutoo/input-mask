export interface IRange {
  start: number;
  end: number;

  /** @deprecated Use "start" instead. */
  head: number;

  /** @deprecated Use "end" instead. */
  last: number;
}

/**
 * Работа с числовыми диапазонами.
 */
export const Range = {
  of: (start: number, end = start): IRange => ({ start, end, head: start, last: end }),

  clone: (r: IRange): IRange => ({ ...r }),

  map: (r: IRange, cb: (n: number) => number): IRange => Range.of(cb(r.start), cb(r.end)),

  equals: (a: IRange, b: IRange): boolean => a.start === b.start && a.end === b.end,

  size: (r: IRange) => Math.max(r.start, r.end) - Math.min(r.start, r.end),

  spread: (r: IRange): number[] => {
    const result = [];

    if (r.start !== r.end) {
      for (let i = r.start; i < r.end; i++) {
        result.push(i);
      }
    }

    return result;
  },

  spreadOf: (start: number, end: number) => Range.spread(Range.of(start, end)),
};
