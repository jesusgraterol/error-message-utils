import type { IErrorCode } from '../shared/types.js';

// native options supported by the Exception constructor
export type IErrorOptions = ErrorOptions;

// the record type for the Exception class
export type IExceptionRecord = {
  message: string;
  code: IErrorCode;
  data: unknown | null;
};
