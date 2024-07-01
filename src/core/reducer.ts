import type {
  ChangeAction,
  DeleteAction,
  InputState,
  InsertAction,
  Reducer,
  ReducerOptions,
  ReplaceAction,
} from './types.ts';
import { RangeUtil } from './range.ts';

// @todo fix caret position: "+|7 (" with paste "(111) 222-33-44"
export function createReducer({
  mask,
  pattern,
  placeholder,
}: ReducerOptions): Reducer {
  const placeIndices = mask.split('').reduce((acc: number[], char, i) => {
    char === placeholder && acc.push(i);
    return acc;
  }, []);

  const Char = {
    isValid: (c: string): boolean => {
      // @todo reset regexp state OR clone regexp and not mutate given regexp (better)
      // pattern.lastIndex = 0;
      return pattern.test(c);
    },
  };

  const Index = {
    isPlace: (i: number) => placeIndices.includes(i),

    toMasked: (i: number) => placeIndices[i],

    getNearestPlace: (i: number, forward = true) => {
      let result = i;

      while (
        result >= 0 &&
        result <= mask.length &&
        !placeIndices.includes(result)
      ) {
        result += forward ? 1 : -1;
      }

      return placeIndices.indexOf(result);
    },
  };

  const handleInsert = (
    state: InputState,
    payload: InsertAction['payload'],
  ): InputState => {
    const cleanChars = getCleanChars(state.value);
    const insertIndex = Index.getNearestPlace(payload.insertPosition);
    const insertChars = payload.insertIndices
      .map((i) => payload.value[i])
      .filter(Char.isValid);

    let { range } = payload;

    if (insertIndex !== -1) {
      const nextCaretPosition = Index.toMasked(
        insertIndex + insertChars.length,
      );

      cleanChars.splice(insertIndex, 0, ...insertChars);
      if (nextCaretPosition) {
        range = RangeUtil.of(nextCaretPosition);
      }
    }

    return { ...state, range, value: toMasked(cleanChars) };
  };

  const handleDelete = (
    state: InputState,
    payload: DeleteAction['payload'],
  ): InputState => {
    const cleanChars = getCleanChars(state.value);
    const isForward = payload.deleteDirection === 'forward';
    const deleteIndex = Index.getNearestPlace(payload.range.start, isForward);
    const range = RangeUtil.of(
      Math.max(placeIndices[0], Index.toMasked(deleteIndex) || 0),
    );

    let deleteCount = payload.deleteIndices.filter(Index.isPlace).length;

    if (!isForward && deleteCount === 0) {
      deleteCount = 1;
    }

    if (deleteIndex !== -1) {
      cleanChars.splice(deleteIndex, deleteCount);
    } else if (state.range.start > placeIndices[0] && !isForward) {
      cleanChars.splice(0, deleteCount);
    }

    return { ...state, range, value: toMasked(cleanChars) };
  };

  const handleReplace = (
    state: InputState,
    payload: ReplaceAction['payload'],
  ): InputState => {
    // ничего не изменилось - просто переносим каретку в конец
    if (state.value === payload.value) {
      return {
        ...state,
        range: RangeUtil.of(
          Index.toMasked(Index.getNearestPlace(payload.range.end)) ||
            state.value.length,
        ),
      };
    }

    const cleanChars = getCleanChars(state.value);
    const replaceIndex = Index.getNearestPlace(payload.replacePosition);
    const carvedIndices = payload.deleteIndices.filter(Index.isPlace);
    const addedValidChars = payload.insertIndices
      .map((i) => payload.value[i])
      .filter(Char.isValid);

    if (replaceIndex !== -1) {
      cleanChars.splice(replaceIndex, carvedIndices.length, ...addedValidChars);
    }

    const value = toMasked(cleanChars);
    const range = RangeUtil.of(
      Index.toMasked(replaceIndex + addedValidChars.length) || value.length,
    );

    return { ...state, range, value };
  };

  const getCleanChars = (masked: string) =>
    masked.split('').filter((c, i) => Char.isValid(c) && Index.isPlace(i));

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
    range: RangeUtil.map(state.range, (n) => Math.min(n, state.value.length)),
  });

  const initialState: InputState = {
    value: '',
    range: RangeUtil.of(0, 0),
  };

  return (state = initialState, action: ChangeAction) => {
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
}
