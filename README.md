# Error Message Utils

`error-message-utils` helps TypeScript and JavaScript apps turn unknown errors into a
consistent shape:

- a readable message
- a stable error code
- optional extra data

Use `Exception` for most application code. Use `encodeError` and `decodeError` when you need to
send or receive an error code inside a plain string.

## Install

```bash
npm i -S error-message-utils
```

## Recommended Usage: Exception

`Exception` is an `Error` subclass that stores a normalized message, a code, and optional data.

```typescript
import { Exception } from 'error-message-utils';

throw new Exception('The provided email is already in use.', 'EMAIL_EXISTS', {
  field: 'email',
});
```

```typescript
const exception = new Exception('Request failed', 'REQUEST_FAILED');

exception instanceof Error; // true
exception instanceof Exception; // true
exception.name; // 'Exception'
exception.message; // 'Request failed'
exception.code; // 'REQUEST_FAILED'
exception.data; // null
exception.toString(); // 'Request failed{(REQUEST_FAILED)}'
exception.toRecord();
// {
//   message: 'Request failed',
//   code: 'REQUEST_FAILED',
//   data: null,
// }
```

### Wrap Unknown Errors

When you catch an unknown error, pass it to `Exception`. The package will extract the best message
and code it can find.

```typescript
import { Exception } from 'error-message-utils';

try {
  await sendReceiptEmail();
} catch (error) {
  throw new Exception(error, 'RECEIPT_EMAIL_FAILED', {
    operation: 'sendReceiptEmail',
  });
}
```

### Extend Exception

Create small domain-specific exception classes when your app has a stable set of error codes.

```typescript
import { Exception } from 'error-message-utils';

const USER_ERROR_CODES = {
  EmailTaken: 'USER_EMAIL_TAKEN',
  Unauthorized: 'USER_UNAUTHORIZED',
} as const;

type IUserErrorCode = (typeof USER_ERROR_CODES)[keyof typeof USER_ERROR_CODES];

export class UserException extends Exception {
  public constructor(message: string, code: IUserErrorCode, data?: unknown) {
    super(message, code, data);
    this.name = 'UserException';
  }
}

throw new UserException(
  'The provided email is already in use.',
  USER_ERROR_CODES.EmailTaken,
  { field: 'email' },
);
```

## Common Tasks

### Extract a Message

`extractMessage` accepts any value and returns the best readable message it can find.

```typescript
import { extractMessage } from 'error-message-utils';

extractMessage(
  new Error('Top level error', {
    cause: new Error('First nested cause', {
      cause: new Error('Second nested cause'),
    }),
  }),
);
// 'Top level error; [CAUSE]: First nested cause; [CAUSE]: Second nested cause'

extractMessage({
  message: {
    err: {
      message: 'This error message is nested deeply!',
    },
  },
});
// 'This error message is nested deeply!'
```

Zod errors are formatted with their first issue message and path.

```typescript
import { z } from 'zod';
import { extractMessage } from 'error-message-utils';

const result = z.object({ name: z.string() }).safeParse({ name: 123 });

if (!result.success) {
  extractMessage(result.error);
  // 'Invalid input: expected string, received number (name)'
}
```

### Get an Error Code

Use `getErrorCode` when you only need the resolved code.

```typescript
import { Exception, getErrorCode } from 'error-message-utils';

const exception = new Exception('Access denied', 'ACCESS_DENIED');

getErrorCode(exception); // 'ACCESS_DENIED'
getErrorCode('Access denied'); // null
```

Use `hasErrorCode` when you want a direct boolean check.

```typescript
import { Exception, hasErrorCode } from 'error-message-utils';

const exception = new Exception('Access denied', 'ACCESS_DENIED');

hasErrorCode(exception, 'ACCESS_DENIED'); // true
hasErrorCode(exception, 'PAYMENT_FAILED'); // false
```

### Encode and Decode Plain Strings

`encodeError` and `decodeError` are lower-level helpers for systems that can only pass string
messages.

```typescript
import { decodeError, encodeError } from 'error-message-utils';

const encodedError = encodeError(
  'The provided email is already in use.',
  'EMAIL_EXISTS',
);

encodedError;
// 'The provided email is already in use.{(EMAIL_EXISTS)}'

decodeError(encodedError);
// {
//   message: 'The provided email is already in use.',
//   code: 'EMAIL_EXISTS',
//   data: null,
// }
```

### Detect Resolved Codes with isEncodedError

`isEncodedError` returns `true` when an error resolves to a non-default code. For direct code
inspection, prefer `getErrorCode` or `hasErrorCode`.

```typescript
import { encodeError, isEncodedError } from 'error-message-utils';

isEncodedError('Some random unencoded error'); // false
isEncodedError(new Error('Some random unencoded error')); // false
isEncodedError(encodeError('Some unknown error.', 'UNKNOWN_ERROR')); // true
```

### Check the Default Message

Use `isDefaultErrorMessage` to detect the fallback message returned when no useful message can be
extracted.

```typescript
import { DEFAULT_MESSAGE, isDefaultErrorMessage } from 'error-message-utils';

isDefaultErrorMessage(DEFAULT_MESSAGE); // true
isDefaultErrorMessage(`${DEFAULT_MESSAGE} More details.`); // true
isDefaultErrorMessage(`${DEFAULT_MESSAGE} More details.`, true); // false
```

## Public API

Import public items from the package root:

```typescript
import {
  DEFAULT_CODE,
  DEFAULT_MESSAGE,
  Exception,
  decodeError,
  encodeError,
  extractMessage,
  getErrorCode,
  hasErrorCode,
  isDefaultErrorMessage,
  isEncodedError,
  type IDecodedError,
  type IErrorCode,
  type IErrorCodeCarrier,
  type IExceptionRecord,
} from 'error-message-utils';
```

### Classes

| Export | Description |
| --- | --- |
| `Exception` | An `Error` subclass that normalizes an unknown error into `message`, `code`, and `data`. It can also serialize itself with `toString()` or `toRecord()`. |

### Functions

| Export | Signature | Description |
| --- | --- | --- |
| `extractMessage` | `(error: unknown) => string` | Extracts the best readable message from strings, `Error` instances, nested error-like objects, `Error.cause` chains, arrays, plain objects, and Zod errors. Returns `DEFAULT_MESSAGE` when no useful message can be extracted. |
| `encodeError` | `(error: unknown, code: IErrorCode) => string` | Extracts a message from `error` and appends the wrapped code at the end of the message. |
| `decodeError` | `(error: unknown) => IDecodedError` | Extracts a message, resolves a code from an encoded message or code-carrying object, and returns `{ message, code, data }`. |
| `isEncodedError` | `(error: unknown) => boolean` | Returns `true` when `decodeError(error).code` resolves to a non-default code. |
| `getErrorCode` | `(error: unknown) => IErrorCode \| null` | Returns the resolved non-default code, or `null` when no non-default code is found. |
| `hasErrorCode` | `(error: unknown, code: IErrorCode) => boolean` | Checks whether an error resolves to the provided code. Raw code values are compared with strict equality. |
| `isDefaultErrorMessage` | `(value: string, fullMatch?: boolean) => boolean` | Checks whether a string contains `DEFAULT_MESSAGE`. Pass `true` as the second argument to require an exact match. |

### Types

```typescript
type IErrorCode = string | number;

type IDecodedError = {
  message: string;
  code: IErrorCode;
  data: unknown | null;
};

type IErrorCodeCarrier = {
  code: IErrorCode;
} & Record<string, unknown>;

type IExceptionRecord = {
  message: string;
  code: IErrorCode;
  data: unknown | null;
};
```

| Export | Description |
| --- | --- |
| `IErrorCode` | The supported type for application error codes. |
| `IDecodedError` | The object returned by `decodeError`. |
| `IErrorCodeCarrier` | A plain object shape that can provide a code to `decodeError`, `getErrorCode`, `hasErrorCode`, and `Exception`. |
| `IExceptionRecord` | The serializable object returned by `Exception.toRecord()`. |

### Constants

```typescript
const DEFAULT_CODE = -1;

const DEFAULT_MESSAGE =
  'The error message could not be extracted, check the logs for more information.';
```

| Export | Description |
| --- | --- |
| `DEFAULT_CODE` | The fallback code used when no code can be resolved. |
| `DEFAULT_MESSAGE` | The fallback message used when no readable message can be extracted. |

## Running Tests

```bash
npm test
```

## License

[MIT](https://choosealicense.com/licenses/mit/)
