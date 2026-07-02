# InlineSvg

## 基本情報

InlineSvg は、インライン SVG を使用してアイコンを表示します。
SVG を直接 HTML に埋め込むことで、色やサイズを CSS で制御できます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-inlinesvg--documentation
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
| is-primary | imds-icon | プライマリカラー | オプション |
| is-warning | imds-icon | 警告カラー | オプション |
| is-danger | imds-icon | 危険カラー | オプション |
| is-success | imds-icon | 成功カラー | オプション |
| is-info | imds-icon | 情報カラー | オプション |
| is-error | imds-icon | エラーカラー | オプション |
| is-blue | imds-icon | 青 | オプション |
| is-green | imds-icon | 緑 | オプション |
| is-red | imds-icon | 赤 | オプション |
| is-yellow | imds-icon | 黄 | オプション |
| is-orange | imds-icon | オレンジ | オプション |
| is-cyan | imds-icon | シアン | オプション |
| is-gray | imds-icon | グレー | オプション |
| is-gray-light | imds-icon | 薄いグレー | オプション |
| is-white | imds-icon | 白 | オプション |

## HTML スニペット

### 基本インラインSVGアイコン

```html
<span class="imds-icon">
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
    <path
      fill="hsl(0, 0%, 43%)"
      d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
  </svg>
</span>
```

以降は基本アイコンからの差分のみを示す。

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

### color（色）

`span.imds-icon` にカラークラスを付与する。単色 SVG の場合は `fill="currentColor"` を使用するとカラークラスが反映される。

```html
<span class="imds-icon is-primary">   <!-- プライマリ -->
<span class="imds-icon is-success">   <!-- 成功 -->
<span class="imds-icon is-warning">   <!-- 警告 -->
<span class="imds-icon is-danger">    <!-- 危険 -->
```

その他: `is-blue`, `is-green`, `is-red`, `is-yellow`, `is-orange`, `is-cyan`, `is-gray`, `is-gray-light`, `is-white`

## 組み合わせ例

### Button との組み合わせ

```html
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- SVG パスデータ -->
    </svg>
  </span>
  <span class="imds-button-text">ボタンテキスト</span>
</button>
```

### Tag との組み合わせ

```html
<span class="imds-tag is-light is-blue">
  <span class="imds-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- SVG パスデータ -->
    </svg>
  </span>
  <span>カテゴリ</span>
</span>
```

## 実装上の注意

- SVG に `fill="currentColor"` を指定すると、カラークラス（`is-primary` 等）の色が反映される
- マルチカラーの SVG は直接 `fill` 属性で色を指定するため、カラークラスは効かない
- アクセシビリティ: 意味のあるアイコンには `aria-label` を `span.imds-icon` に付与する。装飾目的のアイコンには `aria-hidden="true"` を付与する
- SVG の `width` / `height` 属性はサイズクラスで上書きされるが、`viewBox` は必ず指定すること
