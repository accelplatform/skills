---
name: jssp-im-cache-usage
description: intra-mart が提供する SSJS `Cache` クラス（`d.ts/platform/cache/im-ssjs-cache.d.ts`）を JSSP（スクリプト開発モデル）のファンクションコンテナで使用するためのスキルセット。`WEB-INF/conf/im-ehcache-config/{name}.xml` によるキャッシュ設定（TTL・最大要素数等）、`get`/`put`/`remove`/`removeAll` の基本パターン、キャッシュキー設計、シリアライズ可能な値のみキャッシュ対象にできるという制約を提供する。キャッシュを使いたい、キャッシュ機能を実装したい、Cache クラスを使いたい、SSJS でキャッシュしたい、繰り返し発生する処理をキャッシュして高速化したい、と言及されたときに使用。Java（JavaEE 開発モデル）で同等の処理を作る場合は `java-im-cache-usage` を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart SSJS Cache API 利用支援スキル

## 目的

intra-mart Accel Platform がスクリプト開発モデル（JSSP）向けに提供する SSJS `Cache` クラス（8.0.37 (2025 Spring) 以降）を使い、ファンクションコンテナ内でサーバサイドキャッシュを実装するためのスキルセット。

`Cache` はファンクションコンテナ（`.js`）から利用する API であり、プレゼンテーションページ（`.html`）側で直接使用するものではない。DB 参照結果や計算コストの高い処理結果など、リクエストをまたいで再利用できるデータをキャッシュし、処理時間を短縮する用途で使う。

## 参照すべき規約

本スキルはファンクションコンテナ（`.js`）内のキャッシュ利用コードを生成する。全体像は `.claude/rules/README.md` の「規約ファイル一覧」を参照。

| 規約 | 取り扱い |
|------|---------|
| `.claude/rules/jssp-function-container.md` | 🟢 **必読** — `init()` 構造・関数分割方針 |
| `.claude/rules/jssp-naming.md` / `.claude/rules/jssp-code-style.md` / `.claude/rules/jssp-file-structure.md` | 🟢 必読 |
| `.claude/rules/jssp-error-handling.md` | 🟢 必読 — キャッシュ元データ取得処理（DB アクセス等）のエラーハンドリング |
| `.claude/rules/jssp-2way-sql.md` | 🟡 キャッシュ対象データを DB から取得する場合のみ参照 |
| `.claude/rules/jssp-presentation-page.md` | 🔴 **本スキル単独では不要** — `Cache` はプレゼンテーションページから直接使用しない |

## API 概要

`Cache` クラスの完全な型定義は `d.ts/platform/cache/im-ssjs-cache.d.ts` を参照すること（記憶や推測で書かない）。要点は以下の通り。

- `new Cache(cacheName)` でインスタンスを生成する。`cacheName` は後述のキャッシュ設定ファイルで定義したキャッシュ名と一致させる
- 持つメソッドは `get(key)` / `put(key, value)` / `remove(key)` / `removeAll()` の4つのみ
- `get(key)` はキャッシュに値が見つからない場合 `null` を返す。例外は投げない
- `put(key, value)` に渡す `value` はシリアライズ可能なオブジェクトである必要がある。関数やホストオブジェクト（DB 接続オブジェクト等）はキャッシュ対象にできない
- `Cache` は内部的に Java 側の `CacheManagerFactory.getCacheManager()` をブリッジする実装であり、Java（JavaEE 開発モデル）の `CacheManager`/`Cache` API と同じキャッシュ設定ファイル・同じキャッシュ名前空間を共有する
- `Cache` はテナントコンテキストが存在する実行環境（プレゼンテーションページ処理・ファンクションコンテナ処理・ジョブ実行等）でのみ動作する。テナントコンテキストが存在しない実行環境でインスタンス化すると `IllegalStateException` が発生する

## キャッシュ設定ファイル（利用前の必須準備）

キャッシュを使う前に、必ず `WEB-INF/conf/im-ehcache-config/{任意の名前}.xml` にキャッシュ名を定義すること。設定ファイルに定義していないキャッシュ名を `new Cache(cacheName)` に渡さないこと。

```xml
<im-ehcache-config xmlns="http://www.intra-mart.jp/cache/ehcache/config">
  <cache name="itemMasterCache"
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

| 属性 | 既定値 | 意味 |
|---|---|---|
| `name`（必須） | - | キャッシュ名。`new Cache(cacheName)` の引数と一致させる。**`im_` で始まる名称はシステムの予約語のため使用しないこと** |
| `enable` | `false` | キャッシュの有効・無効を制御する。**既定値は `false`** のため `enable="true"` を明示すること |
| `time-to-idle-seconds` | `0` | 最終アクセスからの生存時間（秒） |
| `time-to-live-seconds` | `0` | 登録からの絶対生存時間（秒） |
| `max-elements-on-memory` | `0` | メモリ上の最大要素数 |
| `max-elements-on-disk` | `0` | ディスクオーバーフロー時の最大要素数 |
| `max-bytes-memory` / `max-bytes-disk` | `0` | バイト数指定の上限。**`max-elements-on-memory`/`max-elements-on-disk` が設定されている場合はそれぞれ無効になる** |
| `overflow-to-disk` | `false` | メモリ超過分をディスクへオーバーフローさせるか |

属性を省略した場合はテナント共通のデフォルト設定にフォールバックする。キャッシュの生存期間・上限サイズは業務要件に応じて明示的に設定することを推奨する（数値の決め方は下記「注意事項」参照）。

**`max-bytes-memory`/`max-bytes-disk` はオブジェクトのサイズ計算処理を伴うため、多数の参照を持つ大きなオブジェクトをキャッシュする場合はパフォーマンス低下要因になりうる。** その場合は `max-elements-on-memory`/`max-elements-on-disk`（要素数指定）を使うこと。

この設定ファイルは Java（JavaEE 開発モデル）の `CacheManager`/`Cache` API とも共有される。他の機能が同名のキャッシュ名をすでに使用していないか確認してから命名すること。**マルチテナント運用時、キャッシュ容量はテナントごとに個別に確保される**ため、上限値の設計時はテナント数を掛け合わせた合計消費量を見積もること（出典: [公式リファレンス](https://document.intra-mart.jp/library/iap/public/configuration/im_configuration_reference/texts/im_service/im-ehcache-config/index.html)）。

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| ファンクションコンテナ内でのキャッシュ参照・登録・削除 | `assets/cache-basic-usage.md` | `get`/`put` による基本パターン、更新時の `remove`、キャッシュキーの設計例 |

## 使用タイミング

ユーザが以下のような依頼をした場合に使用する:
- 「マスタ参照処理をキャッシュして高速化したい」
- 「Cache クラスを使いたい」
- 「同じ計算を何度もしないようキャッシュしたい」
- 「キャッシュの設定ファイルを作りたい」

「Java で」「JavaEE 開発モデルで」等の明示がある場合は `java-im-cache-usage` を使うこと。

## 実装手順

1. キャッシュ対象データ・キー設計をヒアリングする（何を、どのキーで、どの程度の期間キャッシュするか。データ更新頻度が高い場合はキャッシュ自体の要否を再検討する）
2. `WEB-INF/conf/im-ehcache-config/{name}.xml` にキャッシュ名・TTL・上限サイズを定義する（上表参照）
3. `assets/cache-basic-usage.md` を参照してファンクションコンテナに実装する
4. `.claude/rules/jssp-function-container.md` / `jssp-naming.md` / `jssp-code-style.md` / `jssp-error-handling.md` に準拠しているか確認する

## 注意事項

- **キャッシュ名は事前に設定ファイルで定義しておくこと。** `new Cache(cacheName)` 自体はキャッシュ名の存在有無を問わず呼び出せるが、意図したキャッシュ設定（TTL・上限サイズ等）を確実に適用するため、必ず対応する `<cache>` 定義を用意すること
- **`time-to-idle-seconds`/`time-to-live-seconds` の具体的な秒数に「推奨値」は存在しない。** 元データの更新頻度・許容できるデータの鮮度・アクセスパターン（断続的か常時か）から、キャッシュ対象データごとに判断すること。詳細な判断観点は `java-im-cache-usage` スキルの `reference/cache-api-reference.md`「`time-to-idle-seconds`/`time-to-live-seconds` の決め方」を参照
- **`max-bytes-memory`/`max-elements-on-memory` は、プラットフォーム自身が「1 エントリあたりの平均データサイズ × 想定最大エントリ数」（マルチテナント運用時はさらにテナント数を掛ける）という見積もり式を公開している。** グローバルナビゲーションメニューキャッシュ・IM-Authz 認可キャッシュの設定ガイドが実例。具体的な式・計算例は `java-im-cache-usage` スキルの `reference/cache-api-reference.md`「`max-bytes-memory`/`max-elements-on-memory` の見積もり式」を参照し、自作キャッシュにも同じ考え方を適用すること。JSSP 側で「1 エントリあたりの平均データサイズ」を見積もる実践的な方法（`JSON.stringify()` の文字列長による概算等）は `assets/cache-basic-usage.md`「キャッシュサイズの見積もり方（実践）」を参照
- **`put()` に渡す値はシリアライズ可能なオブジェクトに限る。** 関数・DB 接続オブジェクト・`new Packages.***` で生成した Java オブジェクト等、シリアライズできないものをキャッシュしてはならない
- **`get()` の戻り値は必ず `null` チェックする。** キャッシュミス時は例外ではなく `null` が返るため、`null` の場合に元データを取得して `put()` するフォールバック処理を実装すること
- **データ更新時は対応するキャッシュエントリを `remove()` で削除する。** 更新処理でキャッシュを削除し忘れると、古いデータが TTL 経過まで参照され続ける
- **キャッシュキーの粒度に注意する。** 粗すぎるキー（例: 検索条件を無視した固定キー）は異なる検索結果の混同を招き、細かすぎるキー（例: タイムスタンプを含む一意キー）はキャッシュヒット率が実質ゼロになる
- **Java（JavaEE 開発モデル）の `CacheManager`/`Cache` API と設定ファイル・キャッシュ名前空間を共有する。** 同一キャッシュ名を JSSP 側・Java 側で別用途に使い回さないこと
- **値の相互利用は Java → JSSP 方向のみ実用的である。** SSJS 版 `Cache#put()` は値の型を問わず、Rhino のシリアライズ形式（`ScriptBinaryObject`）でラップして Java 側の `Cache<K, V>` に格納する。Java 側は Rhino の実行スコープを持たないためこれを復元できず、JSSP 側で `put()` した値を Java 側の `Cache<K, V>` から型を指定して取得すると `ClassCastException` になる（`Cache<K, Object>` で受け取っても `ScriptBinaryObject` が返るのみで実用的な値は得られない）。逆に、Java 側で `put()` した通常の値（`String` 等）は JSSP 側の `Cache#get()` から正常に取得できる。**Java 側と値を共有したい場合は、Java 側で `put()` し JSSP 側で読む方向のみ**で設計すること（詳細は `java-im-cache-usage` スキルの `reference/cache-api-reference.md` を参照）

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **JSSP（スクリプト開発モデル）でのキャッシュ実装** | **本スキル** |
| Java（JavaEE 開発モデル）でのキャッシュ実装（`CacheManager`/`Cache`） | `java-im-cache-usage` |
| DB アクセス（キャッシュ元データの取得） | `jssp-page-generator`（`jssp-2way-sql.md`） |
| バッチ処理内でのキャッシュ利用・キャッシュクリア | `jssp-im-job-generator`（+ 本スキル） |
