# One more input mask library

JavaScript lib for making static masked inputs

## What is it?

This package now contains only parts for build your own solution to provide input masking.

There is a several functions:

- `createReducer`: returns reducer which takes *input state* and *change action* and returns the *new state*
- `defineChanges`: takes *current state* and *next state* and returns *change action*

## Goals

- only static masks (fixed number of characters)
- able to work with pure DOM inputs
- able to make solutions for React/Vue/Angular based on this library

## Usage

```bash
npm install --save @krutoo/input-mask
```

## To Do

- Create helper to use with `vanilla js` (no frameworks)
- Divide `react solution` on `react` and `vanilla js` solutions
- Vue solution
- React native solution
- Angular
- Svelte
