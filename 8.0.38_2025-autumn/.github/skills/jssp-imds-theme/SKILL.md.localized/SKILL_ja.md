---
name: jssp-imds-theme
description: intra-mart Design System（imds）に準拠したプレゼンテーションページの HTML コンポーネントを生成する。テーブル、ボタン、フォーム、ダイアログ、チェックボックス、ラジオボタン、セレクト、テキストボックス、タブ、アコーディオン、ページネーション等の UI 部品を使う場面で必ず使用。imds のクラス名は記憶や推測で書かず、必ずこのスキルの reference を参照すること。HTML を書く、画面の見た目を作る、UI コンポーネントを配置する、と言及されたときに使用。
---

# imds 準拠 HTML コード生成スキル

## 概要

intra-mart Design System に準拠するプレゼンテーションページの HTML タグ部分を作成するためのスキルセット。

## 使用方法

HTML を生成する際は、以下の手順で作業を進める

1. **ページ全体テンプレートを先に確認する**（一覧画面は `assets/imds-list-page.md`、フォーム画面は `assets/imds-form-page.md`）
   - `<header class="imds-header">` の配置位置・`<main>` との関係はここでしか説明されない
2. ユーザの要求から使用するUIコンポーネントを特定する
3. 該当するコンポーネントの `reference/` 配下のファイルを読み込む
4. リファレンス内の HTML スニペットをベースに実装する
5. 必要に応じてサイズやスタイルのクラスを追加する
6. 生成したファイルに対して `validate-imds.js` で構造検証を実行する（後述）
7. エラーがあれば修正し、PASS になるまで繰り返す

## HTML 生成時の重要な注意事項

### リファレンスの必須参照

HTML コンポーネントを生成する前に、必ず対応するリファレンスファイルを読み込む。
記憶や推測でクラス名を使用せず、リファレンスに記載されている正確な HTML スニペットを使用する。

### 「ページ全体テンプレート」を起点にすること（assets の必須参照）

`reference/` 配下はコンポーネント単位の HTML スニペットのみで、**ページ全体の組み立て方は記載されていない**。
特にヘッダ部分（`<header class="imds-header">`）の配置位置のような、ページ構造に関わる必須情報は `assets/` 配下のテンプレートにしかない。

| 用途 | 参照すべき assets |
|------|------------------|
| 一覧画面（リスト + 操作ボタン） | `assets/imds-list-page.md` |
| 入力フォーム画面（CRUD） | `assets/imds-form-page.md` |

新規画面生成時は、まずこの 2 ファイルのどちらかを読み、ページ骨格をベースにしてから個別コンポーネントの reference を参照すること。

### `<header class="imds-header">` のアイコンは必須

`<header class="imds-header">` の中には、`imds-header-title` だけ置くのは **不可**。
**必ず先頭に `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれかを 1 つ** 配置する（リファレンスで排他指定）。これを省くとヘッダがテキストだけの状態になり、imds デザインに溶け込まない（画面表示で崩れて見える）。

| 用途 | 配置する要素 | アイコン例 |
|------|------------|------------|
| 一覧・登録・編集など一般的なページ | `imds-header-icon` + Font Awesome | 用途に合うアイコン（`fa-clipboard-list` / `fa-warehouse` / `fa-box` / `fa-location-dot` / `fa-chart-column` / `fa-gear` 等） |
| 詳細・編集など戻る導線が要る画面 | `imds-header-back-button` | （アイコン代わり） |
| 関連画面切替メニューが要る画面 | `imds-header-nav`（Popover 併用） | （アイコン代わり） |

```html
<!-- 標準パターン -->
<header class="imds-header">
  <div class="imds-header-icon">                       <!-- ★ 必須 -->
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="fa-solid fa-XXX"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>     <!-- ★ サブタイトル(必須) -->
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>     <!-- ★ タイトル(必須) -->
  </div>
</header>
```

### `imds-header-title` のタイトル + サブタイトル 2 段構成は必須

`imds-header-title` の中身は **`<p>サブタイトル</p>` + `<h1>タイトル</h1>` の 2 段構成** にする。
`<h1>` 単独で「画面名直書き」する書き方はしない（imds テーマのヘッダデザインを満たさず、見た目が間延びする）。

- サブタイトル: アプリ名やモジュール名等の上位文脈を表す短い文字列（例: 「社内備品貸出システム」「備品マスタ」）
- タイトル: 画面名（例: 「承認一覧」「保管場所管理」）
- どちらもファンクションコンテナで `let $title = '...'` / `let $subTitle = '...'` をバインドし、HTML 側では `<imart type="string" value=$title escapeXml="true" escapeJs="false"></imart>` で出力する（直書きしない）
- 詳細画面・編集画面など `aria-labelledby="page-title"` で `<h1>` を参照する場合は、`<h1 id="page-title">` のように id を残すこと

### `<header class="imds-header">` の配置位置（重要）

`<header class="imds-header">` は **`<main>` の外側**、`<div class="imds-container">` の **直下** に置く必要がある。imds テーマの CSS はこの位置を前提にスタイルを当てており、`<main>` の内側に置くとレイアウトが崩れる（アイコンが消える等）。

```html
<!-- OK -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">...</header>   <!-- main の外側 -->
    <main>
      ...
    </main>
  </div>
</div>

<!-- NG -->
<div id="container">
  <div class="imds-container">
    <main>
      <header class="imds-header">...</header> <!-- main の内側は CSS が当たらない -->
      ...
    </main>
  </div>
</div>
```

なお、`jssp-accessibility.instructions.md` で「プレゼンテーションページに `<header>` を追加してはならない」と書かれているのは **プラットフォームのグローバル `<header>` と重複させない** という意図であり、imds の `<header class="imds-header">`（ページ内ヘッダ）はこの規則の対象外。

### `imds-header-actions` に業務データの操作ボタンを置かない

`<header class="imds-header">` の右側（`imds-header-actions`）に **「新規登録」「追加」「登録」等のデータ操作ボタンを置いてはならない**（UI チームのデザインルール）。
ヘッダは画面のタイトル提示が主目的で、業務アクションを並べる場所ではない。データ操作ボタンは **一覧テーブルの直上に右寄せ** で配置する。

```html
<!-- ❌ NG: 新規登録ボタンをヘッダの imds-header-actions に置く -->
<header class="imds-header">
  <div class="imds-header-icon">...</div>
  <div class="imds-header-title">...</div>
  <div class="imds-header-actions">
    <button type="button" class="imds-button is-primary" id="add-button">
      <span class="imds-button-text">新規登録</span>
    </button>
  </div>
</header>

<!-- ✅ OK: 一覧テーブル直上の右側に置く -->
<section class="imds-py-3 imds-px-4" aria-label="○○一覧">
  <div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
    <button type="button" class="imds-button is-primary" id="add-button">
      <span class="imds-icon"><i class="fa-solid fa-plus"></i></span>
      <span class="imds-button-text">新規登録</span>
    </button>
  </div>
  <div class="imds-table ...">...</div>
</section>
```

| ヘッダ右側（`imds-header-actions`）に置いてよい | 一覧テーブル直上に置く（ヘッダには置かない） |
|---|---|
| ページ全体に対するメタ操作（例: 「設定」「エクスポート」「ログ出力対象設定」など、一覧そのもののデータを増減しない操作） | 「新規登録」「追加」「一括取込」など、一覧の業務データを増減・編集するアクション |

検索欄を併設する場合は `assets/imds-list-page.md` の「操作エリア」パターン（`button-area` 内に検索欄 + 新規作成ボタンを横並び）を踏襲する。

### 架空クラスを使わないこと（特に `imds-page-header` 系）

リファレンスに無い `imds-*` クラス名を独自に書いてはならない。CSS が当たらず画面が崩れる。
よくある誤りパターン:

| ❌ 架空のクラス | ✅ 正しいクラス（リファレンス記載） |
|---|---|
| `imds-page-header` | `imds-header` |
| `imds-page-header-title` | `imds-header-title` |
| `imds-page-header-actions` | `imds-header-actions` |
| `imds-section-title` | `<h2>` 等の素の要素に置き換える |
| `imds-dialog-body` | `imds-dialog-content` |
| `imds-dialog-overlay` | `imds-dialog-wrapper` |
| `imds-required-mark`（span） | `imds-required-label-required` クラスを `<span>`/`<label>` に付与 |
| `imds-inline-message is-error`（フィールドのエラー表示用途） | `<span class="imds-error-text">` |

判断に迷う場合は `validate-imds.js` を実行し、`IMDS-U-001` 警告が出ないか確認する（後述）。

### フォーム実装パターン（必須参照: `assets/simple-form.md`）

入力フォームを実装する際は、必ず `skills/jssp-page-generator/assets/simple-form.md` の正規パターンに従う。
個別の `imds-field` を裸で並べるのは誤り。標準は **`imds-field-container > imds-field-group > imds-field-group-label + imds-field-group-control > imds-field`** の入れ子構造。

```html
<div class="imds-field-container has-accent-color">
  <!-- 1 入力項目 = 1 imds-field-group -->
  <div class="imds-field-group is-horizontal imds-w-15">
    <!-- ラベル部分（必須/任意マークもここで付与する） -->
    <div class="imds-field-group-label">
      <span class="imds-required-label-required" data-required-label="必須">ユーザコード</span>
    </div>
    <!-- 入力部分 -->
    <div class="imds-field-group-control">
      <div class="imds-field" for=":userCode:">
        <div class="imds-field-control">
          <input type="text" id=":userCode:" class="imds-textbox" name="userCode" />
        </div>
        <!-- エラーメッセージは imds-field 直下（imds-field-control の外） -->
        <span class="imds-error-text" for=":userCode:" id="error-userCode" style="display:none;"></span>
      </div>
    </div>
  </div>
</div>
```

ポイント:

| 項目 | 正しい書き方 |
|------|------------|
| ラベル要素 | `imds-field-group-label > <span>`（label 要素は使わない。複数入力を1グループにまとめる場合のみ内側の `imds-field` に `imds-field-label > <label>` を置く） |
| 必須マーク | `<span class="imds-required-label-required" data-required-label="必須">項目名</span>` |
| 任意マーク | `<span class="imds-required-label-optional" data-required-label="任意">項目名</span>` |
| アスタリスク版 | `<span class="imds-required-label-required-asterisk">項目名</span>`（テキストではなく * を表示） |
| ラベル幅 | `imds-field-group` 自体に `is-horizontal imds-w-15` 等を付与（`imds-w-N` 値は `15` / `25` / `30` / `150px` / `250px` がリファレンス記載値） |
| エラー表示要素 | `imds-field` の直下に `<span class="imds-error-text" for=":xxx:" id="error-xxx" style="display:none;"></span>` |
| エラー表示制御 | JS で `el.style.display = ''`/`'none'` で出し入れ。`imds-field` に `imds-validation-error` クラスを付け外し |

⚠️ **アンチパターン（やってはならない）**:
- `<div class="imds-field-label imds-w-NN">` のように `imds-field-label` に幅クラスを付与する（幅は `imds-field` または `imds-field-group` に付与する）
- `<span class="imds-required-mark">*</span>` 等の素の span でアスタリスクを書く（CSS が当たらない）
- `<div class="imds-inline-message is-error" hidden>` をフィールドのエラー表示に流用する（`imds-inline-message` は info メッセージ用）

### 確認ダイアログ（`imdsConfirm`）の関数定義は削除しない

各プレゼンテーションページの `<script>` 内に書かれている `function imdsConfirm(...) { ... }` の自前定義は、**プラットフォームの共通処理から自動提供されない** ため、削除してはならない。リファクタリング時に「重複しているので消せそう」と判断して消すと、そのページの確認ダイアログが動作不能になる。

- 利用ページごとに同じ関数定義を保持する運用が前提
- 関数本体の構造は `reference/imds-csjs-confirm.md` のコードと厳密に一致させること

### ダイアログのルート要素は `<dialog>`、`<div>` はサブ

ダイアログを実装する際は **HTML5 ネイティブの `<dialog class="imds-dialog-wrapper">` を基本** とする。`<div>` ルートはバリエーション扱い（非モーダル / 特殊用途）。理由:

- `<dialog>` + `showModal()` で背面操作禁止 / `::backdrop` / ESC クローズ / フォーカストラップが自動で得られる
- `<div>` ルートではこれらを自前実装する必要があり、抜け漏れがバグの温床になる
- 詳細は `reference/imds-html-dialog.md`
- ダイアログの中に入力フォームを配置する複合パターン（新規作成・編集ダイアログ等）は `reference/imds-html-dialog-form.md` を参照
- ダイアログの中に読み取り専用の情報をテーブル形式で表示するパターン（詳細表示・閲覧ダイアログ）は `reference/imds-html-dialog-detail.md` を参照
- ダイアログの中に検索ボックス + 一覧テーブルを置き、一覧から値を選ぶパターン（データ選択・ルックアップダイアログ）は `reference/imds-html-dialog-select.md` を参照

### ダイアログ内コンテンツの余白

`<dialog class="imds-dialog-wrapper">` の中の `imds-dialog-content` は **デフォルトで padding が無い**。
コンテンツ（フォーム・ボタン等）を直接置くと縁にぴったりくっついて見栄えが悪い。必ず **内側を `<div class="imds-p-4">` でラップ** すること。

```html
<div class="imds-dialog-content imds-scrollbar">
  <div class="imds-p-4">           <!-- 全方向 padding 1rem。これが無いとコンテンツが縁に接触する -->
    <form>...</form>
    <div>... ボタンエリア ...</div>
  </div>
</div>
```

padding 量の調整: `imds-p-2`（狭め） / `imds-p-4`（標準） / `imds-p-6`（広め）。

### imds-field の使用

ラベル付きのフォーム要素を作成する場合は、`imds-field` 構造を使用する。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label for="element-id">ラベル名</label>
  </div>
  <div class="imds-field-control">
    <!-- 入力要素をここに配置 -->
  </div>
</div>
```

### サイズクラスの正確な使用

各コンポーネントは統一されたサイズクラスを持っているため、サイズ指定したい場合は、積極的にサイズクラスを使用すること。
CSS での独自定義は最終手段とすること。

### 状態クラスの理解

各コンポーネントは目的ごとに状態クラスを持っているため、色を付ける目的ではなく、どのような操作が行われるかで状態クラスを使用すること。
例えば、赤くする目的で `is-danger` を使ったり、CSS で色を付けることはしないこと。

### テーブル構造の注意

テーブルは必ず `imds-table` と `imds-table-inner` の二重構造で実装すること。

```html
<div class="imds-table" style="width: 100%; height: 100%; max-height: 250px;">
  <div class="imds-table-inner">
    <table>
      <!-- テーブル内容 -->
    </table>
  </div>
</div>
```

## 生成後の構造検証（必須）

HTML を生成・編集したら、必ず以下のコマンドで imds 構造検証を実行すること。

```bash
node {{AGENT_ROOT}}/skills/jssp-imds-theme/scripts/validate-imds.js <対象ファイルまたはディレクトリ>
```

### 検証対象のルール

`validate-imds.js` は以下のコンポーネントの親子関係を検証する。

| コンポーネント | 主なチェック内容 |
|---|---|
| Table | `div.imds-table > div.imds-table-inner > table` の3層構造 |
| Field | `div.imds-field > div.imds-field-label` / `div.imds-field-control` の直接親子 |
| FieldGroup | `div.imds-field-group > div.imds-field-group-label` / `div.imds-field-group-control` の直接親子 |
| Dialog | `div.imds-dialog-wrapper > div.imds-dialog > div.imds-dialog-header` 等の入れ子 |
| Header | `header.imds-header > div.imds-header-title` 等の直接親子 |
| Button | `span.imds-button-text` の親は `button.imds-button`、`imds-button` は `button` 要素限定 |
| Tabs | `li.imds-tabs-tab` は `div.imds-tabs` の子孫、`imds-tabs-tab` は `li` 要素限定 |
| Pagination | `nav.imds-pagination > div.imds-pagination-controls > div.imds-pagination-page-number` の構造 |
| Accordion | `div.imds-accordion > label.imds-accordion-title > span.imds-accordion-title-inner` 等の入れ子 |
| CheckboxGroup | `div.imds-checkbox-group > label.imds-checkbox` の直接親子（グループ内に限定） |
| RadioGroup | `div.imds-radio-group > label.imds-radio` の直接親子（グループ内に限定） |
| FileUpload | `div.imds-file-upload > div.imds-file-upload-drop-area > p.imds-file-upload-message` の構造 |
| Menu | `nav.imds-menu > ul.imds-menu-list`、`imds-menu` は `nav` 要素限定 |
| Popover | `div.imds-popover > div.imds-popover-menu > div.imds-popover-content` の3層構造 |
| ProgressBar | `div.imds-progress-bar > div.imds-progress-bar-track > div.imds-progress-bar-fill` の3層構造 |
| Stepper | `div.imds-stepper > ul > li.imds-stepper-step` の3層構造 |
| TextboxControl | `div.imds-textbox-control > input.imds-textbox` の直接親子（コントロール内に限定） |
| Tag | `imds-tag` は `span` 要素限定 |
| Textarea | `imds-textarea` は `textarea` 要素限定（textbox と混同しないこと） |
| タグ種別 | `imds-select`=`select`、`imds-textbox`=`input`、`imds-textarea`=`textarea`、`imds-checkbox`/`imds-radio`=`label` ほか各コンポーネントの基本クラスのタグ種別 |
| 未定義クラス検出 | `imds-*` プレフィックスを持つが `reference/` ・`{{AGENT_ROOT}}/{{AGENT_RULES}}/` いずれにも記載が無いクラスを `IMDS-U-001`（warning）として通知。typo / 架空クラス（例: `imds-page-header`）を発見できる |

### 検証結果の対応

- `PASS` → そのまま完了
- `ERROR` → 指摘された行の HTML 構造を修正し、再度 PASS になるまで検証を繰り返す
- `WARN [IMDS-U-001]` → リファレンスに無い `imds-*` クラスが使われている。typo か架空クラスの可能性が高い。リファレンスを確認して正しいクラス名に修正する。意図的に独自定義する場合はそのクラスを定義する CSS が当たっているか確認し、規約ファイルへの追記を検討する

## 実装ワークフロー例

### ログインフォームを作成する場合

1. `textbox.md` を読み込んで、ユーザID入力欄の HTML を取得
2. `textbox.md` から、パスワード入力欄の HTML を取得（`type="password"` に変更）
3. `button.md` を読み込んで、ログインボタン（`is-primary`）を取得
4. 各要素を `imds-field` で適切にラベル付けして配置
5. `node {{AGENT_ROOT}}/skills/jssp-imds-theme/scripts/validate-imds.js <生成ファイル>` を実行し PASS を確認

### データ一覧画面を作成する場合

1. `table.md` を読み込んで、基本テーブル構造を取得
2. `button.md` を読み込んで、新規登録ボタン（`is-primary`）、編集ボタン（`is-outlined`）を配置
3. 必要に応じて `imds-html-dialog.md` を読み込んで、確認ダイアログを実装（入力フォーム付きダイアログの場合は `imds-html-dialog-form.md`、読み取り専用の詳細表示ダイアログの場合は `imds-html-dialog-detail.md`、一覧からデータを選択させるダイアログの場合は `imds-html-dialog-select.md`）
4. `node {{AGENT_ROOT}}/skills/jssp-imds-theme/scripts/validate-imds.js <生成ファイル>` を実行し PASS を確認

## トラブルシューティング

### CSSクラスが正しく動作しない場合

- リファレンスファイルの CSS クラステーブルを再確認
- typo がないか確認（特に `imds-` プレフィックス）
- 組み合わせ可能なクラスを正しく使用しているか確認

### HTML スニペットが見つからない場合

- リファレンスファイルを再読み込み
- 類似のスニペットから適切にカスタマイズ
- 複数のリファレンスを組み合わせて実装
