import { useEffect } from 'react';
import { identity } from 'lodash';
import { path } from 'lodash/fp';
import { Range } from './range';
import { createCapture } from './capture';
import { on } from './on';
import { createReducer } from './reducer';
import { defineChanges } from './changes';

export const useInputMask = (ref, { mask, pattern = /\d/ }) => useEffect(() => {
  const input = ref.current;

  if (!input) {
    return console.error('Failed to init input mask: there is no element in ref object');
  }

  const reducer = createReducer({ mask, pattern });
  const captureRange = createCapture(Range.fromEvent, Range.clone, Range.of(0));
  const captureValue = createCapture(path(['target', 'value']), identity, '');

  const captureEvent = event => {
    const [prevRange, nextRange] = captureRange(event);
    const [prevValue, nextValue] = captureValue(event);

    return { prevRange, nextRange, prevValue, nextValue };
  };

  const offList = [
    on(input, 'keydown', captureEvent),
    on(input, 'keyup', captureRange),
    on(input, 'mousedown', captureRange),
    on(input, 'mouseup', captureRange),
    on(input, 'input', event => {
      const prevState = captureEvent(event);
      const nextState = reducer(prevState, defineChanges(prevState));

      event.target.value = nextState.nextValue;
      event.target.setSelectionRange(nextState.nextRange.head, nextState.nextRange.last);
    }),
  ];

  return () => offList.forEach(off => off());
}, [mask, pattern]);
