import {
  IErrorCodeWrapper,
  IErrorCode,
} from './types.js';

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
const wrapCode = (code: IErrorCode): string => `${CODE_WRAPPER.prefix}${code ?? DEFAULT_CODE}})${CODE_WRAPPER.suffix}`;







/* ************************************************************************************************
 *                                        MODULE EXPORTS                                          *
 ************************************************************************************************ */
export {
  // constants
  CODE_WRAPPER,
  DEFAULT_MESSAGE,
  DEFAULT_CODE,
  wrapCode,
};
