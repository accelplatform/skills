---
applyTo: "src/main/tssp/**/*.ts"
description: "TypeScript（TSSP）での書き方"
---

# TypeScript 規約（TSSP）

> **適用範囲**: 🟢 **常時** — `src/main/tssp/src` 配下の `.ts`（ファンクションコンテナ・共通処理）を生成・編集する際に適用。jssp 規約を TypeScript のソースに適用するときに書き方が変わる点を定める。

## jssp 規約との関係

- `.ts` には、末尾の「jssp 規約との対応表」に載っている jssp 規約を適用する。本規約は、TypeScript で書き方が変わる点だけを定める
- 本規約の読み替えは、次の規約・節には適用しない: `.github/instructions/jssp-testing.instructions.md` / `.github/instructions/jssp-performance.instructions.md` / `.github/instructions/jssp-file-structure.instructions.md` の「ディレクトリ構造」のうち `workflow/` と `test/` の部分 / 同「ルーティングテーブル経由で呼ばれない画面の例外規約」の IM-Workflow 経由と IM-ContentsSearch 経由の行
- jssp 規約のサンプルと本規約が食い違う箇所は、本規約に従う。jssp 規約の各節に本規約のどの節が関わるかは、末尾の「jssp 規約との対応表」を参照する
- ビルドの手順、共通モジュール（`common/` の `.ts`）の `export` と呼び出し側の `load()` / `import` の書き方、Rhino 向け lint の規則は `.github/skills/tssp-usage/SKILL.md` を参照する

## 読み替え

| jssp 規約の記述 | TSSP での扱い |
|---|---|
| ファンクションコンテナ・共通処理の `.js`（ファイル名の例、`@file`、`view/{view}.js` 等） | `.ts` と読み替える。命名規則（小文字スネークケース）は変わらない |
| ソースを `src/main/jssp/src` に置く | `.ts` と `.html` は `src/main/tssp/src` に置く。対にする `.ts` と `.html` は同じディレクトリに同じ名前で置く |
| `src/main/jssp/src` の `.js` / `.html` | `tssp build` の出力（`--dev` では `.js.map` も出力される）。次の行のファイル以外は手で作成・編集しない。出力への指摘は `src/main/tssp/src` 側を直して再ビルドする |
| `tssp build` が出力しないファイル（2WaySQL の `.sql`、テナント環境セットアップの拡張インポート `*_import.js`、`source-config.xml`） | `src/main/jssp/src` に直接置く。`.sql` の場所は `src/main/jssp/src/{機能名}/sql/` |
| 実行時に解決されるパス（ルーティングの `page`、`load()`、`executeByTemplate()` 等の引数） | 出力先 `src/main/jssp/src` を起点とした拡張子なしのパスで書く。`tssp build` はディレクトリ構成を保って出力するので、`src/main/tssp/src/simple_form/view/index.ts` の `page` は `simple_form/view/index` になる |
| `jssp-page-generator` スキルのファイルへの参照（`assets/simple-form.md`、`assets/simple-portlet.md`、`reference/api-database.md`、`scripts/validate-jssp-code.js`） | `.github/skills/tssp-page-generator/` の同名ファイルを参照する。`validate-jssp-code.js` はビルド成功後の出力に対して実行する |

プレゼンテーションページ（`.html`）の書き方は変わらない。

## 基本構造

`.github/instructions/jssp-function-container.instructions.md` の「基本構造」は `.ts` では次の形になる。以降の節はこのサンプルを参照する。

```typescript
/**
 * ユーザ照会画面
 *
 * @file index.ts
 * @description ユーザ情報を表示します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
export let $title = 'ユーザ照会';
export let $data = '{}';

// ========================================
// 型定義
// ========================================
/** 画面に表示するユーザ情報 */
interface UserForm {
  userCode: string;             // ユーザコード
}

/** プレゼンテーションページに渡す処理結果 */
interface ViewResponse {
  result: UserForm | null;
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
  let response = main(request);
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

/**
 * メイン処理を実行します。
 *
 * @param request - リクエストパラメータ
 * @return 処理結果
 */
function main(request: Request): ViewResponse {
  let logger = Logger.getLogger();
  let response: ViewResponse = {
    result: null,
    error: { code: '', message: '' }
  };

  try {
    let userCode: string = request['userCode'];
    response.result = { userCode: userCode };
  } catch (e) {
    logger.error('画面表示中にエラーが発生しました。{}', (e as Error).message);
    transferErrorPage('E002', '予期しないエラーが発生しました。');
    return response;
  }

  return response;
}

/**
 * エラーが発生したときにエラーメッセージを全画面に表示します。
 *
 * @param code - エラーコード
 * @param message - エラーメッセージ
 */
function transferErrorPage(code: string, message: string): void {
  let parameter: Transfer.TransferParam = {
    title: 'システムエラーが発生しました',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

完全な実装は `.github/skills/tssp-page-generator/assets/simple-form.md` を参照する。

## バインド変数とエントリーポイント

- バインド変数はトップレベルの `export let $data = ...` で宣言する
- エントリーポイントは `export function init(request: Request): void` と書く。ジョブは `export function execute(): JobResult` と書く。`export` は出力の `.js` では外れる

## 関数の引数・戻り値の型

- すべての関数の引数と戻り値に型を書く。型の無い引数は TS7006 でビルドが止まる
- `init` 以外の関数も `request: Request` で受ける
- 必ず例外をスローする関数の戻り値は `never` にする。`void` にすると、呼び出しの後で型の絞り込みが効かない（`value === null` のときにその関数を呼んでも、後続の `value` は `string | null` のままになる）

## 型定義（`interface`）

- リクエストから受け取る値、レスポンス（`$data` に入れるオブジェクト、API の応答）、DB のレコードの形は `interface` で定義し、変数・引数・戻り値に付ける
- `interface` は「型定義」セクションに置く。位置は「定数定義」「バインド変数」セクション（ファイルにあるもの）の後で、「エントリーポイント」セクションの直前
- 各 `.ts` は独立したモジュールとして型検査されるので、同じ名前の `interface` をファイルごとに定義してよい
- 複数のファイルで共有する型は、型だけの `.ts` に `export interface` で書き、`import type` で読む。型だけの `.ts` はファンクションコンテナではないので、`view/` に置く場合も対の `.html` は作らない
- オブジェクトリテラル・配列リテラルで作る変数には型注釈を付ける。注釈が無いと `result: null` は `null` 型に推論され、後からの代入が TS2322 になる。`let result = {};` は後からプロパティを足すと TS2339 になる
- 右辺から型が決まる変数（`let logger = Logger.getLogger();`、`let statusCode = 200;`）に型注釈は要らない

## d.ts の型の使用

- API に渡す変数と API の戻り値を受ける変数には、d.ts の型（`Transfer.TransferParam`、`DatabaseResult`、`JobResult` 等）を使う。d.ts にある型を自前の `interface` で定義し直さない
- API に渡すオブジェクトは、d.ts の型を注釈した変数で作る。`Transfer.TransferParam` のように全プロパティが省略可能な型では、型注釈が無いと誤ったキー（`mesage` 等）を含むオブジェクトが型検査を通過する。型注釈があれば TS2561（似た名前のプロパティが無いキーでは TS2353）でビルドが止まる
- `ResultObject` / `BizApiResultInfo` を返す API は、`result.error` が `false` であることを確かめてから `result.data` を読む。確かめずに読んだ `data` は `unknown` になり、ビルドが止まる（戻り値から直接読むと TS2571、変数で受けてから読むと TS18046、`result.data &&` だけで確かめると TS2339）
- API の引数は d.ts の型どおりに渡す。jssp 規約のサンプルのうち、次の書き方は型検査で止まる

| jssp 規約のサンプルの書き方 | 型エラー | TypeScript での書き方 |
|---|---|---|
| `db.select(sql, [status])` | TS2322 | `db.select(sql, [DbParameter.string(status)])` |
| `null` になりうる値を `DbParameter.string()` / `DbParameter.number()` に渡す | TS2345 | SQL 本文に常に出力する列には `new DbParameter(value, DbParameter.TYPE_STRING)`（数値は `DbParameter.TYPE_NUMBER`）を渡す。`/*IF*/` で分岐するパラメータは、値が `null` のときだけ `DbParameter` で包まずに `null` を渡す |
| `Date \| null` を返すヘルパー（`parseLocalDateTime()` 等）の戻り値を `DbParameter.date()` / `DbParameter.timestamp()` に直接渡す | TS2345 | 変数で受けて `null` を分ける。`/*IF*/` で分岐するパラメータは `d !== null ? DbParameter.date(d) : null`、SQL 本文に常に出力する列は `d !== null ? DbParameter.date(d) : new DbParameter(null, DbParameter.TYPE_DATE)` と書く（TIMESTAMP は `DbParameter.timestamp(d)` と `DbParameter.TYPE_TIMESTAMP`） |

## リクエスト値の受け方

- `Request` はインデックスシグネチャ（値は `any`）を持つ。`request['xxx']` で読んだ値は `let userCode: string = request['userCode'];` のように型を付けた変数で受ける。`getParameterValue()` の戻り値は `string | null` で受ける
- 数値として判定する値は `parseInt()` で変換した変数で判定する。`string` の変数を `isNaN()` に渡すと TS2345、数値と大小比較すると TS2365 になる
- `request` のメソッド名は `d.ts/platform/standard/im-ssjs-request.d.ts` で確かめる。d.ts に無いメソッド名でも型検査を通過する

## `catch` の `e`

`catch (e)` の `e` は `unknown` で、`e.message` は TS18046 になる。`(e as Error).message` と書く。

## API のカスタム例外

`.github/instructions/jssp-error-handling.instructions.md` の「APIのエラーハンドリング」が定めるインライン `@type` 注釈のキャストと、「`d.ts/` 配下に `interface` を宣言する」という注意は `.ts` に適用しない。`interface ApiError extends Error` を定義し、`as ApiError` でキャストする。

- JSDoc のインライン `@type` 注釈は `.ts` の型検査では無視される。`e` は `unknown` のままで TS18046 になり、`Error` 型の変数への `error.code = code` は TS2339 になる
- `ApiError` は API の `.ts` ごとに定義する。共有する場合は型だけの `.ts` に置き、`import type { ApiError } from '../common/api_types';` で読む

```typescript
/** エラーコード・HTTP ステータス付きの例外 */
interface ApiError extends Error {
  code: string;
  httpStatus: number;
}

export function init(request: Request): void {
  let statusCode = 200;
  try {
    validateRequest(request);
  } catch (e) {
    let apiError = e as ApiError;
    statusCode = apiError.httpStatus || 500;
  }
  Web.getHTTPResponse().setStatus(statusCode);
}

function validateRequest(request: Request): void {
  let userCode: string = request['userCode'];
  if (!userCode) {
    throwApiError('E.IWP.FOO.BAR.00001', 400, 'userCode は必須です。');
  }
}

function throwApiError(code: string, httpStatus: number, message: string): never {
  let error = new Error(message) as ApiError;
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}
```

完全な実装は `.github/skills/tssp-page-generator/assets/post-json-api.md` を参照する。

## JSDoc

- JSDoc コメントとセクション区切りコメントは、jssp 規約と同様に省略しない
- 型タグ（`{Object}`、`{String}` 等）は書かない。型は関数の署名に書き、JSDoc は `@param request - リクエストオブジェクト`、`@return 処理結果` の形にする
- 戻り値が `void` / `never` の関数に `@return` は書かない
- `interface` には 1 行の `/** 説明 */` を付け、プロパティは行末の `//` コメントで説明する

## d.ts の定数

`d.ts/workflow/enum/` の定数オブジェクト（`NodeType`、`ProcessType`、`TaskStatus` 等）は、値をリテラルで書き、定数名は `typeof` の型注釈とコメントにだけ書く。

```typescript
let NODE_TYPE_APPLY: typeof NodeType.nodeTyp_Apply = '2';  // 申請ノード（NodeType.nodeTyp_Apply）

export function isApplyNode(nodeType: string): boolean {
  return nodeType === NODE_TYPE_APPLY;
}
```

- 型注釈を付けると、リテラルが d.ts の値と異なるときに TS2322 でビルドが止まる
- 式の中で `NodeType.nodeTyp_Apply` を値として参照しない。ビルドを通過して出力の `.js` にそのまま残り、実行時に ReferenceError になる

## `const` の扱い

`.ts` では `const` を使ってよい。`tssp build` が `let` に変換する。`.github/instructions/jssp-code-style.instructions.md` の「`const` について」（積極利用は控える）は `.ts` に適用しない。`var` は使わない。

## 型検査の回避の禁止

型エラーは d.ts の署名に合わせてコードを直す。次の書き方で型検査を回避してはならない。いずれも `tssp build` では検出されない。

- `any`（`: any`、`as any`、`any[]`、`Record<string, any>` 等）。型が決まらない値は `unknown` で受け、`typeof` 等で絞り込んでから使う
- `as unknown as X` の二重キャスト。`e as Error`、`e as ApiError`、`new Error(message) as ApiError` は使ってよい。`null` を含む型から `null` を外すための `as`（`parseLocalDateTime(x) as Date` 等）は使わない
- `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`
- 自前の `declare`、`declare global`、`/// <reference`、`src/main/tssp` 配下の自前の `.d.ts`

d.ts に無い API は使わず、ユーザに報告する。`java.*` / `Packages.*` は d.ts に宣言が無く、TS2304 でビルドが止まる。

## jssp 規約との対応表

| jssp 規約 | 節 | 本規約の節 |
|---|---|---|
| `.github/instructions/jssp-overview.instructions.md` | 適用範囲 / スクリプト開発モデルの構成 | 読み替え |
| `.github/instructions/jssp-file-structure.instructions.md` | ディレクトリ構造 / ファイル命名規則 / ルーティングテーブル経由で呼ばれない画面の例外規約 / .html ファイルの必須化 / page 属性の指定方法 | 読み替え / 型定義（`interface`） |
| `.github/instructions/jssp-file-structure.instructions.md` | 基本方針（共通処理の集約） | jssp 規約との関係 |
| `.github/instructions/jssp-naming.instructions.md` | 命名規則一覧 / バインド変数の定義（ファンクションコンテナ） | 読み替え / バインド変数とエントリーポイント |
| `.github/instructions/jssp-naming.instructions.md` | バインド変数と通常変数の区別 / 予約語との衝突回避 | バインド変数とエントリーポイント / 型定義（`interface`） / d.ts の型の使用 |
| `.github/instructions/jssp-function-container.instructions.md` | 基本構造 | 基本構造 / 関数の引数・戻り値の型 / 型定義（`interface`） / JSDoc |
| `.github/instructions/jssp-function-container.instructions.md` | IM-共通マスタ API（IMMUserManager / IMMCompanyManager 等）の注意 | d.ts の型の使用 |
| `.github/instructions/jssp-function-container.instructions.md` | validateRequest 関数の実装パターン / requestオブジェクトの扱い | リクエスト値の受け方 |
| `.github/instructions/jssp-code-style.instructions.md` | 規則: `let` を使用する / 1行の長さ / ブレース（中括弧）のスタイル | 型定義（`interface`） / d.ts の型の使用 / 関数の引数・戻り値の型 |
| `.github/instructions/jssp-code-style.instructions.md` | `const` について | `const` の扱い |
| `.github/instructions/jssp-code-style.instructions.md` | d.ts 定数・列挙値の参照 | d.ts の定数 |
| `.github/instructions/jssp-code-style.instructions.md` | 関数コメント（JSDoc 形式） | JSDoc |
| `.github/instructions/jssp-error-handling.instructions.md` | エラーの種別と処理方式 / エラー情報の構造（画面） / バリデーションエラー / 画面のエラーハンドリング | 基本構造 / 型定義（`interface`） / `catch` の `e` / d.ts の型の使用 |
| `.github/instructions/jssp-error-handling.instructions.md` | HTTP ステータスコード / APIのエラーハンドリング | API のカスタム例外 |
| `.github/instructions/jssp-security.instructions.md` | 入力バリデーション（必須） / セッション管理 | 関数の引数・戻り値の型 |
| `.github/instructions/jssp-security.instructions.md` | SQLインジェクション対策（必須） / javaオブジェクトへの直接アクセス禁止 | d.ts の型の使用 / 型検査の回避の禁止 |
| `.github/instructions/jssp-logging.instructions.md` | ログ出力の実装 / 機密情報の取り扱い / ログフォーマット | 関数の引数・戻り値の型 / `catch` の `e` |
| `.github/instructions/jssp-2way-sql.instructions.md` | SQL ファイルの配置 / 関連 | 読み替え |
| `.github/instructions/jssp-2way-sql.instructions.md` | 【重要】SQL ファイルに `--` コメントを書かない / IN 句の動的生成 / LIKE 検索時のエスケープ / 呼び出し / パラメータの受け渡し / 直接埋め込み / 結果セットの処理 / トランザクション処理 / チェックリスト | 関数の引数・戻り値の型 / 型定義（`interface`） / d.ts の型の使用 / `catch` の `e` / JSDoc |
| `.github/instructions/jssp-presentation-page.instructions.md` | プレゼンテーションページの標準実装方針 / バインド変数 `$data` のスコープ化（IIFE） / id 属性の命名規約 / getValidationErrors 関数の実装パターン / バリデーションの実行タイミング（いずれも `jssp-page-generator` スキルのファイルを参照する箇所） | 読み替え |
