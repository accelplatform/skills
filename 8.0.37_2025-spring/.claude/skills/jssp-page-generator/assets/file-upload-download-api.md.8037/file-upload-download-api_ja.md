# ファイルアップロード/ダウンロード REST-API テンプレート

## 概要

multipart/form-data でアップロードされたファイルをパブリックストレージに保存し、保存先キー（ファイルパス）を返却するアップロード API と、
そのキーを指定してファイルをバイナリで返却するダウンロード API、および両 API の動作確認用画面のテンプレート。

- アップロード API: `POST /sample_api/api/upload_file`（multipart/form-data、`X-Intramart-Secure-Token` 必須）
- ダウンロード API: `GET /sample_api/api/download_file?fileKey=...`（`X-Intramart-Secure-Token` 必須）
- テスト画面: `/sample_api/view/file_upload_test`

## 別カテゴリで利用する場合の置換ポイント

このアセットは `sample_api` をカテゴリ名として記述している。別の機能名（例: `file_share`）で利用する場合は、以下をすべて一括置換すること。**置換漏れがあるとビルドは通るが、エラーコードの整合性が崩れたり API URL がずれるリスクがある。**

| 種類 | 置換対象 | 置換例 |
|------|----------|--------|
| 配置パス | `src/main/jssp/src/sample_api/` | `src/main/jssp/src/{機能名}/` |
| API URL（ルーティング XML の `path`） | `/sample_api/api/upload_file`、`/sample_api/api/download_file` | `/{機能名}/upload_file` 等 |
| ルーティング XML の `page` 属性 | `sample_api/api/upload_file`、`sample_api/api/download_file`、`sample_api/view/file_upload_test` | `{機能名}/api/upload_file` 等 |
| HTML 側の `UPLOAD_API_PATH` / `DOWNLOAD_API_PATH` | `'sample_api/api/upload_file'`、`'sample_api/api/download_file'` | `'{機能名}/upload_file'` 等 |
| エラーコードのプレフィックス | `E.IWP.SAMPLE.UPLOAD_FILE.*`、`E.IWP.SAMPLE.DOWNLOAD_FILE.*` | `E.IWP.{機能名大文字}.UPLOAD_FILE.*` 等 |
| `$subTitle` | `'sample_api'` | `'{機能名}'` |
| ログタグ | `[upload_file]` / `[download_file]` | （変更不要） |

カテゴリ名置換は**サンプル全体を 1 文字ずつ確認**して行うこと。`grep -n 'sample_api\|SAMPLE\.' {新カテゴリのファイル}` で残骸がないか必ず検証する。

## ファイル構成

```
src/main/jssp/src/sample_api/
  ├── api/
  │    ├── upload_file.js        # アップロード API
  │    └── download_file.js      # ダウンロード API
  └── view/
       ├── file_upload_test.js   # テスト画面 ファンクションコンテナ
       └── file_upload_test.html # テスト画面 プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── sample_api.xml             # ルーティング設定
```

## 設計ポイント

### ファイルキー（fileKey）の設計

サーバ側で **ユニークなディレクトリを生成し、その配下にサニタイズ済みのファイル名で保存**する。

```
fileKey = uploads/{yyyyMMdd_HHmmss}_{ランダム8桁HEX}/{safeFileName}
例: uploads/20260520_120000_a1b2c3d4/document.pdf
```

- ディレクトリでユニーク性を確保することで、元のファイル名をそのまま保持できる
- ファイル名はパストラバーサル対策のため `[0-9A-Za-z_\-.]` 以外を `_` に置換
- ダウンロード API は fileKey をホワイトリスト検証（先頭 `uploads/`、`..` 禁止、文字種限定）

### バイナリ転送

**`ByteReader.transferTo(writer, chunkSize)` を使う**こと。
`ByteReader.read(buffer, ...)` に空配列を渡すと **0 バイト保存**になる落とし穴があるため使わない。
（詳細は `reference/api-binary-stream.md` を参照）

### セキュリティ

| 項目 | 対策 |
|------|------|
| CSRF | アップロード（POST）・ダウンロード（GET）の両方で `X-Intramart-Secure-Token` 検証 |
| パストラバーサル | fileKey のホワイトリスト検証、ファイル名 basename 化 |
| サイズ攻撃 | `getLength()` で事前にサイズ上限チェック（既定 10MB） |
| 任意ファイル参照 | fileKey は `uploads/` 配下のみ許可 |

### エラー応答

- 成功時: `application/octet-stream` でバイナリ送信（ダウンロード）、または `application/json` で `{error:false, data:{fileKey,...}}`
- 失敗時: `application/json` で `{error:true, errorMessage:"[コード] メッセージ"}` を HTTP 4xx/5xx と共に返す
- ダウンロード API は **送信開始（`sendMessageBodyAsBinary`）の前に**エラー分岐させること。送信後は実行停止のため後から JSON へ差し替えられない

---

## アップロード API（sample_api/api/upload_file.js）

```javascript
/**
 * ファイルアップロード REST-API
 *
 * @file upload_file.js
 * @description multipart/form-data でアップロードされたファイルをパブリックストレージに保存し、
 *              ダウンロード用のキー（ファイルパス）を JSON で返却する。
 */

// ========================================
// 定数定義
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
// エントリーポイント
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
    let message = apiError.message || '予期しないエラーが発生しました。';

    if (statusCode >= 500) {
      logger.error('[upload_file] API 処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('[upload_file] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// メソッド・セキュアトークン・バリデーション
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンが指定されていません。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンの検証に失敗しました。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンが不正です。');
  }
}

function getUploadedFileParameter(request) {
  let uploadedFile = request.getParameter(UPLOAD_PARAMETER_NAME);
  if (!uploadedFile || !uploadedFile.getFileName()) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'アップロードファイルが指定されていません。');
  }

  let length = uploadedFile.getLength();
  if (length <= 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'アップロードファイルが空です。');
  }
  if (length > MAX_FILE_SIZE_BYTES) {
    throwApiError(ERROR_CODE_FILE_TOO_LARGE, 400,
      'ファイルサイズが上限（' + MAX_FILE_SIZE_BYTES + ' バイト）を超えています。');
  }

  return uploadedFile;
}

// ========================================
// ビジネスロジック
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
      throwApiError(ERROR_CODE_INTERNAL, 500, 'ファイル保存先ディレクトリの作成に失敗しました。');
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
 * リクエストのバイナリストリームをパブリックストレージへ書き込む。
 *
 * 重要: ByteReader.read(buffer, ...) は呼び出し側が容量確保した配列を渡す必要があり、
 * 空配列を渡すと常に 0 バイト読み取りとなり 0 バイト保存になる。
 * 必ず ByteReader.transferTo(writer, chunkSize) を使うこと。
 */
function transferToStorage(uploadedFile, storage) {
  let reader = uploadedFile.openValueAsBinary();
  let writer = storage.createAsBinary();
  try {
    if (!reader.transferTo(writer, TRANSFER_CHUNK_SIZE)) {
      throwApiError(ERROR_CODE_INTERNAL, 500, 'ファイル書き込みに失敗しました。');
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
// 例外・レスポンス送信
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

## ダウンロード API（sample_api/api/download_file.js）

```javascript
/**
 * ファイルダウンロード REST-API
 *
 * @file download_file.js
 * @description クエリパラメータ fileKey を受け取り、パブリックストレージ配下の
 *              対象ファイルをバイナリで返却する。エラー時は JSON でエラー応答を返す。
 */

// ========================================
// 定数定義
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
// エントリーポイント
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
    let message = apiError.message || '予期しないエラーが発生しました。';

    if (statusCode >= 500) {
      logger.error('[download_file] API 処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('[download_file] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);
    }

    sendJsonResponse({
      error: true,
      errorMessage: '[' + code + '] ' + message
    }, statusCode);
  }
}

// ========================================
// メソッド・セキュアトークン・バリデーション
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンが指定されていません。');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンの検証に失敗しました。');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'セキュアトークンが不正です。');
  }
}

function validateFileKey(fileKey) {
  if (!fileKey || fileKey.length === 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey は必須です。');
  }
  if (fileKey.length > FILE_KEY_MAX_LENGTH) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey が長すぎます。');
  }
  if (!FILE_KEY_PATTERN.test(fileKey)) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey に使用できない文字が含まれています。');
  }
  if (fileKey.indexOf('..') >= 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'fileKey にパス操作文字が含まれています。');
  }
  if (fileKey.indexOf(FILE_KEY_PREFIX) !== 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400,
      'fileKey は ' + FILE_KEY_PREFIX + ' 配下を指定してください。');
  }
  return fileKey;
}

// ========================================
// ビジネスロジック
// ========================================
function resolveFileStorage(fileKey) {
  let storage = new PublicStorage(fileKey);
  if (!storage.exists() || !storage.isFile()) {
    throwApiError(ERROR_CODE_FILE_NOT_FOUND, 404, '指定されたファイルは存在しません。');
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
// 例外・レスポンス送信
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

## テスト画面 ファンクションコンテナ（sample_api/view/file_upload_test.js）

```javascript
/**
 * ファイルアップロード/ダウンロード テスト画面
 *
 * @file file_upload_test.js
 * @description /sample_api/api/upload_file および /sample_api/api/download_file の動作確認用画面。
 */

let $title = 'ファイル アップロード/ダウンロード テスト';
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

## テスト画面 プレゼンテーションページ（sample_api/view/file_upload_test.html）

ファイル選択 → アップロード → fileKey 表示 → ダウンロード入力欄に自動セットの一連の流れを実装したサンプル。
ダウンロードは `fetch` で受け取って Blob 化し、`URL.createObjectURL` 経由でブラウザに保存させる。
こうすることでセキュアトークン付き GET でも問題なくダウンロードできる。

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
  <!-- $data をグローバル領域に置かず IIFE でスコープ化する -->
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
          imuiShowErrorMessage('システムエラーが発生しました。');
          return false;
        }
        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        showUploadResult(result.data);
        imuiShowSuccessMessage('ファイルをアップロードしました。');
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
            imuiShowErrorMessage('システムエラーが発生しました。');
          }
          return false;
        }

        if (!response.ok) {
          imuiShowErrorMessage('ダウンロードに失敗しました。HTTP ' + response.status);
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

        imuiShowSuccessMessage('ファイルをダウンロードしました。');
        return true;
      }

      getElement('upload-button').addEventListener('click', () => {
        const input = getElement(':uploadFile:');
        const files = input.files;
        if (!files || files.length === 0) {
          imuiShowWarningMessage('アップロードするファイルを選択してください。');
          return;
        }
        const file = files[0];
        clearUploadResult();
        uploadFile(file);
      });

      getElement('download-button').addEventListener('click', () => {
        const fileKey = getElement(':downloadFileKey:').value.trim();
        if (!fileKey) {
          imuiShowWarningMessage('ダウンロード対象のファイルキーを入力してください。');
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
        <h2 id="upload-section-title" class="imds-mb-3">アップロード</h2>
        <div class="imds-field" for=":uploadFile:">
          <div class="imds-field-label">
            <label for=":uploadFile:" class="has-text-weight-bold">ファイル</label>
          </div>
          <div class="imds-field-control">
            <div class="file-upload-actions">
              <input type="file" id=":uploadFile:" name="uploadFile" />
              <button type="button" class="imds-button is-primary" id="upload-button">
                <span class="imds-icon"><i class="fa-solid fa-cloud-arrow-up" aria-hidden="true"></i></span>
                <span class="imds-button-text">アップロード</span>
              </button>
            </div>
          </div>
        </div>

        <div id="upload-result" class="upload-result-card" style="display:none;" role="status" aria-live="polite">
          <h3 class="imds-mb-2">アップロード結果</h3>
          <dl>
            <dt>ファイルキー（fileKey）</dt>
            <dd id=":resultFileKey:"></dd>
            <dt>保存ファイル名</dt>
            <dd id=":resultFileName:"></dd>
            <dt>元のファイル名</dt>
            <dd id=":resultOriginalFileName:"></dd>
            <dt>サイズ</dt>
            <dd id=":resultSize:"></dd>
          </dl>
        </div>
      </section>

      <section class="imds-py-3 imds-px-4" aria-labelledby="download-section-title">
        <h2 id="download-section-title" class="imds-mb-3">ダウンロード</h2>
        <div class="imds-field" for=":downloadFileKey:">
          <div class="imds-field-label">
            <label for=":downloadFileKey:" class="has-text-weight-bold">ファイルキー（fileKey）</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":downloadFileKey:" name="downloadFileKey" class="imds-textbox" placeholder="uploads/yyyymmdd_hhmmss_xxxxxxxx/filename.ext" />
          </div>
        </div>
        <div class="file-upload-actions">
          <button type="button" class="imds-button is-primary" id="download-button">
            <span class="imds-icon"><i class="fa-solid fa-cloud-arrow-down" aria-hidden="true"></i></span>
            <span class="imds-button-text">ダウンロード</span>
          </button>
        </div>
      </section>
    </main>
  </div>
</div>
```

---

## ルーティング設定（sample_api.xml）

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

各 `file-mapping` には `<authz uri/action>` を明示し、認可リソースは `jssp-tenant-setup-generator` で定義すること。

---

## 実装ポイント

### ByteReader.read() を直接呼び出さない（最重要）

`reader.read(buffer, 0, chunkSize)` に `buffer = []` を渡しても、空配列のままバイトが格納されず常に 0 を返す。
結果としてループが空回りし、**0 バイトのファイルが保存される**症状が出る。

転送目的なら必ず `reader.transferTo(writer, chunkSize)` を使うこと。詳細は `reference/api-binary-stream.md` を参照。

### 元ファイル名の保持

`uploads/{ユニークディレクトリ}/{safeFileName}` のように **ディレクトリ側でユニーク性を担保**することで、
ファイル名はサニタイズ済みの元ファイル名を保持できる。
ダウンロード時に `Content-Disposition: attachment; filename="..."` で元ファイル名を返せるため、
ユーザにとって自然なダウンロード体験になる。

### ダウンロードのエラー応答

`HTTPResponse.sendMessageBodyAsBinary(storage)` は送信後 JavaScript の実行を停止する。
そのため **fileKey 検証・存在チェックは送信より前に行い、失敗時は JSON エラー応答に切り替える**こと。
クライアント側は Content-Type で分岐し、`application/json` ならエラーメッセージを表示する実装にする。

### サイズ上限

`uploadedFile.getLength()` で **事前にサイズ上限を弾く**こと。
Content-Length が信用できない環境では、本来はストリーム転送中の累積バイト数も監視すべきだが、
標準の `transferTo` には途中打ち切り機構がないため、必要であれば自前でチャンク読み込みを実装する。
通常のケースでは事前チェックで十分。

### セキュアトークン

GET であってもファイル取得は機密データ操作とみなし、`X-Intramart-Secure-Token` を要求する。
ブラウザの `<a href>` 直リンクは使えなくなるため、画面側は `fetch` でレスポンスを Blob として受け取り、
`URL.createObjectURL` 経由でダウンロードさせる。

## 関連

- `reference/api-binary-stream.md` - ByteReader / ByteWriter / RequestParameter の使い方
- `reference/api-storage.md` - PublicStorage の操作全般
- `reference/api-secure-token-manager.md` - CSRF トークンの検証
- `reference/argument-request.md` - Request / RequestParameter のメソッド一覧
- `.claude/rules/jssp-error-handling.md` - エラーコード命名規則と API エラーレスポンス形式
- `.claude/rules/jssp-security.md` - 入力検証・パストラバーサル対策の全体方針
