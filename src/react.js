import { useEffect } from 'react';
import { Range } from './core/range';
import { on } from './core/on';
import { createReducer } from './core/reducer';
import { defineChanges } from './core/changes';

export const useInputMask = (ref, options) => useEffect(() => {
  const input = ref.current;

  if (!input) {
    return console.error(
      'Input mask was not initialized: there is no element in ref object'
    );
  }

  const reducer = createReducer(options);

  let currentState;

  const defineState = target => ({
    value: target.value,
    range: Range.fromTarget(target),
  });

  const updadeCurrentState = () => {
    currentState = defineState(input);
  };

  const offList = [
    on(document, 'selectionchange', updadeCurrentState),
    on(input, 'keydown', updadeCurrentState),
    on(input, 'input', e => {
      // compute new state
      const action = defineChanges(currentState, defineState(e.target));
      const nextState = reducer(currentState, action);

      // apply state
      e.target.value = nextState.value;
      e.target.setSelectionRange(nextState.range.head, nextState.range.last);

      // save state as current
      currentState = nextState;
    }),
  ];

  return () => offList.forEach(off => off());
}, [options.mask, options.pattern, options.placeholder]);
