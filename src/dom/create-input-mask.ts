import { createReducer, defineChanges, type InputState, RangeUtil } from '../core/mod.ts';
import type { InputMask, InputMaskOptions, InputMaskState } from './types.ts';
import { StateUtil, ValueUtil } from './utils.ts';

const reducerDefaults = {
  mask: '____',
  placeholder: '_',
  pattern: /\d/,
};

export function createInputMask(
  element: HTMLInputElement,
  {
    onInput,
    ...reducerOptions
  }: InputMaskOptions = {},
): InputMask {
  const config = { ...reducerDefaults, ...reducerOptions };
  const reducer = createReducer(config);
  const process = (a: InputState, b: InputState) => reducer(a, defineChanges(a, b));

  let state = StateUtil.init(config);
  let enabled = true;

  const getState = (): InputMaskState => {
    const completed = state.value.length === config.mask.length;

    return {
      value: state.value,
      cleanValue: ValueUtil.maskedToClean(config, state.value),
      completed,
      ready: completed,
    };
  };

  StateUtil.apply(state, element);

  const onDocumentSelectionChange = () => {
    if (element === document.activeElement) {
      state = StateUtil.fromTarget(element);
    }
  };

  const onElementInput = () => {
    state = process(state, StateUtil.fromTarget(element));
    StateUtil.apply(state, element);
    onInput?.(getState());
  };

  document.addEventListener('selectionchange', onDocumentSelectionChange);
  element.addEventListener('input', onElementInput);

  return {
    getState,

    setValue(cleanValue: string) {
      if (!enabled) return;

      // мы не знаем какое значение передано (clean или masked) поэтому берем из него только подходящие символы
      const validCleanValue = cleanValue
        .split('')
        .filter((c) => c.match(config.pattern))
        .join('');

      const newMaskedValue = ValueUtil.cleanToMasked(config, validCleanValue);
      const firstPlace = config.mask.indexOf(config.placeholder);

      state = process(
        StateUtil.of(state.value, RangeUtil.of(firstPlace, state.value.length)),
        StateUtil.of(newMaskedValue, RangeUtil.of(newMaskedValue.length)),
      );

      StateUtil.apply(state, element);
    },

    disable() {
      enabled = false;
      document.removeEventListener('selectionchange', onDocumentSelectionChange);
      element.removeEventListener('input', onElementInput);
    },
  };
}
