---
name: jssp-im-cache-usage
description: A skillset for using the intra-mart-provided SSJS `Cache` class (`d.ts/platform/cache/im-ssjs-cache.d.ts`) in function containers under JSSP (script development model). Provides cache configuration (TTL, max elements, etc.) via `WEB-INF/conf/im-ehcache-config/{name}.xml`, the basic `get`/`put`/`remove`/`removeAll` patterns, cache key design, and the constraint that only serializable values can be cached. Use when the user mentions wanting to use caching, wanting to implement a caching feature, wanting to use the `Cache` class, wanting to cache something in SSJS, or wanting to speed up repeated processing with a cache. When building equivalent processing in Java (JavaEE development model), use `java-im-cache-usage` instead.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart SSJS Cache API Support Skill

## Purpose

A skillset for implementing server-side caching inside function containers, using the SSJS `Cache` class (available since 8.0.37 (2025 Spring)) that intra-mart Accel Platform provides for the script development model (JSSP).

`Cache` is an API used from function containers (`.js`); it is not meant to be used directly from presentation pages (`.html`). Use it to cache data that can be reused across requests — DB lookup results, results of computationally expensive processing, etc. — to shorten processing time.

## Conventions to Reference

This skill generates cache-usage code inside a function container (`.js`). For the full picture, see the "Convention File List" in `.claude/rules/README.md`.

| Convention | Handling |
|------|---------|
| `.claude/rules/jssp-function-container.md` | 🟢 **Required reading** — `init()` structure, function decomposition policy |
| `.claude/rules/jssp-naming.md` / `.claude/rules/jssp-code-style.md` / `.claude/rules/jssp-file-structure.md` | 🟢 Required reading |
| `.claude/rules/jssp-error-handling.md` | 🟢 Required reading — error handling for the processing that fetches the source data to cache (DB access, etc.) |
| `.claude/rules/jssp-2way-sql.md` | 🟡 Reference only when the cached data is fetched from a DB |
| `.claude/rules/jssp-presentation-page.md` | 🔴 **Not needed for this skill alone** — `Cache` is not used directly from presentation pages |

## API Overview

Refer to `d.ts/platform/cache/im-ssjs-cache.d.ts` for the complete type definition of the `Cache` class (do not write it from memory or guesswork). Key points:

- Create an instance with `new Cache(cacheName)`. `cacheName` must match a cache name defined in the cache configuration file described below
- It exposes only four methods: `get(key)` / `put(key, value)` / `remove(key)` / `removeAll()`
- `get(key)` returns `null` when the value is not found in the cache. It does not throw an exception
- The `value` passed to `put(key, value)` must be a serializable object. Functions and host objects (a DB connection object, etc.) cannot be cached
- Internally, `Cache` is a bridge implementation over the Java-side `CacheManagerFactory.getCacheManager()`, and shares the same cache configuration file and cache namespace with the Java (JavaEE development model) `CacheManager`/`Cache` API
- `Cache` only works in an execution environment where a tenant context exists (presentation page processing, function container processing, job execution, etc.). Instantiating it in an environment with no tenant context raises `IllegalStateException`

## Cache Configuration File (Required Before Use)

Before using a cache, you must define the cache name in `WEB-INF/conf/im-ehcache-config/{any name}.xml`. Do not pass a cache name to `new Cache(cacheName)` that has not been defined in a configuration file.

```xml
<im-ehcache-config xmlns="http://www.intra-mart.jp/cache/ehcache/config">
  <cache name="itemMasterCache"
         enable="true"
         time-to-idle-seconds="600"
         time-to-live-seconds="3600"
         max-elements-on-memory="1000"
         max-elements-on-disk="0"
         max-bytes-memory="0"
         max-bytes-disk="0"
         overflow-to-disk="false" />
</im-ehcache-config>
```

| Attribute | Default | Meaning |
|---|---|---|
| `name` (required) | - | Cache name. Must match the argument passed to `new Cache(cacheName)`. **Do not use a name starting with `im_`, as it is reserved by the system** |
| `enable` | `false` | Controls whether the cache is enabled. **The default is `false`**, so specify `enable="true"` explicitly |
| `time-to-idle-seconds` | `0` | Lifetime (in seconds) since the last access |
| `time-to-live-seconds` | `0` | Absolute lifetime (in seconds) since registration |
| `max-elements-on-memory` | `0` | Maximum number of elements held in memory |
| `max-elements-on-disk` | `0` | Maximum number of elements when overflowing to disk |
| `max-bytes-memory` / `max-bytes-disk` | `0` | Upper limit specified in bytes. **Each is ignored when the corresponding `max-elements-on-memory`/`max-elements-on-disk` is set** |
| `overflow-to-disk` | `false` | Whether elements exceeding the memory limit overflow to disk |

When an attribute is omitted, it falls back to the tenant's common default settings. It is recommended to explicitly set the lifetime and size limits according to business requirements (see "Notes" below for guidance on choosing the values).

**`max-bytes-memory`/`max-bytes-disk` involve size-calculation processing for objects, so caching large objects with many references can become a performance bottleneck.** In that case, use `max-elements-on-memory`/`max-elements-on-disk` (an element-count limit) instead.

This configuration file is also shared with the Java (JavaEE development model) `CacheManager`/`Cache` API. Before naming a cache, confirm that no other feature is already using the same cache name. **Under multi-tenant deployment, cache capacity is allocated separately for each tenant**, so when designing upper limits, estimate the total consumption multiplied by the number of tenants (source: [official reference](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)).

## What to Generate and Which Template to Use

| What to generate | Template | Content |
|---------|------------|------|
| Referencing, registering, and removing cache entries inside a function container | `assets/cache-basic-usage.md` | The basic `get`/`put` pattern, `remove` on update, cache key design examples |

## When to Use This Skill

Use this skill when the user makes a request such as:
- "I want to speed up a master-data lookup by caching it"
- "I want to use the `Cache` class"
- "I want to cache a result so the same computation isn't repeated"
- "I want to create a cache configuration file"

If there is explicit mention of "in Java" or "in the JavaEE development model," use `java-im-cache-usage` instead.

## Implementation Steps

1. Gather requirements on what to cache and how to design the key (what to cache, what key to use, how long to cache it for; reconsider whether caching is even appropriate if the underlying data changes frequently)
2. Define the cache name, TTL, and size limits in `WEB-INF/conf/im-ehcache-config/{name}.xml` (see the table above)
3. Implement in the function container by referring to `assets/cache-basic-usage.md`
4. Confirm compliance with `.claude/rules/jssp-function-container.md` / `jssp-naming.md` / `jssp-code-style.md` / `jssp-error-handling.md`

## Notes

- **Define the cache name in the configuration file beforehand.** `new Cache(cacheName)` itself can be called regardless of whether the cache name exists in a configuration file, but to reliably apply the intended cache settings (TTL, size limits, etc.), always prepare a corresponding `<cache>` definition
- **There are no "recommended values" for the specific number of seconds used in `time-to-idle-seconds`/`time-to-live-seconds`.** Decide them per cached data set, based on how often the source data changes, the acceptable data freshness, and the access pattern (intermittent vs. constant). See "How to decide `time-to-idle-seconds`/`time-to-live-seconds`" in the `java-im-cache-usage` skill's `reference/cache-api-reference.md` for detailed guidance
- **The platform itself publishes an estimation formula for `max-bytes-memory`/`max-elements-on-memory`** — "average data size per entry × expected maximum number of entries" (multiplied further by the number of tenants under multi-tenant deployment). The configuration guides for the global navigation menu cache and the IM-Authz authorization cache are worked examples. See "Estimation formula for `max-bytes-memory`/`max-elements-on-memory`" in the `java-im-cache-usage` skill's `reference/cache-api-reference.md` for the concrete formula and calculation examples, and apply the same approach to a custom cache. For a practical way to estimate the "average data size per entry" on the JSSP side (such as approximating it from the string length of `JSON.stringify()`), see "How to Estimate Cache Size (In Practice)" in `assets/cache-basic-usage.md`
- **The value passed to `put()` must be a serializable object.** Never cache anything that cannot be serialized — functions, DB connection objects, Java objects created via `new Packages.***`, etc.
- **Always null-check the return value of `get()`.** On a cache miss it returns `null` rather than throwing, so implement a fallback that fetches the source data and calls `put()` when the result is `null`
- **When the underlying data is updated, remove the corresponding cache entry with `remove()`.** Forgetting to remove the cache entry on update means stale data continues to be served until the TTL expires
- **Pay attention to the granularity of the cache key.** A key that is too coarse (e.g., a fixed key that ignores the search condition) causes different results to be conflated; a key that is too fine (e.g., a unique key that includes a timestamp) drops the cache hit rate to effectively zero
- **The configuration file and cache namespace are shared with the Java (JavaEE development model) `CacheManager`/`Cache` API.** Do not reuse the same cache name for unrelated purposes between the JSSP side and the Java side
- **Cross-side value sharing is only practical in the Java → JSSP direction.** The SSJS `Cache#put()`, regardless of the value's type, wraps it in Rhino's serialization form (`ScriptBinaryObject`) before storing it in the underlying Java `Cache<K, V>`. The Java side has no Rhino execution scope and cannot reconstruct it, so reading a value that JSSP `put()` stored from the Java-side `Cache<K, V>` with a fixed type throws `ClassCastException` (receiving it as `Cache<K, Object>` avoids the exception but only yields the unusable `ScriptBinaryObject`). Conversely, an ordinary value (e.g. `String`) that Java `put()` stored can be read normally from the JSSP-side `Cache#get()`. **If you need to share a value with the Java side, design it so the Java side `put()`s and the JSSP side only reads** (see `reference/cache-api-reference.md` in the `java-im-cache-usage` skill for details)

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| **Caching implementation in JSSP (script development model)** | **This skill** |
| Caching implementation in Java (JavaEE development model) (`CacheManager`/`Cache`) | `java-im-cache-usage` |
| DB access (fetching the source data to cache) | `jssp-page-generator` (`jssp-2way-sql.md`) |
| Using or clearing a cache inside a batch job | `jssp-im-job-generator` (+ this skill) |
