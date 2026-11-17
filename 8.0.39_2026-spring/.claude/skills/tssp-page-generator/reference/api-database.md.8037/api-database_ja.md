---
paths:
  - "src/main/tssp/**/*.ts"
  - "src/main/jssp/**/*.sql"
---

# データベース操作 API リファレンス

## 概要

ファンクションコンテナで、データベースに直接アクセスし、データを取得・追加・更新・削除するための API 呼び出し方法。

### 注意点

- データベースを操作する Java API が別途用意されている場合は、Java API の使用を優先する
- データベースへの直接アクセスは、必要最低限で行う

## データベースクラスの使い分け

| クラス | 用途 | スコープ |
|--------|------|----------|
| `TenantDatabase` | テナント固有データへのアクセス | テナント単位 |
| `SharedDatabase` | 外部システム連携、共有データ | システム全体 |

```typescript
// テナントデータベース（通常はこちらを使用）
let tenantDb = new TenantDatabase();

// 共有データベース（外部システム連携時、接続ID を指定）
let sharedDb = new SharedDatabase('dataSourceId');
```

## 主要メソッド一覧

### SELECT系

| メソッド | 用途 | 戻り値 |
|---------|------|--------|
| `select(sql, params)` | SELECT 実行 | 結果セット |
| `fetch(sql, start, length, params)` | ページング付き SELECT | 結果セット |
| `executeByTemplate(path, params)` | 2WaySQL 実行 | 結果セット |
| `fetchByTemplate(path, start, length, params)` | 2WaySQL+ページング | 結果セット |

**fetch/fetchByTemplateの引数:**
- `path/sql`: SQLテンプレートパスまたは SQL 文字列
- `start`: 取得開始行（1始まり）
- `length`: 取得件数（0で全件）
- `params`: バインドパラメータ（省略可能）

### 更新系

| メソッド | 用途 | 戻り値 |
|---------|------|--------|
| `execute(sql, params)` | 汎用SQL実行 | DatabaseResult |
| `insert(tableName, dataObject)` | INSERT | DatabaseResult |
| `update(tableName, dataObject, condition, params)` | UPDATE | DatabaseResult |
| `remove(tableName, condition, params)` | DELETE | DatabaseResult |

## DbParameterの使用（推奨）

パラメータは DbParameter オブジェクトで渡すことを推奨。
PreparedStatement としてバインドされ、SQL インジェクションを防止できる。

### DbParameterの型

| メソッド | 用途 |
|---------|------|
| `DbParameter.string(value)` | 文字列 |
| `DbParameter.number(value)` | 数値 |
| `DbParameter.clob(textReader)` | CLOB（大きなテキスト） |
| `DbParameter.binary(byteReader)` | BLOB（バイナリ） |

### 使用例

```typescript
// 推奨: DbParameterを使用
let db = new TenantDatabase();
let sql = 'SELECT * FROM users WHERE user_id = ? AND status = ?';
let result = db.select(sql, [
  DbParameter.string(userId),
  DbParameter.string(status)
]);

// ページング取得（start=1から10件取得）
let pagedResult = db.fetch(sql, 1, 10, [
  DbParameter.string(userId),
  DbParameter.string(status)
]);
```

**注意**:
- `undefined` を渡すと `null` として扱われる
- 配列パラメータ（Oracle VARRAY 等）は非対応
- d.ts の `DbParameter.string()` / `DbParameter.number()` の引数の型は `null` を含まないので、`null` になりうる値を渡すと `tssp build` の型検査で TS2345 になる。SQL 本文に常に出力する列で `null` になりうる値は `new DbParameter(value, DbParameter.TYPE_STRING)`（数値は `DbParameter.TYPE_NUMBER`）で渡し、2WaySQL の `/*IF*/` で分岐するパラメータには素の `null` を渡す（`jssp-2way-sql.md` の「INSERT / UPDATE における NULL 値の渡し方」参照）

## insert/update/remove メソッドの推奨

SQL文字列を直接書く代わりに、`insert`/`update`/`remove`メソッドの使用を推奨。

```typescript
// insert / update / remove は更新系なので Transaction.begin() の中で実行し、各結果の error を確かめて throw する（コールバックが例外で抜けたときだけロールバックされる）
let db = new TenantDatabase();
let txResult = Transaction.begin(function(): void {
  // 推奨: insertメソッド
  let insertData = {
    user_id: 'U001',
    user_name: '山田太郎',
    email: 'yamada@example.com',
    created_at: new Date()
  };
  let insertResult = db.insert('users', insertData);
  if (insertResult.error) {
    throw new Error(insertResult.errorMessage);
  }

  // 推奨: update メソッド（DbParameter 使用）
  let updateData = {
    user_name: '山田次郎',
    updated_at: new Date()
  };
  let updateResult = db.update('users', updateData, 'user_id = ?', [DbParameter.string('U001')]);
  if (updateResult.error) {
    throw new Error(updateResult.errorMessage);
  }

  // 推奨: remove メソッド（DbParameter 使用）
  let removeResult = db.remove('users', 'user_id = ?', [DbParameter.string('U001')]);
  if (removeResult.error) {
    throw new Error(removeResult.errorMessage);
  }
});
if (!txResult.isSuccess()) {
  throw new Error(txResult.errorMessage);
}
```

## 2WaySQL（executeByTemplate）

### 概要

SQL ファイルを外部化し、条件分岐を含む動的SQLを安全に構築する仕組み。

### SQLファイルの配置

SQL ファイルは **必ず `src/main/jssp/src/` 配下** に配置する（外部ディレクトリでは読み込めない）。
機能単位で `src/main/jssp/src/{機能名}/sql/` 以下に配置する。
`src/main/jssp/src` は `tssp build` の出力先で、ここに手で置くのは `.sql` のように `tssp build` が出力しないファイルだけである（`tssp build` が出力するのは `.ts` から変換した `.js`（`--dev` では `.js.map` も）と、コピーした `.html` だけなので、`src/main/tssp/src` に置いた `.sql` は出力されず、`executeByTemplate` から読み込めない）。

```
src/main/tssp/src/                # .ts と .html を書く
└── user/
    └── view/
        ├── user_list.ts
        └── user_list.html
src/main/jssp/src/                # tssp build の出力先
└── user/
    ├── view/                     # tssp build が出力する（手で編集しない）
    │   ├── user_list.js
    │   └── user_list.html
    └── sql/                      # .sql は手で置く（tssp build は出力しない）
        ├── selectUser.sql
        └── searchUsers.sql
```

`executeByTemplate` / `fetchByTemplate` に渡すパスは:
- **`src/main/jssp/src/` を起点とした絶対パス**（先頭スラッシュあり）
- **拡張子 `.sql` を含めない**（含めると実行に失敗する）

例: `/user/sql/searchUsers`

### 2WaySQL 構文

| 構文 | 用途 | 備考 |
|------|------|------|
| `/*IF condition*/.../*END*/` | 条件分岐 | |
| `/*BEGIN*/.../*END*/` | オプショナルブロック | |
| `/*param*/'dummy'` | バインドプレースホルダ | PreparedStatement 方式 |
| `/*$param*/dummy` | 直接埋め込み | SQL インジェクション注意 |

**注意**: FOR構文（`/*FOR item : list*/.../*END*/`）は LogicDesigner/im_mirage では使用可能だが、**スクリプト開発モデルでは非対応**。

### SQLファイル例（searchUsers.sql）

```sql
SELECT user_id, user_name, email
FROM users
/*BEGIN*/
WHERE
  /*IF userId != null*/
    user_id = /*userId*/'dummy'
  /*END*/
  /*IF userName != null*/
    AND user_name LIKE /*userName*/'%dummy%'
  /*END*/
  /*IF status != null*/
    AND status = /*status*/'active'
  /*END*/
/*END*/
ORDER BY user_id
```

**注意**: `/*param*/'dummy'` の `'dummy'` は 2WaySQL の実行確認用ダミー値。実行時はバインドパラメータに置換される。

### 呼び出し例

```typescript
/** 検索条件（未指定の項目は省略する） */
interface UserSearchCriteria {
  userId?: string;
  userName?: string;
  status?: string;
}

function searchUsers(criteria: UserSearchCriteria): DatabaseResult {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    userName: criteria.userName ? DbParameter.string('%' + criteria.userName + '%') : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  // src/main/jssp/src/user/sql/searchUsers.sql を実行
  return db.executeByTemplate('/user/sql/searchUsers', params);
}

// ページング取得（start=1から20件取得）
function searchUsersWithPaging(criteria: UserSearchCriteria, start: number, length: number): DatabaseResult {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  return db.fetchByTemplate('/user/sql/searchUsers', start, length, params);
}
```

### 直接埋め込み（/*$変数名*/）

ORDER BY 句やカラム名など、バインド変数では指定できない箇所に使用する。

**SQLファイル例（dynamicSort.sql）:**
```sql
SELECT user_id, user_name, email
FROM users
ORDER BY /*$sortColumn*/user_id /*$sortOrder*/ASC
```

**呼び出し例（必ずホワイトリストで検証すること）:**
```typescript
function searchUsersWithSort(sortColumn: string, sortOrder: string): DatabaseResult {
  let db = new TenantDatabase();

  // ホワイトリスト検証（必須）
  let allowedColumns = ['user_id', 'user_name', 'created_at'];
  let allowedOrders = ['ASC', 'DESC'];

  if (allowedColumns.indexOf(sortColumn) === -1) {
    throw new Error('Invalid column');
  }
  if (allowedOrders.indexOf(sortOrder) === -1) {
    throw new Error('Invalid order');
  }

  let params = {
    sortColumn: sortColumn,
    sortOrder: sortOrder
  };

  return db.executeByTemplate('/user/sql/dynamicSort', params);
}
```

**警告**: `/*$*/` は値をそのまま SQL に埋め込むため、**SQLインジェクションのリスク**がある。
ユーザ入力を直接渡さず、必ずホワイトリスト検証を行うこと。

### SQLファイルの規約

- 文字コード: **UTF-8**（必須）
- 拡張子: `.sql`
- 配置先: `src/main/jssp/src/{機能名}/sql/` 配下（`tssp build` は `.sql` を出力しないので手で置く）

## 結果セットの処理

### select/executeByTemplateの結果処理

`select`/`executeByTemplate` の戻り値は `DatabaseResult` オブジェクト。
取得データは `result.data` 配列に格納され、各要素はカラム名（小文字）をキーとするオブジェクトである。

```typescript
/** ユーザ一覧の 1 件 */
interface User {
  userId: string;
  userName: string;
  email: string;
}

function getUserList(): User[] {
  let db = new TenantDatabase();
  let sql = 'SELECT user_id, user_name, email FROM users';
  let result = db.select(sql, []);

  let users: User[] = [];
  for (let i = 0; i < result.data.length; i++) {
    let row = result.data[i];
    users.push({
      userId: row.user_id,
      userName: row.user_name,
      email: row.email
    });
  }

  return users;
}
```

### DatabaseResult の主要プロパティ

| プロパティ/メソッド | 型 | 用途 |
|---------|------|------|
| `data` | Array | 取得データの配列（カラム名でアクセス） |
| `countRow` | Number | 取得または影響を受けた行数 |
| `error` | Boolean | エラー発生時 `true` |
| `errorMessage` | String | エラーメッセージ |
| `isSuccess()` | Boolean | 処理が正常完了した場合 `true` |

## 注意事項

### SQL インジェクション対策

- 必ずパラメタライズドクエリまたは 2WaySQL を使用
- 文字列連結での SQL 構築は**絶対禁止**
- DbParameter の使用を推奨

```typescript
// 絶対禁止！！！
let badSql = "SELECT * FROM users WHERE user_id = '" + userId + "'";

// 正しい実装（DbParameter使用）
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [DbParameter.string(userId)]);
```

### LIKE 検索のワイルドカード

```typescript
// 良い例: 呼び出し側でワイルドカードを付与
let keyword = '山田';
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, [DbParameter.string('%' + keyword + '%')]);

// 2WaySQL の場合
let params = { userName: DbParameter.string('%' + keyword + '%') };
db.executeByTemplate('/user/sql/searchUsers', params);
```

### トランザクション処理

```typescript
/** orders テーブルに登録する 1 行（キーはカラム名） */
interface OrderRow {
  order_id: string;
  customer_name: string;
}

/** order_items テーブルに登録する 1 行（キーはカラム名） */
interface OrderItemRow {
  order_id: string;
  item_id: string;
  quantity: number;
}

/** 登録する注文 */
interface OrderInsertData {
  order: OrderRow;
  items: OrderItemRow[];
}

function executeTransaction(data: OrderInsertData): boolean {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    // トランザクション
    let txResult = Transaction.begin(function(): void {
      // 複数の DB 操作
      let orderResult = db.insert('orders', data.order);
      if (orderResult.error) {
        throw new Error(orderResult.errorMessage);
      }
      for (let i = 0; i < data.items.length; i++) {
        let itemResult = db.insert('order_items', data.items[i]);
        if (itemResult.error) {
          throw new Error(itemResult.errorMessage);
        }
      }
    });
    if (!txResult.isSuccess()) {
      throw new Error(txResult.errorMessage);
    }

    return true;

  } catch (e) {
    logger.error('トランザクションエラー: {}', (e as Error).message);
    throw e;
  }
}
```

## 大量データの処理

### DB 接続の効率化

データベースへの接続は、可能な限り少ない回数で行う。
ループ内で都度データベースに接続していると、オーバーヘッドが大きく、動作パフォーマンスに影響する。

良い例:
```typescript
// IN 句を使用して一度に取得（selectUsersByIds.sql: SELECT * FROM users WHERE user_id IN /*userIds*/('dummy')）
let db = new TenantDatabase();
let params = {
  userIds: userIds.map(function(userId: string): DbParameter { return DbParameter.string(userId); })
};
let result = db.executeByTemplate('/user/sql/selectUsersByIds', params);
```

SQL を文字列連結で組み立てると `validate-jssp-code.js` が `JSSP-JS-004` のエラーにするため、IN 句は 2WaySQL の括弧付きバインドで展開する。`userIds` が `null`・空配列のときのガードは `jssp-2way-sql.md` の「IN 句の動的生成」を参照。

悪い例:
```typescript
// ループ内で DB 接続を繰り返す
for (let i = 0; i < userIds.length; i++) {
  let db = new TenantDatabase();  // 毎回接続
  let result = db.select('SELECT * FROM users WHERE user_id = ?', [DbParameter.string(userIds[i])]);
}
```

### ページング処理の実装

```typescript
function fetchDataWithPaging(pageSize: number, pageNo: number): DatabaseResult {
  let db = new TenantDatabase();
  let offset = (pageNo - 1) * pageSize;

  let sql = 'SELECT * FROM large_table ORDER BY id LIMIT ? OFFSET ?';
  return db.select(sql, [DbParameter.number(pageSize), DbParameter.number(offset)]);
}
```
