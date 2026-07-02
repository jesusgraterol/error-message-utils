import { describe, expect, test } from '@jest/globals';
import { z, ZodError, type ZodType } from 'zod';

import { DEFAULT_MESSAGE } from '../shared/constants.js';
import { extractZodErrorMessage } from './utilities.js';

/* ************************************************************************************************
 *                                             HELPERS                                            *
 ************************************************************************************************ */

/**
 * Parses invalid input and returns the ZodError emitted by the provided schema.
 * @param schema The schema expected to reject the input.
 * @param input The invalid value to parse.
 * @returns The ZodError emitted by the schema.
 */
const getZodError = (schema: ZodType, input: unknown): ZodError => {
  const result = schema.safeParse(input);

  if (!result.success) {
    return result.error;
  }

  throw new Error('Expected schema parsing to fail.');
};

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('extractZodErrorMessage', () => {
  test('can extract the first issue message and path from a ZodError', () => {
    const error = getZodError(z.object({ name: z.string() }), { name: 123 });

    expect(extractZodErrorMessage(error)).toBe(
      'Invalid input: expected string, received number (name)',
    );
  });

  test('can extract a nested object and array path from a ZodError', () => {
    const error = getZodError(
      z.object({
        someDict: z.object({ innerList: z.array(z.object({ someProp: z.string() })) }),
      }),
      { someDict: { innerList: [{ someProp: 123 }] } },
    );

    expect(extractZodErrorMessage(error)).toBe(
      'Invalid input: expected string, received number (someDict.innerList.0.someProp)',
    );
  });

  test('uses Unknown path when the first issue has no path segments', () => {
    const error = getZodError(z.string(), 123);

    expect(extractZodErrorMessage(error)).toBe(
      'Invalid input: expected string, received number (Unknown path)',
    );
  });

  test('returns the default message when the ZodError has no usable issue message', () => {
    expect(extractZodErrorMessage(new ZodError([]))).toBe(DEFAULT_MESSAGE);
    expect(
      extractZodErrorMessage(new ZodError([{ code: 'custom', message: '', path: ['name'] }])),
    ).toBe(DEFAULT_MESSAGE);
  });
});
