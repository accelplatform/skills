# Request Object Reference

## Overview

Request is an object that holds request information from the client.
It is created for each browser request and is passed as an argument to the `init()` function of a function container or to action-bound functions.

```javascript
function init(request) {
  // URL arguments can be accessed directly as properties
  let name = request.name;

  // Or retrieved using getParameterValue()
  let name = request.getParameterValue('name');
}
```

## Method List

### Parameter Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getParameterValue(key) | String | Returns the first URL argument for the specified key. Returns `null` if not found |
| getParameterValues(key) | Array(String) | Returns all URL arguments for the specified key as an array. Returns an empty array if not found |
| getParameterNames() | Array(String) | Returns all request parameter names |
| getParameter(name) | RequestParameter | Returns the specified parameter as a RequestParameter. Returns `null` if not found |
| getParameters(name) | Array(RequestParameter) | Returns all values of the specified parameter as a RequestParameter array |

### Header Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getHeaderNames() | Array(String) | Returns an array of all header names |
| getHeader(name) | String | Returns the first value of the specified header. Returns `null` if not found |
| getHeaders(name) | Array(String) | Returns all values of the specified header as an array. Returns an empty array if not found |

### Cookie Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getCookieNames() | Array(String) | Returns an array of all cookie names. Returns `null` if no cookies |
| getCookie(name) | String | Returns the cookie value with the specified name |
| getCookies(name) | Array(String) | Returns all cookie values with the specified name as an array |

### Message Body Retrieval

| Method | Return Value | Description |
|--------|-------------|-------------|
| getMessageBodyAsStream() | String | Returns binary data without character code conversion |
| getMessageBodyAsString() | String | Returns the message body converted to Unicode using the ServletRequest encoding |
| getMessageBody(enc) | String | Returns the message body converted to Unicode using the specified encoding |
| openMessageBodyAsBinary(callback) | ByteReader | Returns binary data as a ByteReader |
| openMessageBodyAsText(callback, enc) | TextReader | Returns text data as a TextReader |

### Request Information

| Method | Return Value | Description |
|--------|-------------|-------------|
| getMethod() | String | Returns the HTTP method name (`GET`, `POST`, etc.) |
| getContentLength() | Number | Returns the byte length of the message body. Returns `-1` if unknown |
| getContentType() | String | Returns the MIME type of the request. Returns `null` if unknown |
| getQueryString() | String | Returns the query string of the URL. Returns `null` if no query |

### Attribute Operations

| Method | Return Value | Description |
|--------|-------------|-------------|
| getAttributeNames() | Array(String) | Returns an array of available attribute names |
| getAttribute(name) | Object | Returns the specified attribute value. Returns `null` if not found |
| setAttribute(name, object) | void | Sets an attribute on the request |
| removeAttribute(name) | void | Removes an attribute from the request |

## Usage Examples

### Getting Parameters

```javascript
function init(request) {
  // Getting a single value
  let userId = request.getParameterValue('user_id');

  // Direct property access is also possible
  let userId = request.user_id;

  // Getting multiple values (checkboxes, etc.)
  let selectedIds = request.getParameterValues('selected_ids');
}
```

### Getting the JSON Body of a POST Request

```javascript
function init(request) {
  if (request.getMethod() === 'POST') {
    let body = request.getMessageBodyAsString();
    let data = JSON.parse(body);
  }
}
```

### Getting Headers and Cookies

```javascript
function init(request) {
  let contentType = request.getHeader('Content-Type');
  let sessionId = request.getCookie('JSESSIONID');
}
```

### Passing Attributes

```javascript
function init(request) {
  request.setAttribute('processResult', {status: 'success'});

  let result = request.getAttribute('processResult');
}
```

## RequestParameter Object

An object that can be obtained with `request.getParameter(name)` / `request.getParameters(name)`.
Holds information related to uploaded files and request data.

### Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| getName() | String | Get the parameter name |
| getValue() | String | Get the parameter value (after character code conversion) |
| getLength() | Number | Get the data length (bytes) |
| getFileName() | String | The file name of the uploaded file. Returns `null` for non-file parameters |
| getHeaderNames() | Array(String) | Header name list. Returns `null` if no headers |
| getHeader(name) | String | Get the value of the specified header name |
| openValueAsBinary(callback?) | ByteReader | Get the parameter value as a binary stream (without character code conversion) |
| openValueAsText(callback?, charsetName?) | TextReader | Get the parameter value as a text stream (converted to the specified character code) |

### File Upload Processing Example

Calling `ByteReader.read(buffer, ...)` directly has a pitfall: the bytes are not
stored in a JavaScript empty array, so the file is saved as **0 bytes**.
For transfer purposes, use `ByteReader.transferTo(writer, chunkSize)`.
See `reference/api-binary-stream.md` for details.

```javascript
function init(request) {
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

For the complete file upload/download REST-API implementation, see
`assets/file-upload-download-api.md`.
