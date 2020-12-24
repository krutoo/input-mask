import { Range } from '../core/range';

export const defineState = target => ({
  value: target.value,
  range: Range.fromTarget(target),
});