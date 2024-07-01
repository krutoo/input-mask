import { describe, test } from '@std/testing/bdd';
import { expect } from '@std/expect';
import type { ReducerOptions } from '../../core/mod.ts';
import { ValueUtil } from '../utils.ts';

describe('Value', () => {
  test('maskedToClean', () => {
    const options: ReducerOptions = {
      mask: '+7 (___) ___-__-__',
      pattern: /\d/,
      placeholder: '_',
    };

    const input = '+7 (800) 555-35-35';
    const output = '8005553535';

    expect(ValueUtil.maskedToClean(options, input)).toBe(output);
  });
});
