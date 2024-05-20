# Error Message Utils

The `error-message-utils` package simplifies error management in your web applications and RESTful APIs. It ensures consistent and scalable handling of error messages, saving you time and effort.  Moreover, it gives you the ability to assign custom error codes so all possible cases can be handled accordingly.





</br>

## Getting Started

Install the package:
```bash
$ npm install -S error-message-utils
```





</br>

## Usage

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

Decoding an error:
```typescript
import { decodeError } from 'error-message-utils';

decodeError('The provided email is already in use.{(EMAIL_EXISTS)}');
// {
//   message: 'The provided email is already in use.',
//   code: 'EMAIL_EXISTS'
// }
```

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

## Built With

- TypeScript




<br/>

## Running the Tests

```bash
$ npm run test:unit
```





<br/>

## License

[MIT](https://choosealicense.com/licenses/mit/)





<br/>

## Acknowledgments

- ...





<br/>

## @TODOS

- [ ] ...





<br/>

## Deployment

Install dependencies:
```bash
$ npm install
```


Build the library:
```bash
$ npm start
```


Publish to `npm`:
```bash
$ npm publish
```
