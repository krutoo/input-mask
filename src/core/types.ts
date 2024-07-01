export interface Range {
  start: number;
  end: number;
}

export interface InputState {
  range: Range;
  value: string;
}

export interface BaseAction<T extends string, P = InputState> {
  type: T;
  payload: InputState & P;
}

export type UnknownAction = BaseAction<'UNKNOWN'>;

export type InsertAction = BaseAction<
  'INSERT',
  {
    insertPosition: number;
    insertIndices: number[];
  }
>;

export type DeleteAction = BaseAction<
  'DELETE',
  {
    deleteDirection: 'backward' | 'forward';
    deleteIndices: number[];
  }
>;

export type ReplaceAction = BaseAction<
  'REPLACE',
  {
    replacePosition: number;
    deleteIndices: number[];
    insertIndices: number[];
  }
>;

export type ChangeAction =
  | InsertAction
  | DeleteAction
  | ReplaceAction
  | UnknownAction;

export interface Reducer {
  (state: InputState | undefined, action: ChangeAction): InputState;
}

export interface ReducerOptions {
  mask: string;
  pattern: RegExp;
  placeholder: string;
}
