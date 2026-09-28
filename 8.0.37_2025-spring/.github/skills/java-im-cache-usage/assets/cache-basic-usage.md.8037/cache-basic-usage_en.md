# Cache API Basic Usage Patterns (Java Version)

For the signatures and internal behavior of `CacheManager`/`Cache`, see `reference/cache-api-reference.md`. This document shows typical call patterns.

## Pattern 1: Acquiring the Cache and Reading (Reload on a Cache Miss)

The most basic form. When `get()` returns `null`, load from the data source and register the result in the cache with `put()`.

```java
package jp.co.example.foo.service;

import java.io.Serializable;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

import jp.co.example.foo.entity.ProductEntity;
import jp.co.example.foo.repository.ProductRepository;

/**
 * Provides processing for retrieving product information.
 */
public class ProductQueryService {

    private static final String CACHE_NAME = "productCache";

    private final ProductRepository productRepository;

    public ProductQueryService(final ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Retrieves product information.<br>
     * Returns the value from the cache if present; otherwise fetches it from the repository
     * and registers it in the cache.
     *
     * @param productCode the product code
     * @return the product information, or null if it does not exist
     */
    public ProductCacheValue findProduct(final String productCode) {
        final CacheManager cacheManager = CacheManagerFactory.getCacheManager();
        final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);

        ProductCacheValue cachedValue = cache.get(productCode);
        if (cachedValue != null) {
            return cachedValue;
        }

        final ProductEntity productEntity = productRepository.findByProductCode(productCode);
        if (productEntity == null) {
            return null;
        }

        cachedValue = new ProductCacheValue(productEntity.getProductCode(), productEntity.getProductName());
        cache.put(productCode, cachedValue);
        return cachedValue;
    }

    /**
     * Product information stored in the cache.
     */
    public static final class ProductCacheValue implements Serializable {

        private static final long serialVersionUID = 1L;

        private final String productCode;
        private final String productName;

        public ProductCacheValue(final String productCode, final String productName) {
            this.productCode = productCode;
            this.productName = productName;
        }

        public String getProductCode() {
            return productCode;
        }

        public String getProductName() {
            return productName;
        }
    }
}
```

- `CacheManagerFactory.getCacheManager()` can only be called in an execution environment where a tenant context exists (it may throw `IllegalStateException`, so confirm the caller's execution environment)
- The value class stored in the cache (`ProductCacheValue`) **must implement `java.io.Serializable`**. Also define `serialVersionUID`
- When `cache.get(productCode)` is `null`, treat it as a cache miss and load from the data source. Registering the loaded result in the cache via `put()` ensures subsequent accesses are served from the cache
- Match `CACHE_NAME` (`"productCache"`) to the `name` attribute of the `cache` element in `WEB-INF/conf/im-ehcache-config/*.xml` (see the configuration file example below)

## Pattern 2: Bulk Retrieval of Multiple Entries (`getAll`)

Use this when retrieving multiple keys at once. Keys not present in the cache are not included in the returned `Map`.

```java
package jp.co.example.foo.service;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

public class ProductQueryService {

    private static final String CACHE_NAME = "productCache";

    public Map<String, ProductQueryService.ProductCacheValue> findProducts(final Set<String> productCodes) {
        final CacheManager cacheManager = CacheManagerFactory.getCacheManager();
        final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);

        final Map<String, ProductCacheValue> cachedValueMap = cache.getAll(productCodes);

        final Set<String> missedProductCodes = new HashSet<>(productCodes);
        missedProductCodes.removeAll(cachedValueMap.keySet());
        // Continue by fetching only the entries for missedProductCodes from the data source
        // and registering them with cache.putAll() (the actual fetch/registration is omitted)

        return cachedValueMap;
    }
}
```

- `getAll(keys)` returns a `Map` that contains only the keys present in the cache. The caller identifies any missed keys, loads them individually, and registers them with `putAll()`
- Processing entries in bulk with `getAll()`/`putAll()` can be more efficient than calling `get()`/`put()` one key at a time for large amounts of data

## Pattern 3: Removing a Cache Entry (Ensuring Consistency on Update)

When master data is updated, explicitly remove the corresponding cache entry so stale data does not persist.

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

public class ProductUpdateService {

    private static final String CACHE_NAME = "productCache";

    /**
     * Updates the product information and removes the corresponding cache entry.<br>
     * After removal, the next lookup reloads the latest value from the data source.
     *
     * @param productCode the product code
     */
    public void update(final String productCode) {
        // Update the data source here, e.g. productRepository.update(...)

        final CacheManager cacheManager = CacheManagerFactory.getCacheManager();
        final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
        cache.remove(productCode);
    }
}
```

- `remove(key)` returns `true` if the corresponding entry existed (it does not throw if the entry does not exist)
- When updating cached data, call the cache's `remove()` within the same transaction/processing flow as the update, so stale cache entries are not read afterward
- Use `removeAll()` (no arguments) to discard all entries belonging to the cache name at once

## Creating a New Cache Configuration File

Before using a cache, create a new configuration file (any filename ending in `.xml`) under `WEB-INF/conf/im-ehcache-config/` and define the cache name. See `reference/cache-api-reference.md` for the attribute details.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<im-ehcache-config xmlns="http://www.intra-mart.jp/cache/ehcache/config">
  <cache name="productCache"
         enable="true"
         time-to-idle-seconds="600"
         time-to-live-seconds="3600"
         max-elements-on-memory="1000"
         overflow-to-disk="false" />
</im-ehcache-config>
```

- Match the `name` attribute to `CACHE_NAME` in the Java code (the argument to `getCache()`)
- Set `time-to-idle-seconds` / `time-to-live-seconds` based on the requirement (a longer `time-to-live-seconds` for infrequently updated master data; `time-to-idle-seconds` for data that should expire based on access frequency)
- A single configuration file may define multiple `cache` elements (whether to split files by feature is up to you)

## Pattern 4: Reading a cache entry that may have been `put()` from the JSSP side

A value stored by the JSSP-side SSJS `Cache#put()` is wrapped in Rhino's serialization form (`ScriptBinaryObject`). The Java side has no way to reconstruct it back into the original value, so receiving it with a fixed `Cache<K, V>` type throws `ClassCastException` (see "Relationship with JSSP (Script Development Model)" in `reference/cache-api-reference.md` for details). If the same cache name is shared with the JSSP side and the origin of a given entry cannot be guaranteed, receive it as `Cache<K, Object>` and check the type with `instanceof`.

```java
final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
final Object cachedValue = cache.get(productCode);

if (cachedValue instanceof ProductCacheValue) {
    return (ProductCacheValue) cachedValue;
}
// If cachedValue has an unexpected type (e.g. a ScriptBinaryObject put() from the JSSP side),
// treat it as a cache miss, reload from the data source, and put() again
```

- The most reliable fix is to design the Java-only cache name so it is **not shared** with the JSSP side in the first place. Fall back to the type check above only when the cache name cannot be split

## Anti-Patterns (Avoid These)

```java
// NG: not accounting for get() returning null
final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);
final ProductCacheValue value = cache.get(productCode);
value.getProductName(); // NullPointerException if value is null

// NG: the cache key/value class does not implement Serializable
public class ProductCacheValue { // missing "implements Serializable"
    private final String productCode;
    // ...
}

// NG: calling getCache() without defining the cache name in a configuration file
// ("unregisteredCache" is not defined in any configuration file under im-ehcache-config)
final Cache<String, Object> cache = cacheManager.getCache("unregisteredCache");

// NG: calling getCacheManager() in an execution environment with no tenant context
// (the tenant ID cannot be resolved from AccountContext, so IllegalStateException is thrown)
final CacheManager cacheManager = CacheManagerFactory.getCacheManager();

// NG: not calling the cache's remove() when updating master data (stale entries persist)
productRepository.update(productEntity);
// cache.remove(productCode) is never called

// NG: reading a cache name shared with the JSSP side using a fixed value type
// (throws ClassCastException if the value was put() from the JSSP side)
final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);
final ProductCacheValue value = cache.get(productCode); // may throw ClassCastException
```
