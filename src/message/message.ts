import { IErrorCode, IDecodedError } from './types.js';
import { DEFAULT_MESSAGE, wrapCode } from './message.utils.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**
 * Attempts to extract an error message from an error that could be anything. If it fails to do so,
 * it returns the default message.
 * @param error
 * @returns string
 */
const extractMessage = (error: any): string => {
  // if the error is a string, return it as is
  if (typeof error === 'string' && error.length) {
    return error;
  }

  // if it is an instance of an error, check if there is a cause and handle it recursively
  if (error instanceof Error && error.message) {
    if (error.cause) {
      return `${error.message}; [CAUSE]: ${extractMessage(error.cause)}`;
    }

    // otherwise, just return the message
    return error.message;
  }

  // if it is an object, check common property names and feed them back into the function if there
  // is a match. Otherwise, attempt to stringify the entire object.
  if (error && typeof error === 'object') {
    if (error.message) {
      return extractMessage(error.message);
    }
    if (error.msg) {
      return extractMessage(error.msg);
    }
    if (error.error) {
      return extractMessage(error.error);
    }
    if (error.err) {
      return extractMessage(error.err);
    }
    if (error.errors) {
      return extractMessage(error.errors);
    }
    if (error.errs) {
      return extractMessage(error.errs);
    }
    try {
      return JSON.stringify(error);
    } catch (e) {
      console.error('Original Error: ', error);
      console.error('JSON.stringify Error:', e);
    }
  }

  // if none could be extracted, return the default
  return DEFAULT_MESSAGE;
};


/**
 * Encodes an error.
 * @param error
 * @param code
 * @returns string
 */
const encodeError = (error: any, code: IErrorCode): string => `${extractMessage(error)}${wrapCode(code)}`;


const decodeError = (message: string): IDecodedError => {
  return { message: '', code: '' }
};





/* ************************************************************************************************
 *                                        MODULE EXPORTS                                          *
 ************************************************************************************************ */
export {
  extractMessage,
  encodeError,
  decodeError,
};
