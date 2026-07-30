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

```javascript
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

```javascript
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

## insert/update/remove メソッドの推奨

SQL文字列を直接書く代わりに、`insert`/`update`/`remove`メソッドの使用を推奨。

```javascript
// 推奨: insertメソッド
let db = new TenantDatabase();
let insertData = {
  user_id: 'U001',
  user_name: '山田太郎',
  email: 'yamada@example.com',
  created_at: new Date()
};
db.insert('users', insertData);

// 推奨: update メソッド（DbParameter 使用）
let updateData = {
  user_name: '山田次郎',
  updated_at: new Date()
};
db.update('users', updateData, 'user_id = ?', [DbParameter.string('U001')]);

// 推奨: remove メソッド（DbParameter 使用）
db.remove('users', 'user_id = ?', [DbParameter.string('U001')]);
```

## 2WaySQL（executeByTemplate）

### 概要

SQL ファイルを外部化し、条件分岐を含む動的SQLを安全に構築する仕組み。

### SQLファイルの配置

SQL ファイルは **必ず `src/main/jssp/src/` 配下** に配置する（外部ディレクトリでは読み込めない）。
機能単位で `src/main/jssp/src/{機能名}/sql/` 以下に配置する。

```
src/main/jssp/src/
└── user/
    ├── view/
    │   ├── user_list.js
    │   └── user_list.html
    └── sql/
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

```javascript
function searchUsers(criteria) {
  let db = new TenantDatabase();

  let params = {
    userId: criteria.userId ? DbParameter.string(criteria.userId) : null,
    userName: criteria.userName ? DbParameter.string('%' + criteria.userName + '%') : null,
    status: criteria.status ? DbParameter.string(criteria.status) : null
  };

  // sql/sample/user/searchUsers.sql を実行
  return db.executeByTemplate('/user/sql/searchUsers', params);
}

// ページング取得（start=1から20件取得）
function searchUsersWithPaging(criteria, start, length) {
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
```javascript
function searchUsersWithSort(sortColumn, sortOrder) {
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
- 配置先: `src/main/jssp/src/` 配下（JSSPソースディレクトリ内）

## 結果セットの処理

### select/executeByTemplateの結果処理

`select`/`executeByTemplate` の戻り値は `DatabaseResult` オブジェクト。
取得データは `result.data` 配列に格納され、各要素はカラム名（小文字）をキーとするオブジェクトである。

```javascript
function getUserList() {
  let db = new TenantDatabase();
  let sql = 'SELECT user_id, user_name, email FROM users';
  let result = db.select(sql, []);

  let users = [];
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

```javascript
// 絶対禁止！！！
let sql = "SELECT * FROM users WHERE user_id = '" + userId + "'";

// 正しい実装（DbParameter使用）
let sql = 'SELECT * FROM users WHERE user_id = ?';
let result = db.select(sql, [DbParameter.string(userId)]);
```

### LIKE 検索のワイルドカード

```javascript
// 良い例: 呼び出し側でワイルドカードを付与
let keyword = '山田';
let sql = 'SELECT * FROM users WHERE user_name LIKE ?';
let result = db.select(sql, [DbParameter.string('%' + keyword + '%')]);

// 2WaySQL の場合
let params = { userName: DbParameter.string('%' + keyword + '%') };
db.executeByTemplate('/user/sql/searchUsers', params);
```

### トランザクション処理

```javascript
function executeTransaction(data) {
  let logger = Logger.getLogger();
  let db = new TenantDatabase();

  try {
    // トランザクション
    Transaction.begin(function() {
      // 複数の DB 操作
      db.insert('orders', data.order);
      for (let i = 0; i < data.items.length; i++) {
        db.insert('order_items', data.items[i]);
      }
    });

    return true;

  } catch (e) {
    logger.error('トランザクションエラー: {}', e.message);
    throw e;
  }
}
```

## 大量データの処理

### DB 接続の効率化

データベースへの接続は、可能な限り少ない回数で行う。
ループ内で都度データベースに接続していると、オーバーヘッドが大きく、動作パフォーマンスに影響する。

良い例:
```javascript
// IN 句を使用して一度に取得
let db = new TenantDatabase();
let placeholders = userIds.map(function() { return '?'; }).join(',');
let sql = 'SELECT * FROM users WHERE user_id IN (' + placeholders + ')';
let result = db.select(sql, userIds);
```

悪い例:
```javascript
// ループ内で DB 接続を繰り返す
for (let i = 0; i < userIds.length; i++) {
  let db = new TenantDatabase();  // 毎回接続
  let result = db.select('SELECT * FROM users WHERE user_id = ?', [userIds[i]]);
}
```

### ページング処理の実装

```javascript
function fetchDataWithPaging(pageSize, pageNo) {
  let db = new TenantDatabase();
  let offset = (pageNo - 1) * pageSize;

  let sql = 'SELECT * FROM large_table ORDER BY id LIMIT ? OFFSET ?';
  return db.select(sql, [pageSize, offset]);
}
```
