---
paths:
  - "src/main/jssp/**/*.html"
---

# IconFont

## 基本情報

IconFont は、`<i>` タグを使用してアイコンを表示します。
テーマを利用している場合は、Font Awesome と `imds-iconfont` のアイコンが利用できます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-iconfont--documentation
- 基本クラス: imds-icon

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-icon | span 要素 | アイコンのラッパー | 必須 |
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
| is-x-small | imds-icon | 極小サイズ | オプション |
| is-small | imds-icon | 小サイズ | オプション |
| is-normal | imds-icon | 標準サイズ | オプション |
| is-medium | imds-icon | 中サイズ | オプション |
| is-large | imds-icon | 大サイズ | オプション |

## HTML スニペット

### 基本アイコン

```html
<span class="imds-icon" title="インフォメーションのアイコン">
  <i class="fa-solid fa-circle-info"></i>
</span>
```

以降は基本アイコンからの差分のみを示す。

## バリエーション

### iconName（アイコン種類）

`<i>` 要素のクラスを変更する。Font Awesome 6 および `imds-iconfont` が使用可能。

```html
<i class="fa-solid fa-circle-check"></i>
<i class="fa-solid fa-triangle-exclamation"></i>
<i class="fa-solid fa-circle-info"></i>
```

### color（色）

`span.imds-icon` にカラークラスを付与する。

```html
<span class="imds-icon is-primary">   <!-- プライマリ -->
<span class="imds-icon is-success">   <!-- 成功 -->
<span class="imds-icon is-warning">   <!-- 警告 -->
<span class="imds-icon is-danger">    <!-- 危険 -->
<span class="imds-icon is-info">      <!-- 情報 -->
<span class="imds-icon is-error">     <!-- エラー -->
```

その他: `is-blue`, `is-green`, `is-red`, `is-yellow`, `is-orange`, `is-cyan`, `is-gray`, `is-gray-light`, `is-white`

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
<button type="button" class="imds-button is-primary">
  <span class="imds-icon"><i class="fa-solid fa-add"></i></span>
  <span class="imds-button-text">新規作成</span>
</button>

<!-- アイコンのみボタン -->
<button type="button" class="imds-button is-outlined is-primary" aria-label="追加">
  <span class="imds-icon is-primary"><i class="fa-solid fa-add"></i></span>
</button>
```

### min-width-8em / button-spacing との組み合わせ

ツールバーや操作エリアでは、`imds-button` の spacing ヘルパー（`min-width-8em`、`button-spacing`）と組み合わせて使用する。詳細は [imds-html-button.md](imds-html-button.md) を参照。

```html
<div class="button-spacing">
  <button type="button" class="imds-button is-primary min-width-8em">
    <span class="imds-icon"><i class="fa-solid fa-add"></i></span>
    <span class="imds-button-text">新規作成</span>
  </button>
  <button type="button" class="imds-button is-danger min-width-8em">
    <span class="imds-icon"><i class="fa-solid fa-trash-can"></i></span>
    <span class="imds-button-text">削除</span>
  </button>
  <button type="button" class="imds-button is-outlined is-primary" aria-label="追加">
    <span class="imds-icon is-primary"><i class="fa-solid fa-add"></i></span>
  </button>
  <button type="button" class="imds-button is-outlined is-danger" aria-label="削除">
    <span class="imds-icon is-danger"><i class="fa-solid fa-trash-can"></i></span>
  </button>
</div>
```

### Tag との組み合わせ

```html
<span class="imds-tag is-green is-light">
  <span class="imds-icon is-success"><i class="fa-solid fa-circle-check"></i></span>
  <span>Success</span>
</span>
```

## 実装上の注意

- アイコンのみで意味を伝える場合は `title` 属性または `aria-label` を付与してアクセシビリティを確保する
- 装飾目的のアイコンには `aria-hidden="true"` を付与し、スクリーンリーダーから隠す
- アイコンのみのボタンには `button` 要素に `aria-label` を付与する
