---
paths:
  - "src/main/jssp/**/*.html"
---

# Select

## 基本情報

Select は選択肢から 1 つの項目を選択する際に使用する部品です。
選択肢が少ない場合、または、十分なスペースがある場合は、全ての項目を俯瞰して見ることができる Radio を利用してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-select--documentation
- 基本クラス: imds-select

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-select | select 要素 | セレクトボックス | 必須 |
| is-x-small | imds-select | 極小サイズ | オプション |
| is-small | imds-select | 小サイズ | オプション |
| is-normal | imds-select | 標準サイズ | オプション |
| is-medium | imds-select | 中サイズ | オプション |
| is-large | imds-select | 大サイズ | オプション |
| is-static | imds-select | 参照専用の静的表示状態（`disabled` と併用） | オプション |

## HTML スニペット

### 基本セレクトボックス

```html
<select class="imds-select">
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>
```

以降は基本セレクトボックスからの差分のみを示す。

## バリエーション

### disabled

`select` に `disabled` 属性を付与する。

```html
<select class="imds-select" disabled>
```

### size（サイズ）

`select.imds-select` にサイズクラスを付与する。

```html
<select class="imds-select is-x-small">  <!-- 極小 -->
<select class="imds-select is-small">    <!-- 小 -->
<select class="imds-select is-normal">   <!-- 標準 -->
<select class="imds-select is-medium">   <!-- 中 -->
<select class="imds-select is-large">    <!-- 大 -->
```

### multiple（複数選択）

`select` に `multiple` 属性を付与する。

```html
<select class="imds-select" multiple>
```

### is-static（参照専用の静的表示）

値の編集はできないが、参照専用として表示する状態。HTML 仕様上 `<select>` には `readonly` 属性が存在しないため、`is-static` クラスと `disabled` 属性を併用して参照専用の見た目を実現する（Textbox / Textarea が `readonly` を使うのとは異なる点に注意）。

```html
<!-- 単一選択 -->
<select class="imds-select is-static" disabled>
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>

<!-- 複数選択 -->
<select multiple class="imds-select is-static" disabled>
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>
```

## アクセシビリティ対応

- 初期値は、ユーザによる変更が行われなかった際に利用されるため、最も選択される項目や推奨する項目を指定する

## 実装上の注意

- セレクトボックスは `select.imds-select > option` の構造で記述する
- `disabled` は `select` 要素に付与する（個別の `option` にも付与可能）
- `multiple` 使用時はリスト表示になり、複数項目を選択できる
- 入力フォームで使用する場合は Field（`imds-field`）でラップする
- 参照専用表示（`is-static`）は `disabled` 属性とセットで使用する。`<select>` に `readonly` は指定できない
