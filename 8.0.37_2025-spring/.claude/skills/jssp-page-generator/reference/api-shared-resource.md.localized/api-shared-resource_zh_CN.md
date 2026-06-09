---
paths:
  - "src/main/jssp/**/*.js"
---

# SharedResource API 参考

## 概述

SharedResource 是唯一标识业务资源并对其进行锁定的类。
内部使用 NewLock API，以租户为单位进行锁管理。

- 与自定义标签 `<imart type="sharedResource" />` 联动，可在画面上共享资源引用用户和锁定状态
- 通过 WebSocket 或 Comet 进行客户端通知（不保证送达）
- 设计用于乐观的资源共享目的

## 构造函数

```javascript
let resource = new SharedResource(application, businessKeys);
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `application` | String | 应用程序标识符（任意字符串） |
| `businessKeys` | Object | 用于资源唯一标识的键/值格式对象 |

```javascript
let resource = new SharedResource('my_app', { appId: '123', appVersion: '3' });
```

## 方法列表

| 方法 | 返回值 | 说明 |
|------|--------|------|
| `getApplication()` | String | 获取应用程序标识符 |
| `getBusinessKeys()` | Object | 获取业务键 |
| `getKey()` | String | 返回 SharedResource 的唯一键 |
| `run(func, timeout)` | Boolean | 获取锁后执行处理，完成后释放 |
| `runAndNotify(func, timeout)` | Boolean | run + 客户端通知 |
| `tryLock(timeout)` | Boolean | 尝试获取锁 |
| `tryLockAndNotify(timeout)` | Boolean | 尝试获取锁 + 客户端通知 |
| `unlock()` | void | 释放锁 |
| `unlockAndNotify()` | void | 释放锁 + 客户端通知 |
| `notifyUpdate()` | void | 向客户端发送资源更新通知 |

## run(func, timeout)

获取锁，执行函数后释放锁。
如果获取锁失败，则返回 `false`。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

let result = resource.run(function() {
    // 锁定期间执行的处理
    let db = new TenantDatabase();
    db.update('orders', { status: 'confirmed' }, 'order_id = ?', [DbParameter.string('ORD-001')]);
}, 10);

if (!result) {
    // 获取锁失败
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `func` | Function | 锁定期间执行的函数 |
| `timeout` | Number | 超时秒数（0 表示等待直到锁释放） |

## runAndNotify(func, timeout)

与 `run` 相同，执行获取锁、处理执行、释放锁，并额外向客户端发送通知。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

resource.runAndNotify(function() {
    // 锁定期间执行的处理
}, 10);
```

## tryLock(timeout) / tryLockAndNotify(timeout)

尝试获取锁。成功时返回 `true`，失败时返回 `false`。
`tryLockAndNotify` 在锁获取成功时还会向客户端发送通知。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

if (resource.tryLock(10)) {
    try {
        // 锁定期间的处理
    } finally {
        resource.unlock();
    }
}
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `timeout` | Number | 超时秒数（0 表示等待直到锁释放） |

## unlock() / unlockAndNotify()

释放锁。`unlockAndNotify` 在释放锁时还会向客户端发送通知。

**注意：** 释放同一资源的所有锁。

## notifyUpdate()

向引用该资源的客户端发送更新通知。

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });
resource.notifyUpdate();
```
