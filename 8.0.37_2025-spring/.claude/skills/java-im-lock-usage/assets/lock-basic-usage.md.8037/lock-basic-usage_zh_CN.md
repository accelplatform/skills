# Lock API 基本使用模式（Java 版）

`NewLock` 的签名・内部行为请参考 `reference/lock-api-reference.md`。本文档展示典型的调用模式。

## 模式1: 普通锁（`lock()`，在方法内闭环完成的互斥控制）

在方法内确保锁的获取与释放闭环完成的基本形式。通过 `try`/`finally` 防止忘记释放。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

/**
 * 提供计数器的更新处理。
 */
public class CounterService {

    /**
     * 将计数器加1。<br>
     * 保证即使在分布式环境（多应用服务器构成）下，对同一计数器ID的更新也会被串行化。
     *
     * @param counterId 计数器ID
     */
    public void increment(final String counterId) {
        final NewLock lock = new NewLock("counter:" + counterId);
        lock.lock();
        try {
            // 读取・递增・写回计数器值等需要互斥控制的处理
        } finally {
            lock.unlock();
        }
    }
}
```

- `lock()` 会无限等待直到获取到锁为止。若需要超时，请使用模式2的 `tryLock(long, TimeUnit)`
- 应在调用 `lock()` 之后**立即**开始 `try`，并在 `finally` 中务必调用 `unlock()`。虽然 `lock()` 本身不会抛出异常，因此技术上可以在 `try` 之外调用，但为了确保在 `lock()` 之后的处理发生异常时仍能释放锁，`finally` 是必需的

## 模式2: 带超时的普通锁（`tryLock(long, TimeUnit)`）

用于需要为锁获取的等待时间设置上限的场景。获取失败时，可将其包装为业务异常，或将失败结果传达给调用方。

```java
package jp.co.example.foo.service;

import java.util.concurrent.TimeUnit;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

import jp.co.example.foo.exception.CounterLockTimeoutException;

/**
 * 提供计数器的更新处理。
 */
public class CounterService {

    private static final long LOCK_TIMEOUT_SECONDS = 10L;

    /**
     * 将计数器加1。<br>
     * 若锁获取失败（即在 {@value #LOCK_TIMEOUT_SECONDS} 秒内未能获取到锁），则抛出异常。
     *
     * @param counterId 计数器ID
     * @throws CounterLockTimeoutException 锁获取超时时
     */
    public void increment(final String counterId) throws CounterLockTimeoutException {
        final NewLock lock = new NewLock("counter:" + counterId);
        if (!lock.tryLock(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            throw new CounterLockTimeoutException("カウンタの更新がロック取得タイムアウトにより失敗しました: counterId=" + counterId);
        }
        try {
            // 读取・递增・写回计数器值等需要互斥控制的处理
        } finally {
            lock.unlock();
        }
    }
}
```

- 若 `tryLock(timeout, unit)` 返回 `false`，说明**未能获取到锁**，因此不得调用 `unlock()`（应在对应的 `try`/`finally` 之外处理失败情形）
- 也可能抛出 `LockControlRuntimeException`（非受检异常），必要时应 `catch` 该异常

## 模式3: `run(Runnable)` 工具方法（将获取到释放整合为一次调用）

当锁内执行的处理较为简单时，可以不必显式编写 `lock()`/`unlock()`。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

public class CounterService {

    public void increment(final String counterId) {
        final NewLock lock = new NewLock("counter:" + counterId);
        lock.run(() -> {
            // 读取・递增・写回计数器值等需要互斥控制的处理
        });
    }
}
```

- `run(Runnable)` 内部会执行 `lock()` → `runnable.run()` → `finally unlock()`，因此不存在忘记释放的风险
- 由于 `Runnable#run()` 无法声明受检异常，若 Lambda 内需要调用声明了 `throws` 的处理，必须通过 `try-catch` 将其包装为非受检异常。处理较为复杂时，模式1・2 中显式的 `try`/`finally` 往往更易读

## 模式4: 请求作用域锁（`lockRequestScope()` / `tryLockRequestScope()`）

用于锁的获取位置与释放位置相距较远，或需要跨多个方法持续持有锁的场景。由于平台标准的 `RequestScopeLockReleaseFilter` 会在响应返回时自动释放，因此并非必须显式调用 `unlock()`，但若想提前释放，也可以调用。

```java
package jp.co.example.foo.service;

import java.util.concurrent.TimeUnit;

import jp.co.intra_mart.foundation.service.client.information.NewLock;

import jp.co.example.foo.exception.OrderProcessingLockTimeoutException;

/**
 * 以请求为单位对受注处理进行互斥控制。
 */
public class OrderProcessingLockService {

    private static final long LOCK_TIMEOUT_SECONDS = 10L;

    /**
     * 获取受注处理的锁。<br>
     * 获取到的锁会在响应返回时由平台标准的 RequestScopeLockReleaseFilter 自动释放。
     * 用于需要跨后续多个方法调用持续持有锁的场景。
     *
     * @param orderId 受注ID
     * @throws OrderProcessingLockTimeoutException 锁获取超时时
     */
    public void acquireLock(final String orderId) throws OrderProcessingLockTimeoutException {
        final NewLock lock = new NewLock("order-processing:" + orderId);
        if (!lock.tryLockRequestScope(LOCK_TIMEOUT_SECONDS, TimeUnit.SECONDS)) {
            throw new OrderProcessingLockTimeoutException("受注処理のロック取得がタイムアウトしました: orderId=" + orderId);
        }
        // 此处不调用 unlock()（依赖自动释放）
        // 仅在确实需要提前释放时，才在相应位置调用 lock.unlock()
    }
}
```

- `NewLock.releaseRequestScope()`（静态方法）是专供 `RequestScopeLockReleaseFilter` 使用的内部 API（`@Deprecated`），**不得从应用代码中直接调用**
- 请求作用域锁的持有时间仅限于响应返回之前，应确认确实存在跨多个位置的需求后再使用，以避免无意间长时间持有锁

## 反模式（应避免）

```java
// NG: unlock() 未被 try/finally 包裹（处理过程中发生异常时无法释放）
final NewLock lock = new NewLock("counter:" + counterId);
lock.lock();
doSomething(); // 若此处发生异常，unlock() 将不会被调用，锁会一直残留
lock.unlock();

// NG: 未确认 tryLock() 的返回值就继续处理
final NewLock lock = new NewLock("counter:" + counterId);
lock.tryLock(); // 忽略了返回值（成功与否）
doSomething();  // 明明未获取到锁，却当作已被互斥控制来处理

// NG: 从应用代码中直接调用 NewLock.releaseRequestScope()
NewLock.releaseRequestScope(); // @Deprecated 且专供 RequestScopeLockReleaseFilter 使用

// NG: 锁ID的粒度过粗（导致无关处理也被串行化）
final NewLock lock = new NewLock("application-lock"); // 整个应用只使用一个固定ID

// NG: 对完全限于单个 JVM 内的处理使用 NewLock（不需要与数据库通信的开销）
// 若不需要分布式环境下的唯一性，使用 java.util.concurrent.locks.ReentrantLock 等即可
```
