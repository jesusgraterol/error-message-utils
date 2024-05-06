import { DEFAULT_MESSAGE } from './message.utils.js';
import {
  extractMessage,
  encodeError,
} from './message.js';



describe('extractMessage', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

  afterEach(() => { });

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
    expect(extractMessage({ message: { err: { message: 'Oh my god! So so nested :)' } } })).toBe('Oh my god! So so nested :)');
  });
});
