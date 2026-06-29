---
paths:
  - "src/main/jssp/**/*.js"
---

# SharedResource API Reference

## Overview

SharedResource is a class that uniquely represents a business resource and locks it.
It internally uses the NewLock API to manage locks on a per-tenant basis.

- Works with the custom tag `<imart type="sharedResource" />` to share resource reference users and lock status on the screen
- Sends client notifications via WebSocket or Comet (no delivery guarantee)
- Intended for optimistic resource sharing purposes

## Constructor

```javascript
let resource = new SharedResource(application, businessKeys);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `application` | String | Application identifier (any string) |
| `businessKeys` | Object | Key/value format object for unique resource identification |

```javascript
let resource = new SharedResource('my_app', { appId: '123', appVersion: '3' });
```

## Method List

| Method | Return Value | Description |
|--------|-------------|-------------|
| `getApplication()` | String | Get the application identifier |
| `getBusinessKeys()` | Object | Get the business keys |
| `getKey()` | String | Return the unique key of the SharedResource |
| `run(func, timeout)` | Boolean | Execute processing after acquiring lock, release after completion |
| `runAndNotify(func, timeout)` | Boolean | run + client notification |
| `tryLock(timeout)` | Boolean | Attempt to acquire a lock |
| `tryLockAndNotify(timeout)` | Boolean | Attempt to acquire lock + client notification |
| `unlock()` | void | Release the lock |
| `unlockAndNotify()` | void | Release lock + client notification |
| `notifyUpdate()` | void | Send resource update notification to clients |

## run(func, timeout)

Acquires a lock, executes the function, and then releases the lock.
Returns `false` if lock acquisition fails.

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

let result = resource.run(function() {
  // Processing to execute while locked
  let db = new TenantDatabase();
  db.update('orders', { status: 'confirmed' }, 'order_id = ?', [DbParameter.string('ORD-001')]);
}, 10);

if (!result) {
  // Lock acquisition failed
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `func` | Function | Function to execute while locked |
| `timeout` | Number | Timeout in seconds (0 = wait until lock is released) |

## runAndNotify(func, timeout)

Same as `run` - acquires lock, executes processing, releases lock - and additionally sends notification to clients.

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

resource.runAndNotify(function() {
  // Processing to execute while locked
}, 10);
```

## tryLock(timeout) / tryLockAndNotify(timeout)

Attempts to acquire a lock. Returns `true` on success, `false` on failure.
`tryLockAndNotify` also notifies clients when lock acquisition succeeds.

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });

if (resource.tryLock(10)) {
  try {
    // Processing while locked
  } finally {
    resource.unlock();
  }
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `timeout` | Number | Timeout in seconds (0 = wait until lock is released) |

## unlock() / unlockAndNotify()

Releases the lock. `unlockAndNotify` also notifies clients when the lock is released.

**Note:** Releases all locks on the same resource.

## notifyUpdate()

Sends an update notification to clients referencing the resource.

```javascript
let resource = new SharedResource('order_app', { orderId: 'ORD-001' });
resource.notifyUpdate();
```
