---
name: tssp-page-verifier
description: TSSP コード生成後の検証・修正スキル。tssp-page-generator のステップ 7〜10 をサブエージェントとして担当する。tssp build --dev（型検査・Rhino 向け lint）・型検査の回避（any / @ts-ignore 等）の grep・validate-jssp-code.js（ビルド出力に対して実行）・validate-ddl.js の実行と post-generation-verification.md の全チェックを行い、エラーを 0 件に修正する。
allowed-tools: Bash, Read, Write, Edit, Glob
---

# TSSP 生成後検証スキル

tssp-page-generator で生成したコードの品質検証・修正を担当する。
以下のステップを**上から順に**実行し、エラーが 0 件になるまで修正を繰り返すこと。ただし「修正ループの原則」を必ず守ること。

検証では次の 2 か所を扱う。`src/main/jssp/src` の `.js` / `.html` は `tssp build` の出力なので手で編集せず、指摘は `src/main/tssp/src` 側を直して再ビルドすることで解消する。

| パス | 内容 |
|---|---|
| `src/main/tssp/src/{機能名}/` | ソースの `.ts` / `.html`。修正はここに行う |
| `src/main/jssp/src/{機能名}/` | `tssp build` の出力（`.js` / `.html` / `.js.map`）と 2WaySQL の `.sql`（`tssp build` は `.sql` を出力しないため、ここに置かれている。`.sql` への指摘はこのファイルを直接直す） |

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

ソースの置き場所の確認 / 型検査の回避の検出 / `tssp build --dev` / `validate-jssp-code.js` / （該当時のみ）`validate-ddl.js` は、**個別に検出→修正→再検証のループを回さず、まとめて1セットとして扱う**。ただし `validate-jssp-code.js` は `tssp build` の出力を検証するので、`tssp build` の後に、ビルドが成功した場合だけ実行する。

### 1回目の実行（検出のみ。この時点ではまだ修正しない）

最初に、プロジェクトのルートでソースの置き場所の確認、型検査の回避の検出（`.d.ts` の一覧と 2 つの grep）、`tssp build`（型検査・Rhino 向け lint）を実行する。`tssp build` を最後に置いているので、このブロックの終了コードは `tssp build` の終了コードになる。

`… がありません` と出力されたら、ソースが `src/main/tssp/src/{機能名}/` に無い（grep はディレクトリが無くても何も出力しないことがある）。検証を止めてソースの置き場所を直す。

`tssp build --dev` は package.json の `tssp:dev` スクリプトで実行する。`{パッケージマネージャ}` は、プロジェクトのパッケージマネージャ（`bun` / `npm` / `pnpm` / `yarn`）に置き換える。

```bash
test -d src/main/tssp/src/{機能名} || echo "src/main/tssp/src/{機能名} がありません"
find src/main/tssp -name '*.d.ts'
grep -rnE "\bany\b|@ts-(ignore|expect-error|nocheck)|^[[:space:]]*(export[[:space:]]+)?declare[[:space:]]|^[[:space:]]*///[[:space:]]*<reference" src/main/tssp/src/{機能名}/ --include='*.ts'
grep -rlE "^[[:space:]]*(declare[[:space:]]+global|///[[:space:]]*<reference)" src/main/tssp/src --include='*.ts'
{パッケージマネージャ} run tssp:dev
```

ビルドが成功した（終了コード 0）場合だけ、出力先に手で置いたファイルが無いかを確かめ、出力に対して `validate-jssp-code.js` を実行する（このスクリプトは `.js` / `.html` / `.sql` しか読まず、`.ts` は検証できない）。

`find` の行で出力されたファイルは `tssp build` の出力ではなく、`src/main/jssp/src` に手で置いたファイルである。今回生成・編集したファイルなら、`src/main/tssp/src/{機能名}/` の同じ相対パスに移して（`.js` は `.ts` に書き直して）再ビルドする。今回の対象でない既存のファイルは移さずにユーザへ報告する。

```bash
find src/main/jssp/src/{機能名} \( -name '*.ts' -o -name '*.js' -o -name '*.html' \) | grep -vxF -f .accel/tssp-generated.txt
node .claude/skills/tssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

ビルドが失敗した（終了コードが 0 以外）場合、出力は今回の `.ts` を反映していない（書き出し前の型検査・lint・変換・衝突検査で失敗したときは何も書き出さない）。このときは `validate-jssp-code.js` を実行せず（前回のビルドの出力を検証してしまう）、ビルドの指摘を直して成功させてから実行する。

DDL を生成した場合のみ、以下も同時に実行する（DDL パスの指定がなければスキップ）。

```bash
node .claude/skills/tssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
```

実行したツールの出力を**すべて集めてから**次に進むこと。「`validate-jssp-code.js` の結果を直してから型検査の回避の grep を流す」のように 1 ツールずつ直して次を流す順序で進めない（後から発覚したエラーのためだけに再ループが発生する原因になる）。

**注意:** `validate-jssp-code.js` / `validate-ddl.js` は 1 回の呼び出しにつき 1 個のパス（ディレクトリまたは単一ファイル）のみ受け付ける。複数ファイルをまとめて検証したい場合は、個々のファイルを列挙せず共通の親ディレクトリを渡すこと（複数パスを渡すとエラーで停止する）。

### 検出パターン: validate-jssp-code.js（ビルド出力の検証）

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

> **JSSP-JS-027 / JSSP-JS-028 警告が出た場合:** `DbParameter.string(x)` を `DbParameter.timestamp(new Date(x))` や `DbParameter.date(new Date(x))` に書き換えるだけで終わらせない。`new Date(文字列)` は Rhino ではパースが不安定で `JSSP-JS-016` を新たに誘発し、ラウンドが余計に増える原因になる。**最初から** `parseLocalDateTime()` で `Date` に変換する完成形で直すこと（ヘルパーの実装は `post-generation-verification.md` 3-8 参照。ファイル内に未定義なら併せて追加する）。このヘルパーの戻り値は `Date | null`、`DbParameter.timestamp()` / `DbParameter.date()` の引数は `Date` なので、`DbParameter.timestamp(parseLocalDateTime(x))` と直接渡すと `tssp build` が TS2345 で止まる。`let d = parseLocalDateTime(x);` で受けて `d !== null ? DbParameter.timestamp(d) : new DbParameter(null, DbParameter.TYPE_TIMESTAMP)` と書く（DATE 列は `DbParameter.date(d)` と `DbParameter.TYPE_DATE`）。SQL 側で `/*IF*/` により分岐するパラメータには、`new DbParameter(null, ...)` の代わりに素の `null` を渡す（`.claude/rules/jssp-2way-sql.md` の「【重要】`/*IF*/` で分岐する DATE / TIMESTAMP パラメータには素の `null` を渡す」参照）。この2ルールは変数名ヒューリスティックによる検出のため、**同一アンチパターンの複数箇所ヒット**の原則に従い、`grep` で `DbParameter.string(` に日時系変数を渡している他の箇所も一度に洗い出してから、まとめて完成形に修正すること。

> **ビルド出力への指摘の直し方:** 指摘の `file:line` は出力 `.js` の位置で、`.ts` とは行がずれる。指摘のコード片（関数名・変数名）で `src/main/tssp/src` の `.ts` を検索して直し、再ビルドする。`.html` への指摘も `src/main/tssp/src` 側の `.html` を直す。`.sql` への指摘だけは、`src/main/jssp/src` のファイルを直接直す。

> **`.ts` に書いていないコードが指摘された場合:** `var`（`JSSP-JS-002`）と `includes()`（`JSSP-JS-009`）は、tssp が `?.` / `??`、オブジェクトの spread / rest を変換するときに出力へ入れる一時変数・補助関数のもの。`.ts` からそれらの書き方を除き、明示的な `null` 比較やプロパティの代入で書く。アロー関数（`JSSP-JS-007`）とテンプレートリテラル（`JSSP-JS-012`）は `.ts` の書き方のまま出力されるので、`function` と `+` による連結に直す。`$data = JSON.stringify({ ... })` のようにオブジェクトリテラルを直接渡すと、出力で複数行に整形されて `JSSP-JS-020` になるので、変数に入れてから `$data = JSON.stringify(<変数>).replace(/\//g, '\\/');` を 1 行で書く。

### 検出パターン: tssp build（型検査・Rhino 向け lint）

`tssp build` は `src/main/tssp/src` 配下のすべての `.ts` を、型検査 → Rhino 向け lint の順に検査する。型エラーがあると lint は実行されないため、型エラーを直した後の再ビルドで lint 違反が初めて出ることがある。この追加のラウンドは想定どおりで、「修正ループの原則」の 4 に当たる。

- `result.data === 0` のような型の不一致（更新件数は `result.countRow`）
- d.ts に存在しないメソッド・プロパティ・グローバルへのアクセス（TS2339 / TS2304 等）。d.ts を Read して正しい名前・署名に直す
- `Request` はインデックスシグネチャ（`[key: string]: Request.Attribute`。`Request.Attribute` は `any`）を持つので、`request.getParamValue()` のように d.ts に無いメソッドを呼んでも `tssp build` は通る。`grep -rnoE "request\.[A-Za-z_]+\(" src/main/tssp/src/{機能名}/ --include='*.ts'` で呼び出しを列挙し、各メソッド名が `d.ts/platform/standard/im-ssjs-request.d.ts` にあることを確かめる
- 型注釈の無い引数（TS7006）、`catch (e)` の `e` を型を指定せずに参照（TS18046。`(e as Error).message` と書く）
- Rhino 1.7.15.1 で構文エラーになる書き方・意味が変わる書き方（`error rhino(no-default-param)` 等）。規則ごとの代わりの書き方は `tssp-usage` スキルの「Rhino 制約」を参照
- 出力先の衝突（`.accel/tssp-generated.txt` に無いファイルが出力先にある）。直し方は `tssp-usage` スキルの「衝突」を参照

対象機能の外の `.ts` でビルドが失敗している場合は、そのファイルを直さずにユーザへ報告する。

### 検出パターン: 型検査の回避（`.d.ts` の一覧と grep）

`tssp build` が成功しても、`.d.ts` の一覧と 2 つの grep のヒットはすべてエラーとして直す。ヒットが無ければ何も出力されない（grep の終了コードは 1）。コメントや文字列リテラルの中の英単語 "any" 等、コードでない箇所への一致は誤検知として除く。

| ヒット | 直し方 |
|---|---|
| `any`（`: any`、`as any`、`any[]`、`Record<string, any>` 等） | d.ts の型か、自前の `interface` で型を書く。型が決まらない値は `unknown` で受け、`typeof` 等で絞り込んでから使う |
| `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck` | 削除し、隠れていた型エラーを d.ts の署名に合わせて直す |
| `.d.ts` の一覧に出たファイルと、行頭の `declare` | 削除する。`.d.ts` の `interface` は `declare` が無くても d.ts のクラスやグローバルに宣言を足せるが、実行時には存在しない。型を共有するなら `.ts` に `export interface` を書き `import type` で読む。`load()` で読み込む共通モジュールの名前は `import` で参照する（`post-generation-verification.md` 3-4 参照）。d.ts に無い API は使わず、ユーザに報告する。対象機能の外の `.d.ts` は直さずにユーザへ報告する。ルートか `src/main/tssp/` の `tsconfig.json` の `include` に `d.ts/` 以外の `.d.ts` を足すのも同じ回避で、`find` には出ない。その `tsconfig.json` は直さずにユーザへ報告する |
| 行頭の `/// <reference` | 削除する。`/// <reference path="..." />` は `src/main/tssp` の外（`find` に出ない場所）の `.d.ts` も型検査に取り込み、`.d.ts` を置くのと同じ回避になる |
| 2 つ目の grep に出た、対象機能の外の `.ts`（`declare global`） | 直さずにユーザへ報告する。`declare global` は宣言したファイルの外の `.ts` の型検査にも効くので、対象機能の型検査も回避される。対象機能の `.ts` の `declare global` は 1 つ目の grep にも出るので、行頭の `declare` と同じく削除する |

### 検出パターン: validate-ddl.js（DDL 型検証、DDL を生成した場合のみ）

- PostgreSQL の DDL に `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB` が使われている
- Oracle の DDL に `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN` が使われている
- SQLServer の DDL に `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN` が使われている
- `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` が DDL に含まれている（インポート失敗の原因）
- `CHECK` / `FOREIGN KEY` / `EXCLUDE` 制約が CREATE TABLE 内または ALTER TABLE で定義されている
- 共通 DML ファイル（`*-dml.sql`）に ODBC エスケープ `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}` が使われている

### 一括修正 → 1回だけ再検証

上記で集めた全項目を「修正ループの原則」に従って1回の編集パスでまとめて修正し（修正先は `src/main/tssp/src` の `.ts` / `.html`。`.sql` だけは `src/main/jssp/src` のファイル）、1回目と同じブロック（ソースの置き場所の確認と、型検査の回避の検出（`.d.ts` の一覧と 2 つの grep）を含む）を `tssp build --dev` → `validate-jssp-code.js` → （該当時）`validate-ddl.js` の順に**まとめて1回だけ**再実行して、すべて 0 件 / 0 issues になったことを確認する。まだ残っている場合のみ、このサイクルをもう一度だけ繰り返す。

---

## ステップ 4: 手動チェック

`post-generation-verification.md` は約580行あり、対象画面に無関係なカテゴリ（DB操作・imACMSearch・IM-Workflow等）まで含めて全文読んで突き合わせると、画面が大きい場合に検証全体の半分近くの時間を占めることがある。
以下の**事前判定 → 適用項目のみ確認**の手順で、無駄な読み込み・推論を避けること。

### ステップ 4-0: 自動検出済み項目のスキップ

`post-generation-verification.md` の各項目のうち、「`validate-jssp-code.js` の `JSSP-XXX-NNN` が自動検出する」と明記されている項目は、**ステップ 1（`validate-jssp-code.js`）が0件（クリーン）であれば再確認不要**。該当項目は以下（doc側の記載が優先）:

| 自動検出ルール | 対応する doc セクション |
|---|---|
| `JSSP-SQL-001` | 1-2（`/*BEGIN*/` の使用） |
| `JSSP-JS-024` | 3-4（`include()` 誤用） |
| `JSSP-JS-025` | 3-4（`load()` の `.js` 拡張子誤り） |
| `JSSP-JS-026` | 3-7（`Transaction.begin` 戻り値未受領） |
| `JSSP-JS-027` | 3-9（日時系変数名への `DbParameter.string` warning） |
| `JSSP-HTML-015` | 5-1（`imdsConfirm` インライン定義） |
| `JSSP-HTML-017` | 4-3（`window._` ブリッジ） |

同様に「2. tssp build（型検査・Rhino 向け lint）」セクションは本 SKILL の「ステップ 1〜3」内 `tssp build --dev` と同一内容のため、**再読み込み・再実行しない**。

### ステップ 4-1: 適用範囲の事前判定（grep）

残りの項目（自動検出タグが付いていない項目）は、対象ファイルに該当パターンが存在する場合のみ確認する。**1回の Bash 呼び出しで以下をまとめて実行**し、ヒットしたカテゴリのみ次のステップ 4-2 に進む。

```bash
SRC=src/main/tssp/src/{機能名}
OUT=src/main/jssp/src/{機能名}
echo "[SQLファイル]"; find "$OUT" -name "*.sql" | head -5
echo "[DBアクセス]"; grep -rlE "db\.(select|execute)\(|executeByTemplate|fetchByTemplate" "$SRC" --include='*.ts'
echo "[Date変数パース]"; grep -rnE "new Date\([a-zA-Z_]" "$SRC" --include='*.ts'
echo "[imACMSearch]"; grep -rl "imACMSearch" "$SRC" --include='*.html'
echo "[画面間パラメータ渡し]"; grep -rlE "location\.href.*\?|<a[^>]+href=\"[^\"]*\?" "$SRC" --include='*.html'
echo "[IM-Workflow]"; find "$SRC" -maxdepth 1 -type d -name workflow
```

ヒットが0件のカテゴリは、レポートに「対象外（grep確認済み、該当パターンなし）」とだけ記載し、**doc の該当セクションを Read しない**。

### ステップ 4-2: 適用項目のみ確認

grep でヒットしたカテゴリについてのみ、`.claude/skills/tssp-page-generator/reference/post-generation-verification.md` の**該当セクションだけ**を Read ツールで開く（オフセット指定で部分読み込みし、全文は読まない）。該当セクションの指示に従い、対象ファイルの中身と突き合わせて確認・修正する。

| カテゴリ | doc セクション（目安の行範囲） |
|---|---|
| SQLファイル / DBアクセス | 1. SQLファイル検証（14-64行）、3-1 DbParameterラップ（92-118行）、3-5 内部テーブル参照禁止（420-426行）、3-9 PostgreSQL型厳格性（371-418行） |
| Date変数パース | 3-2 Rhino の Date 文字列パース制限（139-166行）、3-3 DBタイムスタンプの正規化（168-195行）、3-8 java.sql.Timestamp の扱い（314-369行） |
| imACMSearch | 4. imACMSearch連携検証（428-512行） |
| 画面間パラメータ渡し | 5-2（544-585行） |
| IM-Workflow | 6.（587-591行） |

DB アクセスがない画面（本プロジェクトのダミーデータ・モック関数のみで完結する画面等）では、この事前判定によりステップ4のほぼ全項目が「対象外」になり、doc 全文の読み込み自体が不要になる。

---

## 完了後の報告

以下の形式でサマリーを返すこと:

| ステップ | 結果 |
|---------|------|
| ステップ 1〜3（ソースの置き場所） | X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 1（ビルド出力） | X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 2（DDL） | スキップ / X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 3（tssp build） | X 件検出 → 修正済み / 0 件（ビルド成功） |
| ステップ 3（型検査の回避） | X 件検出 → 修正済み / 0 件（クリーン） |
| ステップ 4（手動チェック） | X 件指摘 → 修正済み / 指摘なし |
