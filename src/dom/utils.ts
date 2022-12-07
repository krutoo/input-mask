import { InputState, ReducerOptions } from '../core/reducer';
import { Range as CoreRange, IRange } from '../core/range';

export function on<E extends Event, T extends EventTarget>(
  target: T,
  eventName: string,
  callback: (event: E & { currentTarget: T }) => void,
  options?: EventListenerOptions
) {
  target.addEventListener(eventName, callback as any, options);

  return () => {
    target.removeEventListener(eventName, callback as any, options);
  };
}

export const Range = {
  ...CoreRange,

  fromTarget(target: HTMLInputElement) {
    return Range.of(target.selectionStart || 0, target.selectionEnd || 0);
  },
};

export const State = {
  of(value: string, range: IRange = Range.of(value.length)): InputState {
    return { value, range };
  },

  init({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>): InputState {
    const firstPlace = mask.indexOf(placeholder);

    return State.of(mask.slice(0, firstPlace));
  },

  fromTarget(target: HTMLInputElement): InputState {
    return State.of(target.value, Range.fromTarget(target));
  },

  apply(state: InputState, target: HTMLInputElement): void {
    target.value = state.value;

    // в Safari поле получает фокус при вызове setSelectionRange - проверяем необходимость установки
    if (target === document.activeElement) {
      target.setSelectionRange(state.range.start, state.range.end);
    }
  },
} as const;

export const Value = {
  toMasked({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>, cleanValue: string) {
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

  toClean({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>, maskedValue: string) {
    let result = '';

    for (let i = 0; i < maskedValue.length; i++) {
      if (mask[i] === placeholder) {
        result += maskedValue[i];
      }
    }

    return result;
  },
} as const;
