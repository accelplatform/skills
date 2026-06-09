---
name: jssp-page-generator
description: intra-mart JSSP の画面・ファンクションコンテナ・共通処理・ルーティング設定を新規生成する。画面を作成、新しいページを追加、JSSP ファイルを作って、フォームを実装して、一覧画面を作成して、入力画面を追加して、と言及されたときに使用。CRUD 画面やフォーム画面の生成にはこのスキルを起点にすること。init関数を含むサーバサイド処理もこのスキルの対象。ジョブスケジューラのバッチ処理は jssp-im-job-generator、ワークフロー関連は jssp-im-workflow-usage を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# JSSP コード生成支援スキル

## 目的

intra-mart Accel Platform の JSSP コードを新規に生成するためのスキルセット。
テンプレートや規約に従って、新規ファイルを作成・構成するための手順を説明する。

## 生成対象

- **ファンクションコンテナ** (.js) - サーバサイドロジック（init 関数がエントリーポイント）
- **プレゼンテーションページ** (.html) - 画面表示
- **共通処理** (.js) - サーバサイドの共通処理
- **ルーティング設定** (.xml) - URL 設定

※ ジョブプログラムは `jssp-im-job-generator`、ワークフロー関連は `jssp-im-workflow-usage` を使うこと。

## 参照すべき規約

本スキルは `.js`（ファンクションコンテナ）+ `.html`（プレゼンテーションページ）の両方を生成するため、関連規約が多い。全体像は `rules/README.md` の「規約ファイル一覧（一行要約 + 適用範囲タグ）」を参照。本スキル特有の重要度:

| 規約 | 取り扱い |
|------|---------|
| `jssp-presentation-page.md` | 🟢 **必読** — `.html` の HTML 構造・バリデーション・id 命名 |
| `jssp-function-container.md` | 🟢 **必読** — `init()` 構造・validateRequest |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 必読 |
| `jssp-error-handling.md` / `jssp-security.md` | 🟢 必読 — フォーム入力 + API があるため両方関連 |
| `jssp-2way-sql.md` | 🟡 **DB 操作を含む実装の場合のみ参照**。読み取り専用 UI 等 DB に触れない画面では不要 |
| `jssp-logging.md` | 🟡 ログ実装時のみ |
| `jssp-accessibility.md` | 🟠 **業務要件次第** — 仕様書で明示要求があった場合のみ厚く適用。指示がなければ最小限（`imdsConfirm`、`aria-label`、装飾アイコンの `aria-hidden` 等の基本）に留める |

## 使用タイミング

ユーザが以下のような依頼をした場合：
- 「○○画面を作成して」
- 「新しい JSSP ファイルを追加」
- 「一覧画面を作って」
- 「入力フォームを実装して」
- 「CRUD 画面を作成して」

---

## 統合ワークフロー

**このワークフローを上から順番に実行すること。ステップの省略・順序変更は禁止。**
各ステップは完了してから次へ進むこと。ユーザへの報告はステップ 11 完了後に行う。

---

### ステップ 1: 要件ヒアリング

ユーザから以下を確認する。

- 画面名・機能の概要
- 配置パス（`src/main/jssp/src/` 配下のどこに置くか）
- 新規テーブルが必要かどうか
- **画面が IM-共通マスタの値（ユーザ・組織・会社・グループ・ロール）を入力させるフィールドを含むかどうか** → 含む場合は `jssp-im-master-usage` スキルを併用してマスタ検索ダイアログとして実装する（自前 `<input>` でのコード手打ち入力は禁止）

---

### ステップ 2: アセットサンプルの読み込み

画面タイプに応じて、対応するアセットファイルを **Read ツールで開いて読み込む。**
このステップを省略してはならない。アセットには imds 準拠の構造・クラス名の使用例が含まれている。

| 画面タイプ | 読み込むファイル |
|-----------|----------------|
| 入力フォーム | `assets/simple-form.md` |
| 一覧画面 | `assets/simple-list.md` |
| ウィザード | `assets/simple-wizard.md` |
| カレンダー画面 | `assets/sample-calendar.md` |
| ファイルアップロード/ダウンロード REST-API | `assets/file-upload-download-api.md`（バイナリ転送は `reference/api-binary-stream.md` も合わせて読み込むこと） |
| 生 JSON 受信 REST-API（POST `application/json`） | `assets/post-json-api.md` |

---

### ステップ 3: imds コンポーネント reference の読み込み

`jssp-imds-theme` スキルを参照し、画面に含まれる UI コンポーネントごとに **対応する reference ファイルを Read ツールで開いて読み込む。**
記憶や推測で imds のクラス名・タグ構造を書いてはならない。

| コンポーネント | reference ファイル |
|--------------|-------------------|
| テキストボックス | `skills/jssp-imds-theme/reference/imds-html-textbox.md` |
| テキストエリア | `skills/jssp-imds-theme/reference/imds-html-textarea.md` |
| セレクト（選択肢） | `skills/jssp-imds-theme/reference/imds-html-select.md` |
| チェックボックス | `skills/jssp-imds-theme/reference/imds-html-checkbox.md` |
| ラジオボタン | `skills/jssp-imds-theme/reference/imds-html-radio.md` |
| ボタン | `skills/jssp-imds-theme/reference/imds-html-button.md` |
| テーブル | `skills/jssp-imds-theme/reference/imds-html-table.md` |
| ダイアログ | `skills/jssp-imds-theme/reference/imds-html-dialog.md` |
| ダイアログ + フォーム（新規作成・編集等） | `skills/jssp-imds-theme/reference/imds-html-dialog-form.md` |
| ページネーション | `skills/jssp-imds-theme/reference/imds-html-pagination.md` |
| フィールド（ラベル付き） | `skills/jssp-imds-theme/reference/imds-html-field.md` |
| フィールドグループ | `skills/jssp-imds-theme/reference/imds-html-field-group.md` |
| タブ | `skills/jssp-imds-theme/reference/imds-html-tabs.md` |
| アコーディオン | `skills/jssp-imds-theme/reference/imds-html-accordion.md` |
| カレンダー入力 | `skills/jssp-imds-theme/reference/imui-html-calendar.md` |
| バナーメッセージ | `skills/jssp-imds-theme/reference/imds-html-banner-message.md` |
| インラインメッセージ | `skills/jssp-imds-theme/reference/imds-html-inline-message.md` |

上記以外のコンポーネントは `skills/jssp-imds-theme/reference/` 配下に格納されている。

---

### ステップ 4: ファンクションコンテナ・ルーティングの生成

`rules/jssp-function-container.md` と `rules/jssp-presentation-page.md` を参照してコードを生成する。

- ファンクションコンテナ（.js）を `src/main/jssp/src/{機能名}/` に生成する
- ルーティング設定（.xml）を必要に応じて生成する
- セキュアトークンを使用すること（`reference/secure_token_check.md` を参照）
- 参照先で `TODO` が書かれている場合は、その指示どおりに実装する

---

### ステップ 5: プレゼンテーションページ（HTML）の生成

ステップ 2・3 で読み込んだアセットと reference の HTML スニペットをベースに `.html` を生成する。

**禁止事項:**
- アセットや reference を読まずに、記憶や推測で imds のクラス名・構造を書くこと
- `jssp-imds-theme` の reference に存在しないクラス名を使用すること（例: `imds-selectbox` は存在しない、正しくは `imds-select`）
- imds コンポーネントを使わず、独自の HTML/CSS 構造を定義すること
- アセットの HTML 構造（フォームのトップレベル構造、`imds-field-container` / `imds-field-group` / `imds-field` のネスト、`is-horizontal` / `imds-w-15` 等のレイアウトクラス）を**独自判断で改変すること**。アセット側の構造はそのまま流用し、ラベル文言・`id`・入力種別・バリデーション内容だけを置き換えること
- 「縦並びの方が見やすい」「項目が多いので簡略化したい」等の**独自のデザイン判断に基づくレイアウト変更**（例: `is-horizontal` → `is-vertical` への変更、`imds-field-container` / `imds-field-group` の省略）。アセットと異なる構造が必要な場合は、**生成前にユーザへ確認**すること
- アセットに記述されている **JSDoc コメント（`/** ... */`）やセクション区切りコメント（`// ===...===`）を省略すること**。冗長に見えても、規約（`rules/jssp-function-container.md`）でこれらは必須項目として扱う。残すことで関数の意図がコード内で明示され、後続のレビューや改修が容易になる。アセットに含まれるコメントは原則そのまま写経し、変更が必要な場合は内容を該当機能用にリライトするだけにとどめること（削除はしない）

**必須ルール:**
- ラベル付きフォーム要素は `imds-field` + `imds-field-label` + `imds-field-control` 構造を使うこと
- テーブルは `imds-table` > `imds-table-inner` > `table` の二重ラッパー構造を使うこと
- ボタンの状態（primary/outlined 等）は reference の状態クラスを使い、CSS で色を付けないこと
- フォーム本体の構造は**アセットの該当スニペットを 1 行ずつ写経する**ことを前提とし、独自に `imds-field` 単独で使う構造へ簡略化しないこと。`imds-field-container has-accent-color` 直下に `imds-field-group` を配置する形が標準パターンである

---

### ステップ 6: DDL の生成（新規テーブルが必要な場合のみ）

仕様書に DDL 不要の指示がある場合はスキップする。それ以外は以下を `src/main/storage/system/products/import/basic/{機能名}/{version}/` 配下に出力すること。

**配置先固定の理由**: DDL とサンプル DML は **テナント環境セットアップ（Importer）で一括投入される**運用が前提のため、`jssp-tenant-setup-generator` を直接使うかどうかに関わらず、必ず `storage/system` 配下のこのパスに配置する（インポート画面から個別投入できない資材のため）。詳細は `jssp-tenant-setup-generator/SKILL.md` の「DDL / サンプル DML 配置の意義」セクション参照。

`{version}` の決定優先順位:
1. ユーザー指示・仕様書で明示されたバージョン
2. プロジェクトルートの `module.xml`（または `src/main/jssp/module.xml`）の `<version>` タグの値
3. プロジェクトルートの `pom.xml` の `<version>` タグの値（`<parent>` 内の version は除外）
4. 上記いずれもなければ `1.0.0`

| ファイル | 内容 |
|---------|------|
| `src/main/storage/system/products/import/basic/{機能名}/{version}/{機能名}-ddl_postgre.sql` | CREATE TABLE 文（PostgreSQL 用） |
| `src/main/storage/system/products/import/basic/{機能名}/{version}/{機能名}-ddl_oracle.sql` | CREATE TABLE 文（Oracle 用） |
| `src/main/storage/system/products/import/basic/{機能名}/{version}/{機能名}-ddl_sqlserver.sql` | CREATE TABLE 文（SQLServer 用） |
| `src/main/storage/system/products/import/basic/{機能名}/{version}/{機能名}_sample-dml.sql` | サンプルレコードの INSERT 文（全 DB 共通、**推奨**） |

`import-<key>-config-1.xml` の `<create-file>` / `<insert-file>` 参照は **suffix なし**（例: `{機能名}-ddl.sql` / `{機能名}_sample-dml.sql`）で書く。intra-mart Importer が接続先 DB に合わせて自動で `_postgre` / `_oracle` / `_sqlserver` を付与し、suffix 付きが無ければ suffix なしファイルにフォールバックする。

- **DDL は 3 方言別ファイル**（型・制約構文が DB ごとに違うため）
- **DML は 1 ファイルに一本化**（INSERT 文は標準 SQL の範囲で書けば全 DB 共通でよい）

DML で方言依存構文（PostgreSQL の `ON CONFLICT`、Oracle の `MERGE` 等）を使う場合のみ、`{機能名}_sample-dml_postgre.sql` 等の 3 方言別ファイルにする。

DDL 生成時の詳細ルールは本ファイル末尾の「DDL 生成ルール詳細」セクションを参照すること。

---

### ステップ 7: 自動検証スクリプト（JSSP コード）

生成したファイルに対して `validate-jssp-code.js` を実行する。**エラーが 0 件になるまで修正を繰り返す。**

```bash
node .claude/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{機能名}/
```

検出される主なパターン:
- `db.select()` / `db.execute()` のパラメータが `DbParameter` でラップされていない
- `DbParameter.number()` に文字列が渡される（`Number()` 変換漏れ）
- `var` の使用（`let` を使うこと）
- `imds-selectbox`（存在しないクラス名。正しくは `imds-select`）
- `imuiCalendar` の altField が hidden input を参照
- imart タグの value 属性がクォートで囲まれている
- `include('**/common/**')` による共通モジュールの読み込み（正しくは `load()`）
- `load('**/*.js')` のように `.js` 拡張子を付けた呼び出し（拡張子は自動付与されるため `.js.js` になり FileNotFoundException）
- `Transaction.begin(...)` の戻り値を受け取っていない（`DatabaseResult` を無視すると失敗が検知できず「HTTP 200 成功だが DB に入っていない」状態になる）
- TIMESTAMP/DATE カラムのバインドに `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|...)` のような日時系変数名が使われている（PostgreSQL で型キャストエラー）

> **JSSP-JS-022 警告が出た場合:** 必ず対応する SQL ファイルを開き、該当パラメータが `/*IF param != null*/.../*END*/` で囲まれているかを確認する。囲まれている → 誤検知（レビュー報告に「SQL 側の /*IF*/ ガード確認済み」と明記）。囲まれていない → `DbParameter.string(x || '')` 等の空文字フォールバックに修正する。

---

### ステップ 8: DDL 型検証（ステップ 6 で DDL を生成した場合のみ）

DDL ファイルを生成した場合、`validate-ddl.js` を実行する。**エラーが 0 件になるまで修正を繰り返す。**

```bash
node .claude/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
```

検出される主なパターン:
- PostgreSQL の DDL に `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB` が使われている
- Oracle の DDL に `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN` が使われている
- SQLServer の DDL に `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN` が使われている
- `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW` が DDL に含まれている（インポート失敗の原因）
- `CHECK` / `FOREIGN KEY` / `EXCLUDE` 制約が CREATE TABLE 内または ALTER TABLE で定義されている
- DDL はテーブル・PK・UNIQUE キー・CREATE INDEX のみを許可する方針
- 共通 DML ファイル（`*-dml.sql`）に ODBC エスケープ `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}` が使われている（PostgreSQL で構文エラー）

---

### ステップ 9: tsc 型チェック

生成したファイルに対して TypeScript コンパイラによる型検査を実行する。**0 issues になるまで修正を繰り返す。**

```bash
bash .claude/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{機能名}/
```

検出される主なパターン:
- `result.data === 0` のような型の不一致（更新件数は `result.countRow`）
- d.ts に存在しないメソッド・プロパティへのアクセス

---

### ステップ 10: 手動チェック

`reference/post-generation-verification.md` の全ステップを実行する。

---

### ステップ 11: コードレビュー・セキュリティチェック

ステップ 7〜10 が完了したら、以下の 2 スキルを **利用可能な場合のみ** 順に実行する。
スキルが存在しない場合はスキップしてよい。ユーザへの報告前に完了させること。

1. `jssp-code-review` スキルが利用可能であれば実行する
2. `jssp-security-check` スキルが利用可能であれば実行する

**ここまで完了したらユーザに報告する。**

---

## DDL 生成ルール詳細

ステップ 6 で DDL を生成する際は以下のルールに従うこと。

- テーブル名・カラム名は生成したファンクションコンテナの SQL と一致させること
- **カラムの型は `reference/ddl-type-mapping.md` の型マッピング表に従うこと**（記憶や推測で型名を書かない）
- DDL は DB 製品ごとにファイルを分けること（型名・デフォルト値の構文が異なるため）
- サンプル DML は標準 SQL の INSERT 文で記述し、3製品共通で使用できるようにすること
- マスタテーブルにはサンプルレコードを 3〜5 件程度 INSERT すること
