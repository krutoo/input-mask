import type { ReducerOptions } from '../core/mod.ts';

export interface InputMaskOptions extends Partial<ReducerOptions> {
  onInput?: (state: InputMaskState) => void;
}

export interface InputMaskState {
  value: string;
  cleanValue: string;
  completed: boolean;

  /** @deprecated Use "completed" instead. */
  ready: boolean;
}

export interface InputMask {
  getState(): InputMaskState;
  setValue(value: string): void;
  disable(): void;
}
