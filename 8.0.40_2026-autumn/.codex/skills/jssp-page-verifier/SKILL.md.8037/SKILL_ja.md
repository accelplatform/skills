---
name: jssp-page-verifier
description: JSSP コード生成後の検証・修正スキル。jssp-page-generator のステップ 7〜10 をサブエージェントとして担当する。validate-jssp-code.js・validate-ddl.js・check-types.sh の実行と post-generation-verification.md の全チェックを行い、エラーを 0 件に修正する。
---

# JSSP 生成後検証スキル

jssp-page-generator で生成したコードの品質検証・修正を担当する。
以下のステップを**上から順に**実行し、エラーが 0 件になるまで修正を繰り返すこと。

---

## ステップ 1: JSSP コード検証

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

**エラーが 0 件になるまで修正を繰り返す。**

検出される主なパターン:
- `db.select()` / `db.execute()` のパラメータが `DbParameter` でラップされていない
- `DbParameter.number()` に文字列が渡される（`Number()` 変換漏れ）
- `var` の使用（`let` を使うこと）
- `imds-selectbox`（存在しないクラス名。正しくは `imds-select`）
- `imuiCalendar` の altField が hidden input を参照
- imart タグの value 属性がクォートで囲まれている
- `include('**/common/**')` による共通モジュールの読み込み（正しくは `load()`）
- `load('**/*.js')` のように `.js` 拡張子を付けた呼び出し（拡張子は自動付与されるため `.js.js` になり FileNotFoundException）
- `Transaction.begin(...)` の戻り値を受け取っていない
- TIMESTAMP/DATE カラムのバインドに `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|...)` のような日時系変数名が使われている（PostgreSQL で型キャストエラー）

> **JSSP-JS-022 警告が出た場合:** 対応する SQL ファイルを開き、該当パラメータが `/*IF param != null*/.../*END*/` で囲まれているか確認する。囲まれている → 誤検知（サマリーに「SQL 側の /*IF*/ ガード確認済み」と記載）。囲まれていない → `DbParameter.string(x || '')` 等の空文字フォールバックに修正する。

---

## ステップ 2: DDL 型検証（DDL を生成した場合のみ）

プロンプトで DDL パスが指定された場合のみ実行する。指定がなければスキップする。

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
```

**エラーが 0 件になるまで修正を繰り返す。**

検出される主なパターン:
- PostgreSQL の DDL に `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB` が使われている
- Oracle の DDL に `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN` が使われている
- SQLServer の DDL に `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN` が使われている
- `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` が DDL に含まれている（インポート失敗の原因）
- `CHECK` / `FOREIGN KEY` / `EXCLUDE` 制約が CREATE TABLE 内または ALTER TABLE で定義されている
- 共通 DML ファイル（`*-dml.sql`）に ODBC エスケープ `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}` が使われている

---

## ステップ 3: tsc 型チェック

```bash
bash {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{機能名}/
```

**0 issues になるまで修正を繰り返す。**

検出される主なパターン:
- `result.data === 0` のような型の不一致（更新件数は `result.countRow`）
- d.ts に存在しないメソッド・プロパティへのアクセス

---

## ステップ 4: 手動チェック

`{{AGENT_ROOT}}/skills/jssp-page-generator/reference/post-generation-verification.md` を Read ツールで開き、全ステップを実行する。

---

## 完了後の報告

以下の形式でサマリーを返すこと:

| ステップ | 結果 |
|---------|------|
| ステップ 1（JSSP コード） | X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 2（DDL） | スキップ / X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 3（tsc） | X issues → 修正済み / 0 issues（クリーン） |
| ステップ 4（手動チェック） | X 件指摘 → 修正済み / 指摘なし |
