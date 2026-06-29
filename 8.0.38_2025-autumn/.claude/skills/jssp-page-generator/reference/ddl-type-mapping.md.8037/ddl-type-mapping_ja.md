---
paths:
  - "src/main/storage/system/products/import/basic/**/*.sql"
---

# DDL 型マッピングリファレンス

## 概要

intra-mart Accel Platform がサポートする DB 製品ごとの推奨型マッピング。
DDL 生成時は本リファレンスに従って型を選択すること。

## 型マッピング表

| 用途 | Oracle | PostgreSQL | SQLServer | 備考 |
|------|--------|------------|------------|------|
| 文字列（2バイト文字を含まない） | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | PostgreSQL はサイズ指定が文字数のため、厳密には他 DB とサイズが異なる |
| 文字列（2バイト以上の文字を含む） | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | Oracle は VARCHAR2（NVARCHAR2 ではない）。全 DB 共通：カラムサイズは想定文字数の4倍を確保する |
| 数値 | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | Oracle は NUMBER のエイリアスとして DECIMAL を持つが、明示的に NUMBER とする |
| 日付 | DATE | DATE | DATETIME2 | SQLServer は DATETIME2 を使用する |
| 時刻 | DATE | TIME | DATETIME2 | SQLServer は DATETIME2 を使用する。PostgreSQL は with timezone を指定しない |
| 日時 | TIMESTAMP | TIMESTAMP | DATETIME2 | PostgreSQL は with timezone を指定しない |
| 真偽値（フラグ） | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false, `'1'`=true。DB 固有の BOOLEAN/BIT は使わず CHAR(1) で統一する |
| 長い文字列 | CLOB | TEXT | NVARCHAR(max) | LIKE 等の WHERE 条件での使用は禁止（未対応・パフォーマンス問題） |

## DbParameter との対応

| DbParameter メソッド | DDL での用途 | Oracle | PostgreSQL | SQLServer | 備考 |
|---------------------|-------------|--------|------------|------------|------|
| `DbParameter.string()` | 文字列カラム | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | - |
| `DbParameter.number()` | 数値カラム | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | - |
| `DbParameter.date()` | 日付カラム | DATE | DATE | DATETIME2 | - |
| `DbParameter.timestamp()` | 日時カラム | TIMESTAMP | TIMESTAMP | DATETIME2 | - |
| `DbParameter.string()` | 真偽値カラム（フラグ） | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false, `'1'`=true |

## カラムサイズの目安

| 用途 | 想定文字数 | サイズ指定（4倍） | 例 |
|------|----------|-----------------|-----|
| コード類（ID、区分値） | 〜64文字 | 256 | VARCHAR2(256) / VARCHAR(256) / NVARCHAR(256) |
| 名前（ユーザ名、部署名等） | 〜50文字 | 200 | VARCHAR2(200) / VARCHAR(200) / NVARCHAR(200) |
| 短い説明（備考等） | 〜500文字 | 2000 | VARCHAR2(2000) / VARCHAR(2000) / NVARCHAR(2000) |
| 日付文字列（yyyy/MM/dd） | 10文字 | 40 | VARCHAR2(40) / VARCHAR(40) / NVARCHAR(40) |

## 注意事項

- Oracle の文字列型は `VARCHAR2` を使用すること（`VARCHAR` や `NVARCHAR2` ではない）
- PostgreSQL の `VARCHAR(n)` のサイズ指定は文字数単位（バイト数ではない）
- SQLServer の文字列型は `NVARCHAR` を使用すること（Unicode 対応）
- PostgreSQL の `TIMESTAMP` / `TIME` には `with timezone` を指定しないこと
- `CLOB` / `TEXT` / `NVARCHAR(max)` は WHERE 条件での使用禁止

## DDL に含めてよい構文

DDL ファイルは **テーブル定義・主キー・一意制約・インデックスのみ** を記述する。
関数・トリガーを含めると DB 製品・バージョン・データ型の組み合わせでインポートに失敗するケースが多いため禁止する。

| 構文 | 可否 | 備考 |
|------|------|------|
| `CREATE TABLE` | OK | カラム定義・PK・UNIQUE のみ |
| `CONSTRAINT ... PRIMARY KEY` | OK | テーブル内 |
| `CONSTRAINT ... UNIQUE` | OK | テーブル内 |
| `CREATE INDEX` | OK | スキャン高速化用 |
| `CREATE FUNCTION` / `CREATE PROCEDURE` | **NG** | インポート失敗の原因 |
| `CREATE TRIGGER` | **NG** | インポート失敗の原因 |
| `CREATE VIEW` | **NG** | 使用しない |
| `CHECK` 制約 | **NG** | 値の検証はアプリ層で |
| `FOREIGN KEY` 制約 | **NG** | 参照整合性はアプリ層で |
| `EXCLUDE` 制約 | **NG** | 製品・データ型依存で失敗する |
| `ALTER TABLE ... ADD CONSTRAINT` で上記の禁止制約を追加 | **NG** | そもそも制約自体が禁止 |

### DB レベル排他制御が必要な場合

時間帯重複排他のような業務ルール (BR-001 相当) を DDL で実装する誘惑はあるが、
すべての DB 製品で動作するトリガー／関数実装は製品・バージョン差分でトラブルが頻発する。
以下の方針で**必ずアプリケーション層で担保**すること。

```javascript
// rm_reservation_service.js 等
function createReservation(data) {
  Transaction.begin(function() {
    ensureNoOverlap(data.roomId, data.startAt, data.endAt, null);  // SELECT で既存予約との重なりを確認
    db.executeByTemplate('/xxx/sql/insert_reservation', { ... }); // 問題なければ INSERT
  });
}
```

**検証方法:** `validate-ddl.js` が `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` / `EXCLUDE` / `CHECK` / `FOREIGN KEY` を自動検出する。

## サンプル DML（`*-dml_<dialect>.sql`）で禁止する構文

サンプル DML は PostgreSQL / Oracle / SQLServer の 3 製品共通で実行できる形で記述する。
JDBC / ODBC ドライバ依存のエスケープ構文（`{d}` `{t}` `{ts}` `{fn}` `{oj}` `{call}`）は、
PostgreSQL のネイティブパーサでは解釈されず `ERROR: "{" またはその近辺で構文エラー` になる。

### 代替手段

| 用途 | NG（ODBC エスケープ） | OK（標準 SQL） |
|------|----------------------|----------------|
| 日付リテラル | `{d '2026-01-01'}` | `'2026-01-01'`（DATE / DATETIME2 カラムへ暗黙変換） |
| 時刻リテラル | `{t '09:00:00'}` | `'09:00:00'`（TIME / DATETIME2 カラムへ暗黙変換） |
| タイムスタンプ | `{ts '2026-01-01 09:00:00'}` | `'2026-01-01 09:00:00'`（TIMESTAMP / DATETIME2 カラムへ暗黙変換） |
| 関数呼び出し | `{fn UCASE(col)}` | `UPPER(col)` 等、各 DB の標準関数 |
| 外部結合 | `{oj LEFT OUTER JOIN ...}` | `LEFT OUTER JOIN ...` |
| プロシージャコール | `{call proc(...)}` | サンプル DML では使わない（アプリ側で実装） |

**検証方法:** `validate-ddl.js` が `*-dml_<dialect>.sql` ファイルに対して 6 種類の ODBC エスケープパターンを自動検出する（[DML] プレフィックス付きで ERROR 出力）。
