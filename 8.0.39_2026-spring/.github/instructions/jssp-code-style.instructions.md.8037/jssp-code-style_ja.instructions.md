---
applyTo: "src/main/jssp/**/*.js"
description: "コーディングスタイル"
---

# コーディング規約（ファンクションコンテナのみ）

> **適用範囲**: 🟢 **常時** — `.js` ファイル（ファンクションコンテナ）を生成・編集する際に適用。

## 変数宣言

### 規則: `let` を使用する

良い例:
```javascript
let userId = 'user001';
let userName = '山田太郎';
let items = [];
```

悪い例:
```javascript
var userId = 'user001';     // var はスコープが広すぎるため使用しない
```

### `const` について

`const` は Rhino のスコープ挙動に課題があるため、積極利用は控える。
プレゼンテーションページ側でのバインド変数受け取りなど、限定的な場面での使用に留める。

```javascript
// プレゼンテーションページ側での使用は許容
const $data = /* JSON埋め込み */;
```

**理由**:
- `let` はブロックスコープで変数の影響範囲が明確
- `var` は関数スコープで意図しない変数の巻き上げが発生しやすい
- `const` は Rhino 環境でのスコープ挙動に課題がある

### `Promise` について

サーバサイドで動作する Rhino は非同期に対応しておらず、すべて同期で処理する。
従って、`Promise`, `async`, `await` は使用してはならない。

## 文字列リテラル

### 規則: シングルクォート（`'`）で統一

良い例:
```javascript
let message = '処理が完了しました';
let sql = 'SELECT * FROM users WHERE user_id = ?';
let message = "処理 'test-case' が完了しました";  // 例外: シングルクォートを含む場合のみダブルクォートを使用してもよい
```

悪い例:
```javascript
let message = '処理が完了しました';  // ダブルクォートは使用しない
```

## 演算子・構文

### new 演算子は括弧を省略しない

良い例:
```javascript
let db = new TenantDatabase();
let client = new HttpClient();
let date = new Date();
```

悪い例:
```javascript
let db = new TenantDatabase;   // 括弧省略は避ける
```

### セミコロンは必ず記述

良い例:
```javascript
let userId = 'user001';
let result = processData(userId);
```

悪い例:
```javascript
let userId = 'user001'   // セミコロン省略は避ける
```

### 厳密等価演算子を優先使用

良い例:
```javascript
if (status === 'active') {
  // 処理
}
if (count !== 0) {
  // 処理
}
```

悪い例:
```javascript
if (status == 'active') {   // 型変換が発生する可能性
  // 処理
}
if (count) {  // boolean 以外の暗黙的な boolean 判定
  // 処理
}
```

## d.ts 定数・列挙値の参照

`d.ts` で定義されている定数オブジェクト（`NodeType`, `ProcessType`, `TaskStatus` 等）は
TypeScript の型定義専用であり、`.js` ファイルの SSJS ランタイムではグローバルに存在しない。

`.js` ファイルでは定数値（文字列リテラル）を直接指定すること。

良い例:
```javascript
// 定数値を直接指定し、コメントで意味を補足する
let NODE_TYPE_APPLY = '2';    // 申請ノード（NodeType.nodeTyp_Apply）
let NODE_TYPE_APPROVE = '3';  // 承認ノード（NodeType.nodeTyp_Approve）

if (node.nodeType === NODE_TYPE_APPLY) {
  // 処理
}
```

悪い例:
```javascript
// NG: d.ts の定数オブジェクトは .js からは参照できない
if (node.nodeType === NodeType.nodeTyp_Apply) {
  // ReferenceError になる
}
```

**ルール**:
- 定数値はファイル先頭の定数セクションにまとめて定義する
- 変数名で意味がわかるようにし、コメントで `d.ts` 上の対応定数名を記載する
- 値は `d.ts` の定義と一致させること

## インデント・フォーマット

### インデント

- スペース2つで統一（設計書や仕様書に指示がある場合は、そちらを優先する）
- ネストが深くなりすぎないよう注意（最大4段階を推奨）

### 1行の長さ

- 120文字以内を推奨
- 長くなる場合は適切な位置で改行

良い例:
```javascript
let result = db.select(
  'SELECT user_id, user_name, department_cd FROM users WHERE status = ?',
  [status]
);
```

**注意: `&&` / `||` での改行は避ける**

Rhino 1.7R4 のパーサは、`if` 等の条件式で `&&` / `||` の直後に改行が入ると、後続行に達するまで条件式の閉じ `)` が見つからないと誤判定し、`missing ) after condition` で構文解析が失敗することがある。

長い条件式は **ローカル変数に切り出すか、1行にまとめる** こと。

```javascript
// NG: 行末 && での改行（Rhino が parse 失敗する可能性あり）
if (result.data && result.data.length > 0 &&
    Number(result.data[0].count) > 0) {
  // 処理
}

// OK: ローカル変数に切り出す
let hasValidResult = result.data
  && result.data.length > 0
  && Number(result.data[0].count) > 0;
if (hasValidResult) {
  // 処理
}

// OK: 1行にまとめる
if (result.data && result.data.length > 0 && Number(result.data[0].count) > 0) {
  // 処理
}
```

### ブレース（中括弧）のスタイル

```javascript
// K&R スタイルを使用
function processData(input) {
  if (input === null) {
    return null;
  }

  for (let i = 0; i < input.length; i++) {
    // 処理
  }

  return result;
}
```

## コメント

### 関数コメント（JSDoc 形式）

```javascript
/**
 * ユーザ情報を取得する
 *
 * @param {string} userId - ユーザID
 * @return {Object} ユーザ情報オブジェクト。存在しない場合はnull
 */
function getUserInfo(userId) {
  // 処理
}
```

### インラインコメント

```javascript
// 複雑なロジックには理由を記述
let threshold = 30;  // 30日以上経過したデータは削除対象

// TODO: #12345 暫定対応。次期リリースで修正予定
```
