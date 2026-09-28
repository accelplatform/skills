# ContentWidth（コンテンツ幅ユーティリティ）

## 基本情報

ContentWidth は、指定したコンテナ要素の横幅を指定するための imds ヘルパークラス群である。これらは imds のユーティリティクラスであり、`imds-section` 等のコンポーネント固有クラスと組み合わせて使う。単独のコンポーネントとして使うものではない。

- 抽出元: `uiux-share/helper/ContentWidth.md`

## CSS Classes Reference

| クラス名 | 用途 | 値 |
|----------|------|----|
| `imds-content-normal-width` | 最大幅を持つコンテナ幅を指定する | 最大幅 1200px。最大値以下では画面幅に合わせて伸縮する |
| `imds-content-full-width` | 画面幅いっぱいのコンテナ幅を指定する | 幅 100%。画面幅に合わせて伸縮する |

## 使用例

### 最大幅 1200px のコンテナ

```html
<section class="imds-section">
  <h2 class="imds-heading is-size-4">.imds-content-normal-width</h2>
  <p class="imds-help-text">横幅に最大値 1200px が指定されています。最大値以下では横幅は画面幅に合わせて伸縮します。</p>
  <div class="imds-content-normal-width imds-border-2"></div>
</section>
```

### 画面幅いっぱいのコンテナ

```html
<section class="imds-section">
  <h2 class="imds-heading is-size-4">.imds-content-full-width</h2>
  <p class="imds-help-text">横幅は 100% で指定されており、画面幅に合わせて伸縮します。</p>
  <div class="imds-content-full-width imds-border-2"></div>
</section>
```

## 実装上の注意

- 一般的な業務画面のメインコンテンツ領域には `imds-content-normal-width` を使い、可読性を確保するため過度に横長にならないようにする。
- ダッシュボードや一覧画面等、画面幅を最大限に活用したい場合のみ `imds-content-full-width` を検討する。
