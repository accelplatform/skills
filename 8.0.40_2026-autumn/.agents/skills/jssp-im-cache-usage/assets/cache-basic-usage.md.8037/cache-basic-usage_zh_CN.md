# Cache API 基本使用模式（JSSP 版）

`Cache` 的签名・内部行为请参考 `d.ts/platform/cache/im-ssjs-cache.d.ts`。本文档展示典型的调用模式。
缓存名（例如 `itemMasterCache`）须预先在 `WEB-INF/conf/im-ehcache-config/{name}.xml` 中定义。

## 模式1：基本的缓存引用与注册（缓存未命中时获取源数据并注册）

缓存 DB 查询等高成本处理结果的基本形式。对 `get()` 的返回值进行 `null` 检查，仅在未命中时获取源数据。

```javascript
/**
 * 通过缓存获取品目主数据信息。
 * 若缓存中不存在，则从数据库获取并注册到缓存中。
 *
 * @param {string} itemCode - 品目代码
 * @return {Object} 品目信息
 */
function getItemInfoWithCache(itemCode) {
  let cache = new Cache('itemMasterCache');
  let cacheKey = 'item:' + itemCode;

  let cachedItemInfo = cache.get(cacheKey);
  if (cachedItemInfo !== null) {
    return cachedItemInfo;
  }

  let itemInfo = fetchItemInfoFromDatabase(itemCode);
  cache.put(cacheKey, itemInfo);

  return itemInfo;
}

/**
 * 从数据库获取品目信息。
 *
 * @param {string} itemCode - 品目代码
 * @return {Object} 品目信息
 */
function fetchItemInfoFromDatabase(itemCode) {
  let db = new TenantDatabase();
  // 实际应使用 2WaySQL 模板实现查询处理
  // 详见 jssp-2way-sql.md
  let result = {};
  return result;
}
```

- `get()` 在缓存未命中时不会抛出异常，而是返回 `null`。应使用严格相等运算符判断，如 `if (cachedItemInfo !== null)`
- 缓存键应通过组合对象类型与代码来保证唯一性，例如 `'item:' + itemCode`
- 传给 `put()` 的 `itemInfo` 应仅由普通对象构成，不应包含 DB 连接对象等内容

## 模式2：缓存失效（数据更新时删除对应条目）

在更新处理中，须删除对应的缓存条目，以避免残留旧数据。

```javascript
/**
 * 更新品目信息，并删除对应的缓存条目。
 *
 * @param {string} itemCode - 品目代码
 * @param {Object} itemInfo - 要更新的品目信息
 */
function updateItemInfo(itemCode, itemInfo) {
  updateItemInfoInDatabase(itemCode, itemInfo);

  // 数据更新后，须删除缓存以避免继续引用旧数据
  let cache = new Cache('itemMasterCache');
  cache.remove('item:' + itemCode);
}

/**
 * 更新数据库中的品目信息。
 *
 * @param {string} itemCode - 品目代码
 * @param {Object} itemInfo - 要更新的品目信息
 */
function updateItemInfoInDatabase(itemCode, itemInfo) {
  let db = new TenantDatabase();
  // 实际应使用 2WaySQL 模板实现更新处理
}
```

- 应在 DB 更新成功后再执行缓存删除
- 若已知更新对象的键，应使用 `remove(key)` 单独删除，不要使用 `removeAll()`（会连带丢失无关的缓存条目）

## 模式3：全部清除（`removeAll()`，在批处理中刷新缓存）

用于主数据批量更新后等需要整体重建缓存的场景。设想从任务程序（通过 `jssp-im-job-generator` 生成）中调用。

```javascript
/**
 * 清除品目主数据缓存的全部内容。
 * 设想在主数据批量更新任务完成后调用。
 */
function clearItemMasterCache() {
  let cache = new Cache('itemMasterCache');
  cache.removeAll();
}
```

- `removeAll()` 会删除属于该缓存名的全部条目。不应在每次单条更新时调用，而应在批量更新处理完成等影响范围明确的场景下使用

## 模式4：复合键设计（包含区域设置等条件的缓存）

在缓存多语言名称等结果因条件而异的数据时，应将条件纳入键中加以区分。

```javascript
/**
 * 通过缓存获取各区域设置下的品目名称。
 *
 * @param {string} itemCode - 品目代码
 * @param {string} localeId - 区域设置ID
 * @return {string} 品目名称
 */
function getItemNameWithCache(itemCode, localeId) {
  let cache = new Cache('itemMasterCache');
  let cacheKey = ['itemName', itemCode, localeId].join(':');

  let cachedItemName = cache.get(cacheKey);
  if (cachedItemName !== null) {
    return cachedItemName;
  }

  let itemName = fetchItemNameFromDatabase(itemCode, localeId);
  cache.put(cacheKey, itemName);

  return itemName;
}
```

- 使用数组 + `join(':')` 组装复合键，可读性更好，也便于统一分隔符
- 纳入键的条件应仅限于会影响结果的条件。若包含时间戳、会话ID等无关条件，会导致缓存命中率下降

## 模式5：与 Java 侧共享值时的注意事项（仅单方向）

即使与 Java（JavaEE 开发模型）侧的 `CacheManager`/`Cache` API 共享同一缓存名，**也不代表存储的值可以在两侧互相读写**。无论值的类型如何，SSJS 版 `Cache#put()` 都会将其以 Rhino 的序列化形式（`ScriptBinaryObject`）包装后存入 Java 侧的 `Cache<K, V>`。Java 侧代码没有 Rhino 执行作用域，因此无法将该值还原为原始类型（`String` 等）。

```javascript
// JSSP 侧 put() 的值，若在 Java 侧以固定类型读取会抛出 ClassCastException
let cache = new Cache('sharedCache');
cache.put('key1', 'plainString');
// → 在 Java 侧以 Cache<String, String> 接收 cache.get("key1") 时会抛出：
//    java.lang.ClassCastException:
//    class jp.co.intra_mart.system.jssp.utility.ScriptBinaryObject cannot be cast to class java.lang.String
```

反方向（在 JSSP 侧读取 Java 侧 `put()` 存入的普通值）可以正常工作。

```javascript
// 假设 Java 侧已通过 cache.put("key2", "plainJavaString") 存入普通的 String
let cache = new Cache('sharedCache');
let value = cache.get('key2');
// value === 'plainJavaString'（可正常取得）
```

**若需要与 Java 侧共享值，应设计为仅由 Java 侧 `put()`、JSSP 侧读取。** 应避免让 Java 侧直接使用 JSSP 侧 `put()` 存入的缓存条目（缓存条目是否存在本身可以从 Java 侧确认，但值的内容无法还原）。

## 缓存大小的估算方法（实践）

`max-bytes-memory`/`max-elements-on-memory` 的计算公式（单条目平均数据大小 × 预计最大条目数）请参考 `java-im-cache-usage` 技能中 `reference/cache-api-reference.md` 的「`max-bytes-memory`/`max-elements-on-memory` 的估算公式」。本节展示在 JSSP 侧估算「单条目平均数据大小」的实践方法。

### 通过 JSON 字符串长度进行概算

由于 SSJS 的 `Cache` 是以 Rhino 自有的序列化形式（`ScriptBinaryObject`）存储值的，无法像 Java 侧那样通过 `ObjectOutputStream` 实测出精确的字节数。作为实务上的概算值，可以使用对实际要 `put` 的值执行 `JSON.stringify()` 后的字符串长度作为参考。

```javascript
let sampleValue = { itemCode: 'ITM0001', itemName: 'サンプル商品名', price: 1980 };
let estimatedCharacterLength = JSON.stringify(sampleValue).length; // 概算值（字符数）
```

- `JSON.stringify().length` 是字符数，与实际序列化后的字节数（Rhino 对象图二进制化后的结果）并不一致。若包含日语等多字节字符，实际字节数可能大于该概算值
- 由于该值仅为参考，估算的缓存大小应留有余量（例如将概算值的 2～3 倍作为 `max-bytes-memory` 的参考值）。将缓存大小估算得偏小会增加淘汰（eviction）导致缓存命中率下降，因此难以判断时向偏大方向估算更为安全

### 预计最大条目数的估算

- 若键的取值种类有限，例如业务数据的 ID：以该 ID 的总数作为上限
- 若键在理论上可能无限增长，例如搜索条件的组合：应通过 `max-elements-on-memory` 明确限制条目数上限，超出部分交由 Ehcache 默认的淘汰策略处理（不应无限制地缓存）

## 反模式（应避免）

```javascript
// NG：未对 get() 的返回值进行 null 检查即使用
let cache = new Cache('itemMasterCache');
let itemInfo = cache.get('item:' + itemCode);
console.log(itemInfo.itemName); // 若 itemInfo 为 null 则发生 TypeError

// NG：将不可序列化的值传给 put()
let db = new TenantDatabase();
cache.put('dbConnection', db); // DB 连接对象不能作为缓存对象

// NG：更新处理中忘记删除缓存
function updateItemInfo(itemCode, itemInfo) {
  updateItemInfoInDatabase(itemCode, itemInfo);
  // 若忘记调用 cache.remove()，旧数据会一直被返回，直到 TTL 到期
}

// NG：缓存键粒度过粗（忽略搜索条件的固定键）
let cache = new Cache('searchResultCache');
cache.put('searchResult', result); // 即使搜索条件不同也会复用同一个键

// NG：未在配置文件中定义缓存名即使用
let cache = new Cache('undefinedCacheName'); // 须在 WEB-INF/conf/im-ehcache-config/*.xml 中定义

// NG：设计为 Java 侧直接使用 JSSP 侧 put() 存入的值
// （Java 侧无法还原 Rhino 的序列化形式，将抛出 ClassCastException）
let cache = new Cache('sharedCache');
cache.put('resultForJava', computeResult()); // 让 Java 侧以 Cache<K, String> 等类型读取属于 NG 设计
```
