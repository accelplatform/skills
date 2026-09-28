---
paths:
  - "src/main/jssp/**/*.html"
---

# Field

## 基本情報

Field は、ユーザがデータを入力または選択するための部品です。
フォームの構成要素として使用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-field-field--documentation
- 基本クラス: imds-field

## Field に格納できるもの

Field（`imds-field-control` 内）には、**「単一の入力用コンポーネント」を1つだけ**配置する。対象は以下の通り。

- Textbox
- Textarea
- Select
- Checkbox
- Popover
- CheckboxGroup（中に複数の Checkbox）
- RadioGroup（中に複数の Radio）
- InputGroup
- TextboxControl

例外として、入力用コンポーネントとその操作補助を行うコンポーネント（クリアボタン、検索補助ボタン等）を併置する場合は、それらをまとめて「単一の入力用コンポーネント」として扱う。

```html
<!-- TextboxControl + クリアボタン（例外的に単一の入力用コンポーネントとして扱う） -->
<div class="imds-field is-horizontal">
  <div class="imds-field-label">
    <label class="imds-required-label-required-asterisk" for=":r2:">顧客番号</label>
  </div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" placeholder="顧客番号を選択" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost" title="クリア">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

複数の入力用コンポーネントをまとめたい場合は Field を複数並べるか、FieldGroup（[imds-html-field-group.md](imds-html-field-group.md) 参照）を使用する。Field 自体を入れ子にしてはならない。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-field | 外側 div | フィールドコンテナ | 必須 |
| imds-field-label | div 要素 | ラベル領域 | 必須 |
| imds-field-control | div 要素 | コントロール領域 | 必須 |
| is-vertical | imds-field | 垂直レイアウト（ラベルが上） | オプション |
| is-horizontal | imds-field | 水平レイアウト（ラベルが左） | オプション |
| imds-w-15 | imds-field | ラベル幅 15% | オプション |
| imds-w-25 | imds-field | ラベル幅 25% | オプション |
| imds-w-30 | imds-field | ラベル幅 30% | オプション |
| imds-w-150px | imds-field | ラベル幅 150px | オプション |
| imds-w-250px | imds-field | ラベル幅 250px | オプション |
| imds-required-label-required-asterisk | label 要素 | アスタリスク（*）必須マーク | オプション |
| imds-required-label-required | label 要素 | 「必須」テキストマーク | オプション |
| imds-required-label-optional | label 要素 | 「任意」テキストマーク | オプション |
| imds-validation-error | imds-field | バリデーションエラー状態 | オプション |
| imds-help-text | span 要素 | ヘルプテキスト | オプション |
| imds-error-text | span 要素 | エラーメッセージ | オプション |
| imds-field-container | 外側 div | Field / FieldGroup を縦に並べるコンテナ（第1階層は必須） | 必須（複数 Field 配置時） |
| has-divider | imds-field-container | 行ごとの区切り線を表示 | オプション |
| has-accent-color | imds-field-container | ラベルにアクセントカラーを適用 | オプション |

## HTML スニペット

### 基本フィールド

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      data-required-label="default"
      for=":r1:">
      Label
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r1:"
      class="imds-textbox"
      value="" />
  </div>
</div>
```

以降は基本フィールドからの差分のみを示す。

## バリエーション

### alignment（レイアウト方向）

`div.imds-field` にクラスを付与する。

```html
<div class="imds-field is-vertical">    <!-- 垂直（ラベルが上） -->
<div class="imds-field is-horizontal">  <!-- 水平（ラベルが左） -->
```

### labelWidth（ラベル幅）

`div.imds-field` にクラスを付与する。
水平レイアウト時に有効。

```html
<div class="imds-field imds-w-15">     <!-- 15% -->
<div class="imds-field imds-w-25">     <!-- 25% -->
<div class="imds-field imds-w-30">     <!-- 30% -->
<div class="imds-field imds-w-150px">  <!-- 150px -->
<div class="imds-field imds-w-250px">  <!-- 250px -->
```

### required（必須・任意マーク）

`label` 要素にクラスと `data-required-label` 属性を付与する。

```html
<!-- アスタリスク（*） -->
<label class="imds-required-label-required-asterisk" for=":r1:">Label</label>

<!-- 「必須」マーク -->
<label class="imds-required-label-required" for=":r1:" data-required-label="必須">Label</label>

<!-- 「任意」マーク -->
<label class="imds-required-label-optional" for=":r1:" data-required-label="任意">Label</label>
```

## 組み合わせ例

### ヘルプテキスト

`imds-field` 内の末尾に `imds-help-text` を追加する。

```html
<div class="imds-field">
  <!-- imds-field-label, imds-field-control は省略 -->
  <span class="imds-help-text">半角英数字で、50文字まで入力できます。</span>
</div>
```

### バリデーションエラー

`div.imds-field` に `imds-validation-error` を付与し、末尾に `imds-error-text` を追加する。

```html
<div class="imds-field imds-validation-error">
  <!-- imds-field-label, imds-field-control は省略 -->
  <span class="imds-error-text">エラーメッセージをここに表示します。</span>
</div>
```

### 複数 Field を並べる（imds-field-container でラップ）

複数の Field / FieldGroup を並べる場合は、必ず `imds-field-container` でラップする。汎用的な `<div style="display: flex; ...">` 等でラップしてはならない。

```html
<div class="imds-field-container">
  <div class="imds-field">
    <div class="imds-field-label">
      <label class="imds-required-label-required-asterisk" for=":r9:">Label</label>
    </div>
    <div class="imds-field-control">
      <input type="text" id=":r9:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field">
    <div class="imds-field-label"><label for=":ra:">Label</label></div>
    <div class="imds-field-control">
      <input type="text" id=":ra:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

`imds-field-container` の詳細（`has-divider` / `has-accent-color` バリアント）は下記「Field Container」節を参照。

## Field Container（imds-field-container）

`imds-field-container` は、複数の Field / FieldGroup を適切な間隔で縦に並べて配置するためのコンテナ要素である。フォーム内で第1階層に配置する Field / FieldGroup 群は、必ず `imds-field-container` でラップする。

```html
<div class="imds-field-container">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r0:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r0:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r1:">Label 2</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r1:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### has-divider（行区切り線）

フォーム部品を行ごとに区切る線、ラベルとフォーム部品の間に区切り線を表示する。管理者が使用する入力項目の多いフォーム画面に使用する。

```html
<div class="imds-field-container has-divider">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r2:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r2:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r3:">Label 2</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r3:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### has-accent-color（アクセントカラー）

フォームのラベルの背景色や文字色に差し色（アクセントカラー）で表示する。一般ユーザが使用する入力項目の多いフォーム画面に使用する。

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r4:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r4:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### レスポンシブ対応（768px 未満での自動縦積み）

`imds-field-container` 直下に配置した Field は、ブラウザのビューポート幅が 768px 以下になると、`is-horizontal` の指定があってもラベルとフォーム部品が自動的に垂直方向に整列する。第二階層以降の要素や、Field を単体（`imds-field-container` の外）で使用した場合はこの自動レスポンシブ対応の対象外となることに注意する。

```html
<div class="imds-field-container">
  <div class="imds-field is-horizontal imds-validation-error">
    <div class="imds-field-label">
      <label class="imds-required-label-required-asterisk" for=":rb:">Label</label>
    </div>
    <div class="imds-field-control">
      <input type="text" id=":rb:" class="imds-textbox" value="" />
    </div>
    <span class="imds-help-text">半角英数字で、50文字まで入力できます。</span>
    <span class="imds-error-text">エラーメッセージをここに表示します。</span>
  </div>
</div>
```

## 実装上の注意

- `label` の `for` 属性と `input` の `id` 属性を一致させること（`:r1:` はプレースホルダー）
- `data-required-label="default"` はデフォルトの必須表示（マークなし）
- `imds-help-text` と `imds-error-text` は `imds-field-control` の後に配置する
- `imds-validation-error` を付与すると、入力コントロールの枠線も赤色に変わる
- **1つの入力用コンポーネントのみを格納する原則**: `imds-field-control` には「単一の入力用コンポーネント」を1つだけ配置する（詳細は本ファイル冒頭「Field に格納できるもの」を参照）
- **field-container 必須原則**: フォームで第1階層に複数の Field / FieldGroup を配置する場合は、必ず `imds-field-container` でラップする。汎用の `<div style="display: flex; ...">` 等で代用しないこと
- `imds-field-container` 直下の Field / FieldGroup は 768px 未満で自動的に縦積みになる（詳細は「Field Container」節を参照）
