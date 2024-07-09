import { DEFAULT_MESSAGE, CODE_WRAPPER, wrapCode } from './utils/utils.js';
import {
  extractMessage,
  encodeError,
  decodeError,
  isEncodedError,
} from './index.js';

/* ************************************************************************************************
 *                                             TESTS                                              *
 ************************************************************************************************ */

describe('extractMessage', () => {
  test('returns the default error msg if an invalid value is provided', () => {
    // @ts-ignore
    expect(extractMessage()).toBe(DEFAULT_MESSAGE);
    expect(extractMessage('')).toBe(DEFAULT_MESSAGE);
    expect(extractMessage(undefined)).toBe(DEFAULT_MESSAGE);
    expect(extractMessage(null)).toBe(DEFAULT_MESSAGE);
    expect(extractMessage(true)).toBe(DEFAULT_MESSAGE);
    expect(extractMessage(false)).toBe(DEFAULT_MESSAGE);
    expect(extractMessage(0)).toBe(DEFAULT_MESSAGE);
    expect(extractMessage(1)).toBe(DEFAULT_MESSAGE);
  });

  test('can extract a message that is passed in string format', () => {
    expect(extractMessage('This is a nasty error!')).toBe('This is a nasty error!');
  });

  test('can extract a message from an error instance', () => {
    expect(extractMessage(new Error('This is a nasty error!'))).toBe('This is a nasty error!');
    expect(extractMessage(new TypeError('This is a nasty type error!'))).toBe('This is a nasty type error!');
    expect(extractMessage(new ReferenceError('This is a nasty reference error!'))).toBe('This is a nasty reference error!');
    expect(extractMessage(new SyntaxError('This is a nasty syntax error!'))).toBe('This is a nasty syntax error!');
    expect(extractMessage(new RangeError('This is a nasty range error!'))).toBe('This is a nasty range error!');
    expect(extractMessage(new EvalError('This is a nasty eval error!'))).toBe('This is a nasty eval error!');
    expect(extractMessage(new URIError('This is a nasty uri error!'))).toBe('This is a nasty uri error!');
    expect(extractMessage(new AggregateError(['error 1', 'error 2', 'error 3']))).toStrictEqual(JSON.stringify(['error 1', 'error 2', 'error 3']));
  });

  test('can extract a message from an error instance with cause', () => {
    const cause = new Error('I AM THE CAUSE!');
    const cause2 = new ReferenceError('I AM THE OTHER CAUSE!');
    expect(extractMessage(new Error('This is a nasty error!', { cause }))).toBe('This is a nasty error!; [CAUSE]: I AM THE CAUSE!');
    expect(extractMessage(new TypeError('This is a type error!', { cause }))).toBe('This is a type error!; [CAUSE]: I AM THE CAUSE!');
    expect(extractMessage(new Error('This is an error!', { cause: cause2 }))).toBe('This is an error!; [CAUSE]: I AM THE OTHER CAUSE!');
  });

  test('can extract a message from an error instance with deeply nested causes', () => {
    expect(extractMessage(new Error('Top level error', {
      cause: new Error('First nested cause', {
        cause: new Error('Second nested cause'),
      }),
    }))).toBe('Top level error; [CAUSE]: First nested cause; [CAUSE]: Second nested cause');
  });

  test('returns a stringified version of the error if it cannot extract the message from an object', () => {
    expect(extractMessage(['some', 'weird', 'error'])).toBe(JSON.stringify(['some', 'weird', 'error']));
    expect(extractMessage({ omg: 'no error keys!', foo: 'bar' })).toBe(JSON.stringify({ omg: 'no error keys!', foo: 'bar' }));
  });

  test('can extract a message from within an object', () => {
    expect(extractMessage({ message: 'Ops! something went wrong', msg: 'did it?' })).toBe('Ops! something went wrong');
    expect(extractMessage({ msg: 'The msg key is used by some APIs' })).toBe('The msg key is used by some APIs');
    expect(extractMessage({ error: 'The error key is used by some APIs' })).toBe('The error key is used by some APIs');
    expect(extractMessage({ err: 'The err key is used by some APIs' })).toBe('The err key is used by some APIs');
    expect(extractMessage({ errors: 'The errors key is used by some APIs' })).toBe('The errors key is used by some APIs');
    expect(extractMessage({ errs: 'The errs key is used by some APIs' })).toBe('The errs key is used by some APIs');
  });

  test('can extract a message when is deeply nested within an object', () => {
    expect(extractMessage({ error: { err: { error: 'Oh my god! So nested :)' } } })).toBe('Oh my god! So nested :)');
    expect(extractMessage({ message: { err: { message: 'This error message is nested deeply!' } } })).toBe('This error message is nested deeply!');
  });
});





describe('encodeError', () => {
  test('can encode a string error', () => {
    expect(encodeError('This is an error', 1)).toBe('This is an error{(1)}');
    expect(encodeError('This is an error', 'INVALID_INPUT')).toBe('This is an error{(INVALID_INPUT)}');
  });

  test('can encode an error instance', () => {
    expect(encodeError(new Error('This is an error'), 1)).toBe('This is an error{(1)}');
    expect(encodeError(new ReferenceError('This is an error'), 'INVALID_INPUT')).toBe('This is an error{(INVALID_INPUT)}');
  });

  test('can encode an error instance with cause', () => {
    expect(encodeError(new Error('This is an error', {
      cause: new Error('This is the cause!'),
    }), 1)).toBe('This is an error; [CAUSE]: This is the cause!{(1)}');
    expect(encodeError(new Error('This is an error', {
      cause: new Error('This is the cause!'),
    }), 'INVALID_INPUT')).toBe('This is an error; [CAUSE]: This is the cause!{(INVALID_INPUT)}');
  });
});





describe('decodeError', () => {
  test('can decode a basic error', () => {
    expect(decodeError(encodeError('There was an error.', 100))).toStrictEqual({
      message: 'There was an error.',
      code: 100,
    });
    expect(decodeError(encodeError(new Error('There was a nasty error.'), 'DB_ERROR'))).toStrictEqual({
      message: 'There was a nasty error.',
      code: 'DB_ERROR',
    });
  });

  test('can decode an error instance with cause', () => {
    const error = new Error('Top level error.', {
      cause: new Error('First nested cause.', {
        cause: new Error('Second nested cause.'),
      }),
    });
    expect(decodeError(encodeError(error, 100))).toStrictEqual({
      message: 'Top level error.; [CAUSE]: First nested cause.; [CAUSE]: Second nested cause.',
      code: 100,
    });
    expect(decodeError(encodeError(error, 'UNKNOWN_AUTH_ERROR'))).toStrictEqual({
      message: 'Top level error.; [CAUSE]: First nested cause.; [CAUSE]: Second nested cause.',
      code: 'UNKNOWN_AUTH_ERROR',
    });
  });

  test('returns -1 as the code if it is not an encoded error message', () => {
    expect(decodeError('There was an error.')).toStrictEqual({
      message: 'There was an error.',
      code: -1,
    });
    expect(decodeError('There was an error{(100)}.')).toStrictEqual({
      message: 'There was an error{(100)}.',
      code: -1,
    });
  });

  test('can decode the correct error code even if there appear to be multiple', () => {
    expect(decodeError(
      encodeError(`This is an error within an ${encodeError('This is a nested error', 'INVALID')}`, 'CORRECT_ERROR'),
    )).toStrictEqual({
      message: `This is an error within an This is a nested error${wrapCode('INVALID')}`,
      code: 'CORRECT_ERROR',
    });
    expect(decodeError(
      encodeError(`This is an error within a nested ${CODE_WRAPPER.prefix}`, 'CORRECT_ERROR'),
    )).toStrictEqual({
      message: `This is an error within a nested ${CODE_WRAPPER.prefix}`,
      code: 'CORRECT_ERROR',
    });
    expect(decodeError(
      encodeError(`This is an error within a nested ${CODE_WRAPPER.suffix}`, 'CORRECT_ERROR'),
    )).toStrictEqual({
      message: `This is an error within a nested ${CODE_WRAPPER.suffix}`,
      code: 'CORRECT_ERROR',
    });
    expect(decodeError(
      encodeError(`This is an error ${CODE_WRAPPER.prefix}within a nested${CODE_WRAPPER.suffix}`, 123456),
    )).toStrictEqual({
      message: `This is an error ${CODE_WRAPPER.prefix}within a nested${CODE_WRAPPER.suffix}`,
      code: 123456,
    });
  });
});





describe('isEncodedError', () => {
  test('can identify an encoded error from a string', () => {
    expect(isEncodedError(encodeError('There was an error.', 100))).toBe(true);
    expect(isEncodedError('There was an error.')).toBe(false);
    expect(isEncodedError(encodeError('There was an error.', -1))).toBe(false);
  });

  test('can identify an encoded error from an error instance', () => {
    expect(isEncodedError(new Error(encodeError('There was an error.', 100)))).toBe(true);
    expect(isEncodedError(new Error('There was an error.'))).toBe(false);
  });
});
