---
name: java-im-lock-usage
description: A skillset for using the intra-mart-specific application lock API (`jp.co.intra_mart.foundation.service.client.information.NewLock`) in Java (JavaEE development model). Provides DB-backed mutual exclusion across a distributed environment, guidance on choosing between an ordinary lock (manual unlock) and a request-scope lock (automatic release), and the constraints that come with being a `java.util.concurrent.locks.Lock` implementation. Use when the user mentions wanting mutual exclusion in Java, wanting to use the NewLock API in Java, wanting to guard numbering processing or counter updates in the JavaEE development model, or wanting to serialize processing for the same key across a distributed environment. When building equivalent processing in JSSP (script development model), use the SSJS version of the NewLock API instead, if one is defined under `d.ts/platform/`.
---

# intra-mart Application Lock API (Java Version) Support Skill

## Purpose

A skillset for implementing mutual exclusion in a distributed environment (serializing processing for the same key) in Java code, using the application lock API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.service.client.information.NewLock`).

## Choosing Between the Two Lock Scopes (Most Important)

`NewLock` provides two families of APIs that differ in who is responsible for releasing the lock. **Decide first which one fits the use case.**

| Family | Main Methods | Release Responsibility | Use Case |
|------|-------------|-----------|------|
| **Ordinary lock** | `lock()` / `tryLock()` / `tryLock(long, TimeUnit)` | **The caller must explicitly call `unlock()`** (`try`/`finally` required) | Mutual exclusion that is self-contained within a method (counter updates, numbering processing, etc.) |
| **Request-scope lock** | `lockRequestScope()` / `tryLockRequestScope()` / `tryLockRequestScope(long, TimeUnit)` | **The platform-standard `RequestScopeLockReleaseFilter` releases it automatically when the response is returned** (no explicit `unlock()` needed) | When you want to hold the lock across multiple points in request processing (spanning multiple methods/classes) |

Decision criteria:
- **The lock can be acquired and released within a single method (or a very tight scope) → use the ordinary lock.** Release it reliably in the form `try { lock.lock(); ... } finally { lock.unlock(); }`
- **The acquisition and release points are far apart, or you need to keep holding the lock across multiple methods → use the request-scope lock.** This just replaces the ordinary lock's risk of "forgetting to release leaves it stuck until the next request" with "held until the response is returned," so be careful the holding time doesn't grow too long
- In actual platform code (`SimpleNumberCounterEvent#getNumber()`, the workflow numbering process), a file-based counter update is guarded with `tryLockRequestScope(timeout, TimeUnit.SECONDS)`, and `unlock()` is called in a `finally` block (it is possible — and fine, if early release is desired — to explicitly call `unlock()` even with a request-scope lock)
- **Unless the user explicitly specifies otherwise, default to the ordinary lock (`lock()`/`tryLock()` + `try`/`finally`).** Only consider a request-scope lock when there is a clear requirement to span scopes

**This skill covers Java source files (`.java`) only.** For implementation in JSSP (`.js`), use the corresponding SSJS version of the API if one is defined under `d.ts/platform/`.

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method JavaDoc |

No dedicated Java convention defining exception-handling policy exists under `.agents/requirements` (as of 2026). All of `NewLock`'s exceptions are unchecked (described below); follow the business-exception-wrapping pattern in `assets/lock-basic-usage.md`.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

The `NewLock` class belongs to the `jp.co.intra_mart.foundation.service.client.information` package and implements `java.util.concurrent.locks.Lock`. Because lock information is managed centrally in the system database, mutual exclusion on the same `id` is possible even across a distributed environment (a multi-application-server configuration). For detailed signatures, internal structure, and related classes, refer to `reference/lock-api-reference.md` (do not write these from memory or guesswork).

## What to Generate and Which Templates to Use

| What to generate | Template | Content |
|---------|------------|------|
| Mutual exclusion self-contained within a method (ordinary lock, reliably released with `try`/`finally`) | `assets/lock-basic-usage.md` | Call examples for `lock()`/`tryLock(long, TimeUnit)`, usage of the `run(Runnable)` utility |
| Mutual exclusion spanning multiple points in a request (request-scope lock) | `assets/lock-basic-usage.md` | Call examples for `lockRequestScope()`/`tryLockRequestScope()` |

### Reference

- `reference/lock-api-reference.md` — All methods and signatures of `NewLock` / `LockController` / the `LockControlException` family, and the mechanism behind automatic release via `RequestScopeLockReleaseFilter` (based on the actual platform API class definitions — do not write from memory)

## When to Use This Skill

Use this skill when the user makes a request such as:
- "Create processing in Java that performs mutual exclusion"
- "I want to use the NewLock API in the JavaEE development model to guard a counter update"
- "I want to prevent processing for the same key from running concurrently in a distributed environment"
- "I want to put a lock on numbering processing"
- "I want to serialize an update process so it doesn't collide even across multiple servers"

If there is no explicit mention of "in Java" / "in the JavaEE development model," confirm with the user which development model the existing project implementation uses. If the mutual exclusion is inside a JSSP (pro-code) screen or function container, use the SSJS version of the API instead, if one exists.

Also, **when the mutual exclusion only needs to cover concurrency within a single JVM (the same application server)**, `NewLock` carries significant overhead from communicating with the system database, so standard `java.util.concurrent` classes (`ReentrantLock`, `synchronized`, etc.) may be more appropriate. Confirm with the user whether uniqueness across a distributed environment is actually required, and if not, present the standard API as an option as well.

## Implementation Steps

1. Gather the user's requirements (how to decide the key being guarded, whether distributed-environment mutual exclusion is needed, whether a lock-acquisition timeout is needed, whether business-level error handling is needed on lock failure)
2. Decide whether to use an ordinary lock or a request-scope lock (see the decision criteria table above. **Prioritize the user's explicit specification if given**; default to the ordinary lock when it is self-contained within a single method)
3. Implement by referring to `assets/lock-basic-usage.md` (always refer to `reference/lock-api-reference.md` for method signatures — do not write from memory or guesswork)
4. Design the lock ID (the `NewLock` constructor argument): use a key that uniquely represents the target being guarded (e.g., `loginGroupId + ":" + <path of the target resource>`). Avoid an overly broad granularity (e.g., a single fixed string), which would serialize unrelated processing together
5. Confirm compliance with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Always release an ordinary lock with `try`/`finally`.** Wrap everything from immediately after `lock()`/`tryLock()` through the `unlock()` call in a `finally` block with `try`. Forgetting to release it will permanently block (or block until timeout) subsequent lock acquisitions for the same ID
- **All of `NewLock`'s methods signal failure via unchecked exceptions (`LockControlRuntimeException`).** This is the opposite design from `Identifier#get()`'s checked `IOException`, so no `throws` declaration is needed, but if you do `catch` it, target `LockControlRuntimeException`
- **`newCondition()` throws `UnsupportedOperationException`.** This is a standard `Lock` interface feature, but `NewLock` does not support it. You cannot implement wait/notify using a `Condition`
- **`lockInterruptibly()` does not behave as its name suggests.** Its internal implementation simply calls `lock()`, with no real interrupt handling. If interruptible lock acquisition is genuinely needed, consider a different implementation
- **Automatic release of a request-scope lock is handled by the platform-standard `RequestScopeLockReleaseFilter`.** The application does not need to register this filter explicitly. However, `NewLock.releaseRequestScope()` (a static method) is `@Deprecated` and is an internal API dedicated to that filter — do not call it directly from application code
- **`NewLock` can be overkill for concurrency that is entirely self-contained within a single JVM.** Since it involves communication with the system database, `java.util.concurrent` (`ReentrantLock`, etc.) is often lighter-weight and more appropriate when uniqueness across a distributed environment is not actually required
- Pay attention to the granularity of the lock ID. Too coarse a granularity (e.g., a single fixed ID for the entire application) serializes unrelated processing together, becoming a source of performance degradation and deadlocks. Too fine a granularity (e.g., a different random ID on every request) fails to provide any actual mutual exclusion

## Post-Generation Checks

A dedicated verification script equivalent to the JSSP version (`validate-jssp-code.js`) is not yet in place. Confirm the following manually.

1. Wherever an ordinary lock is used, whether everything from `lock()`/`tryLock()` through `unlock()` is reliably wrapped in `try`/`finally`
2. Whether the choice between an ordinary lock and a request-scope lock matches the lock's intended holding scope (self-contained within a single method, or spanning multiple points)
3. Whether `NewLock.releaseRequestScope()` (`@Deprecated`) is being called directly from application code
4. Whether the lock ID's granularity is appropriate for the target being guarded (neither too coarse nor too fine)
5. Whether the code complies with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| Mutual exclusion in SSJS (JSSP) | Use the corresponding SSJS version of the API if one is defined (out of scope for this skill) |
| **Mutual exclusion in Java (JavaEE development model)** | **This skill** |
| File operations in Java (`PublicStorage`, etc.) | `java-im-storage-usage` |
| Unique ID generation in Java (`Identifier`) | `java-im-identifier-usage` |
| Workflow integration processing in Java | `java-im-workflow-usage` |
| Concurrency control confined to a single JVM | Out of scope for this skill (implement individually with standard `java.util.concurrent` classes) |
