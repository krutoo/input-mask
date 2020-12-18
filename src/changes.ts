import { Range } from './range';
import { InputState } from './reducer';

type IndexList = number[];

interface BaseAction<T extends string, P> { type: T, payload: P }

export type UnknownAction = BaseAction<'UNKNOWN', undefined>

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

// только определяет изменения, ничего не знает про маски
export const defineChanges = ({ prevRange, nextRange, prevValue, nextValue }: InputState): ChangeAction => {
  let type: ChangeAction['type'] = 'UNKNOWN';
  let payload: ChangeAction['payload'];

  if (prevValue !== nextValue) {
    if (nextValue.length > prevValue.length) {
      if (Range.size(prevRange) > 0) {
        type = 'REPLACE';
      } else {
        type = 'INSERT';
        payload = {
          insertPosition: prevRange.head,
          insertIndices: Range.spreadOf(prevRange.head, nextRange.last),
        };
        console.log(prevValue)
        console.log(nextValue)
      }
    } else {
      const carvedPart = prevValue.slice(prevRange.head, prevRange.last);
      const restoredValue = nextValue.slice(0, prevRange.head) + carvedPart + nextValue.slice(prevRange.head);

      if (restoredValue === prevValue || (Range.size(prevRange) === 0 && Range.size(nextRange) === 0)) {
        type = 'DELETE';
        let deleteIndices = [];

        if (nextRange.head < prevRange.head) {
          // удалили символы после каретки (aka backspace)
          deleteIndices = Range.spreadOf(nextRange.head, prevRange.head);
        } else {
          // удалили символы перед кареткой (aka delete)
          if (prevValue.indexOf(nextValue) !== -1) {
            deleteIndices = Range.spreadOf(prevRange.head, prevValue.length);
          } else {
            const shiftPartIndex = prevValue.lastIndexOf(nextValue.slice(nextRange.head));
            deleteIndices = Range.spreadOf(prevRange.head, shiftPartIndex);
          }
        }

        payload = {
          deleteIndices: deleteIndices,
          deleteDirection: nextRange.head < prevRange.head ? 'backward' : 'forward',
        };
      } else {
        type = 'REPLACE';
      }
    }
  }

  if (type === 'REPLACE') {
    payload = {
      replacePosition: prevRange.head,
      deleteIndices: Range.spread(prevRange),
      insertIndices: Range.spreadOf(prevRange.head, nextRange.last),
    };
  }

  return { type, payload } as ChangeAction;
};
