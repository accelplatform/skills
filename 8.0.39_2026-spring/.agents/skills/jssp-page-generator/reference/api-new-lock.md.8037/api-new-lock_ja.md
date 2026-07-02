# NewLock API リファレンス

## 概要

NewLock は、アプリケーション・ロック管理オブジェクトである。
同一カテゴリキーワードによる排他制御を提供する。
static メソッドのみで構成されており、インスタンス化せずに直接利用できる。

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| lock(name) | Boolean | ロック開始（取得まで待機。`tryLock` 推奨） |
| lockRequestScope(name) | Boolean | リクエスト終了時に自動開放されるロック開始（`tryLockRequestScope` 推奨） |
| tryLock(name, timeout) | Boolean | タイムアウト付きでロック開始を試行 |
| tryLockRequestScope(name, timeout) | Boolean | タイムアウト付き・リクエスト終了時自動開放のロック開始を試行 |
| run(name, function, timeout) | Boolean | ロック下で関数を実行し、実行後に自動開放 |
| unlock(name) | Boolean | ロックを開放 |

戻り値はすべて `true`: 成功 / `false`: 失敗。

## メソッド詳細

### tryLock(name, timeout)

タイムアウト付きでロック開始を試行する。`lock()` はブロッキング動作のため、こちらの使用を推奨。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| name | String | ロックカテゴリキーワード |
| timeout | Number | 待ち時間（秒）。`0` で無制限待機 |

### tryLockRequestScope(name, timeout)

`tryLock()` と同様だが、リクエスト終了時にロックが自動開放される。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| name | String | ロックカテゴリキーワード |
| timeout | Number | 待ち時間（秒）。`0` で無制限待機 |

### run(name, function, timeout)

ロックを取得して関数を実行し、実行後に自動でロックを開放する。例外発生時も `false` を返却する。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| name | String | ロックカテゴリキーワード |
| function | Function | 実行する処理関数 |
| timeout | Number | 待ち時間（秒） |

### unlock(name)

ロックを開放する。ロック中・非ロック中を問わず開放処理を実行する。

| パラメータ | 型 | 説明 |
|-----------|------|------|
| name | String | ロックカテゴリキーワード |

## 使用例

### run による排他制御（推奨）

```javascript
let result = NewLock.run('order_regist', function() {
  // ロック内で実行される処理
  let db = new TenantDatabase();
  db.execute('INSERT INTO orders (id, item) VALUES (?, ?)', [orderId, item]);
}, 10);

if (!result) {
  // ロック取得失敗または例外発生
}
```

### tryLockRequestScope による排他制御

```javascript
let locked = NewLock.tryLockRequestScope('stock_update', 10);

if (locked) {
  // リクエスト終了時に自動開放されるため unlock 不要
  let db = new TenantDatabase();
  db.execute('UPDATE stock SET quantity = quantity - ? WHERE item_id = ?', [qty, itemId]);
} else {
  // ロック取得失敗（タイムアウト）
}
```

### tryLock / unlock による排他制御

```javascript
let locked = NewLock.tryLock('data_export', 30);

if (locked) {
  try {
    // 排他処理
    exportData();
  } finally {
    NewLock.unlock('data_export');
  }
} else {
  // ロック取得失敗（タイムアウト）
}
```
