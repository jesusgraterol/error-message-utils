import { type IErrorCode } from '../shared/types.js';
import { encodeError, extractMessage } from '../error-handler/index.js';

export class Exception extends Error {
  public readonly code: IErrorCode;

  constructor(error: unknown, code: IErrorCode) {
    super(extractMessage(error));

    this.name = 'Exception';
    this.code = code;
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
}
