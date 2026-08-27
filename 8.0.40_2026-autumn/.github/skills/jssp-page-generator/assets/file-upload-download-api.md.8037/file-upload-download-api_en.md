# File Upload / Download REST-API Template

## Overview

A template for an upload API that saves files uploaded via multipart/form-data to public storage and returns a storage key (file path), a download API that returns the binary content for that key, and a verification screen for both APIs.

- Upload API: `POST /sample_api/api/upload_file` (multipart/form-data, `X-Intramart-Secure-Token` required)
- Download API: `GET /sample_api/api/download_file?fileKey=...` (`X-Intramart-Secure-Token` required)
- Test screen: `/sample_api/view/file_upload_test`

## Replacement Points When Using a Different Category

This asset uses `sample_api` as the category name. When you use it for another feature name (e.g. `file_share`), replace all of the following at once. **Missing a replacement will still build, but it can break error code consistency or shift API URLs.**

| Type | Replace from | Replace to |
|------|--------------|------------|
| Placement path | `src/main/jssp/src/sample_api/` | `src/main/jssp/src/{feature}/` |
| API URL (`path` in routing XML) | `/sample_api/api/upload_file`, `/sample_api/api/download_file` | `/{feature}/upload_file`, etc. |
| Routing XML `page` attribute | `sample_api/api/upload_file`, `sample_api/api/download_file`, `sample_api/view/file_upload_test` | `{feature}/api/upload_file`, etc. |
| `UPLOAD_API_PATH` / `DOWNLOAD_API_PATH` in HTML | `'sample_api/api/upload_file'`, `'sample_api/api/download_file'` | `'{feature}/upload_file'`, etc. |
| Error code prefix | `E.IWP.SAMPLE.UPLOAD_FILE.*`, `E.IWP.SAMPLE.DOWNLOAD_FILE.*` | `E.IWP.{FEATURE}.UPLOAD_FILE.*`, etc. |
| `$subTitle` | `'sample_api'` | `'{feature}'` |
| Log tag | `[upload_file]` / `[download_file]` | (No change) |

Perform the category-name replacement by **inspecting the entire sample character by character.** Verify with `grep -n 'sample_api\|SAMPLE\.' {new category files}` to make sure no residue remains.

## File Structure

```
src/main/jssp/src/sample_api/
  ├── api/
  │    ├── upload_file.js        # Upload API
  │    └── download_file.js      # Download API
  └── view/
       ├── file_upload_test.js   # Test screen function container
       └── file_upload_test.html # Test screen presentation page

src/main/conf/routing-jssp-config/
  └── sample_api.xml             # Routing configuration
```

## Design Points

### File Key (fileKey) Design

The server **creates a unique directory and saves under it with a sanitized file name**.

```
fileKey = uploads/{yyyyMMdd_HHmmss}_{8-digit random HEX}/{safeFileName}
Example: uploads/20260520_120000_a1b2c3d4/document.pdf
```

- Uniqueness is ensured by the directory, so the original file name can be preserved
- For path traversal prevention, characters other than `[0-9A-Za-z_\-.]` in the file name are replaced with `_`
- The download API whitelist-validates the fileKey (must start with `uploads/`, no `..`, limited character set)

### Binary Transfer

**Use `ByteReader.transferTo(writer, chunkSize)`**.
Do not pass an empty array to `ByteReader.read(buffer, ...)`; that has the pitfall of saving **0 bytes**.
(See `reference/api-binary-stream.md` for details.)

### Security

| Item | Measure |
|------|---------|
| CSRF | `X-Intramart-Secure-Token` verification on both upload (POST) and download (GET) |
| Path traversal | Whitelist validation of fileKey, basename extraction for file name |
| Size attack | Pre-check size limit with `getLength()` (default 10MB) |
| Arbitrary file reference | fileKey is allowed only under `uploads/` |

### Error Response

- Success: binary send with `application/octet-stream` (download), or `application/json` with `{error:false, data:{fileKey,...}}`
- Failure: `application/json` with `{error:true, errorMessage:"[code] message"}` returned along with HTTP 4xx/5xx
- The download API must branch **before send starts (`sendMessageBodyAsBinary`)**. After sending starts, execution stops and you cannot switch to JSON afterwards.

---

## Upload API (sample_api/api/upload_file.js)

```javascript
/**
 * File Upload REST-API
 *
 * @file upload_file.js
 * @description Saves a file uploaded via multipart/form-data into public storage,
 *              and returns a download key (file path) as JSON.
 */

// ========================================
// Constants
// ========================================
let UPLOAD_PARAMETER_NAME = 'file';
let UPLOAD_BASE_DIRECTORY = 'uploads';
let MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
let TRANSFER_CHUNK_SIZE = 8192;
let SAFE_FILE_NAME_PATTERN = /[^0-9A-Za-z_\-\.]/g;
let FALLBACK_FILE_NAME = 'unnamed';

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.UPLOAD_FILE.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.UPLOAD_FILE.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.UPLOAD_FILE.00003';
let ERROR_CODE_FILE_TOO_LARGE = 'E.IWP.SAMPLE.UPLOAD_FILE.00004';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.UPLOAD_FILE.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// Entry point
// ========================================
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    checkMethod(request);
    verifySecureToken(request);
    let uploadedFile = getUploadedFileParameter(request);
    response = {
      error: false,
      data: saveUploadedFile(uploadedFile)
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || 'An unexpected error occurred.';

    if (statusCode >= 500) {
      logger.error('[upload_file] An error occurred during API processing. code={} message={}', [code, message]);
    } else {
      logger.warn('[upload_file] API request could not be accepted. code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// Method / secure token / validation
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'Method ' + method + ' is not allowed.');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token was not specified.');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token verification failed.');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token is invalid.');
  }
}

function getUploadedFileParameter(request) {
  let uploadedFile = request.getParameter(UPLOAD_PARAMETER_NAME);
  if (!uploadedFile || !uploadedFile.getFileName()) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'No upload file was specified.');
  }

  let length = uploadedFile.getLength();
  if (length <= 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'The uploaded file is empty.');
  }
  if (length > MAX_FILE_SIZE_BYTES) {
    throwApiError(ERROR_CODE_FILE_TOO_LARGE, 400,
      'File size exceeds the limit (' + MAX_FILE_SIZE_BYTES + ' bytes).');
  }

  return uploadedFile;
}

// ========================================
// Business logic
// ========================================
function saveUploadedFile(uploadedFile) {
  let originalFileName = uploadedFile.getFileName();
  let safeFileName = toSafeFileName(originalFileName);
  let directoryName = generateUniqueDirectoryName();
  let fileKey = UPLOAD_BASE_DIRECTORY + '/' + directoryName + '/' + safeFileName;

  let storage = new PublicStorage(fileKey);
  let parent = storage.getParentStorage();
  if (!parent.exists()) {
    if (!parent.makeDirectories()) {
      throwApiError(ERROR_CODE_INTERNAL, 500, 'Failed to create destination directory for file.');
    }
  }

  let savedSize = transferToStorage(uploadedFile, storage);

  return {
    fileKey: fileKey,
    fileName: safeFileName,
    originalFileName: originalFileName,
    size: savedSize
  };
}

/**
 * Writes the request binary stream into public storage.
 *
 * Important: ByteReader.read(buffer, ...) requires the caller to pass a pre-sized
 * array; passing an empty array results in 0-byte reads and a 0-byte saved file.
 * Always use ByteReader.transferTo(writer, chunkSize).
 */
function transferToStorage(uploadedFile, storage) {
  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    if (!reader.transferTo(writer, TRANSFER_CHUNK_SIZE)) {
      throwApiError(ERROR_CODE_INTERNAL, 500, 'Failed to write file.');
    }
    writer.flush();
  } finally {
    try { writer.close(); } catch (ignored) {}
    try { reader.close(); } catch (ignored) {}
  }
  return uploadedFile.getLength();
}

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
  baseName = baseName.replace(SAFE_FILE_NAME_PATTERN, '_');
  baseName = baseName.replace(/^\.+/, '');
  if (!baseName || baseName.length === 0) {
    baseName = FALLBACK_FILE_NAME;
  }
  return baseName;
}

function generateUniqueDirectoryName() {
  let now = new Date();
  let timestamp = now.getFullYear()
    + padZero(now.getMonth() + 1)
    + padZero(now.getDate())
    + '_'
    + padZero(now.getHours())
    + padZero(now.getMinutes())
    + padZero(now.getSeconds());
  let randomValue = Math.floor(Math.random() * 0x100000000).toString(16);
  while (randomValue.length < 8) {
    randomValue = '0' + randomValue;
  }
  return timestamp + '_' + randomValue;
}

function padZero(value) {
  return value < 10 ? '0' + value : String(value);
}

// ========================================
// Exception / response
// ========================================
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

---

## Download API (sample_api/api/download_file.js)

```javascript
/**
 * File Download REST-API
 *
 * @file download_file.js
 * @description Receives the query parameter fileKey and returns the target
 *              file under public storage as binary content.
 *              On error, returns a JSON error response.
 */

// ========================================
// Constants
// ========================================
let UPLOAD_BASE_DIRECTORY = 'uploads';
let FILE_KEY_PREFIX = UPLOAD_BASE_DIRECTORY + '/';
let FILE_KEY_MAX_LENGTH = 256;
let FILE_KEY_PATTERN = /^[0-9A-Za-z_\-\.\/]+$/;

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.DOWNLOAD_FILE.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.DOWNLOAD_FILE.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.DOWNLOAD_FILE.00003';
let ERROR_CODE_FILE_NOT_FOUND = 'E.IWP.SAMPLE.DOWNLOAD_FILE.00004';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.DOWNLOAD_FILE.99999';

let ALLOWED_METHODS = ['GET'];

// ========================================
// Entry point
// ========================================
function init(request) {
  let logger = Logger.getLogger();

  try {
    checkMethod(request);
    verifySecureToken(request);
    let fileKey = validateFileKey(request['fileKey']);
    let storage = resolveFileStorage(fileKey);
    sendFileResponse(storage);
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    let statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || 'An unexpected error occurred.';

    if (statusCode >= 500) {
      logger.error('[download_file] An error occurred during API processing. code={} message={}', [code, message]);
    } else {
      logger.warn('[download_file] API request could not be accepted. code={} status={} message={}', [code, statusCode, message]);
    }

    sendJsonResponse({
      error: true,
      errorMessage: '[' + code + '] ' + message
    }, statusCode);
  }
}

// ========================================
// Method / secure token / validation
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'Method ' + method + ' is not allowed.');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token was not specified.');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token verification failed.');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token is invalid.');
  }
}

function validateFileKey(fileKey) {
  if (!fileKey || fileKey.length === 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey is required.');
  }
  if (fileKey.length > FILE_KEY_MAX_LENGTH) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey is too long.');
  }
  if (!FILE_KEY_PATTERN.test(fileKey)) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey contains disallowed characters.');
  }
  if (fileKey.indexOf('..') >= 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey contains path traversal characters.');
  }
  if (fileKey.indexOf(FILE_KEY_PREFIX) !== 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400,
      'fileKey must be under ' + FILE_KEY_PREFIX + '.');
  }
  return fileKey;
}

// ========================================
// Business logic
// ========================================
function resolveFileStorage(fileKey) {
  let storage = new PublicStorage(fileKey);
  if (!storage.exists() || !storage.isFile()) {
    throwApiError(ERROR_CODE_FILE_NOT_FOUND, 404, 'The specified file does not exist.');
  }
  return storage;
}

function sendFileResponse(storage) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(200);
  httpResponse.setContentType('application/octet-stream');
  httpResponse.setHeader('Content-Disposition',
    'attachment; filename="' + storage.getName() + '"');
  let length = storage.length();
  if (length > 0) {
    httpResponse.setContentLength(length);
  }
  httpResponse.sendMessageBodyAsBinary(storage);
}

// ========================================
// Exception / response
// ========================================
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

---

## Test Screen Function Container (sample_api/view/file_upload_test.js)

```javascript
/**
 * File Upload / Download Test Screen
 *
 * @file file_upload_test.js
 * @description Test screen for verifying /sample_api/api/upload_file and
 *              /sample_api/api/download_file.
 */

let $title = 'File Upload / Download Test';
let $subTitle = 'sample_api';
let $data = '{}';

function init(request) {
  let response = {
    result: {},
    error: {
      code: '',
      message: ''
    }
  };
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

---

## Test Screen Presentation Page (sample_api/view/file_upload_test.html)

A sample that implements the flow: file selection → upload → fileKey display → automatically populate the download key field.
For downloads, use `fetch` to retrieve the response, convert it to a Blob, and save via `URL.createObjectURL`.
This approach allows secure-token-protected GET downloads to work.

```html
<imart type="head">
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <style>
    .upload-result-card {
      background-color: var(--imds-color-background-secondary, #f5f7fa);
      border: 1px solid var(--imds-color-border, #d0d7de);
      border-radius: 0.5em;
      padding: 1em 1.5em;
      margin-top: 1em;
    }
    .upload-result-card dt {
      font-weight: bold;
      margin-top: 0.5em;
    }
    .upload-result-card dd {
      margin: 0.25em 0 0.75em 0;
      word-break: break-all;
    }
    .file-upload-actions {
      display: flex;
      gap: 0.75em;
      align-items: center;
      margin-top: 0.5em;
    }
  </style>
  <!-- Scope $data via an IIFE instead of leaving it in the global scope -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      const UPLOAD_API_PATH = 'sample_api/api/upload_file';
      const DOWNLOAD_API_PATH = 'sample_api/api/download_file';

      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      function getElement(id) {
        return document.getElementById(id);
      }

      function showUploadResult(data) {
        getElement(':resultFileKey:').textContent = data.fileKey;
        getElement(':resultFileName:').textContent = data.fileName;
        getElement(':resultOriginalFileName:').textContent = data.originalFileName;
        getElement(':resultSize:').textContent = String(data.size) + ' bytes';
        getElement('upload-result').style.display = '';
        getElement(':downloadFileKey:').value = data.fileKey;
      }

      function clearUploadResult() {
        getElement('upload-result').style.display = 'none';
        getElement(':resultFileKey:').textContent = '';
        getElement(':resultFileName:').textContent = '';
        getElement(':resultOriginalFileName:').textContent = '';
        getElement(':resultSize:').textContent = '';
      }

      async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file, file.name);

        const response = await fetch(UPLOAD_API_PATH, {
          method: 'POST',
          headers: {
            'X-Intramart-Secure-Token': getSecureToken()
          },
          body: formData
        });

        const result = await response.json().catch(() => null);
        if (!result) {
          imuiShowErrorMessage('A system error occurred.');
          return false;
        }
        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        showUploadResult(result.data);
        imuiShowSuccessMessage('File uploaded successfully.');
        return true;
      }

      function extractDownloadFileName(response, fallbackName) {
        const disposition = response.headers.get('Content-Disposition') || '';
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        if (match && match[1]) {
          try {
            return decodeURIComponent(match[1]);
          } catch (e) {
            return match[1];
          }
        }
        return fallbackName;
      }

      async function downloadFile(fileKey) {
        const url = DOWNLOAD_API_PATH + '?fileKey=' + encodeURIComponent(fileKey);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-Intramart-Secure-Token': getSecureToken()
          }
        });

        const contentType = response.headers.get('Content-Type') || '';
        if (contentType.indexOf('application/json') >= 0) {
          const result = await response.json().catch(() => null);
          if (result && result.error) {
            imuiShowErrorMessage(result.errorMessage);
          } else {
            imuiShowErrorMessage('A system error occurred.');
          }
          return false;
        }

        if (!response.ok) {
          imuiShowErrorMessage('Download failed. HTTP ' + response.status);
          return false;
        }

        const blob = await response.blob();
        const fallbackName = fileKey.substring(fileKey.lastIndexOf('/') + 1) || 'download';
        const fileName = extractDownloadFileName(response, fallbackName);

        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);

        imuiShowSuccessMessage('File downloaded successfully.');
        return true;
      }

      getElement('upload-button').addEventListener('click', () => {
        const input = getElement(':uploadFile:');
        const files = input.files;
        if (!files || files.length === 0) {
          imuiShowWarningMessage('Please select a file to upload.');
          return;
        }
        const file = files[0];
        clearUploadResult();
        uploadFile(file);
      });

      getElement('download-button').addEventListener('click', () => {
        const fileKey = getElement(':downloadFileKey:').value.trim();
        if (!fileKey) {
          imuiShowWarningMessage('Please enter a file key to download.');
          return;
        }
        downloadFile(fileKey);
      });

      if ($data.error && $data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Page-wide container (no id is added, since it is placed inside the intra-mart theme's <div id="imui-container">) -->
<div class="imds-container">
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-cloud-arrow-up"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1 id="page-title"><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <main>
    <imart type="imSecureToken" />

    <section class="imds-py-3 imds-px-4" aria-labelledby="upload-section-title">
      <h2 id="upload-section-title" class="imds-mb-3">Upload</h2>
      <div class="imds-field" for=":uploadFile:">
        <div class="imds-field-label">
          <label for=":uploadFile:" class="has-text-weight-bold">File</label>
        </div>
        <div class="imds-field-control">
          <div class="file-upload-actions">
            <input type="file" id=":uploadFile:" name="uploadFile" />
            <button type="button" class="imds-button is-primary" id="upload-button">
              <span class="imds-icon"><i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i></span>
              <span class="imds-button-text">Upload</span>
            </button>
          </div>
        </div>
      </div>

      <div id="upload-result" class="upload-result-card" style="display:none;" role="status" aria-live="polite">
        <h3 class="imds-mb-2">Upload Result</h3>
        <dl>
          <dt>File Key (fileKey)</dt>
          <dd id=":resultFileKey:"></dd>
          <dt>Saved File Name</dt>
          <dd id=":resultFileName:"></dd>
          <dt>Original File Name</dt>
          <dd id=":resultOriginalFileName:"></dd>
          <dt>Size</dt>
          <dd id=":resultSize:"></dd>
        </dl>
      </div>
    </section>

    <section class="imds-py-3 imds-px-4" aria-labelledby="download-section-title">
      <h2 id="download-section-title" class="imds-mb-3">Download</h2>
      <div class="imds-field" for=":downloadFileKey:">
        <div class="imds-field-label">
          <label for=":downloadFileKey:" class="has-text-weight-bold">File Key (fileKey)</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id=":downloadFileKey:" name="downloadFileKey" class="imds-textbox" placeholder="uploads/yyyymmdd_hhmmss_xxxxxxxx/filename.ext" />
        </div>
      </div>
      <div class="file-upload-actions">
        <button type="button" class="imds-button is-primary" id="download-button">
          <span class="imds-icon"><i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i></span>
          <span class="imds-button-text">Download</span>
        </button>
      </div>
    </section>
  </main>
</div>
```

---

## Routing Configuration (sample_api.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <file-mapping path="/sample_api/api/upload_file" page="sample_api/api/upload_file">
    <authz uri="service://sample_api/api/upload_file" action="execute" />
  </file-mapping>

  <file-mapping path="/sample_api/api/download_file" page="sample_api/api/download_file">
    <authz uri="service://sample_api/api/download_file" action="execute" />
  </file-mapping>

  <file-mapping path="/sample_api/view/file_upload_test" page="sample_api/view/file_upload_test">
    <authz uri="service://sample_api/view/file_upload_test" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

Specify an explicit `<authz uri/action>` for each `file-mapping`, and define the authorization resources with `jssp-tenant-setup-generator`.

---

## Implementation Points

### Do Not Call ByteReader.read() Directly (Most Important)

Passing `buffer = []` to `reader.read(buffer, 0, chunkSize)` leaves the array empty and always returns 0.
As a result the loop spins doing nothing, and the symptom is that **a 0-byte file is saved**.

For transfers, always use `reader.transferTo(writer, chunkSize)`. See `reference/api-binary-stream.md` for details.

### Preserving the Original File Name

By **ensuring uniqueness via the directory** as in `uploads/{unique directory}/{safeFileName}`,
the file name can preserve the sanitized original.
The download response can return the original name via `Content-Disposition: attachment; filename="..."`,
which gives users a natural download experience.

### Download Error Response

`HTTPResponse.sendMessageBodyAsBinary(storage)` stops JavaScript execution after sending.
So **perform fileKey validation and existence checks before sending, and on failure switch to a JSON error response.**
The client branches on Content-Type: if it is `application/json`, display the error message.

### Size Limit

**Reject sizes upfront with `uploadedFile.getLength()`.**
In environments where Content-Length cannot be trusted, ideally you should also monitor cumulative bytes during stream transfer,
but the standard `transferTo` does not support mid-stream cancellation. If needed, implement chunked reads yourself.
For typical cases, the upfront check is enough.

### Secure Token

Even for GET, treat file retrieval as a sensitive operation and require `X-Intramart-Secure-Token`.
Browser `<a href>` direct links cannot be used, so on the screen side, use `fetch` to receive the response as a Blob
and download via `URL.createObjectURL`.

## Related

- `reference/api-binary-stream.md` - How to use ByteReader / ByteWriter / RequestParameter
- `reference/api-storage.md` - General PublicStorage operations
- `reference/api-secure-token-manager.md` - CSRF token verification
- `reference/argument-request.md` - Request / RequestParameter method list
- `.github/instructions/jssp-error-handling.instructions.md` - Error code naming and API error response format
- `.github/instructions/jssp-security.instructions.md` - Input validation and path traversal prevention policy
