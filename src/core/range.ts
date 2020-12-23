export interface IRange {
  head: number
  last: number
}

/**
 * Работа с числовыми диапазонами.
 */
export const Range = {
  of: (head: number, last = head): IRange => ({ head, last }),

  clone: (r: IRange): IRange => ({ ...r }),

  map: (r: IRange, cb: (n: number) => number): IRange => Range.of(cb(r.head),cb(r.last)),

  equals: (a: IRange, b: IRange): boolean => a.head === b.head && a.last === b.last,

  size: (r: IRange) => Math.max(r.head, r.last) - Math.min(r.head, r.last),

  fromTarget: (target: HTMLInputElement) => Range.of(target.selectionStart || 0, target.selectionEnd || 0),

  spread: (r: IRange): number[] => {
    const result = [];

    if (r.head !== r.last) {
      for (let i = r.head; i < r.last; i++) {
        result.push(i);
      }
    }

    return result;
  },

  spreadOf: (head: number, last: number) => Range.spread(Range.of(head, last)),
};
