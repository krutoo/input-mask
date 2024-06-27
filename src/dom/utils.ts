import type { InputState, ReducerOptions } from '../core/reducer.ts';
import { type IRange, Range as CoreRange } from '../core/range.ts';

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
    State.applySelection(state, target);
  },

  applyDiff(state: InputState, target: HTMLInputElement) {
    if (target.value !== state.value) {
      target.value = state.value;
      State.applySelection(state, target);
    } else if (
      target.selectionStart !== state.range.start ||
      target.selectionEnd !== state.range.end
    ) {
      State.applySelection(state, target);
    }
  },

  applySelection(state: InputState, target: HTMLInputElement) {
    // в Safari поле получает фокус при вызове setSelectionRange - проверяем необходимость установки
    if (target === document.activeElement) {
      target.setSelectionRange(state.range.start, state.range.end);
    }
  },
} as const;

export const Value = {
  cleanToMasked(
    { mask, placeholder }: Omit<ReducerOptions, 'pattern'>,
    cleanValue: string,
  ) {
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

  maskedToClean(
    { mask, placeholder }: Omit<ReducerOptions, 'pattern'>,
    maskedValue: string,
  ) {
    let result = '';

    for (let i = 0; i < maskedValue.length; i++) {
      if (mask[i] === placeholder) {
        result += maskedValue[i];
      }
    }

    return result;
  },

  /**
   * @deprecated Use "cleanToMasked" instead.
   */
  toMasked(maskOptions: Omit<ReducerOptions, 'pattern'>, maskedValue: string) {
    return Value.cleanToMasked(maskOptions, maskedValue);
  },

  /**
   * @deprecated Use "maskedToClean" instead.
   */
  toClean(maskOptions: Omit<ReducerOptions, 'pattern'>, maskedValue: string) {
    return Value.maskedToClean(maskOptions, maskedValue);
  },
} as const;
