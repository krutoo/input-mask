import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { defineChanges, createReducer, Range } from '../core';
import { on } from './utils';

const defaultOptions = { placeholder: '_', pattern: /\d/ };

export const MaskMixin = render => ({
  value: valueProp,
  onChange,
  maskOptions,
  ...inputProps
}) => {
  const value = valueProp || '';
  const options = { ...defaultOptions, ...maskOptions };
  const [reducer, setReducer] = useState();
  const inputRef = useRef();
  const stateRef = useRef(State.EMPTY);

  useLayoutEffect(() => {
    setReducer(() => createReducer(options));
  }, [options.mask, options.placeholder, options.pattern]);

  useEffect(() => {
    if (!reducer) return;

    // compute initial state
    const maskValidChars = options.mask.split('').filter(c => options.pattern.test(c)).join('');
    const readyValue = value.indexOf(maskValidChars) === 0 ? value.slice(maskValidChars.length) : value;
    const firstPlace = options.mask.indexOf(options.placeholder);
    const initial = {
      value: options.mask.slice(0, firstPlace),
      range: Range.of(0, firstPlace),
    };

    const action = defineChanges(initial, { value: readyValue, range: Range.of(readyValue.length) });
    stateRef.current = reducer(initial, action);

    // apply initial state
    State.apply(stateRef.current, inputRef.current);
    onChange && onChange(stateRef.current);
  }, [value, reducer]);

  useEffect(() => {
    if (!reducer) return;

    const input = inputRef.current;

    const offList = [
      on(document, 'selectionchange', () => {
        stateRef.current = State.define(input);
      }),
      on(input, 'input', event => {
        // compute next state
        const action = defineChanges(stateRef.current, State.define(event.target));
        const nextState = reducer(stateRef.current, action);

        // apply next state
        State.apply(nextState, input);

        // save next state as current
        stateRef.current = nextState;
        onChange && onChange(stateRef.current);
      }),
    ];

    return () => offList.forEach(off => off());
  }, [reducer]);

  return render({ ...inputProps, ref: inputRef });
};

const State = {
  EMPTY: {
    value: '',
    range: Range.of(0),
  },
  define: target => ({
    value: target.value,
    range: Range.fromTarget(target),
  }),
  apply: (state, target) => {
    target.value = state.value;
    target.setSelectionRange(state.range.head, state.range.last);
  },
};
