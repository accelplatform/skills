# Lock API 参考（Java 版）

基于 intra-mart Accel Platform 核心源代码（`im_core_base` / `im_servlets` 模块）中的实际类定义。不要凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.service.client.information
├── NewLock                     … 公开 API。实现 java.util.concurrent.locks.Lock
├── LockControlException        … 受检异常（LockController 内部使用）
└── LockControlRuntimeException … 非受检异常（NewLock 的公开方法实际抛出的异常）

jp.co.intra_mart.system.service.client.information
├── LockController               … 锁控制的 SPI 接口
└── LocalLockController          … LockController 的默认实现（当 ServiceLoader 找不到其他实现时使用）

jp.co.intra_mart.system.servlet.filter
└── RequestScopeLockReleaseFilter … 负责自动释放请求作用域锁的平台标准过滤器（im_servlets 模块）
```

该版本的语料库中不存在旧的 `Lock` 类（不带 "New" 前缀）。`NewLock` 是当前唯一的实现。

## `NewLock` 类

```java
package jp.co.intra_mart.foundation.service.client.information;

public class NewLock implements Lock, Serializable {

    /**
     * 创建用于加锁的实例。
     * @param id 锁ID
     * @exception NullPointerException 参数为 null 时
     */
    public NewLock(final CharSequence id);

    /** 返回该实例所表示的锁ID。 */
    public String getName();

    /** 设置锁标志。在获取到锁之前会无限等待。 */
    @Override
    public void lock();

    /** 内部实现仅调用 lock()，并未实现真正的中断处理。 */
    @Override
    public void lockInterruptibly() throws InterruptedException;

    /** 立即判断成功与否（不等待）。 */
    @Override
    public boolean tryLock();

    /**
     * 带超时地获取锁。timeout 指定为 0 时等同于 lock()。
     * @param timeout 锁请求的等待时间
     * @param unit 等待时间的单位
     * @return 成功设置锁时返回 true
     */
    @Override
    public boolean tryLock(final long timeout, final TimeUnit unit);

    /** 释放锁。 */
    @Override
    public void unlock();

    /** 不支持。调用时会抛出 UnsupportedOperationException。 */
    @Override
    public Condition newCondition();

    /**
     * 获取锁并执行处理（将 lock() → runnable.run() → finally unlock() 整合为一次方法调用的工具方法）。
     * @param runnable 持有锁期间要执行的处理
     */
    public void run(final Runnable runnable);

    /**
     * 带超时地获取锁并执行处理。
     * @return 执行了处理时返回 true；因超时等原因未执行时返回 false
     */
    public boolean run(final Runnable runnable, final long timeout, final TimeUnit unit);

    /**
     * 相当于 lock()，但在当前请求结束时（即返回响应时）会自动释放锁。
     * 自动释放由 RequestScopeLockReleaseFilter 完成。
     * @since 7.0.3
     */
    public void lockRequestScope();

    /** 相当于请求作用域版的 tryLock()。 @since 7.0.3 */
    public boolean tryLockRequestScope();

    /** 相当于请求作用域版的 tryLock(timeout, unit)。 @since 7.0.3 */
    public boolean tryLockRequestScope(final long timeout, final TimeUnit unit);

    /**
     * 释放当前线程关联的所有锁。
     * @return 若当前线程未关联任何锁则返回 null；否则返回释放失败的锁ID列表（全部释放成功时返回空列表）
     */
    public static synchronized List<String> releaseCurrentThread();

    /**
     * 释放当前请求关联的所有锁。
     * @deprecated 专供 RequestScopeLockReleaseFilter 使用，不得从应用代码中直接调用。
     */
    @Deprecated
    public static synchronized List<String> releaseRequestScope();
}
```

- 实现了 `Lock` 接口和 `Serializable`
- 构造函数在 `id` 为 `null` 时抛出 `NullPointerException`
- **公开方法实际抛出的异常均为非受检异常（`LockControlRuntimeException`）。** 无需声明 `throws`
- 内部实现为两阶段结构：先通过按线程排队的等待队列（`CopyOnWriteArrayList<Thread>`）进行顺序控制，再通过 `LockController` 获取基于数据库的锁监视器（应用开发者无需关心这一细节）
- 默认重试间隔为 5ms（`RETRY_INTERVAL`）。存在通过系统属性 `NewLock.calculateQueueTime=true` 动态调整等待时间的机制，但通常无需关心

## `LockController` 接口（SPI）

```java
package jp.co.intra_mart.system.service.client.information;

public interface LockController extends Serializable {

    void lock(String id) throws LockControlException;

    boolean tryLock(String id, long timeout) throws LockControlException;

    boolean unlock(String id) throws LockControlException;

    boolean isLocked(String id) throws LockControlException;

    Collection<LockCondition> getCondition() throws LockControlException;
}
```

- 该实现由 `NewLock` 的 static 初始化块通过 `ServiceLoaderUtil.loadFirst(LockController.class)` 检测。若找不到，则使用默认实现 `LocalLockController`
- 应用开发者通常不会直接实现或使用该接口

## `LockControlException` / `LockControlRuntimeException`

```java
package jp.co.intra_mart.foundation.service.client.information;

public class LockControlException extends Exception { /* LockController 内部使用的受检异常 */ }

public class LockControlRuntimeException extends RuntimeException {
    /* 当 NewLock 的公开方法（lock/tryLock/unlock 等）捕获 LockControlException 并重新包装时
       使用的非受检异常。这是应用代码实际应当 catch 的对象。 */
}
```

## `RequestScopeLockReleaseFilter`（平台标准过滤器）

```java
package jp.co.intra_mart.system.servlet.filter;

public class RequestScopeLockReleaseFilter extends AbstractFilter {

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws ServletException, IOException {
        // 若本请求尚未执行过...
        try {
            chain.doFilter(request, response);
        } finally {
            // 释放通过 NewLock#lockRequestScope() / tryLockRequestScope() 开始的所有锁
            final List<String> errorLockIdList = NewLock.releaseRequestScope();
            // 若存在释放失败的锁ID，则输出调试日志
        }
    }
}
```

- 由 `im_servlets` 模块提供的平台标准过滤器，会在响应返回时批量释放通过 `lockRequestScope()` / `tryLockRequestScope()` 获取的锁
- **应用侧无需新注册该过滤器。** 可以在该过滤器已内置于平台标准过滤器链中的前提下，直接使用 `lockRequestScope()` 系列方法
- `NewLock.releaseRequestScope()`（`@Deprecated`）专供该过滤器的内部实现使用，不得从应用代码中调用

## 实际平台代码中的使用示例（供参考）

`jp.co.intra_mart.system.workflow.plugin.numbering.SimpleNumberCounterEvent#getNumber()`（`im_workflow_core` 模块，工作流的编号插件。对 `PublicStorage` 上的计数器文件进行互斥控制并递增）:

```java
final String countfilePath = directoryPath + SEPARATOR + COUNT_FILE_NAME;
final PublicStorage counterFile = new PublicStorage(countfilePath);

// 应用锁处理
NewLock lock = new NewLock(loginGroupId + ":" + countfilePath);
if (!lock.tryLockRequestScope(timeoutLimit, TimeUnit.SECONDS)) {
    // 若在超时时间内获取锁失败，返回异常
    throw new WorkflowPluginException("IMW.PLG.ERR.9051");
}

try {
    // 读取 counterFile，递增后写回
    ...
} finally {
    if (lock != null) {
        // 释放锁（即使是请求作用域锁，若想提前释放，也可以显式调用 unlock()）
        lock.unlock();
    }
}
```

如该示例所示，即使使用请求作用域锁，也可以（且推荐）在 `finally` 中显式调用 `unlock()`（自动释放只是针对"忘记释放・异常路径上释放遗漏"的一种保障，并不妨碍提前释放）。锁ID 采用 `loginGroupId + ":" + 目标文件路径` 这样的形式，构造出能唯一表示互斥控制对象的字符串。
