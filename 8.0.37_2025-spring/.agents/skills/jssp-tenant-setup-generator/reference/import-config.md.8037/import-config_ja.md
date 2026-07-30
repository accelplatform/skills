# import-&lt;artifactId&gt;-config-1.xml の構造

テナント環境セットアップ Importer のエントリーポイントとなる設定ファイル。
セットアップ実行時に参照すべき各種 XML/SQL/JS のパスを列挙する。

## 保存場所

```
src/main/conf/products/import/basic/<artifactId>/import-<artifactId>-config-<N>.xml
```

参照対象の XML/SQL（`<role-file>` 等）は `src/main/storage/system` 配下に置かれ、
拡張インポート JS は `src/main/jssp/src` 配下に置かれる。`import-<artifactId>-config-<N>.xml` 自身だけが `src/main/conf` 配下に置かれる点に注意。

| 部分 | 意味 | 決まり方 |
|---|---|---|
| `<artifactId>` | セットアップ XML 格納ディレクトリ名 兼 ファイル名。**intra-mart テナント環境セットアップの仕様で `pom.xml` の `<artifactId>` と一致させる必要がある**（ディレクトリ名とファイル名の両方が同じ `<artifactId>` になる） | spec.json の `"artifactId"` → プロジェクトルート `pom.xml` の `<artifactId>`（`<parent>` 内は除外）→ `module.xml` の `<id>` のドット区切り末尾セグメント（例: `mypackage.hoge` → `hoge`）→ `spec.key`（フォールバック） |
| `<key>` | アプリケーションキー（ストレージ配下のディレクトリ名・参照パス・リソースファイル名で使われる識別子） | spec.json の `"key"`（必須） |
| `<N>` | config 番号。初版は `1`、バージョンアップごとに `2`, `3`, ... と増やす | spec.json の `"configNumber"`（省略時 `1`） |

`<artifactId>` と `<key>` は異なる値でよい。例: `<key>="equip"` で `<artifactId>="equipment-lending-system"` の場合、ファイルは `src/main/conf/products/import/basic/equipment-lending-system/import-equipment-lending-system-config-1.xml` に置かれる（ディレクトリ名・ファイル名ともに `<artifactId>` を使う）。一方、参照される `<role-file>` 等のパスは `products/import/basic/equip/1.0.0/equip-role.xml` のように `<key>` ベースとなる。

## バージョンアップ時の運用

intra-mart Importer は `import-<artifactId>-config-1.xml` → `import-<artifactId>-config-2.xml` → ... の **番号順** に **すべて** 実行する仕様。よって：

- **既存の config-N.xml には触れない**（変更すると既存テナントへの再投入が必要になる）
- **新バージョン分は config-(N+1).xml を新規追加**
- **新 config には差分のみ** を記述（重複投入を防ぐため、既存ロール ID 等は含めない）
- **資材も `basic/<key>/<version>/` の別ディレクトリ** に置く（旧バージョンは履歴用に残す）

build スクリプトは既存ファイルの上書きを禁止し（`--force` で許可）、`spec.configNumber` と `spec.version` を変えるだけで安全に差分 config を追加できる。詳細は SKILL.md の「複数 config 運用」を参照。

## 名前空間とスキーマ

```xml
<import-data-config
   xmlns="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config"
   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
   xsi:schemaLocation="http://intra_mart.co.jp/system/service/provider/importer/config/import-data-config import-data-config.xsd">
  ...
</import-data-config>
```

## 子要素

トップレベル `<import-data-config>` 直下に以下のセクションを置く。

| セクション | 内容 | 出力タイミング |
|-----------|------|---------------|
| `<database>` | DDL / DML SQL の参照 | `spec.database` あり |
| `<tenant-master>` | ロール・認可・メニュー・ジョブの XML 参照 | 該当 spec フィールドあり |
| `<extends-import>` | 拡張インポート JS の参照 | `spec.extendsImport === true` |

build スクリプトは spec で指定されていないセクション / 要素は出力しない（空タグでも出さない）。

## `<database>` 配下の DB-Type suffix 自動付与

`<create-file>` / `<insert-file>` に書かれたファイル名（拡張子の直前）に対し、intra-mart Importer は接続先 DB に応じて `_postgre` / `_oracle` / `_sqlserver` のサフィックスを **自動付与** する。

```xml
<create-file>products/import/basic/equip/1.0.0/equip-ddl.sql</create-file>
```

→ PostgreSQL 環境: `equip-ddl_postgre.sql` を読む / Oracle: `equip-ddl_oracle.sql` / SQL Server: `equip-ddl_sqlserver.sql`

config-1.xml 内の参照は **suffix なし** で記述する。実ファイルの配置は次の優先順位で解決される:

1. **suffix 付きファイル** (`_postgre` / `_oracle` / `_sqlserver`) — DB 固有、優先
2. **suffix なしファイル** — 全 DB 共通フォールバック

このため:

- **DDL は 3 方言別**（型・制約構文が DB ごとに違う）
- **DML は 1 ファイルに一本化**（INSERT 文は標準 SQL で共通化しやすい）

を推奨パターンとする。詳細は [database-sql.md](database-sql.md) 参照。

## パスの基準ディレクトリ

```xml
<role-file>products/import/basic/any_app/1.0.0/any_app-role.xml</role-file>
```

| 要素 | 基準ディレクトリ |
|------|----------------|
| `<create-file>` / `<insert-file>` | `src/main/storage/system` からの相対パス |
| `<role-file>` / `<authz-*-file>` / `<menu-group-file>` / `<job-scheduler-file>` | `src/main/storage/system` からの相対パス |
| `<extends-import-class>` | `src/main/jssp/src` からの相対パス |

参照パスには `<key>/<version>/` のディレクトリ構造が含まれる（例: `products/import/basic/<key>/<version>/<key>-role.xml`、`<key>/initialize/<version>/<key>_import.js`）。`<version>` の決定優先順位は: spec.json の `"version"` → プロジェクトルートの `module.xml` または `pom.xml` の `<version>` → `1.0.0`。バージョンアップ時は別バージョンディレクトリに資材を新規生成し、本ファイルの参照行を書き換えて切り替える運用。

### configNumber > 1 のファイル名サフィックス

`spec.configNumber >= 2` の場合、build スクリプトは各ファイルのベース部末尾に `-<N>` サフィックスを付与する。出力ディレクトリ（`<version>/` および `<version>/initialize/`）はそのままで、ファイル名だけが分かれる。

| 種別 | configNumber: 1 | configNumber: 4 |
|---|---|---|
| 基底 XML | `equip-authz-policy.xml` | `equip-authz-policy-4.xml` |
| 多言語 XML | `equip-role_ja.xml` | `equip-role-4_ja.xml` |
| DB 方言 SQL | `equip-ddl_postgre.sql` | `equip-ddl-4_postgre.sql` |
| 拡張インポート JS | `equip_import.js` | `equip_import-4.js` |
| ワークフローインポート JS | `equip_workflow_import.js` | `equip_workflow_import-4.js` |
| ロジックインポート JS | `equip_logic_import.js` | `equip_logic_import-4.js` |

`-<N>` はロケール（`_ja` / `_en` / `_zh_CN`）や DB 方言（`_postgre` / `_oracle` / `_sqlserver`）サフィックスの **直前** に挿入されるため、それらの命名規則と干渉しない。

`import-<artifactId>-config-<N>.xml` 内の参照パス例:

```xml
<!-- configNumber: 1 -->
<role-file>products/import/basic/equip/1.0.0/equip-role.xml</role-file>

<!-- configNumber: 4 -->
<authz-policy-file>products/import/basic/equip/1.0.0/equip-authz-policy-4.xml</authz-policy-file>
```

サフィックス分離はバージョンアップ運用ではなく、**同一バージョン内でインポート順序を制御したい場合**（例: LogicDesigner ルーティングが生成するリソースに後追いでポリシーを当てる場合）に使う。詳細は [logic-import.md](logic-import.md) を参照。

## 多言語ファイルの並べ順

各要素は **基底 → ja → en → zh_CN** の順で並べる。基底ファイル（ロケールサフィックスなし）は ID やリソース定義そのものを記述し、`_ja.xml` / `_en.xml` / `_zh_CN.xml` は表示名の差分のみを記述する。

```xml
<role-file>products/import/basic/any_app/1.0.0/any_app-role.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_ja.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_en.xml</role-file>
<role-file>products/import/basic/any_app/1.0.0/any_app-role_zh_CN.xml</role-file>
```

## サンプル（完全版）

[examples/any_app.spec.json](../examples/any_app.spec.json) を `scripts/build-setup-import.js` に流したときの出力を参照。

## 注意

- `<authz-policy-file>` は **多言語版を持たない**（subject 式とリソース ID のみで構成され、表示名がないため）。
- `<database>` 配下の `<create-file>` / `<insert-file>` は順序依存。先に DDL（create-file）、その後に DML（insert-file）を記述する。
- `<extends-import>` の拡張インポート JS は、**この config 内のテナントマスタが投入された直後** に `doImport(tenantId)` が呼ばれる（同じ config 内の database / authz / menu / job は既にロード済み）。複数 config がある場合は番号順に同じ流れが繰り返されるため、後続 config で投入されるマスタは前 config の `doImport` 時点では未存在。詳細は [extends-import.md](extends-import.md) 参照。
