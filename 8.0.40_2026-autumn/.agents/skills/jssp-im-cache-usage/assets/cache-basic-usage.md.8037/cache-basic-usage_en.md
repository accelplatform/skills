# Cache API Basic Usage Patterns (JSSP Version)

For the `Cache` class's signature and internal behavior, see `d.ts/platform/cache/im-ssjs-cache.d.ts`. This document shows typical call patterns.
The cache name (e.g., `itemMasterCache`) must already be defined in `WEB-INF/conf/im-ehcache-config/{name}.xml`.

## Pattern 1: Basic Cache Lookup and Registration (Fetch and Register the Source Data on a Cache Miss)

The basic form for caching the result of an expensive operation such as a DB lookup. Null-check the return value of `get()` and fetch the source data only on a miss.

```javascript
/**
 * Gets item master information via the cache.
 * If it is not present in the cache, fetches it from the database and registers it in the cache.
 *
 * @param {string} itemCode - Item code
 * @return {Object} Item information
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
 * Fetches item information from the database.
 *
 * @param {string} itemCode - Item code
 * @return {Object} Item information
 */
function fetchItemInfoFromDatabase(itemCode) {
  let db = new TenantDatabase();
  // In practice, implement the lookup using a 2WaySQL template.
  // See jssp-2way-sql.md for details.
  let result = {};
  return result;
}
```

- `get()` returns `null` on a cache miss rather than throwing an exception. Check it with a strict equality comparison, e.g. `if (cachedItemInfo !== null)`
- Build the cache key from a combination of the target's kind and code, e.g. `'item:' + itemCode`, so it stays unique
- The `itemInfo` passed to `put()` should consist only of a plain object — never include a DB connection object or similar

## Pattern 2: Cache Invalidation (Remove the Corresponding Entry on Data Update)

In an update operation, remove the corresponding cache entry so stale data is not left behind.

```javascript
/**
 * Updates item information and removes the corresponding cache entry.
 *
 * @param {string} itemCode - Item code
 * @param {Object} itemInfo - Item information to update
 */
function updateItemInfo(itemCode, itemInfo) {
  updateItemInfoInDatabase(itemCode, itemInfo);

  // Always remove the cache entry after the data update so stale data is never referenced.
  let cache = new Cache('itemMasterCache');
  cache.remove('item:' + itemCode);
}

/**
 * Updates item information in the database.
 *
 * @param {string} itemCode - Item code
 * @param {Object} itemInfo - Item information to update
 */
function updateItemInfoInDatabase(itemCode, itemInfo) {
  let db = new TenantDatabase();
  // In practice, implement the update using a 2WaySQL template.
}
```

- Remove the cache entry only after the DB update succeeds
- When the key of the item being updated is known, remove it individually with `remove(key)`; do not use `removeAll()`, which would also discard unrelated cache entries

## Pattern 3: Clearing Everything (`removeAll()`, Refreshing a Cache from a Batch Job)

Use this when the entire cache needs to be rebuilt, such as after a bulk update of master data. Intended to be called from a job program (generated with `jssp-im-job-generator`).

```javascript
/**
 * Clears the entire item master cache.
 * Intended to be called after a bulk master-data update batch completes.
 */
function clearItemMasterCache() {
  let cache = new Cache('itemMasterCache');
  cache.removeAll();
}
```

- `removeAll()` removes every entry belonging to that cache name. Use it at a point where the scope of impact is clear, such as when a bulk update completes, rather than calling it on every individual update

## Pattern 4: Designing a Composite Key (a Cache That Includes a Condition Such as Locale)

When caching data whose result depends on a condition — a localized name, for example — include that condition in the key to distinguish results.

```javascript
/**
 * Gets a localized item name via the cache.
 *
 * @param {string} itemCode - Item code
 * @param {string} localeId - Locale ID
 * @return {string} Item name
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

- Building a composite key from an array joined with `join(':')` keeps it readable and makes the delimiter easy to keep consistent
- Limit the conditions included in the key to only those that actually affect the result. Including unrelated conditions (a timestamp, a session ID, etc.) drops the cache hit rate

## Pattern 5: Sharing values with the Java side (one direction only)

Even when the same cache name is shared with the Java (JavaEE development model) `CacheManager`/`Cache` API, **stored values cannot simply be read and written interchangeably between the two sides**. Regardless of the value's type, the SSJS `Cache#put()` always wraps it in Rhino's serialization form (`ScriptBinaryObject`) before storing it in the underlying Java `Cache<K, V>`. Java-side code has no Rhino execution scope, so it has no way to reconstruct that value back into its original type (`String`, etc.).

```javascript
// A value put() from the JSSP side throws ClassCastException when read on the Java side with a fixed type
let cache = new Cache('sharedCache');
cache.put('key1', 'plainString');
// -> On the Java side, receiving cache.get("key1") as Cache<String, String> throws:
//    java.lang.ClassCastException:
//    class jp.co.intra_mart.system.jssp.utility.ScriptBinaryObject cannot be cast to class java.lang.String
```

The opposite direction (reading, from the JSSP side, an ordinary value that Java `put()`) works fine.

```javascript
// Assume the Java side already ran cache.put("key2", "plainJavaString") with an ordinary String
let cache = new Cache('sharedCache');
let value = cache.get('key2');
// value === 'plainJavaString' (retrieved successfully)
```

**If you need to share a value with the Java side, design it so the Java side `put()`s and the JSSP side only reads.** Avoid designs where the Java side directly consumes a cache entry that JSSP `put()` — the entry's existence can be checked from the Java side too, but its content cannot be reconstructed.

## How to Estimate Cache Size (In Practice)

For the `max-bytes-memory`/`max-elements-on-memory` formula (average data size per entry × expected maximum number of entries), see "Estimation formula for `max-bytes-memory`/`max-elements-on-memory`" in `reference/cache-api-reference.md` of the `java-im-cache-usage` skill. This section shows a practical way to estimate the "average data size per entry" on the JSSP side.

### Approximating via JSON String Length

Since SSJS's `Cache` stores values in Rhino's own serialization format (`ScriptBinaryObject`), you cannot measure an exact byte count with `ObjectOutputStream` the way you can on the Java side. As a practical approximation, you may use the string length of `JSON.stringify()` applied to the actual value you plan to `put`.

```javascript
let sampleValue = { itemCode: 'ITM0001', itemName: 'サンプル商品名', price: 1980 };
let estimatedCharacterLength = JSON.stringify(sampleValue).length; // Approximate value (character count)
```

- `JSON.stringify().length` is a character count, and does not match the actual post-serialization byte count (the binary form of Rhino's object graph). When the data includes multibyte characters such as Japanese, the actual byte count can exceed this approximation
- Since this is only a rough guide, build margin into the estimated cache size (for example, use 2-3 times the approximate value as the target for `max-bytes-memory`). Underestimating the cache size increases evictions and lowers the cache hit rate, so when in doubt, it is safer to round up

### Estimating the Expected Maximum Number of Entries

- If the key's possible values are finite, such as a business data ID: use the total count of that ID as the upper bound
- If the key can theoretically be unbounded, such as a combination of search conditions: design it so `max-elements-on-memory` explicitly caps the number of entries, leaving anything beyond that to Ehcache's default eviction policy — never let it cache without limit

## Anti-Patterns (Avoid These)

```javascript
// NG: using the return value of get() without a null check
let cache = new Cache('itemMasterCache');
let itemInfo = cache.get('item:' + itemCode);
console.log(itemInfo.itemName); // TypeError if itemInfo is null

// NG: passing a non-serializable value to put()
let db = new TenantDatabase();
cache.put('dbConnection', db); // a DB connection object cannot be cached

// NG: forgetting to remove the cache entry in an update operation
function updateItemInfo(itemCode, itemInfo) {
  updateItemInfoInDatabase(itemCode, itemInfo);
  // Forgetting to call cache.remove() means stale data keeps being returned until the TTL expires
}

// NG: cache key granularity that is too coarse (a fixed key that ignores the search condition)
let cache = new Cache('searchResultCache');
cache.put('searchResult', result); // reuses the same key even when the search condition differs

// NG: using a cache name that was never defined in a configuration file
let cache = new Cache('undefinedCacheName'); // must be defined under WEB-INF/conf/im-ehcache-config/*.xml

// NG: designing as if the Java side will directly consume a value put() from the JSSP side
// (the Java side cannot reconstruct Rhino's serialization form, so ClassCastException results)
let cache = new Cache('sharedCache');
cache.put('resultForJava', computeResult()); // reading it back as Cache<K, String> on the Java side is NG
```
