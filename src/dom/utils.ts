import type { InputState, ReducerOptions } from '../core/mod.ts';
import { type Range, RangeUtil } from '../core/mod.ts';

export function rangeFromTarget(target: HTMLInputElement): Range {
  return RangeUtil.of(target.selectionStart || 0, target.selectionEnd || 0);
}

export abstract class StateUtil {
  static of(value: string, range: Range = RangeUtil.of(value.length)): InputState {
    return { value, range };
  }

  static init({ mask, placeholder }: Omit<ReducerOptions, 'pattern'>): InputState {
    const firstPlace = mask.indexOf(placeholder);

    return StateUtil.of(mask.slice(0, firstPlace));
  }

  static fromTarget(target: HTMLInputElement): InputState {
    return StateUtil.of(target.value, rangeFromTarget(target));
  }

  static apply(state: InputState, target: HTMLInputElement): void {
    target.value = state.value;
    StateUtil.applySelection(state, target);
  }

  static applyDiff(state: InputState, target: HTMLInputElement) {
    if (target.value !== state.value) {
      target.value = state.value;
      StateUtil.applySelection(state, target);
    } else if (
      target.selectionStart !== state.range.start ||
      target.selectionEnd !== state.range.end
    ) {
      StateUtil.applySelection(state, target);
    }
  }

  static applySelection(state: InputState, target: HTMLInputElement) {
    // в Safari поле получает фокус при вызове setSelectionRange - проверяем необходимость установки
    if (target === document.activeElement) {
      target.setSelectionRange(state.range.start, state.range.end);
    }
  }
}

export abstract class ValueUtil {
  static cleanToMasked(
    { mask, placeholder }: Omit<ReducerOptions, 'pattern'>,
    cleanValue: string,
  ): string {
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
  }

  static maskedToClean(
    { mask, placeholder }: Omit<ReducerOptions, 'pattern'>,
    maskedValue: string,
  ): string {
    let result = '';

    for (let i = 0; i < maskedValue.length; i++) {
      if (mask[i] === placeholder) {
        result += maskedValue[i];
      }
    }

    return result;
  }
}
