import { Range, IRange } from './range';

export interface InputState {
  range: IRange
  value: string
}

interface BaseAction<T extends string, P = {}> { type: T, payload: InputState & P }

export type UnknownAction = BaseAction<'UNKNOWN'>;

export type InsertAction = BaseAction<'INSERT', {
  insertPosition: number
  insertIndices: number[]
}>;

export type DeleteAction = BaseAction<'DELETE', {
  deleteDirection: 'backward' | 'forward'
  deleteIndices: number[]
}>;

export type ReplaceAction = BaseAction<'REPLACE', {
  replacePosition: number
  deleteIndices: number[]
  insertIndices: number[]
}>;

export type ChangeAction = InsertAction | DeleteAction | ReplaceAction | UnknownAction;

type Reducer = (state: InputState, action: ChangeAction) => InputState;

export type ReducerOptions = {
  mask: string
  pattern: RegExp
  placeholder: string
};

export const createReducer = ({ mask, pattern, placeholder }: ReducerOptions): Reducer => {
  const placeIndices = mask
    .split('')
    .reduce((acc: number[], char, i) => {
      char === placeholder && acc.push(i);
      return acc;
    }, []);

  const Char = {
    isValid: (c: string) => pattern.test(c),
  };

  const Index = {
    isPlace: (i: number) => placeIndices.includes(i),

    toMasked: (i: number) => placeIndices[i],

    getNearestPlace: (i: number, forward = true) => {
      let result = i;

      while (result >= 0 && result <= mask.length && !placeIndices.includes(result)) {
        result += forward ? 1 : -1;
      }

      return placeIndices.indexOf(result);
    },
  };

  const handleInsert = (state: InputState, payload: InsertAction['payload']): InputState => {
    const cleanChars = getCleanChars(state.value);
    const insertIndex = Index.getNearestPlace(payload.insertPosition);
    const insertChars = payload.insertIndices.map(i => payload.value[i]).filter(Char.isValid);

    let { range } = payload;

    if (insertIndex !== -1) {
      const nextCaretPosition = Index.toMasked(insertIndex + insertChars.length);

      cleanChars.splice(insertIndex, 0, ...insertChars);
      if (nextCaretPosition) {
        range = Range.of(nextCaretPosition);
      }
    }

    return { ...state, range, value: toMasked(cleanChars) };
  };

  const handleDelete = (state: InputState, payload: DeleteAction['payload']): InputState => {
    const cleanChars = getCleanChars(state.value);
    const isForward = payload.deleteDirection === 'forward';
    const deleteIndex = Index.getNearestPlace(payload.range.head, isForward);
    const range = Range.of(Math.max(placeIndices[0], Index.toMasked(deleteIndex) || 0));

    let deleteCount = payload.deleteIndices.filter(Index.isPlace).length;

    if (!isForward && deleteCount === 0) {
      deleteCount = 1;
    }

    if (deleteIndex !== -1) {
      cleanChars.splice(deleteIndex, deleteCount);
    } else if (state.range.head > placeIndices[0] && !isForward) {
      cleanChars.splice(0, deleteCount);
    }

    return { ...state, range, value: toMasked(cleanChars) };
  };

  const handleReplace = (state: InputState, payload: ReplaceAction['payload']): InputState => {
    // ничего не изменилось - просто переносим каретку в конец
    if (state.value === payload.value) {
      return {
        ...state,
        range: Range.of(
          Index.toMasked(Index.getNearestPlace(payload.range.last)) || state.value.length,
        ),
      };
    }

    const cleanChars = getCleanChars(state.value);
    const replaceIndex = Index.getNearestPlace(payload.replacePosition);
    const carvedIndices = payload.deleteIndices.filter(Index.isPlace);
    const addedValidChars = payload.insertIndices
      .map(i => payload.value[i])
      .filter(Char.isValid);

    if (replaceIndex !== -1) {
      cleanChars.splice(replaceIndex, carvedIndices.length, ...addedValidChars);
    }

    const value = toMasked(cleanChars);
    const range = Range.of(Index.toMasked(replaceIndex + addedValidChars.length) || value.length);

    return { ...state, range, value };
  };

  const getCleanChars = (masked: string) => masked
    .split('')
    .filter((c, i) => Char.isValid(c) && Index.isPlace(i));

  const toMasked = (cleanChars: string[]): string => {
    let result = '';

    for (let i = 0, j = 0; i < mask.length; i++) {
      const maskChar = mask[i];
      const valueChar = cleanChars[j];

      if (maskChar !== placeholder) {
        result += maskChar;
      } else if (valueChar) {
        result += valueChar;
        j++;
      } else {
        break;
      }
    }

    // предотвращаем возможность удалить часть маски до вводимого места
    // @todo удалить это после появления возможности передать функцию предобработки значения
    if (result.length < placeIndices[0]) {
      result = mask.slice(0, placeIndices[0]);
    }

    return result;
  };

  const normalizeRange = (state: InputState): InputState => ({
    ...state,
    range: Range.map(state.range, n => Math.min(n, state.value.length)),
  });

  return (state, action: ChangeAction) => {
    let nextState = state;

    switch (action.type) {
      case 'INSERT':
        nextState = handleInsert(state, action.payload);
        break;
      case 'DELETE':
        nextState = handleDelete(state, action.payload);
        break;
      case 'REPLACE':
        nextState = handleReplace(state, action.payload);
        break;
    }

    return nextState === state ? state : normalizeRange(nextState);
  };
};
