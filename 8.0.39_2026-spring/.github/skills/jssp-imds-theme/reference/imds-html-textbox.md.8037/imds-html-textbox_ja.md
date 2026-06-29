---
paths:
  - "src/main/jssp/**/*.html"
---

# Textbox

## 基本情報

Textbox は、ユーザが短いテキストや単一行の情報を入力する際に使用する部品です。
複数行の入力が必要な場合は、Textarea を使用してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textbox--documentation
- 基本クラス: imds-textbox

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-textbox | input 要素 | テキストボックス | 必須 |
| is-static | imds-textbox | 静的表示（枠線なし） | オプション |
| is-x-small | imds-textbox | 極小サイズ | オプション |
| is-small | imds-textbox | 小サイズ | オプション |
| is-normal | imds-textbox | 標準サイズ | オプション |
| is-medium | imds-textbox | 中サイズ | オプション |
| is-large | imds-textbox | 大サイズ | オプション |

## HTML スニペット

### 基本テキストボックス

```html
<input type="text" placeholder="" class="imds-textbox" value="text" />
```

以降は基本テキストボックスからの差分のみを示す。

## バリエーション

### readonly

`input` に `readonly` 属性を付与する。

```html
<input type="text" placeholder="" class="imds-textbox" value="text" readonly />
```

### disabled

`input` に `disabled` 属性を付与する。

```html
<input type="text" placeholder="" class="imds-textbox" value="text" disabled />
```

### static（静的表示）

`input` に `is-static` クラスと `readonly` 属性を付与する。枠線が非表示になる。

```html
<input type="text" placeholder="" class="imds-textbox is-static" value="text" readonly />
```

### size（サイズ）

`input.imds-textbox` にサイズクラスを付与する。

```html
<input type="text" class="imds-textbox is-x-small" />  <!-- 極小 -->
<input type="text" class="imds-textbox is-small" />    <!-- 小 -->
<input type="text" class="imds-textbox is-normal" />   <!-- 標準 -->
<input type="text" class="imds-textbox is-medium" />   <!-- 中 -->
<input type="text" class="imds-textbox is-large" />    <!-- 大 -->
```

## アクセシビリティ対応

### プレースホルダーの利用用途

- プレースホルダーは、ユーザが入力内容をイメージしやすくするためのヒントとして有効である
- しかし、誤った使い方をすると、かえってユーザを混乱させる可能性がある
- プレースホルダーを利用する際は、以下の点に注意する

  **プレースホルダーはラベルの代わりにはならないこと**
  - プレースホルダーは入力すると消えてしまうため、ユーザが後から何を入力する項目だったかを確認できなくなる
  - そのため、入力項目の意味を明確にするラベルと、入力のヒントを示すプレースホルダーを適切に使い分ける必要がある

  **簡潔なヒントとしての利用に限定すること**
  - プレースホルダーは、入力形式や例を簡潔に示すために利用する
  - 詳しい説明や入力に関する注意点などは、プレースホルダーではなく、Field のヘルプテキストで提供する

  **記憶が必要な情報に利用しないこと**
  - プレースホルダーは、ユーザが入力操作を開始すると見えなくなる
  - そのため、重要な情報や、ユーザが記憶しておく必要がある情報には利用しない

## 実装上の注意

- テキストボックスは `input[type="text"].imds-textbox` で記述する
- `is-static` は `readonly` と組み合わせて使用する（読み取り専用の静的表示）
- `readonly` と `disabled` は排他的に使用する（同時に付与しない）
- 入力フォームで使用する場合は Field（`imds-field`）でラップする
