import { Range } from './range';
import { ChangeAction, InputState } from './reducer';

/**
 * Получив предыдущее и новое состояния текстового поля определит тип изменений.
 * ВАЖНО: только определяет изменения, ничего не знает про маски.
 */
export const defineChanges = (prev: InputState, next: InputState): ChangeAction => {
  const hasChanges = prev.value !== next.value;

  let type: ChangeAction['type'] = 'UNKNOWN';
  let payload: ChangeAction['payload'];

  // define type
  if (hasChanges) {
    if (next.value.length > prev.value.length) {
      if (Range.size(prev.range) > 0) {
        type = 'REPLACE';
      } else {
        type = 'INSERT';
      }
    } else {
      const carved = prev.value.slice(prev.range.start, prev.range.end);
      const restored =
        next.value.slice(0, prev.range.start) + carved + next.value.slice(prev.range.start);

      if (
        restored === prev.value ||
        (Range.size(prev.range) === 0 && Range.size(next.range) === 0)
      ) {
        type = 'DELETE';
      } else {
        type = 'REPLACE';
      }
    }
  } else if (!Range.equals(prev.range, next.range)) {
    // вставили то же самое что уже было введено
    type = 'REPLACE';
  }

  // define payload
  switch (type) {
    case 'INSERT':
      payload = {
        ...next,
        insertPosition: prev.range.start,
        insertIndices: Range.spreadOf(prev.range.start, next.range.end),
      };
      break;

    case 'DELETE': {
      let deleteIndices: number[] = [];

      if (Range.size(prev.range) === 0) {
        // удалили какую-то часть текста (delete forward/backward, hard/soft...)
        if (next.range.start === prev.range.start) {
          // удалили после каретки (aka delete)
          const delta = prev.value.length - next.value.length;

          deleteIndices = Range.spreadOf(prev.range.start, prev.range.start + delta);
        } else {
          // удалили перед кареткой (aka backspace)
          deleteIndices = Range.spreadOf(next.range.start, prev.range.start);
        }
      } else {
        // просто вырезали выделенную часть
        deleteIndices = Range.spreadOf(prev.range.start, prev.range.end);
      }

      payload = {
        ...next,
        deleteIndices,
        deleteDirection: next.range.start < prev.range.start ? 'backward' : 'forward',
      };
      break;
    }

    case 'REPLACE':
      if (hasChanges) {
        // заменили выделенную часть
        payload = {
          ...next,
          replacePosition: prev.range.start,
          deleteIndices: Range.spread(prev.range),
          insertIndices: Range.spreadOf(prev.range.start, next.range.end),
        };
      } else {
        // вставили то же самое что уже было введено
        payload = {
          ...next,
          replacePosition: prev.range.start,
          deleteIndices: Range.spread(prev.range),
          insertIndices: Range.spread(prev.range),
        };
      }
      break;

    default:
      payload = { ...next };
      break;
  }

  return { type, payload } as ChangeAction;
};
