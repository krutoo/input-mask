# One more input mask library

JavaScript lib for making static masked inputs

## Features

- only static masks (fixed number of characters)
- working with pure DOM inputs
- able to make solutions for React/Vue/Angular based on this library

## Usage

Installing:

```bash
npm install --save @krutoo/input-mask
```

Usage:

```js
import { InputMask } from '@krutoo/input-mask/dist/dom';

const input = document.querySelector('input#phone');

const inputMask = InputMask(input, {
  mask: '___-____-____',
  placeholder: '_',
  pattern: /\d/,

  onChange: ({ value, cleanValue, ready }) => {
    // value is string with masked value
    // cleanValue is string only writable characters
    // ready is boolean which shows that the mask is completely filled
  },
});

// returns actual state of input
const { value, cleanValue, ready } = inputMask.getData();

// sets value manually
inputMask.setValue('00000000000');

// disables masking on element
inputMask.disable();
```

## Advanced usage

This package also contains parts for build your own solution to provide input masking.

There is a several functions:

- `createReducer`: returns reducer which takes *input state* and *change action* and returns the *new state*
- `defineChanges`: takes *current state* and *next state* and returns *change action*

## To Do

- ✅ Create helper to use with `vanilla js` (no frameworks)
- ✅ Divide `react solution` on `react` and `vanilla js` solutions
- Add able to use middleware methods to prepare value before mask applying
- Add examples of usage in React, React Native, Vue, Angular, Svelte...
