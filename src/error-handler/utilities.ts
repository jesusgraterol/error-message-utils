import { ZodError } from 'zod';
import { DEFAULT_MESSAGE } from '../shared/constants.js';

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
