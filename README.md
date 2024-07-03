# One more input mask library

JavaScript lib for making static masked inputs

## Features

- only static masks (fixed number of characters)
- working with pure DOM inputs
- able to make solutions for React/Vue/Angular based on this library

## Usage

Installing:

```bash
npm add @krutoo/input-mask
```

Usage:

```ts
import { createInputMask } from '@krutoo/input-mask/dom';

const input = document.querySelector('input#phone');

const inputMask = createInputMask(input, {
  mask: '___-____-____',
  placeholder: '_',
  pattern: /\d/,

  onInput: ({ value, cleanValue, completed }) => {
    // "value" is string with masked value
    // "cleanValue" is string only writable characters
    // "completed" is boolean which shows that the mask is completely filled
  },
});

// returns actual state of input
const { value, cleanValue, completed } = inputMask.getState();

// sets value manually
inputMask.setValue('00000000000');

// disables masking on element
inputMask.disable();
```

## Advanced usage

This package also contains parts for build your own solution to provide input masking.

There is a several functions:

- `createReducer`: returns reducer which takes _input state_ and _change action_ and returns the
  _new state_
- `defineChanges`: takes _current state_ and _next state_ and returns _change action_

## To Do

- ✅ Create helper to use with `vanilla js` (no frameworks)
- ✅ Divide `react solution` on `react` and `vanilla js` solutions
- Add able to use middleware methods to prepare value before mask applying
- Add examples of usage in React, React Native, Vue, Angular, Svelte...
