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
| is-static | imds-textarea | 参照専用の静的表示状態（`readonly` と併用） | オプション |
| is-x-small | imds-textarea | 極小サイズ | オプション |
| is-small | imds-textarea | 小サイズ | オプション |
| is-normal | imds-textarea | 標準サイズ | オプション |
| is-medium | imds-textarea | 中サイズ | オプション |
| is-large | imds-textarea | 大サイズ | オプション |

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

### is-static（参照専用の静的表示）

値は編集できないが、値の選択やコピーはできる参照専用状態。`readonly` 属性と併用する。通常の `readonly`（バリエーション参照）と見た目が異なり、より「参照専用であること」を強調した表示になる。

```html
<textarea class="imds-textarea is-static" readonly>text</textarea>
```

### size（サイズ）

`textarea.imds-textarea` にサイズクラスを付与する。

```html
<textarea class="imds-textarea is-x-small">text</textarea>  <!-- 極小 -->
<textarea class="imds-textarea is-small">text</textarea>    <!-- 小 -->
<textarea class="imds-textarea is-normal">text</textarea>   <!-- 標準 -->
<textarea class="imds-textarea is-medium">text</textarea>   <!-- 中 -->
<textarea class="imds-textarea is-large">text</textarea>    <!-- 大 -->
```

## アクセシビリティ対応

- `placeholder` で入力例を示す場合は、ラベルの代わりにせず、別途ラベルを設定する

## 実装上の注意

- テキストエリアは `textarea.imds-textarea` で記述する
- `readonly` と `disabled` は排他的に使用する（同時に付与しない）
- `is-static` は `readonly` とセットで使用する（`readonly` のみの場合と表示が異なる）
- 入力フォームで使用する場合は Field（`imds-field`）でラップする
- 必要に応じて `rows` 属性で表示行数を制御する
