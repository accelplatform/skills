# エラーハンドリング規約

> **適用範囲**: 🟢 **常時** — 全ての JSSP 実装で適用。try-catch・エラーレスポンス構造・エラーコード命名等。

## 基本原則

1. エラーは必ずキャッチして適切に処理する
2. **リカバリ可能なエラー**と**リカバリ不可なエラー**を区別する
3. ユーザ向けメッセージは一般化する
4. 詳細情報はログに出力する
5. **機密情報はログに含めない**

## エラーの種別と処理方式

エラーは「リカバリ可能」「リカバリ不可」の2種類に分類し、それぞれ異なる方式で処理する。

### リカバリ可能なエラー（バインド変数方式）

ユーザが入力を修正したり、再操作することで解決可能なエラー。

**例:**

- 入力値のバリデーションエラー（ファンクションコンテナ内で検証し、エラーページへ遷移）
- API呼び出し時のバリデーションエラー（レスポンスにエラーを含める）

**実装パターン（画面）:**

```javascript
let $data = '{}';

function init(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',
      message: '',
    },
  };

  try {
    // リクエストパラメータのバリデーション
    validateRequest(request);
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E001', '予期しないエラーが発生しました。');
  }

  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function transferErrorPage(code, message) {
  let param = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### リカバリ不可なエラー（画面遷移方式）

システム障害など、ユーザの操作では解決できないエラー。

**例:**

- データベース接続エラー
- 外部API接続エラー
- 想定外の例外
- セッション切れ

**実装パターン:**

```javascript
function init(request) {
  let logger = Logger.getLogger();
  try {
    // 処理
  } catch (e) {
    logger.error('システムエラー: {}', e.message);
    transferErrorPage('E001', '予期しないエラーが発生しました。');
  }
}

function transferErrorPage(code, message) {
  let param = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

## エラー情報の構造（画面）

画面のバインド変数 `$data` に格納するレスポンスは、以下の構造をとる。

```javascript
let response = {
  result: null,          // 正常時の処理結果
  error: {
    code: 'E001',        // エラーコード
    message: 'エラーメッセージ', // ユーザ向けメッセージ
  },
};
```

## API レスポンスの構造（JSON）

JSON で返却する REST-API のレスポンスは、以下の 2 形式のいずれかをとる。

### 正常時

```json
{
  "error": false,
  "data": { ... }
}
```

### エラー時

```json
{
  "error": true,
  "errorMessage": "[E.IWP.FOO.BAR.00001] エラーメッセージ"
}
```

- `error` は真偽値。`true` のときのみ `errorMessage` を持ち、`false` のときのみ `data` を持つ（両方を混在させない）
- `errorMessage` は `[エラーコード] メッセージ` の形式で、先頭の角括弧にエラーコードを埋め込む。エラーコードを独立フィールドとして持たないこと

### エラーコードの命名規則

エラーコードは `E.<製品>.<モジュール>.<サブモジュール>.<連番>` の形式で命名する。

| セグメント | 内容 | 例 |
|-----------|------|-----|
| `E` | エラーであることを示す固定値 | `E` |
| `<製品>` | プロダクト識別子（プロジェクト共通） | `IWP` |
| `<モジュール>` | 機能カテゴリ | `EQUIP`, `WORKFLOW` |
| `<サブモジュール>` | 機能内の分類 | `LENDING`, `MASTER` |
| `<連番>` | 5 桁の通し番号 | `00001` |

例: `E.IWP.EQUIP.LENDING.00001`

### HTTP ステータスコード

JSON を返す REST-API では、エラー内容に応じて以下のステータスコードを返却する。
ステータスコードは `httpResponse.setStatus(sc)` で設定する。

| ステータス | 用途 |
|-----------|------|
| `200` | 正常終了 |
| `400` | リクエストパラメータのバリデーションエラー、セキュアトークン検証エラー |
| `405` | 想定外の HTTP メソッド |
| `500` | サーバ内部エラー（DB エラー、想定外の例外等） |

**補足:**
- `401` (Unauthorized) / `403` (Forbidden) は intra-mart プラットフォーム側で判定され、`init` 関数に到達する前に返却されるため、アプリケーション側での実装は不要
- スローする Error オブジェクトに `httpStatus` プロパティを付与し、catch 側で取り出して `setStatus()` に渡すパターンを推奨（実装例は後述「APIのエラーハンドリング」を参照）

### セキュアトークン（CSRF 対策）

更新系の API（POST/PUT/DELETE）では、CSRF 対策として **セキュアトークンの検証** を必ず実施する。

- クライアントはリクエストヘッダ `X-Intramart-Secure-Token` にトークンを付与して送信する（→ `jssp-presentation-page.md`）
- サーバ側は `SecureTokenManager.verify(token)` で検証し、失敗時は **400** で `{error: true, errorMessage}` を返却する
- トークン未付与・検証失敗・有効期限切れはすべて 400 として扱う
- 参照系（GET）でも、機密データを返す場合は同様に検証する

## プレゼンテーションページでのエラー表示

```html
<script>
  const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

  document.addEventListener('DOMContentLoaded', function() {
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      renderPage($data.result);
    }
  });

  function renderPage(result) {
    // 画面の描画処理
  }
</script>
```

## エラーメッセージのガイドライン

### ユーザ向けメッセージ

| 種別 | メッセージ例 |
|-----|-----|
| 入力エラー | ユーザIDを入力してください。 |
| 検索結果なし | 該当するデータが見つかりません。 |
| 権限エラー | この操作を行う権限がありません。 |
| システムエラー | システムエラーが発生しました。管理者に連絡してください。 |

### ログ向けメッセージ

```javascript
let logger = Logger.getLogger();

// エラーログの例
logger.error('[E001] ユーザ取得エラー: userId={}, message={}', userId, e.message);

// スタックトレースも出力
logger.error('[E001] ユーザ取得エラー: {}', e.message);
if (e.stack) {
  logger.error('スタックトレース: {}', e.stack);
}
```

## バリデーションエラー

```javascript
/**
 * バリデーション処理
 * エラーがある場合は例外をスローする
 */
function validateRequest(request) {
  // ユーザコード：必須、最大100文字
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throw new Error('userCode は必須です。');
  } else if (userCode.length > 100) {
    throw new Error('userCode は最大100文字です。');
  }

  // ユーザ名（姓）：必須、最大30文字
  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throw new Error('userLastName は必須です。');
  } else if (userLastName.length > 30) {
    throw new Error('userLastName は最大30文字です。');
  }

  // ユーザ名（名）：必須、最大30文字
  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throw new Error('userFirstName は必須です。');
  } else if (userFirstName.length > 30) {
    throw new Error('userFirstName は最大30文字です。');
  }
}
```

## init 関数でのエラーハンドリング完全例

### 画面のエラーハンドリング

```javascript
let $title = '画面タイトル';        // 画面自体の名称
let $subTitle = 'サブタイトル';     // 画面のサブ名称（画面が所属するカテゴリの名称）
let $data = '{}';

function init(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',
      message: '',
    },
  };

  try {
    // リクエストパラメータのバリデーション
    validateRequest(request);
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E001', '予期しないエラーが発生しました。');
  }

  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function validateRequest(request) {
  // バリデーション処理
}

function processBusinessLogic(request) {
  // ビジネスロジックのメイン処理
  return {
    userCode: '',
    userFirstName: '',
    userLastName: '',
    age: '',
  };
}

function transferErrorPage(code, message) {
  let param = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### APIのエラーハンドリング

API は「API レスポンスの構造（JSON）」の形式で返却する。
スローする Error オブジェクトに `code` と `httpStatus` を付与し、catch 側で取り出して `errorMessage` の組み立てと `setStatus()` の呼び出しに使う。

`Error` 型は標準で `code` / `httpStatus` プロパティを持たないため、将来 TypeScript の型チェックを有効化したときに通るよう、`new Error()` の戻り値および catch の `e` を**インライン `@type` 注釈でキャスト**する。

> **注意:** ファイル単位で `@typedef ApiError` を宣言する方法は使わない。
> 同一機能フォルダ内に複数の API ファイル（例: `api/foo.js`, `api/bar.js`）を置くと、`tsc` でフォルダ全体を走査した際に `TS2300 Duplicate identifier 'ApiError'` を必ず引き起こす。
> 共通の型エイリアスが欲しい場合は `d.ts/` 配下に `interface` として 1 度だけ宣言すること。

```javascript
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.FOO.BAR.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.FOO.BAR.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.FOO.BAR.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.FOO.BAR.99999';

let ALLOWED_METHODS = ['POST'];

function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP メソッドのチェック (405)
    checkMethod(request);
    // セキュアトークン検証 (400)
    verifySecureToken(request);
    // リクエストパラメータのバリデーション (400)
    validateRequest(request);
    // ビジネスロジックのメイン処理を実行（例外時は 500）
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
      logger.error('API処理中にエラーが発生しました。code={} message={}', [code, message]);
    } else {
      logger.warn('API リクエストが不正です。code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // JSON 形式で返却
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

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
 * セキュアトークン（CSRF 対策）の検証を行います。
 * リクエストヘッダ `X-Intramart-Secure-Token` を `SecureTokenManager.verify()` で検証し、
 * 失敗時は 400 をスローします。
 *
 * @param {Object} request - リクエストオブジェクト
 */
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
```
