# 生 JSON 受信 REST-API テンプレート

## 概要

POST メソッドでリクエストボディに送信された生 JSON（`application/json`）を受け取り、パース結果のサマリを JSON で返却するエコー型 API と、その動作確認用画面のテンプレート。

- 受信 API: `POST /sample_api/api/post_json`（`Content-Type: application/json` 必須、`X-Intramart-Secure-Token` 必須）
- テスト画面: `/sample_api/view/post_json_test`

このテンプレートは「ボディの raw JSON を `request.getMessageBodyAsString()` で取得して `JSON.parse` する」パターンの **正準形** として使用する。multipart/form-data のファイル受信は `file-upload-download-api.md` を使うこと。

## 別カテゴリで利用する場合の置換ポイント

このアセットは `sample_api` をカテゴリ名として記述している。別の機能名（例: `inventory_api`）で利用する場合は、以下をすべて一括置換すること。**置換漏れがあるとビルドは通るがエラーコードの整合性が崩れたり API URL がずれるリスクがある。**

| 種類 | 置換対象 | 置換例 |
|------|----------|--------|
| 配置パス | `src/main/tssp/src/sample_api/` | `src/main/tssp/src/{機能名}/` |
| API URL（ルーティング XML の `path`） | `/sample_api/api/post_json` | `/{機能名}/post_json` 等 |
| ルーティング XML の `page` 属性 | `sample_api/api/post_json`、`sample_api/view/post_json_test` | `{機能名}/api/post_json` 等 |
| HTML 側の `POST_JSON_API_PATH` | `'sample_api/api/post_json'` | `'{機能名}/post_json'` |
| エラーコードのプレフィックス | `E.IWP.SAMPLE.POST_JSON.*` | `E.IWP.{機能名大文字}.POST_JSON.*` 等 |
| `$subTitle` | `'sample_api'` | `'{機能名}'` |
| ログタグ | `[post_json]` | （変更不要） |

カテゴリ名置換は**サンプル全体を 1 文字ずつ確認**して行うこと。`grep -n 'sample_api\|SAMPLE\.' {新カテゴリのファイル}` で残骸がないか必ず検証する。

## ファイル構成

```
src/main/tssp/src/sample_api/
  ├── api/
  │    └── post_json.ts          # 生 JSON 受信 API
  └── view/
       ├── post_json_test.ts     # テスト画面 ファンクションコンテナ
       └── post_json_test.html   # テスト画面 プレゼンテーションページ

src/main/conf/routing-jssp-config/
  └── sample_api.xml             # ルーティング設定
```

## 設計ポイント

### リクエストボディの取得

生 JSON を取得するには `request.getMessageBodyAsString()` を使う。
内部で ServletRequest のエンコーディング設定に従って Unicode 文字列へ変換されるため、`Content-Type` ヘッダの `charset` で挙動を制御する。クライアントは `Content-Type: application/json; charset=utf-8` で送信すること。

### Content-Type の検証

`request.getContentType()` を取得し、先頭が `application/json` であることを確認する。
これを怠ると、`application/x-www-form-urlencoded` で送信された値を JSON としてパースしようとして 500 系エラーを返す事故が起きる。

### ボディサイズ上限

`request.getContentLength()` で **事前にサイズ上限を弾く**こと（既定 1MB）。
攻撃者が巨大な JSON を送り込んでメモリを圧迫するリスクを抑える。

### セキュリティ

| 項目 | 対策 |
|------|------|
| CSRF | `X-Intramart-Secure-Token` 検証（POST のため必須） |
| 不正な Content-Type | `application/json` プレフィックスを厳格チェック |
| サイズ攻撃 | `getContentLength()` で事前に上限チェック（既定 1MB） |
| 不正な JSON | `JSON.parse` の例外を 400 として返却 |

### エラー応答

- 成功時: `application/json` で `{error:false, data:{...}}`
- 失敗時: `application/json` で `{error:true, errorMessage:"[コード] メッセージ"}` を HTTP 4xx/5xx と共に返す
- エラーコード命名は `.claude/rules/jssp-error-handling.md` に従う

### `ApiError` 型の扱い

`Error` は `code` / `httpStatus` を持たないため、`Error` を拡張した `interface ApiError` を API ファイルごとに定義し、`new Error(message) as ApiError` と catch の `e as ApiError` でキャストする（コード例参照）。
`tssp build` の型検査では各 `.ts` が独立したモジュールになるので、同一機能フォルダに複数の API ファイルを置いても `interface ApiError` は `TS2300 Duplicate identifier` にならない。複数の API ファイルで同じ型を使い回す場合は、型だけを書いた `.ts`（例: `src/main/tssp/src/{機能名}/common/api_types.ts`）に `export interface ApiError` と書き、各 API ファイルで `import type { ApiError } from '../common/api_types';` と読み込む。型は出力に残らないので、`load()` は要らない。

---

## 生 JSON 受信 API（sample_api/api/post_json.ts）

```typescript
/**
 * 生 JSON 受信 REST-API
 *
 * @file post_json.ts
 * @description POST メソッドでリクエストボディに送信された生 JSON を受け取り、
 *              パース結果のサマリ（型・キー数・受信内容）を JSON で返却するエコー型 API。
 */

// ========================================
// 定数定義
// ========================================
let CONTENT_TYPE_JSON_PREFIX = 'application/json';
let MAX_BODY_LENGTH_BYTES = 1 * 1024 * 1024;

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.POST_JSON.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.POST_JSON.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.POST_JSON.00003';
let ERROR_CODE_INVALID_CONTENT_TYPE = 'E.IWP.SAMPLE.POST_JSON.00004';
let ERROR_CODE_BODY_TOO_LARGE = 'E.IWP.SAMPLE.POST_JSON.00005';
let ERROR_CODE_INVALID_JSON = 'E.IWP.SAMPLE.POST_JSON.00006';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.POST_JSON.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// 型定義
// ========================================
/** レスポンスに含めるサマリ情報（buildSummary の戻り値） */
interface JsonSummary {
  receivedAt: string;           // 受信日時（YYYY-MM-DD HH:mm:ss）
  contentType: string | null;   // リクエストの Content-Type
  contentLength: number;        // リクエストの Content-Length（不明な場合 -1）
  valueType: string;            // パース結果の型名
  received: unknown;            // パース結果
  keyCount?: number;            // キーの数（オブジェクトの場合のみ）
  keys?: string[];              // キー名の一覧（オブジェクトの場合のみ）
  itemCount?: number;           // 要素数（配列の場合のみ）
}

/** API のレスポンス */
interface ApiResponse {
  error: boolean;
  data?: JsonSummary;           // サマリ情報（正常時のみ）
  errorMessage?: string;        // [エラーコード] メッセージ（エラー時のみ）
}

/** エラーコード・HTTP ステータス付きの例外 */
interface ApiError extends Error {
  code: string;
  httpStatus: number;
}

// ========================================
// エントリーポイント
// ========================================
/**
 * REST-API のエントリーポイント。
 * リクエストボディの生 JSON を受け取り、サマリ情報を JSON 形式で返却します。
 *
 * @param request - リクエストオブジェクト
 */
export function init(request: Request): void {
  let logger = Logger.getLogger();
  let response: ApiResponse;
  let statusCode = 200;

  try {
    checkMethod(request);
    verifySecureToken(request);
    checkContentType(request);
    let parsedBody = readJsonBody(request);
    response = {
      error: false,
      data: buildSummary(parsedBody, request),
    };
  } catch (e) {
    let apiError = e as ApiError;
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '予期しないエラーが発生しました。';

    if (statusCode >= 500) {
      logger.error('[post_json] API 処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('[post_json] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// メソッド・セキュアトークン・コンテンツタイプ検証
// ========================================
/**
 * HTTP メソッドが許可されているかチェックします。
 *
 * @param request - リクエストオブジェクト
 */
function checkMethod(request: Request): void {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

/**
 * セキュアトークン（CSRF 対策）の検証を行います。
 *
 * @param request - リクエストオブジェクト
 */
function verifySecureToken(request: Request): void {
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

/**
 * Content-Type が application/json 系であるかをチェックします。
 *
 * @param request - リクエストオブジェクト
 */
function checkContentType(request: Request): void {
  let contentType = request.getContentType();
  if (!contentType) {
    throwApiError(ERROR_CODE_INVALID_CONTENT_TYPE, 400,
      'Content-Type が指定されていません。application/json で送信してください。');
  }
  let normalized = String(contentType).toLowerCase();
  if (normalized.indexOf(CONTENT_TYPE_JSON_PREFIX) !== 0) {
    throwApiError(ERROR_CODE_INVALID_CONTENT_TYPE, 400,
      'Content-Type は application/json を指定してください。received=' + contentType);
  }
}

// ========================================
// ボディ取得・JSON パース
// ========================================
/**
 * リクエストボディを取得し、JSON としてパースします。
 *
 * @param request - リクエストオブジェクト
 * @return パース結果（オブジェクト、配列、プリミティブ）
 */
function readJsonBody(request: Request): unknown {
  let contentLength = request.getContentLength();
  if (contentLength > MAX_BODY_LENGTH_BYTES) {
    throwApiError(ERROR_CODE_BODY_TOO_LARGE, 400,
      'リクエストボディが上限（' + MAX_BODY_LENGTH_BYTES + ' バイト）を超えています。');
  }

  let body = request.getMessageBodyAsString();
  if (!body || body.length === 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'リクエストボディが空です。');
  }

  if (body.length > MAX_BODY_LENGTH_BYTES) {
    throwApiError(ERROR_CODE_BODY_TOO_LARGE, 400,
      'リクエストボディが上限（' + MAX_BODY_LENGTH_BYTES + ' 文字）を超えています。');
  }

  try {
    return JSON.parse(body);
  } catch (e) {
    throwApiError(ERROR_CODE_INVALID_JSON, 400,
      'JSON のパースに失敗しました。message=' + (e as Error).message);
  }
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * パース済みボディから、レスポンスに含めるサマリ情報を生成します。
 *
 * @param parsedBody - パース済みリクエストボディ
 * @param request - リクエストオブジェクト
 * @return レスポンスデータ
 */
function buildSummary(parsedBody: unknown, request: Request): JsonSummary {
  let valueType = detectValueType(parsedBody);
  let summary: JsonSummary = {
    receivedAt: formatDateTime(new Date()),
    contentType: request.getContentType(),
    contentLength: request.getContentLength(),
    valueType: valueType,
    received: parsedBody,
  };

  if (parsedBody instanceof Array) {
    summary.itemCount = parsedBody.length;
  } else if (typeof parsedBody === 'object' && parsedBody !== null) {
    let keys = Object.keys(parsedBody);
    summary.keyCount = keys.length;
    summary.keys = keys;
  }

  return summary;
}

/**
 * 値の型を判定します。
 *
 * @param value - 判定対象の値
 * @return 型名（object / array / string / number / boolean / null）
 */
function detectValueType(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  if (value instanceof Array) {
    return 'array';
  }
  return typeof value;
}

/**
 * Date を YYYY-MM-DD HH:mm:ss 形式の文字列にフォーマットします。
 *
 * @param value - 日時値
 * @return フォーマット済み文字列
 */
function formatDateTime(value: Date): string {
  return value.getFullYear()
    + '-' + padZero(value.getMonth() + 1)
    + '-' + padZero(value.getDate())
    + ' ' + padZero(value.getHours())
    + ':' + padZero(value.getMinutes())
    + ':' + padZero(value.getSeconds());
}

/**
 * 1桁の数値を 2 桁表記にゼロパディングします。
 *
 * @param value - 数値
 * @return ゼロパディング済み文字列
 */
function padZero(value: number): string {
  return value < 10 ? '0' + value : String(value);
}

// ========================================
// 例外・レスポンス送信
// ========================================
/**
 * エラーコード・HTTP ステータス付きで例外をスローします。
 *
 * @param code - エラーコード
 * @param httpStatus - HTTP ステータスコード
 * @param message - エラーメッセージ
 */
function throwApiError(code: string, httpStatus: number, message: string): never {
  let error = new Error(message) as ApiError;
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

/**
 * JSON レスポンスを送信します。送信後、JavaScript の実行は停止します。
 *
 * @param response - 送信するレスポンスオブジェクト
 * @param statusCode - HTTP ステータスコード
 */
function sendJsonResponse(response: ApiResponse, statusCode: number): void {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

---

## テスト画面 ファンクションコンテナ（sample_api/view/post_json_test.ts）

```typescript
/**
 * 生 JSON 受信 REST-API テスト画面
 *
 * @file post_json_test.ts
 * @description /sample_api/api/post_json の動作確認用画面。
 *              リクエスト JSON をテキストエリアに入力し、レスポンスを画面上に表示する。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
export let $title = '生 JSON 受信 API テスト';
export let $subTitle = 'sample_api';
export let $data = '{}';

// ========================================
// 型定義
// ========================================
/** プレゼンテーションページに渡す処理結果 */
interface ViewResponse {
  result: object;
  error: {
    code: string;               // エラーコード
    message: string;            // エラーメッセージ
  };
}

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 *
 * @param request - リクエストオブジェクト
 */
export function init(request: Request): void {
  let response: ViewResponse = {
    result: {},
    error: {
      code: '',
      message: '',
    },
  };
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

---

## テスト画面 プレゼンテーションページ（sample_api/view/post_json_test.html）

リクエストボディ用のテキストエリアと、レスポンス表示用のテキストエリアを並べた検証画面。
「サンプル読み込み」で動作確認用 JSON を流し込み、「送信」で `fetch` し、HTTP ステータス・受信タイプ・サマリ・レスポンスボディを表示する。

```html
<imart type="head">
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <style>
    .post-json-actions {
      display: flex;
      gap: 0.75em;
      align-items: center;
      margin-top: 0.5em;
    }
    .post-json-response {
      background-color: var(--imds-color-background-secondary, #f5f7fa);
      border: 1px solid var(--imds-color-border, #d0d7de);
      border-radius: 0.5em;
      padding: 1em 1.5em;
      margin-top: 1em;
    }
    .post-json-response-meta {
      display: flex;
      gap: 1.5em;
      flex-wrap: wrap;
      margin-bottom: 0.75em;
      font-size: 0.875em;
    }
    .post-json-response-meta dt {
      font-weight: bold;
      display: inline;
      margin-right: 0.5em;
    }
    .post-json-response-meta dd {
      display: inline;
      margin: 0;
    }
    .post-json-response-body {
      width: 100%;
      min-height: 12em;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
    .post-json-request-body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
  </style>
  <!-- $data をグローバル領域に置かず IIFE でスコープ化する -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      const POST_JSON_API_PATH = 'sample_api/api/post_json';
      const SAMPLE_REQUEST = {
        userId: 'user001',
        userName: '山田太郎',
        age: 30,
        roles: ['admin', 'user'],
        active: true
      };

      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      function getElement(id) {
        return document.getElementById(id);
      }

      function clearResponse() {
        getElement('post-json-response').style.display = 'none';
        getElement(':responseStatus:').textContent = '';
        getElement(':responseValueType:').textContent = '';
        getElement(':responseSummary:').textContent = '';
        getElement(':responseBody:').value = '';
      }

      function showResponse(status, result) {
        getElement(':responseStatus:').textContent = String(status);

        if (result && result.error === false && result.data) {
          const data = result.data;
          getElement(':responseValueType:').textContent = data.valueType || '';
          let summaryParts = [];
          if (data.keyCount !== undefined) {
            summaryParts.push('keys=' + data.keyCount);
          }
          if (data.itemCount !== undefined) {
            summaryParts.push('items=' + data.itemCount);
          }
          if (data.contentLength !== undefined) {
            summaryParts.push('contentLength=' + data.contentLength);
          }
          getElement(':responseSummary:').textContent = summaryParts.join(' / ');
        } else {
          getElement(':responseValueType:').textContent = '';
          getElement(':responseSummary:').textContent = '';
        }

        getElement(':responseBody:').value = JSON.stringify(result, null, 2);
        getElement('post-json-response').style.display = '';
      }

      async function sendPostJson(rawBody) {
        const response = await fetch(POST_JSON_API_PATH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Intramart-Secure-Token': getSecureToken()
          },
          body: rawBody
        });

        let result = null;
        try {
          result = await response.json();
        } catch (error) {
          result = null;
        }

        if (!result) {
          imuiShowErrorMessage('レスポンスを JSON として読み取れませんでした。');
          showResponse(response.status, { error: true, errorMessage: '(JSON parse failed)' });
          return false;
        }

        showResponse(response.status, result);

        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        imuiShowSuccessMessage('リクエストを送信しました。');
        return true;
      }

      getElement('send-button').addEventListener('click', () => {
        const rawBody = getElement(':requestBody:').value;
        if (!rawBody || rawBody.trim().length === 0) {
          imuiShowWarningMessage('リクエストボディを入力してください。');
          return;
        }
        clearResponse();
        sendPostJson(rawBody);
      });

      getElement('load-sample-button').addEventListener('click', () => {
        getElement(':requestBody:').value = JSON.stringify(SAMPLE_REQUEST, null, 2);
        clearResponse();
      });

      getElement('clear-button').addEventListener('click', () => {
        getElement(':requestBody:').value = '';
        clearResponse();
      });

      if ($data.error && $data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container">
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-code"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1 id="page-title"><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <main>
    <imart type="imSecureToken" />

    <section class="imds-py-3 imds-px-4" aria-labelledby="request-section-title">
      <h2 id="request-section-title" class="imds-mb-3">リクエスト</h2>
      <div class="imds-field" for=":requestBody:">
        <div class="imds-field-label">
          <label for=":requestBody:" class="has-text-weight-bold">JSON ボディ</label>
        </div>
        <div class="imds-field-control">
          <textarea
            id=":requestBody:"
            name="requestBody"
            class="imds-textarea post-json-request-body"
            rows="10"
            placeholder='{ "key": "value" }'></textarea>
          <span class="imds-help-text">POST メソッドで Content-Type: application/json として送信されます。</span>
        </div>
      </div>
      <div class="post-json-actions">
        <button type="button" class="imds-button is-primary" id="send-button">
          <span class="imds-icon"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></span>
          <span class="imds-button-text">送信</span>
        </button>
        <button type="button" class="imds-button is-outlined" id="load-sample-button">
          <span class="imds-button-text">サンプル読み込み</span>
        </button>
        <button type="button" class="imds-button is-ghost" id="clear-button">
          <span class="imds-button-text">クリア</span>
        </button>
      </div>
    </section>

    <section class="imds-py-3 imds-px-4" aria-labelledby="response-section-title">
      <h2 id="response-section-title" class="imds-mb-3">レスポンス</h2>
      <div id="post-json-response" class="post-json-response" style="display:none;" role="status" aria-live="polite">
        <dl class="post-json-response-meta">
          <div>
            <dt>HTTP ステータス</dt>
            <dd id=":responseStatus:"></dd>
          </div>
          <div>
            <dt>受信タイプ</dt>
            <dd id=":responseValueType:"></dd>
          </div>
          <div>
            <dt>サマリ</dt>
            <dd id=":responseSummary:"></dd>
          </div>
        </dl>
        <div class="imds-field" for=":responseBody:">
          <div class="imds-field-label">
            <label for=":responseBody:" class="has-text-weight-bold">レスポンスボディ</label>
          </div>
          <div class="imds-field-control">
            <textarea
              id=":responseBody:"
              name="responseBody"
              class="imds-textarea post-json-response-body"
              rows="15"
              readonly></textarea>
          </div>
        </div>
      </div>
    </section>
  </main>
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

  <file-mapping path="/sample_api/api/post_json" page="sample_api/api/post_json">
    <authz uri="service://sample_api/api/post_json" action="execute" />
  </file-mapping>

  <file-mapping path="/sample_api/view/post_json_test" page="sample_api/view/post_json_test">
    <authz uri="service://sample_api/view/post_json_test" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

各 `file-mapping` には `<authz uri/action>` を明示し、認可リソースは `jssp-tenant-setup-generator` で定義すること。

---

## 実装ポイント

### `getMessageBodyAsString()` は POST/PUT/PATCH のみで使用する

GET リクエストではメッセージボディは仕様上空になるため、`getMessageBodyAsString()` を呼び出してもエラーは起きないが空文字を返す。本テンプレートは POST 限定だが、PUT/PATCH 対応に拡張する場合は `ALLOWED_METHODS = ['POST', 'PUT', 'PATCH']` のように追加するだけでよい。

### `JSON.parse` の例外は必ず捕捉する

クライアント由来の不正な JSON 文字列は **400 で返す**こと。`try` で囲まずに `JSON.parse` を呼ぶと 500 として返ってしまい、サーバ障害と区別がつかなくなる。

### パース結果は `unknown` で受ける

`JSON.parse()` の戻り値は `any` なので、`readJsonBody()` の戻り値の型は `unknown` にして `any` を広げない。値を使う前に `instanceof Array` や `typeof` で型を絞り込む（`buildSummary()` 参照）。決まった形の JSON を受け取る API では、その形を `interface` で定義し、各項目の型を検証してから代入する。

### サイズチェックは Content-Length と文字列長の両方で行う

`getContentLength()` は HTTP ヘッダ由来の宣言値であり、悪意のクライアントが偽る可能性がある。`getMessageBodyAsString()` で取得した文字列長も合わせてチェックすることで二重防御になる。

### Content-Type 検証の正規化

`Content-Type` は `application/json; charset=utf-8` のようにパラメータ付きで来るため、**先頭一致**（`indexOf(...) === 0`）でチェックすること。等価比較 (`===`) では charset 指定で必ずミスマッチになる。

### セキュアトークン

POST は更新操作とみなして `X-Intramart-Secure-Token` を要求する。
クライアント側は `<meta name="im_secure_token">` から取得して `fetch` のヘッダに付与する（実装例は本ファイル「テスト画面 プレゼンテーションページ」を参照）。

### `ApiError` は `interface` で定義する（再掲）

**API ファイルごとに `interface ApiError extends Error` を定義し、`as ApiError` でキャストするのが本テンプレートの標準形**。各 `.ts` は独立したモジュールとして型検査されるので、ファイルごとに定義しても衝突しない。複数の API ファイルで共有する場合は、型だけを書いた `.ts` に置いて `import type { ApiError } from '../common/api_types';` で読み込む（`load()` は要らない）。JSDoc のインライン `@type` 注釈（`/** @type {...} */ (e)`）は `.ts` の型検査では無視されるので使わない。詳細は `.claude/rules/jssp-error-handling.md` を参照。

## 関連

- `reference/argument-request.md` - `request.getMessageBodyAsString()` の仕様
- `reference/api-secure-token-manager.md` - CSRF トークンの検証
- `reference/secure-token-check.md` - クライアント＋サーバの一連の検証パターン
- `.claude/rules/jssp-error-handling.md` - エラーコード命名規則と API エラーレスポンス形式
- `.claude/rules/jssp-security.md` - 入力検証の全体方針
- `assets/file-upload-download-api.md` - multipart/form-data（ファイル）の場合
