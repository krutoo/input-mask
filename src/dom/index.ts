import { createReducer, defineChanges, InputState, ReducerOptions } from '../core';
import { on, State, Value, Range } from './utils';

interface Data {
  value: string;
  cleanValue: string;
  completed: boolean;

  /** @deprecated Use "completed" instead. */
  ready: boolean;
}

interface Options extends Partial<ReducerOptions> {
  onInput?: (data: Data) => void;

  /** @deprecated Use "onInput" option or "result.getData" instead. */
  onChange?: (data: Data) => void;
}

const reducerDefaults = {
  mask: '____',
  placeholder: '_',
  pattern: /\d/,
};

export interface InputMaskControl {
  getData(): Data;
  setValue(value: string): void;
  disable(): void;
}

export function InputMask(
  element: HTMLInputElement,
  { onChange, onInput, ...reducerOptions }: Options = {}
): InputMaskControl {
  const options = { ...reducerDefaults, ...reducerOptions };
  const reducer = createReducer(options);
  const process = (a: InputState, b: InputState) => reducer(a, defineChanges(a, b));

  let state = State.init(options);
  let enabled = true;

  const getData = (): Data => {
    const completed = state.value.length === options.mask.length;

    return {
      value: state.value,
      cleanValue: Value.maskedToClean(options, state.value),
      completed,
      ready: completed,
    };
  };

  State.apply(state, element);

  const offList: VoidFunction[] = [
    on(document, 'selectionchange', () => {
      if (element === document.activeElement) {
        state = State.fromTarget(element);
      }
    }),
    on(element, 'input', () => {
      state = process(state, State.fromTarget(element));
      State.apply(state, element);
      onInput?.(getData());
      onChange?.(getData());
    }),
  ];

  return {
    getData,

    setValue(cleanValue: string) {
      if (!enabled) return;

      // мы не знаем какое значение передано (clean или masked) поэтому берем из него только подходящие символы
      const validCleanValue = cleanValue
        .split('')
        .filter(c => c.match(options.pattern))
        .join('');

      const newMaskedValue = Value.cleanToMasked(options, validCleanValue);
      const firstPlace = options.mask.indexOf(options.placeholder);

      state = process(
        State.of(state.value, Range.of(firstPlace, state.value.length)),
        State.of(newMaskedValue, Range.of(newMaskedValue.length))
      );

      State.apply(state, element);
      onChange?.(getData());
    },

    disable() {
      enabled = false;
      offList.forEach(fn => fn());
    },
  };
}
