# Checkbox

## 基本情報

Checkbox は、選択肢から項目を選択する際に使用する部品です。
Radio とは異なり、必須選択ではありません。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-checkbox--documentation
- 基本クラス: imds-checkbox

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-checkbox | label 要素 | チェックボックスコンテナ | 必須 |
| is-x-small | imds-checkbox | 極小サイズ | オプション |
| is-small | imds-checkbox | 小サイズ | オプション |
| is-normal | imds-checkbox | 標準サイズ | オプション |
| is-medium | imds-checkbox | 中サイズ | オプション |
| is-large | imds-checkbox | 大サイズ | オプション |

## HTML スニペット

### 基本チェックボックス

```html
<label class="imds-checkbox">
  <input type="checkbox" />
  <span>Label</span>
</label>
```

以降は基本チェックボックスからの差分のみを示す。

## バリエーション

### disabled

`input` に `disabled` 属性を付与する。

```html
<input type="checkbox" disabled />
```

### checked（チェック済み）

`input` に `checked` 属性を付与する。

```html
<input type="checkbox" checked />
```

### size（サイズ）

`label.imds-checkbox` にサイズクラスを付与する。

```html
<label class="imds-checkbox is-x-small">  <!-- 極小 -->
<label class="imds-checkbox is-small">    <!-- 小 -->
<label class="imds-checkbox is-normal">   <!-- 標準 -->
<label class="imds-checkbox is-medium">   <!-- 中 -->
<label class="imds-checkbox is-large">    <!-- 大 -->
```

## アクセシビリティ対応

- ラベルは `label` 要素で `input` を囲むことで関連付ける
- ラベルテキストは選択肢の内容が明確に分かるようにする

## 実装上の注意

- チェックボックスは `label.imds-checkbox > input[type="checkbox"] + span` の構造で記述する
- `disabled` と `checked` は組み合わせ可能（チェック済みで無効化など）
- 複数のチェックボックスをグループ化する場合は `fieldset` と `legend` を使用する
- チェック状態の変更は JavaScript で制御する
