import { ReducerOptions } from '../../core/reducer';
import { Value } from '../utils';

describe('Value', () => {
  test('toClean', () => {
    const options: ReducerOptions = {
      mask: '+7 (___) ___-__-__',
      pattern: /\d/,
      placeholder: '_',
    };

    const input = '+7 (800) 555-35-35';
    const output = '8005553535';

    expect(Value.toClean(options, input)).toBe(output);
  });
});
