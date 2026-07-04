// shared
export { IErrorCode, IDecodedError, IErrorCodeCarrier } from './shared/types.js';
export { DEFAULT_CODE, DEFAULT_MESSAGE } from './shared/constants.js';

// error handler
export {
  extractMessage,
  encodeError,
  decodeError,
  isEncodedError,
  isErrorCodeCarrier,
  hasErrorCode,
  isDefaultErrorMessage,
} from './error-handler/index.js';

// exception
export { type IExceptionRecord, Exception } from './exception/index.js';
