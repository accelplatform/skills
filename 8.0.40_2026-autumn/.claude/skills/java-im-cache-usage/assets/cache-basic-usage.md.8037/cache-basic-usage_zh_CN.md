# Cache API 基本使用模式（Java 版）

`CacheManager`/`Cache` 的签名与内部行为请参考 `reference/cache-api-reference.md`。这里展示典型的调用模式。

## 模式1: 获取缓存并读取（缓存未命中时重新加载）

最基本的形式。当 `get()` 返回 `null` 时从数据源加载，并通过 `put()` 注册到缓存。

```java
package jp.co.example.foo.service;

import java.io.Serializable;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

import jp.co.example.foo.entity.ProductEntity;
import jp.co.example.foo.repository.ProductRepository;

/**
 * 提供品目信息的获取处理。
 */
public class ProductQueryService {

    private static final String CACHE_NAME = "productCache";

    private final ProductRepository productRepository;

    public ProductQueryService(final ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * 获取品目信息。<br>
     * 若存在于缓存中则从缓存返回，若不存在则从仓储中获取后注册到缓存。
     *
     * @param productCode 品目编码
     * @return 品目信息；不存在时返回 null
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
     * 存储于缓存中的品目信息。
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

- `CacheManagerFactory.getCacheManager()` 只能在存在租户上下文的执行环境中调用（可能抛出 `IllegalStateException`，应确认调用方的执行环境）
- 存储于缓存中的值类（`ProductCacheValue`）**必须实现 `java.io.Serializable`**，并定义 `serialVersionUID`
- 当 `cache.get(productCode)` 为 `null` 时，视为缓存未命中并从数据源加载。将加载结果通过 `put()` 注册到缓存后，后续访问即可从缓存返回
- `CACHE_NAME`（`"productCache"`）应与 `WEB-INF/conf/im-ehcache-config/*.xml` 中 `cache` 元素的 `name` 属性一致（参见下文的配置文件示例）

## 模式2: 批量获取多条数据（`getAll`）

用于一次性获取多个键的场景。缓存中不存在的键不会包含在返回的 `Map` 中。

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
        // 仅针对 missedProductCodes 从数据源获取，并通过 cache.putAll() 注册（具体获取・注册处理略）

        return cachedValueMap;
    }
}
```

- `getAll(keys)` 返回的 `Map` 只包含缓存中存在的键。调用方需自行判断未命中的键，单独加载后再通过 `putAll()` 注册
- 相比每次逐条调用 `get()`/`put()`，对大量数据使用 `getAll()`/`putAll()` 批量处理有时效率更高

## 模式3: 删除缓存条目（保证更新时的一致性）

更新主数据时，应显式删除对应的缓存条目，避免旧缓存残留。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

public class ProductUpdateService {

    private static final String CACHE_NAME = "productCache";

    /**
     * 更新品目信息，并删除对应的缓存条目。<br>
     * 删除后，下次访问时将从数据源重新加载最新值。
     *
     * @param productCode 品目编码
     */
    public void update(final String productCode) {
        // 数据源的更新处理，例如 productRepository.update(...)

        final CacheManager cacheManager = CacheManagerFactory.getCacheManager();
        final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
        cache.remove(productCode);
    }
}
```

- `remove(key)` 在对应条目存在时返回 `true`（即使条目不存在也不会抛出异常）
- 在更新缓存对象数据的处理中，应在与更新相同的事务・处理流程内调用缓存的 `remove()`，避免旧缓存被继续引用
- 若要一次性清空属于该缓存名的全部条目，应使用无参的 `removeAll()`

## 新建缓存配置文件

使用缓存之前，应在 `WEB-INF/conf/im-ehcache-config/` 下新建配置文件（任意文件名的 `.xml`），并定义缓存名。属性详情请参考 `reference/cache-api-reference.md`。

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

- `name` 属性应与 Java 代码中的 `CACHE_NAME`（`getCache()` 的参数）一致
- `time-to-idle-seconds` / `time-to-live-seconds` 应根据需求设置（更新频率较低的主数据可将 `time-to-live-seconds` 设置得较长；需要根据访问频率失效的数据应使用 `time-to-idle-seconds`）
- 一个配置文件中可以定义多个 `cache` 元素（是否按功能拆分文件可自行决定）

## 模式4：读取可能由 JSSP 侧 `put()` 存入的缓存条目

JSSP 侧的 SSJS `Cache#put()` 存入的值会以 Rhino 的序列化形式（`ScriptBinaryObject`）包装。Java 侧没有办法将其还原为原始值，因此以固定类型的 `Cache<K, V>` 接收会抛出 `ClassCastException`（详见 `reference/cache-api-reference.md` 中的「与 JSSP（脚本开发模型）的关系」）。若与 JSSP 侧共享同一缓存名、且无法保证条目的存入方，应以 `Cache<K, Object>` 接收并通过 `instanceof` 检查类型。

```java
final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
final Object cachedValue = cache.get(productCode);

if (cachedValue instanceof ProductCacheValue) {
    return (ProductCacheValue) cachedValue;
}
// 若 cachedValue 是非预期类型（例如 JSSP 侧 put() 存入的 ScriptBinaryObject），
// 则视为缓存未命中，从数据源重新获取后再次 put()
```

- 最可靠的规避方法是从设计上让 **Java 专用的缓存名不与 JSSP 侧共享**。仅当缓存名无法拆分时，才退而使用上述类型检查作为防御手段

## 反模式（应避免）

```java
// NG: 未考虑 get() 返回值可能为 null
final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);
final ProductCacheValue value = cache.get(productCode);
value.getProductName(); // 若 value 为 null 则抛出 NullPointerException

// NG: 缓存键・值的类未实现 Serializable
public class ProductCacheValue { // 缺少 implements Serializable
    private final String productCode;
    // ...
}

// NG: 未在配置文件中定义缓存名就调用 getCache()
// （"unregisteredCache" 未在 im-ehcache-config 下的任何配置文件中定义）
final Cache<String, Object> cache = cacheManager.getCache("unregisteredCache");

// NG: 在不存在租户上下文的执行环境中调用 getCacheManager()
// （无法从 AccountContext 解析租户ID，将抛出 IllegalStateException）
final CacheManager cacheManager = CacheManagerFactory.getCacheManager();

// NG: 更新主数据的处理中未调用缓存的 remove()（旧缓存将持续残留）
productRepository.update(productEntity);
// 未调用 cache.remove(productCode)

// NG: 以固定类型从与 JSSP 侧共享的缓存名读取
// （若值是由 JSSP 侧 put() 存入的，将抛出 ClassCastException）
final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);
final ProductCacheValue value = cache.get(productCode); // 可能抛出 ClassCastException
```
