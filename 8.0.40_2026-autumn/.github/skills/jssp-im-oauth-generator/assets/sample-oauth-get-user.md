# 業務ロジック実装サンプル: OAuth 経由のユーザ情報取得 API

ユーザコード（`userCd`）を受け取り、対象のアカウント情報を JSON で返す REST-API の **業務ロジック付き完全版**。
`src/main/jssp/src/sample_api/api/get_user.js`（CSRF セキュアトークン版）を OAuth 版にリライトしたもの。

## 機能仕様

| 項目 | 内容 |
|------|------|
| 機能名 | `sample_oauth` |
| API 名 | ユーザ情報取得 |
| 公開 URL | `/oauth/sample_oauth/get_user` |
| HTTP メソッド | `GET` |
| クエリパラメータ | `userCd`（必須、最大 100 文字、`[0-9A-Za-z_@.+!\-]+`） |
| 必要な scope | `sample_oauth_user_read` |
| 認可 | `welcome-all`（認可判定スキップ、scope のみで制御） |
| 認証 | OAuth アクセストークン（`Authorization: Bearer ...`） |
| レスポンス | `application/json` |

## ファイル構成

| # | ファイル | 生成方法 |
|---|---------|---------|
| 1 | `src/main/conf/oauth-client-scopes-config/sample_oauth.xml` | `scripts/build-oauth.js` が自動生成 |
| 2 | `src/main/conf/oauth-client-resources-config/sample_oauth.xml` | 同上 |
| 3 | `src/main/conf/oauth-client-details-config/sample_oauth.xml` | 同上 |
| 4 | `src/main/jssp/src/sample_oauth/oauth/get_user.js` | `build-oauth.js` が骨格を生成、業務ロジックは **本ファイルを写経して手動補完** |

### 1〜3 の XML 生成手順

[examples/sample_oauth.spec.json](../examples/sample_oauth.spec.json) を入力として `build-oauth.js` を実行すると、上記 4 ファイルが一括出力される。

```bash
node .github/skills/jssp-im-oauth-generator/scripts/build-oauth.js \
     .github/skills/jssp-im-oauth-generator/examples/sample_oauth.spec.json
```

生成された実 XML の中身は以下を参照:
- `src/main/conf/oauth-client-scopes-config/sample_oauth.xml`
- `src/main/conf/oauth-client-resources-config/sample_oauth.xml`
- `src/main/conf/oauth-client-details-config/sample_oauth.xml`

> **注意:** `client-secret` と `redirect-uri` はプロジェクト固有値。リポジトリ管理する場合はダミー値で書き、本番環境向けには Importer のフィルタ置換またはテナント環境セットアップ時に差し替えること。

---

## 4. リソース実装（.js）— 業務ロジック付き完全版

`src/main/jssp/src/sample_oauth/oauth/get_user.js`

`build-oauth.js` は `init` / `checkMethod` / `validateRequest` / `throwApiError` / `sendJsonResponse` の **共通骨格** までを自動生成する。
`processBusinessLogic` の中身は以下を **写経** して機能ごとに書き換える。

```javascript
/**
 * ユーザ情報取得 REST-API（OAuth 公開版）
 *
 * @file get_user.js
 * @description リクエストパラメータ userCd を受け取り、対象ユーザのアカウント情報を JSON で返却する。
 *              OAuth アクセストークンによる認証が必要（scope: sample_oauth_user_read）。
 */

// ========================================
// 定数定義
// ========================================
let USER_CD_MAX_LENGTH = 100;
let USER_CD_PATTERN = /^[0-9A-Za-z_@.+!\-]+$/;

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE_OAUTH.GET_USER.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE_OAUTH.GET_USER.00002';
let ERROR_CODE_USER_NOT_FOUND = 'E.IWP.SAMPLE_OAUTH.GET_USER.00004';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE_OAUTH.GET_USER.99999';

let ALLOWED_METHODS = ['GET'];

// ========================================
// エントリーポイント
// ========================================
/**
 * OAuth REST-API のエントリーポイント。
 * GET パラメータ userCd を受け取り、対応するアカウント情報を JSON 形式で返却します。
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
    // ビジネスロジック（ユーザ未存在は 404、その他例外は 500）
    let userInfo = getUserInfo(request['userCd']);
    if (userInfo === null) {
      throwApiError(ERROR_CODE_USER_NOT_FOUND, 404, '指定されたユーザは存在しません。');
    }
    response = {
      error: false,
      data: userInfo,
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || '予期しないエラーが発生しました。';

    if (statusCode >= 500) {
      logger.error('[sample_oauth/get_user] API 処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('[sample_oauth/get_user] API リクエストが受理できませんでした。code={} status={} message={}', [code, statusCode, message]);
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
/**
 * HTTP メソッドが許可されているかチェックします。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'メソッド ' + method + ' は許可されていません。');
  }
}

/**
 * リクエストパラメータの検証を行います。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function validateRequest(request) {
  let userCd = request['userCd'];

  if (!userCd || userCd.length === 0) {
    throwValidationError('userCd は必須です。');
  } else if (userCd.length > USER_CD_MAX_LENGTH) {
    throwValidationError('userCd は最大' + USER_CD_MAX_LENGTH + '文字です。');
  } else if (!USER_CD_PATTERN.test(userCd)) {
    throwValidationError('userCd の形式が正しくありません。');
  }
}

/**
 * バリデーションエラー（400）をスローします。
 *
 * @param {string} message - エラーメッセージ
 */
function throwValidationError(message) {
  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);
}

/**
 * エラーコード・HTTP ステータス付きで例外をスローします。
 *
 * @param {string} code - エラーコード
 * @param {number} httpStatus - HTTP ステータスコード
 * @param {string} message - エラーメッセージ
 */
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ユーザコードを指定してアカウント情報を取得します。
 *
 * @param {string} userCd - ユーザコード
 * @return {Object|null} JSON 出力用のユーザ情報。存在しない場合は null
 */
function getUserInfo(userCd) {
  let manager = new AccountInfoManager();
  let result = manager.getAccountInfo(userCd);

  if (result.error) {
    throwApiError(ERROR_CODE_INTERNAL, 500, result.errorMessage || 'アカウント情報の取得に失敗しました。');
  }

  let account = result.data;
  if (!account) {
    return null;
  }

  return convertAccountInfoToJson(account);
}

/**
 * AccountInfo を JSON 出力用オブジェクトに変換します。
 * password 等の機密項目はレスポンスに含めません。
 *
 * @param {Object} account - AccountInfo
 * @return {Object} JSON 出力用オブジェクト
 */
function convertAccountInfoToJson(account) {
  return {
    userCd: account.userCd,
    locale: account.locale,
    timeZoneId: account.timeZoneId,
    encoding: account.encoding,
    calendarId: account.calendarId,
    firstDayOfWeek: account.firstDayOfWeek,
    validStartDate: formatDate(account.validStartDate),
    validEndDate: formatDate(account.validEndDate),
    lockDate: formatDate(account.lockDate),
    loginFailureCount: account.loginFailureCount
  };
}

/**
 * Date を YYYY-MM-DD 形式の文字列にフォーマットします。
 *
 * @param {Date|null} value - 日付値
 * @return {string|null} フォーマット済み文字列。null/不正値の場合は null
 */
function formatDate(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (isNaN(value.getTime())) {
    return null;
  }
  return value.getFullYear() + '-' + padZero(value.getMonth() + 1) + '-' + padZero(value.getDate());
}

/**
 * 1桁の数値を 2 桁表記にゼロパディングします。
 *
 * @param {number} number - 数値
 * @return {string} ゼロパディング済み文字列
 */
function padZero(number) {
  return number < 10 ? '0' + number : String(number);
}

// ========================================
// レスポンス送信
// ========================================
/**
 * JSON レスポンスを送信します。送信後、JavaScript の実行は停止します。
 *
 * @param {Object} response - 送信するレスポンスオブジェクト
 * @param {number} statusCode - HTTP ステータスコード
 */
function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

---

## 既存 `sample_api/api/get_user.js` との差分

OAuth 版で **削除** している要素:

| 削除箇所 | 理由 |
|---------|------|
| `verifySecureToken()` 関数と呼び出し | OAuth アクセストークンが認証として機能するため、CSRF セキュアトークン検証は不要 |
| `ERROR_CODE_INVALID_TOKEN` 定数 | 上記関数を削除したため未使用になる |
| `SecureTokenManager` のインスタンス化 | 上記関数を削除したため不要 |

その他のロジック（HTTP メソッド検証・パラメータバリデーション・ビジネスロジック・JSON レスポンス組み立て）は変更なし。

## 動作確認の流れ

1. ビルド・デプロイ後、テナント管理 → OAuth 管理画面で、自動登録された scope / client / resource を確認
2. クライアントアプリケーションから認可コードフロー（Authorization Code + PKCE）でアクセストークンを取得
3. 以下のような HTTP リクエストで API を呼び出す:

   ```
   GET /imart/oauth/sample_oauth/get_user?userCd=aoyagi
   Authorization: Bearer {取得したアクセストークン}
   ```

4. 成功時のレスポンス例:

   ```json
   {
     "error": false,
     "data": {
       "userCd": "aoyagi",
       "locale": "ja",
       "timeZoneId": "Asia/Tokyo",
       "encoding": "UTF-8",
       ...
     }
   }
   ```

5. アクセストークンが無効／scope 不足の場合は、プラットフォーム側で `401 Unauthorized` / `403 Forbidden` が返る（init 関数は呼ばれない）
