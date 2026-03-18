import { IErrorCode, IErrorCodeWrapper } from './types.js';

// the wrapper that will be used for error codes
export const CODE_WRAPPER: IErrorCodeWrapper = {
  prefix: '{(',
  suffix: ')}',
};

// the default message if none can be extracted
export const DEFAULT_MESSAGE: string =
  'The error message could not be extracted, check the logs for more information.';

// the default code if none was provided or could not be extracted
export const DEFAULT_CODE: IErrorCode = -1;
