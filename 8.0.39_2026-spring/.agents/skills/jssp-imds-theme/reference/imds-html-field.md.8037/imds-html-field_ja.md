# Field

## 基本情報

Field は、ユーザがデータを入力または選択するための部品です。
フォームの構成要素として使用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-field-field--documentation
- 基本クラス: imds-field

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

## 実装上の注意

- `label` の `for` 属性と `input` の `id` 属性を一致させること（`:r1:` はプレースホルダー）
- `data-required-label="default"` はデフォルトの必須表示（マークなし）
- `imds-help-text` と `imds-error-text` は `imds-field-control` の後に配置する
- `imds-validation-error` を付与すると、入力コントロールの枠線も赤色に変わる
