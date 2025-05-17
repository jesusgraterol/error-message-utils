# Error Message Utils

The `error-message-utils` package simplifies error management in your web applications and RESTful APIs. It ensures consistent and scalable handling of error messages, saving you time and effort.  Moreover, it gives you the ability to assign custom error codes so all possible cases can be handled accordingly.





</br>

## Getting Started

Install the package:
```bash
npm install -S error-message-utils
```

### Examples

Encoding an error:

```typescript
import { encodeError } from 'error-message-utils';

if (emailExists()) {
  throw new Error(encodeError(
    'The provided email is already in use.', 
    'EMAIL_EXISTS'
  ));
  // 'The provided email is already in use.{(EMAIL_EXISTS)}'
}
```


<br/>

Decoding an error:

```typescript
import { decodeError } from 'error-message-utils';

decodeError('The provided email is already in use.{(EMAIL_EXISTS)}');
// {
//   message: 'The provided email is already in use.',
//   code: 'EMAIL_EXISTS'
// }
```


<br/>

Error messages can be extracted recursively from complex structures, including nested `cause` data properties from `Error` instances:

```typescript
import { extractMessage } from 'error-message-utils';

extractMessage(new Error('Top level error', {
  cause: new Error('First nested cause', {
    cause: new Error('Second nested cause'),
  }),
}));
// 'Top level error; [CAUSE]: First nested cause; [CAUSE]: Second nested cause'


extractMessage({ 
  message: { 
    err: { 
      message: 'This error message is nested deeply!'
    } 
  } 
});
// 'This error message is nested deeply!'
```


<br/>

Identifying encoded errors:

```typescript
import { isEncodedError, encodeError } from 'error-message-utils';

isEncodedError('Some random unencoded error');
// false

isEncodedError(new Error('Some random unencoded error'));
// false

isEncodedError(encodeError('Some unknown error.', 'NASTY_ERROR'));
// true

isEncodedError(encodeError(new Error('Some unknown error.'), 'NASTY_ERROR'));
// true
```


<br/>

In some cases, you may want to check whether the extracted error matches the default message provided by this package:

```typescript
import { isDefaultErrorMessage} from 'error-message-utils';

const DEFAULT_MESSAGE: string = 'The error message could not be extracted, check the logs for more information.';

isDefaultErrorMessage(DEFAULT_MESSAGE);
// true

isDefaultErrorMessage(`${DEFAULT_MESSAGE} and something else...`);
// false

isDefaultErrorMessage(`${DEFAULT_MESSAGE} and something else...`, true);
// true
```




<br/>

## Types

```typescript
/**
 * Error Code
 * The code that is inserted when encoding an error. If none is provided or none can be extracted, it defaults to -1.
 */
type IErrorCode = string | number;

/**
 * Decoded Error
 * The object obtained when an error is decoded. Keep in mind that if the error message or the code cannot be extracted for any reason, the default values will be set instead.
 */
type IDecodedError = {
  message: string,
  code: IErrorCode,
};
```



<br/>

## Built With

- TypeScript




<br/>

## Running the Tests

```bash
npm run test:unit
```





<br/>

## License

[MIT](https://choosealicense.com/licenses/mit/)





<br/>

## Deployment

Install dependencies:
```bash
npm install
```


Build the library:
```bash
npm start
```


Publish to `npm`:
```bash
npm publish
```
