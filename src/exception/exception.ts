import type { IErrorCode } from '../shared/types.js';
import { decodeError, encodeError } from '../error-handler/index.js';
import type { IErrorOptions, IExceptionRecord } from './types.js';

/**
 * Error subclass that normalizes unknown errors and supports native error options.
 */
export class Exception extends Error {
  // stable code callers can use for programmatic error handling
  public readonly code: IErrorCode;

  // optional context attached to the exception
  public readonly data: unknown;

  /**
   * Creates an exception from any supported error input.
   * @param error The unknown error or message to normalize.
   * @param code The optional code that overrides any decoded code.
   * @param data The optional data payload that overrides any decoded data.
   * @param options The native error options, including an optional cause.
   */
  constructor(error: unknown, code?: IErrorCode, data?: unknown, options?: IErrorOptions) {
    const decodedError = decodeError(error);

    super(decodedError.message, options);

    this.name = 'Exception';
    this.code = code ?? decodedError.code;
    this.data = data === undefined ? decodedError.data : data;
  }

  /**
   * Override the default toString method to return a formatted error message with the code.
   * @returns A string representation of the error with the code.
   */
  public override toString(): string {
    return encodeError(this.message, this.code);
  }

  /**
   * Override the default behavior for type conversion to return a formatted error message with the code.
   * @param hint The type hint for the conversion.
   * @returns A string representation of the error with the code or null for other types.
   */
  public [Symbol.toPrimitive](hint: string): string | null {
    if (hint === 'string' || hint === 'default') {
      return this.toString();
    }

    return null;
  }

  /**
   * Convert the exception to a record format.
   * @returns An object representing the exception with message, code, and data.
   */
  public toRecord(): IExceptionRecord {
    return {
      message: this.message,
      code: this.code,
      data: this.data ?? null,
    };
  }
}
