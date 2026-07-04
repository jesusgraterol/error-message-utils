import { IErrorCode, IUnwrappedErrorCode } from '../shared/types.js';
import { CODE_WRAPPER, DEFAULT_CODE } from '../shared/constants.js';

/**
 * Wraps a given error code. If none is provided, it wraps the default code.
 * @param code The error code to wrap.
 * @returns A string containing the wrapped error code.
 */
export const wrapCode = (code: IErrorCode): string =>
  `${CODE_WRAPPER.prefix}${code ?? DEFAULT_CODE}${CODE_WRAPPER.suffix}`;

/**
 * Checks if a given error is an encoded message.
 * @param message The message to check.
 * @returns A boolean indicating whether the message is an encoded error or not.
 */
const __isEncodedError = (message: string): boolean => {
  const startsAt = message.lastIndexOf(CODE_WRAPPER.prefix);
  const codeStartsAt = startsAt + CODE_WRAPPER.prefix.length;
  const codeEndsAt = message.length - CODE_WRAPPER.suffix.length;

  return startsAt >= 0 && codeStartsAt < codeEndsAt && message.endsWith(CODE_WRAPPER.suffix);
};

/**
 * Verifies if a given string is numeric.
 * @param code The string to check.
 * @returns A boolean indicating whether the string is numeric or not.
 */
const __isNumeric = (code: string) =>
  typeof code === 'string' && /^[-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(code);

/**
 * Verifies if a message is an encoded error and if so, attempts to extract the code.
 * If unsuccessful, both code and startsAt values will be -1.
 * @param message The message to unwrap.
 * @returns An object containing the unwrapped error code and its starting position.
 */
export const unwrapCode = (message: string): IUnwrappedErrorCode => {
  if (__isEncodedError(message)) {
    const startsAt = message.lastIndexOf(CODE_WRAPPER.prefix);
    const code = message.substring(
      startsAt + CODE_WRAPPER.prefix.length,
      message.lastIndexOf(CODE_WRAPPER.suffix),
    );
    return {
      code: __isNumeric(code) ? Number(code) : code,
      startsAt,
    };
  }
  return { code: DEFAULT_CODE, startsAt: -1 };
};
