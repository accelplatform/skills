# Cache API 基本利用パターン（JSSP 版）

`Cache` のシグネチャ・内部動作は `d.ts/platform/cache/im-ssjs-cache.d.ts` を参照。ここでは典型的な呼び出しパターンを示す。
キャッシュ名（例: `itemMasterCache`）は事前に `WEB-INF/conf/im-ehcache-config/{name}.xml` へ定義しておくこと。

## パターン1: 基本のキャッシュ参照・登録（キャッシュミス時に元データを取得して登録）

DB 参照など、コストの高い処理結果をキャッシュする基本形。`get()` の戻り値を `null` チェックし、ミス時のみ元データを取得する。

```javascript
/**
 * 品目マスタの情報をキャッシュ経由で取得します。
 * キャッシュに存在しない場合は、データベースから取得してキャッシュに登録します。
 *
 * @param {string} itemCode - 品目コード
 * @return {Object} 品目情報
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
 * データベースから品目情報を取得します。
 *
 * @param {string} itemCode - 品目コード
 * @return {Object} 品目情報
 */
function fetchItemInfoFromDatabase(itemCode) {
  let db = new TenantDatabase();
  // 実際は 2WaySQL テンプレートを使用した検索処理を実装する
  // 詳細は jssp-2way-sql.md を参照
  let result = {};
  return result;
}
```

- `get()` はキャッシュミス時に例外を投げず `null` を返す。`if (cachedItemInfo !== null)` のように厳密等価演算子で判定する
- キャッシュキーは `'item:' + itemCode` のように、対象の種類とコードを組み合わせて一意にする
- `put()` に渡す `itemInfo` はプレーンオブジェクトのみで構成し、DB 接続オブジェクト等を含めない

## パターン2: キャッシュの無効化（データ更新時に対応するエントリを削除）

更新処理では、キャッシュに古いデータが残り続けないよう、対応するキャッシュエントリを削除する。

```javascript
/**
 * 品目情報を更新し、対応するキャッシュエントリを削除します。
 *
 * @param {string} itemCode - 品目コード
 * @param {Object} itemInfo - 更新する品目情報
 */
function updateItemInfo(itemCode, itemInfo) {
  updateItemInfoInDatabase(itemCode, itemInfo);

  // データ更新後は、古いキャッシュを参照し続けないよう必ず削除する
  let cache = new Cache('itemMasterCache');
  cache.remove('item:' + itemCode);
}

/**
 * データベースの品目情報を更新します。
 *
 * @param {string} itemCode - 品目コード
 * @param {Object} itemInfo - 更新する品目情報
 */
function updateItemInfoInDatabase(itemCode, itemInfo) {
  let db = new TenantDatabase();
  // 実際は 2WaySQL テンプレートを使用した更新処理を実装する
}
```

- キャッシュの削除は、DB 更新が成功した後に実行する
- 更新対象のキーが分かっている場合は `remove(key)` で個別に削除し、`removeAll()` は使わない（無関係なキャッシュエントリまで失われるため）

## パターン3: 全件クリア（`removeAll()`、バッチ処理でのキャッシュリフレッシュ）

マスタデータの一括更新後など、キャッシュ全体を洗い替えたい場合に使用する。ジョブプログラム（`jssp-im-job-generator` で生成）からの呼び出しを想定。

```javascript
/**
 * 品目マスタキャッシュを全件クリアします。
 * マスタデータの一括更新バッチの完了後に呼び出す想定です。
 */
function clearItemMasterCache() {
  let cache = new Cache('itemMasterCache');
  cache.removeAll();
}
```

- `removeAll()` は当該キャッシュ名に属する全エントリを削除する。個別更新のたびに呼び出すのではなく、一括更新処理の完了時など影響範囲が明確な場面で使用する

## パターン4: 複合キーの設計（ロケール等の条件を含むキャッシュ）

多言語対応した名称等、条件によって結果が変わるデータをキャッシュする場合は、条件をキーに含めて区別する。

```javascript
/**
 * ロケールごとの品目名称をキャッシュ経由で取得します。
 *
 * @param {string} itemCode - 品目コード
 * @param {string} localeId - ロケールID
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

- 複合キーは配列 + `join(':')` で組み立てると読みやすく、区切り文字の統一もしやすい
- キーに含める条件は、結果に影響する条件のみに絞る。無関係な条件（タイムスタンプ、セッションID等）を含めるとキャッシュヒット率が低下する

## パターン5: Java 側と値を共有する場合の注意（片方向のみ）

同一キャッシュ名を Java（JavaEE 開発モデル）側の `CacheManager`/`Cache` API と共有していても、**格納した値をそのまま相互に読み書きできるわけではない**。SSJS 版 `Cache#put()` は値の型を問わず、常に Rhino のシリアライズ形式（`ScriptBinaryObject`）でラップして Java 側の `Cache<K, V>` に格納する。Java 側のコードは Rhino の実行スコープを持たないため、この値を元の型（`String` 等）へ復元する手段がない。

```javascript
// JSSP 側で put() した値は、Java 側から型を指定して取得すると ClassCastException になる
let cache = new Cache('sharedCache');
cache.put('key1', 'plainString');
// → Java 側で cache.get("key1") を Cache<String, String> として受け取ると
//    java.lang.ClassCastException:
//    class jp.co.intra_mart.system.jssp.utility.ScriptBinaryObject cannot be cast to class java.lang.String
```

逆方向（Java 側で `put()` した通常の値を JSSP 側で読む）は問題なく動作する。

```javascript
// Java 側で cache.put("key2", "plainJavaString") のように通常の String を put() 済みとする
let cache = new Cache('sharedCache');
let value = cache.get('key2');
// value === 'plainJavaString'（正常に取得できる）
```

**Java 側と値を共有したい場合は、Java 側で `put()` し JSSP 側で読む方向のみで設計すること。** JSSP 側で `put()` したキャッシュを Java 側で直接利用する設計は避ける（キャッシュエントリの存在自体は Java 側からも確認できるが、値の中身は復元できない）。

## キャッシュサイズの見積もり方（実践）

`max-bytes-memory`/`max-elements-on-memory` の計算式（1 エントリあたりの平均データサイズ × 想定最大エントリ数）は `java-im-cache-usage` スキルの `reference/cache-api-reference.md`「`max-bytes-memory`/`max-elements-on-memory` の見積もり式」を参照。ここでは JSSP 側で「1 エントリあたりの平均データサイズ」を見積もる際の実践的な方法を示す。

### JSON 文字列長による概算

SSJS の `Cache` は値を Rhino 独自のシリアライズ形式（`ScriptBinaryObject`）で格納するため、Java 側のように `ObjectOutputStream` で正確なバイト数を実測することはできない。実務上の概算値としては、実際に `put` する値を `JSON.stringify()` した文字列長を目安として使ってよい。

```javascript
let sampleValue = { itemCode: 'ITM0001', itemName: 'サンプル商品名', price: 1980 };
let estimatedCharacterLength = JSON.stringify(sampleValue).length; // 概算値（文字数）
```

- `JSON.stringify().length` は文字数であり、実際のシリアライズ後のバイト数（Rhino のオブジェクトグラフをバイナリ化したもの）とは一致しない。日本語等のマルチバイト文字を含む場合、実際のバイト数はこの概算値より大きくなりうる
- あくまで目安であるため、見積もったキャッシュサイズには余裕を持たせること（例えば概算値の 2〜3 倍を `max-bytes-memory` の目安にする等）。キャッシュサイズを実際より小さく見積もるとエビクション（追い出し）が増えてキャッシュヒット率が下がるため、迷う場合は大きめに倒す方が安全である

### 想定最大エントリ数の見積もり

- キーが業務データの ID 等、値の種類が有限な場合: その ID の総数を上限とする
- キーが検索条件の組み合わせ等、理論上無制限になりうる場合: `max-elements-on-memory` で上限件数を明示的に制限し、超過分は Ehcache 既定のエビクションポリシーに委ねる設計にする（無制限にキャッシュさせない）

## アンチパターン（避けること）

```javascript
// NG: get() の戻り値を null チェックせずに使用する
let cache = new Cache('itemMasterCache');
let itemInfo = cache.get('item:' + itemCode);
console.log(itemInfo.itemName); // itemInfo が null の場合 TypeError

// NG: シリアライズ不可能な値を put() に渡す
let db = new TenantDatabase();
cache.put('dbConnection', db); // DB 接続オブジェクトはキャッシュ対象にできない

// NG: 更新処理でキャッシュの削除を忘れる
function updateItemInfo(itemCode, itemInfo) {
  updateItemInfoInDatabase(itemCode, itemInfo);
  // cache.remove() を呼び忘れると、TTL が切れるまで古いデータが返り続ける
}

// NG: キャッシュキーの粒度が粗すぎる（検索条件を無視した固定キー）
let cache = new Cache('searchResultCache');
cache.put('searchResult', result); // 検索条件が異なっても同じキーを使い回してしまう

// NG: 設定ファイルにキャッシュ名を定義せずに使用する
let cache = new Cache('undefinedCacheName'); // WEB-INF/conf/im-ehcache-config/*.xml に定義が必要

// NG: JSSP 側で put() した値を Java 側が直接使う前提で設計する
// （Java 側は Rhino のシリアライズ形式を復元できず ClassCastException になる）
let cache = new Cache('sharedCache');
cache.put('resultForJava', computeResult()); // Java 側の Cache<K, String> 等で読む設計は NG
```
