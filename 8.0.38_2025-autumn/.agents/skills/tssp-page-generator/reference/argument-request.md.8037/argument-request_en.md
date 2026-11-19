# Request Object Reference

## Overview

Request is an object that holds request information from the client.
It is created for each browser request and is passed as an argument to the `init()` function of a function container or to action-bound functions.

```typescript
export function init(request: Request): void {
  // URL arguments can be accessed directly as properties
  let name: string = request['name'];

  // Or retrieved using getParameterValue() (null if not found)
  let nameValue: string | null = request.getParameterValue('name');
}
```

The type of `Request` is declared in `d.ts/platform/standard/im-ssjs-request.d.ts`. It has the index signature `[key: string]: Request.Attribute` (`Request.Attribute` is `any`) for reading URL arguments, so receive values read as properties in a typed variable. Writing a method name that is not in the declaration still passes type checking, so confirm method names in the table below or in the d.ts.

## Method List

### Parameter Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getParameterValue(key: string) | `string \| null` | Returns the first URL argument for the specified key. Returns `null` if not found |
| getParameterValues(key: string) | `string[]` | Returns all URL arguments for the specified key as an array. Returns an empty array if not found |
| getParameterNames() | `string[]` | Returns all request parameter names |
| getParameter(name: string) | `RequestParameter` | Returns the specified parameter as a RequestParameter. Returns `null` if not found |
| getParameters(name: string) | `RequestParameter[]` | Returns all values of the specified parameter as a RequestParameter array |

### Header Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getHeaderNames() | `string[]` | Returns an array of all header names |
| getHeader(name: string) | `string` | Returns the first value of the specified header. Returns `null` if not found |
| getHeaders(name: string) | `string[]` | Returns all values of the specified header as an array. Returns an empty array if not found |

### Cookie Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getCookieNames() | `string[] \| null` | Returns an array of all cookie names. Returns `null` if no cookies |
| getCookie(name: string) | `string \| null` | Returns the cookie value with the specified name. Returns `null` if not found |
| getCookies(name: string) | `string[]` | Returns all cookie values with the specified name as an array |

### Message Body Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getMessageBodyAsStream() | `string` | Returns binary data without character code conversion |
| getMessageBodyAsString() | `string` | Returns the message body converted to Unicode using the ServletRequest encoding |
| getMessageBody(encoding: string) | `string` | Returns the message body converted to Unicode using the specified encoding |
| openMessageBodyAsBinary(callback?: Function) | `ByteReader` | Returns binary data as a ByteReader |
| openMessageBodyAsText(callback?: Function, encoding?: string) | `TextReader` | Returns text data as a TextReader |

### Request Information

| Method | Return Value | Description |
|--------|-------------|-------------|
| getMethod() | `string` | Returns the HTTP method name (`GET`, `POST`, etc.) |
| getContentLength() | `number` | Returns the byte length of the message body. Returns `-1` if unknown |
| getContentType() | `string \| null` | Returns the MIME type of the request. Returns `null` if unknown |
| getQueryString() | `string \| null` | Returns the query string of the URL. Returns `null` if no query |

### Attribute Operations

| Method | Return Value | Description |
|--------|-------------|-------------|
| getAttributeNames() | `string[]` | Returns an array of available attribute names |
| getAttribute(name: string) | `Request.Attribute \| null` | Returns the specified attribute value. Returns `null` if not found |
| setAttribute(name: string, object: Request.Attribute) | `void` | Sets an attribute on the request |
| removeAttribute(name: string) | `void` | Removes an attribute from the request |

## Usage Examples

### Getting Parameters

```typescript
export function init(request: Request): void {
  // Getting a single value (null if not found)
  let userId: string | null = request.getParameterValue('user_id');

  // Direct property access is also possible
  let userIdProperty: string = request['user_id'];

  // Getting multiple values (checkboxes, etc.)
  let selectedIds: string[] = request.getParameterValues('selected_ids');
}
```

### Getting the JSON Body of a POST Request

```typescript
/** Shape of the JSON received by POST (define the fields to suit the purpose) */
interface RequestBody {
  userCode: string;             // User code
}

export function init(request: Request): void {
  if (request.getMethod() === 'POST') {
    let body: string = request.getMessageBodyAsString();
    // The return value of JSON.parse() is any, so receive it in a typed variable
    let data: RequestBody = JSON.parse(body);
  }
}
```

### Getting Headers and Cookies

```typescript
export function init(request: Request): void {
  let contentType: string | null = request.getHeader('Content-Type');
  let sessionId: string | null = request.getCookie('JSESSIONID');
}
```

### Passing Attributes

```typescript
/** Processing result passed by request attributes */
interface ProcessResult {
  status: string;               // Status of the processing result
}

export function init(request: Request): void {
  request.setAttribute('processResult', {status: 'success'});

  // The return value of getAttribute() is Request.Attribute (any), so receive it in a typed variable
  let result: ProcessResult | null = request.getAttribute('processResult');
}
```

## RequestParameter Object

An object that can be obtained with `request.getParameter(name)` / `request.getParameters(name)`.
Holds information related to uploaded files and request data.

### Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| getName() | `string` | Get the parameter name |
| getValue() | `string` | Get the parameter value (after character code conversion) |
| getLength() | `number` | Get the data length (bytes) |
| getFileName() | `string \| null` | The file name of the uploaded file. Returns `null` for non-file parameters |
| getHeaderNames() | `string[] \| null` | Header name list. Returns `null` if no headers |
| getHeader(name: string) | `string` | Get the value of the specified header name |
| openValueAsBinary(callback?: Function) | `ByteReader` | Get the parameter value as a binary stream (without character code conversion) |
| openValueAsText(callback?: Function, charsetName?: string) | `TextReader` | Get the parameter value as a text stream (converted to the specified character code) |

### File Upload Processing Example

Calling `ByteReader.read(buffer, ...)` directly has a pitfall: the bytes are not stored in a JavaScript empty array, so the file is saved as **0 bytes**.
For transfer purposes, use `ByteReader.transferTo(writer, chunkSize)`.
See `reference/api-binary-stream.md` for details.

```typescript
export function init(request: Request): void {
  let uploadedFile = request.getParameter('upload_file');

  // getFileName() returns null if the request was not sent as a file
  if (!uploadedFile || !uploadedFile.getFileName()) {
    return;
  }

  let fileName = uploadedFile.getFileName();
  let fileSize = uploadedFile.getLength();

  // Copy binary stream to Storage using transferTo
  let storage = new PublicStorage('upload/' + fileName);
  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    reader.transferTo(writer, 8192);
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
}
```

For the complete file upload/download REST-API implementation, see `assets/file-upload-download-api.md`.
