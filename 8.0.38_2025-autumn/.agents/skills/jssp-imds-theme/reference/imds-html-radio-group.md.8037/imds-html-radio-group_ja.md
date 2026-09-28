# RadioGroup

## 基本情報

RadioGroup は、Radio の配置方向を制御する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-radiogroup--documentation
- 基本クラス: imds-radio-group

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-radio-group | div 要素 | ラジオボタングループコンテナ | 必須 |
| is-vertical | imds-radio-group | 縦並び | オプション |
| is-horizontal | imds-radio-group | 横並び | オプション |

## HTML スニペット

### 基本ラジオボタングループ

```html
<div class="imds-radio-group">
  <label class="imds-radio">
    <input type="radio" name="todo-replace-:r1:" value="" />
    <span>Label-1</span>
  </label>
  <label class="imds-radio">
    <input type="radio" name="todo-replace-:r1:" value="" />
    <span>Label-2</span>
  </label>
  <!-- 同構造の label を必要数繰り返す -->
</div>
```

以降は基本ラジオボタングループからの差分のみを示す。

## バリエーション

### alignment（配置方向）

`div.imds-radio-group` に配置クラスを付与する。

```html
<div class="imds-radio-group is-vertical">    <!-- 縦並び -->
<div class="imds-radio-group is-horizontal">  <!-- 横並び -->
```

## 組み合わせ例

### Label との組み合わせ

入力フォームに配置する場合は、Field でラップして利用する。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-vertical">
      <label class="imds-radio">
        <input type="radio" name="todo-replace-:r1:" value="" />
        <span>Label-1</span>
      </label>
      <!-- 同構造の label を必要数繰り返す -->
    </div>
  </div>
</div>
```

### バリデーションエラー

`div.imds-field` に `imds-validation-error` を付与し、末尾にエラーメッセージを追加する。

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-vertical">
      <label class="imds-radio">
        <input type="radio" name="todo-replace-:r1:" value="" />
        <span>Label-1</span>
      </label>
      <!-- 同構造の label を必要数繰り返す -->
    </div>
  </div>
  <span class="imds-error-text">エラーメッセージをここに表示します。</span>
</div>
```

## アクセシビリティ対応

- 同一グループのラジオボタンには同じ `name` 属性を付与し、排他選択を実現する
- 項目数が多く複数行になる場合は、視認性を高めるため等間隔に配置する

## 実装上の注意

- ラジオボタングループは `div.imds-radio-group > label.imds-radio` の構造で記述する
- 各ラジオボタンの構造は Radio コンポーネントに準拠する
- グループ内の全 `input` に同じ `name` 属性を設定する
- 入力フォームで使用する場合は Field（`imds-field`）でラップする
- バリデーションエラー時は `imds-field` に `imds-validation-error` を付与し、`imds-error-text` でメッセージを表示する
