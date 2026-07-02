---
name: jssp-im-workflow-usage
description: intra-mart IM-Workflow 連携プログラムを新規生成する。アクション処理（申請・承認・否認・差戻し）、案件開始/終了処理、分岐条件処理、申請画面、承認画面、確認画面の実装パターンを提供する。ワークフロー、申請画面、承認画面、確認画面、アクション処理、案件処理、分岐条件、稟議、承認フロー、と言及されたときに使用。ワークフロー関連の実装にはこのスキルを使うこと。ジョブスケジューラの定期バッチ処理は jssp-im-job-generator を使うこと。
---

■■ 参照ルール チェックリスト（必須） ■■

実装着手前に、以下を確認すること。未チェック項目がある場合は着手不可。

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-error-handling](../../../requirements/jssp-error-handling/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-function-container](../../../requirements/jssp-function-container/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-logging](../../../requirements/jssp-logging/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) を参照し、内容を理解した
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) を参照し、内容を理解した


# IM-Workflow プログラム生成支援スキル

## 目的

intra-mart Accel Platform の IM-Workflow 連携プログラムを新規に生成するためのスキルセット。
テンプレートや規約に従って、ワークフローの各種処理プログラムを作成・構成するための手順を説明する。

## 参照すべき規約

本スキルは申請画面・承認画面（`.html` + `.js`）およびアクション処理（`.js`）を生成する。全体像は `.agents/requirements/README.md` の「規約ファイル一覧（一行要約 + 適用範囲タグ）」を参照。本スキル特有の重要度:

| 規約 | 取り扱い |
|------|---------|
| `jssp-presentation-page.md` | 🟢 **必読** — 申請・承認画面の HTML 構造・バリデーション・id 命名 |
| `jssp-function-container.md` | 🟢 **必読** — `init()` 構造・workflowOpenPage パラメータ受け取り |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 必読 |
| `jssp-error-handling.md` / `jssp-security.md` | 🟢 必読 |
| `jssp-2way-sql.md` | 🔴 **画面側では原則不要**（申請画面 / 承認画面は `workflowOpenPage` で送信するだけで DB 操作なし）。アクション処理側で `db.executeByTemplate` を使う場合のみ参照 |
| `jssp-logging.md` | 🟡 アクション処理でログ実装時のみ |
| `jssp-accessibility.md` | 🟠 **業務要件次第** — 仕様書で明示要求があった場合のみ厚く適用。指示がなければ最小限（`imdsConfirm`、`aria-label`、装飾アイコンの `aria-hidden` 等の基本）に留める |

## 生成対象とテンプレート

### 画面

| 生成対象 | テンプレート | 配置先 |
|---------|------------|-------|
| 申請画面（申請＋一時保存）— workflowOpenPage 方式 (.html / .js) | `assets/simple-apply-screen.md` | `{機能名}/workflow/apply/` |
| 申請画面（申請＋一時保存）— 処理モーダル方式 ★推奨 (.html / .js) | `assets/modal-apply-screen.md` | `{機能名}/workflow/apply/` |
| 承認画面（処理画面）— workflowOpenPage 方式 (.html / .js) | `assets/simple-approve-screen.md` | `{機能名}/workflow/approve/` |
| 承認画面（処理画面）— 処理モーダル方式 ★推奨 (.html / .js) | `assets/modal-approve-screen.md` | `{機能名}/workflow/approve/` |
| 確認画面 — workflowOpenPage 方式 (.html / .js) | `assets/simple-confirm-screen.md` | `{機能名}/workflow/confirm/` |
| 確認画面 — 処理モーダル方式 ★推奨 (.html / .js) | `assets/modal-confirm-screen.md` | `{機能名}/workflow/confirm/` |

### バッチ処理

| 生成対象 | テンプレート | 配置先 |
|---------|------------|-------|
| アクション処理 (.js) | `assets/simple-action-process.md` | `{機能名}/workflow/action/` |
| 到達処理 (.js) | `assets/simple-arrive-process.md` | `{機能名}/workflow/arrive/` |
| 分岐条件/分岐結合処理 (.js) | `assets/simple-rule-condition.md` | `{機能名}/workflow/rule/` |
| 案件開始処理 (.js) | `assets/simple-matter-start-process.md` | `{機能名}/workflow/` |
| 案件終了処理 (.js) | `assets/simple-matter-end-process.md` | `{機能名}/workflow/` |

### リスナー・プラグイン

| 生成対象 | テンプレート | 配置先 |
|---------|------------|-------|
| 処理対象者プラグイン (.js) | `assets/simple-authority-exec-event-listener.md` | `{機能名}/workflow/plugin/` |
| 未完了案件削除リスナー (.js) | `assets/simple-actv-matter-delete-listener.md` | `{機能名}/workflow/` |
| 完了案件削除リスナー (.js) | `assets/simple-cpl-matter-delete-listener.md` | `{機能名}/workflow/` |
| 過去案件削除リスナー (.js) | `assets/simple-arc-matter-delete-listener.md` | `{機能名}/workflow/` |
| 案件退避処理リスナー (.js) | `assets/simple-matter-archive-listener.md` | `{機能名}/workflow/` |

### リファレンス

- `reference/imart-tag-workflow-open-page.md` - workflowOpenPage タグリファレンス
- `reference/api-im-workflow-modal.md` - 処理モーダル API（`imWorkflow.modal.showApply()`）リファレンス
- `reference/api-im-workflow-modal-tempsave.md` - 処理モーダル API（`imWorkflow.modal.showTemporarySave()`）リファレンス
- `reference/api-im-workflow-modal-process.md` - 処理モーダル API（`imWorkflow.modal.showProcess()`）リファレンス
- `reference/api-im-workflow-modal-confirm.md` - 処理モーダル API（`imWorkflow.modal.showConfirm()`）リファレンス
- `reference/api-user-actv-matter-property-value.md` - 案件プロパティ値 API リファレンス
- `reference/screen-generation-checklist.md` - 画面生成時のセルフチェックリスト
- `.agents/skills/jssp-im-workflow-generator/reference/node-types.md` - ノード種別・権限プラグイン一覧（関連スキル）

## 申請画面の方式選択

申請画面を生成する場合、**最初にユーザに方式を選択させること**。どちらか判断できない場合は「処理モーダル方式」を推奨する。

### 比較表

| 観点 | workflowOpenPage 方式 | 処理モーダル方式（★推奨） |
|------|----------------------|--------------------------|
| 実装の簡潔さ | やや複雑（`$imw*` 変数 11 個が必要） | シンプル（バインド変数不要） |
| ルーティング XML | **不要**（コンテンツ定義から直接呼ばれる） | **必要**（`routing-jssp-config/*.xml` を作成） |
| 一時保存ボタン | 申請と同一画面に配置（`workflowOpenPage('1')`） | 申請と同一画面に配置（`showTemporarySave()`） |
| 戻るボタン | 必要（`imw-back-form` フォームと連携） | 必要（`imWorkflow.transition.returnTo()` を使用） |
| 申請ボタンのハンドラ | `workflowOpenPage('0')` 呼び出し（同期） | `async/await imWorkflow.modal.showApply(...)` |
| 一時保存ボタンのハンドラ | `workflowOpenPage('1')` 呼び出し（同期） | `async/await imWorkflow.modal.showTemporarySave(...)` |
| テンプレート | `assets/simple-apply-screen.md` | `assets/modal-apply-screen.md` |
| リファレンス | `reference/imart-tag-workflow-open-page.md` | `reference/api-im-workflow-modal.md` / `reference/api-im-workflow-modal-tempsave.md` |

### 推奨理由

処理モーダル方式はバインド変数（`$imw*` 11 個）が不要でコードがシンプル。一時保存・戻るボタンはどちらの方式でも配置するが、モーダル方式では一時保存を `showTemporarySave()`（userDataId を内部で自動採番）、戻るを `imWorkflow.transition.returnTo()` で簡潔に実装でき、保守しやすい（workflowOpenPage 方式のように `imw-back-form` フォームや userDataId の手動採番を書く必要がない）。URL から直接アクセスできるスタンドアローン画面になるため、ポータルやリンクからの呼び出しにも対応しやすい。

### ユーザへの確認文言（例）

> 申請画面の実装方式を選択してください。
>
> 1. **処理モーダル方式**（推奨）— `imWorkflow.modal.showApply()` を使用。バインド変数不要でコードがシンプル。一時保存・戻るも `showTemporarySave()` / `transition.returnTo()` で簡潔に実装できる。ルーティング XML が必要。
> 2. **workflowOpenPage 方式** — `<imart type="workflowOpenPage">` を使用。コンテンツ定義から直接呼ばれる形式。ルーティング XML 不要。
>
> どちらか迷う場合は **処理モーダル方式** を推奨します。

### 承認画面・確認画面の方式選択

承認画面（処理画面）・確認画面も、申請画面と同様に **workflowOpenPage 方式（旧型）** と **処理モーダル方式（新型・★推奨）** の 2 方式がある。方式選択の考え方は申請画面と同じ（モーダル方式はバインド変数不要でコードが簡潔。ルーティング XML が必要）。テンプレートは以下を参照する。

| 画面 | workflowOpenPage 方式（旧型） | 処理モーダル方式（新型・★推奨） |
|------|------------------------------|--------------------------------|
| 承認画面（処理画面） | `assets/simple-approve-screen.md`（`workflowOpenPage('4')`） | `assets/modal-approve-screen.md`（`showProcess()`） |
| 確認画面 | `assets/simple-confirm-screen.md`（`workflowOpenPage('5')`） | `assets/modal-confirm-screen.md`（`showConfirm()`） |

- **確認画面と詳細画面（処理詳細・参照詳細）は別物**: 詳細画面は情報を閲覧して終わる読み取り専用画面だが、確認画面は処理画面と同様に「確認」操作（`workflowOpenPage('5')` / `showConfirm()`）を行う。確認画面には確認操作の送信ボタンを配置する。
- **申請内容の復元**: 承認画面・確認画面は未完了案件が対象で `imwUserDataId` が渡らないため、`ActvMatter(systemMatterId).getMatterPropertyList()` を使う（`UserActvMatterPropertyValue(userDataId)` は使わない）。

## 使用タイミング

ユーザが以下のような依頼をした場合:
- 「ワークフローのアクション処理を作成して」
- 「申請画面を作成して」
- 「承認画面を実装して」
- 「案件開始処理を追加して」
- 「分岐条件を実装して」
- 「到達処理を作成して」
- 「処理対象者プラグインを実装して」
- 「案件削除リスナーを追加して」

## 実装手順

1. ユーザの要件をヒアリング（処理種別、機能名、ビジネスロジック内容）
   - **申請画面を含む場合**: 上記「申請画面の方式選択」セクションの確認文言をユーザに提示し、方式を決定してから実装に進む
2. 該当する assets テンプレートを参照して生成
3. ファイル配置場所を確認（`src/main/jssp/src/{機能名}/workflow/` 配下）

**注意（ルーティング XML）:**
- **workflowOpenPage 方式**: コンテンツ定義で JSSP パスを直接指定するため、ルーティングテーブル（XML）は**不要**。
- **処理モーダル方式**: URL から直接アクセスするスタンドアローン画面のため、ルーティングテーブル（XML）が**必要**。`routing-jssp-config/` 配下に XML を作成すること（`assets/modal-apply-screen.md` にサンプル記載）。

### DDL の生成

新規テーブルが必要なワークフローを生成する場合、仕様書に DDL 不要の指示がない限り、以下を `src/main/storage/system/products/import/basic/{機能名}/{version}/` 配下に出力すること。

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

- テーブル名・カラム名はアクション処理の SQL と一致させること
- **カラムの型は `.agents/skills/jssp-page-generator/reference/ddl-type-mapping.md` の型マッピング表に従うこと**（記憶や推測で型名を書かない）
- DDL は DB 製品ごとにファイルを分けること（型名・デフォルト値の構文が異なるため）
- サンプル DML は標準 SQL の INSERT 文で記述し、3製品共通で使用できるようにすること
- マスタテーブル（取引先マスタ等）にはサンプルレコードを 3〜5 件程度 INSERT すること

### ファイル配置先のパス構築ルール

> **注記**: IM-Workflow の画面はワークフローエンジンが XML の `scriptPath` から直接呼び出すため、ルーティングテーブルを介さない。よって `.agents/requirements/jssp-file-structure/AGENTS.md` の `view/{view}.js`（snake_case の画面ごとの固有名）規約とは **呼び出し元が異なる別系統の規約** が適用される。本セクションの規約に従うこと（`.agents/requirements/jssp-file-structure/AGENTS.md` 側にも「ルーティングテーブル経由で呼ばれない画面の例外規約」として明記済み）。

ファイル配置先は必ず以下のルールで構築すること:

- **ベースパス**: `src/main/jssp/src/`
- **機能名パス**: `{機能名}/workflow/` — 機能名はユーザ指示またはコンテンツ定義の画面パスから導出
- **完成パス**: `src/main/jssp/src/{機能名}/workflow/{サブディレクトリ}/`

例: 機能名が `sample/wf_housing_assistance` の場合
- 正: `src/main/jssp/src/sample/wf_housing_assistance/workflow/apply/index.html`

### 画面ファイルの命名規則

IM-Workflow の画面ファイルは、ディレクトリで画面種別を区別し、ファイル名は **`index.js` / `index.html`** に統一する。
`apply/apply.js` のような冗長な命名にしないこと。

```
# OK: {機能名}/workflow/{画面種別}/index で統一
leave/workflow/apply/index.js      + index.html
leave/workflow/approve/index.js    + index.html
leave/workflow/detail/index.js     + index.html

# NG: /workflow を省略する
leave/apply/index.js               + index.html

# NG: ファイル名が冗長
leave/workflow/apply/apply.js      + apply.html
```

コンテンツ定義の scriptPath にはディレクトリ名までのパスを指定する（例: `leave/workflow/apply/index`）。

**配置先パスの優先順位:**
ユーザーがプロンプトで配置先パスを明示的に指定した場合は、その指示を最優先する。
スキルのデフォルト規約（`{機能名}/workflow/{画面種別}/index`）はあくまでデフォルトであり、明示的な指定がない場合にのみ適用する。

## 注意事項

- アクション処理・案件開始/終了処理・分岐条件処理のプログラム中では **DB トランザクションを張らないこと**
- アクション処理・案件処理・分岐条件処理はすべてファンクションコンテナであるため、コーディング規約（`let` の使用、命名規則等）に従うこと。詳細は jssp-page-generator の reference 配下を参照
- テンプレートは必要に応じてカスタマイズ
- 参照先で `TODO` が書かれている場合は、その指示どおりに実装する
- **詳細画面（確認画面・処理詳細・参照詳細）には「戻る」ボタンを配置しないこと**。詳細画面はワークフローエンジンの iframe 内で表示されるため、戻り先のページパスが存在せず空ページに遷移してしまう。戻るボタンの HTML・JS イベントリスナー・戻り用フォーム（`imw-back-form`）をすべて省略する
- **プレゼンテーションページ（.html）は `.agents/requirements/jssp-presentation-page/AGENTS.md` のコーディング規約に従うこと**。特にバリデーション実装は規約準拠が必須。生成完了後、`reference/screen-generation-checklist.md` でセルフチェックを行うこと
- **画面内で IM-共通マスタの値（ユーザ・組織・会社・グループ・ロール）を入力させる必要がある場合は、自前 UI を作らず `jssp-im-master-usage` スキルを併用してマスタ検索ダイアログを組み込むこと**（例: 「申請者の上長」「対象部署」「処理者」フィールド）。コードの手打ち入力は禁止

## 生成後の必須検証（自動実行）

**コード生成完了後、ユーザに報告する前に** 以下の検証を順に実行すること。
この検証はユーザに確認を求めず自動で行い、問題があれば報告前に修正する。

### ステップ 1: 自動検証スクリプト

生成したファイルに対して `validate-workflow-code.js` を実行する。**エラーが 0 件になるまで修正を繰り返す。**

```bash
node .agents/skills/jssp-im-workflow-usage/scripts/validate-workflow-code.js src/main/jssp/src/{機能名}/
```

検出される主なパターン:
- `db.select()` / `db.execute()` のパラメータが `DbParameter` でラップされていない
- `DbParameter.number()` に文字列が渡される（`Number()` 変換漏れ）
- `workflowOpenPage` に無効な pageType（`'0'`～`'5'` 以外）
- `imds-selectbox`（存在しないクラス名。正しくは `imds-select`）
- `imuiCalendar` の altField が hidden input を参照
- 承認画面に承認/差戻し/否認の個別ボタン
- imart タグの value 属性がクォートで囲まれている

### ステップ 2: DDL 型検証（DDL を生成した場合）

DDL ファイルを生成した場合、`validate-ddl.js` を実行する。**エラーが 0 件になるまで修正を繰り返す。**

```bash
node .agents/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{機能名}/{version}/
```

### ステップ 3: 手動チェック（`post-generation-verification.md`）

`.agents/skills/jssp-page-generator/reference/post-generation-verification.md` の全ステップを実行する。
特に以下は過去に不具合が発生した重点項目:
1. SQL ファイルで `/*$param*/`（直接埋め込み）を使っていないか → `/*param*/`（バインド）を使う
2. `executeByTemplate` のパラメータが `DbParameter.xxx()` でラップされているか
3. API 呼び出しが d.ts の定義と一致しているか（static vs instance、メソッド名、引数）
4. intra-mart 内部テーブル（`im` で始まるテーブル）を SQL で直接参照していないか（ユーザからの明確な指示がある場合のみ許可）
5. 画面のセレクトボックス・日付入力に適切な `max-width` が指定されているか

### ステップ 4: 画面 HTML の imds 準拠 再チェック（HTML 生成時のみ）

申請画面・承認画面・詳細画面・確認画面など **`.html` を生成した場合は必ず実行する**。`validate-workflow-code.js` は `imds-selectbox` のような既知の誤クラス名は検出するが、**reference 全体との完全な突き合わせはカバーしない**ため、`.agents/skills/jssp-imds-theme/reference/` を引いて目視で再確認する。

#### 実施手順

1. 生成した各 `.html` をスキャンし、使用している imds コンポーネントを洗い出す（テキストボックス・テキストエリア・セレクト・チェックボックス・ラジオ・ボタン・テーブル・ダイアログ・フィールド・タブ・カレンダー入力・バナー/インラインメッセージ等）
2. コンポーネントごとに `.agents/skills/jssp-imds-theme/reference/imds-html-{component}.md` を **Read ツールで開いて再確認する**（記憶に頼らない）
3. reference のクラス名・タグ構造・属性と、生成 HTML を突き合わせる

#### 重点チェック項目

| 観点 | 確認ポイント | 不一致時の対処 |
|------|------------|--------------|
| クラス名の存在 | `imds-selectbox` / `imds-input` 等、reference に存在しないクラスを使っていないか | reference の正式名（`imds-select` / `imds-textbox` 等）に置換 |
| フィールド階層 | `imds-field-container has-accent-color` > `imds-field-group is-horizontal imds-w-15` > `imds-field-group-label` / `imds-field-group-control` > `imds-field` の入れ子になっているか（アセット `simple-apply-screen.md` / `simple-approve-screen.md` の写経どおりか） | アセットから 1 行ずつ写経し直す。`imds-field` 単独へ簡略化しない |
| 必須ラベル | 必須項目に `<span class="imds-required-label-required" data-required-label="必須">` が付いているか | 付与する。`imds-required-label-required` のクラス名と `data-required-label` 属性は両方必須 |
| エラー表示 | `imds-field` に `for=":fieldName:"` 属性、直下に `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>` が配置されているか | 規約どおりに配置。display:none の初期非表示も忘れない |
| テーブル | `imds-table` > `imds-table-inner` > `table` の二重ラッパー構造になっているか | ラッパーを補う |
| ボタン状態 | `is-primary` / `is-outlined` / `is-ghost` / `is-danger` / `is-small` / `is-large` 等の状態クラスを使い、CSS で色付けしていないか | 状態クラスへ置換 |
| ダイアログ | `<dialog class="imds-dialog">` + `imds-dialog-header` / `imds-dialog-body` / `imds-dialog-footer` 構造、`showModal()` / `close()` で開閉しているか | reference `imds-html-dialog.md` / `imds-html-dialog-form.md` どおりに修正 |
| アイコンボタン | テキストありは `<span class="imds-button-text">` で囲み、アイコン単品は通常サイズで表示しているか | `imds-html-icon-button.md` に従う |
| imuiCalendar | `floatable="true"` を指定し、`altField` が hidden 以外を参照しているか | `imui-html-calendar.md` どおりに修正 |
| バナー/インライン | カスタム CSS で警告色を付けていないか（`imds-banner-message` / `imds-inline-message` を使うべき） | 該当する状態クラス（`is-warning` 等）へ置換 |
| アセット改変 | アセット (`simple-apply-screen.md` / `simple-approve-screen.md`) の HTML 構造を**独自判断でレイアウト変更**していないか（`is-horizontal` → `is-vertical` 等）| アセットの構造に戻す。変更が必要ならユーザへ事前確認 |

#### `<imart type="workflowOpenPage">` 関連の追加チェック（workflowOpenPage 方式のみ）

> **処理モーダル方式の場合はこのセクションをスキップしてよい。**

- `<imart type="workflowOpenPage">` タグに `id` 属性を付けていないか（`name` のみ）
- フォーム内の入力フィールドに `name` 属性を付けていないか（hidden フィールドのみが `name` を持つ）
- ラジオボタンは入力用と hidden 用で `name` を分けているか

#### 処理モーダル方式特有のチェック（処理モーダル方式のみ）

> **workflowOpenPage 方式の場合はこのセクションをスキップしてよい。**

- `<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>` が `<head>` に記述されているか（`name="im_secure_token"` 形式は動作しない）
- `<script src="im_workflow/js/api_base.js" defer></script>` が `<head>` に記述されているか（`defer` 必須）
- 申請ボタンのイベントリスナーが `async` 関数になっているか（`await imWorkflow.modal.showApply(...)` のため必須）
- `workflowOpenPage('0')` 等の pageType 呼び出しが残っていないか（処理モーダル方式では使わない）
- `$imwFlowId` / `$imwMatterName` 等の `$imw*` バインド変数が残っていないか（処理モーダル方式では不要）
- 一時保存ボタン・戻るボタンが削除されているか（処理モーダル方式では不要）
- ルーティング XML（`routing-jssp-config/*.xml`）が作成されているか
- `flowId` に実際のフローIDが設定されているか、または TODO コメントが残っているか（仮の値ではなく正しい値か確認）
- 一時保存・処理（承認/否認）・確認画面の場合、`imWorkflow.transition.afterProcess()` が `then()` または `await` の後に呼び出されているか（完了・キャンセルどちらでも呼び出す必要がある）

#### 不一致を発見した場合

reference の記述を正として **生成 HTML を修正** する。修正後、再度ステップ 1（`validate-workflow-code.js`）から流し直し、すべて PASS してから次のステップへ進む。

### ステップ 5: コードレビュー・セキュリティチェック（自動実行）

ステップ 1〜4 が完了したら、以下の 2 スキルを **利用可能な場合のみ** 順に実行する。
スキルが存在しない場合はスキップしてよい。ユーザへの報告前に完了させること。

1. `jssp-code-review` スキルが利用可能であれば実行する
2. `jssp-security-check` スキルが利用可能であれば実行する

#### JSSP-JS-022 警告の扱い

自動検証スクリプト（ステップ 1）で以下のような警告が出た場合：

```
WARN [JSSP-JS-022] xxx.js:NN  null を渡す可能性
```

**必ず対応する SQL ファイルを開き、該当パラメータが `/*IF param != null*/.../*END*/` で囲まれているかを確認する。**

- 囲まれている → 問題なし（誤検知）。レビュー報告に「SQL 側の /*IF*/ ガード確認済み」と明記する
- 囲まれていない → `DbParameter.string(x || '')` 等の空文字フォールバックに修正する

## 他スキルとの境界・整合性責務

本スキルが生成するファイル配置は、`jssp-im-workflow-generator` が生成する XML 内の `<scriptPath>`（または spec.json の `screens`）と**完全に一致させる必要がある**。責務分担は以下のとおり:

| 責務 | 担当スキル |
|------|-----------|
| spec.json の `screens` で画面パスを決定 | `jssp-im-workflow-generator` |
| XML 内の `<scriptPath>` 出力 | `jssp-im-workflow-generator` |
| `.js` / `.html` ファイルを実体として配置 | **本スキル（usage）** |
| パス整合の検証 | `scripts/validate-workflow-code.js` の `WF-XML-001` |

### pageType と本スキルの慣例ディレクトリの対応表

`jssp-im-workflow-generator` のデフォルトは本スキルの慣例ディレクトリ名に揃えてあるため、**新規プロジェクトでは spec.json の `screens` を省略してよい**。

| pageType | キー | 本スキルの配置先 | 用途 |
|---|---|---|---|
| 0 | `apply` | `{機能名}/workflow/apply/` | 申請画面 |
| 1 | `tempSave` | **`{機能名}/workflow/apply/`（申請画面と共用）** | 一時保存画面（申請画面が一時保存を兼ねる） |
| 2 | `applyTask` | `{機能名}/workflow/apply_task/`（または apply と共用） | 申請（起票案件）画面 |
| 3 | `reapply` | `{機能名}/workflow/reapply/`（または apply と共用） | 再申請画面 |
| 4 | `process` | **`{機能名}/workflow/approve/`** | **処理画面（承認/差戻し/否認の選択）** |
| 5 | `confirm` | `{機能名}/workflow/confirm/` | 確認画面 |
| 6 | `processDetail` | `{機能名}/workflow/process_detail/`（または detail） | 処理詳細画面 |
| 7 | `referDetail` | `{機能名}/workflow/refer_detail/`（または detail と共用） | 参照詳細画面 |

**`pageType=4` 注意:** generator のデフォルト suffix は `approve/index`（IM-Workflow 公式用語 "process" ではなく、本プロジェクトの業務慣例「承認画面」に揃えている）。本スキルのテンプレート [`assets/simple-approve-screen.md`](assets/simple-approve-screen.md) もこの慣例に従う。

### 生成順序の推奨

1. `jssp-im-workflow-generator` で spec.json を作り、XML を生成（先に画面パスが決まる）
2. 本スキルで XML が参照する各画面ファイルを生成
3. `validate-workflow-code.js` で `WF-XML-001` が出ないか確認（出る場合は意図的か未生成か区別）

詳細な対応表・共用パターンは `jssp-im-workflow-generator` スキルの SKILL.md「他スキルとの境界・整合性責務」セクション参照。
