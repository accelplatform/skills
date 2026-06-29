# DDL/DML SQL スケルトン仕様

テナント環境セットアップ時にデータベースに発行する SQL ファイル。

## DB-Type による suffix 自動付与の仕組み

intra-mart Importer は `import-<artifactId>-config-1.xml` の `<create-file>` / `<insert-file>` に書かれたファイル名に対して、接続先 DB に応じて以下のサフィックスを **自動付与** してファイルを読み込む。

| DB 種別 | サフィックス |
|---------|------------|
| PostgreSQL | `_postgre` |
| Oracle Database | `_oracle` |
| Microsoft SQL Server | `_sqlserver` |

例:

```xml
<create-file>products/import/basic/equip/1.0.0/equip-ddl.sql</create-file>
```

と書くと、PostgreSQL 環境では `equip-ddl_postgre.sql`、Oracle 環境では `equip-ddl_oracle.sql`、SQL Server 環境では `equip-ddl_sqlserver.sql` が読み込まれる。

### ファイル解決の優先順位

接続先 DB が PostgreSQL の場合、Importer は以下の順序でファイルを探索する:

1. `equip-ddl_postgre.sql`（suffix 付き、DB 固有）
2. `equip-ddl.sql`（**suffix なし、全 DB 共通フォールバック**）

つまり **suffix なしファイルを置いておくと、全 DB-Type で共通利用される**。DB 方言の差がない SQL を書く場合、1 ファイルに一本化できる。

### DDL と DML の使い分け

| 種別 | 推奨される置き方 | 理由 |
|------|----------------|------|
| **DDL** | 3 方言別 (`_postgre` / `_oracle` / `_sqlserver`) | CREATE TABLE は型名・制約構文が DB ごとに大きく違う（VARCHAR2 / DECIMAL / TIMESTAMP の表現等） |
| **DML** | **1 ファイルに一本化** が原則（`<key>_sample-dml.sql`）| INSERT 文は標準 SQL の範囲で書けることが多く、DB 方言の差が出にくい |

DML でも方言依存の構文（PostgreSQL の `ON CONFLICT`、Oracle の `MERGE`、SQL Server の `IF NOT EXISTS BEGIN ... END` 等）を使う場合のみ、3 方言別ファイルにする。

## ファイル構成

### 推奨パターン（DDL は方言別、DML は一本化）

| ファイル | 内容 |
|---------|------|
| `<key>-ddl_postgre.sql` | CREATE TABLE 文（PostgreSQL 用） |
| `<key>-ddl_oracle.sql` | CREATE TABLE 文（Oracle 用） |
| `<key>-ddl_sqlserver.sql` | CREATE TABLE 文（SQL Server 用） |
| `<key>_sample-dml.sql` | 初期データ INSERT 文（**全 DB 共通**） |

### DML も方言別にする場合（方言依存構文を使う場合のみ）

| ファイル | 内容 |
|---------|------|
| `<key>_sample-dml_postgre.sql` | 初期データ INSERT 文（PostgreSQL 用） |
| `<key>_sample-dml_oracle.sql` | 初期データ INSERT 文（Oracle 用） |
| `<key>_sample-dml_sqlserver.sql` | 初期データ INSERT 文（SQL Server 用） |

`import-<artifactId>-config-1.xml` での参照は suffix なしで記述:

```xml
<database>
  <create-file>products/import/basic/<key>/<version>/<key>-ddl.sql</create-file>
  <insert-file>products/import/basic/<key>/<version>/<key>_sample-dml.sql</insert-file>
</database>
```

順序: 先に DDL（create-file）、その後に DML（insert-file）。

## スケルトンの内容

build スクリプトは spec の `database.tables[]` を見て、**コメントのみのスケルトン** SQL を 3 方言別に生成する。
CREATE TABLE の本体（カラム定義・制約）はユーザが手作業で追記する。

### `<key>-ddl_<dialect>.sql` のスケルトン例

```sql
-- =============================================================================
--   im_bloommaker DDL (postgre)
-- =============================================================================
--   出力タイミング: テナント環境セットアップ時
--   ファイル名サフィックス _postgre は intra-mart Importer の自動判定で
--   接続先 DB 種別に合致した 1 ファイルだけが読み込まれる
-- =============================================================================

-- imbm_content: コンテンツ
-- CREATE TABLE imbm_content (
--     content_id    VARCHAR(64)  NOT NULL,
--     tenant_id     VARCHAR(64)  NOT NULL,
--     ...
--     PRIMARY KEY (content_id)
-- );
```

各 DB 方言に応じた型・構文を、対応するファイルにそれぞれ記述する。型マッピングは `skills/jssp-page-generator/reference/ddl-type-mapping.md` を参照。

### `<key>_sample-dml.sql` のスケルトン例（一本化、推奨）

```sql
-- =============================================================================
--   im_bloommaker DML (全 DB 共通)
-- =============================================================================
--   出力タイミング: テナント環境セットアップ時（DDL の後）
--   suffix なしのファイルは全 DB-Type で共通使用される
-- =============================================================================

-- imbm_content への初期データがあればここに記述
-- INSERT INTO imbm_content (...) VALUES (...);
```

**INSERT 文は標準 SQL の範囲で書く** ことを原則とし、1 ファイルに一本化する。日付・タイムスタンプ等の方言固有リテラル（Oracle の `TO_DATE`、SQL Server の `CONVERT` 等）は避け、`'2026-01-01'` のような文字列リテラル + 暗黙変換に頼るか、`CURRENT_TIMESTAMP` 等の共通関数を使う。

方言依存の構文がどうしても必要な場合のみ、`<key>_sample-dml_<dialect>.sql` の 3 ファイル別構成にする。

## spec.json での記述

```json
"database": {
  "tables": [
    { "name": "any_app_data",   "comment": "サンプルデータ" },
    { "name": "any_app_master", "comment": "マスタ" }
  ],
  "dmlPerDialect": false
}
```

| フィールド | 必須 | デフォルト | 内容 |
|-----------|------|---------|------|
| `tables[].name` | YES | - | テーブル名 |
| `tables[].comment` | NO | - | テーブルの説明（コメントに展開される） |
| `dmlPerDialect` | NO | `false` | DML を 3 方言別ファイルで出力するかどうか |

### `dmlPerDialect` の挙動

| 値 | 出力される DML ファイル |
|----|----------------------|
| `false`（デフォルト、**推奨**） | `<key>_sample-dml.sql`（1 ファイル、全 DB 共通） |
| `true` | `<key>_sample-dml_postgre.sql` / `_oracle.sql` / `_sqlserver.sql`（3 ファイル） |

DDL は方言差が大きいため、`dmlPerDialect` の値に関わらず常に 3 方言別 (`<key>-ddl_<dialect>.sql`) で出力される。

INSERT 文を標準 SQL の範囲で書ける場合は `dmlPerDialect: false`（デフォルト）のままにする。PostgreSQL の `ON CONFLICT`、Oracle の `MERGE` 等の方言依存構文が必要な場合のみ `true` にする。

`database` を省略すると、SQL ファイルは生成されず、`import-<artifactId>-config-1.xml` から `<database>` セクションも省かれる。

## 注意

- DDL は **冪等性** を意識する（同じテナントへ 2 回流すとエラーになる）
- DML はマスタ系の初期データに限定する。**業務トランザクションのデータは入れない**
- 文字コードは UTF-8（BOM なし）
- 改行は LF を推奨（CRLF でも動くが、git の差分が荒れる）
- **suffix なしファイルは「全 DB 共通フォールバック」として機能する**。Importer は suffix 付きを優先し、なければ suffix なしを読む。DDL は方言別、DML は一本化（suffix なし）が推奨パターン
- **同一 base 名で suffix あり / なしの両方を置くと、suffix 付きが優先される**。意図せず古い共通ファイルが残らないよう注意
