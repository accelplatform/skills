# Textarea

## 基本情報

Textbox は、ユーザが短いテキストや単一行の情報を入力する際に使用する部品です。
複数行の入力が必要な場合は、Textarea を使用してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textarea--documentation
- 基本クラス: imds-textarea

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-textarea | textarea 要素 | テキストエリア | 必須 |

## HTML スニペット

### 基本テキストエリア

```html
<textarea class="imds-textarea">text</textarea>
```

以降は基本テキストエリアからの差分のみを示す。

## バリエーション

### readonly

`textarea` に `readonly` 属性を付与する。

```html
<textarea class="imds-textarea" readonly>text</textarea>
```

### disabled

`textarea` に `disabled` 属性を付与する。

```html
<textarea class="imds-textarea" disabled>text</textarea>
```

## アクセシビリティ対応

- `placeholder` で入力例を示す場合は、ラベルの代わりにせず、別途ラベルを設定する

## 実装上の注意

- テキストエリアは `textarea.imds-textarea` で記述する
- `readonly` と `disabled` は排他的に使用する（同時に付与しない）
- 入力フォームで使用する場合は Field（`imds-field`）でラップする
- 必要に応じて `rows` 属性で表示行数を制御する
