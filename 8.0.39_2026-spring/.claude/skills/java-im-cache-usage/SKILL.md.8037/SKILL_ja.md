---
name: java-im-cache-usage
description: intra-mart 固有のキャッシュ API（`jp.co.intra_mart.foundation.cache.CacheManager` / `Cache`、`im_cache_base` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。`CacheManagerFactory.getCacheManager()` によるテナント単位のキャッシュマネージャ取得、`Cache<K, V>` の CRUD（get/put/remove/removeAll 等）、キャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/*.xml`）の作成、キャッシュキー・値の `Serializable` 制約を提供する。Java でキャッシュを使いたい、Java で `CacheManager`/`Cache` を使いたい、JavaEE 開発モデルで検索結果やマスタ情報をキャッシュしたい、`im-ehcache-config` の設定ファイルを作りたい、と言及されたときに使用。JSSP（スクリプト開発モデル）で同等の処理を作る場合は SSJS 版の `Cache` API（`d.ts/platform/cache/im-ssjs-cache.d.ts`）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Cache API（Java 版）利用支援スキル

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けのキャッシュ API（`jp.co.intra_mart.foundation.cache.CacheManager` / `Cache`）を使い、Java コードでテナント単位のキャッシュ（検索結果・マスタ情報等の再利用可能なデータ）を実装するためのスキルセット。

## キャッシュ利用の基本方針（最重要）

- キャッシュマネージャの取得は **`CacheManagerFactory.getCacheManager()`（引数なし静的メソッド）のみ**を使う。テナントIDはメソッド内部で実行コンテキストの `AccountContext` から自動解決されるため、アプリケーションコードがテナントIDを意識する必要はない
- `getCacheManager()` は **テナントコンテキストが存在する実行環境**（通常のリクエスト処理・ジョブ実行等）でのみ呼べる。テナントIDが解決できない実行環境で呼ぶと `IllegalStateException` が送出される
- `CacheManager#getCache(String cacheName)` で取得する `Cache<K, V>` の **キー(K)・値(V)は必ず `java.io.Serializable` を実装すること**。実装していない型を渡すとキャッシュ実装（標準では Ehcache）でシリアライズに失敗する
- **キャッシュを使う前に、必ずキャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/*.xml`）でキャッシュ名を定義すること。** 設定ファイルが存在しない、または対応する `cache name` の定義がない場合、動作が保証されない
- `Cache#get()` はキャッシュミス時に `null` を返す（例外は投げない）。呼び出し側は必ず `null` チェックを行い、キャッシュミス時の読み込み処理（キャッシュへの再登録を含む）を実装する
- ライフサイクル管理（`CacheLifecycle#start()` 等）は `CacheManagerFactory` が内部で自動的に行う。アプリケーション側でライフサイクルを意識する必要はない

**このスキルが扱うのは Java ソースファイル（`.java`）とキャッシュ設定ファイル（`.xml`）のみ。** JSSP（`.js`）での実装は、対応する SSJS 版 `Cache` API（`d.ts/platform/cache/im-ssjs-cache.d.ts`）を使うこと（JSSP 版も内部で同じ `CacheManagerFactory`/`CacheManager` を経由するブリッジ実装であり、キャッシュ設定ファイル・キャッシュ名前空間は Java 版と共有される）。

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`.claude/rules` 配下には例外処理を定めた Java 向け専用規約は存在しない。`CacheManagerFactory.getCacheManager()` が送出する `IllegalStateException` の扱いは `assets/cache-basic-usage.md` のパターンに従う。

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## API 概要

`CacheManager` は `jp.co.intra_mart.foundation.cache` パッケージに属し、`CacheManagerFactory.getCacheManager()` によってテナント単位のインスタンスが取得できる。`CacheManager#getCache(cacheName)` で取得する `Cache<K, V>` は `Iterable<Cache.Entry<K, V>>` を実装し、`get`/`put`/`remove`/`removeAll` 等の CRUD メソッドを提供する。標準実装（`im_cache_impl` モジュール）は Ehcache 2.x をバックエンドとする。詳細なシグネチャ・内部構造・キャッシュ設定ファイルの XSD 定義は `reference/cache-api-reference.md` を参照すること（記憶や推測で書かない）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| キャッシュの取得・読み書き（`CacheManagerFactory`/`Cache` の呼び出し） | `assets/cache-basic-usage.md` | `getCache()`/`get()`/`put()`/`remove()`/`removeAll()` の呼び出し例、キャッシュミス時の再読み込みパターン |
| キャッシュ設定ファイルの新規作成 | `assets/cache-basic-usage.md` | `WEB-INF/conf/im-ehcache-config/*.xml` のサンプルと属性の意味 |

### リファレンス

- `reference/cache-api-reference.md` — `CacheManager` / `CacheManagerFactory` / `Cache` / `Cache.Entry` の全メソッド・シグネチャ、キャッシュ設定ファイルの XSD 属性定義（プラットフォーム API の実クラス定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java でキャッシュを使う処理を作って」
- 「JavaEE 開発モデルで `CacheManager`/`Cache` API を使ってマスタ情報をキャッシュしたい」
- 「検索結果を再利用できるようキャッシュしたい」
- 「`im-ehcache-config` の設定ファイルを新規作成したい」
- 「頻繁にアクセスするデータの DB 参照回数を減らしたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの既存実装がどちらのモデルかをユーザに確認する。JSSP（プロコード）の画面・ファンクションコンテナ内でのキャッシュ利用であれば、SSJS 版 `Cache` API（`d.ts/platform/cache/im-ssjs-cache.d.ts`）を使う。

また、**キャッシュの対象がリクエスト単位・セッション単位で完結する一時データの場合**は、`Cache` API はテナント全体で共有される永続的なキャッシュ機構であるため過剰な場合がある。用途がリクエストスコープの一時保持であれば、通常の変数やセッションスコープの仕組みの方が適切なケースがあることをユーザに伝える。

## 実装手順

1. ユーザの要件をヒアリング（キャッシュ対象データの種類・更新頻度、キャッシュキーの設計、有効期限（TTL）の要否、キャッシュ失効時の再読み込み方針）
2. キャッシュ名を決定し、`WEB-INF/conf/im-ehcache-config/` 配下に設定ファイルを新規作成（`reference/cache-api-reference.md` の XSD 属性定義を参照。`name` 属性は `CacheManager#getCache(cacheName)` に渡す値と一致させる）
3. `assets/cache-basic-usage.md` を参照して実装（メソッドのシグネチャは `reference/cache-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. キャッシュキー・値のクラスが `java.io.Serializable` を実装しているか確認
5. `Cache#get()` の戻り値が `null` の場合の再読み込み処理（データソースからの取得 → `put()` によるキャッシュ登録）を実装
6. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **`CacheManagerFactory.getCacheManager()` はテナントコンテキストが存在する実行環境でのみ呼べる。** テナントに紐づかないシステム処理等、`AccountContext` からテナントIDが取得できない実行環境で呼ぶと `IllegalStateException` が送出される。呼び出し元の実行コンテキストを確認すること
- **キャッシュキー・値は `java.io.Serializable` を実装すること。** 未実装の型を渡すと、標準実装（Ehcache）のシリアライズ処理でエラーとなる
- **キャッシュ設定ファイルでキャッシュ名を定義してから `getCache()` を呼ぶこと。** 未定義のキャッシュ名を指定すると、動作が保証されない
- `Cache#get()` はキャッシュミス時に `null` を返し、例外は投げない。**呼び出し側で必ず `null` チェックを行う**こと
- **`enable` 属性の既定値は `false`。** キャッシュ設定ファイルで `enable="true"` を明示しない限りそのキャッシュは有効化されない（[公式リファレンス](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)）
- **キャッシュ名（`name` 属性）に `im_` で始まる名称は使用しないこと。** システムの予約語のため
- キャッシュ設定ファイルの `time-to-idle-seconds`（アイドル時失効）と `time-to-live-seconds`（絶対生存時間）は意味が異なる。更新頻度の低いマスタ情報には `time-to-live-seconds` を長めに、アクセス頻度に応じて失効させたいデータには `time-to-idle-seconds` を使う等、要件に応じて使い分ける。具体的な秒数・上限件数の決め方は `reference/cache-api-reference.md` の「`time-to-idle-seconds`/`time-to-live-seconds` の決め方」を参照
- `max-elements-on-memory` が設定されている場合、`max-bytes-memory` は無効になる（`max-elements-on-disk`/`max-bytes-disk` も同様の関係）。いずれか一方のみを指定すること
- **`max-bytes-memory`/`max-bytes-disk` はオブジェクトのサイズ計算処理を伴うため、多数の参照を持つ大きなオブジェクトをキャッシュする場合はパフォーマンス低下要因になりうる。** その場合は `max-elements-on-memory`/`max-elements-on-disk`（要素数指定）を使うこと
- **マルチテナント運用時、キャッシュ容量はテナントごとに個別に確保される。** `max-bytes-memory` 等の上限値はテナント数を掛け合わせた合計消費量を見積もって設計すること
- キャッシュは複数リクエスト・複数ユーザ間で共有される。**ユーザ固有の機密情報（個人情報・認証情報等）をキャッシュに格納する場合は、テナント間・ユーザ間で意図せず参照されないか設計段階で確認する**
- `Cache` はテナント単位のキャッシュ機構であり、`removeAll()` はそのキャッシュ名に属する全エントリを削除する（他のキャッシュ名には影響しない）
- **JSSP 側の SSJS `Cache` と設定ファイル・キャッシュ名前空間を共有するが、値の相互利用は Java → JSSP 方向のみ実用的である。** JSSP 側で `put()` した値は Rhino のシリアライズ形式（`ScriptBinaryObject`）でラップされて格納されるため、Java 側で型を指定して取得すると `ClassCastException` になる。詳細な原因・回避策は `reference/cache-api-reference.md` の「JSSP（スクリプト開発モデル）との関係」を参照すること

## 生成後の確認

自動検証スクリプトではなく、以下の項目を手動で確認する。

1. キャッシュ設定ファイル（`WEB-INF/conf/im-ehcache-config/*.xml`）の `name` 属性と、Java コード中の `getCache(cacheName)` の引数が一致しているか
2. キャッシュキー・値のクラスが `java.io.Serializable` を実装しているか
3. `Cache#get()` の戻り値の `null` チェックと、キャッシュミス時の再読み込み・再登録処理が実装されているか
4. `CacheManagerFactory.getCacheManager()` を呼び出す実行環境にテナントコンテキストが存在するか（ジョブスケジューラ等、テナントに紐づかない実行環境で呼んでいないか）
5. キャッシュに機密情報を格納する場合、テナント間・ユーザ間の意図しない参照が起きない設計になっているか
6. `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
7. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| SSJS（JSSP）でのキャッシュ実装 | `jssp-im-cache-usage`（SSJS 版 `Cache` API、`d.ts/platform/cache/im-ssjs-cache.d.ts`） |
| **Java（JavaEE 開発モデル）でのキャッシュ実装** | **本スキル** |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java でのアプリケーションロック（`NewLock`） | `java-im-lock-usage` |
| Java での一意 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| 単一 JVM 内に閉じたインメモリキャッシュ（テナント間共有が不要な場合） | 本スキルの対象外（`java.util.concurrent` の標準クラス等を個別実装） |
