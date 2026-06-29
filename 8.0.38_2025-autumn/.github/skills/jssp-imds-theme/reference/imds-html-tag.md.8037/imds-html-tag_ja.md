---
paths:
  - "src/main/jssp/**/*.html"
---

# Tag

## 基本情報

Tag は、画面や処理などのメタ情報、ステータスを端的かつ視覚的に表すための部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-tag--documentation
- 基本クラス: imds-tag

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-tag | span 要素 | タグコンテナ | 必須 |
| is-rounded | imds-tag | 角丸スタイル | オプション |
| is-blue | imds-tag | 青 | オプション |
| is-green | imds-tag | 緑 | オプション |
| is-red | imds-tag | 赤 | オプション |
| is-yellow | imds-tag | 黄 | オプション |
| is-orange | imds-tag | オレンジ | オプション |
| is-cyan | imds-tag | シアン | オプション |
| is-gray | imds-tag | グレー | オプション |
| is-gray-light | imds-tag | ライトグレー | オプション |
| is-light | imds-tag | 明るいトーン | オプション |
| is-dark | imds-tag | 暗いトーン | オプション |
| is-x-small | imds-tag | 極小サイズ | オプション |
| is-small | imds-tag | 小サイズ | オプション |
| is-normal | imds-tag | 標準サイズ | オプション |
| is-medium | imds-tag | 中サイズ | オプション |
| is-large | imds-tag | 大サイズ | オプション |

## HTML スニペット

### 基本タグ

```html
<span class="imds-tag"><span>text</span></span>
```

以降は基本タグからの差分のみを示す。

## バリエーション

### tagStyle（スタイル）

`span.imds-tag` に `is-rounded` を付与する。

```html
<span class="imds-tag is-rounded"><span>text</span></span>
```

### color（色）

`span.imds-tag` にカラークラスを付与する。

```html
<span class="imds-tag is-blue">        <!-- 青 -->
<span class="imds-tag is-green">       <!-- 緑 -->
<span class="imds-tag is-red">         <!-- 赤 -->
<span class="imds-tag is-yellow">      <!-- 黄 -->
<span class="imds-tag is-orange">      <!-- オレンジ -->
<span class="imds-tag is-cyan">        <!-- シアン -->
<span class="imds-tag is-gray">        <!-- グレー -->
<span class="imds-tag is-gray-light">  <!-- ライトグレー -->
```

### tone（トーン）

`span.imds-tag` にトーンクラスを付与する。カラークラスと組み合わせて使用する。

```html
<span class="imds-tag is-blue is-light">  <!-- 明るいトーン -->
<span class="imds-tag is-blue is-dark">   <!-- 暗いトーン -->
```

### size（サイズ）

`span.imds-tag` にサイズクラスを付与する。

```html
<span class="imds-tag is-x-small">  <!-- 極小 -->
<span class="imds-tag is-small">    <!-- 小 -->
<span class="imds-tag is-normal">   <!-- 標準 -->
<span class="imds-tag is-medium">   <!-- 中 -->
<span class="imds-tag is-large">    <!-- 大 -->
```

### closeIconExists（削除ボタン付き）

テキストの後に削除ボタンを追加する。

```html
<span class="imds-tag">
  <span>text</span>
  <button title="Delete">
    <span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>
  </button>
</span>
```

## 組み合わせ例

### Icon との組み合わせ

テキストの前に `imds-icon` を追加する。

```html
<span class="imds-tag">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span>text</span>
</span>
```

## 実装上の注意

- タグは `span.imds-tag > span` の入れ子構造で記述する
- カラー・トーン・サイズは組み合わせ可能（例: `is-blue is-light is-small`）
- `is-light` と `is-dark` は排他的に使用する（同時に付与しない）
- 削除ボタンのクリックイベントは JavaScript で制御する
- アイコンとテキストは同時に使用可能、アイコンはテキストの前に配置する
