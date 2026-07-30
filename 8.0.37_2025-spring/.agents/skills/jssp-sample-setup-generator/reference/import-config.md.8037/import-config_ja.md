# import-&lt;artifactId&gt;-config.xml の構造

サンプルデータセットアップ Importer のエントリーポイントとなる設定ファイル。
セットアップ実行時に参照すべき各種 XML/SQL/JS のパスを列挙する。

## 保存場所

```
src/main/conf/products/import/sample/import-<artifactId>-config.xml
```

参照対象の XML/SQL（`<role-file>` 等）は `src/main/storage/system` 配下に置かれ、
拡張インポート JS は `src/main/jssp/src` 配下に置かれる。`import-<artifactId>-config.xml` 自身だけが `src/main/conf` 配下に置かれる点に注意。

| 部分 | 意味 | 決まり方 |
|---|---|---|
| `<artifactId>` | セットアップ XML ファイル名。**サンプルデータセットアップの仕様で `pom.xml` の `<artifactId>` と一致させる必要がある** | spec.json の `"artifactId"` → プロジェクトルート `pom.xml` の `<artifactId>`（`<parent>` 内は除外）→ `module.xml` の `<id>` のドット区切り末尾セグメント（例: `mypackage.hoge` → `hoge`）→ `spec.key`（フォールバック） |
| `<key>` | アプリケーションキー（ストレージ配下のディレクトリ名・参照パス・リソースファイル名で使われる識別子） | spec.json の `"key"`（必須） |

`<artifactId>` と `<key>` は異なる値でよい。例: `<key>="equip"` で `<artifactId>="equipment-lending-system"` の場合、ファイルは `src/main/conf/products/import/sample/import-equipment-lending-system-config.xml` に置かれる（ファイル名に `<artifactId>` を使う）。一方、参照される `<role-file>` 等のパスは `products/import/sample/equip/equip-role.xml` のように `<key>` ベースとなる。

> **注意**: ショートモジュール ID ディレクトリは **設定ファイル側（`conf/`）には無い** が、**インポートファイル側（`storage/system`）には有る**（`products/import/sample/%ショートモジュールID%/`）。

## 設定ファイルは 1 つだけ

サンプルデータセットアップはスキーマバージョン管理の対象外のため、**特定のモジュールにおける設定ファイルは最大でも 1 つしか作成されない**。テナント環境セットアップの `configNumber` / 複数 config 運用に相当する概念は存在しない。

build スクリプトは `spec.configNumber` / `spec.version` を検出するとエラーで停止する。資材の更新は既存ファイルの上書き（`--force`）で行う。

**含意**: config 分割による実行順序の制御ができない。順序制御は `<extends-import>` 内の記述順のみ（[extends-import.md](extends-import.md)、[logic-import.md](logic-import.md#ルーティング向け認可ポリシーは投入できない)）。

## 名前空間とスキーマ

```xml
<import-data-config
   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">
  ...
</import-data-config>
```

フォーマットファイル（xsd）は `WEB-INF/schema/import-data-config.xsd`。テナント環境セットアップと同一。

## 子要素

トップレベル `<import-data-config>` 直下に以下のセクションを置く。**XSD 上 `sequence` のため、この順序を守ること。**

| 順 | セクション | 内容 | 出力タイミング |
|---|-----------|------|---------------|
| 1 | `<database>` | DDL / DML SQL の参照 | `spec.database` あり |
| 2 | `<tenant-master>` | ロール・認可・メニュー・ジョブの XML 参照 | 該当 spec フィールドあり |
| 3 | `<extends-import>` | 拡張インポート JS の参照 | `spec.extendsImport === true` 等 |

各セクションは `minOccurs="0"` のため省略可能。build スクリプトは spec で指定されていないセクション / 要素は出力しない。

## `<database>`

**`create-file` → `insert-file` の順**（XSD の `sequence`）。

```xml
<database>
  <create-file>products/import/sample/any_app/any_app-ddl.sql</create-file>
  <insert-file>products/import/sample/any_app/any_app-dml.sql</insert-file>
</database>
```

`<create-file>` は `spec.database.tables[].ddl: true` のテーブルがある場合のみ出力される。DB-Type suffix（`_postgre` / `_oracle` / `_sqlserver`）は Importer が自動付与するため、config には **suffix なし** で記述する。詳細は [database-sql.md](database-sql.md)。

## パスの基準ディレクトリ

| 要素 | 基準ディレクトリ |
|------|----------------|
| `<create-file>` / `<insert-file>` | `src/main/storage/system` からの相対パス |
| `<role-file>` / `<authz-*-file>` / `<menu-group-file>` / `<job-scheduler-file>` | `src/main/storage/system` からの相対パス |
| `<extends-import-class>` | `src/main/jssp/src` からの相対パス |

参照パスに `<version>` ディレクトリは **含めない**（`products/import/sample/<key>/<key>-role.xml`、`<key>/initialize/<key>_import.js`）。

## 多言語ファイルの並べ順

各要素は **基底 → ja → en → zh_CN** の順で並べる。基底ファイル（ロケールサフィックスなし）は ID やリソース定義そのものを記述し、`_ja.xml` / `_en.xml` / `_zh_CN.xml` は表示名の差分のみを記述する。

```xml
<role-file>products/import/sample/any_app/any_app-role.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_ja.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_en.xml</role-file>
<role-file>products/import/sample/any_app/any_app-role_zh_CN.xml</role-file>
```

## サンプル（完全版）

[examples/any_app.spec.json](../examples/any_app.spec.json) を `scripts/build-sample-setup-import.js` に流したときの出力を参照。

## 注意

- `<authz-policy-file>` は **多言語版を持たない**（subject 式とリソース ID のみで構成され、表示名がないため）。
- `<database>` 配下の `<create-file>` / `<insert-file>` は順序依存。先に DDL（create-file）、その後に DML（insert-file）を記述する。
- `<extends-import>` の拡張インポート JS は、**テナントマスタが投入された直後** に `doImport(tenantId)` が呼ばれる。詳細は [extends-import.md](extends-import.md) 参照。
