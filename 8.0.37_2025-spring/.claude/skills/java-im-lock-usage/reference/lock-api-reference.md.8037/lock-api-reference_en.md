# Lock API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_core_base` / `im_servlets` modules). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.service.client.information
├── NewLock                     … Public API. Implements java.util.concurrent.locks.Lock
├── LockControlException        … A checked exception (used internally by LockController)
└── LockControlRuntimeException … An unchecked exception (what NewLock's public methods actually throw)

jp.co.intra_mart.system.service.client.information
├── LockController               … The lock control SPI interface
└── LocalLockController          … The default implementation of LockController (used when ServiceLoader finds no other implementation)

jp.co.intra_mart.system.servlet.filter
└── RequestScopeLockReleaseFilter … The platform-standard filter that automatically releases request-scope locks (im_servlets module)
```

This version's corpus contains no old `Lock` class (without the "New" prefix). `NewLock` is the current, sole implementation.

## The `NewLock` Class

```java
package jp.co.intra_mart.foundation.service.client.information;

public class NewLock implements Lock, Serializable {

    /**
     * Creates an instance for locking.
     * @param id the lock ID
     * @exception NullPointerException if the argument is null
     */
    public NewLock(final CharSequence id);

    /** Returns the lock ID represented by this instance. */
    public String getName();

    /** Sets the lock flag. Waits indefinitely until it can be acquired. */
    @Override
    public void lock();

    /** Internally just calls lock(); no real interrupt handling is implemented. */
    @Override
    public void lockInterruptibly() throws InterruptedException;

    /** Determines success/failure immediately (no waiting). */
    @Override
    public boolean tryLock();

    /**
     * Acquires the lock with a timeout. A timeout of 0 is equivalent to lock().
     * @param timeout how long to wait for the lock request
     * @param unit the unit of the wait time
     * @return true if the lock was successfully set
     */
    @Override
    public boolean tryLock(final long timeout, final TimeUnit unit);

    /** Releases the lock. */
    @Override
    public void unlock();

    /** Unsupported. Throws UnsupportedOperationException when called. */
    @Override
    public Condition newCondition();

    /**
     * Acquires the lock and performs the given processing (a utility that combines
     * lock() → runnable.run() → finally unlock() into a single method call).
     * @param runnable the processing to perform while the lock is held
     */
    public void run(final Runnable runnable);

    /**
     * Acquires the lock with a timeout and performs the given processing.
     * @return true if the processing was performed; false if it was not (e.g., due to timeout)
     */
    public boolean run(final Runnable runnable, final long timeout, final TimeUnit unit);

    /**
     * Equivalent to lock(), but the lock is automatically released when the current
     * request ends (i.e., when the response is returned). The automatic release is
     * performed by RequestScopeLockReleaseFilter.
     * @since 7.0.3
     */
    public void lockRequestScope();

    /** The request-scope equivalent of tryLock(). @since 7.0.3 */
    public boolean tryLockRequestScope();

    /** The request-scope equivalent of tryLock(timeout, unit). @since 7.0.3 */
    public boolean tryLockRequestScope(final long timeout, final TimeUnit unit);

    /**
     * Releases all locks associated with the current thread.
     * @return null if no lock is associated with the current thread; otherwise a list of
     *         lock IDs that failed to release (an empty list if all releases succeeded)
     */
    public static synchronized List<String> releaseCurrentThread();

    /**
     * Releases all locks associated with the current request.
     * @deprecated Dedicated to RequestScopeLockReleaseFilter. Do not call directly from application code.
     */
    @Deprecated
    public static synchronized List<String> releaseRequestScope();
}
```

- Implements the `Lock` interface and `Serializable`
- The constructor throws `NullPointerException` if `id` is `null`
- **Every exception actually thrown by the public methods is unchecked (`LockControlRuntimeException`).** No `throws` declaration is needed
- Internally, it uses a two-stage implementation: it orders callers with a per-thread wait queue (`CopyOnWriteArrayList<Thread>`), then acquires a DB-backed lock monitor via `LockController` (application developers do not need to be aware of this)
- The default retry interval is 5ms (`RETRY_INTERVAL`). There is a mechanism to dynamically adjust the wait time via the system property `NewLock.calculateQueueTime=true`, but this is normally not something you need to be aware of

## The `LockController` Interface (SPI)

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

- The implementation is detected by `NewLock`'s static initializer via `ServiceLoaderUtil.loadFirst(LockController.class)`. If none is found, the default implementation `LocalLockController` is used
- Application developers normally never implement or use this interface directly

## `LockControlException` / `LockControlRuntimeException`

```java
package jp.co.intra_mart.foundation.service.client.information;

public class LockControlException extends Exception { /* A checked exception used internally by LockController */ }

public class LockControlRuntimeException extends RuntimeException {
    /* An unchecked exception used when NewLock's public methods (lock/tryLock/unlock, etc.)
       catch a LockControlException and re-wrap it. This is what application code should
       actually catch. */
}
```

## `RequestScopeLockReleaseFilter` (Platform-Standard Filter)

```java
package jp.co.intra_mart.system.servlet.filter;

public class RequestScopeLockReleaseFilter extends AbstractFilter {

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response, final FilterChain chain)
            throws ServletException, IOException {
        // If not already executed for this request...
        try {
            chain.doFilter(request, response);
        } finally {
            // Releases all locks started with NewLock#lockRequestScope() / tryLockRequestScope()
            final List<String> errorLockIdList = NewLock.releaseRequestScope();
            // Debug-logs any lock IDs that failed to release
        }
    }
}
```

- A platform-standard filter provided by the `im_servlets` module that batch-releases the locks acquired via `lockRequestScope()` / `tryLockRequestScope()` when the response is returned
- **The application side does not need to newly register this filter.** It is safe to use the `lockRequestScope()` family of methods on the assumption that this filter is already part of the platform's standard filter chain
- `NewLock.releaseRequestScope()` (`@Deprecated`) is dedicated to this filter's internal implementation. It must not be called from application code

## Usage Example from Actual Platform Code (For Reference)

`jp.co.intra_mart.system.workflow.plugin.numbering.SimpleNumberCounterEvent#getNumber()` (`im_workflow_core` module, the workflow numbering plugin; guards a counter file on `PublicStorage` while incrementing it):

```java
final String countfilePath = directoryPath + SEPARATOR + COUNT_FILE_NAME;
final PublicStorage counterFile = new PublicStorage(countfilePath);

// Application lock processing
NewLock lock = new NewLock(loginGroupId + ":" + countfilePath);
if (!lock.tryLockRequestScope(timeoutLimit, TimeUnit.SECONDS)) {
    // If lock acquisition fails within the timeout, return an exception
    throw new WorkflowPluginException("IMW.PLG.ERR.9051");
}

try {
    // Read the counterFile, increment it, and write it back
    ...
} finally {
    if (lock != null) {
        // Release the lock (it is fine — and recommended — to explicitly call unlock() even
        // with a request-scope lock, if early release is desired)
        lock.unlock();
    }
}
```

As this example shows, it is possible — and recommended — to explicitly call `unlock()` in a `finally` block even when using a request-scope lock (the automatic release is a safety net against "forgetting to release / a release omitted on an exception path," not something that prevents early release). The lock ID is built as a string that uniquely represents the target being guarded, e.g., `loginGroupId + ":" + <target file path>`.
