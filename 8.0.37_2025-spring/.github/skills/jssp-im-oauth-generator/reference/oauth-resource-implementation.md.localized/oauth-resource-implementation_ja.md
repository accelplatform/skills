# OAuth リソースの JSSP 実装方針

OAuth REST-API として呼ばれる JSSP（`.js`）の実装ルール。
基本構造は通常の REST-API（`jssp-page-generator` のファンクションコンテナ）と同じだが、**セキュアトークン検証は不要**（OAuth アクセストークンが認証として機能するため）という点が大きく異なる。

> なお `.html` ペアファイル不要は **通常 REST-API（`/api/` 配下）と OAuth REST-API（`/oauth/` 配下）の両方で共通**。`.html` ペア必須なのは画面（`view/` 配下）だけ。

## 配置先

```
src/main/jssp/src/{機能名}/oauth/{file}.js
```

機能ディレクトリ直下に `oauth/` サブディレクトリを設けて、OAuth 公開する REST-API を集約する。
`{機能名}/view/`・`{機能名}/api/`（CSRF セキュアトークン版 REST-API）・`{機能名}/job/`・`{機能名}/workflow/` 等と並列に並ぶ構造。

`oauth-client-resources-config` の `<client-resource target="..." />` で指定したパスと一致させる。

| `target` 値 | 実体ファイル |
|-------------|--------------|
| `sample_oauth/oauth/get_user` | `src/main/jssp/src/sample_oauth/oauth/get_user.js` |
| `equipment_api/oauth/list` | `src/main/jssp/src/equipment_api/oauth/list.js` |

> **`.html` ペアファイルは作成しないこと。** OAuth リソースはプレゼンテーションページを返さないため不要であり、空の `.html` を置くと混乱の元になる。

## 必須事項

| 項目 | 通常 REST-API | OAuth REST-API |
|------|:-------------:|:--------------:|
| `init(request)` をエントリーポイントとして実装 | ○ | ○ |
| HTTP メソッド検証（405 拒否） | ○ | ○ |
| リクエストパラメータバリデーション（400） | ○ | ○ |
| **セキュアトークン検証** | ○(更新系で必須) | ×(OAuth トークンで認証されるため不要) |
| `Web.getHTTPResponse().setStatus()` で適切な HTTP ステータス | ○ | ○ |
| エラー JSON は `{ error: true, errorMessage: "[コード] メッセージ" }` 形式 | ○ | ○ |
| 正常 JSON は `{ error: false, data: {...} }` 形式 | ○ | ○ |
| バインド変数 (`$data` 等) の使用 | ○(画面側で参照) | ×(HTML を返さないため不要) |

## エントリーポイントの骨格

```javascript
/**
 * {API 名} REST-API（OAuth 公開）
 *
 * @file {file}.js
 * @description {API の説明}
 */

// ========================================
// 定数定義
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.{製品}.{機能}.{API名}.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.{製品}.{機能}.{API名}.00002';
let ERROR_CODE_INTERNAL = 'E.{製品}.{機能}.{API名}.99999';

let ALLOWED_METHODS = ['GET'];   // 公開する HTTP メソッド

// ========================================
// エントリーポイント
// ========================================
/**
 * OAuth REST-API のエントリーポイント。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP メソッドのチェック (405)
    checkMethod(request);
    // リクエストパラメータのバリデーション (400)
    validateRequest(request);
    // ビジネスロジック
    response = {
      error: false,
      data: processBusinessLogic(request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '予期しないエラーが発生しました。';

    if (statusCode >= 500) {
      logger.error('[{API名}] API 処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('[{API名}] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// メソッド・バリデーション
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

function validateRequest(request) {
  // TODO: パラメータバリデーション
}

function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

// ========================================
// ビジネスロジック
// ========================================
function processBusinessLogic(request) {
  // TODO: 業務処理
  return {};
}

// ========================================
// レスポンス送信
// ========================================
function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

## 通常 REST-API との差分（コード上）

セキュアトークン検証関連（`verifySecureToken` 関数・`SecureTokenManager` のインスタンス化・`ERROR_CODE_INVALID_TOKEN` 定数）を **削除** する。
理由は OAuth アクセストークンが認証として機能するため（詳細は `oauth-overview.md` 参照）。
具体的な差分一覧（CSRF セキュアトークン版 → OAuth 版のリライト例）は `assets/sample-oauth-get-user.md`「既存 `sample_api/api/get_user.js` との差分」を参照。

## 認証ユーザの取得

OAuth アクセストークンの所有者である「トークン発行ユーザ」のコンテキストが取得できる。

```javascript
let accountContext = Contexts.getAccountContext();
let userCd = accountContext.userCd;        // ユーザコード
let locale = accountContext.locale;        // ロケール
// ... AccountContext のフィールドはほぼ通常画面と同等
```

> 詳細は `skills/jssp-page-generator/reference/api-account-context.md` を参照すること。

## リクエストパラメータの取得

通常 REST-API と同様、`request[キー]` または `request.getParameter(キー)` で取得できる。

| 取得方法 | 説明 |
|---------|------|
| `request['paramName']` | クエリストリングまたは form パラメータ |
| `request.getMethod()` | `GET` / `POST` / `PUT` / `DELETE` 等 |
| `request.getHeader('Header-Name')` | リクエストヘッダ |
| `request.getContentType()` | Content-Type |
| `request.getInputStream()` | リクエストボディ(バイナリ／JSON 等)。`application/json` を受け取る場合はストリームから読み出す |

`application/json` ボディを受け取る場合の実装パターンは `skills/jssp-page-generator/assets/post-json-api.md` を参照すること(OAuth 版でもボディ取得手順は同じ)。

## レスポンスとステータスコード

```javascript
let httpResponse = Web.getHTTPResponse();
httpResponse.setStatus(statusCode);
httpResponse.setContentType('application/json; charset=utf-8');
httpResponse.sendMessageBodyString(JSON.stringify(response));
```

| ステータス | 用途 |
|-----------|------|
| `200` | 正常応答 |
| `400` | リクエストパラメータ不正 |
| `404` | リソース／ユーザが見つからない |
| `405` | 想定外の HTTP メソッド |
| `500` | サーバ内部エラー |

`401` / `403` は **プラットフォームの OAuth ディスパッチャ側** で返される(トークンが無効・期限切れ・scope 不足)。リソース実装内で組み立てる必要はない。

## 機密情報の取り扱い

- レスポンス JSON に **パスワード・認証トークン・個人情報(マスクなしの電話番号やメール等)を含めない**
- ログ出力時も同様（`{{AGENT_RULES}}/jssp-logging.instructions.md` の `MaskUtil` を活用）
- レスポンスの `userCd`(ユーザコード)は通常の REST-API でも返す情報なので問題ないが、**パスワードハッシュ・セッション ID 等は厳禁**

## 関連リファレンス

- `oauth-overview.md` - 全体像
- `oauth-resources-config.md` - URL マッピングと scope の指定
- `skills/jssp-page-generator/reference/api-web.md` - `Web.getHTTPResponse()` の詳細
- `skills/jssp-page-generator/reference/api-account-context.md` - 認証ユーザコンテキスト
- `skills/jssp-page-generator/reference/argument-request.md` - request 引数
- `{{AGENT_RULES}}/jssp-error-handling.instructions.md` - エラーレスポンス形式・HTTP ステータス
- `{{AGENT_RULES}}/jssp-security.instructions.md` - SQL インジェクション・XSS 対策(OAuth API でも同様に適用)

## チェックリスト

(上の「必須事項」表で網羅される基本項目は省略。実装〜レビュー時に追加で確認すべき固有項目のみ列挙)

- [ ] エラーコードが `E.{製品}.{機能}.{API名}.{連番}` 形式か(5xx に `ERROR_CODE_INTERNAL` を割り当てたか)
- [ ] 4xx 系は `logger.warn`、5xx 系は `logger.error` でログ出力しているか
- [ ] レスポンスに機密情報(パスワード・トークン・マスクなしの個人情報等)が含まれていないか
- [ ] SQL アクセスがある場合は `DbParameter` でバインドしているか(文字列連結禁止、`{{AGENT_RULES}}/jssp-2way-sql.instructions.md` 参照)
- [ ] `Contexts.getAccountContext()` でユーザコンテキストを参照する場合、null チェックを入れているか
