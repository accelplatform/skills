---
paths:
  - "src/main/jssp/**/*.html"
---

# Img

## 基本情報

Img は、`<img>` タグを使用してアイコンを表示します。
SVG 画像等のカスタムアイコンを使用する場合に利用します。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-img--documentation
- 基本クラス: imds-icon

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-icon | span 要素 | アイコンのラッパー | 必須 |
| is-x-small | imds-icon | 極小サイズ | オプション |
| is-small | imds-icon | 小サイズ | オプション |
| is-normal | imds-icon | 標準サイズ | オプション |
| is-medium | imds-icon | 中サイズ | オプション |
| is-large | imds-icon | 大サイズ | オプション |

## HTML スニペット

### 基本画像アイコン

```html
<span class="imds-icon">
  <img src="img/information.svg" alt="インフォメーションのアイコン" />
</span>
```

以降は基本画像アイコンからの差分のみを示す。

## バリエーション

### size（サイズ）

`span.imds-icon` にサイズクラスを付与する。

```html
<span class="imds-icon is-x-small">  <!-- 極小 -->
<span class="imds-icon is-small">    <!-- 小 -->
<span class="imds-icon is-normal">   <!-- 標準 -->
<span class="imds-icon is-medium">   <!-- 中 -->
<span class="imds-icon is-large">    <!-- 大 -->
```

## 組み合わせ例

### Button との組み合わせ

```html
<!-- テキスト付きボタン -->
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon"><img src="img/screen_existing_additions.svg" /></span>
  <span class="imds-button-text">既存のリソースを追加</span>
</button>

<!-- 新しいタブで開くボタン（is-outlined） -->
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon"><img src="img/url.svg" /></span>
  <span class="imds-button-text">新しいタブで開く</span>
</button>

<!-- アイコンのみボタン -->
<button type="button" class="imds-button is-ghost">
  <span class="imds-icon"><img src="img/addition.svg" /></span>
</button>
```

### Tag との組み合わせ

```html
<span class="imds-tag is-light is-blue">
  <span class="imds-icon is-small"><img src="img/category.svg" /></span>
  <span>カテゴリ</span>
</span>
```

## 実装上の注意

- 意味のあるアイコンには `img` 要素に `alt` 属性を付与してアクセシビリティを確保する
- 装飾目的のアイコンには `alt=""` を指定してスクリーンリーダーから隠す
- アイコンのみのボタンには `button` 要素に `aria-label` を付与する
- SVG ファイルのパスはプロジェクトの構成に合わせて変更すること
