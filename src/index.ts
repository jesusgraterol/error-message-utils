// shared
export type { IErrorCode, IDecodedError, IErrorCodeCarrier } from './shared/types.js';
export { DEFAULT_CODE, DEFAULT_MESSAGE } from './shared/constants.js';

// error handler
export {
  extractMessage,
  extractRedactedMessage,
  encodeError,
  decodeError,
  isEncodedError,
  getErrorCode,
  hasErrorCodePrefix,
  hasErrorCode,
  isDefaultErrorMessage,
} from './error-handler/index.js';

// exception
export { type IErrorOptions, type IExceptionRecord, Exception } from './exception/index.js';
