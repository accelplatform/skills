---
paths:
  - "src/main/jssp/**/*.sql"
---

# 2WaySQL 規約

> **適用範囲**: 🟡 **文脈依存** — **DB 操作時のみ適用**（`db.executeByTemplate` / `db.execute` を使う場合）。ワークフロー画面のような DB 非操作のフォームでは読まなくてよい。

条件分岐を含む動的 SQL を安全に構築するため、SQL を外部ファイル化して `executeByTemplate` / `fetchByTemplate` で実行する仕組み。

## 適用方針

- **動的に WHERE 句や条件が変化する SELECT** は 2WaySQL を使用する
- 単純な固定 SQL や 1 パラメータの単発実行は `select` / `execute` + `DbParameter` でも可
- **文字列連結による SQL 構築は絶対禁止**（jssp-security.md 参照）

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

## 【重要】SQL ファイルに `--` コメントを書かない

2WaySQL のパーサは `--` 行コメントの中身を区別せず、**ファイル全体を走査してテンプレート構文を検出する**。
そのため、説明用の `--` コメントの中に `/*IF*/` 等の構文表記・実際のバインド名（例: `/*orderId*/`）・`?` をリテラルに書くと、コメントであるにもかかわらず本物のテンプレート指示だと誤認識され、コメントの中身とは無関係に見える実行時エラーになる（`"IF" is not defined.`、`"$1" is not defined.`、`列インデックスは範囲外です` 等）。

上記理由から、**SQL ファイルには `--` コメントを一切書かないこと。**
ファイルの目的・検証観点・パラメータの説明は、呼び出し元のファンクションコンテナ側の JSDoc（関数コメント）に書く。
SQL ファイルは実行される SQL 本文のみを置く。

```javascript
/**
 * status・category_cd の任意条件で注文を検索します（未指定時は全件取得）。
 * SQL: /content/sql/search_orders
 *
 * @param {Object} criteria - 検索条件
 * @return {Object} 検索結果
 */
function searchOrders(criteria) {
  // ...
}
```

```sql
SELECT order_id, customer_name, status, category_cd
FROM foo_order
/*BEGIN*/
WHERE
  /*IF status != null*/
  status = /*status*/'dummy'
  /*END*/
/*END*/
ORDER BY order_id
```

Java 側（`im_mirage`）も同種の実装のため、同じ問題が起こりうる（`java-im-mirage-usage` スキル参照）。
以降のサンプルコードでは説明の都合上ファイルパスや NG/OK を示すコメントを添えている箇所があるが、**実際の SQL ファイルにはそれらのコメントを含めないこと**。

## 構文

| 構文 | 用途 | 備考 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分岐 | |
| `/*BEGIN*/.../*END*/` | オプショナルブロック（中身が全部消えると WHERE 等も自動的に消える） | 前置子として自動除去できるのは `AND`/`OR` のみ。UPDATE 文の SET 句で `,` を前置子として自動除去させる用途には使わないこと（「動的な SET 句」参照） |
| `/*param*/'dummy'` | バインドプレースホルダ（PreparedStatement 方式） | **推奨** |
| `/*param*/('dummy')` | IN 句の括弧付きバインド（配列をプレースホルダの列へ動的展開） | 詳細は下記「IN 句の動的生成」参照 |
| `/*$param*/dummy` | 直接埋め込み | SQL インジェクションリスクあり、ホワイトリスト必須 |

### 禁止構文

- **`/*FOR item in list*/.../*END*/`** は LogicDesigner / im_mirage では使えるが、**スクリプト開発モデルでは非対応**。使用しないこと。

### 注意: `/*BEGIN*/` ブロック内で `/*IF*/` を入れ子にしない

パーサは `/*IF*/` の入れ子自体をサポートしているが、`/*BEGIN*/` ブロックの内側で入れ子にすると、内側 `/*IF*/` の先頭の `AND`/`OR` が前置子除去の対象になり、外側 `/*IF*/` がそのブロックで最初に成立した条件だったときに削除されてしまう（内側の条件を処理し終えるまで、ブロック全体としての「出力済み」状態が確定しないため）。結果 `WHERE a = ? b = ?` のような不正な SQL になる。先行する兄弟条件が成立していると正しく出力されるため、パラメータの組合せ次第で通ったり落ちたりする（実機確認済み。外側 IF がブロック内で最初に成立するケースでは構文エラーになり、先行する兄弟条件が成立するケースでは正常動作することを確認している）。

複数条件は入れ子にせず、兄弟として並べ、依存関係は条件式で表現すること。

```sql
/*IF status != null*/
status = /*status*/'dummy'
/*END*/
/*IF status != null && categoryCd != null*/
AND category_cd = /*categoryCd*/'dummy'
/*END*/
```

（内側ブロックが `AND`/`OR`/`,` で始まらない入れ子 — 演算子や値の断片を切り替える用途など — はこの問題の対象外で、使用して差し支えない。）

### ダミー値の意味

`/*param*/'dummy'` の `'dummy'` は **2WaySQL の実行確認用ダミー値**であり、実行時はバインドパラメータに置換される。
SQL クライアントで単体実行できるよう、構文として正しい値を書くこと。

IN 句の括弧付きバインド（`/*param*/('dummy')`）のダミー値は、`('dummy')` のように単一値でよい（`('dummy1', 'dummy2')` のように複数個並べても実機で問題なく動作することを確認している）。

## IN 句の動的生成（`/*param*/('dummy')`）

配列を `IN` 句へ動的展開する場合は、`/*param*/` の直後に `('dummy')` を置く括弧付きバインドを使う。

```sql
SELECT user_id, user_name
FROM users
/*BEGIN*/
WHERE
  /*IF userIds != null && userIds.length > 0*/
  user_id IN /*userIds*/('dummy')
  /*END*/
/*END*/
```

```javascript
function searchByIds(userIds) {
  let db = new TenantDatabase();
  let params = {
    // 空配列は null に変換する（null・空配列どちらでも SQL 側の /*IF*/ でガードする）。
    // 配列の要素も他のバインド変数と同様に DbParameter でラップする必要がある。
    // プレーンな文字列配列を渡すと "The parameter must be instance of DbParameter." になる
    userIds: userIds.length > 0
      ? userIds.map(function(userId) { return DbParameter.string(userId); })
      : null
  };
  return db.executeByTemplate('/user/sql/searchByIds', params);
}
```

**`null` と空配列の両方を `/*IF*/` でガードすること**（ガードが無いと `IN` が裸で残り SQL が壊れる）。

### 【重要】ガードにより空配列が「0 件」ではなく「全件」になる場合がある

上記のように IN 句ガードが `/*BEGIN*/` 内の唯一の条件である場合、`userIds` が `null`・空配列だと `/*IF*/` の中身が消え、`/*BEGIN*/` ブロックが空になるため **`WHERE` 句ごと除去**される（`/*BEGIN*/` は中身が全部消えると `WHERE` 等も自動的に消える、という基本挙動どおり）。
その結果、SQL エラーにはならないものの、意図した「対象なし（0 件）」ではなく **絞り込み無しの全件** が返る（実機で確認済み）。

「呼び出し元が空配列を渡した場合は結果も空にしたい」という意図がある場合は、**SQL 側のガードだけに頼らず、呼び出し元で空配列・null を判定し、SQL を実行せずに空配列を返す**などのアプリケーション側のガードを追加すること。特に、認可・権限フィルタ（例: アクセス可能な ID 一覧を `IN` 句に渡す用途）でこの構成を使う場合、空配列が全件公開に化ける事故を防ぐため必須の対策である。

## SQL ファイル例

```sql
SELECT user_id, user_name, email
FROM users
/*BEGIN*/
WHERE
  /*IF userId != null*/
    user_id = /*userId*/'dummy'
  /*END*/
  /*IF userName != null*/
    AND user_name LIKE /*userName*/'%dummy%' ESCAPE '@'
  /*END*/
  /*IF status != null*/
    AND status = /*status*/'active'
  /*END*/
/*END*/
ORDER BY user_id
```

## LIKE 検索時のエスケープ（LIKE パターンインジェクション対策）

LIKE 演算子に渡すパラメータには、ユーザ入力に含まれる **LIKE 特殊文字（エスケープ文字自身、`%`、`_`）を必ずエスケープ** すること。
エスケープせずにワイルドカード（`%`）を付与すると、以下の問題が発生する:

- `%` を入力 → `%%%` で全件ヒット（意図しない全件取得）
- `_` を入力 → `%_%` で任意の 1 文字にマッチ（意図しない部分一致）

### 【重要】エスケープ文字にバックスラッシュ（`\`）を使ってはならない

`TenantDatabase#executeByTemplate` の 2WaySQL テンプレートコンパイラは、**SQLファイル内のバックスラッシュ文字を、コメント・SQL 本体を問わず除去してしまう**ことを実機で確認している。
そのため `ESCAPE '\'` と書いても、実行時には `ESCAPE ''`（空文字列）になってしまい、**エスケープ自体が無効化される**。この結果、エスケープが必要なキーワード（`%` や `_` を含むキーワード）での検索が 0 件になる、という分かりにくい不具合になる。

一般的な Web 検索や他 DB 製品の解説では `ESCAPE '\'` が定石として紹介されているが、**スクリプト開発モデルの `TenantDatabase`/`SharedDatabase` ではこの定石が通用しない**。intra-mart では伝統的に **`@`（アットマーク）をエスケープ文字として使う慣習がある**ため、本規約でも `@` を使用する。
（Java 側 `im_mirage` にはこの問題は無く、`\` のままで正しく動作することを実機で確認済み。JSSP 側 `TenantDatabase` に固有の制約である。）

### 必須ルール

1. **ワイルドカード（`%`）の付与はサーバサイドで行う** — クライアント（ブラウザ）から `%keyword%` を送信してはならない
2. **LIKE 特殊文字をエスケープしてからワイルドカードを付与する**
3. **SQL に `ESCAPE '@'` 句を付与する（`ESCAPE '\'` は使わない）**

### SQL 側

```sql
AND user_name LIKE /*userName*/'%dummy%' ESCAPE '@'
```

### サーバサイド（ファンクションコンテナ）

```javascript
/**
 * LIKE 検索用のパラメータを生成します。
 * LIKE 特殊文字をエスケープし、前後にワイルドカードを付与します。
 * エスケープ文字には '@' を使う（'\' は TenantDatabase が除去してしまうため使用不可）。
 *
 * @param {String} value - 検索キーワード（生の入力値）
 * @return {String} エスケープ済みの LIKE パラメータ
 */
function toLikeParam(value) {
  if (!value) {
    return '%';
  }
  let escaped = value
    .replace(/@/g, '@@')   // @ → @@
    .replace(/%/g, '@%')   // % → @%
    .replace(/_/g, '@_');  // _ → @_
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
- **NULL になりうる `DATE` / `TIMESTAMP` カラム**: 下記「INSERT / UPDATE における NULL 値の渡し方」を参照

DDL が未作成の場合は、実装前に DDL を作成するか、データモデル定義で型を確定させてから `DbParameter` を選択すること。

### INSERT / UPDATE における NULL 値の渡し方

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

**この表が適用されるのは、その列が `/*IF*/` で分岐せず SQL 本文へ常に出力される場合のみ**である点に注意すること（INSERT 文で常に指定する列、UPDATE 文で常に SET する列等）。

> **注意:** `DbParameter.NULL` は型定数（`number` 型の値）であり DbParameter インスタンスではない。ストアドプロシージャ専用。通常の INSERT/UPDATE には使用しないこと。

### 【重要】`/*IF*/` で分岐する DATE / TIMESTAMP パラメータには素の `null` を渡す

検索条件（WHERE 句）のように `/*IF paramName != null*/` で有無を分岐させる DATE / TIMESTAMP パラメータに、上記の表と同じ感覚で `new DbParameter(null, DbParameter.TYPE_DATE)` を渡すと、
**`/*IF*/` の条件式は DbParameter オブジェクト自体を見て判定するため、値が null でも「指定あり」と誤判定され、
`AND some_date >= NULL` のような常に偽になる条件が SQL に追加され、結果的に 0 件しかヒットしなくなる**ことを実機で確認している。

```javascript
// NG: /*IF orderDateFrom != null*/ が常に true と評価され、
//     "AND order_date >= NULL" が付与されて全件ヒットしなくなる
let params = {
  orderDateFrom: orderDateFrom
    ? DbParameter.date(parseLocalDate(orderDateFrom))
    : new DbParameter(null, DbParameter.TYPE_DATE)
};

// OK: 未指定時は素の null を渡し、/*IF*/ 側で正しく分岐させる
let params = {
  orderDateFrom: orderDateFrom
    ? DbParameter.date(parseLocalDate(orderDateFrom))
    : null
};
```

まとめると、`new DbParameter(null, TYPE_DATE)` は列が **常に** SQL 本文に出力される場合のみに使い、`/*IF*/` で分岐させる場合は **素の `null`** を使う。

## 直接埋め込み（`/*$param*/`）の使用ルール

ORDER BY 句のカラム名・ソート方向など、**バインド変数では指定できない箇所**にのみ使用する。

```sql
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

## 動的な SET 句（UPDATE 文）の組み立て

UPDATE 文の SET 句を `/*BEGIN*/` で囲み、各項目の前置カンマを `/*BEGIN*/` に除去させる書き方は、
**カンマの位置がフォーマットによって挙動が変わる**ため不安定である。

- `/*IF*/` マーカーと**同じ行の先頭**にカンマを置いた場合は、パーサがカンマを前置子として認識し正しく除去できる
- カンマを**改行してインデントした別の行**に置いた場合は、パーサがカンマを前置子として認識できず、先頭に裸のカンマが残った不正な SQL になり構文エラーになる（実機で `ERROR: ","またはその近辺で構文エラー` を確認済み）

さらに、`/*BEGIN*/` は中身の条件がすべて偽になった場合、SET 句全体（`SET` キーワードごと）を除去してしまうため、更新対象カラムが1つも無いケースで不正な SQL（`SET` の無い `UPDATE`）になる問題も残る。

このように **カンマの前置子除去はフォーマット依存で壊れやすく、`/*BEGIN*/` の「全条件偽で丸ごと消える」性質とも相性が悪い**ため、`/*BEGIN*/` に SET 句のカンマ除去を任せる書き方はそもそも採用しないこと。

構文エラーになる例（カンマを改行してインデントした行に配置）:

```sql
UPDATE users
/*BEGIN*/
SET
  /*IF status != null*/
  , status = /*status*/'active'
  /*END*/
  /*IF memo != null*/
  , memo = /*memo*/'memo'
  /*END*/
/*END*/
WHERE user_id = /*userId*/'dummy'
```

SET 句の先頭に、対象を変更しない自己代入（例: 主キー列 `= 自分自身`）を常に置き、以降の項目は `/*BEGIN*/` を使わず常にカンマ付きで連結すること。
この方式であればカンマの位置に依存せず、SET 句が丸ごと消える心配もない。

```sql
UPDATE users
SET
  user_id = /*userId*/'dummy'
  /*IF status != null*/
  , status = /*status*/'active'
  /*END*/
  /*IF memo != null*/
  , memo = /*memo*/'memo'
  /*END*/
WHERE user_id = /*userId*/'dummy'
```

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
- [ ] **SQL ファイルに `--` コメントを書いていないか**（目的・説明は呼び出し元の JSDoc に書く）
- [ ] バインドは `/*param*/'dummy'` 形式を使っているか
- [ ] `/*$param*/` を使う箇所はホワイトリスト検証されているか
- [ ] `/*FOR*/` 構文を使っていないか。`/*BEGIN*/` ブロック内で `/*IF*/` を入れ子にしていないか（兄弟として並べているか）
- [ ] パラメータは `DbParameter.xxx()` でラップされているか
- [ ] `DbParameter` の型メソッドが DDL のカラム型と一致しているか（VARCHAR には `string()`、INTEGER/DECIMAL には `number()` 等）
- [ ] `DATE` / `TIMESTAMP` カラムに `DbParameter.string()` を使っていないか（PostgreSQL で型不一致エラーになる）
- [ ] `DATE` / `TIMESTAMP` カラムへの NULL 挿入に `new DbParameter(null, DbParameter.TYPE_DATE)` / `new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` を使っているか（列が常に出力される場合のみ。`/*IF*/` で分岐する場合は素の `null` を使う）
- [ ] IN 句の括弧付きバインド（`/*param*/('dummy')`）で、配列の各要素を `DbParameter` でラップしているか
- [ ] UPDATE 文の SET 句で、カンマの前置子除去を `/*BEGIN*/` に期待していないか（自己代入を先頭に置く方式になっているか）
- [ ] `result.isSuccess()` で実行成否を判定しているか
- [ ] 文字列連結による SQL 構築をしていないか
- [ ] LIKE 検索で LIKE 特殊文字（エスケープ文字自身、`%`、`_`）をエスケープしているか
- [ ] LIKE 検索で `ESCAPE '@'` 句を SQL に付与しているか（`ESCAPE '\'` は使っていないか）
- [ ] LIKE 用のワイルドカード（`%`）はサーバサイドで付与しているか（クライアント送信は禁止）
- [ ] 更新系 SQL（INSERT/UPDATE/DELETE）は `Transaction.begin()` 内で実行しているか
- [ ] 複数テーブル・ループ更新は同一トランザクションにまとめているか
- [ ] トランザクション内で発生した例外をログ出力した上で再スローしているか

## 関連

- `.claude/rules/jssp-security.md` - SQL インジェクション対策の全体方針
- `.claude/skills/jssp-page-generator/reference/api-database.md` - Database API リファレンス
- `d.ts/platform/database/im-ssjs-tenant-database.d.ts` - TenantDatabase の型定義
- `d.ts/platform/database/im-ssjs-shared-database.d.ts` - SharedDatabase の型定義
