/* eslint-disable no-console */
import { ZodError } from 'zod';

import type { IErrorCode, IDecodedError, IErrorCodeCarrier } from '../shared/types.js';
import { DEFAULT_CODE, DEFAULT_MESSAGE } from '../shared/constants.js';
import { wrapCode, unwrapCode } from '../utils/index.js';
import { extractZodErrorMessage } from './utilities.js';

/**
 * General errors
 */

/**
 * Attempts to extract an error message from an error that could be anything. If it fails to do so,
 * it returns the default message.
 * @param error The error to extract the message from.
 * @returns A string containing the extracted message or the default message if extraction fails.
 */
export const extractMessage = (error: any): string => {
  // if the error is a string, return it as is
  if (typeof error === 'string' && error.length) {
    return error;
  }

  // if it is a ZodError, extract the message
  if (error instanceof ZodError) {
    return extractZodErrorMessage(error);
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

/**
 * Encoding / Decoding
 */

/**
 * Given an error in any format, it extracts the message and inserts the code at the end.
 * @param error The error to be encoded, can be of any type.
 * @param code The error code to be wrapped and appended to the message.
 * @returns A string containing the encoded error message.
 */
export const encodeError = (error: any, code: IErrorCode): string =>
  `${extractMessage(error)}${wrapCode(code)}`;

/**
 * Given an error, it will extract the encoded message and attempt to decode it. If successful,
 * it separates the error message from the code so it can be shown directly to the user.
 * @param error The error to be decoded, can be of any type.
 * @returns The decoded error, containing the message and the code.
 */
export const decodeError = (error: any): IDecodedError => {
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
export const isEncodedError = (error: any): boolean => decodeError(error).code !== DEFAULT_CODE;

/**
 * Misc helpers
 */

/**
 * Determines whether an unknown value has an inspectable error code property.
 * @param error The unknown value to inspect.
 * @returns True when the value can carry an Exception-style code.
 */
export const isErrorCodeCarrier = (error: unknown): error is IErrorCodeCarrier =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (typeof error.code === 'string' || typeof error.code === 'number');

/**
 * Checks if the given error matches the specified error code.
 * @param error The error to be checked, can be of any type.
 * @param code The error code to check against.
 * @returns A boolean indicating whether the error matches the specified code.
 */
export const hasErrorCode = (error: unknown, code: IErrorCode): boolean =>
  error !== null &&
  (error === code ||
    (isErrorCodeCarrier(error) && error.code === code) ||
    decodeError(error).code === code);

/**
 * Verifies if a value matches the default error message used by this package.
 * @param value The value to be checked.
 * @param fullMatch Whether to check for an exact match or a partial match.
 * @returns A boolean indicating whether the value matches the default error message.
 */
export const isDefaultErrorMessage = (
  value: string,
  fullMatch: boolean = false,
): value is string =>
  fullMatch
    ? value === DEFAULT_MESSAGE
    : typeof value === 'string' && value.includes(DEFAULT_MESSAGE);
