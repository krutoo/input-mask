import { Range } from './range';
import { ChangeAction, InputState } from './reducer';

/**
 * Получив предыдущее и новое состояния текстового поля определит тип изменений.
 * ВАЖНО: только определяет изменения, ничего не знает про маски.
 */
export const defineChanges = (prev: InputState, next: InputState): ChangeAction => {
  let type: ChangeAction['type'] = 'UNKNOWN';
  let payload: ChangeAction['payload'];

  // define type
  if (prev.value !== next.value) {
    if (next.value.length > prev.value.length) {
      if (Range.size(prev.range) > 0) {
        type = 'REPLACE';
      } else {
        type = 'INSERT';
      }
    } else {
      const carvedPart = prev.value.slice(prev.range.head, prev.range.last);
      const restored = next.value.slice(0, prev.range.head) + carvedPart + next.value.slice(prev.range.head);

      if (
        restored === prev.value
        || (Range.size(prev.range) === 0 && Range.size(next.range) === 0)
      ) {
        type = 'DELETE';
      } else {
        type = 'REPLACE';
      }
    }
  }

  // define payload
  switch (type) {
    case 'INSERT':
      payload = {
        ...next,
        insertPosition: prev.range.head,
        insertIndices: Range.spreadOf(prev.range.head, next.range.last),
      };
      break;

    case 'DELETE':
      let deleteIndices = [];

      if (next.range.head < prev.range.head) {
        // удалили символы после каретки (aka backspace)
        deleteIndices = Range.spreadOf(next.range.head, prev.range.head);
      } else {
        // удалили символы перед кареткой (aka delete)
        if (prev.value.indexOf(next.value) !== -1) {
          deleteIndices = Range.spreadOf(prev.range.head, prev.value.length);
        } else {
          const shiftPartIndex = prev.value.lastIndexOf(next.value.slice(next.range.head));
          deleteIndices = Range.spreadOf(prev.range.head, shiftPartIndex);
        }
      }

      payload = {
        ...next,
        deleteIndices: deleteIndices,
        deleteDirection: next.range.head < prev.range.head ? 'backward' : 'forward',
      };
      break;

    case 'REPLACE':
      payload = {
        ...next,
        replacePosition: prev.range.head,
        deleteIndices: Range.spread(prev.range),
        insertIndices: Range.spreadOf(prev.range.head, next.range.last),
      };
      break;

    case 'UNKNOWN':
      payload = { ...next };
      break;
  }

  return { type, payload } as ChangeAction;
};
