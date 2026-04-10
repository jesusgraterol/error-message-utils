/* eslint-disable no-console */
import { IErrorCode, IDecodedError } from './shared/types.js';
import { DEFAULT_CODE, DEFAULT_MESSAGE } from './shared/constants.js';
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

  // constants
  DEFAULT_MESSAGE,
  DEFAULT_CODE,

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
