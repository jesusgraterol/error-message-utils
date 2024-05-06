/**
 * Error Code Wrapper
 * When an error code is inserted into a message (encoding a message), it must be wrapped first so
 * it can be decoded later.
 */
interface IErrorCodeWrapper {
  prefix: string,
  suffix: string,
}

/**
 * Error Code
 * The error's code that is inserted when encoding an error. If none is provided or none can be
 * extracted, it defaults to -1.
 */
type IErrorCode = string | number;

/**
 * Decoded Error
 * The object obtained when an error is decoded. Keep in mind that if the error message or the code
 * cannot be extracted for any reason, the default values will be set instead.
 */
interface IDecodedError {
  message: string,
  code: IErrorCode,
}





/* ************************************************************************************************
 *                                        MODULE EXPORTS                                          *
 ************************************************************************************************ */
export {
  IErrorCodeWrapper,
  IErrorCode,
  IDecodedError,
};
