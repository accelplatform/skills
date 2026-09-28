# テーブル定義（DDL）規約

> **適用範囲**: 🟢 **常時** — 新規テーブルの DDL を作成・変更する際に適用。テーブルは `storage/system` 配下の DDL/Importer 経由で作成され、JSSP（スクリプト開発モデル）・Java（JavaEE 開発モデル）のどちらでそのテーブルを利用する場合も、テーブル定義自体は開発モデルに依存せず本規約に従う。

## 概要

intra-mart Accel Platform がサポートする DB 製品（Oracle / PostgreSQL / SQLServer）ごとの推奨型マッピングと、テーブル・カラムの命名規約。
DDL 生成時は本リファレンスに従うこと。

## テーブル・カラム命名規約

- テーブル名・カラム名は**すべて小文字のスネークケース**（アンダースコア区切り）で命名すること
- **SQL 予約語はすべて大文字**で記述すること（`CREATE TABLE`, `NOT NULL`, `PRIMARY KEY` 等）
- テーブル名は `{ドメイン短縮prefix}_{タイプ}_{エンティティ名}` の形式を推奨する
  - タイプ: `m`（マスタ）, `t`（トランザクション）
  - 例: `exm_m_user`（マスタ）, `exm_t_order`（トランザクション）
  - `{ドメイン短縮prefix}` の具体的な値は、本規約では機械的な導出方法を規定しない。**ユーザ指示または仕様書で決定**すること
- 外部参照を表すカラム名は `{参照先エンティティ名}_{cd または id}` の形式とすること
  - 例: `user_cd`, `order_id`
- テーブル名・カラム名は **63 文字以内**とすること
  - 対応 DB（Oracle 19c 以降・PostgreSQL 14 以降・SQL Server 2016 以降）のうち、識別子長の制約が最も厳しい PostgreSQL の `NAMEDATALEN`（64、実質 63 バイトまで使用可）が実質的な上限になる

## 主キー設計

- 主キーは可能な限り**単一カラム**とすること（複合主キーは中間テーブル等、必要な場合のみ使用する）
- アプリケーション側で ID を発行する場合は `Identifier.get()`（SSJS: `.agents/skills/jssp-page-generator/reference/api-identifier.md`、Java: `jp.co.intra_mart.foundation.service.client.information.Identifier`）を使用し、対応するカラムは **`VARCHAR(15)`**（Oracle は `VARCHAR2(15)`、SQLServer は `NVARCHAR(15)`）とすること
  - `Identifier` は 15 バイト文字列を返すため

## DDL / サンプル DML のファイル名規約

DB 方言別ファイルの区切り文字は以下で統一する。

- DDL: `{機能名}-ddl_<dialect>.sql` — **`ddl` の前はハイフン（`-`）、方言サフィックス（`_postgre`/`_oracle`/`_sqlserver`）の前はアンダースコア（`_`）**
  - 例: `equip-ddl_postgre.sql`, `equip-ddl_oracle.sql`, `equip-ddl_sqlserver.sql`
  - `{機能名}_ddl_<dialect>.sql`（`ddl` の前もアンダースコア）は誤り
  - 方言サフィックスは `_postgre`（`_postgres` ではない）・`_oracle`・`_sqlserver` の3種。intra-mart Importer が接続先 DB に応じて自動付与するサフィックスと一致させる必要があるため、綴りを変えないこと
- サンプル DML: `{機能名}_sample-dml.sql`（全 DB 共通、**推奨**）。方言依存構文が必要な場合のみ `{機能名}_sample-dml_<dialect>.sql` とする（区切り文字は DDL と異なり、`sample` の前がアンダースコア、`dml` の前がハイフン）

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

## DbParameter との対応（JSSP）

JSSP（スクリプト開発モデル）で `TenantDatabase`/`SharedDatabase` を使う場合の対応。Java（`im_mirage`）側の型対応は `.agents/requirements/java-entity/AGENTS.md` を参照。

| DbParameter メソッド | DDL での用途 | Oracle | PostgreSQL | SQLServer | 備考 |
|---------------------|-------------|--------|------------|------------|------|
| `DbParameter.string()` | 文字列カラム | VARCHAR2(n) | VARCHAR(n) | NVARCHAR(n) | - |
| `DbParameter.number()` | 数値カラム | NUMBER(x, y) | DECIMAL(x, y) | DECIMAL(x, y) | - |
| `DbParameter.date()` | 日付カラム | DATE | DATE | DATETIME2 | - |
| `DbParameter.timestamp()` | 日時カラム | TIMESTAMP | TIMESTAMP | DATETIME2 | - |
| `DbParameter.string()` | 真偽値カラム（フラグ） | CHAR(1) | CHAR(1) | CHAR(1) | `'0'`=false, `'1'`=true |

## 監査証跡カラム（必須）

以下の 4 カラムをすべてのテーブルに含めること。

| カラム名 | 内容 | 型（PostgreSQL） | 型（Oracle） | 型（SQLServer） |
|---------|------|-----------------|-------------|-----------------|
| `create_user_cd` | 作成者コード | VARCHAR(100) NOT NULL | VARCHAR2(100) NOT NULL | NVARCHAR(100) NOT NULL |
| `create_date` | 作成日時 | TIMESTAMP NOT NULL | TIMESTAMP NOT NULL | DATETIME2 NOT NULL |
| `record_user_cd` | 最終更新者コード | VARCHAR(100) NOT NULL | VARCHAR2(100) NOT NULL | NVARCHAR(100) NOT NULL |
| `record_date` | 最終更新日時 | TIMESTAMP NOT NULL | TIMESTAMP NOT NULL | DATETIME2 NOT NULL |

- `create_user_cd`/`create_date` はレコード作成時、`record_user_cd`/`record_date` は更新時の監査証跡であり、アプリケーション側（ファンクションコンテナの INSERT/UPDATE、または Java の DAO/`AbstractDAO`）で設定すること（DDL にトリガー等を持たせて自動設定することは「DDL に含めてよい構文」により禁止）
- ユーザコード系カラム（`create_user_cd` / `record_user_cd` および業務カラムの `user_cd` 全般）は、想定文字数に関わらず **100 バイト固定**とする（半角英数字中心のコード値であり、下記「カラムサイズの目安」の4倍ルールは適用しない）
- Java（`im_mirage`）の Entity クラスでは `.agents/requirements/java-entity/AGENTS.md` の監査証跡フィールド規約（`createUserCd`/`createDate`/`recordUserCd`/`recordDate`）に対応させること。`AbstractDAO` の基本メソッド（insert/update）使用時は自動設定される

## カラムサイズの目安

| 用途 | 想定文字数 | サイズ指定（4倍） | 例 |
|------|----------|-----------------|-----|
| コード類（ID、区分値） | 〜64文字 | 256 | VARCHAR2(256) / VARCHAR(256) / NVARCHAR(256) |
| 名前（ユーザ名、部署名等） | 〜50文字 | 200 | VARCHAR2(200) / VARCHAR(200) / NVARCHAR(200) |
| 短い説明（備考等） | 〜500文字 | 2000 | VARCHAR2(2000) / VARCHAR(2000) / NVARCHAR(2000) |
| 日付文字列（yyyy/MM/dd） | 10文字 | 40 | VARCHAR2(40) / VARCHAR(40) / NVARCHAR(40) |

上記は日本語等の多バイト文字を含みうるカラムの目安。`user_cd` 等の半角英数字コードは上記の4倍ルールを適用せず、前述の監査証跡カラムと同じ **100 バイト固定**とする。

## 数値カラムの桁数目安

仕様書で桁数が明示されている場合はそちらを優先する。仕様書に規定が無い場合、全体桁数（精度）は **15 桁以内**をデフォルトとする。Java の `double` が誤差なく表現できる有効桁数（仮数部52bit ≒ 10進15〜16桁）を超えないようにするため。JSSP（Rhino/JavaScript）側でも数値は IEEE754 倍精度（`double` と同じ表現）で扱われるため、同様の理由が当てはまる。

| 用途 | 型 | 備考 |
|---|---|---|
| 整数（表示順・件数等） | DECIMAL(10, 0) / NUMBER(10) | 一般的な整数値であれば10桁で十分 |
| 金額 | DECIMAL(15, 2) | 整数部13桁 + 小数部2桁 = 15桁 |
| 汎用の小数 | DECIMAL(15, y) | `y` は要求精度に合わせて調整し、全体で15桁を超えないこと |

- 金額計算そのものは Java 側で `java.math.BigDecimal` を使う規約（`.agents/requirements/java-entity/AGENTS.md`）だが、DDL のカラムサイズ自体は上記デフォルトに従う（`BigDecimal` を使っても DB カラムの桁数上限までしか値を保持できないため）

## 注意事項

- Oracle の文字列型は `VARCHAR2` を使用すること（`VARCHAR` や `NVARCHAR2` ではない）
- PostgreSQL の `VARCHAR(n)` のサイズ指定は文字数単位（バイト数ではない）
- SQLServer の文字列型は `NVARCHAR` を使用すること（Unicode 対応）
- PostgreSQL の `TIMESTAMP` / `TIME` には `with timezone` を指定しないこと
- `CLOB` / `TEXT` / `NVARCHAR(max)` は WHERE 条件での使用禁止

## インデックス命名規則

- 単一カラムインデックス: `idx_{テーブル名}_{カラム名}`（例: `idx_exm_t_order_user_cd`）
- 複合インデックス: `idx_{テーブル名}_{カラム1}_{カラム2}`
- 一意制約: `uq_{テーブル名}_{カラム名}`
- 検索頻度の高いカラム・外部参照カラムには原則インデックスを設定し、使用予定のないインデックスは作成しないこと（更新性能低下の原因になる）

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

時間帯重複排他のような業務ルール (BR-001 相当) を DDL で実装する誘惑はあるが、すべての DB 製品で動作するトリガー／関数実装は製品・バージョン差分でトラブルが頻発する。
以下の方針で**必ずアプリケーション層で担保**すること。

```javascript
// rm_reservation_service.js 等（JSSP の場合）
function createReservation(data) {
  Transaction.begin(function() {
    ensureNoOverlap(data.roomId, data.startAt, data.endAt, null);  // SELECT で既存予約との重なりを確認
    db.executeByTemplate('/xxx/sql/insert_reservation', { ... }); // 問題なければ INSERT
  });
}
```

**検証方法（JSSP）:** `.agents/skills/jssp-page-generator/scripts/validate-ddl.js` が `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` / `EXCLUDE` / `CHECK` / `FOREIGN KEY` を自動検出する。

## サンプル DML（`*-dml_<dialect>.sql`）で禁止する構文

サンプル DML は PostgreSQL / Oracle / SQLServer の 3 製品共通で実行できる形で記述する。
JDBC / ODBC ドライバ依存のエスケープ構文（`{d}` `{t}` `{ts}` `{fn}` `{oj}` `{call}`）は、PostgreSQL のネイティブパーサでは解釈されず `ERROR: "{" またはその近辺で構文エラー` になる。

### 代替手段

| 用途 | NG（ODBC エスケープ） | OK（標準 SQL） |
|------|----------------------|----------------|
| 日付リテラル | `{d '2026-01-01'}` | `'2026-01-01'`（DATE / DATETIME2 カラムへ暗黙変換） |
| 時刻リテラル | `{t '09:00:00'}` | `'09:00:00'`（TIME / DATETIME2 カラムへ暗黙変換） |
| タイムスタンプ | `{ts '2026-01-01 09:00:00'}` | `'2026-01-01 09:00:00'`（TIMESTAMP / DATETIME2 カラムへ暗黙変換） |
| 関数呼び出し | `{fn UCASE(col)}` | `UPPER(col)` 等、各 DB の標準関数 |
| 外部結合 | `{oj LEFT OUTER JOIN ...}` | `LEFT OUTER JOIN ...` |
| プロシージャコール | `{call proc(...)}` | サンプル DML では使わない（アプリ側で実装） |

**検証方法（JSSP）:** `.agents/skills/jssp-page-generator/scripts/validate-ddl.js` が `*-dml_<dialect>.sql` ファイルに対して 6 種類の ODBC エスケープパターンを自動検出する（[DML] プレフィックス付きで ERROR 出力）。

## 関連

- `.agents/requirements/java-entity/AGENTS.md` - Java（Mirage ORM）Entity クラスの監査証跡フィールド・型対応
- `.agents/requirements/jssp-2way-sql/AGENTS.md` - JSSP 側の SQL 実行・`DbParameter` 型選択規約
- `.agents/skills/jssp-page-generator/reference/api-identifier.md` - Identifier API（SSJS）リファレンス
