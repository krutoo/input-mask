import { InputState, ReducerOptions } from '../core/reducer';
import { Range as CoreRange, IRange } from '../core/range';

export const on = (
  target: EventTarget,
  eventName: string,
  callback: EventListenerOrEventListenerObject,
  options?: EventListenerOptions
) => {
  target.addEventListener(eventName, callback, options);

  return () => {
    target.removeEventListener(eventName, callback, options);
  };
};

export const Range = {
  ...CoreRange,
  fromTarget: (target: HTMLInputElement) => Range.of(target.selectionStart || 0, target.selectionEnd || 0),
};

export const State = {
  of: (value: string, range: IRange = Range.of(value.length)) => ({ value, range }),

  init: ({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>) => {
    const firstPlace = mask.indexOf(placeholder);
    return State.of(mask.slice(0, firstPlace));
  },

  fromTarget: (target: HTMLInputElement) => State.of(target.value, Range.fromTarget(target)),

  apply: (state: InputState, target: HTMLInputElement) => {
    target.value = state.value;
    target.setSelectionRange(state.range.head, state.range.last);
  },
};

export const Value = {
  toMasked: ({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>, cleanValue: string) => {
    let result = '';

    for (let i = 0, j = 0; i < mask.length; i++) {
      if (mask[i] === placeholder && cleanValue[j]) {
        result += cleanValue[j];
        j++;
      } else if (mask[i] !== placeholder && j < cleanValue.length) {
        result += mask[i];
      }
    }

    return result;
  },

  toClean: ({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>, maskedValue: string) => {
    let result = '';

    for (let i = 0; i < maskedValue.length; i++) {
      if (mask[i] === placeholder) {
        result += maskedValue[i];
      }
    }

    return result;
  },
};
