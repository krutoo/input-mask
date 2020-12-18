import { ChangeAction, DeleteAction, InsertAction, ReplaceAction } from './changes';
import { Range, IRange } from './range';

export type InputState = {
  prevRange: IRange
  nextRange: IRange
  prevValue: string
  nextValue: string
}

export type Options = {
  mask: string
  pattern: RegExp
  placeholder?: string
}

type Reducer = (state: InputState, action: ChangeAction) => InputState

export const createReducer = ({ mask, pattern, placeholder = '_' }: Options): Reducer => {
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

  const handleInsert = (state: InputState, payload: InsertAction['payload']) => {
    const cleanChars = getCleanChars(state.prevValue);
    const insertIndex = Index.getNearestPlace(payload.insertPosition);
    const insertChars = payload.insertIndices.map(i => state.nextValue[i]).filter(Char.isValid);

    let nextRange = state.nextRange;

    if (insertIndex !== -1) {
      const nextCaretPosition = Index.toMasked(insertIndex + insertChars.length);

      cleanChars.splice(insertIndex, 0, ...insertChars);
      nextCaretPosition && (nextRange = Range.of(nextCaretPosition));
    }

    return { ...state, nextRange, nextValue: insertToMask(cleanChars) };
  };

  const handleDelete = (state: InputState, payload: DeleteAction['payload']) => {
    const cleanChars = getCleanChars(state.prevValue);
    const isForward = payload.deleteDirection === 'forward';
    const deleteIndex = Index.getNearestPlace(state.nextRange.head, isForward);
    const nextRange = Range.of(Math.max(placeIndices[0], Index.toMasked(deleteIndex) || 0));

    let deleteCount = payload.deleteIndices.filter(Index.isPlace).length;

    !isForward && deleteCount === 0 && (deleteCount = 1);

    if (deleteIndex !== -1) {
      cleanChars.splice(deleteIndex, deleteCount);
    } else if (state.prevRange.head > placeIndices[0] && !isForward) {
      cleanChars.splice(0, deleteCount);
    }

    return { ...state, nextRange, nextValue: insertToMask(cleanChars) };
  };

  const handleReplace = (state: InputState, payload: ReplaceAction['payload']) => {
    const cleanChars = getCleanChars(state.prevValue);
    const replaceIndex = Index.getNearestPlace(payload.replacePosition);
    const carvedIndices = payload.deleteIndices.filter(Index.isPlace);
    const addedValidChars = payload.insertIndices
      .map(i => state.nextValue[i])
      .filter(Char.isValid);
    const nextRange = Range.of(Index.toMasked(replaceIndex + addedValidChars.length));

    replaceIndex !== -1 && cleanChars.splice(replaceIndex, carvedIndices.length, ...addedValidChars);

    return { ...state, nextRange, nextValue: insertToMask(cleanChars) };
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
