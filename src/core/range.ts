export interface IRange {
  head: number
  last: number
}

/**
 * Работа с числовыми диапазонами.
 */
export const Range = {
  of: (head: number, last = head): IRange => ({ head, last }),

  clone: (range: IRange): IRange => ({ ...range }),

  size: (range: IRange) => Math.max(range.head, range.last) - Math.min(range.head, range.last),

  fromTarget: (target: HTMLInputElement) => Range.of(target.selectionStart || 0, target.selectionEnd || 0),

  spread: (range: IRange): number[] => {
    const result = [];

    if (range.head !== range.last) {
      for (let i = range.head; i < range.last; i++) {
        result.push(i);
      }
    }

    return result;
  },

  spreadOf: (head: number, last: number) => Range.spread(Range.of(head, last)),
};
