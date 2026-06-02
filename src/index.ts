// shared
export { IErrorCode, IDecodedError } from './shared/types.js';
export { DEFAULT_CODE, DEFAULT_MESSAGE } from './shared/constants.js';

// error handler
export {
  decodeError,
  encodeError,
  extractMessage,
  isDefaultErrorMessage,
  isEncodedError,
} from './error-handler/index.js';

// exception
export { type IExceptionRecord, Exception } from './exception/index.js';
