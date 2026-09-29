---
paths:
  - "src/main/jssp/**/*.js"
---

# SharedResource API リファレンス

## 概要

SharedResource は、業務リソースを一意に表現し、そのリソースに対してロックを行うためのクラスである。
内部で NewLock API を使用し、テナント単位でロック管理を行う。

- カスタムタグ `<imart type="sharedResource" />` と連携し、画面上でリソース参照ユーザとロック状態を共有できる
- WebSocket または Comet を通じてクライアント通知を行う（送達保証なし）
- 楽観的なリソース共有を目的とした使用を想定

## コンストラクタ

```javascript
let resource = new SharedResource(application, businessKeys);
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `application` | String | アプリケーション識別子（任意の文字列） |
| `businessKeys` | Object | リソース一意識別用のキー/バリュー形式オブジェクト |

```javascript
let resource = new SharedResource('my_app', { appId: '123', appVersion: '3' });
```

## メソッド一覧

| メソッド | 戻り値 | 説明 |
|---------|--------|------|
| `getApplication()` | String | アプリケーション識別子を取得 |
| `getBusinessKeys()` | Object | 業務キーを取得 |
| `getKey()` | String | SharedResource の一意キーを返却 |
| `run(func, timeout)` | Boolean | ロック獲得後に処理実行、完了後に解放 |
| `runAndNotify(func, timeout)` | Boolean | run + クライアント通知 |
| `tryLock(timeout)` | Boolean | ロック獲得を試行 |
| `tryLockAndNotify(timeout)` | Boolean | ロック獲得試行 + クライアント通知 |
| `unlock()` | void | ロック解放 |
| `unlockAndNotify()` | void | ロック解放 + クライアント通知 |
| `notifyUpdate()` | void | クライアントにリソース更新通知を送信 |

## run(func, timeout)

ロックを獲得し、関数を実行した後にロックを解放する。
ロック獲得に失敗した場合は `false` を返却する。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

let result = resource.run(function() {
  // ロック中に実行する処理
  let db = new TenantDatabase();
  db.update('orders', { status: 'confirmed' }, 'order_id = ?', [DbParameter.string('ORD-001')]);
}, 10);

if (!result) {
  // ロック獲得失敗
}
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `func` | Function | ロック中に実行する関数 |
| `timeout` | Number | タイムアウト秒数（0 でロック解除まで待機） |

## runAndNotify(func, timeout)

`run` と同様にロック獲得・処理実行・ロック解放を行い、さらにクライアントへ通知を送信する。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

resource.runAndNotify(function() {
  // ロック中に実行する処理
}, 10);
```

## tryLock(timeout) / tryLockAndNotify(timeout)

ロック獲得を試行する。成功時は `true`、失敗時は `false` を返却する。
`tryLockAndNotify` はロック獲得成功時にクライアントへ通知も行う。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

if (resource.tryLock(10)) {
  try {
    // ロック中の処理
  } finally {
    resource.unlock();
  }
}
```

| パラメータ | 型 | 説明 |
|-----------|------|------|
| `timeout` | Number | タイムアウト秒数（0 でロック解除まで待機） |

## unlock() / unlockAndNotify()

ロックを解放する。`unlockAndNotify` はロック解放時にクライアントへ通知も行う。

**注意:** 同一リソースに対する全ロックを解放する。

## notifyUpdate()

リソースを参照しているクライアントに更新通知を送信する。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });
resource.notifyUpdate();
```
