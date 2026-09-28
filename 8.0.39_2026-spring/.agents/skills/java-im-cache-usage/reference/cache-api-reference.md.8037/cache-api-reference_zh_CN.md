# Cache API 参考（Java 版）

基于 intra-mart Accel Platform 核心源码（`im_cache_base` / `im_cache_impl` 模块）的实际类定义。不要凭记忆或推测补充方法。

## 包结构

```
jp.co.intra_mart.foundation.cache
├── CacheManager         … 缓存管理器的公开接口
├── CacheManagerFactory  … 用于获取 CacheManager 的工厂类（应用代码只应使用这个类）
└── Cache                … 表示单个缓存的公开接口（内含 Cache.Entry）

jp.co.intra_mart.foundation.cache.exception
└── CacheException       … 非受检异常（继承自 RuntimeException）
```

标准实现（`im_cache_impl` 模块）以 `EhcacheManagerProvider` 形式提供，通过 `ServiceLoader` 解析。后端为 Ehcache 2.x。

## `CacheManager` 接口

```java
package jp.co.intra_mart.foundation.cache;

public interface CacheManager {

    /** 获取名称（租户ID）。 */
    String getName();

    /** 获取缓存列表。 */
    Iterable<Cache<?, ?>> getCaches();

    /**
     * 获取指定名称的缓存。<br>
     * 缓存键(K)及缓存值(V)必须实现 java.io.Serializable 接口。
     *
     * @param cacheName 缓存名
     * @return 指定名称的缓存
     */
    <K, V> Cache<K, V> getCache(String cacheName);
}
```

- `getCache(cacheName)` 的 `cacheName` 对应缓存配置文件（`WEB-INF/conf/im-ehcache-config/*.xml`）中 `cache` 元素的 `name` 属性
- 类型参数 `K`（键）・`V`（值）由调用方的变量声明决定（该方法本身是泛型方法）。**`K`・`V` 必须实现 `java.io.Serializable`**

## `CacheManagerFactory` 类

```java
package jp.co.intra_mart.foundation.cache;

public final class CacheManagerFactory {

    /**
     * 获取缓存管理器。<br>
     * 从执行上下文的 AccountContext 解析租户ID，返回该租户对应的 CacheManager 实例。
     *
     * @return 缓存管理器
     * @throws IllegalStateException 在无法解析租户ID的执行环境中调用时
     */
    public static CacheManager getCacheManager();
}
```

- **应用代码只能调用无参的 `getCacheManager()`。** 直接指定租户ID的重载方法为 package-private，无法从应用代码调用
- 内部会缓存并管理与租户ID关联的 `CacheManager` 实例。生命周期管理（相当于 `CacheLifecycle#start()` 的初始化处理）也在内部自动完成，应用侧无需关注
- `getCacheManager()` 仅在能够从执行上下文的 `AccountContext` 解析出租户ID时才能正常工作。在无法解析租户ID的执行环境（例如不隶属于任何租户的系统处理）中调用会抛出 `IllegalStateException`

## `Cache<K, V>` 接口

```java
package jp.co.intra_mart.foundation.cache;

public interface Cache<K, V> extends Iterable<Cache.Entry<K, V>> {

    /** 获取此缓存的名称。 */
    String getName();

    /** 判断指定的键是否存在于缓存中。 */
    boolean containsKey(K key);

    /**
     * 获取指定键对应的值。
     * @return 值；缓存中不存在时返回 null
     */
    V get(K key);

    /**
     * 批量获取指定多个键对应的值。<br>
     * 缓存中不存在的键不会包含在返回的 Map 中。
     */
    Map<K, V> getAll(Set<? extends K> keys);

    /** 为指定的键注册值。若键已存在则覆盖。 */
    void put(K key, V value);

    /** 批量注册多个键和值。 */
    void putAll(Map<? extends K, ? extends V> map);

    /**
     * 删除指定键的条目。
     * @return 删除成功时返回 true；该键不存在时返回 false
     */
    boolean remove(K key);

    /** 删除指定的多个键的条目。 */
    void removeAll(Set<? extends K> keys);

    /** 删除属于此缓存的全部条目。 */
    void removeAll();

    /** 获取此缓存全部条目的迭代器（Iterable 的实现）。 */
    @Override
    Iterator<Cache.Entry<K, V>> iterator();

    /**
     * 表示缓存中的一条条目（键值对）。
     */
    interface Entry<K, V> {
        K getKey();
        V getValue();
    }
}
```

- 由于 `Cache` 本身实现了 `Iterable<Cache.Entry<K, V>>`，可以通过增强 for 循环遍历条目（`for (final Cache.Entry<String, V> entry : cache) { ... }`）
- `get(key)` 在缓存未命中时**返回 `null`**（不抛出异常）。调用方必须始终进行 `null` 检查
- `put(key, value)` 若键已存在则覆盖其值（不抛出异常）
- `remove(key)` 删除成功（对应条目存在）时返回 `true`；对应条目不存在时返回 `false`（不抛出异常）
- 无参的 `removeAll()` 会删除属于该 `Cache` 实例所表示的缓存名的全部条目，不影响其他缓存名

## `CacheException`

```java
package jp.co.intra_mart.foundation.cache.exception;

public class CacheException extends RuntimeException {
    // 非受检异常。可能在缓存实现内部发生错误（配置不正确、序列化失败等）时抛出
}
```

- 继承自 `RuntimeException` 的非受检异常
- 在 `Cache`/`CacheManager` 接口的方法签名中未声明 `throws`（非受检异常无需声明），但可能因缓存配置不正确、序列化失败等内部实现错误而被抛出

## 缓存配置文件（`WEB-INF/conf/im-ehcache-config/{任意文件名}.xml`）

基于 XSD 模式（`im-ehcache-config.xsd`，命名空间 `http://www.intra-mart.jp/cache/ehcache/config`）的 `cache` 元素属性定义:

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

| 属性 | 类型 | 默认值 | 含义 |
|---|---|---|---|
| `name`（必需） | string | - | 缓存名。应与传给 `CacheManager#getCache(cacheName)` 的值一致。**不要使用以 `im_` 开头的名称，该前缀为系统保留字**（[官方参考文档](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)） |
| `enable` | boolean | `false` | 控制该缓存的启用/禁用。**默认值为 `false`**，因此要使缓存生效，必须显式指定 `enable="true"` |
| `time-to-idle-seconds` | integer | `0` | 空闲时间（秒）。若对象在此时间内未被引用，则会被丢弃 |
| `time-to-live-seconds` | integer | `0` | 存活期限（秒）。自注册起超过该存活期限后，对象会被丢弃 |
| `max-elements-on-memory` | integer | `0` | 内存中缓存对象的最大数量 |
| `max-elements-on-disk` | integer | `0` | 磁盘上缓存对象的最大数量 |
| `max-bytes-memory` | string（字节数指定，可使用 `1k`/`10M`/`50G` 等写法） | `0` | 对象存入内存时的最大大小。**若已设置 `max-elements-on-memory`，则此属性失效**（以 `max-elements-on-memory` 为准） |
| `max-bytes-disk` | string（字节数指定） | `0` | 对象存入磁盘时的最大大小。与 `max-elements-on-disk` 的优先关系与 `max-bytes-memory` 相同 |
| `overflow-to-disk` | boolean | `false` | 超出内存上限的部分是否溢出到磁盘 |

- 若省略属性，则回退到租户通用的默认配置（`default-cache` 元素，定义于另一文件）。修改默认配置文件本身不在本技能范围内（通常的应用开发只需新增按缓存划分的配置文件）
- 若配置文件不存在，或不存在对应的 `cache name` 定义，调用 `getCache()` 本身可能不会抛出异常，但缓存可能不起作用，或发生初始化错误。**在使用缓存之前，必须先在配置文件中定义缓存名**
- 一个配置文件中可以定义多个 `cache` 元素

### `max-bytes-memory`/`max-bytes-disk` 的性能注意事项

根据[官方参考文档](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)，设置 `max-bytes-memory` / `max-bytes-disk` 后，会对存入的对象进行大小计算处理。**若注册的对象持有大量引用，该计算处理会耗费较长时间，可能成为性能下降的原因。** 缓存较大的对象（字段众多、含嵌套集合的实体等）时，应改用 `max-elements-on-memory`/`max-elements-on-disk`（按元素数指定上限），而非 `max-bytes-memory`/`max-bytes-disk`。

### 多租户环境下的容量

根据[官方参考文档](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)，在通过虚拟租户运行多租户的场景下，**缓存容量会按租户单独分配**（例如：`max-bytes-memory="60M"` 在 2 个租户下运行时，总容量为 120M）。设计 `max-elements-on-memory`/`max-bytes-memory` 等上限值时，应按租户数量估算总消耗量（内存与磁盘）。

### `time-to-idle-seconds`/`time-to-live-seconds` 的取值方法

平台并未给出具体秒数・元素数量的「推荐值」。应根据以下几个方面，针对每种缓存数据分别判断：

- **源数据的更新频率**：更新频率低的主数据可将 `time-to-live-seconds` 设置得长一些。更新频率越高，就越需要权衡持续引用旧数据的风险
- **可接受的数据新鲜度**：根据能接受的「从数据库更新到缓存反映」之间的延迟来决定上限。需要立即反映的数据应重新考虑是否采用缓存
- **访问模式**：间歇性访问的数据适合使用 `time-to-idle-seconds`（空闲失效）；持续被访问但需要定期保证新鲜度的数据适合使用 `time-to-live-seconds`（绝对失效）
- **内存预算**：设计 `max-elements-on-memory`（或 `max-bytes-memory`）时，应确保「单条数据大小 × 预计同时缓存的条目数 × 租户数（多租户运行时）」不超过可分配的堆内存。具体估算公式参见下一节

### `max-bytes-memory`/`max-elements-on-memory` 的估算公式

与 `time-to-idle-seconds`/`time-to-live-seconds` 不同，**内存上限（`max-bytes-memory`/`max-elements-on-memory`）平台本身公开了具体的估算公式。** intra-mart Accel Platform 内部使用的缓存（全局导航菜单缓存、IM-Authz 授权缓存）的配置指南中，均以如下形式的公式计算缓存大小：

```
缓存大小（字节） = 单条目平均数据大小 × 预计最大条目数
```

全局导航菜单缓存的计算示例（来自[官方参考文档](https://document.intra-mart.jp/library/iap/public/setup/iap_setup_guide/texts/create_war/configuration_file_dropdown_cache.html)）：

```
缓存大小 = (每个菜单项的内容大小(平均600字节) × 显示的菜单项数
          + 每个菜单文件夹的内容大小(平均150字节) × 显示的菜单文件夹数
          + 全局导航始终输出的固定HTML(700字节))
          × 使用用户数

默认值的计算示例（菜单项数50・菜单文件夹数10・用户数2,000）：
(600 × 50 + 150 × 10 + 700) × 2,000 = 64,400,000 字节（约62MB）→ max-bytes-memory="62M"
```

IM-Authz 的授权缓存（[官方参考文档](https://document.intra-mart.jp/library/iap/public/im_authz/im_authz_specification/texts/appendix/im_ehcache_sizing.html)）中，针对 8 种缓存也分别给出了基于同样思路的公式——「单条目平均字节数 × 预计条目数」（部分含有依据缓存结构而定的附加项）（例如：主体信息缓存为「主体信息平均大小(800字节) × 主体数」）。

**同样的思路也可应用于自建缓存：**

1. 估算每个条目（针对一个键的 `put` 值）的平均数据大小（实际测量序列化后的字节数，或参考结构相近的既有数据类推）
2. 估算预计的最大条目数（键可能取值组合的上限，或实际运行中可能同时持有的条目数）
3. 将上述两者相乘，多租户运行时再乘以租户数（参见前文「多租户环境下的容量」）
4. 将算出的字节数指定给 `max-bytes-memory`；若单条目大小基本恒定，也可直接将预计条目数上限指定给 `max-elements-on-memory`（后者没有大小计算处理的开销，在前文「性能注意事项」提到的性能方面也更有优势）

### 估算每个条目数据大小的实践方法

缓存大小的估算不需要精确一致，通过以下方法即可获得在实务上足够精确的概算值。

#### 方法1：实测序列化后的字节数（最贴近真实情况）

将实际要作为缓存值 `put` 的对象通过 `ObjectOutputStream` 序列化，测量其字节数。

```java
final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
try (ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream)) {
    objectOutputStream.writeObject(sampleValue);
}
final int estimatedBytesPerEntry = byteArrayOutputStream.size();
```

- 应使用与生产环境相当的样本数据进行测量。若使用字段为空的初始状态对象测量，会导致低估
- 测量多条（10～20条左右）具有代表性的数据，不仅确认平均值，也确认最大值。若字段内容导致大小波动较大，应采用偏向最大值的数值而非平均值，以保持安全余量
- 若字段中含有 `List`/`Map` 等集合，大小会因元素数量而大幅波动，应使用能反映元素数量上限的样本进行测量

#### 方法2：根据字段构成进行概算（适用于难以实测的设计阶段）

在无法实测的设计阶段，也可以根据字段类型累加大致的字节数进行概算（仅为参考值，并非精确数值）。

| 类型 | 参考字节数 |
|---|---|
| `boolean`/`byte` | 1 |
| `int`/`float` | 4 |
| `long`/`double` | 8 |
| 对象引用・头部 | 每个字段 8～16 |
| `String` | 字符数 × 2（UTF-16 内部表示）+ 约 40（对象头、长度等开销） |

示例：一个对象含 3 个 `String` 字段（各平均 20 字符）+ 1 个 `long` 字段，`(20 × 2 + 40) × 3 + 8 ≈ 248` 字节。

需注意，该概算值与方法1（序列化后的字节数）并不一致，仅为堆上大小的参考值。**若难以判断，应向偏大的方向估算。** 将缓存大小估算得偏小会增加淘汰（eviction）导致缓存命中率下降，而估算偏大的实际损害仅限于内存的过度分配，因此通常向偏大方向估算更为安全。

#### 预计最大条目数的估算

- 若键的取值种类有限，例如业务数据的 ID：以该 ID 的总数（例如商品主数据的总记录数）作为上限
- 若键在理论上可能无限增长，例如搜索条件的组合：应通过 `max-elements-on-memory` 明确限制条目数上限，超出部分交由 Ehcache 默认的淘汰策略（LRU 等）处理（不应无限制地缓存）

## 与 JSSP（脚本开发模型）的关系

SSJS 版的 `Cache` 类（`d.ts/platform/cache/im-ssjs-cache.d.ts`）是内部同样经过本参考所述的 `CacheManagerFactory.getCacheManager()` → `CacheManager#getCache(cacheName)` 流程的桥接实现。因此 Java 版与 JSSP 版共享相同的缓存配置文件（`WEB-INF/conf/im-ehcache-config/`）与相同的缓存命名空间。JSSP 侧的实现模式由 `jssp-im-cache-usage` 技能负责。

### 值的双向互用仅单方向可行（重要）

共享配置文件与缓存命名空间，**并不意味着存储的值可以在两侧互相读写**。

SSJS 版 `Cache`（实体为 `jp.co.intra_mart.system.javascript.imapi.cache.CacheObject`，`im_cache_js` 模块）的 `put`/`get` 通过 `jp.co.intra_mart.system.jssp.utility.ScriptableSerializer`（`im_jssp` 模块）处理值。

- `put(key, value)`：将 `value`（Rhino 的 `Scriptable`）序列化为字节数组，包装为 `ScriptBinaryObject`（仅持有字节数组的 `Serializable` 类）后存入 Java 侧的 `Cache<K, V>`。**无论值的类型如何，始终以 `ScriptBinaryObject` 形式存储**
- `get(key)`：若取得的值为 `ScriptBinaryObject`，则使用 Rhino 执行作用域从字节数组还原原始值；若不是 `ScriptBinaryObject`，则原样返回

Java（JavaEE 开发模型）侧代码没有 Rhino 执行作用域，因此无法将 JSSP 侧 `put()` 产生的 `ScriptBinaryObject` 还原为原始值。因此：

- **以固定类型从 Java 侧 `Cache<K, V>` 读取 JSSP 侧 `put()` 存入的值会抛出 `ClassCastException`。** 示例（假设 JSSP 侧已执行 `cache.put("key1", "plainString")`）：

  ```java
  final Cache<String, String> cache = cacheManager.getCache(CACHE_NAME);
  final String value = cache.get("key1");
  // java.lang.ClassCastException:
  // class jp.co.intra_mart.system.jssp.utility.ScriptBinaryObject
  // cannot be cast to class java.lang.String
  ```

  以 `Cache<String, Object>` 接收可避免 `ClassCastException`，但取得的值本身就是 `ScriptBinaryObject`（仅持有字节数组的对象），无法作为可用的值使用。

  ```java
  final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
  final Object value = cache.get("key1");
  if (value instanceof String) {
      // 若值是从 JSSP 侧 put() 存入的，不会进入此分支
  } else {
      // 返回的是 ScriptBinaryObject（无法取得可用的值）
  }
  ```

- **Java 侧 `put()` 存入的值（普通的 `Serializable` 对象，例如 `String`）可以从 JSSP 侧的 SSJS `Cache#get()` 正常取得。** 这是因为 `ScriptableSerializer.load()` 在取得的值不是 `ScriptBinaryObject` 时会原样返回

**结论：** Java ↔ JSSP 的缓存值共享仅在 **Java → JSSP 方向** 可行。应避免设计成 Java 侧直接使用 JSSP 侧 `put()` 存入的缓存条目。缓存条目是否存在（`containsKey()`）本身可以从 Java 侧确认，但值的内容无法还原。

在 Java 侧接收值时，若存入方可能是 JSSP 侧，应以 `Cache<K, Object>` 接收并通过 `instanceof` 检查类型，对非预期类型（如 `ScriptBinaryObject`）执行错误处理或记录日志，而不要以固定类型（如 `Cache<K, String>`）接收从而让 `ClassCastException` 直接抛出。
