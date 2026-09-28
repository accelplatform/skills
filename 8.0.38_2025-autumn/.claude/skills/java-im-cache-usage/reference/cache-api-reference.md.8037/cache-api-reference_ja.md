# Cache API リファレンス（Java 版）

intra-mart Accel Platform コアソース（`im_cache_base` / `im_cache_impl` モジュール）の実クラス定義に基づく。記憶や推測でメソッドを補わないこと。

## パッケージ構成

```
jp.co.intra_mart.foundation.cache
├── CacheManager         … キャッシュマネージャの公開インタフェース
├── CacheManagerFactory  … CacheManager を取得するためのファクトリクラス（アプリケーションコードはここのみ使用）
└── Cache                … 個々のキャッシュを表す公開インタフェース（Cache.Entry を内包）

jp.co.intra_mart.foundation.cache.exception
└── CacheException       … 非チェック例外（RuntimeException を継承）
```

標準実装（`im_cache_impl` モジュール）は `EhcacheManagerProvider` として提供され、`ServiceLoader` 経由で解決される。Ehcache 2.x をバックエンドとする。

## `CacheManager` インタフェース

```java
package jp.co.intra_mart.foundation.cache;

public interface CacheManager {

    /** 名前（テナントID）を取得します。 */
    String getName();

    /** キャッシュ一覧を取得します。 */
    Iterable<Cache<?, ?>> getCaches();

    /**
     * 指定された名前のキャッシュを取得します。<br>
     * キャッシュキー(K)及びキャッシュの値(V)に関しては java.io.Serializable インタフェースを
     * 実装している必要があります。
     *
     * @param cacheName キャッシュ名
     * @return 指定された名前のキャッシュ
     */
    <K, V> Cache<K, V> getCache(String cacheName);
}
```

- `getCache(cacheName)` の `cacheName` は、キャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/*.xml`）の `cache` 要素の `name` 属性と対応する
- 型パラメータ `K`（キー）・`V`（値）は呼び出し側の変数宣言で決まる（メソッド自体はジェネリックメソッド）。**`K`・`V` は `java.io.Serializable` を実装している必要がある**

## `CacheManagerFactory` クラス

```java
package jp.co.intra_mart.foundation.cache;

public final class CacheManagerFactory {

    /**
     * キャッシュマネージャを取得します。<br>
     * 実行コンテキストの AccountContext からテナントIDを解決し、そのテナントに対応する
     * CacheManager インスタンスを返します。
     *
     * @return キャッシュマネージャ
     * @throws IllegalStateException テナントIDが解決できない実行環境で呼び出した場合
     */
    public static CacheManager getCacheManager();
}
```

- **アプリケーションコードが呼び出せるのは、引数なしの `getCacheManager()` のみ。** テナントIDを直接指定するオーバーロードは package-private のため、アプリケーションコードから呼び出せない
- 内部でテナントIDに紐づく `CacheManager` インスタンスをキャッシュ・管理する。ライフサイクル（`CacheLifecycle#start()` 相当の初期化処理）も内部で自動的に行われるため、アプリケーション側でライフサイクル管理を意識する必要はない
- `getCacheManager()` は、実行コンテキストの `AccountContext` からテナントIDが解決できる場合にのみ正常に動作する。テナントに紐づかないシステム処理等、テナントIDが解決できない実行環境で呼び出すと `IllegalStateException` を送出する

## `Cache<K, V>` インタフェース

```java
package jp.co.intra_mart.foundation.cache;

public interface Cache<K, V> extends Iterable<Cache.Entry<K, V>> {

    /** このキャッシュの名前を取得します。 */
    String getName();

    /** 指定されたキーがキャッシュに存在するか判定します。 */
    boolean containsKey(K key);

    /**
     * 指定されたキーに対応する値を取得します。
     * @return 値。キャッシュに存在しない場合 null
     */
    V get(K key);

    /**
     * 指定された複数のキーに対応する値をまとめて取得します。<br>
     * キャッシュに存在しないキーは戻り値の Map に含まれません。
     */
    Map<K, V> getAll(Set<? extends K> keys);

    /** 指定されたキーに値を登録します。既存のキーの場合は上書きします。 */
    void put(K key, V value);

    /** 複数のキーと値をまとめて登録します。 */
    void putAll(Map<? extends K, ? extends V> map);

    /**
     * 指定されたキーのエントリを削除します。
     * @return 削除した場合 true。該当するキーが存在しなかった場合 false
     */
    boolean remove(K key);

    /** 指定された複数のキーのエントリを削除します。 */
    void removeAll(Set<? extends K> keys);

    /** このキャッシュに属する全エントリを削除します。 */
    void removeAll();

    /** このキャッシュの全エントリに対するイテレータを取得します（Iterable の実装）。 */
    @Override
    Iterator<Cache.Entry<K, V>> iterator();

    /**
     * キャッシュの1エントリ（キーと値の組）を表します。
     */
    interface Entry<K, V> {
        K getKey();
        V getValue();
    }
}
```

- `Cache` 自体が `Iterable<Cache.Entry<K, V>>` を実装しているため、拡張 for 文でエントリを走査できる（`for (final Cache.Entry<String, V> entry : cache) { ... }`）
- `get(key)` はキャッシュミス時に **`null` を返す**（例外を投げない）。呼び出し側で必ず `null` チェックを行うこと
- `put(key, value)` は既存キーであれば値を上書きする（例外は発生しない）
- `remove(key)` は削除に成功した場合（該当エントリが存在した場合）`true` を返す。該当エントリが存在しなかった場合は `false` を返す（例外は発生しない）
- `removeAll()`（引数なし）はこの `Cache` インスタンスが表すキャッシュ名に属する全エントリを削除する。他のキャッシュ名には影響しない

## `CacheException`

```java
package jp.co.intra_mart.foundation.cache.exception;

public class CacheException extends RuntimeException {
    // 非チェック例外。キャッシュ実装内部でのエラー（設定不正・シリアライズ失敗等）発生時に送出され得る
}
```

- `RuntimeException` を継承する非チェック例外
- `Cache`/`CacheManager` インタフェースのメソッドシグネチャ上は `throws` 宣言されていない（非チェック例外のため宣言不要）が、キャッシュ設定不正やシリアライズ失敗等の実装内部エラーによって送出される可能性がある

## キャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/{任意のファイル名}.xml`）

XSD スキーマ（`im-ehcache-config.xsd`、名前空間 `http://www.intra-mart.jp/cache/ehcache/config`）に基づく `cache` 要素の属性定義:

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

| 属性 | 型 | 既定値 | 意味 |
|---|---|---|---|
| `name`（必須） | string | - | キャッシュ名。`CacheManager#getCache(cacheName)` に渡す値と一致させる。**`im_` で始まる名称はシステムの予約語のため使用しないこと**（[公式リファレンス](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)） |
| `enable` | boolean | `false` | キャッシュの有効・無効を制御する。**既定値は `false`** のため、キャッシュを機能させるには明示的に `enable="true"` を指定すること |
| `time-to-idle-seconds` | integer | `0` | アイドル時間（秒）。指定された時間、対象のオブジェクトが参照されなければ破棄される |
| `time-to-live-seconds` | integer | `0` | 生存期間（秒）。登録から指定された生存期間を超えた場合、そのオブジェクトは破棄される |
| `max-elements-on-memory` | integer | `0` | メモリ上にキャッシュするオブジェクトの最大数 |
| `max-elements-on-disk` | integer | `0` | ディスク上のキャッシュオブジェクトの最大数 |
| `max-bytes-memory` | string（バイト数指定、`1k`/`10M`/`50G` 等の表記可） | `0` | メモリ上にオブジェクトを格納する際の最大サイズ。**`max-elements-on-memory` が設定されている場合、この属性は無効**（`max-elements-on-memory` が優先される） |
| `max-bytes-disk` | string（バイト数指定） | `0` | ディスク上にオブジェクトを格納する際の最大サイズ。`max-elements-on-disk` との優先関係は `max-bytes-memory` と同じ |
| `overflow-to-disk` | boolean | `false` | メモリ上限超過分をディスクへオーバーフローさせるか |

- 属性を省略した場合、テナント共通のデフォルト設定（`default-cache` 要素、別ファイルで定義）にフォールバックする。デフォルト設定ファイル自体の変更は本スキルの対象外（通常のアプリケーション開発ではキャッシュ単位の設定ファイルを追加するだけでよい）
- 設定ファイルが存在しない、または対応する `cache name` の定義がない場合、`getCache()` の呼び出し自体は例外を送出しないことがあるが、キャッシュとして機能しない、または初期化エラーになり得る。**キャッシュを使う前に必ず設定ファイルでキャッシュ名を定義すること**
- 1 つの設定ファイルに複数の `cache` 要素を定義できる

### `max-bytes-memory`/`max-bytes-disk` のパフォーマンス上の注意

[公式リファレンス](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)によれば、`max-bytes-memory` / `max-bytes-disk` を設定した場合、格納するオブジェクトのサイズ計算処理が行われる。**登録するオブジェクトが大量の参照を持つ場合、この計算処理に時間がかかりパフォーマンス低下の原因となりうる。** 大きなオブジェクト（多数のフィールド・ネストしたコレクションを持つエンティティ等）をキャッシュする場合は、`max-bytes-memory`/`max-bytes-disk` の代わりに `max-elements-on-memory`/`max-elements-on-disk`（要素数での上限指定）を使うこと。

### マルチテナント環境での容量

[公式リファレンス](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)によれば、バーチャルテナントによる複数テナント運用の場合、**キャッシュ容量はテナントごとに個別に確保される**（例: `max-bytes-memory="60M"` を 2 テナントで運用する場合、合計容量は 120M になる）。`max-elements-on-memory`/`max-bytes-memory` 等の上限値を設計する際は、テナント数を掛け合わせた合計消費量（メモリ・ディスク）を見積もること。

### `time-to-idle-seconds`/`time-to-live-seconds` の決め方

具体的な秒数・件数の「推奨値」はプラットフォーム側で示されていない。以下の観点から、キャッシュ対象データの性質に応じて個別に判断すること。

- **元データの更新頻度**: 更新頻度が低いマスタ情報は `time-to-live-seconds` を長めに設定してよい。更新頻度が高いデータほど、古いデータを参照し続けるリスクとのトレードオフになる
- **許容できるデータの鮮度**: DB 更新からキャッシュへ反映されるまでの遅延をどこまで許容できるかで上限を決める。即時反映が必要なデータはキャッシュ自体の採用を再検討する
- **アクセスパターン**: 断続的にアクセスされるデータは `time-to-idle-seconds`（アイドル失効）、常時アクセスされるが定期的に鮮度を保証したいデータは `time-to-live-seconds`（絶対失効）が向く
- **メモリ予算**: `max-elements-on-memory`（または `max-bytes-memory`）は、1 件あたりのデータサイズ × 想定同時キャッシュ件数 × テナント数（マルチテナント運用時）が、割り当て可能なヒープメモリに収まるように設計する。具体的な見積もり式は次項を参照

### `max-bytes-memory`/`max-elements-on-memory` の見積もり式

`time-to-idle-seconds`/`time-to-live-seconds` と異なり、**メモリ上限（`max-bytes-memory`/`max-elements-on-memory`）はプラットフォーム自身が具体的な見積もり式を公開している。** intra-mart Accel Platform が内部で使用するキャッシュ（グローバルナビゲーションメニューキャッシュ、IM-Authz 認可キャッシュ）の設定ガイドで、いずれも以下の形式の式でキャッシュサイズを算出している：

```
キャッシュサイズ（バイト） = 1 エントリあたりの平均データサイズ × 想定される最大エントリ数
```

グローバルナビゲーションメニューキャッシュの計算例（[公式リファレンス](https://document.intra-mart.jp/library/iap/public/setup/iap_setup_guide/texts/create_war/configuration_file_dropdown_cache.html)より）:

```
キャッシュサイズ = (各メニューアイテムの内容サイズ(平均600byte) × 表示されるメニューアイテム数
                  + 各メニューフォルダの内容サイズ(平均150byte) × 表示されるメニューフォルダ数
                  + グローバルナビが常に出力する固定HTML(700byte))
                  × 利用ユーザ数

デフォルト値の計算例（メニューアイテム数50・メニューフォルダ数10・ユーザ数2,000の想定）:
(600 × 50 + 150 × 10 + 700) × 2,000 = 64,400,000 バイト（約62MB）→ max-bytes-memory="62M"
```

IM-Authz の認可キャッシュ（[公式リファレンス](https://document.intra-mart.jp/library/iap/public/im_authz/im_authz_specification/texts/appendix/im_ehcache_sizing.html)）でも、キャッシュの種類ごとに「1 エントリあたりの平均バイト数 × 想定件数」（一部はキャッシュ構造に応じた加算項を含む）という同じ考え方の式が、8 種類のキャッシュそれぞれについて示されている（例: サブジェクト情報のキャッシュは「サブジェクト情報の平均サイズ(800byte) × サブジェクト数」）。

**自作のキャッシュにも同じ考え方を適用できる:**

1. 1 エントリ（1 キーに対する `put` 値）あたりの平均データサイズを見積もる（実際にシリアライズした際のバイト数を実測するか、近い構造の既存データから類推する）
2. 想定される最大エントリ数（キーが取りうる組み合わせの上限、または実運用で同時に保持されうる件数）を見積もる
3. 上記 2 つを掛け合わせ、マルチテナント運用の場合はさらにテナント数を掛ける（前項「マルチテナント環境での容量」参照）
4. 算出したバイト数を `max-bytes-memory` に指定するか、1 エントリのサイズがほぼ一定であれば `max-elements-on-memory` に想定エントリ数の上限をそのまま指定する（後者はサイズ計算処理のオーバーヘッドが無い分、前項「パフォーマンス上の注意」で触れた性能面でも有利）

### 1 エントリあたりのデータサイズを見積もる実践的な方法

キャッシュサイズの見積もりは厳密な一致を必要としないため、以下の方法で実務上十分な精度の概算値を得られる。

#### 方法1: シリアライズしたバイト数を実測する（最も実態に近い）

キャッシュする値として実際に `put` するオブジェクトを `ObjectOutputStream` でシリアライズし、バイト数を計測する。

```java
final ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
try (ObjectOutputStream objectOutputStream = new ObjectOutputStream(byteArrayOutputStream)) {
    objectOutputStream.writeObject(sampleValue);
}
final int estimatedBytesPerEntry = byteArrayOutputStream.size();
```

- 本番相当のサンプルデータで計測すること。フィールドが空の初期状態のオブジェクトで計測すると過小評価になる
- 代表的なデータを複数件（10〜20 件程度）計測し、平均値だけでなく最大値も確認する。フィールド内容によってサイズが大きくばらつく場合は、平均値ではなく最大値寄りの値を採用し安全側に倒す
- `List`/`Map` 等のコレクションをフィールドに持つ場合は要素数によってサイズが大きく変動するため、要素数の上限を意識したサンプルで計測する

#### 方法2: フィールド構成からの概算（実測が難しい設計段階向け）

実測できない設計段階では、フィールドの型から大まかなバイト数を積み上げて概算してもよい（あくまで目安であり、厳密な値ではない）。

| 型 | 目安バイト数 |
|---|---|
| `boolean`/`byte` | 1 |
| `int`/`float` | 4 |
| `long`/`double` | 8 |
| オブジェクト参照・ヘッダ | 1 フィールドあたり 8〜16 |
| `String` | 文字数 × 2（UTF-16 内部表現）+ 40 程度（オブジェクトヘッダ・長さ等のオーバーヘッド） |

例: `String` フィールド 3 つ（各平均 20 文字）+ `long` フィールド 1 つを持つオブジェクトの場合、`(20 × 2 + 40) × 3 + 8 ≒ 248` バイト。

この概算値は方法1（シリアライズ後のバイト数）とは一致しない、あくまでヒープ上のサイズの目安である点に注意する。**見積もりに迷う場合は大きめに倒すこと。** キャッシュサイズを実際より小さく見積もるとエビクション（追い出し）が増えてキャッシュヒット率が下がるのに対し、大きく見積もった場合の実害はメモリの過剰確保に留まるため、通常は大きめに倒す方が安全である。

#### 想定最大エントリ数の見積もり

- キーが業務データの ID 等、値の種類が有限な場合: その ID の総数（例: 商品マスタの全件数）を上限とする
- キーが検索条件の組み合わせ等、理論上無制限になりうる場合: `max-elements-on-memory` で上限件数を明示的に制限し、超過分は Ehcache 既定のエビクションポリシー（LRU 等）に委ねる設計にする（無制限にキャッシュさせない）

## JSSP（スクリプト開発モデル）との関係

SSJS 版の `Cache` クラス（`d.ts/platform/cache/im-ssjs-cache.d.ts`）は、内部で本リファレンスと同じ `CacheManagerFactory.getCacheManager()` → `CacheManager#getCache(cacheName)` の流れを経由するブリッジ実装である。そのため、Java 版と JSSP 版は同じキャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/`）・同じキャッシュ名前空間を共有する。JSSP 側の実装パターンは `jssp-im-cache-usage` スキルが担当する。

### 値の相互利用は片方向のみ（重要）

設定ファイル・キャッシュ名前空間を共有していても、**格納した値をそのまま相互に読み書きできるわけではない**。

SSJS 版 `Cache`（実体: `jp.co.intra_mart.system.javascript.imapi.cache.CacheObject`、`im_cache_js` モジュール）の `put`/`get` は、値を `jp.co.intra_mart.system.jssp.utility.ScriptableSerializer`（`im_jssp` モジュール）経由で処理する。

- `put(key, value)`: `value` を Rhino の `Scriptable` としてバイト列にシリアライズし、`ScriptBinaryObject`（バイト列を保持するだけの `Serializable` クラス）でラップした上で Java 側の `Cache<K, V>` に格納する。**値の型を問わず、常に `ScriptBinaryObject` として格納される**
- `get(key)`: 取得した値が `ScriptBinaryObject` であれば、Rhino の実行スコープを使ってバイト列から元の値を復元して返す。`ScriptBinaryObject` でなければそのまま返す

Java（JavaEE 開発モデル）側のコードは Rhino の実行スコープを持たないため、JSSP 側が `put()` した `ScriptBinaryObject` を元の値へ復元する手段がない。そのため:

- **JSSP 側で `put()` した値を、型を指定して Java 側の `Cache<K, V>` から取得すると `ClassCastException` になる。** 例（JSSP 側で `cache.put("key1", "plainString")` を実行済みとする）:

  ```java
  final Cache<String, String> cache = cacheManager.getCache(CACHE_NAME);
  final String value = cache.get("key1");
  // java.lang.ClassCastException:
  // class jp.co.intra_mart.system.jssp.utility.ScriptBinaryObject
  // cannot be cast to class java.lang.String
  ```

  `Cache<String, Object>` として受け取れば `ClassCastException` は避けられるが、得られる値は `ScriptBinaryObject`（バイト列を保持するだけのオブジェクト）であり、実用的な値としては取り出せない。

  ```java
  final Cache<String, Object> cache = cacheManager.getCache(CACHE_NAME);
  final Object value = cache.get("key1");
  if (value instanceof String) {
      // JSSP 側が put した値の場合、ここには到達しない
  } else {
      // ScriptBinaryObject が返る（実用的な値は取得できない）
  }
  ```

- **Java 側で `put()` した値（通常の `Serializable` オブジェクト、例えば `String`）は、JSSP 側の SSJS `Cache#get()` から正常に取得できる。** `ScriptableSerializer.load()` は、取得した値が `ScriptBinaryObject` でなければそのまま返す実装のため

**結論:** Java ↔ JSSP のキャッシュ値共有は **Java → JSSP 方向のみ実用的**である。JSSP 側で `put()` したキャッシュを Java 側で直接利用する設計は避けること。キャッシュエントリの存在確認（`containsKey()`）自体は Java 側からも行えるが、値の中身は復元できない。

Java 側で値を受け取る際、格納元が JSSP 側である可能性がある場合は `Cache<K, Object>` で受け取り `instanceof` で型を確認し、想定外の型（`ScriptBinaryObject` 等）であればエラー処理またはログ出力に倒す（型を固定した `Cache<K, String>` 等で受け取って `ClassCastException` を直接送出させない）。
