---
paths:
  - "src/main/jssp/**/*.html"
---

# Toggle

## 基本情報

Toggle は、オン/オフの状態を切り替える際に使用する部品です。
即時に変更が反映される場合にのみ使用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-toggle--documentation
- 基本クラス: imds-toggle-switch

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-toggle-switch | label 要素 | トグルスイッチコンテナ | 必須 |
| imds-toggle-switch-appearance | span 要素 | スイッチ外観 | 必須 |
| imds-toggle-switch-text | span 要素 | ラベルテキスト | 必須 |
| is-x-small | imds-toggle-switch | 極小サイズ | オプション |
| is-small | imds-toggle-switch | 小サイズ | オプション |
| is-normal | imds-toggle-switch | 標準サイズ | オプション |
| is-medium | imds-toggle-switch | 中サイズ | オプション |
| is-large | imds-toggle-switch | 大サイズ | オプション |

## HTML スニペット

### 基本トグル

```html
<label class="imds-toggle-switch">
  <input type="checkbox" />
  <span class="imds-toggle-switch-appearance">
    <span class="imds-icon"><i class="fa-solid fa-check"></i></span>
  </span>
  <span class="imds-toggle-switch-text">Label</span>
</label>
```

以降は基本トグルからの差分のみを示す。

## バリエーション

### size（サイズ）

`label.imds-toggle-switch` にサイズクラスを付与する。

```html
<label class="imds-toggle-switch is-x-small">  <!-- 極小 -->
<label class="imds-toggle-switch is-small">    <!-- 小 -->
<label class="imds-toggle-switch is-normal">   <!-- 標準 -->
<label class="imds-toggle-switch is-medium">   <!-- 中 -->
<label class="imds-toggle-switch is-large">    <!-- 大 -->
```

### disabled

`input` に `disabled` 属性を付与する。

```html
<input type="checkbox" disabled />
```

### checked（オン状態）

`input` に `checked` 属性を付与する。

```html
<input type="checkbox" checked />
```

## アクセシビリティ対応

### ラベル

- トグルスイッチのラベルは、スイッチをオンにした際に「なに」が「どうなる」のか分かるようにする

  **良いパターン**: 二段階認証を有効にする
  **悪いパターン**: 二段階認証

- ラベルはスイッチの状態によって変化させず、常に同じものを表示する。ラベルが変化すると、状態を表しているのかアクションを表しているのかが分かりづらくなる

  **良いパターン**: 二段階認証を有効にする
  **悪いパターン**: 二段階認証を無効にする

## 実装上の注意

- トグルスイッチは `label > input[type="checkbox"] + span.imds-toggle-switch-appearance + span.imds-toggle-switch-text` の構造で記述する
- `imds-toggle-switch-appearance` 内にチェックアイコン（`fa-solid fa-check`）を含める
- オン/オフの状態は `input` の `checked` 属性で制御する
- `disabled` と `checked` は組み合わせ可能（オン状態で無効化など）
- ラベルテキストはスイッチの状態によって変化させない
