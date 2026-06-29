---
paths:
  - "src/main/jssp/**/*.js"
---

# Binary Streams (ByteReader / ByteWriter / RequestParameter)

Reference for handling binary data, such as receiving uploaded files or writing to PublicStorage.

## Related Classes

| Class | Purpose |
|-------|---------|
| `RequestParameter` | Obtained via `request.getParameter('file')`. Represents a file uploaded via multipart/form-data |
| `ByteReader` | Reads a binary stream. Obtained via `request.openMessageBodyAsBinary()` / `requestParameter.openValueAsBinary()` / `storage.openAsBinary()` |
| `ByteWriter` | Writes a binary stream. Obtained via `storage.createAsBinary()` / `storage.appendAsBinary()` |

## Receiving and Saving an Uploaded File

### Recommended Pattern: Stream Transfer with `transferTo`

For ByteReader → ByteWriter copies, **use `reader.transferTo(writer, chunkSize)`**.
Specifying a chunk size lets you transfer all data while keeping memory consumption low.

```javascript
/**
 * Save an uploaded file to PublicStorage.
 *
 * @param {Object} uploadedFile - RequestParameter obtained from request.getParameter('file')
 * @param {string} fileKey - Destination path (e.g. uploads/xxx/yyy.ext)
 * @return {number} Number of bytes written
 */
function saveUpload(uploadedFile, fileKey) {
  let TRANSFER_CHUNK_SIZE = 8192;
  let storage = new PublicStorage(fileKey);

  // Create the parent directory if it does not exist
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    parent.makeDirectories();
  }

  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    if (!reader.transferTo(writer, TRANSFER_CHUNK_SIZE)) {
      throw new Error('Failed to write file.');
    }
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
  return uploadedFile.getLength();
}
```

### Prohibited Pattern: Calling `ByteReader.read(buffer, offset, length)` Directly

`ByteReader.read()` is the equivalent of Java's `InputStream.read(byte[], int, int)`,
which **requires the caller to pass a pre-sized array**.
Passing a JavaScript empty array `[]` results in no bytes being written, so the call
**always returns 0**, which causes the output file to be **0 bytes**.

```javascript
// NG: A pitfall that results in 0-byte storage
let reader = uploadedFile.openValueAsBinary();
let writer = storage.createAsBinary();
let buffer = [];   // ← Stays empty, so read() cannot store any bytes
while (true) {
  let bytesRead = reader.read(buffer, 0, 8192);  // Always returns 0
  if (bytesRead <= 0) break;
  writer.write(buffer, 0, bytesRead);            // Nothing is written
}
```

You almost never need to use `reader.read()`. **For transfer purposes, always use `transferTo`.**

### Callback Variant

Passing a callback to `openValueAsBinary` / `createAsBinary` causes `close` to be called automatically when finished.
It can lead to deep nesting, but prevents missed close calls.

```javascript
function saveUploadWithCallback(uploadedFile, fileKey) {
  let TRANSFER_CHUNK_SIZE = 8192;
  let storage = new PublicStorage(fileKey);
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    parent.makeDirectories();
  }

  uploadedFile.openValueAsBinary(function(reader, readerError) {
    if (readerError) throw readerError;
    storage.createAsBinary(function(writer, writerError) {
      if (writerError) throw writerError;
      reader.transferTo(writer, TRANSFER_CHUNK_SIZE);
      writer.flush();
    });
  });
  return uploadedFile.getLength();
}
```

## Guards When Receiving an Upload

Verify that the `RequestParameter` was sent as a file.

```javascript
let uploadedFile = request.getParameter('file');
if (!uploadedFile || !uploadedFile.getFileName()) {
  // No file attachment (e.g., a text parameter happened to share the same field name)
  throw new Error('No file was specified.');
}

let length = uploadedFile.getLength();
if (length <= 0) {
  throw new Error('The uploaded file is empty.');
}
if (length > MAX_FILE_SIZE_BYTES) {
  throw new Error('File size exceeds the limit.');
}
```

- `getFileName()` returns `null` **for non-file uploads**. Use this to distinguish from text parameters.
- `getLength()` comes from Content-Length. **Use it for an upfront size limit check.**

## Download (PublicStorage → HTTP response)

Use `HTTPResponse.sendMessageBodyAsBinary(storage)` to stream binary data from a storage directly into the response.

```javascript
function sendFile(storage, downloadFileName) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(200);
  httpResponse.setContentType('application/octet-stream');
  httpResponse.setHeader('Content-Disposition',
    'attachment; filename="' + downloadFileName + '"');
  let length = storage.length();
  if (length > 0) {
    httpResponse.setContentLength(length);
  }
  httpResponse.sendMessageBodyAsBinary(storage);
}
```

- After a send method (`sendMessageBodyAsBinary` / `sendMessageBodyString`, etc.) is called, **JavaScript execution stops**.
- So error branching must happen **before** sending. Once data has been sent, you can no longer switch to a JSON error response.

## File Name Sanitization (Path Traversal Prevention)

Do not embed user-supplied file names directly into the path.
Take the basename and replace disallowed characters.

```javascript
function toSafeFileName(originalFileName) {
  let baseName = String(originalFileName);
  let slashIndex = baseName.lastIndexOf('/');
  if (slashIndex >= 0) {
    baseName = baseName.substring(slashIndex + 1);
  }
  let backslashIndex = baseName.lastIndexOf('\\');
  if (backslashIndex >= 0) {
    baseName = baseName.substring(backslashIndex + 1);
  }
  baseName = baseName.replace(/[^0-9A-Za-z_\-\.]/g, '_');
  baseName = baseName.replace(/^\.+/, '');
  return baseName || 'unnamed';
}
```

## Validation of Received Keys (fileKey)

When opening a storage path based on input from the client (e.g., a download API),
**always apply whitelist validation**.

```javascript
let FILE_KEY_PREFIX = 'uploads/';
let FILE_KEY_PATTERN = /^[0-9A-Za-z_\-\.\/]+$/;
let FILE_KEY_MAX_LENGTH = 256;

function validateFileKey(fileKey) {
  if (!fileKey || fileKey.length === 0) {
    throw new Error('fileKey is required.');
  }
  if (fileKey.length > FILE_KEY_MAX_LENGTH) {
    throw new Error('fileKey is too long.');
  }
  if (!FILE_KEY_PATTERN.test(fileKey)) {
    throw new Error('fileKey contains disallowed characters.');
  }
  if (fileKey.indexOf('..') >= 0) {
    throw new Error('fileKey contains path traversal characters.');
  }
  if (fileKey.indexOf(FILE_KEY_PREFIX) !== 0) {
    throw new Error('fileKey must be under ' + FILE_KEY_PREFIX + '.');
  }
  return fileKey;
}
```

Checks:

| Check | Purpose |
|-------|---------|
| Required and max length | Early rejection of abnormal values |
| Character whitelist | Disallow control characters, whitespace, symbols |
| Must not contain `..` | Prevent path traversal |
| Must start with `uploads/` | Restrict access to a public directory only |

## Checklist

- [ ] Is the copy between upload receive and write using `reader.transferTo(writer, chunkSize)`?
- [ ] Are you avoiding calls to `ByteReader.read(buffer, ...)` with an empty array (cause of 0-byte storage)?
- [ ] Is the existence of the uploaded file checked with a null check on `getFileName()`?
- [ ] Is the size limit checked upfront with `getLength()`?
- [ ] Is the destination path sanitized via something equivalent to `toSafeFileName()`?
- [ ] Is the fileKey received from the client validated against a whitelist (leading prefix, character class, no `..`)?
- [ ] On error, do you switch to a JSON error response before the send call (`sendMessageBody*`) is started?

## Related

- `reference/argument-request.md` - List of Request / RequestParameter methods
- `reference/api-storage.md` - PublicStorage / SessionScopeStorage / SystemStorage operations
- `reference/api-http-response.md` - HTTPResponse usage
- `reference/api-secure-token-manager.md` - Secure tokens (CSRF protection)
- `assets/file-upload-download-api.md` - Reference implementation for REST-API + test screen
