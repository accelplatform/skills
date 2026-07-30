# DDL/DML SQL スケルトン仕様

サンプルデータセットアップ時にデータベースに発行する SQL ファイル。

DB-Type suffix の自動付与（`_postgre` / `_oracle` / `_sqlserver`）・ファイル解決の優先順位・型マッピングはテナント環境セットアップと同一。
`.github/skills/jssp-tenant-setup-generator/reference/database-sql.md` を参照。

## 対象

| 資材 | 対象テーブル | spec |
|---|---|---|
| **DDL**（`<create-file>`） | **サンプルデータセットアップでしか使わないテーブル** | `tables[].ddl: true` |
| **DML**（`<insert-file>`） | サンプルデータを投入する全テーブル | `tables[]` 全件 |

モジュール本体のテーブルは `jssp-tenant-setup-generator` が `storage/system/products/import/basic/<key>/<version>/` に生成する。既存テーブルへ INSERT するだけなら `ddl` を指定しない。

| テーブルの性質 | DDL を作る場所 |
|---|---|
| モジュールが動作するために必要 | テナント環境セットアップ（`basic/`） |
| サンプルデータセットアップ専用 | **サンプルデータセットアップ（`sample/`、本スキル）** |

## テーブル作成済みの状態での再インポート

**サンプルデータセットアップはセットアップ実行のたびに毎回実行される。** テーブルが作成済みの状態で再実行されるため、**素の `CREATE TABLE` は 2 回目以降必ずエラーになる。**

DDL はトランザクション制御されない。また例外が発生しても後続のセットアップ処理は継続実行されるため、**エラーが出ても止まらず、ログを見ないと失敗に気づけない。**

### 方針の選択

| 方針 | 2 回目以降の挙動 | 既存データ | 備考 |
|---|---|---|---|
| **存在チェック付き CREATE**（推奨） | スキップ | 保持される | 方言別の構文が必要（下表）。Oracle 23ai 未満は不可（後述の注意） |
| `DROP` してから `CREATE` | 再作成 | **消える** | 毎回初期状態に戻したい場合。PostgreSQL / SQL Server は `DROP TABLE IF EXISTS` を使う。**Oracle 23ai 未満は不可**（後述の注意） |
| 素の `CREATE TABLE`（存在チェックなし） | 先頭の `CREATE` で ORA-00955 等になり **以降の文はスキップ** | 保持される | テーブルが初回に全て作成済みなら実害はないが、ログにエラーが出続ける |

利用者が試用中に入力したデータを壊さないため、**既定は「存在チェック付き CREATE」** を推奨する。

### Importer の SQL 実行挙動（重要）

Importer は SQL ファイルを **セミコロン + 後続の空白（`;\s*\n?`）で機械的に分割**し、1 文ずつ実行する。この挙動が DDL の書き方を強く制約する。

- **1 文でも失敗すると、そのファイルの残り全文が実行されない**（例外で即座にファイル処理を打ち切る）。しかも DDL のエラーは警告ログを出して次のファイルへ進むだけで、**セットアップ自体は「成功」扱いで継続する**。
- したがって、**存在チェックなしの `DROP` や `CREATE` を先頭に置くと、初回にそこで失敗し、同じファイルの残り全ての CREATE がスキップされる**。テーブルが 1 つも作られないまま「成功」となり、後続の DML が全滅する。
- 各文は個別に成功する形（`CREATE TABLE IF NOT EXISTS` / `DROP TABLE IF EXISTS` 等）で書くこと。
- 分割はコメントを認識しない。**コメント内に `;` があるとそこで切れ、コメントだけのチャンクが SQL として実行されて壊れる**。最後の `;` より後ろにコメントを残した場合も同様。**実装時にコメント行を必ず削除する**こと。

### 方言別の存在チェック構文

| DB | 構文 |
|---|---|
| **PostgreSQL** | `CREATE TABLE IF NOT EXISTS <table> ( ... );` |
| **SQL Server** | `IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = '<table>') CREATE TABLE <table> ( ... );` |
| **Oracle** | `CREATE TABLE IF NOT EXISTS` は **23ai 以降のみ**。それ以前は PL/SQL ブロックが必要（下記の注意を参照） |

```sql
-- PostgreSQL
CREATE TABLE IF NOT EXISTS any_app_demo (
    data_id     VARCHAR(64)  NOT NULL,
    tenant_id   VARCHAR(64)  NOT NULL,
    data_name   VARCHAR(256),
    PRIMARY KEY (data_id)
);
```

```sql
-- SQL Server
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'any_app_demo')
CREATE TABLE any_app_demo (
    data_id     VARCHAR(64)  NOT NULL,
    tenant_id   VARCHAR(64)  NOT NULL,
    data_name   VARCHAR(256),
    PRIMARY KEY (data_id)
);
```

### Oracle 23ai 未満は存在チェックを書けない

**Oracle 23ai 以降**は `CREATE TABLE IF NOT EXISTS` が使えるため、他の DB と同様に存在チェック付きで書く。

**Oracle 23ai 未満**では `CREATE TABLE IF NOT EXISTS` が使えず、存在チェックには PL/SQL 匿名ブロック（`BEGIN 〜 END;`）が必要になる。しかし前述のとおり Importer は PL/SQL を追跡せずセミコロンで機械分割するため、**ブロック内部のセミコロンでも分割され、断片が単独の SQL として実行されて先頭の `DECLARE ...` の時点で ORA-00900（invalid SQL statement）になる**。セミコロンを含まない PL/SQL は書けないため、**この方法は原理的に成立しない**。

同様に、`DROP` → `CREATE` を同一ファイルに置く方針も Oracle 23ai 未満では使えない。`DROP TABLE IF EXISTS` も 23ai 以降のみで、素の `DROP` は初回にテーブルが無く ORA-00942 で失敗 → 残り全文スキップ → テーブル未作成となり、**2 回目以降も同じ状態が続いて永久に直らない**（前述「Importer の SQL 実行挙動」）。

**Oracle 23ai 未満での現実的な方針:**

| 方針 | 挙動 |
|---|---|
| DDL には **素の `CREATE TABLE` のみを書き、`DROP` を混ぜない** | 初回に作成成功。2 回目以降は先頭の `CREATE` が ORA-00955 で止まり以降スキップされるが、テーブルは初回に全て作成済みのため実害なし。ログにエラーは出続ける |
| 拡張インポート（`doImport`）でテーブルを作成する | JS 側で存在チェックしてから `TenantDatabase` で `CREATE` を発行すれば、Importer の SQL 分割制約を受けない（[extends-import.md](extends-import.md)） |

いずれの場合も、初回にテーブルが確実に作成されること・2 回目のログのエラーが想定内であることを検証すること。

## DML のべき等性

DDL と同様、**単純な `INSERT INTO ... VALUES (...)` は 2 回目で一意制約違反になる。**

| 手法 | 説明 | 方言依存 |
|---|---|---|
| **`INSERT ... WHERE NOT EXISTS`** | 存在しない場合のみ INSERT（推奨） | なし |
| **`DELETE` してから `INSERT`** | 同じ DML ファイル内で洗い替え | なし |
| `MERGE` / `ON CONFLICT` / `IF NOT EXISTS` | `dmlPerDialect: true` が必要 | **あり** |
| 拡張インポートで洗い替え | DML を使わず `doImport` で実装（[extends-import.md](extends-import.md)） | なし |

```sql
INSERT INTO any_app_data (data_id, tenant_id, data_type)
SELECT 'sample_001', 'default', 'SAMPLE'
WHERE NOT EXISTS (SELECT 1 FROM any_app_data WHERE data_id = 'sample_001');
```

## ファイル構成

| ファイル | 内容 |
|---------|------|
| `<key>-ddl_postgre.sql` / `_oracle.sql` / `_sqlserver.sql` | CREATE TABLE 文（常に 3 方言別） |
| `<key>-dml.sql` | サンプルデータ INSERT 文（全 DB 共通、`dmlPerDialect: false` 時） |
| `<key>-dml_postgre.sql` / `_oracle.sql` / `_sqlserver.sql` | 同（`dmlPerDialect: true` 時） |

> **テナント環境セットアップ側の `<key>_sample-dml.sql` とは別物**。あちらは**実運用の初期データ**を投入する DML で、`basic/<key>/<version>/` に置かれる（`jssp-tenant-setup-generator` の管轄）。

config での参照は suffix なし。順序は DDL → DML:

```xml
<database>
  <create-file>products/import/sample/<key>/<key>-ddl.sql</create-file>
  <insert-file>products/import/sample/<key>/<key>-dml.sql</insert-file>
</database>
```

## spec.json での記述

```json
"database": {
  "tables": [
    { "name": "any_app_data", "comment": "サンプルデータ" },
    { "name": "any_app_demo", "comment": "デモ用テーブル", "ddl": true }
  ],
  "dmlPerDialect": false
}
```

| フィールド | 必須 | デフォルト | 内容 |
|-----------|------|---------|------|
| `tables[].name` | YES | - | テーブル名 |
| `tables[].comment` | NO | - | テーブルの説明（コメントに展開される） |
| `tables[].ddl` | NO | `false` | `true` で DDL（`CREATE TABLE`）のスケルトンを生成する。**サンプルデータセットアップ専用テーブルのみに指定する** |
| `dmlPerDialect` | NO | `false` | DML を 3 方言別ファイルで出力するか |

`ddl: true` のテーブルが 1 件も無ければ DDL ファイルは生成されず、config に `<create-file>` も出力されない。

`database` を省略すると SQL ファイルは生成されず、config から `<database>` セクションも省かれる。

## 注意

- **SQL 文中のコメントには対応していない**（仕様）。build スクリプトはガイド用にコメント行を含むスケルトンを出力するため、**実装したらコメント行は削除すること**
- SQL 文の終端にはセミコロン `;` を記述する
- DML はマスタ系の初期データに限定する。**業務トランザクションのデータは入れない**
- `ddl` を指定しないテーブルは、テナント環境セットアップの DDL で作成済みであること
- 文字コードは UTF-8（BOM なし）、改行は LF を推奨
- **サンプルデータセットアップを 2 回連続で実行して検証すること**（[checklist.md](checklist.md)）
