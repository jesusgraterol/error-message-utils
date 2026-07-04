import { ZodError } from 'zod';

import { IErrorCode, IErrorCodeCarrier } from '../shared/types.js';
import { DEFAULT_CODE, DEFAULT_MESSAGE } from '../shared/constants.js';

/**
 * Zod error helpers
 */

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
export const extractZodErrorMessage = (error: ZodError): string => {
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

/**
 * Error code helpers
 */

/**
 * Determines whether an unknown value has an inspectable error code property.
 * @param error The unknown value to inspect.
 * @returns True when the value can carry an Exception-style code.
 */
const __isErrorCodeCarrier = (error: unknown): error is IErrorCodeCarrier =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (typeof error.code === 'string' || typeof error.code === 'number');

/**
 * Resolves the decoded error code from the unwrapped message code or an Exception-style object.
 * @param error The unknown error object to inspect.
 * @param unwrappedCode The code unwrapped from the extracted error message.
 * @returns The decoded error code or the default code.
 */
export const getDecodedErrorCode = (error: unknown, unwrappedCode: IErrorCode): IErrorCode => {
  if (unwrappedCode !== DEFAULT_CODE) {
    return unwrappedCode;
  }

  if (__isErrorCodeCarrier(error)) {
    return error.code;
  }

  return DEFAULT_CODE;
};
