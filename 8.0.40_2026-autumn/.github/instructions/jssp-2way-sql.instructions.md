---
applyTo: "src/main/jssp/**/*.sql"
description: "2WaySQL 規約（SQL外部化、構文、ホワイトリスト検証、トランザクション処理）"
---

# 2WaySQL 規約

> **適用範囲**: 🟡 **文脈依存** — **DB 操作時のみ適用**（`db.executeByTemplate` / `db.execute` を使う場合）。ワークフロー画面のような DB 非操作のフォームでは読まなくてよい。

条件分岐を含む動的 SQL を安全に構築するため、SQL を外部ファイル化して `executeByTemplate` / `fetchByTemplate` で実行する仕組み。

## 適用方針

- **動的に WHERE 句や条件が変化する SELECT** は 2WaySQL を使用する
- 単純な固定 SQL や 1 パラメータの単発実行は `select` / `execute` + `DbParameter` でも可
- **文字列連結による SQL 構築は絶対禁止**（jssp-security.instructions.md 参照）

## SQL ファイルの配置

SQL ファイルは **必ず `src/main/jssp/src/` 配下** に配置する必要がある（`resources/` 等の外部ディレクトリでは読み込めない）。
機能単位で `src/main/jssp/src/{機能名}/sql/` 以下に配置する。

```
src/main/jssp/src/
└── {機能名}/
    ├── view/
    │   ├── xxx.js
    │   └── xxx.html
    └── sql/
        ├── selectXxx.sql
        └── searchXxx.sql
```

- ファイルの文字コード: **UTF-8**（必須）
- ファイル拡張子: `.sql`

### `executeByTemplate` / `fetchByTemplate` に渡すパス

- **`src/main/jssp/src/` を起点とした絶対パス（先頭にスラッシュ）**で指定する
- **拡張子 `.sql` は含めない**（含めると実行に失敗する）

例: `src/main/jssp/src/content/sql/select_content.sql` を実行する場合

```javascript
let SQL_SELECT_CONTENT = '/content/sql/select_content';
db.executeByTemplate(SQL_SELECT_CONTENT, params);
```

## 構文

| 構文 | 用途 | 備考 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分岐 | |
| `/*BEGIN*/.../*END*/` | オプショナルブロック（中身が全部消えると WHERE 等も自動的に消える） | |
| `/*param*/'dummy'` | バインドプレースホルダ（PreparedStatement 方式） | **推奨** |
| `/*$param*/dummy` | 直接埋め込み | SQL インジェクションリスクあり、ホワイトリスト必須 |

### 禁止構文

- **`/*FOR item : list*/.../*END*/`** は LogicDesigner / im_mirage では使えるが、**スクリプト開発モデルでは非対応**。使用しないこと。

### ダミー値の意味

`/*param*/'dummy'` の `'dummy'` は **2WaySQL の実行確認用ダミー値**であり、実行時はバインドパラメータに置換される。
SQL クライアントで単体実行できるよう、構文として正しい値を書くこと。

## SQL ファイル例

```sql
-- src/main/jssp/src/user/sql/searchUsers.sql
SELECT user_id, user_name, email
FROM users
/*BEGIN*/
WHERE
  /*IF userId != null*/
    user_id = /*userId*/'dummy'
  /*END*/
  /*IF userName != null*/
    AND user_name LIKE /*userName*/'%dummy%' ESCAPE '\'
  /*END*/
  /*IF status != null*/
    AND status = /*status*/'active'
  /*END*/
/*END*/
ORDER BY user_id
```

## LIKE 検索時のエスケープ（LIKE パターンインジェクション対策）

LIKE 演算子に渡すパラメータには、ユーザ入力に含まれる **LIKE 特殊文字（`\`、`%`、`_`）を必ずエスケープ** すること。
エスケープせずにワイルドカード（`%`）を付与すると、以下の問題が発生する:

- `%` を入力 → `%%%` で全件ヒット（意図しない全件取得）
- `_` を入力 → `%_%` で任意の 1 文字にマッチ（意図しない部分一致）

### 必須ルール

1. **ワイルドカード（`%`）の付与はサーバサイドで行う** — クライアント（ブラウザ）から `%keyword%` を送信してはならない
2. **LIKE 特殊文字をエスケープしてからワイルドカードを付与する**
3. **SQL に `ESCAPE '\'` 句を付与する**

### SQL 側

```sql
-- ESCAPE 句を必ず付与する
AND user_name LIKE /*userName*/'%dummy%' ESCAPE '\'
```

### サーバサイド（ファンクションコンテナ）

```javascript
/**
 * LIKE 検索用のパラメータを生成します。
 * LIKE 特殊文字をエスケープし、前後にワイルドカードを付与します。
 *
 * @param {String} value - 検索キーワード（生の入力値）
 * @return {String} エスケープ済みの LIKE パラメータ
 */
function toLikeParam(value) {
  if (!value) {
    return '%';
  }
  let escaped = value
    .replace(/\\/g, '\\\\')   // \ → \\
    .replace(/%/g, '\\%')     // % → \%
    .replace(/_/g, '\\_');    // _ → \_
  return '%' + escaped + '%';
}

// 使用例
let params = {
  userName: criteria.userName ? DbParameter.string(toLikeParam(criteria.userName)) : null
};
```

### クライアント側（プレゼンテーションページ）

```javascript
// OK: 生のキーワードをそのまま送信
body: JSON.stringify({ keyword: keyword })

// NG: クライアントでワイルドカードを付与して送信
body: JSON.stringify({ keyword: '%' + keyword + '%' })
```

## 呼び出し

### execute と executeByTemplate の使い分け

| メソッド | 第1引数 | 第2引数 | 用途 |
|---------|---------|---------|------|
| `db.execute(sql, params)` | **SQL 文字列** | `DbParameter[]`（**配列**） | インライン SQL の実行 |
| `db.executeByTemplate(path, params)` | **テンプレートパス** | `{ key: DbParameter }`（**オブジェクト**） | 2WaySQL テンプレートの実行 |

**SQL を外部ファイル化した場合は必ず `executeByTemplate` / `fetchByTemplate` を使用すること。**
`execute` にテンプレートパスを渡すと、パスが SQL 文として解釈されエラーになる。
また、パラメータの形式も異なる（`execute` は配列、`executeByTemplate` はオブジェクト）ため混同に注意。

```javascript
// OK: テンプレートパス → executeByTemplate + オブジェクト形式パラメータ
let result = db.executeByTemplate('/user/sql/searchUsers', { userId: DbParameter.string(userId) });

// OK: インライン SQL → execute + 配列形式パラメータ
let result = db.execute('SELECT * FROM users WHERE user_id = ?', [DbParameter.string(userId)]);

// NG: テンプレートパスを execute に渡す → SQL 解析エラー
let result = db.execute('/user/sql/searchUsers', { userId: DbParameter.string(userId) });
```

### executeByTemplate（通常の実行）

```javascript
function searchUsers(criteria) {
  let db = new TenantDatabase();

  let params = {
    userId:   criteria.userId   ? DbParameter.string(criteria.userId)                   : null,
    userName: criteria.userName ? DbParameter.string(toLikeParam(criteria.userName))     : null,
    status:   criteria.status   ? DbParameter.string(criteria.status)                   : null
  };

  return db.executeByTemplate('/user/sql/searchUsers', params);
}
```

### fetchByTemplate（ページング付き）

```javascript
function searchUsersWithPaging(criteria, start, length) {
  let db = new TenantDatabase();
  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };
  return db.fetchByTemplate('/user/sql/searchUsers', start, length, params);
}
```

- `start` は 1 始まり、`length` は取得件数
- 戻り値は `DatabaseResult`（`data`, `countRow`, `isSuccess()` 等）

## パラメータの受け渡し

- パラメータは **オブジェクト形式**で渡す（キー名は SQL 内のパラメータ名と一致）
- 値は必ず **`DbParameter.string()` / `DbParameter.integer()` 等でラップ**する
- 未指定パラメータは `null` を渡し、`/*IF param != null*/` で分岐させる

### DbParameter の型選択ルール

`DbParameter` の型メソッドは、**DDL のカラム定義に合わせて選択する**こと。
推測やプログラム内の変数の型で判断してはならない。

| DDL のカラム型 | DbParameter メソッド | よくある間違い |
|---|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string()` | 年度（`VARCHAR(4)`）に `DbParameter.number()` を使う → 型不一致エラー |
| `INTEGER` / `BIGINT` | `DbParameter.number()` | - |
| `DECIMAL` / `NUMERIC` | `DbParameter.number()` | - |
| `DATE` | `DbParameter.date()` | - |
| `TIMESTAMP` | `DbParameter.timestamp()` | - |
| `BOOLEAN` | `DbParameter.boolean()` | - |

**手順:**
1. 対象テーブルの DDL（またはデータモデル定義）を確認する
2. カラムの型を特定する
3. 上記の対応表に従って `DbParameter` メソッドを選択する

**特に注意が必要なカラム:**
- **年度・年月・コード類を `VARCHAR` で定義した場合**: 値が数字のみでも `DbParameter.string(String(value))` を使う
- **金額・数量を `DECIMAL` で定義した場合**: `DbParameter.number()` を使う（`DbParameter.string()` ではない）
- **NULL になりうる `DATE` / `TIMESTAMP` カラム**: 下記「NULL 値の渡し方」を参照

DDL が未作成の場合は、実装前に DDL を作成するか、データモデル定義で型を確定させてから `DbParameter` を選択すること。

### NULL 値の渡し方

`executeByTemplate` はパラメータオブジェクトの値がすべて DbParameter インスタンスである必要がある。
生の `null` をそのまま渡すと `The parameter must be instance of DbParameter` ランタイムエラーになる。

| DDL カラム型 | 値あり | 値なし（NULL） | `null` を直接渡した場合 |
|---|---|---|---|
| `VARCHAR` / `CHAR` / `TEXT` | `DbParameter.string(value)` | `DbParameter.string(null)` | ランタイムエラー |
| `INTEGER` / `BIGINT` / `DECIMAL` | `DbParameter.number(value)` | `DbParameter.number(null)` | ランタイムエラー |
| `DATE` | `DbParameter.date(new Date(value))` | `new DbParameter(null, DbParameter.TYPE_DATE)` | ランタイムエラー |
| `TIMESTAMP` | `DbParameter.timestamp(new Date(value))` | `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` | ランタイムエラー |

**なぜ DATE / TIMESTAMP だけコンストラクタが必要か:**
`string` / `number` の引数は JavaScript プリミティブであり、`null` をそのまま Java 側に渡してもエラーにならない。
一方 `DbParameter.date()` / `DbParameter.timestamp()` は引数を Java の `Date` オブジェクトとして処理するため、`null` を渡すと NullPointerException が発生する。
**引数にオブジェクト型を要求するファクトリメソッドには `null` を渡せない。**

```javascript
// VARCHAR / 数値列 — null をそのまま渡してよい
remarks : DbParameter.string(remarks),   // remarks が null → NULL
quantity: DbParameter.number(quantity),  // quantity が null → NULL

// DATE / TIMESTAMP 列 — null の場合はコンストラクタを使う
period_end_date: periodEndDate
  ? DbParameter.date(new Date(periodEndDate))
  : new DbParameter(null, DbParameter.TYPE_DATE)
```

> **注意:** `DbParameter.NULL` は型定数（`number` 型の値）であり DbParameter インスタンスではない。ストアドプロシージャ専用。通常の INSERT/UPDATE には使用しないこと。

## 直接埋め込み（`/*$param*/`）の使用ルール

ORDER BY 句のカラム名・ソート方向など、**バインド変数では指定できない箇所**にのみ使用する。

```sql
-- src/main/jssp/src/user/sql/dynamicSort.sql
SELECT user_id, user_name, email
FROM users
ORDER BY /*$sortColumn*/user_id /*$sortOrder*/ASC
```

```javascript
function searchUsersWithSort(sortColumn, sortOrder) {
  let db = new TenantDatabase();

  // ホワイトリスト検証（必須）
  let allowedColumns = ['user_id', 'user_name', 'created_at'];
  let allowedOrders  = ['ASC', 'DESC'];

  if (allowedColumns.indexOf(sortColumn) === -1) {
    throw new Error('Invalid column');
  }
  if (allowedOrders.indexOf(sortOrder) === -1) {
    throw new Error('Invalid order');
  }

  return db.executeByTemplate('/user/sql/dynamicSort', {
    sortColumn: sortColumn,
    sortOrder:  sortOrder
  });
}
```

### `/*$param*/` の必須ルール

- **ユーザ入力を直接渡してはならない**
- 必ず**ホワイトリスト検証**を行い、許可された値以外は例外を投げる
- 検証なしの利用はコードレビューで NG とする

## 結果セットの処理

```javascript
let result = db.executeByTemplate('/user/sql/searchUsers', params);

if (!result.isSuccess()) {
  Logger.getLogger().error('SQL 実行失敗: ' + result.errorMessage);
  throw new Error('検索に失敗しました');
}

let users = [];
for (let i = 0; i < result.data.length; i++) {
  let row = result.data[i];
  users.push({
    userId:   row.user_id,
    userName: row.user_name,
    email:    row.email
  });
}
```

- 戻り値は `DatabaseResult` オブジェクト
- `result.data` は配列、各要素は **カラム名（小文字）をキー**とするオブジェクト
- 実行成否は `isSuccess()` で判定、エラーメッセージは `errorMessage`

## トランザクション処理

INSERT / UPDATE / DELETE などの **更新系 SQL** を実行する場合は、必ず `Transaction.begin()` でトランザクション境界を設けること。

### 必須ルール

- **更新系 SQL（`execute` / `executeByTemplate` で INSERT/UPDATE/DELETE、`insert` / `update` / `delete`）は必ず `Transaction.begin()` の中で実行する**
- 単一 SQL の更新でも、業務的な一貫性を担保するためトランザクション内で実行すること
- 複数テーブルへの更新、複数行のループ INSERT 等は **同一トランザクション内** にまとめる
- `Transaction.begin()` のコールバック内で例外が発生すると **自動的にロールバック** される
- 例外は握りつぶさず、ログ出力した上で再スローする
- SELECT のみの参照系処理にはトランザクションは不要

### 実装例

```javascript
function registerOrder(data) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    Transaction.begin(function() {
      // ヘッダ登録
      db.executeByTemplate('/order/sql/insertOrder', {
        orderId:   DbParameter.string(data.orderId),
        customer:  DbParameter.string(data.customer)
      });

      // 明細登録（ループも同一トランザクション内）
      for (let i = 0; i < data.items.length; i++) {
        db.executeByTemplate('/order/sql/insertOrderItem', {
          orderId:  DbParameter.string(data.orderId),
          itemId:   DbParameter.string(data.items[i].itemId),
          quantity: DbParameter.integer(data.items[i].quantity)
        });
      }
    });
    return true;

  } catch (e) {
    logger.error('トランザクションエラー: {}', e.message);
    throw e;
  }
}
```

### アンチパターン

```javascript
// NG: トランザクションなしで更新系 SQL を実行
db.executeByTemplate('/order/sql/insertOrder', params);

// NG: ループ内の各 INSERT を個別にコミットしてしまう構造
for (let i = 0; i < items.length; i++) {
  Transaction.begin(function() {
    db.executeByTemplate('/order/sql/insertOrderItem', ...);
  });
}
```

## チェックリスト

- [ ] 外部化した SQL テンプレートには `executeByTemplate` / `fetchByTemplate` を使用しているか（`execute` にテンプレートパスを渡していない）
- [ ] SQL は `src/main/jssp/src/{機能名}/sql/` 配下に外部化されているか
- [ ] `executeByTemplate` / `fetchByTemplate` に渡すパスは `src/main/jssp/src/` 起点の絶対パス（先頭スラッシュあり）か
- [ ] 文字コードは UTF-8 か
- [ ] `executeByTemplate` / `fetchByTemplate` に渡すパスから `.sql` 拡張子を除去しているか
- [ ] バインドは `/*param*/'dummy'` 形式を使っているか
- [ ] `/*$param*/` を使う箇所はホワイトリスト検証されているか
- [ ] `/*FOR*/` 構文を使っていないか
- [ ] パラメータは `DbParameter.xxx()` でラップされているか
- [ ] `DbParameter` の型メソッドが DDL のカラム型と一致しているか（VARCHAR には `string()`、INTEGER/DECIMAL には `number()` 等）
- [ ] `DATE` / `TIMESTAMP` カラムに `DbParameter.string()` を使っていないか（PostgreSQL で型不一致エラーになる）
- [ ] `DATE` / `TIMESTAMP` カラムへの NULL 挿入に `new DbParameter(null, DbParameter.TYPE_DATE)` / `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` を使っているか（`DbParameter.date(null)` は失敗する。VARCHAR / 数値列は `DbParameter.string(null)` / `DbParameter.number(null)` で動作する。引数にオブジェクト型を要求するファクトリメソッドだけ `null` を渡せない）
- [ ] `result.isSuccess()` で実行成否を判定しているか
- [ ] 文字列連結による SQL 構築をしていないか
- [ ] LIKE 検索で LIKE 特殊文字（`\`、`%`、`_`）をエスケープしているか
- [ ] LIKE 検索で `ESCAPE '\'` 句を SQL に付与しているか
- [ ] LIKE 用のワイルドカード（`%`）はサーバサイドで付与しているか（クライアント送信は禁止）
- [ ] 更新系 SQL（INSERT/UPDATE/DELETE）は `Transaction.begin()` 内で実行しているか
- [ ] 複数テーブル・ループ更新は同一トランザクションにまとめているか
- [ ] トランザクション内で発生した例外をログ出力した上で再スローしているか

## 関連

- `instructions/jssp-security.instructions.md` - SQL インジェクション対策の全体方針
- `skills/jssp-page-generator/reference/api-database.md` - Database API リファレンス
- `d.ts/platform/database/im-ssjs-tenant-database.d.ts` - TenantDatabase の型定義
- `d.ts/platform/database/im-ssjs-shared-database.d.ts` - SharedDatabase の型定義
