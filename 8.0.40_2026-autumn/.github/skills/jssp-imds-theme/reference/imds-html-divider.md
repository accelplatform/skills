---
paths:
  - "src/main/jssp/**/*.html"
---

# Divider

## 基本情報

Divider は、コンテンツを水平あるいは垂直方向に区切ることで視覚的にグループ化するための部品です。
レイアウトや余白の調整だけではまとまりの区別が不十分な際に使用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-divider--documentation
- 基本クラス: imds-divider

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-divider | div 要素 | 区切り線 | 必須 |
| is-horizontal | imds-divider | 水平方向の区切り線 | オプション |
| is-vertical | imds-divider | 垂直方向の区切り線 | オプション |
| is-small | imds-divider | 小サイズ（余白が小さい） | オプション |
| is-normal | imds-divider | 標準サイズ | オプション |
| is-large | imds-divider | 大サイズ（余白が大きい） | オプション |

## HTML スニペット

### 基本区切り線

```html
<div style="height: 4em; display: grid;"><div class="imds-divider is-vertical is-small"></div></div>
```

以降は基本区切り線からの差分のみを示す。

## バリエーション

### alignment（方向）

```html
<div class="imds-divider is-horizontal">   <!-- 水平 -->
<div class="imds-divider is-vertical">     <!-- 垂直 -->
```

### size（サイズ）

```html
<div class="imds-divider is-small">   <!-- 小 -->
<div class="imds-divider is-normal">  <!-- 標準 -->
<div class="imds-divider is-large">   <!-- 大 -->
```

## 実装上の注意

- `div` 要素を使用する（`hr` は使用しない）
- 垂直方向の場合、親要素に高さと `display: grid` または `display: flex` を指定する必要がある
