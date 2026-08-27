---
paths:
  - "src/main/jssp/**/*.html"
---

# Radio

## 基本情報

Radioは、選択肢から 1 つの項目を選択する際に使用する部品です。
Checkbox とは異なり、必ず 1 つの項目を選択する必要があります。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-radio--documentation
- 基本クラス: imds-radio

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-radio | label 要素 | ラジオボタンコンテナ | 必須 |
| is-x-small | imds-radio | 極小サイズ | オプション |
| is-small | imds-radio | 小サイズ | オプション |
| is-normal | imds-radio | 標準サイズ | オプション |
| is-medium | imds-radio | 中サイズ | オプション |
| is-large | imds-radio | 大サイズ | オプション |

## HTML スニペット

### 基本ラジオボタン

```html
<label class="imds-radio">
  <input type="radio" value="" />
  <span>Label</span>
</label>
```

以降は基本ラジオボタンからの差分のみを示す。

## バリエーション

### disabled

`input` に `disabled` 属性を付与する。

```html
<input type="radio" value="" disabled />
```

### checked（選択済み）

`input` に `checked` 属性を付与する。

```html
<input type="radio" value="" checked />
```

### size（サイズ）

`label.imds-radio` にサイズクラスを付与する。

```html
<label class="imds-radio is-x-small">  <!-- 極小 -->
<label class="imds-radio is-small">    <!-- 小 -->
<label class="imds-radio is-normal">   <!-- 標準 -->
<label class="imds-radio is-medium">   <!-- 中 -->
<label class="imds-radio is-large">    <!-- 大 -->
```

## アクセシビリティ対応

- 同一グループのラジオボタンには同じ `name` 属性を付与し、排他選択を実現する
- ラベルテキストは選択肢の内容が明確に分かるようにする

## 実装上の注意

- ラジオボタンは `label.imds-radio > input[type="radio"] + span` の構造で記述する
- **同一グループ内で `name` 属性を必ず一致させること**。`name` が付与されていない、またはグループ内で値が異なると、ブラウザ上で排他選択（1つだけ選択可能な状態）にならない。実装ミスにつながりやすいため必須事項として扱う
  ```html
  <label class="imds-radio">
    <input type="radio" name="status" value="active" />
    <span>有効</span>
  </label>
  <label class="imds-radio">
    <input type="radio" name="status" value="inactive" />
    <span>無効</span>
  </label>
  ```
- `disabled` と `checked` は組み合わせ可能（選択済みで無効化など）
- 複数のラジオボタンをグループ化する場合は RadioGroup（`imds-radio-group`）を使用する。詳細は [imds-html-radio-group.md](imds-html-radio-group.md) を参照
