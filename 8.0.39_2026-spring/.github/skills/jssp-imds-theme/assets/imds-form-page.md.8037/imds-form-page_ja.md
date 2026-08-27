# 入力フォーム画面の実装例

imds テーマのコンポーネントを組み合わせた、業務入力フォーム画面の実装例。
「PC端末 - 新規登録」画面を題材に、ヘッダ・セクション・フィールドグループ・各種入力部品・フッタボタンの構成パターンを示す。

本ページはヘッダ・フッタを固定表示し、フォーム部分のみを縦スクロールさせる固定ヘッダーレイアウトを使用する。固定クラス名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-footer` を用いたレイアウト制御パターンを使用する（`height: 100%` ベースのため `<imart type="head">` での `theme-conditional-layout.css` の読み込みが必須。詳細は「実装上の注意」を参照）。機能ごとに異なるプレースホルダー prefix を使う旧方式の解説は [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md) を参照。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | 戻るボタン付きページヘッダ |
| Field | [field.md](../reference/field.md) | 各入力項目 |
| FieldGroup | [field-group.md](../reference/field-group.md) | 入力項目のグループ化 |
| Textbox | [textbox.md](../reference/textbox.md) | テキスト入力 |
| TextboxControl | [textbox-control.md](../reference/textbox-control.md) | 検索アイコン付きテキスト入力 |
| Select | [select.md](../reference/select.md) | プルダウン選択 |
| Radio | [radio.md](../reference/radio.md) | ラジオボタン |
| Checkbox | [checkbox.md](../reference/checkbox.md) | チェックボックス |
| Button | [button.md](../reference/button.md) | アクションボタン |
| IconButton | [icon-button.md](../reference/icon-button.md) | クリアボタン（×アイコン） |
| FileUpload | [file-upload.md](../reference/file-upload.md) | ファイルアップロード |
| IconFont | [icon-font.md](../reference/icon-font.md) | 各種アイコン |

## 全体構成

`imds-container` に `pgstyle-layout-container`（2 行グリッド）、`<main>` に `pgstyle-layout-main`（縦 flex）、フッタに `pgstyle-layout-footer`（`flex:0 0 auto`）を付与する。フォーム領域（`<form>`）のスクロール制御は固定クラス名 `pgstyle-layout-content`（`flex:1 0 0; overflow:auto`）で行う。

```
div.imds-container.pgstyle-layout-container    ... ルート div（intra-mart テーマの imui-container の内側に配置されるため id は付与しない、中間ラッパーも挟まない）
├── header.imds-header                        ... ページヘッダ（戻るボタン・アイコン・タイトル。固定表示）
└── main.pgstyle-layout-main（縦 flex コンテナ）
    ├── form.imds-form               ... フォーム本体（imds-scrollbar 付与。flex:1 0 0; overflow:auto）
    │   ├── section（基本情報）       ... セクション1
    │   │   └── imds-field-container
    │   │       ├── field-group（所有会社）
    │   │       ├── field-group（利用状況）
    │   │       ├── field-group（PC種類）
    │   │       └── field（使用者）
    │   └── section（詳細情報）       ... セクション2
    │       └── imds-field-container
    │           ├── field-group（購入情報）
    │           ├── field-group（マシン情報）
    │           ├── field-group（スペック）
    │           └── field-group（記憶領域暗号化）
    └── div.pgstyle-layout-footer（flex:0 0 auto、スクロール領域の外）  ... 登録・一時保存ボタン
```

## 1. ページヘッダ

戻るボタン + アイコン + タイトル（サブタイトル付き）の構成。
`imds-header-back-button` と `imds-header-icon` を両方配置している。

```html
<header class="imds-header">
  <div class="imds-header-back-button">
    <button
      type="button"
      class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p>PC・可搬媒体管理</p>
    <h1>PC端末 - 新規登録</h1>
  </div>
</header>
```

## 2. フォーム本体

`imds-form` にグレー背景（`has-background-color-gray`）を適用し、スクロール可能な領域として構成する。
フォーム内は `imds-section` で論理的に区切り、各セクションに `imds-heading` で見出しを付ける。

`<form>` 自体が固定ヘッダーレイアウトのスクロール領域（`imds-scrollbar` 付与・`flex: 1 0 0; overflow: auto;`）を兼ねる。ルート `<div>` には `pgstyle-layout-container`、`<main>` には `pgstyle-layout-main`、`<form>` 自体には `pgstyle-layout-content` を付与する（CSS 定義は「実装上の注意」を参照）。

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">
    <!-- 「1. ページヘッダ」参照 -->
  </header>
  <main class="pgstyle-layout-main">
    <form class="imds-form has-background-color-gray pgstyle-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">基本情報</h2>
        <div class="imds-field-container has-accent-color">
          <!-- フィールドグループ群 -->
        </div>
      </section>
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">詳細情報</h2>
        <div class="imds-field-container has-accent-color">
          <!-- フィールドグループ群 -->
        </div>
      </section>
    </form>
    <!-- フッタ（登録・一時保存ボタン）は main 直下・form の外側に配置する。「5. フッタ（アクションボタン）」参照 -->
  </main>
</div>
```

**ポイント:**
- `imds-field-container has-accent-color` でフィールドグループにアクセントカラーの縦線が付く
- `imds-content-normal-width` でコンテンツ幅を標準幅に制限する
- `imds-content-normal-width` を `<form>` 直下ではなく各 `<section>` に付与しているのは意図的な差分である（uiux-share の例は `<form>` 直付けだが、本アセットではセクション単位でも同じ最大幅を再利用できるようにするため）。効果は同等なので、`<form>` へ移動する必要は無い
- ルート `<div>` には id を付与せず `class="imds-container ..."` のみを付与し、中間ラッパーを作らない
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` は機能ごとに置き換えないプレースホルダー**ではない**固定クラス名である。生成時もクラス名は変更しないこと（`imds-` で始まる標準クラスも同様に変更しない）

## 3. 基本情報セクション

### 3.1 ラジオボタン + サブフィールドの組み合わせ（所有会社）

`imds-field-group` 内で、ラジオボタン選択の下にサブフィールド（会社名・部署名）を配置するパターン。
グループラベルに `imds-required-label-required` で必須マークを付与。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label">
    <span
      class="imds-required-label-required"
      data-required-label="必須">
      所有会社
    </span>
  </div>
  <div class="imds-field-group-control">
    <div class="imds-radio-group is-horizontal sample-proprietor">
      <label class="imds-radio">
        <input
          type="radio"
          name="sample-proprietor"
          value="sample-proprietor-1"
          checked="" />
        <span>NTTデータイントラマート</span>
      </label>
      <label class="imds-radio">
        <input
          type="radio"
          name="sample-proprietor"
          value="sample-proprietor-2" />
        <span>その他</span>
      </label>
    </div>
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-company">
          <div class="imds-field-label"><label for=":r6b:">会社名</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6b:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-department">
          <div class="imds-field-label"><label for=":r6c:">部署名</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6c:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**ポイント:**
- `imds-radio-group is-horizontal` でラジオボタンを横並びにする
- `imds-field-group-control` 内にラジオグループとサブフィールドグループを縦に並べる
- ネストした `imds-field-group` でサブフィールドを横並び配置

### 3.2 セレクト + 検索付きテキストの横並び（利用状況）

`imds-field-group-control is-horizontal` で、セレクトボックスと検索アイコン付きテキストボックスを横並びに配置するパターン。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>利用状況</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field sample-status">
      <div class="imds-field-label">
        <label
          class="imds-required-label-required"
          data-required-label="必須"
          for=":r6d:">
          状態
        </label>
      </div>
      <div class="imds-field-control">
        <select
          id=":r6d:"
          class="imds-select">
          <option>選択してください</option>
          <option>セットアップ済</option>
          <option>利用中</option>
        </select>
      </div>
    </div>
    <div class="imds-field sample-location">
      <div class="imds-field-label"><label for=":r6e:">利用場所</label></div>
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            placeholder="利用場所を選択"
            class="imds-textbox"
            readonly
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <button
          type="button"
          class="imds-button is-ghost">
          <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**ポイント:**
- グループラベルは必須マークなし、個別フィールドのラベルに `imds-required-label-required` を付与
- `imds-textbox-control` で検索アイコン付きの読み取り専用テキストボックスを実現
- クリアボタン（`fa-xmark-circle`）を `imds-field-control` 内に併置

### 3.3 縦並びラジオボタン（PC種類）

選択肢が多い場合は `imds-radio-group` をデフォルト（縦並び）で使用する。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label">
    <span
      class="imds-required-label-required"
      data-required-label="必須">
      PC種類
    </span>
  </div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-radio-group">
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-1"
              checked="" />
            <span>デスクトップ</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-2" />
            <span>ノート</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-3" />
            <span>タブレット</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-4" />
            <span>スマートフォン</span>
          </label>
          <label class="imds-radio">
            <input
              type="radio"
              name="sample-media-type"
              value="sample-media-type-5" />
            <span>小型可搬媒体（USBメモリなど）</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3.4 検索付きテキストの単独フィールド（使用者）

`imds-field-group` ではなく `imds-field` を直接使用する単独フィールドのパターン。
`is-horizontal imds-w-15` でグループと同じラベル幅に揃える。

```html
<div class="imds-field is-horizontal imds-w-15 sample-user">
  <div class="imds-field-label"><label for=":r6h:">使用者</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input
        type="text"
        placeholder="ユーザを選択"
        class="imds-textbox"
        readonly
        value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button
      type="button"
      class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

## 4. 詳細情報セクション

### 4.1 日付・金額・検索の横並び（購入情報）

異なる入力タイプ（date、text、検索付きテキスト）を横並びに配置するパターン。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>購入情報</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6i:">購入日</label></div>
      <div class="imds-field-control">
        <input
          type="date"
          id=":r6i:"
          class="imds-textbox"
          value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6j:">購入金額</label></div>
      <div class="imds-field-control">
        <input
          type="text"
          id=":r6j:"
          class="imds-textbox has-text-end"
          value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r6k:">決裁情報</label></div>
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            placeholder="決裁番号を選択"
            class="imds-textbox"
            readonly
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <button
          type="button"
          class="imds-button is-ghost">
          <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
        </button>
      </div>
    </div>
  </div>
</div>
```

**ポイント:**
- `type="date"` でも `imds-textbox` クラスを使用する
- `has-text-end` で金額フィールドを右寄せにする

### 4.2 複数行のフィールドグループ（マシン情報）

`imds-field-group-control` 内にネストした `imds-field-group` を複数配置し、行ごとにフィールドを横並びにするパターン。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>マシン情報</span></div>
  <div class="imds-field-group-control">
    <!-- 1行目: メーカー名・モデル名 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-manufacturer">
          <div class="imds-field-label"><label for=":r6l:">メーカー名</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6l:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-model">
          <div class="imds-field-label"><label for=":r6m:">モデル名</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6m:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 2行目: マシン名・シリアル番号・MACアドレス -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-machine-name">
          <div class="imds-field-label"><label for=":r6n:">マシン名</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6n:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-serial">
          <div class="imds-field-label"><label for=":r6o:">シリアル番号</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6o:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-mac-address">
          <div class="imds-field-label"><label for=":r6p:">MACアドレス</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6p:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 3行目: OS・その他 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-os">
          <div class="imds-field-label"><label for=":r6q:">OS</label></div>
          <div class="imds-field-control">
            <select
              id=":r6q:"
              class="imds-select">
              <option>選択してください</option>
              <option>Windows10</option>
              <option>Windows10</option>
              <option>Mac</option>
              <option>その他</option>
            </select>
          </div>
        </div>
        <div class="imds-field sample-model">
          <div class="imds-field-label"><label for=":r6r:">その他</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6r:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**ポイント:**
- 外側の `imds-field-group-control` は `is-horizontal` を付けず縦並び（行単位）
- 各行をネストした `imds-field-group` > `imds-field-group-control is-horizontal` で横並びにする
- 行ごとにフィールド数が異なっても問題ない（2列、3列、2列）

### 4.3 テキスト + セレクトの連結フィールド（スペック）

メモリ容量のように、テキスト入力と単位セレクトを横に連結するパターン。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>スペック</span></div>
  <div class="imds-field-group-control">
    <!-- 1行目: CPUの世代・SSDの容量・HDDの容量 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field sample-cpu">
          <div class="imds-field-label"><label for=":r6s:">CPUの世代</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6s:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-ssd">
          <div class="imds-field-label"><label for=":r6t:">SSDの容量</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6t:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
        <div class="imds-field sample-hdd">
          <div class="imds-field-label"><label for=":r6u:">HDDの容量</label></div>
          <div class="imds-field-control">
            <input
              type="text"
              id=":r6u:"
              class="imds-textbox"
              value="" />
          </div>
        </div>
      </div>
    </div>
    <!-- 2行目: メモリ容量 + 単位セレクト + メモリ情報 -->
    <div class="imds-field-group">
      <div class="imds-field-group-control is-horizontal">
        <div class="imds-field-group sample-memory-group">
          <div class="imds-field-group-control is-horizontal">
            <div class="imds-field sample-memory-size">
              <div class="imds-field-label"><label for=":r6v:">メモリ容量</label></div>
              <div class="imds-field-control">
                <input
                  type="text"
                  id=":r6v:"
                  class="imds-textbox"
                  value="" />
              </div>
            </div>
            <div class="imds-field sample-memory-size-unit">
              <div class="imds-field-control">
                <select
                  id=":r70:"
                  class="imds-select">
                  <option>GB</option>
                  <option>TB</option>
                </select>
              </div>
            </div>
            <div class="imds-field sample-memory">
              <div class="imds-field-label"><label for=":r71:">メモリ情報</label></div>
              <div class="imds-field-control">
                <input
                  type="text"
                  id=":r71:"
                  class="imds-textbox"
                  value="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

**ポイント:**
- メモリ容量と単位セレクトを `imds-field-group` でさらにグループ化し、連結した見た目にする
- 単位セレクト（`sample-memory-size-unit`）は `imds-field-label` を省略してコントロールのみ配置

### 4.4 チェックボックス + ファイルアップロード（記憶領域暗号化）

チェックボックスとファイルアップロードを同一グループ内に縦並びで配置するパターン。

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>記憶領域暗号化</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field">
      <div class="imds-field-control">
        <label class="imds-checkbox">
          <input type="checkbox" />
          <span>暗号化済</span>
        </label>
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-file-upload">
          <div class="imds-file-upload-drop-area">
            <input type="file" />
            <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
            <p class="imds-file-upload-message">ここにファイルをドラッグ＆ドロップしてください</p>
            <p class="imds-file-upload-text">または</p>
            <button
              type="button"
              class="imds-button is-outlined is-small is-primary">
              ファイルを選択
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 5. フッタ（アクションボタン）

フォーム下部に固定表示するアクションボタン領域。`<main>` 直下・スクロール領域（`<form>`）の**外側**に配置し、固定クラス名 `pgstyle-layout-footer`（`flex: 0 0 auto`）で固定サイズにする。CSS 定義は「実装上の注意」を参照。
プライマリボタン（登録）とアウトラインボタン（一時保存）を横並びに配置する。

```html
<div class="pgstyle-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button
    type="button"
    class="imds-button is-primary"
    style="min-width: 8em;">
    登録
  </button>
  <button
    type="button"
    class="imds-button is-outlined is-primary"
    style="min-width: 8em;">
    一時保存
  </button>
</div>
```

**ポイント:**
- `imds-border-t-1` でフォーム領域との境界線を表示
- メインアクション（登録）には `is-primary`、サブアクション（一時保存）には `is-outlined is-primary` を使用
- 幅指定は独自の `min-width-8em` 系クラスを定義せず、インライン `style="min-width: 8em;"` を使う（`jssp-presentation-page.md`「入力フィールドの幅制御」のアンチパターン参照。カスタムクラスは imds 標準クラスと詳細度が同等になり上書きされうる）

## 実装上の注意

- すべての `imds-field-group` に `is-horizontal imds-w-15` を統一して付与し、ラベル幅を揃えること
- 単独の `imds-field` にも同じ `is-horizontal imds-w-15` を付与してグループと揃えること
- `for` / `id` 属性の `:r6b:` 等はプレースホルダーであり、実装時に一意の値に置き換えること
- 検索アイコン付きテキストボックス（`imds-textbox-control`）には `readonly` を付与し、クリアボタンを併置すること
- `sample-` プレフィックスのクラスはレイアウト調整用の独自クラスであり、imds テーマの標準クラスではない。**生成時は機能名に応じた prefix に置き換えること**（例: 商品管理画面なら `product-*`）。`imds-` で始まる標準クラスは名前を変えずそのまま使う
- `pgstyle-layout-footer` は機能ごとに置き換えないプレースホルダー**ではない**固定クラス名である。生成時もクラス名は変更しないこと
- 本テンプレートはフッタ部分の HTML 断片のみを掲載しているため、`<imart type="head">` の `<style>` に以下のレイアウト制御用スタイルを定義すること（フッタ部分のみが独立スニペットとして存在するため、このファイルでは `pgstyle-layout-footer` の定義のみを掲載する。フォーム全体（`imds-container` / `<main>` / フォーム本体のスクロール領域）を丸ごと使う場合は、`pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` の定義も併せて必要になる。カタログの全定義（`pgstyle-layout-content` を含む）は [imds-list-page.md](imds-list-page.md)「実装上の注意」を参照）

  ```css
  /* レイアウト制御用スタイル */
  .pgstyle-layout-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: left;
    gap: 2em;
  }
  ```

- `<imart type="head">` にはさらに `im_design_system/theme/css/theme-conditional-layout.css`（テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS）の読み込みが必須。これが無いと `.imds-container` の高さが確定せず、コンテンツ領域が高さ 0 に潰れる不具合につながる。

  ```html
  <!-- テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```

## 6. 判断基準（フォーム設計ガイドライン）

「実装上の注意」がクラス名・構造レベルの規約であるのに対し、本節は「どのケースでどちらを選ぶか」という設計判断の基準をまとめる。

### 6.1 必須マークの使い分け

必須マークには 3 種類のバリエーションがある。**同一システム・同一画面内では必ず 1 種類に統一する**（画面ごとに方式が混在すると、ユーザーが「表記の違い＝意味の違い」と誤解する）。

| クラス | 見た目 | 適した対象ユーザー | 使用例 |
|---|---|---|---|
| `imds-required-label-required`（+ `data-required-label="必須"`） | 「必須」バッジを表示 | エンドユーザー・IT リテラシーが高くない利用者向けの画面 | 一般ユーザー向け申請フォーム、汎用マスタ登録画面 |
| `imds-required-label-optional`（+ `data-required-label="任意"`） | 「任意」バッジを表示 | 必須項目が大多数で、任意項目の方が少ない画面 | 必須項目が多く、追加情報のみ任意にしたいフォーム |
| `imds-required-label-required-asterisk` | アスタリスク `*` を表示 | 管理画面・業務システムなど IT リテラシーの高い利用者向け | システム管理者向け設定画面、開発者向け管理コンソール |

**判断手順:**
1. まず利用者層を確認する。管理画面・設定画面など「業務システムに習熟した利用者」が対象なら `required-asterisk`（アスタリスク）でよい
2. エンドユーザー向け・一般利用者向けの画面では、明示的な「必須」表記（`required`）を優先する
3. 必須項目が画面の大部分を占め、任意項目がごく一部の場合は、逆に「任意」マーク（`optional`）だけを少数の任意項目に付与し、他は無印にする方式も検討する（マークの数を最小化できる）
4. 仕様書に必須マークの指定が無い場合は、既定として `imds-required-label-required`（「必須」表記）を使う

### 6.2 フィールド／フィールドグループの並び順

- フォーム内の入力項目は、**左上から右下に向かって、重要度の高い項目・入力順序が自然な項目から**配置する
- 典型的な優先順位の目安: 「識別情報（コード・名称等）」→「分類・ステータス」→「詳細情報・付随情報」→「備考・メモ等の任意項目」
- 関連する項目（例: 「メーカー名」と「モデル名」、「購入日」と「購入金額」）は同じ `imds-field-group` にまとめ、視線移動を減らす
- 入力が別の項目の内容に依存する場合（例: 「都道府県」を選ぶと「市区町村」の選択肢が変わる）は、依存元の項目を依存先より前に配置する
- セクション（`imds-section`）単位でも、基本情報 → 詳細情報 → 任意・補足情報の順に並べるのが原則（フォーム画面の実装例の「基本情報」「詳細情報」の並びを参照）

### 6.3 バリデーションエラー時の入力保持

- バリデーションエラーが発生しても、**ユーザーが入力済みの値は消さず、そのまま画面に表示し続ける**（エラーになった項目も、正常だった項目も含めてすべて保持する）
- 通信エラーや保存失敗などサーバ側のエラーでも同様に、入力値を保持したままエラーメッセージのみを表示する
- 実装パターン:
  - サーバサイドバリデーションの場合、エラー時のレスポンスに入力値をそのまま含めて返し、ファンクションコンテナ側で `<imart type="string" value=$xxx>` により再表示する
  - クライアントサイドバリデーションの場合、`preventDefault()` 等でフォーム送信を止めるだけで、入力値の DOM は変更しない
- エラー表示自体は `<span class="imds-error-text">` を該当 `imds-field` の直下に表示し、`imds-field` に `imds-validation-error` クラスを付け外しして視覚的に強調する（詳細は SKILL.md の「フォーム実装パターン」を参照）
- ページ遷移や一時的な再表示（例: 別ダイアログを開いて閉じる）でも入力値が消えないようにする
