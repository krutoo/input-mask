import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { defineChanges, createReducer } from '../core';
import { on, Range } from '../dom/utils';
import { useActualRef } from './utils';

const defaultOptions = { mask: '____', placeholder: '_', pattern: /\d/ };

export const MaskMixin = render => forwardRef(({
  value: valueProp,
  onChange,
  maskOptions,
  ...inputProps
}, ref) => {
  const value = valueProp || '';
  const options = { ...defaultOptions, ...maskOptions };
  const [reducer, setReducer] = useState();
  const handlerRef = useActualRef(onChange);
  const stateRef = useRef(State.of(''));
  const inputRef = useRef();

  const handleChanges = () => {
    handlerRef.current && handlerRef.current({
      value: stateRef.current.value,
      cleanValue: Value.toClean(options, stateRef.current.value),
    });
  };

  useImperativeHandle(ref, () => inputRef);

  // create reducer
  useEffect(() => {
    setReducer(() => createReducer(options));

    stateRef.current = State.of('');

    // save and apply next state
    stateRef.current = State.init(options);
    State.apply(stateRef.current, inputRef.current);

    handleChanges();
  }, [options.mask, options.placeholder, options.pattern]);

  // handle value change
  useEffect(() => {
    const newMaskedValue = Value.toMasked(options, value);

    if (!reducer || stateRef.current.value === newMaskedValue) return;

    // compute next state
    const firstPlace = options.mask.indexOf(options.placeholder);
    const action = defineChanges(
      State.of(stateRef.current.value, Range.of(firstPlace, stateRef.current.value.length)),
      State.of(newMaskedValue)
    );

    // save and apply next state
    stateRef.current = reducer(stateRef.current, action);
    State.apply(stateRef.current, inputRef.current);
  }, [value, reducer]);

  // handle input events
  useEffect(() => {
    if (!reducer) return;

    const offList = [
      on(document, 'selectionchange', () => {
        stateRef.current = State.fromTarget(inputRef.current);
      }),
      on(inputRef.current, 'input', event => {
        // compute next state
        const action = defineChanges(stateRef.current, State.fromTarget(event.target));

        // save and apply next state
        stateRef.current = reducer(stateRef.current, action);
        State.apply(stateRef.current, inputRef.current);

        handleChanges();
      }),
    ];

    return () => offList.forEach(fn => fn());
  }, [reducer]);

  return render({ ...inputProps, ref: inputRef });
});

const State = {
  of: (value, range = Range.of(value.length)) => ({ value, range }),

  fromTarget: target => State.of(target.value, Range.fromTarget(target)),

  apply: (state, target) => {
    target.value = state.value;
    target.setSelectionRange(state.range.head, state.range.last);
  },

  init: ({ mask, placeholder }) => {
    const firstPlace = mask.indexOf(placeholder);
    return State.of(mask.slice(0, firstPlace));
  },
};

const Value = {
  toClean: ({ mask, placeholder }, maskedValue) => {
    let result = '';

    for (let i = 0; i < maskedValue.length; i++) {
      if (mask[i] === placeholder) {
        result += maskedValue[i];
      }
    }

    return result;
  },
  toMasked: ({ mask, placeholder }, cleanValue) => {
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
};
