---
name: jssp-page-verifier
description: JSSP コード生成後の検証・修正スキル。jssp-page-generator のステップ 7〜10 をサブエージェントとして担当する。validate-jssp-code.js・validate-ddl.js・check-types.sh の実行と post-generation-verification.md の全チェックを行い、エラーを 0 件に修正する。
---

# JSSP 生成後検証スキル

jssp-page-generator で生成したコードの品質検証・修正を担当する。
以下のステップを**上から順に**実行し、エラーが 0 件になるまで修正を繰り返すこと。ただし「修正ループの原則」を必ず守ること。

---

## 修正ループの原則（重要・全ステップ共通）

**「1件見つけて直す → 再実行 → 次の1件を見つけて直す → 再実行」という逐次ループは禁止する。** 各検証ツールは1回の実行で検出可能な全項目を一度に報告する仕様であり、逐次ループは同じ手戻りを不必要に繰り返すだけで、検証全体の所要時間を大きく悪化させる。

1. 検証コマンドを実行し、**出力された全項目を一度に列挙する**（先頭の1件だけを見て直し始めない）
2. 列挙した全項目を、**1回の編集パスでまとめて修正する**（複数ファイル・複数箇所にまたがってもよい。1件ずつ Edit → 実行 → Edit → 実行を繰り返さない）
3. 修正後、**同じ検証コマンドを1回だけ再実行**し、0件 / 0 issues になったことを確認する
4. 再実行後もまだ項目が残っている場合（新規に顕在化した問題や見落とし）に限り、2〜3 をもう一度だけ繰り返す。理想は「初回検出 → 一括修正 → 再検証」の2ラウンドで完了させること

**同一アンチパターンの複数箇所ヒット**（例: DbParameter ラップ漏れが5箇所）は、検証ツールの出力に現れた箇所だけを直すのではなく、`grep` で同じパターンを持つ他の箇所も先に洗い出してから、まとめて修正する。

---

## ステップ 1〜3: 自動検証（一括実行 → 一括修正 → 一括再検証）

`validate-jssp-code.js` / `check-types.sh` / （該当時のみ）`validate-ddl.js` は、**個別に検出→修正→再検証のループを回さず、3ツールをまとめて1セットとして扱う**。

### 1回目の実行（検出のみ。この時点ではまだ修正しない）

```bash
node .agents/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
bash .agents/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{機能名}/
```

DDL を生成した場合のみ、以下も同時に実行する（DDL パスの指定がなければスキップ）。

```bash
node .agents/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
```

3ツールの出力を**すべて集めてから**次に進むこと。「`validate-jssp-code.js` の結果を直してから `check-types.sh` を流す」という順序で進めない（tsc 側のエラーが後から発覚し、それだけのために再ループが発生する原因になる）。

**注意:** これらのスクリプトは 1 回の呼び出しにつき 1 個のパス（ディレクトリまたは単一ファイル）のみ受け付ける。複数ファイルをまとめて検証したい場合は、個々のファイルを列挙せず共通の親ディレクトリを渡すこと（複数パスを渡すとエラーで停止する）。

### 検出パターン: validate-jssp-code.js（JSSP コード検証）

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

> **JSSP-JS-027 / JSSP-JS-028 警告が出た場合:** `DbParameter.string(x)` を `DbParameter.timestamp(new Date(x))` や `DbParameter.date(new Date(x))` に書き換えるだけで終わらせない。`new Date(文字列)` は Rhino ではパースが不安定で `JSSP-JS-016` を新たに誘発し、ラウンドが余計に増える原因になる。**最初から** `DbParameter.timestamp(parseLocalDateTime(x))` / `DbParameter.date(parseLocalDateTime(x))` の完成形で直すこと（`parseLocalDateTime()` ヘルパーの実装は `post-generation-verification.md` 3-9 参照。ファイル内に未定義なら併せて追加する）。この2ルールは変数名ヒューリスティックによる検出のため、**同一アンチパターンの複数箇所ヒット**の原則に従い、`grep` で `DbParameter.string(` に日時系変数を渡している他の箇所も一度に洗い出してから、まとめて完成形に修正すること。

### 検出パターン: check-types.sh（tsc 型チェック）

- `result.data === 0` のような型の不一致（更新件数は `result.countRow`）
- d.ts に存在しないメソッド・プロパティへのアクセス

### 検出パターン: validate-ddl.js（DDL 型検証、DDL を生成した場合のみ）

- PostgreSQL の DDL に `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB` が使われている
- Oracle の DDL に `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN` が使われている
- SQLServer の DDL に `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN` が使われている
- `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` が DDL に含まれている（インポート失敗の原因）
- `CHECK` / `FOREIGN KEY` / `EXCLUDE` 制約が CREATE TABLE 内または ALTER TABLE で定義されている
- 共通 DML ファイル（`*-dml.sql`）に ODBC エスケープ `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}` が使われている

### 一括修正 → 1回だけ再検証

上記で集めた全項目を「修正ループの原則」に従って1回の編集パスでまとめて修正し、実行した全ツール（validate-jssp-code.js / check-types.sh / (該当時) validate-ddl.js）を**まとめて1回だけ**再実行して、すべて 0 件 / 0 issues になったことを確認する。まだ残っている場合のみ、このサイクルをもう一度だけ繰り返す。

---

## ステップ 4: 手動チェック

`post-generation-verification.md` は約580行あり、対象画面に無関係なカテゴリ（DB操作・imACMSearch・IM-Workflow等）まで含めて全文読んで突き合わせると、画面が大きい場合に検証全体の半分近くの時間を占めることがある。
以下の**事前判定 → 適用項目のみ確認**の手順で、無駄な読み込み・推論を避けること。

### ステップ 4-0: 自動検出済み項目のスキップ

`post-generation-verification.md` の各項目のうち、「`validate-jssp-code.js` の `JSSP-XXX-NNN` が自動検出する」と明記されている項目は、**ステップ1が0件（クリーン）であれば再確認不要**。該当項目は以下（2026年時点の対応表、doc側の記載が優先）:

| 自動検出ルール | 対応する doc セクション |
|---|---|
| `JSSP-SQL-001` | 1-2（`/*BEGIN*/` の使用） |
| `JSSP-JS-024` | 3-4（`include()` 誤用） |
| `JSSP-JS-025` | 3-4（`load()` の `.js` 拡張子誤り） |
| `JSSP-JS-026` | 3-7（`Transaction.begin` 戻り値未受領） |
| `JSSP-JS-027` | 3-9（日時系変数名への `DbParameter.string` warning） |
| `JSSP-HTML-015` | 5-1（`imdsConfirm` インライン定義） |
| `JSSP-HTML-017` | 4-3（`window._` ブリッジ） |

同様に「2. tsc 型チェック」セクションは本 SKILL の「ステップ 1〜3」内 `check-types.sh` と同一内容のため、**再読み込み・再実行しない**。

### ステップ 4-1: 適用範囲の事前判定（grep）

残りの項目（自動検出タグが付いていない項目）は、対象ファイルに該当パターンが存在する場合のみ確認する。**1回の Bash 呼び出しで以下をまとめて実行**し、ヒットしたカテゴリのみ次のステップ 4-2 に進む。

```bash
TARGET=src/main/jssp/src/{機能名}
echo "[SQLファイル]"; find "$TARGET" -name "*.sql" | head -5
echo "[DBアクセス]"; grep -rlE "db\.(select|execute)\(|executeByTemplate|fetchByTemplate" "$TARGET" --include=*.js
echo "[Date変数パース]"; grep -rnE "new Date\([a-zA-Z_]" "$TARGET" --include=*.js
echo "[imACMSearch]"; grep -rl "imACMSearch" "$TARGET" --include=*.html
echo "[画面間パラメータ渡し]"; grep -rlE "location\.href.*\?|<a[^>]+href=\"[^\"]*\?" "$TARGET" --include=*.html
echo "[IM-Workflow]"; find "$TARGET" -maxdepth 1 -type d -name workflow
```

ヒットが0件のカテゴリは、レポートに「対象外（grep確認済み、該当パターンなし）」とだけ記載し、**doc の該当セクションを Read しない**。

### ステップ 4-2: 適用項目のみ確認

grep でヒットしたカテゴリについてのみ、`.agents/skills/jssp-page-generator/reference/post-generation-verification.md` の**該当セクションだけ**を Read ツールで開く（オフセット指定で部分読み込みし、全文は読まない）。該当セクションの指示に従い、対象ファイルの中身と突き合わせて確認・修正する。

| カテゴリ | doc セクション（目安の行範囲） |
|---|---|
| SQLファイル / DBアクセス | 1. SQLファイル検証（13-63行）、3-1 DbParameterラップ（92-118行）、3-5 内部テーブル参照禁止（404-410行）、3-9 PostgreSQL型厳格性（362-402行） |
| Date変数パース | 3-2 Rhino の Date 文字列パース制限（139-166行）、3-3 DBタイムスタンプの正規化（168-195行）、3-8 java.sql.Timestamp の扱い（305-360行） |
| imACMSearch | 4. imACMSearch連携検証（412-496行） |
| 画面間パラメータ渡し | 5-2（528-569行） |
| IM-Workflow | 6.（571-577行） |

DB アクセスがない画面（本プロジェクトのダミーデータ・モック関数のみで完結する画面等）では、この事前判定によりステップ4のほぼ全項目が「対象外」になり、doc 全文の読み込み自体が不要になる。

---

## 完了後の報告

以下の形式でサマリーを返すこと:

| ステップ | 結果 |
|---------|------|
| ステップ 1（JSSP コード） | X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 2（DDL） | スキップ / X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 3（tsc） | X issues → 修正済み / 0 issues（クリーン） |
| ステップ 4（手動チェック） | X 件指摘 → 修正済み / 指摘なし |
