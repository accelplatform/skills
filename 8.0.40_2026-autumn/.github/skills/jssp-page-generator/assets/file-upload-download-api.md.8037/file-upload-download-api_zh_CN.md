# 文件上传/下载 REST-API 模板

## 概述

用于将通过 multipart/form-data 上传的文件保存到公共存储并返回保存键（文件路径）的上传 API，
以及通过该键以二进制形式返回文件的下载 API，及验证两 API 用的画面模板。

- 上传 API：`POST /sample_api/api/upload_file`（multipart/form-data，需要 `X-Intramart-Secure-Token`）
- 下载 API：`GET /sample_api/api/download_file?fileKey=...`（需要 `X-Intramart-Secure-Token`）
- 测试画面：`/sample_api/view/file_upload_test`

## 用于其他类别时的替换要点

本资源以 `sample_api` 作为类别名称编写。若用于其他功能名（如 `file_share`），必须将下列项全部一并替换。**漏掉任何一处虽然可以编译通过，但会破坏错误代码的一致性或导致 API URL 错位。**

| 类型 | 替换前 | 替换后 |
|------|--------|--------|
| 文件位置 | `src/main/jssp/src/sample_api/` | `src/main/jssp/src/{功能名}/` |
| API URL（路由 XML 的 `path`） | `/sample_api/api/upload_file`、`/sample_api/api/download_file` | `/{功能名}/upload_file` 等 |
| 路由 XML 的 `page` 属性 | `sample_api/api/upload_file`、`sample_api/api/download_file`、`sample_api/view/file_upload_test` | `{功能名}/api/upload_file` 等 |
| HTML 中的 `UPLOAD_API_PATH` / `DOWNLOAD_API_PATH` | `'sample_api/api/upload_file'`、`'sample_api/api/download_file'` | `'{功能名}/upload_file'` 等 |
| 错误代码前缀 | `E.IWP.SAMPLE.UPLOAD_FILE.*`、`E.IWP.SAMPLE.DOWNLOAD_FILE.*` | `E.IWP.{功能名大写}.UPLOAD_FILE.*` 等 |
| `$subTitle` | `'sample_api'` | `'{功能名}'` |
| 日志标签 | `[upload_file]` / `[download_file]` | （无需更改） |

类别名替换必须**对样本进行逐字符确认**。请用 `grep -n 'sample_api\|SAMPLE\.' {新类别文件}` 验证是否存在残留。

## 文件结构

```
src/main/jssp/src/sample_api/
  ├── api/
  │    ├── upload_file.js        # 上传 API
  │    └── download_file.js      # 下载 API
  └── view/
       ├── file_upload_test.js   # 测试画面函数容器
       └── file_upload_test.html # 测试画面展示页面

src/main/conf/routing-jssp-config/
  └── sample_api.xml             # 路由配置
```

## 设计要点

### 文件键（fileKey）的设计

服务端**生成唯一目录，并在其下以净化后的文件名保存**。

```
fileKey = uploads/{yyyyMMdd_HHmmss}_{8 位随机 HEX}/{safeFileName}
示例：uploads/20260520_120000_a1b2c3d4/document.pdf
```

- 通过目录确保唯一性，便于保留原始文件名
- 为防止路径穿越，文件名中除 `[0-9A-Za-z_\-.]` 以外的字符全部替换为 `_`
- 下载 API 对 fileKey 进行白名单校验（开头 `uploads/`、禁止 `..`、字符种类受限）

### 二进制传输

**必须使用 `ByteReader.transferTo(writer, chunkSize)`**。
切勿向 `ByteReader.read(buffer, ...)` 传入空数组——存在 **0 字节保存**的陷阱。
（详见 `reference/api-binary-stream.md`）

### 安全

| 项目 | 措施 |
|------|------|
| CSRF | 上传（POST）与下载（GET）均验证 `X-Intramart-Secure-Token` |
| 路径穿越 | 对 fileKey 进行白名单校验，文件名取 basename |
| 大小攻击 | 通过 `getLength()` 事前检查大小上限（默认 10MB） |
| 任意文件引用 | fileKey 仅允许 `uploads/` 之下 |

### 错误响应

- 成功时：以 `application/octet-stream` 发送二进制（下载），或以 `application/json` 返回 `{error:false, data:{fileKey,...}}`
- 失败时：以 `application/json` 返回 `{error:true, errorMessage:"[代码] 消息"}`，并附带 HTTP 4xx/5xx
- 下载 API 必须**在发送开始（`sendMessageBodyAsBinary`）之前**进行错误分支判断。一旦开始发送，执行将停止，无法事后切换为 JSON 响应。

---

## 上传 API（sample_api/api/upload_file.js）

```javascript
/**
 * 文件上传 REST-API
 *
 * @file upload_file.js
 * @description 将通过 multipart/form-data 上传的文件保存到公共存储，
 *              并以 JSON 形式返回下载用的键（文件路径）。
 */

// ========================================
// 常量定义
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
// 入口点
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
    let message = apiError.message || '发生了意外错误。';

    if (statusCode >= 500) {
      logger.error('[upload_file] API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('[upload_file] API 请求无法受理。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// 方法・安全令牌・校验
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      '方法 ' + method + ' 不被允许。');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '未指定安全令牌。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌校验失败。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌无效。');
  }
}

function getUploadedFileParameter(request) {
  let uploadedFile = request.getParameter(UPLOAD_PARAMETER_NAME);
  if (!uploadedFile || !uploadedFile.getFileName()) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, '未指定上传文件。');
  }

  let length = uploadedFile.getLength();
  if (length <= 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, '上传文件为空。');
  }
  if (length > MAX_FILE_SIZE_BYTES) {
    throwApiError(ERROR_CODE_FILE_TOO_LARGE, 400,
      '文件大小超过上限（' + MAX_FILE_SIZE_BYTES + ' 字节）。');
  }

  return uploadedFile;
}

// ========================================
// 业务逻辑
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
      throwApiError(ERROR_CODE_INTERNAL, 500, '创建文件保存目录失败。');
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
 * 将请求的二进制流写入公共存储。
 *
 * 重要：ByteReader.read(buffer, ...) 是要求调用方传入预先分配容量的数组的
 * Java InputStream 相当 API。传入 JavaScript 的空数组 [] 时不会写入字节，
 * 会导致 0 字节保存。请务必使用 ByteReader.transferTo(writer, chunkSize)。
 */
function transferToStorage(uploadedFile, storage) {
  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    if (!reader.transferTo(writer, TRANSFER_CHUNK_SIZE)) {
      throwApiError(ERROR_CODE_INTERNAL, 500, '文件写入失败。');
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
// 异常・响应
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

## 下载 API（sample_api/api/download_file.js）

```javascript
/**
 * 文件下载 REST-API
 *
 * @file download_file.js
 * @description 接收查询参数 fileKey，将公共存储下对应的文件以二进制返回。
 *              错误时以 JSON 形式返回错误响应。
 */

// ========================================
// 常量定义
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
// 入口点
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
    let message = apiError.message || '发生了意外错误。';

    if (statusCode >= 500) {
      logger.error('[download_file] API 处理中发生错误。code={} message={}', [code, message]);
    } else {
      logger.warn('[download_file] API 请求无法受理。code={} status={} message={}', [code, statusCode, message]);
    }

    sendJsonResponse({
      error: true,
      errorMessage: '[' + code + '] ' + message
    }, statusCode);
  }
}

// ========================================
// 方法・安全令牌・校验
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      '方法 ' + method + ' 不被允许。');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '未指定安全令牌。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌校验失败。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, '安全令牌无效。');
  }
}

function validateFileKey(fileKey) {
  if (!fileKey || fileKey.length === 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey 为必填项。');
  }
  if (fileKey.length > FILE_KEY_MAX_LENGTH) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey 过长。');
  }
  if (!FILE_KEY_PATTERN.test(fileKey)) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey 包含不允许使用的字符。');
  }
  if (fileKey.indexOf('..') >= 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey 包含路径穿越字符。');
  }
  if (fileKey.indexOf(FILE_KEY_PREFIX) !== 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400,
      'fileKey 必须位于 ' + FILE_KEY_PREFIX + ' 之下。');
  }
  return fileKey;
}

// ========================================
// 业务逻辑
// ========================================
function resolveFileStorage(fileKey) {
  let storage = new PublicStorage(fileKey);
  if (!storage.exists() || !storage.isFile()) {
    throwApiError(ERROR_CODE_FILE_NOT_FOUND, 404, '指定的文件不存在。');
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
// 异常・响应
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

## 测试画面函数容器（sample_api/view/file_upload_test.js）

```javascript
/**
 * 文件上传/下载 测试画面
 *
 * @file file_upload_test.js
 * @description 用于验证 /sample_api/api/upload_file 与 /sample_api/api/download_file 的画面。
 */

let $title = '文件上传/下载 测试';
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

## 测试画面展示页面（sample_api/view/file_upload_test.html）

实现了文件选择 → 上传 → fileKey 显示 → 自动填入下载键的一系列流程的示例。
下载时使用 `fetch` 接收响应，转换为 Blob，再通过 `URL.createObjectURL` 让浏览器保存。
通过此方式即使附带安全令牌的 GET 也能正常下载。

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
  <script>
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

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
          imuiShowErrorMessage('发生了系统错误。');
          return false;
        }
        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        showUploadResult(result.data);
        imuiShowSuccessMessage('文件上传成功。');
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
            imuiShowErrorMessage('发生了系统错误。');
          }
          return false;
        }

        if (!response.ok) {
          imuiShowErrorMessage('下载失败。HTTP ' + response.status);
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

        imuiShowSuccessMessage('文件下载成功。');
        return true;
      }

      getElement('upload-button').addEventListener('click', () => {
        const input = getElement(':uploadFile:');
        const files = input.files;
        if (!files || files.length === 0) {
          imuiShowWarningMessage('请选择要上传的文件。');
          return;
        }
        const file = files[0];
        clearUploadResult();
        uploadFile(file);
      });

      getElement('download-button').addEventListener('click', () => {
        const fileKey = getElement(':downloadFileKey:').value.trim();
        if (!fileKey) {
          imuiShowWarningMessage('请输入要下载的文件键。');
          return;
        }
        downloadFile(fileKey);
      });

      if ($data.error && $data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      }
    });
  </script>
</imart>

<div id="container">
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
        <h2 id="upload-section-title" class="imds-mb-3">上传</h2>
        <div class="imds-field" for=":uploadFile:">
          <div class="imds-field-label">
            <label for=":uploadFile:" class="has-text-weight-bold">文件</label>
          </div>
          <div class="imds-field-control">
            <div class="file-upload-actions">
              <input type="file" id=":uploadFile:" name="uploadFile" />
              <button type="button" class="imds-button is-primary" id="upload-button">
                <span class="imds-icon"><i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i></span>
                <span class="imds-button-text">上传</span>
              </button>
            </div>
          </div>
        </div>

        <div id="upload-result" class="upload-result-card" style="display:none;" role="status" aria-live="polite">
          <h3 class="imds-mb-2">上传结果</h3>
          <dl>
            <dt>文件键（fileKey）</dt>
            <dd id=":resultFileKey:"></dd>
            <dt>保存文件名</dt>
            <dd id=":resultFileName:"></dd>
            <dt>原文件名</dt>
            <dd id=":resultOriginalFileName:"></dd>
            <dt>大小</dt>
            <dd id=":resultSize:"></dd>
          </dl>
        </div>
      </section>

      <section class="imds-py-3 imds-px-4" aria-labelledby="download-section-title">
        <h2 id="download-section-title" class="imds-mb-3">下载</h2>
        <div class="imds-field" for=":downloadFileKey:">
          <div class="imds-field-label">
            <label for=":downloadFileKey:" class="has-text-weight-bold">文件键（fileKey）</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":downloadFileKey:" name="downloadFileKey" class="imds-textbox" placeholder="uploads/yyyymmdd_hhmmss_xxxxxxxx/filename.ext" />
          </div>
        </div>
        <div class="file-upload-actions">
          <button type="button" class="imds-button is-primary" id="download-button">
            <span class="imds-icon"><i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i></span>
            <span class="imds-button-text">下载</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</div>
```

---

## 路由配置（sample_api.xml）

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

应为每个 `file-mapping` 明示 `<authz uri/action>`，并通过 `jssp-tenant-setup-generator` 定义授权资源。

---

## 实现要点

### 不要直接调用 ByteReader.read()（最重要）

向 `reader.read(buffer, 0, chunkSize)` 传入 `buffer = []` 时，由于数组仍为空，字节不会被存储，始终返回 0。
结果是循环空转，**保存为 0 字节文件**的症状会出现。

用于传输时必须使用 `reader.transferTo(writer, chunkSize)`。详见 `reference/api-binary-stream.md`。

### 保留原文件名

通过 `uploads/{唯一目录}/{safeFileName}` 这种 **由目录保证唯一性**的方式，
文件名可以保留经过净化的原始名称。
下载时通过 `Content-Disposition: attachment; filename="..."` 返回原文件名，
能够为用户提供自然的下载体验。

### 下载的错误响应

`HTTPResponse.sendMessageBodyAsBinary(storage)` 在发送后将停止 JavaScript 的执行。
因此**必须在发送之前完成 fileKey 校验与存在性检查，失败时切换为 JSON 错误响应**。
客户端根据 Content-Type 进行分支：若为 `application/json`，则显示错误消息。

### 大小上限

请使用 `uploadedFile.getLength()` **事前拦截大小上限**。
在 Content-Length 不可信的环境中，原本还应监控流传输过程中的累计字节数，
但标准的 `transferTo` 没有中途中断机制，必要时可自行实现分块读取。
对于一般场景，事前检查已足够。

### 安全令牌

即便是 GET，也将文件取回视为机密数据操作，强制要求 `X-Intramart-Secure-Token`。
由此浏览器的 `<a href>` 直链无法再使用，画面侧需要使用 `fetch` 将响应以 Blob 形式接收，
并经由 `URL.createObjectURL` 进行下载。

## 相关

- `reference/api-binary-stream.md` - ByteReader / ByteWriter / RequestParameter 的使用方法
- `reference/api-storage.md` - PublicStorage 的总体操作
- `reference/api-secure-token-manager.md` - CSRF 令牌的校验
- `reference/argument-request.md` - Request / RequestParameter 的方法一览
- `.github/instructions/jssp-error-handling.instructions.md` - 错误代码命名规则与 API 错误响应格式
- `.github/instructions/jssp-security.instructions.md` - 输入校验与路径穿越防护的整体方针
