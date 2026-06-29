# NewLock API Reference

## Overview

NewLock is an application lock management object.
It provides exclusive control using the same category keyword.
It consists only of static methods and can be used directly without instantiation.

## Method List

| Method | Return Value | Description |
|---------|--------|------|
| lock(name) | Boolean | Start a lock (waits until acquired; `tryLock` is recommended) |
| lockRequestScope(name) | Boolean | Start a lock that is automatically released when the request ends (`tryLockRequestScope` is recommended) |
| tryLock(name, timeout) | Boolean | Attempt to start a lock with a timeout |
| tryLockRequestScope(name, timeout) | Boolean | Attempt to start a lock with timeout that is automatically released when the request ends |
| run(name, function, timeout) | Boolean | Execute a function under a lock and automatically release after execution |
| unlock(name) | Boolean | Release a lock |

All return values are `true`: success / `false`: failure.

## Method Details

### tryLock(name, timeout)

Attempts to start a lock with a timeout. Since `lock()` is blocking, this method is recommended.

| Parameter | Type | Description |
|-----------|------|------|
| name | String | Lock category keyword |
| timeout | Number | Wait time (seconds). `0` for unlimited wait |

### tryLockRequestScope(name, timeout)

Same as `tryLock()`, but the lock is automatically released when the request ends.

| Parameter | Type | Description |
|-----------|------|------|
| name | String | Lock category keyword |
| timeout | Number | Wait time (seconds). `0` for unlimited wait |

### run(name, function, timeout)

Acquires a lock, executes a function, and automatically releases the lock after execution. Returns `false` even on exception.

| Parameter | Type | Description |
|-----------|------|------|
| name | String | Lock category keyword |
| function | Function | Processing function to execute |
| timeout | Number | Wait time (seconds) |

### unlock(name)

Releases a lock. Executes the release process regardless of whether the lock is currently held.

| Parameter | Type | Description |
|-----------|------|------|
| name | String | Lock category keyword |

## Usage Examples

### Exclusive Control with run (Recommended)

```javascript
let result = NewLock.run('order_regist', function() {
  // Processing executed under the lock
  let db = new TenantDatabase();
  db.execute('INSERT INTO orders (id, item) VALUES (?, ?)', [orderId, item]);
}, 10);

if (!result) {
  // Failed to acquire lock or exception occurred
}
```

### Exclusive Control with tryLockRequestScope

```javascript
let locked = NewLock.tryLockRequestScope('stock_update', 10);

if (locked) {
  // No need to call unlock as it is automatically released when the request ends
  let db = new TenantDatabase();
  db.execute('UPDATE stock SET quantity = quantity - ? WHERE item_id = ?', [qty, itemId]);
} else {
  // Failed to acquire lock (timeout)
}
```

### Exclusive Control with tryLock / unlock

```javascript
let locked = NewLock.tryLock('data_export', 30);

if (locked) {
  try {
    // Exclusive processing
    exportData();
  } finally {
    NewLock.unlock('data_export');
  }
} else {
  // Failed to acquire lock (timeout)
}
```
