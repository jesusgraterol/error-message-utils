import { IErrorCodeWrapper, IErrorCode, IUnwrappedErrorCode } from './types.js';

/* ************************************************************************************************
 *                                           CONSTANTS                                            *
 ************************************************************************************************ */

// the wrapper that will be used for error codes
const CODE_WRAPPER: IErrorCodeWrapper = {
  prefix: '{(',
  suffix: ')}',
};

// the default message if none can be extracted
const DEFAULT_MESSAGE: string = 'The error message could not be extracted, check the logs for more information.';

// the default code if none was provided or could not be extracted
const DEFAULT_CODE: IErrorCode = -1;





/* ************************************************************************************************
 *                                            HELPERS                                             *
 ************************************************************************************************ */

/**
 * Wraps a given error code. If none is provided, it wraps the default code.
 * @param code
 * @returns string
 */
const wrapCode = (code: IErrorCode): string => `${CODE_WRAPPER.prefix}${code ?? DEFAULT_CODE}${CODE_WRAPPER.suffix}`;

/**
 * Checks if a given error is an encoded message.
 * @param message
 * @returns boolean
 */
const __isEncodedError = (message: string): boolean => {
  let regex: string = `${CODE_WRAPPER.prefix}.+${CODE_WRAPPER.suffix}$`;
  // eslint-disable-next-line no-useless-escape
  regex = regex.replace('(', '\\(');
  // eslint-disable-next-line no-useless-escape
  regex = regex.replace(')', '\\)');
  return new RegExp(regex).test(message);
};

/**
 * Verifies if a given string is numeric.
 * @param code
 * @returns boolean
 */
const __isNumeric = (code: string) => !Number.isNaN(Number.parseFloat(code));

/**
 * Verifies if a message is an encoded error and if so, attempts to extract the code.
 * If unsuccessful, both code and startsAt values will be -1.
 * @param message
 * @returns IUnwrappedErrorCode
 */
const unwrapCode = (message: string): IUnwrappedErrorCode => {
  if (__isEncodedError(message)) {
    const startsAt = message.indexOf(CODE_WRAPPER.prefix);
    const code = message.substring(startsAt + 2, message.lastIndexOf(CODE_WRAPPER.suffix));
    return {
      code: __isNumeric(code) ? Number(code) : code,
      startsAt,
    };
  }
  return { code: -1, startsAt: -1 };
};





/* ************************************************************************************************
 *                                        MODULE EXPORTS                                          *
 ************************************************************************************************ */
export {
  // constants
  CODE_WRAPPER,
  DEFAULT_MESSAGE,
  DEFAULT_CODE,
  wrapCode,
  unwrapCode,
};
