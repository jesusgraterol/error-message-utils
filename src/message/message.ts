import { IErrorCode, IDecodedError } from '../shared/index.js';
import {
  DEFAULT_MESSAGE,
  wrapCode,
  unwrapCode,
} from './message.utils.js';

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

  // if it is an instance of an error, check if there is a cause and handle it recursively.
  // Otherwise, just return the message
  if (error instanceof Error && error.message) {
    if (error.cause) {
      return `${error.message}; [CAUSE]: ${extractMessage(error.cause)}`;
    }
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
      console.error('Error during extractMessage:');
      console.error('Original Error: ', error);
      console.error('JSON.stringify Error:', e);
    }
  }

  // if none could be extracted, return the default
  return DEFAULT_MESSAGE;
};

/**
 * Given an error in any format, it extracts the message and inserts the code at the end.
 * @param error
 * @param code
 * @returns string
 */
const encodeError = (error: any, code: IErrorCode): string => `${extractMessage(error)}${wrapCode(code)}`;

/**
 * Given an error, it will extract the encoded message and attempt to decode it. If successful,
 * it separates the error message from the code so it can be shown directly to the user.
 * @param error
 * @returns IDecodedError
 */
const decodeError = (error: any): IDecodedError => {
  const encodedErrorMessage = extractMessage(error);
  const { code, startsAt } = unwrapCode(encodedErrorMessage);
  return {
    message: startsAt > 0 ? encodedErrorMessage.slice(0, startsAt) : encodedErrorMessage,
    code,
  };
};





/* ************************************************************************************************
 *                                        MODULE EXPORTS                                          *
 ************************************************************************************************ */
export {
  extractMessage,
  encodeError,
  decodeError,
};
