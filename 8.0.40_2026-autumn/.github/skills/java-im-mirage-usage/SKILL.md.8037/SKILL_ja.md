---
name: java-im-mirage-usage
description: intra-mart 固有の DB アクセス基盤である im_mirage（`jp.co.intra_mart.mirage.*`、Mirage-SQL の intra-mart 内製版）を Java（JavaEE 開発モデル）で使用するためのスキルセット。エンティティクラス（`@Table`/`@Column`/`@PrimaryKey`）、DAOクラス（`AbstractDAO` 継承・`DAOFactory` によるインスタンス取得）、2WaySQL の SQLファイル（`/*IF*/`/`/*BEGIN*/`/`/*param*/`/`/*FOR*/`）、`SqlManager` によるクエリ実行（`getResultList`/`getSingleResult`/`executeUpdate`/エンティティCRUD）、`SessionTemplate`/`SessionCallback` によるトランザクション管理、DB方言別 SQL ファイル（`_oracle.sql`/`_sqlserver.sql` 等）の実装パターンを提供する。Java で im_mirage を使いたい、Java で AbstractDAO / DAOFactory / SqlManager を使いたい、JavaEE 開発モデルで DB アクセス処理を実装したい、Mirage の DAO・エンティティを作りたい、Java 側で 2WaySQL の SQL ファイルを書きたい、と言及されたときに使用。JSSP（スクリプト開発モデル）で DB アクセスを行う場合は `jssp-page-generator`（`TenantDatabase`/`SharedDatabase` API・`jssp-2way-sql.md` 規約）を使うこと。両者は開発モデルが異なり実装は完全に独立している。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart im_mirage 利用支援スキル（Java 版）

## 目的

intra-mart Accel Platform が提供する **JavaEE 開発モデル**向けの DB アクセス基盤 im_mirage（`jp.co.intra_mart.mirage.*`）を使い、エンティティクラス・DAOクラス・2WaySQL の SQLファイルを実装するためのスキルセット。

## im_mirage について（重要な前提）

**「IM-Mirage」は公式の製品名ではない。** 実体は OSS の 2WaySQL O/Rマッパー Mirage-SQL を intra-mart が自社の名前空間（`jp.co.intra_mart.mirage.*`）に取り込んだ内製フォークで、モジュール名は `im_mirage`。本スキルではプロジェクト内の通称に合わせて「im_mirage」と表記する。

## 基本アーキテクチャ（最重要）

```
エンティティクラス（@Table/@Column/@PrimaryKey）
        ↓
DAO インタフェース DAO<T>
        ↓
BaseDAO<T> implements DAO<T>        … protected IntramartSqlManager sqlManager を保持（プラットフォーム提供、継承のみ）
        ↓
AbstractDAO<T> extends BaseDAO<T>   … insert/update/delete/find の共通実装（監査項目を自動設定）
        ↓
具象DAO（例: XxxDAO extends AbstractDAO<XxxEntity>）… 独自クエリメソッドを追加
        ↑ 取得
DAOFactory.getTenantDatabaseDAO(XxxDAO.class) / getSharedDatabaseDAO(XxxDAO.class, connectId)
        ↑ トランザクション境界
SessionTemplate.execute(new SessionCallback<T, E>() { ... })
```

- **エンティティクラスは `.github/instructions/java-entity.instructions.md` の規約に従う。** publicフィールド・引数なしコンストラクタ・`GenerationType.APPLICATION` 等は同規約が定める本プロジェクトのルールであり、本スキルはそれを im_mirage の実装として満たす
- **クラス名とテーブル名の対応は努力目標（強制ルールではない）。** テーブル名（スネークケース）を素直にパスカルケース変換した名前を基本としつつ、プラットフォーム側のモジュール接頭辞・略号を含むテーブル名（例: `b_m_account_b`）は可読性を優先して意訳してよい。意訳した場合も `@Table(name = "...")` と クラス JavaDoc に実テーブル名を明記し、対応関係を追跡可能にする（詳細は `assets/mirage-basic-usage.md` パターン1参照）
- **`AbstractDAO` を継承すれば insert/update 時に監査項目（`createUserCd`/`createDate`/`recordUserCd`/`recordDate`）が自動設定される。** 手動設定は不要かつ非推奨（`.github/instructions/java-entity.instructions.md` にも明記）
- **DAO インスタンスは `new` せず、必ず `DAOFactory` 経由で取得する。** スレッドローカルにキャッシュされ、セッション解放時に自動的にリリースされる設計のため
- **DAO はさらに Repository クラス（`Xxx` + `Repository`/`StandardXxxRepository`）でラップし、Service クラス（`Xxx` + `Service`/`StandardXxxService`、ビジネスロジック層）から呼び出す。** REST API から利用する場合、Endpoint クラス（Web API Maker の窓口）が Repository/DAO を直接呼び出すことは無い（`Endpoint → Service → Repository → DAO` の順）
- **Repository・Service はいずれも「インタフェース + Standard実装クラス + ファクトリクラス」の3点構成とする。** 呼び出し側は `new StandardXxx()` で直接生成せず、`XxxFactory.getInstance()` で取得する。ファクトリクラス内部は `ServiceLoaderUtil.loadTopPriority` を使い、`META-INF/services` に優先度の高い実装が登録されていればそちらを使用し、無ければ Standard実装にフォールバックする（詳細は「Repository/Service のファクトリクラス」参照）

### Repository / Service / Endpoint の責務分担

| 層 | 呼び出す相手 | トランザクション境界 | 責務 |
|---|---|---|---|
| Repository | DAO | `SessionTemplate.execute` で自ら境界を張る | DAO と密結合。書き込み系（insert/update/delete）は基本的に1件（1 Entity）単位で処理する。SELECT のみ条件一致した全件をリストで返してよい |
| Service | Repository（複数可） | **複数の Repository メソッドを1つの操作としてまとめる場合のみ** `SessionTemplate.execute` で自ら境界を張る | 単一の Repository メソッド呼び出しだけで完結する場合は、その Repository への薄いラッパーとなる（この場合 Service 側に `SessionTemplate` は不要。Repository 側の境界だけで十分） |
| Endpoint（Web API Maker） | Service | 持たない（`SessionTemplate` を直接使わない） | URL アクセス時の最初のエントリポイント。実装は `java-im-web-api-maker-usage` を参照 |

- **Service が `SessionTemplate.execute` で自らトランザクション境界を張るのは、複数の Repository メソッド呼び出しを1つの操作としてまとめる場合のみ。** 単一の Repository メソッドを呼ぶだけの薄いラッパーであれば、Repository 側の境界だけで十分であり、Service 側で重ねて張る必要はない
- **複数 Repository を横断する場合、`SessionTemplate` はネスト呼び出しを検知し、外側（Service）で開始済みのトランザクション内で呼ばれた内側（Repository）の `execute` は commit/rollback を行わず外側に委ねるため、多段に重なっても1つのトランザクションとして扱われる**
- 具体的な Service クラスの実装パターン（複数 Repository を横断する登録処理、単一 Repository の薄いラッパー）は `assets/mirage-basic-usage.md` の「パターン7: Service層」を参照

### Repository/Service のファクトリクラス（`ServiceLoaderUtil`）

Repository・Service のインスタンスは `new StandardXxx()` で直接生成せず、`XxxFactory.getInstance()` というファクトリクラス経由で取得する。ファクトリクラス内部では `jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil#loadTopPriority` を使い、`META-INF/services/<インタフェースのFQN>` に優先度（`@Priority`）の高い実装が登録されていればそれを、無ければ既定の Standard実装にフォールバックして返す。

- **単一インスタンスの取得には `loadTopPriority` を使う。** `loadPriority` は登録された全実装を優先度順の `Collection` で返すメソッドであり、単一実装の解決に使うと呼び出し側で毎回先頭要素を取り出す必要があり冗長になる（`reference/mirage-api-reference.md` の `ServiceLoaderUtil` を参照）
- この構成により、他モジュール（プラグイン等）が `META-INF/services` に優先度の高い実装を登録するだけで、呼び出し側のコードを変更せずに実装を差し替えられる
- 具体的な実装パターンは `assets/mirage-basic-usage.md` の「パターン6: トランザクション管理と Repository 層」「パターン7: Service層」を参照

## 参照すべき規約

| 規約 | 取り扱い |
|------|---------|
| `.github/instructions/java-entity.instructions.md` | 🟢 **必読** — エンティティクラスの設計規約（publicフィールド・監査項目・型対応表） |
| `.github/instructions/java-naming.instructions.md` | 🟢 **必読** — パッケージ・クラス・メソッド・変数命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必読** — `final` ローカル変数、文字列リテラル等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必読** — クラス/メソッド JavaDoc |

`jssp-*` の規約はこのスキルの対象外（Java ファイルには適用しない）。

## 他スキルとの境界（重要）

**このスキルが扱うのは「Java（JavaEE 開発モデル）で im_mirage を使った DB アクセス」のみである。** JSSP（スクリプト開発モデル）の DB アクセスとは開発モデルが根本的に異なり、API・SQL の書き方・呼び出し方が完全に別物のため、実装を混同しないこと。

| 作りたいもの | 担当スキル |
|------|-----------|
| Java（JavaEE 開発モデル）でのエンティティ・DAO・SQLファイルの実装 | **本スキル** |
| JSSP（スクリプト開発モデル）での `TenantDatabase`/`SharedDatabase` API・2WaySQL（`executeByTemplate`） | `jssp-page-generator` + `.github/instructions/jssp-2way-sql.instructions.md`（本スキルの対象外） |
| DDL（`CREATE TABLE` 文）そのものの新規作成 | 本スキルの対象外。DB製品ごとの型・DDL構文は既存の DB 設計方針に従う（本スキルはエンティティ・DAO・SQLファイルの実装に特化し、テーブル定義の生成は行わない） |

「REST API から DB を操作したい」等、他の `java-im-*` スキル（`java-im-web-api-maker-usage` 等）と組み合わせる場合は、DB アクセス部分のみ本スキルを使い、API 部分は該当スキルに委ねる。

## API 概要

`jp.co.intra_mart.mirage.*` パッケージ配下のクラス・アノテーション・シグネチャは `reference/mirage-api-reference.md` を参照すること（記憶や推測で書かない）。

主なポイント:
- **`SqlManager` の SQLファイル系メソッド（`getResultList`/`getSingleResult`/`getCount`/`executeUpdate`/`iterate`）は 2WaySQL テンプレートを実行する。** 一方 `xxxBySql` 系メソッド（`getResultListBySql` 等）は **2WaySQL ではない**素の SQL 文字列 + `?` プレースホルダを実行する。両者を混同しない
- **SQLファイルは DB方言別ファイルが自動解決される。** `select_xxx.sql` に対して `select_xxx_oracle.sql`（Oracle）/`select_xxx_postgre.sql`（PostgreSQL）/`select_xxx_sqlserver.sql`（SQLServer）が存在すればそちらが優先され、無ければ元のファイルにフォールバックする。方言差分がある場合のみ方言別ファイルを追加すればよい（全方言分を必ず用意する必要はない）
- **`/*FOR item : list*/.../*END*/` ループ構文は im_mirage では使用できる。** JSSP（スクリプト開発モデル）の 2WaySQL では非対応のため、JSSP 側の実装を流用する際は注意する

## 生成対象とテンプレート

| 生成対象 | テンプレート | 内容 |
|---------|------------|------|
| エンティティクラス | `assets/mirage-basic-usage.md` | `@Table`/`@Column`/`@PrimaryKey` の実装、監査項目 |
| DAOクラス（基本CRUD） | `assets/mirage-basic-usage.md` | `AbstractDAO` 継承、`DAOFactory` によるインスタンス取得 |
| DAOクラス（独自クエリ） | `assets/mirage-basic-usage.md` | SQLファイルパス定数、`sqlManager.getResultList`/`getSingleResult` 等の呼び出し |
| 2WaySQL の SQLファイル | `assets/mirage-basic-usage.md` | `/*IF*/`/`/*BEGIN*/`/`/*param*/`/`/*FOR*/` 構文、DB方言別ファイル |
| トランザクション管理 | `assets/mirage-basic-usage.md` | `SessionTemplate.execute(SessionCallback)` の実装パターン |
| Repository層（推奨パターン） | `assets/mirage-basic-usage.md` | Repository インタフェース + Standard実装クラスによる DAO 呼び出しのカプセル化、`ServiceLoaderUtil` によるファクトリクラス |
| Service層 | `assets/mirage-basic-usage.md` | 複数 Repository を横断する登録処理の同一トランザクション化、単一 Repository の薄いラッパー、`ServiceLoaderUtil` によるファクトリクラス |

### リファレンス

- `reference/mirage-api-reference.md` — `SqlManager`/`AbstractDAO`/`DAOFactory`/エンティティアノテーション（`@Table`/`@Column`/`@PrimaryKey`）の全シグネチャ・属性、DB方言名一覧（プラットフォーム実ソースの定義に基づく。記憶で書かない）

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「Java で im_mirage を使って DB アクセス処理を作りたい」
- 「JavaEE 開発モデルで `AbstractDAO`/`DAOFactory`/`SqlManager` を使いたい」
- 「Mirage のエンティティクラス・DAOクラスを作りたい」
- 「Java 側で 2WaySQL の SQLファイルを書きたい」

「Java で」「JavaEE 開発モデルで」等の明示がない場合は、プロジェクトの開発モデル（JSSP/Java）をユーザに確認する。

「DB アクセス処理を作りたい」とだけ言われ開発モデルが不明な場合、JSSP（スクリプト開発モデル）なら `jssp-page-generator`、Java（JavaEE 開発モデル）なら本スキルに振り分ける。

## 実装手順

1. ユーザの要件をヒアリング（対象テーブル・カラム構成、テナントDB/シェアードDBのどちらか、必要なクエリの種類）
2. `.github/instructions/java-entity.instructions.md` に従ってエンティティクラスを設計・実装（`@Table`/`@Column`/`@PrimaryKey`、監査項目4フィールド）
3. `assets/mirage-basic-usage.md` を参照して DAOクラスを実装（`AbstractDAO<エンティティ型>` を継承。独自クエリが必要な場合は SQLファイルパス定数と呼び出しメソッドを追加。メソッドのシグネチャは `reference/mirage-api-reference.md` を必ず参照し、記憶や推測で書かない）
4. 独自クエリがある場合、2WaySQL の SQLファイルを作成する（DB方言差分がある場合のみ方言別ファイルを追加）
5. Repository を「インタフェース + Standard実装クラス + ファクトリクラス（`ServiceLoaderUtil.loadTopPriority` 使用）」の3点構成で実装し、DAO 呼び出しを `SessionTemplate.execute(SessionCallback)` によるトランザクション境界でラップする
6. 複数の Repository を横断する処理がある場合、Service を同様に「インタフェース + Standard実装クラス + ファクトリクラス」の3点構成で作成し、Service 自身の `SessionTemplate.execute` トランザクション境界内で各 Repository（`XxxRepositoryFactory.getInstance()` で取得）を呼び出す（単一 Repository のメソッド呼び出しだけで完結する場合、Service 側に `SessionTemplate` は不要。Repository 側の境界だけで十分な薄いラッパーとする）
7. `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか確認

## 注意事項

- **DAO インスタンスを `new` で直接生成しない。** `DAOFactory.getTenantDatabaseDAO(...)`/`getSharedDatabaseDAO(...)` を使う。直接 `new` すると `sqlManager` フィールドが未設定のまま `NullPointerException` になる
- **監査項目（`createUserCd`/`createDate`/`recordUserCd`/`recordDate`）を手動で設定しない。** `AbstractDAO#insert`/`update` が自動設定するため、手動設定すると意図しない上書きが発生する可能性がある
- **`SqlManager` の SQLファイル系メソッドと `xxxBySql` 系メソッドを混同しない。** 前者は 2WaySQL テンプレート（ファイルパス指定）、後者は素の SQL 文字列（`?` プレースホルダ）で、パラメータの扱いも異なる
- **DB更新処理は `SessionTemplate.execute(SessionCallback)` のトランザクション境界内で実行する。** 境界外で実行すると自動コミットの単位が意図した粒度にならない場合がある
- **`/*FOR*/` 構文は im_mirage 専用。** JSSP 側の 2WaySQL ファイルをそのまま流用できない（`jssp-2way-sql.md` 参照）
- **DB方言別 SQLファイルは差分がある場合のみ作成する。** 全方言分を機械的に複製すると保守性が下がる。ベースファイルで全方言に対応できるならそのままでよい
- **SQLファイルは `src/main/java` ではなく `src/main/resources` 配下に、DAOクラスと同じパッケージパスで配置する。** `src/main/java` に置くと実行時クラスパスに含まれず `resource: xxx.sql is not found.` エラーになる。プラットフォーム標準機能のソースツリーで `.java` と `.sql` が同じディレクトリに同居して見えるのは、ビルド前のリポジトリ構成であり、Maven 標準レイアウトの配置先とは異なる点に注意（実装漏れが起きやすい箇所）

## 生成後の確認

JSSP 版のような専用検証スクリプト（`validate-jssp-code.js` 相当）は現時点で未整備。以下を手動で確認する。

1. エンティティクラスが `.github/instructions/java-entity.instructions.md` に準拠しているか（publicフィールド・引数なしコンストラクタ・`GenerationType.APPLICATION`・監査項目4フィールド）
2. DAOクラスが `AbstractDAO<エンティティ型>` を継承しているか、`sqlManager` フィールドを独自に宣言していないか（`BaseDAO` 側で既に提供されている）
3. DAO の取得が `DAOFactory.getTenantDatabaseDAO`/`getSharedDatabaseDAO` 経由になっているか（`new XxxDAO()` になっていないか）
4. DAO が Repository クラス経由で呼び出されているか（REST API から利用する場合、Endpoint/Service クラスが DAO を直接呼び出していないか。`Endpoint → Service → Repository → DAO` の順）
5. 監査項目を DAO 呼び出し側で手動設定していないか
6. SQLファイル系メソッド（`getResultList` 等）と `xxxBySql` 系メソッドの使い分けが適切か
7. 更新系処理が `SessionTemplate.execute(SessionCallback)` のトランザクション境界内にあるか
8. SQLファイルが `src/main/resources` 配下（DAOクラスと同じパッケージパス）に配置されているか（`src/main/java` に置いていないか）
9. 複数の Repository を横断する処理が、Service 自身の `SessionTemplate.execute` トランザクション境界内でまとめて実行されているか（Repository ごとに別々のトランザクションでコミットされていないか）
10. 単一の Repository メソッド呼び出しだけで完結する Service メソッドで、不要な `SessionTemplate.execute` の重ね張りをしていないか（Repository 側の境界で十分な場合は Service 側では素通しでよい）
11. Endpoint（Web API Maker）クラスが `SessionTemplate`/`DAOFactory` を直接呼び出さず、必ず Service 経由になっているか
12. Repository・Service が「インタフェース + Standard実装クラス + ファクトリクラス」の3点構成になっているか、呼び出し側が `new StandardXxx()` で直接生成せず `XxxFactory.getInstance()` を使っているか
13. ファクトリクラスの実装が `ServiceLoaderUtil.loadPriority`（`Collection` を返す）ではなく `loadTopPriority`（単一インスタンスを返す）を使っているか
14. `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md` に準拠しているか
15. `jssp-code-review` / `jssp-security-check` は JSSP 専用のため本スキルの生成物には適用されない。プロジェクトに Java 向けのコードレビュー・セキュリティチェックスキルが別途存在する場合はそちらを利用する

## 他スキルとの境界

| 責務 | 担当スキル |
|------|-----------|
| **Java（JavaEE 開発モデル）での im_mirage によるエンティティ・DAO・SQLファイルの実装** | **本スキル** |
| JSSP（スクリプト開発モデル）での `TenantDatabase`/`SharedDatabase` API・2WaySQL | `jssp-page-generator` + `.github/instructions/jssp-2way-sql.instructions.md` |
| Java（JavaEE 開発モデル）での Web API Maker による REST API 実装 | `java-im-web-api-maker-usage` |
| Java での認可（IM-Authz）リソース・サブジェクト・ポリシーの CRUD | `java-im-authz-usage` |
| Java でのファイル操作（`PublicStorage` 等） | `java-im-storage-usage` |
