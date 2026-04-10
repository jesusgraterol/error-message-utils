import { type IErrorCode } from '../shared/types.js';
import { decodeError, encodeError } from '../error-handler/index.js';

export class Exception extends Error {
  // the code of the error
  public readonly code: IErrorCode;

  constructor(error: unknown, code?: IErrorCode) {
    // decode the error to extract the message and the code (if any)
    const decodedError = decodeError(error);

    // call the super constructor with the decoded message
    super(decodedError.message);

    // init props
    this.name = 'Exception';
    this.code = code ?? decodedError.code;
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
