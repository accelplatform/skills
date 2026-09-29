---
paths:
  - "src/main/jssp/**/*.js"
---

# NewLock API 参考手册

## 概述

NewLock 是应用程序锁管理对象。
提供使用相同分类关键字的排他控制。
仅由静态方法构成，可以不实例化直接使用。

## 方法列表

| 方法 | 返回值 | 说明 |
|---------|--------|------|
| lock(name) | Boolean | 开始锁定（等待直到获取；推荐使用 `tryLock`） |
| lockRequestScope(name) | Boolean | 开始在请求结束时自动释放的锁定（推荐使用 `tryLockRequestScope`） |
| tryLock(name, timeout) | Boolean | 尝试带超时的锁定 |
| tryLockRequestScope(name, timeout) | Boolean | 尝试带超时且请求结束时自动释放的锁定 |
| run(name, function, timeout) | Boolean | 在锁定下执行函数，执行后自动释放 |
| unlock(name) | Boolean | 释放锁定 |

返回值均为 `true`：成功 / `false`：失败。

## 方法详情

### tryLock(name, timeout)

尝试带超时的锁定。由于 `lock()` 是阻塞操作，推荐使用本方法。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| name | String | 锁定分类关键字 |
| timeout | Number | 等待时间（秒）。`0` 表示无限等待 |

### tryLockRequestScope(name, timeout)

与 `tryLock()` 相同，但锁定在请求结束时自动释放。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| name | String | 锁定分类关键字 |
| timeout | Number | 等待时间（秒）。`0` 表示无限等待 |

### run(name, function, timeout)

获取锁定并执行函数，执行后自动释放锁定。发生异常时也返回 `false`。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| name | String | 锁定分类关键字 |
| function | Function | 要执行的处理函数 |
| timeout | Number | 等待时间（秒） |

### unlock(name)

释放锁定。无论是否处于锁定状态均执行释放处理。

| 参数 | 类型 | 说明 |
|-----------|------|------|
| name | String | 锁定分类关键字 |

## 使用示例

### 使用run进行排他控制（推荐）

```javascript
let result = NewLock.run('order_regist', function() {
  // 在锁定下执行的处理
  let db = new TenantDatabase();
  db.execute('INSERT INTO orders (id, item) VALUES (?, ?)', [orderId, item]);
}, 10);

if (!result) {
  // 锁定获取失败或发生异常
}
```

### 使用tryLockRequestScope进行排他控制

```javascript
let locked = NewLock.tryLockRequestScope('stock_update', 10);

if (locked) {
  // 请求结束时自动释放，无需调用unlock
  let db = new TenantDatabase();
  db.execute('UPDATE stock SET quantity = quantity - ? WHERE item_id = ?', [qty, itemId]);
} else {
  // 锁定获取失败（超时）
}
```

### 使用tryLock / unlock进行排他控制

```javascript
let locked = NewLock.tryLock('data_export', 30);

if (locked) {
  try {
    // 排他处理
    exportData();
  } finally {
    NewLock.unlock('data_export');
  }
} else {
  // 锁定获取失败（超时）
}
```
