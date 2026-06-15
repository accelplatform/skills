# 入力フォーム画面の実装例

imds テーマのコンポーネントを組み合わせた、業務入力フォーム画面の実装例。
「PC端末 - 新規登録」画面を題材に、ヘッダ・セクション・フィールドグループ・各種入力部品・フッタボタンの構成パターンを示す。

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

```
imds-container
├── header.imds-header           ... ページヘッダ（戻るボタン・アイコン・タイトル）
└── main
    ├── form.imds-form           ... フォーム本体（スクロール領域）
    │   ├── section（基本情報）   ... セクション1
    │   │   └── imds-field-container
    │   │       ├── field-group（所有会社）
    │   │       ├── field-group（利用状況）
    │   │       ├── field-group（PC種類）
    │   │       └── field（使用者）
    │   └── section（詳細情報）   ... セクション2
    │       └── imds-field-container
    │           ├── field-group（購入情報）
    │           ├── field-group（マシン情報）
    │           ├── field-group（スペック）
    │           └── field-group（記憶領域暗号化）
    └── div（フッタ）             ... 登録・一時保存ボタン
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

```html
<form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
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
```

**ポイント:**
- `imds-field-container has-accent-color` でフィールドグループにアクセントカラーの縦線が付く
- `imds-content-normal-width` でコンテンツ幅を標準幅に制限する

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

フォーム下部に固定表示するアクションボタン領域。
プライマリボタン（登録）とアウトラインボタン（一時保存）を横並びに配置する。

```html
<div class="sample-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button
    type="button"
    class="imds-button sample-import-button-min-width-8em is-primary">
    登録
  </button>
  <button
    type="button"
    class="imds-button sample-import-button-min-width-8em is-outlined is-primary">
    一時保存
  </button>
</div>
```

**ポイント:**
- `imds-border-t-1` でフォーム領域との境界線を表示
- メインアクション（登録）には `is-primary`、サブアクション（一時保存）には `is-outlined is-primary` を使用

## 実装上の注意

- すべての `imds-field-group` に `is-horizontal imds-w-15` を統一して付与し、ラベル幅を揃えること
- 単独の `imds-field` にも同じ `is-horizontal imds-w-15` を付与してグループと揃えること
- `for` / `id` 属性の `:r6b:` 等はプレースホルダーであり、実装時に一意の値に置き換えること
- 検索アイコン付きテキストボックス（`imds-textbox-control`）には `readonly` を付与し、クリアボタンを併置すること
- `sample-` プレフィックスのクラスはレイアウト調整用の独自クラスであり、imds テーマの標準クラスではない
