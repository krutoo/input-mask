import { createReducer, defineChanges, InputState, ReducerOptions } from '../core';
import { on, State, Value, Range } from './utils';

type Data = {
  value: string
  cleanValue: string
  ready: boolean
};

type Options = Partial<ReducerOptions> & {
  onChange?: (data: Data) => void
};

const reducerDefaults = {
  mask: '____',
  placeholder: '_',
  pattern: /\d/,
};

export const InputMask = (
  element: HTMLInputElement,
  { onChange, ...reducerOptions }: Options = {},
) => {
  const options = { ...reducerDefaults, ...reducerOptions };
  const reducer = createReducer(options);
  const process = (a: InputState, b: InputState) => reducer(a, defineChanges(a, b));

  let state = State.init(options);
  let active = true;

  const getData = (): Data => ({
    value: state.value,
    cleanValue: Value.toClean(options, state.value),
    ready: state.value.length === options.mask.length,
  });

  const handleChange = () => {
    onChange && onChange(getData());
  };

  State.apply(state, element);

  const offList = [
    on(document, 'selectionchange', () => {
      state = State.fromTarget(element);
    }),
    on(element, 'input', event => {
      state = process(state, State.fromTarget(event.target as HTMLInputElement));
      State.apply(state, element);
      handleChange();
    }),
  ];

  return {
    getData,

    setValue: (value: string) => {
      if (!active) return;

      const newMaskedValue = Value.toMasked(options, value);
      const firstPlace = options.mask.indexOf(options.placeholder);

      state = process(
        State.of(state.value, Range.of(firstPlace, state.value.length)),
        State.of(newMaskedValue),
      );

      State.apply(state, element);
      handleChange();
    },

    disable: () => {
      active = false;
      offList.forEach(fn => fn());
    },
  };
};
