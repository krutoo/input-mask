import { useEffect } from 'react';
import { on } from '../dom/on';
import { createReducer } from '../core/reducer';
import { defineChanges } from '../core/changes';
import { defineState } from './utils';

export const useInputMask = (ref, options) => {
  useEffect(() => {
    const input = ref.current;

    if (!input) {
      return console.error(
        'Input mask was not initialized: there is no element in ref object'
      );
    }

    const reducer = createReducer(options);

    let currentState;

    const updateCurrentState = () => {
      currentState = defineState(input);
    };

    const offList = [
      on(document, 'selectionchange', updateCurrentState),
      on(input, 'keydown', updateCurrentState),
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
};