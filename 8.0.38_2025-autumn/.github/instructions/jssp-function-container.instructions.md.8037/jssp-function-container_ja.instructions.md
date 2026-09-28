---
applyTo: "src/main/jssp/**/*.js"
description: "ファンクションコンテナの実装方針"
---

# ファンクションコンテナ規約

> **適用範囲**: 🟢 **常時** — ファンクションコンテナ（`.js`）を生成する際に適用。`init()` 構造・バリデーション・IM-共通マスタ API 等。

## ファンクションコンテナの標準実装方針

### 基本構造

```javascript
/**
 * {画面名}
 *
 * @file {ファイル名}
 * @description {このファイルに関する簡易的な説明文}
 */

// ========================================
// 定数定義
// ========================================
// TODO: ここに使用する定数を追加します

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = '画面タイトル';        // 画面自体の名称
let $subTitle = 'サブタイトル';     // 画面のサブ名称（画面が所属するカテゴリの名称）
let $data = '{}';
// TODO: 他にバインド変数が必要であれば追加します

// ========================================
// 初期化処理
// ========================================
/**
 * 画面初期化処理
 *
 * @param {Object} request - リクエストオブジェクト
 */
// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 * 画面のURLにアクセスされたとき、最初に実行されます。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  // メイン処理を実行
  let response = main(request);

  // JSON 形式で $data に格納
  // JSON 内に </script> が含まれていると、スクリプトが終了して任意コードを差し込めるなどの脆弱性の原因となるため、
  // レスポンス中の '/' を '\/' に全置換する
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// メイン処理
// ========================================
/**
 * メイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // エラーコード
      message: ''               // エラーメッセージ
    }
  };

  try {
    // リクエストパラメータのバリデーション
    validateRequest(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E001', 'リクエストパラメータが不正です。');
    return response;
  }

  try {
    // ビジネスロジックのメイン処理を実行
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', e.message);
    transferErrorPage('E002', '予期しないエラーが発生しました。');
    return response;
  }

  return response;
}

// ========================================
// バリデーション
// ========================================
/**
 * リクエストパラメータの検証を行います。
 * リクエストパラメータのうち、誤ってはいけないものをチェックします。
 *
 * @param {Object} request - リクエストパラメータ
 */
function validateRequest(request) {
  // TODO: ここにバリデーションチェックロジックを追加します
}

// ========================================
// ビジネスロジック
// ========================================
/**
 * ビジネスロジックのメイン処理を実行します。
 *
 * @param {Object} request - リクエストパラメータ
 * @return {Object} 処理結果
 */
function processBusinessLogic(request) {
  let result = {};

  // TODO: ここにビジネスロジックのメイン処理を追加します
  // 処理結果は result に格納します

  return result;
}

// ========================================
// エラーページ遷移
// ========================================
/**
 * エラーが発生したときにエラーメッセージを全画面に表示します。
 *
 * @param {String} code - エラーコード
 * @param {String} message - エラーメッセージ
 */
function transferErrorPage(code, message) {
  let param = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### 実装方針

- バインド変数はタイトル表示用（`$title` と `$subTitle`）およびプレゼンテーション画面表示用（`$data`）を定義する
  - これ以外のバインド変数は、極力定義しない
- `$data` には、プレゼンテーション画面に情報を渡すため、JSON 文字列にする
  - JSON 文字列化には `JSON.stringify()` を使用する
  - 出力された JSON 文字列を `.replace(/\//g, '\\/')` でエスケープし、スラッシュを無害化する
    - JSON 文字列内に `</script>` が含まれている場合、プレゼンテーションページで意図せずスクリプトが終了してしまうのを回避するため
- `new Packages.***`（Java クラスの直接インスタンス化）は使用しない。メモリリークや処理ロックの原因となり、パフォーマンスに影響が出る。代わりに `d.ts/` に定義された SSJS グローバルクラス・API を使用すること
- **d.ts の型定義に従って API を呼び出すこと**。
  - 引数の型が `null` を含まない（`?` や `| null` がない）場合、`null` を渡してはならない。省略可能かどうかは `?`（オプション引数）の有無で判断する。「条件なし」を表現したい場合でも、型に応じた空オブジェクト（例: `new AppCmnSearchCondition()`）を渡すこと
  - **d.ts に定義されていないメソッド名を推測で呼び出してはならない**。必ず d.ts またはリファレンス（`reference/` 配下）でメソッド名と引数の型を確認してから実装すること。
    - 例: `UserActvMatterPropertyValue` には `setMatterProperty()` は存在しない。正しくは `createMatterProperty(Array)` / `updateMatterProperty(Array)`
- 関数ごとに責務を完全に分割する
  - 例えば validateRequest 関数では、リクエストパラメータの制約の確認のみ行う
- 1関数は50行以内を目安にする
  - 50行を超える場合は分割を検討する
- ネストは最大4段階までにする

### IM-共通マスタ API（IMMUserManager / IMMCompanyManager 等）の注意

- 検索条件引数（`AppCmnSearchCondition` 型）に **`null` を渡してはならない**。Java 側で `IllegalArgumentException` が発生する
- 条件なしで全件取得する場合でも、**空の `new AppCmnSearchCondition()` を渡す**こと
- ユーザ名・所属部署の取得には DB 直接参照（`SELECT FROM im_user` 等）ではなく、IM-共通マスタ API を使用すること
  - ユーザ名: `IMMUserManager.getUser(bizKey, date, localeId)` → `result.data.locales[locale].userName`
  - 所属部署（カレント組織優先）: `Contexts.getUserContext().currentDepartment.departmentName`
    - ログインユーザ自身の場合はカレント組織を優先する
    - カレント組織が取得できない場合や他ユーザの場合: `IMMCompanyManager.listDepartmentWithUser()` → `result.data[0].displayName`（戻り値は `DepartmentListNodeInfo[]`）

- **`locales` オブジェクトへのアクセスには null チェック + フォールバックを入れること**。`result.data.locales` 自体が `undefined` の場合や、ロケール不一致の場合にエラーが発生する

```javascript
// OK: 空の検索条件オブジェクトを渡す
let condition = new AppCmnSearchCondition();
let result = manager.listDepartmentWithUser(bizKey, condition, true, new Date(), localeId);

// NG: null を渡す → IllegalArgumentException
let result = manager.listDepartmentWithUser(bizKey, null, true, new Date(), localeId);

// テナントロケールの取得
let tenantLocale = new TenantInfoManager().getTenantInfo().data.locale;

// OK: locales 自体の null チェック + フォールバック付きでアクセスする
if (result.data && result.data.locales) {
  let locales = result.data.locales;
  let localeInfo = locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
  if (localeInfo) {
    userName = localeInfo.userName || '';
  }
}

// NG: locales の null チェックなし → locales が undefined の場合に例外
let locales = result.data.locales;
let localeInfo = locales[locale];  // locales が undefined → TypeError

// NG: フォールバックなしで直接アクセス → ロケール不一致時にエラー
let localeInfo = result.data.locales[locale];
userName = localeInfo.userName;  // localeInfo が undefined → TypeError
```

## validateRequest 関数の実装パターン

JavaScript におけるリクエストパラメータのバリデーション関数の基本的な実装パターンです。

### 基本構造

```javascript
/**
 * リクエストパラメータの検証を行います。
 *
 * @param {Object} request - リクエストパラメータ
 * @throws {Error} バリデーションエラー時
 */
function validateRequest(request) {
  // 各パラメータのバリデーションを実行
  validateParameter1(request);
  validateParameter2(request);
  // ... 必要なバリデーションを追加
}
```

### 検証パターン

#### 必須チェック

```javascript
let value = request['parameterName'];
if (!value || value.length === 0) {
  throw new Error('parameterName は必須です。');
}
```

#### 文字列長チェック

```javascript
let value = request['parameterName'];
if (value.length > maxLength) {
  throw new Error(`parameterName は最大${maxLength}文字です。`);
} else if (value.length < minLength) {
  throw new Error(`parameterName は最低${minLength}文字必要です。`);
}
```

#### 数値チェック

```javascript
let value = request['parameterName'];
if (isNaN(value)) {
  throw new Error('parameterName は数値である必要があります。');
} else if (value < min || value > max) {
  throw new Error(`parameterName は${min}から${max}の範囲で指定してください。`);
}
```

#### 正規表現パターンマッチング

```javascript
let value = request['parameterName'];
let pattern = /^[a-zA-Z0-9_-]+$/;
if (!pattern.test(value)) {
  throw new Error('parameterName は英数字、ハイフン、アンダースコアのみ使用できます。');
}
```

#### メールアドレス形式チェック

```javascript
let value = request['parameterName'];
let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!pattern.test(value)) {
  throw new Error('parameterName の形式が正しくありません。');
}
```

#### 日付形式チェック

```javascript
let value = request['parameterName'];
let pattern = /^\d{4}-\d{2}-\d{2}$/;
if (!pattern.test(value)) {
  throw new Error('parameterName は YYYY-MM-DD 形式で指定してください。');
}
```

#### ユーザコード形式チェック

```javascript
let value = request['parameterName'];
let pattern = /^[0-9A-Za-z_@\.\+\!\-]$/;  // 半角英数字と _-@.+!
if (!pattern.test(value)) {
  throw new Error('parameterName はユーザコード形式で指定してください。');
}
```

#### 複合パターン例

```javascript
// 1. 必須チェック + 文字列長チェック
let userCode = request['userCode'];
if (!userCode || userCode.length === 0) {
  throw new Error('userCode は必須です。');
} else if (userCode.length > 100) {
  throw new Error('userCode は最大100文字です。');
}

// 2. 任意項目のチェック（値が存在する場合のみ検証）
let age = request['age'];
if (age !== undefined && age !== null && age !== '') {
  if (isNaN(age)) {
    throw new Error('age は数値である必要があります。');
  } else if (age < 0 || age > 150) {
    throw new Error('age は0から150の範囲で指定してください。');
  }
}
```

### 実装方針

- エラーが見つかり次第、例外をスローする
- どのパラメータがどのように問題なのかを明記する
- 基本的なチェック（以下順序）から実行する
  1. 必須チェック
  2. 桁数チェック
  3. フォーマットチェック
  4. 他パラメータとの相関チェック
- 厳密等価演算子（`===`）を使用する

## requestオブジェクトの扱い

### リクエストパラメータを取得する

```javascript
// GETパラメータ、POSTパラメータの取得
let userId = request['userId'];
let keyword = request['keyword'];

// デフォルト値の設定
let page = request['page'] || '1';
let sortKey = request['sortKey'] || 'user_id';

// 配列パラメータの取得
let selectedIds = request['selectedIds'];
if (selectedIds) {
  let idArray = selectedIds.split(',');
}
```

### 実装方針

- リクエストパラメータは必ず値の検証を実施する
- requestからは文字列として取得されるので、数値にする場合は `parseInt()` や `parseFloat()` で変換する
- リクエストパラメータは必ずサニタイズし、SQLのパラメータやストレージのファイル名として使用する場合は、インジェクションに注意する
