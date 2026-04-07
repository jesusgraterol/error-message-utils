/* eslint-disable no-console */
import { ZodError } from 'zod';
import { IErrorCode, IDecodedError } from '../shared/types.js';
import { DEFAULT_CODE, DEFAULT_MESSAGE } from '../shared/constants.js';
import { wrapCode, unwrapCode } from '../utils/index.js';

/* ************************************************************************************************
 *                                         IMPLEMENTATION                                         *
 ************************************************************************************************ */

/**------------------------------------------------------------------------------------------------
 * Zod specific errors
 -------------------------------------------------------------------------------------------------*/

/**
 * Attempts to extract the path from a ZodError instance. If unable to do so, it returns
 * 'Unknown path'.
 * @param error The ZodError instance to extract the path from.
 * @returns The extracted path.
 */
const __extractPathFromZodError = (error: ZodError): string => {
  if (
    error &&
    Array.isArray(error.issues) &&
    error.issues.length &&
    Array.isArray(error.issues[0].path) &&
    error.issues[0].path.length
  ) {
    return error.issues[0].path.join('.');
  }
  return 'Unknown path';
};

/**
 * Attempts to extract a Zod error message from a ZodError instance. If unable to do so, it returns
 * the default error message.
 * @param error The ZodError instance to extract the message from.
 * @returns The extracted error message or the default message.
 */
const __extractZodErrorMessage = (error: ZodError): string => {
  if (
    error &&
    Array.isArray(error.issues) &&
    error.issues.length &&
    Array.isArray(error.issues[0].path) &&
    error.issues[0].message
  ) {
    return `${error.issues[0].message} (${__extractPathFromZodError(error)})`;
  }
  return DEFAULT_MESSAGE;
};

/**------------------------------------------------------------------------------------------------
 * General errors
 -------------------------------------------------------------------------------------------------*/

/**
 * Attempts to extract an error message from an error that could be anything. If it fails to do so,
 * it returns the default message.
 * @param error The error to extract the message from.
 * @returns A string containing the extracted message or the default message if extraction fails.
 */
const extractMessage = (error: any): string => {
  // if the error is a string, return it as is
  if (typeof error === 'string' && error.length) {
    return error;
  }

  // if it is a ZodError, extract the message
  if (error instanceof ZodError) {
    return __extractZodErrorMessage(error);
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
    if (error.reason) {
      return extractMessage(error.reason);
    }
    if (error.reasons) {
      return extractMessage(error.reasons);
    }
    if (error.issue) {
      return extractMessage(error.issue);
    }
    if (error.issues) {
      return extractMessage(error.issues);
    }
    if (error.data) {
      return extractMessage(error.data);
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

/**------------------------------------------------------------------------------------------------
 * Encoding
 -------------------------------------------------------------------------------------------------*/

/**
 * Given an error in any format, it extracts the message and inserts the code at the end.
 * @param error The error to be encoded, can be of any type.
 * @param code The error code to be wrapped and appended to the message.
 * @returns A string containing the encoded error message.
 */
const encodeError = (error: any, code: IErrorCode): string =>
  `${extractMessage(error)}${wrapCode(code)}`;

/**
 * Given an error, it will extract the encoded message and attempt to decode it. If successful,
 * it separates the error message from the code so it can be shown directly to the user.
 * @param error The error to be decoded, can be of any type.
 * @returns The decoded error, containing the message and the code.
 */
const decodeError = (error: any): IDecodedError => {
  const encodedErrorMessage = extractMessage(error);
  const { code, startsAt } = unwrapCode(encodedErrorMessage);
  return {
    message: startsAt > 0 ? encodedErrorMessage.slice(0, startsAt) : encodedErrorMessage,
    code,
  };
};

/**
 * Determines if a given error (in any format) is an error encoded by this package.
 * @param error The error to be checked, can be of any type.
 * @returns A boolean indicating whether the error is an encoded error or not.
 */
const isEncodedError = (error: any): boolean => decodeError(error).code !== DEFAULT_CODE;

/**------------------------------------------------------------------------------------------------
 * Misc helpers
 -------------------------------------------------------------------------------------------------*/

/**
 * Verifies if a value matches the default error message used by this package.
 * @param value The value to be checked.
 * @param fullMatch Whether to check for an exact match or a partial match.
 * @returns A boolean indicating whether the value matches the default error message.
 */
const isDefaultErrorMessage = (value: string, fullMatch: boolean = false): value is string =>
  fullMatch
    ? value === DEFAULT_MESSAGE
    : typeof value === 'string' && value.includes(DEFAULT_MESSAGE);

/* ************************************************************************************************
 *                                        MODULE EXPORTS                                          *
 ************************************************************************************************ */
export {
  // types
  type IErrorCode,
  type IDecodedError,

  // error message extraction
  extractMessage,

  // encoding
  encodeError,
  decodeError,
  isEncodedError,

  // misc helpers
  isDefaultErrorMessage,
};
