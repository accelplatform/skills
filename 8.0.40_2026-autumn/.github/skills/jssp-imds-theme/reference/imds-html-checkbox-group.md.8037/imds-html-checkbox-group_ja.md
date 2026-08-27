---
paths:
  - "src/main/jssp/**/*.html"
---

# CheckboxGroup

## 基本情報

CheckboxGroup は、Checkbox の配置方向を制御する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-checkboxgroup--documentation
- 基本クラス: imds-checkbox-group

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-checkbox-group | div 要素 | チェックボックスグループコンテナ | 必須 |
| is-vertical | imds-checkbox-group | 縦並び | オプション |
| is-horizontal | imds-checkbox-group | 横並び | オプション |

## HTML スニペット

### 基本チェックボックスグループ

```html
<div class="imds-checkbox-group">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span>Label-1</span>
  </label>
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span>Label-2</span>
  </label>
  <!-- 同構造の label を必要数繰り返す -->
</div>
```

以降は基本チェックボックスグループからの差分のみを示す。

## バリエーション

### alignment（配置方向）

`div.imds-checkbox-group` に配置クラスを付与する。

```html
<div class="imds-checkbox-group is-vertical">    <!-- 縦並び -->
<div class="imds-checkbox-group is-horizontal">  <!-- 横並び -->
```

## 組み合わせ例

### ラベルと組み合わせ

入力フォームに配置する場合は、Field でラップして利用する。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-checkbox-group is-vertical">
      <label class="imds-checkbox">
        <input type="checkbox" />
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
    <div class="imds-checkbox-group is-vertical">
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>Label-1</span>
      </label>
      <!-- 同構造の label を必要数繰り返す -->
    </div>
  </div>
  <span class="imds-error-text">エラーメッセージをここに表示します。</span>
</div>
```

## アクセシビリティ対応

- 項目数が多く複数行になる場合は、視認性を高めるため等間隔に配置する

## 実装上の注意

- チェックボックスグループは `div.imds-checkbox-group > label.imds-checkbox` の構造で記述する
- 各チェックボックスの構造は Checkbox コンポーネントに準拠する
- 入力フォームで使用する場合は Field（`imds-field`）でラップする
- バリデーションエラー時は `imds-field` に `imds-validation-error` を付与し、`imds-error-text` でメッセージを表示する
