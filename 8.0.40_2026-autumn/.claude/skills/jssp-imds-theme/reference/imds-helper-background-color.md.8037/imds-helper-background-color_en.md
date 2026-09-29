---
paths:
  - "src/main/jssp/**/*.html"
---

# BackgroundColor（背景色ユーティリティ）

## 基本情報

BackgroundColor は、指定した要素に背景色を指定するための imds ヘルパークラス群である。これらは imds のユーティリティクラスであり、`imds-section` 等のコンポーネント固有クラスと組み合わせて使う。単独のコンポーネントとして使うものではない。`has-background-color-gray` は Section 等と組み合わせることで、視覚的に分かりやすいセクショニングを提供する。

- 抽出元: `uiux-share/helper/BackgroundColor.md`

## CSS Classes Reference

| クラス名 | 用途 | 値 |
|----------|------|----|
| `has-background-color-gray` | 要素の背景をグレーにする | 背景色: グレー |
| `has-background-color-white` | 要素の背景を白にする | 背景色: 白 |

## 使用例

### セクションの視覚的な区切り

```html
<div>
  <section>
    <h2 class="imds-heading is-size-4">.has-background-color-gray</h2>
    <div class="imds-py-2 imds-px-4"><div class="has-background-color-gray"></div></div>
  </section>
  <section>
    <h2 class="imds-heading is-size-4">.has-background-color-white</h2>
    <div class="imds-py-2 imds-px-4"><div class="has-background-color-white"></div></div>
  </section>
</div>
```

## 実装上の注意

- 背景色を持つ要素に十分な余白（`imds-p-*` / `imds-py-*` / `imds-px-*` 等）を併用しないと、背景の視認性が損なわれる。
- コンテンツと背景のコントラスト比が低下しないよう、テキスト色との組み合わせに注意する。
