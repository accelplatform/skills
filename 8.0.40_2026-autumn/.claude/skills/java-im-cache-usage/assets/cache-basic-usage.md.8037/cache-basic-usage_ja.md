# Cache API 基本利用パターン（Java 版）

`CacheManager`/`Cache` のシグネチャ・内部動作は `reference/cache-api-reference.md` を参照。ここでは典型的な呼び出しパターンを示す。

## パターン1: キャッシュの取得と読み込み（キャッシュミス時の再読み込み）

もっとも基本的な形。`get()` が `null` を返した場合にデータソースから読み込み、`put()` でキャッシュに登録する。

```java
package jp.co.example.foo.service;

import java.io.Serializable;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

import jp.co.example.foo.entity.ProductEntity;
import jp.co.example.foo.repository.ProductRepository;

/**
 * 品目情報の取得処理を提供します。
 */
public class ProductQueryService {

    private static final String CACHE_NAME = "productCache";

    private final ProductRepository productRepository;

    public ProductQueryService(final ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * 品目情報を取得します。<br>
     * キャッシュに存在する場合はキャッシュから返却し、存在しない場合はリポジトリから取得したうえでキャッシュに登録します。
     *
     * @param productCode 品目コード
     * @return 品目情報。存在しない場合 null
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
     * キャッシュに格納する品目情報。
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

- `CacheManagerFactory.getCacheManager()` はテナントコンテキストが存在する実行環境でのみ呼べる（`IllegalStateException` が送出される可能性があるため、呼び出し元の実行環境を確認する）
- キャッシュに格納する値のクラス（`ProductCacheValue`）は **`java.io.Serializable` を実装する**。`serialVersionUID` も定義する
- `cache.get(productCode)` が `null` の場合、キャッシュミスとして扱いデータソースから読み込む。読み込んだ結果を `put()` でキャッシュに登録することで、次回以降のアクセスがキャッシュから返るようになる
- `CACHE_NAME`（`"productCache"`）は、`WEB-INF/conf/im-ehcache-config/*.xml` の `cache` 要素の `name` 属性と一致させる（後述の設定ファイル例を参照）

## パターン2: 複数件の一括取得（`getAll`）

複数キーをまとめて取得したい場合に使う。キャッシュに存在しないキーは戻り値の `Map` に含まれない。

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
        // missedProductCodes に該当する分だけデータソースから取得し、cache.putAll() で登録する処理を続ける
        // （具体的な取得・登録処理は割愛）

        return cachedValueMap;
    }
}
```

- `getAll(keys)` はキャッシュに存在するキーのみを含む `Map` を返す。キャッシュミスしたキーは呼び出し側で判別し、個別に読み込んでから `putAll()` で登録する
- 大量データを毎回 1 件ずつ `get()`/`put()` するより、`getAll()`/`putAll()` でまとめて処理した方が効率が良いケースがある

## パターン3: キャッシュの削除（更新時の整合性確保）

マスタ情報を更新した際、古いキャッシュが残らないよう明示的に削除する。

```java
package jp.co.example.foo.service;

import jp.co.intra_mart.foundation.cache.Cache;
import jp.co.intra_mart.foundation.cache.CacheManager;
import jp.co.intra_mart.foundation.cache.CacheManagerFactory;

public class ProductUpdateService {

    private static final String CACHE_NAME = "productCache";

    /**
     * 品目情報を更新し、対応するキャッシュエントリを削除します。<br>
     * 削除により、次回参照時にデータソースから最新値が読み込まれます。
     *
     * @param productCode 品目コード
     */
    public void update(final String productCode) {
        // productRepository.update(...) 等、データソースの更新処理

        final CacheManager cacheManager = CacheManagerFactory.getCacheManager();
        final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
        cache.remove(productCode);
    }
}
```

- `remove(key)` は該当エントリが存在した場合 `true` を返す（存在しなくても例外は発生しない）
- キャッシュ対象データを更新する処理では、更新と同じトランザクション・処理フローの中でキャッシュの `remove()` を行い、古いキャッシュが参照され続けないようにする
- キャッシュ名に属する全エントリを一括で破棄したい場合は `removeAll()`（引数なし）を使う

## キャッシュ設定ファイルの新規作成

キャッシュを使う前に、`WEB-INF/conf/im-ehcache-config/` 配下に設定ファイル（任意のファイル名の `.xml`）を新規作成し、キャッシュ名を定義する。属性の詳細は `reference/cache-api-reference.md` を参照。

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

- `name` 属性は Java コード中の `CACHE_NAME`（`getCache()` の引数）と一致させる
- `time-to-idle-seconds` / `time-to-live-seconds` は要件に応じて設定する（更新頻度が低いマスタ情報は `time-to-live-seconds` を長めに、アクセス頻度に応じて失効させたいデータは `time-to-idle-seconds` を使う）
- 1 つの設定ファイルに複数の `cache` 要素を定義してもよい（機能単位でファイルを分けるかは任意）

## パターン4: JSSP 側が `put()` した可能性があるキャッシュを読む場合

JSSP 側の SSJS `Cache#put()` が格納した値は、Rhino のシリアライズ形式（`ScriptBinaryObject`）でラップされて格納される。Java 側にはこれを元の値へ復元する手段がないため、型を固定した `Cache<K, V>` で受け取ると `ClassCastException` になる（詳細は `reference/cache-api-reference.md` の「JSSP（スクリプト開発モデル）との関係」を参照）。同一キャッシュ名を JSSP 側と共有していて格納元を保証できない場合は、`Cache<K, Object>` で受け取り `instanceof` で型を確認する。

```java
final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
final Object cachedValue = cache.get(productCode);

if (cachedValue instanceof ProductCacheValue) {
    return (ProductCacheValue) cachedValue;
}
// cachedValue が想定外の型（JSSP 側が put した ScriptBinaryObject 等）の場合はキャッシュミス扱いとし、
// データソースから再取得したうえで put() し直す
```

- 前提として、**Java 側の処理専用のキャッシュ名は JSSP 側と共有しない**設計にするのが最も確実な回避策である。キャッシュ名を分けられない事情がある場合のみ、上記のような型チェックで防御する

## アンチパターン（避けること）

```java
// NG: get() の戻り値が null であることを考慮していない
final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);
final ProductCacheValue value = cache.get(productCode);
value.getProductName(); // value が null の場合 NullPointerException

// NG: キャッシュキー・値のクラスが Serializable を実装していない
public class ProductCacheValue { // implements Serializable が抜けている
    private final String productCode;
    // ...
}

// NG: キャッシュ設定ファイルでキャッシュ名を定義せずに getCache() を呼ぶ
// （"unregisteredCache" が im-ehcache-config 配下のどの設定ファイルにも定義されていない）
final Cache<String, Object> cache = cacheManager.getCache("unregisteredCache");

// NG: テナントコンテキストが存在しない実行環境で getCacheManager() を呼ぶ
// （AccountContext からテナントIDが解決できず IllegalStateException が送出される）
final CacheManager cacheManager = CacheManagerFactory.getCacheManager();

// NG: マスタ情報の更新処理でキャッシュの remove() を行わない（古いキャッシュが残り続ける）
productRepository.update(productEntity);
// cache.remove(productCode) を呼んでいない

// NG: JSSP 側と共有しているキャッシュ名から、型を固定して取得する
// （JSSP 側が put() した値の場合 ClassCastException になる）
final Cache<String, ProductCacheValue> cache = cacheManager.getCache(CACHE_NAME);
final ProductCacheValue value = cache.get(productCode); // ClassCastException の可能性
```
