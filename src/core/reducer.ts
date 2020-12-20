import { Range, IRange } from './range';

export interface InputState {
  range: IRange
  value: string
}

type IndexList = number[];

interface BaseAction<T extends string, P = {}> { type: T, payload: InputState & P }

export type UnknownAction = BaseAction<'UNKNOWN'>

export type InsertAction = BaseAction<'INSERT', {
  insertPosition: number
  insertIndices: IndexList
}>

export type DeleteAction = BaseAction<'DELETE', {
  deleteDirection: 'backward' | 'forward'
  deleteIndices: IndexList
}>

export type ReplaceAction = BaseAction<'REPLACE', {
  replacePosition: number
  deleteIndices: IndexList
  insertIndices: IndexList
}>

export type ChangeAction = InsertAction | DeleteAction | ReplaceAction | UnknownAction

type Reducer = (state: InputState, action: ChangeAction) => InputState

export const createReducer = ({ mask, pattern = /\d/, placeholder = '_' }: {
  mask: string
  pattern?: RegExp
  placeholder?: string
}): Reducer => {
  const placeIndices = mask
    .split('')
    .reduce((acc: number[], char, i) => (char === placeholder && acc.push(i), acc), []);

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

    let range = payload.range;

    if (insertIndex !== -1) {
      const nextCaretPosition = Index.toMasked(insertIndex + insertChars.length);

      cleanChars.splice(insertIndex, 0, ...insertChars);
      nextCaretPosition && (range = Range.of(nextCaretPosition));
    }

    return { ...state, range, value: insertToMask(cleanChars) };
  };

  const handleDelete = (state: InputState, payload: DeleteAction['payload']): InputState => {
    const cleanChars = getCleanChars(state.value);
    const isForward = payload.deleteDirection === 'forward';
    const deleteIndex = Index.getNearestPlace(payload.range.head, isForward);
    const range = Range.of(Math.max(placeIndices[0], Index.toMasked(deleteIndex) || 0));

    let deleteCount = payload.deleteIndices.filter(Index.isPlace).length;

    !isForward && deleteCount === 0 && (deleteCount = 1);

    if (deleteIndex !== -1) {
      cleanChars.splice(deleteIndex, deleteCount);
    } else if (state.range.head > placeIndices[0] && !isForward) {
      cleanChars.splice(0, deleteCount);
    }

    return { ...state, range, value: insertToMask(cleanChars) };
  };

  const handleReplace = (state: InputState, payload: ReplaceAction['payload']): InputState => {
    const cleanChars = getCleanChars(state.value);
    const replaceIndex = Index.getNearestPlace(payload.replacePosition);
    const carvedIndices = payload.deleteIndices.filter(Index.isPlace);
    const addedValidChars = payload.insertIndices
      .map(i => payload.value[i])
      .filter(Char.isValid);
    const range = Range.of(Index.toMasked(replaceIndex + addedValidChars.length));

    replaceIndex !== -1 && cleanChars.splice(replaceIndex, carvedIndices.length, ...addedValidChars);

    return { ...state, range, value: insertToMask(cleanChars) };
  };

  const getCleanChars = (masked: string) => masked
    .split('')
    .filter((c, i) => Char.isValid(c) && Index.isPlace(i));

  const insertToMask = (cleanValue: string | string[]): string => {
    let result = '';

    for (let i = 0, j = 0; i < mask.length; i++) {
      const maskChar = mask[i];
      const valueChar = cleanValue[j];

      if (maskChar !== '_') {
        result += maskChar;
      } else if (valueChar) {
        result += valueChar;
        j++;
      } else {
        break;
      }
    }

    // удаляем остаточную часть маски после введенного значения
    while (result.length > 0 && !Index.isPlace(result.length - 1)) {
      result = result.slice(0, -1);
    }

    // предотвращаем возможность удалить часть маски до вводимого места
    if (result.length < placeIndices[0]) {
      result = mask.slice(0, placeIndices[0]);
    }

    return result;
  };

  return (state, { type, payload }: ChangeAction) => {
    let nextState = state;

    switch (type) {
      case 'INSERT':
        nextState = handleInsert(state, payload as unknown as InsertAction['payload']);
        break;
      case 'DELETE':
        nextState = handleDelete(state, payload as unknown as DeleteAction['payload']);
        break;
      case 'REPLACE':
        nextState = handleReplace(state, payload as unknown as ReplaceAction['payload']);
        break;
    }

    return nextState;
  };
};