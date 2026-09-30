# Cache API Reference (Java Version)

Based on the actual class definitions in the intra-mart Accel Platform core source (`im_cache_base` / `im_cache_impl` modules). Do not supplement methods from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.cache
├── CacheManager         … The public interface for the cache manager
├── CacheManagerFactory  … The factory class for obtaining a CacheManager (application code uses only this)
└── Cache                … The public interface representing an individual cache (contains Cache.Entry)

jp.co.intra_mart.foundation.cache.exception
└── CacheException       … An unchecked exception (extends RuntimeException)
```

The standard implementation (the `im_cache_impl` module) is provided as `EhcacheManagerProvider` and is resolved via `ServiceLoader`. Its backend is Ehcache 2.x.

## The `CacheManager` Interface

```java
package jp.co.intra_mart.foundation.cache;

public interface CacheManager {

    /** Returns the name (the tenant ID). */
    String getName();

    /** Returns the list of caches. */
    Iterable<Cache<?, ?>> getCaches();

    /**
     * Returns the cache with the specified name.<br>
     * Both the cache key (K) and the cache value (V) must implement the
     * java.io.Serializable interface.
     *
     * @param cacheName the cache name
     * @return the cache with the specified name
     */
    <K, V> Cache<K, V> getCache(String cacheName);
}
```

- The `cacheName` passed to `getCache(cacheName)` corresponds to the `name` attribute of the `cache` element in the cache configuration file (`WEB-INF/conf/im-ehcache-config/*.xml`)
- The type parameters `K` (key) and `V` (value) are determined by the caller's variable declaration (the method itself is a generic method). **`K` and `V` must implement `java.io.Serializable`**

## The `CacheManagerFactory` Class

```java
package jp.co.intra_mart.foundation.cache;

public final class CacheManagerFactory {

    /**
     * Returns the cache manager.<br>
     * Resolves the tenant ID from the execution context's AccountContext and returns the
     * CacheManager instance corresponding to that tenant.
     *
     * @return the cache manager
     * @throws IllegalStateException if called in an execution environment where the tenant ID cannot be resolved
     */
    public static CacheManager getCacheManager();
}
```

- **The only method application code may call is the no-argument `getCacheManager()`.** The overload that takes a tenant ID directly is package-private and cannot be called from application code
- Internally, it caches and manages a `CacheManager` instance tied to the tenant ID. Lifecycle management (initialization equivalent to `CacheLifecycle#start()`) is also handled automatically internally, so application code does not need to be aware of it
- `getCacheManager()` works correctly only when the tenant ID can be resolved from the execution context's `AccountContext`. Calling it in an execution environment where the tenant ID cannot be resolved — such as system processing not tied to any tenant — throws `IllegalStateException`

## The `Cache<K, V>` Interface

```java
package jp.co.intra_mart.foundation.cache;

public interface Cache<K, V> extends Iterable<Cache.Entry<K, V>> {

    /** Returns the name of this cache. */
    String getName();

    /** Determines whether the specified key exists in the cache. */
    boolean containsKey(K key);

    /**
     * Returns the value corresponding to the specified key.
     * @return the value, or null if it does not exist in the cache
     */
    V get(K key);

    /**
     * Returns the values corresponding to the specified keys in bulk.<br>
     * Keys not present in the cache are not included in the returned Map.
     */
    Map<K, V> getAll(Set<? extends K> keys);

    /** Registers a value for the specified key. Overwrites the value if the key already exists. */
    void put(K key, V value);

    /** Registers multiple keys and values at once. */
    void putAll(Map<? extends K, ? extends V> map);

    /**
     * Removes the entry for the specified key.
     * @return true if removed; false if no such key existed
     */
    boolean remove(K key);

    /** Removes the entries for the specified keys. */
    void removeAll(Set<? extends K> keys);

    /** Removes all entries belonging to this cache. */
    void removeAll();

    /** Returns an iterator over all entries of this cache (implementation of Iterable). */
    @Override
    Iterator<Cache.Entry<K, V>> iterator();

    /**
     * Represents a single entry (a key-value pair) in the cache.
     */
    interface Entry<K, V> {
        K getKey();
        V getValue();
    }
}
```

- Since `Cache` itself implements `Iterable<Cache.Entry<K, V>>`, entries can be iterated with an extended for loop (`for (final Cache.Entry<String, V> entry : cache) { ... }`)
- `get(key)` **returns `null`** on a cache miss (it does not throw). The caller must always check for `null`
- `put(key, value)` overwrites the value if the key already exists (no exception is thrown)
- `remove(key)` returns `true` if removal succeeded (the entry existed). It returns `false` if no such entry existed (no exception is thrown)
- `removeAll()` (no arguments) removes all entries belonging to the cache name represented by this `Cache` instance. It does not affect other cache names

## `CacheException`

```java
package jp.co.intra_mart.foundation.cache.exception;

public class CacheException extends RuntimeException {
    // An unchecked exception that may be thrown for errors internal to the cache implementation
    // (invalid configuration, serialization failure, etc.)
}
```

- An unchecked exception that extends `RuntimeException`
- It is not declared with `throws` in the method signatures of the `Cache`/`CacheManager` interfaces (no declaration is needed for an unchecked exception), but it may be thrown due to internal implementation errors such as invalid cache configuration or serialization failure

## Cache Configuration File (`WEB-INF/conf/im-ehcache-config/{any-filename}.xml`)

The attribute definitions of the `cache` element, based on the XSD schema (`im-ehcache-config.xsd`, namespace `http://www.intra-mart.jp/cache/ehcache/config`):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<im-ehcache-config xmlns="http://www.intra-mart.jp/cache/ehcache/config">
  <cache name="myCacheName"
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

| Attribute | Type | Default | Meaning |
|---|---|---|---|
| `name` (required) | string | - | The cache name. Must match the value passed to `CacheManager#getCache(cacheName)`. **Do not use a name starting with `im_`, as it is reserved by the system** ([official reference](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)) |
| `enable` | boolean | `false` | Controls whether the cache is enabled. **The default is `false`**, so you must explicitly specify `enable="true"` for the cache to work |
| `time-to-idle-seconds` | integer | `0` | The idle time (in seconds). The target object is discarded if it is not referenced within this period |
| `time-to-live-seconds` | integer | `0` | The lifetime (in seconds). The object is discarded once this lifetime has elapsed since registration |
| `max-elements-on-memory` | integer | `0` | The maximum number of objects cached in memory |
| `max-elements-on-disk` | integer | `0` | The maximum number of cached objects on disk |
| `max-bytes-memory` | string (byte-size specification; notations such as `1k`/`10M`/`50G` are allowed) | `0` | The maximum size for objects stored in memory. **This attribute is ignored when `max-elements-on-memory` is set** (`max-elements-on-memory` takes precedence) |
| `max-bytes-disk` | string (byte-size specification) | `0` | The maximum size for objects stored on disk. The precedence relationship with `max-elements-on-disk` is the same as for `max-bytes-memory` |
| `overflow-to-disk` | boolean | `false` | Whether elements exceeding the memory limit overflow to disk |

- If an attribute is omitted, it falls back to the tenant-wide default configuration (the `default-cache` element, defined in a separate file). Changing the default configuration file itself is out of scope for this skill (ordinary application development only needs to add a per-cache configuration file)
- If the configuration file does not exist, or no matching `cache name` definition exists, calling `getCache()` itself may not throw an exception, but the cache may not function, or an initialization error may occur. **Always define the cache name in a configuration file before using the cache**
- A single configuration file can define multiple `cache` elements

### Performance note on `max-bytes-memory`/`max-bytes-disk`

Per the [official reference](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html), setting `max-bytes-memory` / `max-bytes-disk` triggers size-calculation processing for the stored objects. **If a registered object holds a large number of references, this calculation can take noticeable time and become a performance bottleneck.** When caching large objects (entities with many fields or nested collections, for example), use `max-elements-on-memory`/`max-elements-on-disk` (an element-count limit) instead of `max-bytes-memory`/`max-bytes-disk`.

### Capacity under multi-tenant deployment

Per the [official reference](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html), when running multiple tenants via virtual tenants, **cache capacity is allocated separately for each tenant** (for example, `max-bytes-memory="60M"` across 2 tenants results in a total capacity of 120M). When designing limits such as `max-elements-on-memory`/`max-bytes-memory`, estimate the total consumption (memory and disk) by multiplying by the number of tenants.

### How to decide `time-to-idle-seconds`/`time-to-live-seconds`

The platform does not provide "recommended values" for the specific number of seconds or the element-count limits. Decide these on a per-data basis, considering:

- **How often the source data changes**: master data that changes infrequently can use a longer `time-to-live-seconds`. The more frequently the data changes, the more this trades off against the risk of continuing to serve stale data
- **Acceptable data freshness**: decide the limit based on how much delay between a DB update and its reflection in the cache is acceptable. Reconsider using a cache at all for data that requires immediate reflection
- **Access pattern**: data accessed intermittently suits `time-to-idle-seconds` (idle expiration); data accessed continuously but needing periodic freshness guarantees suits `time-to-live-seconds` (absolute expiration)
- **Memory budget**: design `max-elements-on-memory` (or `max-bytes-memory`) so that per-entry data size × expected concurrent cache entries × number of tenants (under multi-tenant deployment) fits within the allocable heap memory. See the next section for a concrete estimation formula

### Estimation formula for `max-bytes-memory`/`max-elements-on-memory`

Unlike `time-to-idle-seconds`/`time-to-live-seconds`, **the platform itself publishes a concrete estimation formula for the memory limit (`max-bytes-memory`/`max-elements-on-memory`).** The configuration guides for caches the platform uses internally (the global navigation menu cache and the IM-Authz authorization cache) both derive the cache size using a formula of this form:

```
Cache size (bytes) = average data size per entry × expected maximum number of entries
```

Calculation example for the global navigation menu cache (from the [official reference](https://document.intra-mart.jp/library/iap/public/setup/iap_setup_guide/texts/create_war/configuration_file_dropdown_cache.html)):

```
Cache size = (content size per menu item (avg. 600 bytes) × number of displayed menu items
            + content size per menu folder (avg. 150 bytes) × number of displayed menu folders
            + fixed HTML always output by the global navigation (700 bytes))
            × number of active users

Example with default values (50 menu items, 10 menu folders, 2,000 users):
(600 × 50 + 150 × 10 + 700) × 2,000 = 64,400,000 bytes (approx. 62MB) → max-bytes-memory="62M"
```

The IM-Authz authorization cache ([official reference](https://document.intra-mart.jp/library/iap/public/im_authz/im_authz_specification/texts/appendix/im_ehcache_sizing.html)) also presents formulas built on the same idea — "average bytes per entry × expected count" (some with additional terms depending on the cache structure) — for each of its 8 cache types (for example, the subject-information cache is "average subject-information size (800 bytes) × number of subjects").

**The same approach applies to a custom cache:**

1. Estimate the average data size per entry (the value passed to `put` for one key) — either by measuring the actual serialized byte size or by inferring it from an existing data structure with a similar shape
2. Estimate the expected maximum number of entries (the upper bound on the combinations the key can take, or the number of entries that can be held concurrently in production)
3. Multiply the two, and under multi-tenant deployment also multiply by the number of tenants (see "Capacity under multi-tenant deployment" above)
4. Set the computed byte count on `max-bytes-memory`, or — if the per-entry size is roughly constant — set the expected entry-count limit directly on `max-elements-on-memory` (the latter also avoids the size-calculation overhead noted in the "Performance note" above)

### A Practical Way to Estimate the Data Size per Entry

Since estimating cache size does not require an exact match, the following methods yield an approximation that is accurate enough for practical purposes.

#### Method 1: Measure the Serialized Byte Count Directly (Closest to Reality)

Serialize the actual object that will be `put` as the cached value using `ObjectOutputStream`, and measure the resulting byte count.

```java
final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
try (ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream)) {
    objectOutputStream.writeObject(sampleValue);
}
final int estimatedBytesPerEntry = byteArrayOutputStream.size();
```

- Measure with production-representative sample data. Measuring an object with empty, initial-state fields underestimates the size
- Measure several representative data points (around 10-20) and check not only the average but also the maximum. If the size varies widely depending on field content, lean toward the maximum rather than the average to stay on the safe side
- When a field holds a collection such as `List`/`Map`, the size varies significantly with the element count, so measure with a sample that reflects the upper bound on that count

#### Method 2: Approximate from the Field Layout (For a Design Stage Where Direct Measurement Is Hard)

At a design stage where direct measurement is not possible, you may build up a rough byte count from field types instead (this is only a rough guide, not an exact value).

| Type | Approximate byte count |
|---|---|
| `boolean`/`byte` | 1 |
| `int`/`float` | 4 |
| `long`/`double` | 8 |
| Object reference / header | 8-16 per field |
| `String` | roughly character count × 2 (UTF-16 internal representation) + 40 (overhead for the object header, length, etc.) |

Example: for an object with 3 `String` fields (averaging 20 characters each) and 1 `long` field: `(20 × 2 + 40) × 3 + 8 ≈ 248` bytes.

Note that this approximation does not match the byte count from Method 1 (post-serialization) — it is only a rough guide to the heap-level size. **When in doubt, round up.** Underestimating the cache size increases evictions and lowers the cache hit rate, whereas the only real cost of overestimating is excess memory allocation — so rounding up is generally the safer choice.

#### Estimating the Expected Maximum Number of Entries

- If the key's possible values are finite, such as a business data ID: use the total count of that ID (e.g., the total number of records in the item master) as the upper bound
- If the key can theoretically be unbounded, such as a combination of search conditions: design it so `max-elements-on-memory` explicitly caps the number of entries, leaving anything beyond that to Ehcache's default eviction policy (LRU, etc.) — never let it cache without limit

## Relationship with JSSP (Script Development Model)

The SSJS version of the `Cache` class (`d.ts/platform/cache/im-ssjs-cache.d.ts`) is a bridge implementation that internally goes through the same `CacheManagerFactory.getCacheManager()` → `CacheManager#getCache(cacheName)` flow described in this reference. Therefore, the Java version and the JSSP version share the same cache configuration files (`WEB-INF/conf/im-ehcache-config/`) and the same cache namespace. The `jssp-im-cache-usage` skill covers the implementation pattern on the JSSP side.

### Cross-side value sharing works in one direction only (important)

Sharing the configuration file and cache namespace does **not** mean stored values can be read and written interchangeably between the two sides.

The SSJS `Cache` class (backed by `jp.co.intra_mart.system.javascript.imapi.cache.CacheObject`, module `im_cache_js`) processes values through `jp.co.intra_mart.system.jssp.utility.ScriptableSerializer` (module `im_jssp`) in `put`/`get`.

- `put(key, value)`: serializes `value` (a Rhino `Scriptable`) into a byte array, wraps it in a `ScriptBinaryObject` (a `Serializable` class that merely holds a byte array), and stores that in the underlying Java `Cache<K, V>`. **Regardless of the value's type, it is always stored as a `ScriptBinaryObject`**
- `get(key)`: if the retrieved value is a `ScriptBinaryObject`, it reconstructs the original value from the byte array using the Rhino execution scope; otherwise it returns the value as-is

Java (JavaEE development model) code has no Rhino execution scope, so it has no way to reconstruct a `ScriptBinaryObject` that JSSP `put()` produced back into the original value. As a result:

- **Reading a value that JSSP `put()` stored, from the Java-side `Cache<K, V>` with a fixed value type, throws `ClassCastException`.** Example (assuming JSSP already ran `cache.put("key1", "plainString")`):

  ```java
  final Cache<String, String> cache = cacheManager.getCache(CACHE_NAME);
  final String value = cache.get("key1");
  // java.lang.ClassCastException:
  // class jp.co.intra_mart.system.jssp.utility.ScriptBinaryObject
  // cannot be cast to class java.lang.String
  ```

  Receiving it as `Cache<String, Object>` avoids the `ClassCastException`, but the value obtained is the `ScriptBinaryObject` itself (an object that merely holds a byte array) — not a usable value.

  ```java
  final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
  final Object value = cache.get("key1");
  if (value instanceof String) {
      // Not reached when the value was put() from the JSSP side
  } else {
      // A ScriptBinaryObject is returned (no usable value can be obtained)
  }
  ```

- **A value that Java `put()` stored (an ordinary `Serializable` object such as `String`) can be read normally from the JSSP-side SSJS `Cache#get()`.** This is because `ScriptableSerializer.load()` returns the retrieved value as-is whenever it is not a `ScriptBinaryObject`

**Conclusion:** cross-side cache value sharing is only practical in the **Java → JSSP direction**. Avoid designs where the Java side directly consumes a cache entry that JSSP `put()`. Checking whether an entry exists (`containsKey()`) works from the Java side too, but the value's content cannot be reconstructed.

When receiving a value on the Java side that may have been stored from the JSSP side, receive it as `Cache<K, Object>`, check the type with `instanceof`, and fall back to error handling or logging for an unexpected type (such as `ScriptBinaryObject`) — do not receive it with a fixed type such as `Cache<K, String>`, which lets `ClassCastException` propagate directly.
