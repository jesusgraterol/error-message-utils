import {
  CODE_WRAPPER,
  wrapCode,
} from './message.utils.js';

describe('wrapCode', () => {
  beforeAll(() => { });

  afterAll(() => { });

  beforeEach(() => { });

  afterEach(() => { });

  test('can wrap a code in number format', () => {
    expect(wrapCode(0)).toBe(`${CODE_WRAPPER.prefix}0${CODE_WRAPPER.suffix}`);
    expect(wrapCode(123)).toBe(`${CODE_WRAPPER.prefix}123${CODE_WRAPPER.suffix}`);
  });

  test('can wrap a code in string format', () => {
    expect(wrapCode('UNKNOWN_ERROR')).toBe(`${CODE_WRAPPER.prefix}UNKNOWN_ERROR${CODE_WRAPPER.suffix}`);
  });

  test('if an invalid code is provided, it wraps the default code', () => {
    // @ts-ignore
    expect(wrapCode()).toBe(`${CODE_WRAPPER.prefix}-1${CODE_WRAPPER.suffix}`);
    // @ts-ignore
    expect(wrapCode(undefined)).toBe(`${CODE_WRAPPER.prefix}-1${CODE_WRAPPER.suffix}`);
    // @ts-ignore
    expect(wrapCode(null)).toBe(`${CODE_WRAPPER.prefix}-1${CODE_WRAPPER.suffix}`);
  });
});
