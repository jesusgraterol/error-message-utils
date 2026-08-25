import { ZodError } from 'zod';

import { IErrorCode, IErrorCodeCarrier } from '../shared/types.js';
import { DEFAULT_CODE, DEFAULT_MESSAGE } from '../shared/constants.js';

/**
 * message redaction helpers
 */

const REDACTION_REPLACEMENT = '[redacted]';

// index range containing sensitive message content
type IMessageRange = {
  start: number;
  end: number;
};

/**
 * Collects every occurrence range for the provided sensitive values, including overlaps.
 * @param message The message to inspect.
 * @param sensitiveValues The exact case-sensitive values to locate.
 * @returns The ranges containing sensitive message content.
 */
const __collectSensitiveRanges = (
  message: string,
  sensitiveValues: readonly string[],
): IMessageRange[] => {
  const sensitiveRanges: IMessageRange[] = [];

  sensitiveValues.forEach((sensitiveValue) => {
    let matchStart = message.indexOf(sensitiveValue);

    while (matchStart !== -1) {
      sensitiveRanges.push({
        start: matchStart,
        end: matchStart + sensitiveValue.length,
      });
      matchStart = message.indexOf(sensitiveValue, matchStart + 1);
    }
  });

  return sensitiveRanges;
};

/**
 * Merges overlapping sensitive ranges without combining adjacent independent ranges.
 * @param sensitiveRanges The ranges to merge.
 * @returns The sorted non-overlapping sensitive ranges.
 */
const __mergeOverlappingRanges = (sensitiveRanges: readonly IMessageRange[]): IMessageRange[] => {
  const sortedSensitiveRanges = [...sensitiveRanges].sort(
    (firstRange, secondRange) =>
      firstRange.start - secondRange.start || secondRange.end - firstRange.end,
  );
  const mergedSensitiveRanges: IMessageRange[] = [];

  sortedSensitiveRanges.forEach((currentRange) => {
    const previousRange = mergedSensitiveRanges.at(-1);

    if (!previousRange || currentRange.start >= previousRange.end) {
      mergedSensitiveRanges.push({ ...currentRange });
      return;
    }

    if (currentRange.end > previousRange.end) {
      previousRange.end = currentRange.end;
    }
  });

  return mergedSensitiveRanges;
};

/**
 * Replaces every literal sensitive value in a message with the redaction marker.
 * @param message The message to redact.
 * @param sensitiveValues The exact case-sensitive values to redact.
 * @returns The message with matching sensitive values redacted.
 */
export const redactSensitiveValues = (message: string, sensitiveValues: string[]): string => {
  const uniqueSensitiveValues = [
    ...new Set(sensitiveValues.filter((sensitiveValue) => sensitiveValue.length > 0)),
  ];

  if (!uniqueSensitiveValues.length) {
    return message;
  }

  const sensitiveRanges = __mergeOverlappingRanges(
    __collectSensitiveRanges(message, uniqueSensitiveValues),
  );

  if (!sensitiveRanges.length) {
    return message;
  }

  const redactedMessageParts: string[] = [];
  let nextMessageIndex = 0;

  sensitiveRanges.forEach((sensitiveRange) => {
    redactedMessageParts.push(
      message.slice(nextMessageIndex, sensitiveRange.start),
      REDACTION_REPLACEMENT,
    );
    nextMessageIndex = sensitiveRange.end;
  });
  redactedMessageParts.push(message.slice(nextMessageIndex));

  return redactedMessageParts.join('');
};

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
