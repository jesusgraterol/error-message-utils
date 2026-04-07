import { describe, expect, test } from '@jest/globals';
import { encodeError } from '../error-handler/index.js';
import { Exception } from './index.js';

describe('Exception', () => {
  test('extends Error and preserves the extracted message, name, and code', () => {
    const originalError = new Error('request failed');
    const exception = new Exception(originalError, 'OPENAI_REQUEST_FAILED');

    expect(exception).toBeInstanceOf(Error);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception.name).toBe('Exception');
    expect(exception.message).toBe('request failed');
    expect(exception.code).toBe('OPENAI_REQUEST_FAILED');
  });

  test('extracts the message from non-Error values', () => {
    const exception = new Exception(
      { reason: { message: 'response payload is invalid' } },
      'INVALID_RESPONSE_DATA',
    );

    expect(exception.message).toBe('response payload is invalid');
    expect(exception.code).toBe('INVALID_RESPONSE_DATA');
  });

  test('returns the encoded error string from toString()', () => {
    const exception = new Exception('invalid input provided', 'INVALID_INPUT');

    expect(exception.toString()).toBe(encodeError('invalid input provided', 'INVALID_INPUT'));
  });

  test('uses the encoded error string for string coercion', () => {
    const exception = new Exception('unable to parse output', 'FAILED_TO_PARSE_OUTPUT');
    const expectation = encodeError('unable to parse output', 'FAILED_TO_PARSE_OUTPUT');

    expect(String(exception)).toBe(expectation);
    expect(`${exception}`).toBe(expectation);
  });

  test('returns null for non-string primitive coercion hints', () => {
    const exception = new Exception('invalid response type', 'INVALID_RESPONSE_TYPE');

    expect(exception[Symbol.toPrimitive]('number')).toBeNull();
  });

  test('handles errors without a message property gracefully', () => {
    const exception = new Exception({ reason: 'unknown error' }, -1);
    const expectation = encodeError('unknown error', -1);

    expect(exception.message).toBe('unknown error');
    expect(exception.code).toBe(-1);
    expect(String(exception)).toBe(expectation);
  });

  test('handles errors with cause property', () => {
    const errorWithCause = new Error('database connection failed', {
      cause: new Error('network timeout'),
    });
    const exception = new Exception(errorWithCause, -1);

    expect(exception.message).toBe('database connection failed; [CAUSE]: network timeout');
    expect(exception.code).toBe(-1);
    expect(exception.toString()).toBe(
      encodeError('database connection failed; [CAUSE]: network timeout', -1),
    );
  });
});
