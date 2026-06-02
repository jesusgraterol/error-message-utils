import { IErrorCode } from '../shared/types.js';

// the record type for the Exception class
export type IExceptionRecord = {
  message: string;
  code: IErrorCode;
  data: unknown | null;
};
