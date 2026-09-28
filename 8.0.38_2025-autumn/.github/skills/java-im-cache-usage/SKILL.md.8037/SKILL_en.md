---
name: java-im-cache-usage
description: A skillset for using the intra-mart-specific cache API (`jp.co.intra_mart.foundation.cache.CacheManager` / `Cache`, `im_cache_base` module) in Java (JavaEE development model). Provides tenant-scoped cache manager acquisition via `CacheManagerFactory.getCacheManager()`, CRUD operations on `Cache<K, V>` (get/put/remove/removeAll, etc.), creation of cache configuration files (`WEB-INF/conf/im-ehcache-config/*.xml`), and the `Serializable` constraint on cache keys and values. Use when the user mentions wanting to use caching in Java, wanting to use `CacheManager`/`Cache` in Java, wanting to cache search results or master data in the JavaEE development model, or wanting to create an `im-ehcache-config` configuration file. When building equivalent processing in JSSP (script development model), use the SSJS version of the `Cache` API instead (`d.ts/platform/cache/im-ssjs-cache.d.ts`).
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Cache API (Java Version) Support Skill

## Purpose

A skillset for implementing tenant-scoped caching (reusable data such as search results or master data) in Java code, using the cache API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.cache.CacheManager` / `Cache`).

## Basic Policy for Using the Cache (Most Important)

- Acquire the cache manager using **only `CacheManagerFactory.getCacheManager()` (the no-argument static method).** The tenant ID is automatically resolved internally from the execution context's `AccountContext`, so application code does not need to be aware of it
- `getCacheManager()` can be called **only in an execution environment where a tenant context exists** (normal request processing, job execution, etc.). Calling it where the tenant ID cannot be resolved from `AccountContext` throws `IllegalStateException`
- The key (K) and value (V) of the `Cache<K, V>` obtained via `CacheManager#getCache(String cacheName)` **must implement `java.io.Serializable`.** Passing a non-serializable type fails during serialization in the cache implementation (Ehcache by default)
- **Always define the cache name in a cache configuration file (`WEB-INF/conf/im-ehcache-config/*.xml`) before using the cache.** Behavior is not guaranteed if the configuration file does not exist, or if no matching `cache name` definition exists
- `Cache#get()` returns `null` on a cache miss (it does not throw). The caller must always check for `null` and implement the reload logic for a cache miss (including re-registering the value in the cache)
- Lifecycle management (e.g., `CacheLifecycle#start()`) is handled automatically inside `CacheManagerFactory`. Application code does not need to be aware of the lifecycle

**This skill covers only Java source files (`.java`) and cache configuration files (`.xml`).** For implementation in JSSP (`.js`), use the corresponding SSJS version of the `Cache` API (`d.ts/platform/cache/im-ssjs-cache.d.ts`) — it is a bridge implementation that internally goes through the same `CacheManagerFactory`/`CacheManager`, and shares the cache configuration files and cache namespace with the Java version.

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method JavaDoc |

No dedicated Java convention defining exception-handling policy exists under `.github/instructions`. Follow the pattern in `assets/cache-basic-usage.md` for handling the `IllegalStateException` thrown by `CacheManagerFactory.getCacheManager()`.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

`CacheManager` belongs to the `jp.co.intra_mart.foundation.cache` package, and a tenant-scoped instance is obtained via `CacheManagerFactory.getCacheManager()`. The `Cache<K, V>` obtained via `CacheManager#getCache(cacheName)` implements `Iterable<Cache.Entry<K, V>>` and provides CRUD methods such as `get`/`put`/`remove`/`removeAll`. The standard implementation (`im_cache_impl` module) uses Ehcache 2.x as its backend. For detailed signatures, internal structure, and the XSD definition of the cache configuration file, refer to `reference/cache-api-reference.md` (do not write these from memory or guesswork).

## What to Generate and Which Templates to Use

| What to generate | Template | Content |
|---------|------------|------|
| Cache acquisition and read/write operations (calling `CacheManagerFactory`/`Cache`) | `assets/cache-basic-usage.md` | Call examples for `getCache()`/`get()`/`put()`/`remove()`/`removeAll()`, and the reload pattern on a cache miss |
| Creating a new cache configuration file | `assets/cache-basic-usage.md` | A sample `WEB-INF/conf/im-ehcache-config/*.xml` and the meaning of its attributes |

### Reference

- `reference/cache-api-reference.md` — All methods and signatures of `CacheManager` / `CacheManagerFactory` / `Cache` / `Cache.Entry`, and the XSD attribute definitions of the cache configuration file (based on the actual platform API class definitions — do not write from memory)

## When to Use This Skill

Use this skill when the user makes a request such as:
- "Create processing in Java that uses caching"
- "I want to use the `CacheManager`/`Cache` API in the JavaEE development model to cache master data"
- "I want to cache search results so they can be reused"
- "I want to create a new `im-ehcache-config` configuration file"
- "I want to reduce the number of DB lookups for frequently accessed data"

If there is no explicit mention of "in Java" / "in the JavaEE development model," confirm with the user which development model the existing project implementation uses. If the caching is inside a JSSP (pro-code) screen or function container, use the SSJS version of the `Cache` API instead (`d.ts/platform/cache/im-ssjs-cache.d.ts`).

Also, **when the data to be cached is short-lived data that is self-contained within a single request or session**, the `Cache` API can be overkill, since it is a persistent caching mechanism shared across the entire tenant. If the use case is only temporary storage within a request scope, tell the user that ordinary variables or session-scope mechanisms may be more appropriate.

## Implementation Steps

1. Gather the user's requirements (the kind of data to cache and how often it changes, the design of the cache key, whether a time-to-live (TTL) is needed, the reload policy on cache expiration)
2. Decide on a cache name and create a new configuration file under `WEB-INF/conf/im-ehcache-config/` (refer to the XSD attribute definitions in `reference/cache-api-reference.md`. Make the `name` attribute match the value passed to `CacheManager#getCache(cacheName)`)
3. Implement by referring to `assets/cache-basic-usage.md` (always refer to `reference/cache-api-reference.md` for method signatures — do not write from memory or guesswork)
4. Confirm that the cache key and value classes implement `java.io.Serializable`
5. Implement the reload logic for when `Cache#get()` returns `null` (fetching from the data source, then registering it in the cache via `put()`)
6. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **`CacheManagerFactory.getCacheManager()` can only be called in an execution environment where a tenant context exists.** Calling it in an execution environment where the tenant ID cannot be resolved from `AccountContext` — such as system processing not tied to any tenant — throws `IllegalStateException`. Confirm the caller's execution context
- **The cache key and value must implement `java.io.Serializable`.** Passing a non-implementing type causes an error during serialization in the standard implementation (Ehcache)
- **Define the cache name in the cache configuration file before calling `getCache()`.** Behavior is not guaranteed if an undefined cache name is specified
- `Cache#get()` returns `null` on a cache miss and does not throw. **The caller must always perform a `null` check**
- **The default value of the `enable` attribute is `false`.** A cache is not enabled unless the configuration file explicitly specifies `enable="true"` ([official reference](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html))
- **Do not use a cache name (`name` attribute) starting with `im_`.** It is reserved by the system
- The cache configuration file's `time-to-idle-seconds` (expiration after idle time) and `time-to-live-seconds` (absolute lifetime) have different meanings. Use `time-to-live-seconds` with a longer value for infrequently updated master data, and `time-to-idle-seconds` for data that should expire based on access frequency, choosing the appropriate one for the requirement. For guidance on choosing concrete seconds and limits, see "How to decide `time-to-idle-seconds`/`time-to-live-seconds`" in `reference/cache-api-reference.md`
- When `max-elements-on-memory` is set, `max-bytes-memory` is ignored (the same relationship applies to `max-elements-on-disk`/`max-bytes-disk`). Specify only one of them
- **`max-bytes-memory`/`max-bytes-disk` involve size-calculation processing for objects, so caching large objects with many references can become a performance bottleneck.** In that case, use `max-elements-on-memory`/`max-elements-on-disk` (an element-count limit) instead
- **Under multi-tenant deployment, cache capacity is allocated separately for each tenant.** Design upper limits such as `max-bytes-memory` by estimating the total consumption multiplied by the number of tenants
- The cache is shared across multiple requests and multiple users. **If user-specific sensitive information (personal data, credentials, etc.) is stored in the cache, confirm at the design stage that it cannot be unintentionally accessed across tenants or users**
- `Cache` is a tenant-scoped caching mechanism, and `removeAll()` deletes all entries belonging to that cache name (it does not affect other cache names)
- **This skill's `Cache` shares its configuration file and cache namespace with the JSSP-side SSJS `Cache`, but cross-side value sharing is only practical in the Java → JSSP direction.** A value that JSSP `put()` stored is wrapped in Rhino's serialization form (`ScriptBinaryObject`), so retrieving it on the Java side with a fixed type throws `ClassCastException`. See "Relationship with JSSP (Script Development Model)" in `reference/cache-api-reference.md` for the cause and workarounds

## Post-Generation Checks

Rather than an automated validation script, verify the following manually.

1. Whether the `name` attribute of the cache configuration file (`WEB-INF/conf/im-ehcache-config/*.xml`) matches the argument passed to `getCache(cacheName)` in the Java code
2. Whether the cache key and value classes implement `java.io.Serializable`
3. Whether the `null` check on the return value of `Cache#get()`, along with the reload/re-registration logic on a cache miss, is implemented
4. Whether the execution environment that calls `CacheManagerFactory.getCacheManager()` has a tenant context (i.e., that it is not being called from an execution environment not tied to a tenant, such as the job scheduler)
5. When sensitive information is stored in the cache, whether the design prevents unintended access across tenants or users
6. Whether the code complies with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| Caching in SSJS (JSSP) | `jssp-im-cache-usage` (the SSJS version of the `Cache` API, `d.ts/platform/cache/im-ssjs-cache.d.ts`) |
| **Caching in Java (JavaEE development model)** | **This skill** |
| File operations in Java (`PublicStorage`, etc.) | `java-im-storage-usage` |
| Application locking in Java (`NewLock`) | `java-im-lock-usage` |
| Unique ID generation in Java (`Identifier`) | `java-im-identifier-usage` |
| An in-memory cache confined to a single JVM (when sharing across tenants is not required) | Out of scope for this skill (implement individually with standard `java.util.concurrent` classes, etc.) |
