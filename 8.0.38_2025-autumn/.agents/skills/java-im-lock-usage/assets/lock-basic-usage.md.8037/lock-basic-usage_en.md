# Lock API Basic Usage Patterns (Java Version)

For the signature and internal behavior of `NewLock`, see `reference/lock-api-reference.md`. This document shows the typical call patterns.

## Pattern 1: Ordinary Lock (`lock()`, Mutual Exclusion Self-Contained Within a Method)

The basic form: reliably acquire and release the lock within a method. Use `try`/`finally` to prevent a missed release.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

/**
 * Provides counter update processing.
 */
public class CounterService {

    /**
     * Increments the counter by 1.<br>
     * Guarantees that updates to the same counter ID are serialized even in a distributed environment
     * (multiple application servers).
     *
     * @param counterId the counter ID
     */
    public void increment(final String counterId) {
        final NewLock lock = new NewLock("counter:" + counterId);
        lock.lock();
        try {
            // Processing requiring mutual exclusion, such as reading, incrementing, and writing back the counter value
        } finally {
            lock.unlock();
        }
    }
}
```

- `lock()` waits indefinitely until the lock can be acquired. If a timeout is needed, use `tryLock(long, TimeUnit)` from Pattern 2
- Start the `try` **immediately** after calling `lock()`, and always `unlock()` in `finally`. `lock()` itself never throws, so it may technically be called outside the `try`, but `finally` is required so the lock is still released if the subsequent processing throws

## Pattern 2: Ordinary Lock with a Timeout (`tryLock(long, TimeUnit)`)

Use this when you want to cap how long to wait for lock acquisition. On acquisition failure, either wrap it into a business exception or communicate the failure to the caller.

```java
package jp.co.example.foo.service;

import java.util.concurrent.TimeUnit;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

import jp.co.example.foo.exception.CounterLockTimeoutException;

/**
 * Provides counter update processing.
 */
public class CounterService {

    private static final long LOCK_TIMEOUT_SECONDS = 10L;

    /**
     * Increments the counter by 1.<br>
     * Throws an exception if lock acquisition fails (i.e., could not be acquired within {@value #LOCK_TIMEOUT_SECONDS} seconds).
     *
     * @param counterId the counter ID
     * @throws CounterLockTimeoutException if lock acquisition times out
     */
    public void increment(final String counterId) throws CounterLockTimeoutException {
        final NewLock lock = new NewLock("counter:" + counterId);
        if (!lock.tryLock(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            throw new CounterLockTimeoutException("カウンタの更新がロック取得タイムアウトにより失敗しました: counterId=" + counterId);
        }
        try {
            // Processing requiring mutual exclusion, such as reading, incrementing, and writing back the counter value
        } finally {
            lock.unlock();
        }
    }
}
```

- If `tryLock(timeout, unit)` returns `false`, **the lock was not acquired**, so `unlock()` must not be called (handle the failure outside the corresponding `try`/`finally`)
- `LockControlRuntimeException` (unchecked) can also be thrown, so `catch` it if needed

## Pattern 3: The `run(Runnable)` Utility (Consolidating Acquire-Through-Release into One Call)

When the processing performed while holding the lock is simple, this avoids writing `lock()`/`unlock()` explicitly.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

public class CounterService {

    public void increment(final String counterId) {
        final NewLock lock = new NewLock("counter:" + counterId);
        lock.run(() -> {
            // Processing requiring mutual exclusion, such as reading, incrementing, and writing back the counter value
        });
    }
}
```

- `run(Runnable)` internally performs `lock()` → `runnable.run()` → `finally unlock()`, so there is no risk of a missed release
- Because `Runnable#run()` cannot declare checked exceptions, if the lambda needs to call processing that declares `throws`, you must `try-catch` it and wrap it into an unchecked exception. For more complex processing, the explicit `try`/`finally` in Patterns 1/2 is often more readable

## Pattern 4: Request-Scope Lock (`lockRequestScope()` / `tryLockRequestScope()`)

Use this when the acquisition and release points are far apart, or when you need to keep holding the lock across multiple methods. The platform-standard `RequestScopeLockReleaseFilter` releases it automatically when the response is returned, so an explicit `unlock()` is not strictly required — but it is fine to call one if early release is desired.

```java
package jp.co.example.foo.service;

import java.util.concurrent.TimeUnit;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

import jp.co.example.foo.exception.OrderProcessingLockTimeoutException;

/**
 * Guards order processing with mutual exclusion at the request level.
 */
public class OrderProcessingLockService {

    private static final long LOCK_TIMEOUT_SECONDS = 10L;

    /**
     * Acquires the lock for order processing.<br>
     * The acquired lock is automatically released by the platform-standard RequestScopeLockReleaseFilter
     * when the response is returned. Use this when you want to hold the lock across multiple subsequent
     * method calls.
     *
     * @param orderId the order ID
     * @throws OrderProcessingLockTimeoutException if lock acquisition times out
     */
    public void acquireLock(final String orderId) throws OrderProcessingLockTimeoutException {
        final NewLock lock = new NewLock("order-processing:" + orderId);
        if (!lock.tryLockRequestScope(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            throw new OrderProcessingLockTimeoutException("受注処理のロック取得がタイムアウトしました: orderId=" + orderId);
        }
        // unlock() is not called here (relying on automatic release)
        // Only call lock.unlock() at the corresponding point if early release is genuinely needed
    }
}
```

- `NewLock.releaseRequestScope()` (a static method) is an internal API dedicated to `RequestScopeLockReleaseFilter` (`@Deprecated`) — **do not call it directly from application code**
- A request-scope lock is held only until the response is returned; make sure there is a genuine requirement to span multiple points before using it, so the lock is not unintentionally held for longer than necessary

## Anti-Patterns (Avoid These)

```java
// NG: unlock() is not wrapped in try/finally (an exception during processing leaves it unreleased)
final NewLock lock = new NewLock("counter:" + counterId);
lock.lock();
doSomething(); // if this throws, unlock() is never called and the lock remains held
lock.unlock();

// NG: proceeding without checking tryLock()'s return value
final NewLock lock = new NewLock("counter:" + counterId);
lock.tryLock(); // the return value (success/failure) is ignored
doSomething();  // proceeds as if mutual exclusion were in effect, even though the lock was never acquired

// NG: calling NewLock.releaseRequestScope() directly from application code
NewLock.releaseRequestScope(); // @Deprecated and dedicated to RequestScopeLockReleaseFilter

// NG: too coarse a lock ID granularity (serializes unrelated processing together)
final NewLock lock = new NewLock("application-lock"); // a single fixed ID for the entire application

// NG: using NewLock for processing confined to a single JVM (the DB communication overhead is unnecessary)
// If uniqueness across a distributed environment is not required, java.util.concurrent.locks.ReentrantLock, etc. suffices
```
