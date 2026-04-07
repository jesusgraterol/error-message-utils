/* eslint-disable no-console */
import { IErrorCode, IDecodedError } from './shared/types.js';
import {
  decodeError,
  encodeError,
  extractMessage,
  isDefaultErrorMessage,
  isEncodedError,
} from './error-handler/index.js';
import { Exception } from './exception/index.js';

/**
 * Module exports
 */
export {
  // types
  type IErrorCode,
  type IDecodedError,

  // error message extraction
  extractMessage,

  // encoding
  encodeError,
  decodeError,
  isEncodedError,

  // misc helpers
  isDefaultErrorMessage,

  // exception class
  Exception,
};
