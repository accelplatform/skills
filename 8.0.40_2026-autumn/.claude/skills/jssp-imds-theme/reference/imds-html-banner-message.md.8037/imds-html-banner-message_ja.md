---
paths:
  - "src/main/jssp/**/*.html"
---

# BannerMessage

## 基本情報

BannerMessage は、画面や特定のエリアの上部にページ内のコンテンツに関する情報を提示する部品です。
Message 共通の使用方法、注意事項は、Documentation を参照してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-message-bannermessage--documentation
- 基本クラス: imds-banner-message

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-banner-message | div 要素 | バナーメッセージコンテナ | 必須 |
| imds-message-title | div 要素 | タイトル領域（アイコン + テキスト） | オプション |
| imds-message-content | div 要素 | メッセージ本文 | オプション |
| imds-message-content-only | imds-banner-message | コンテンツのみ表示（タイトルなし） | オプション |
| is-info | imds-banner-message | 情報（青） | オプション |
| is-warning | imds-banner-message | 警告（黄） | オプション |
| is-danger | imds-banner-message | 危険（赤） | オプション |
| is-success | imds-banner-message | 成功（緑） | オプション |
| is-error | imds-banner-message | エラー（赤） | オプション |

## HTML スニペット

### 基本バナーメッセージ

```html
<div class="imds-banner-message">
  <div class="imds-message-title">
    <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
    <p>アプリケーションの新規作成</p>
  </div>
  <div class="imds-message-content">
    <p>作成する資材をまとめて1つのアプリケーションとして登録します。</p>
    <p>作成するアプリケーション情報を入力してください。</p>
  </div>
</div>
```

以降は基本バナーメッセージからの差分のみを示す。

## バリエーション

### color（色）

`div.imds-banner-message` にカラークラスを付与する。
色に応じてアイコンも変更する。

```html
<div class="imds-banner-message is-info">     <!-- 情報: fa-circle-info -->
<div class="imds-banner-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-banner-message is-danger">   <!-- 危険: fa-triangle-exclamation -->
<div class="imds-banner-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-banner-message is-error">    <!-- エラー: fa-circle-xmark -->
```

### pattern（表示パターン）

#### title-only（タイトルのみ）

`imds-message-content` を省略する。

```html
<div class="imds-banner-message">
  <div class="imds-message-title">
    <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
    <p>アプリケーションの新規作成</p>
  </div>
</div>
```

#### content-only（コンテンツのみ）

`imds-message-content-only` を付与し、`imds-message-title` を省略する。アイコンは `imds-message-content` の前に直接配置する。

```html
<div class="imds-banner-message imds-message-content-only">
  <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
  <div class="imds-message-content">
    <p>作成する資材をまとめて1つのアプリケーションとして登録します。</p>
  </div>
</div>
```

## 組み合わせ例

### Header との組み合わせ

画面上部の `header.imds-header` の直後に `imds-banner-message` を配置し、画面全体に関わるエラー・警告等をヘッダー直下で通知する。

```html
<div>
  <header class="imds-header">
    <div class="imds-header-back-button">
      <button type="button" class="imds-button is-ghost is-large">
        <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
      </button>
    </div>
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-diagram-project"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p>アプリケーション管理</p>
      <h1>アプリケーション名 - リソース関連図</h1>
    </div>
    <div class="imds-header-reload-button">
      <button type="button" class="imds-button is-ghost is-large" title="ページを再読み込み">
        <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
      </button>
    </div>
  </header>
  <div class="imds-banner-message is-error">
    <div class="imds-message-title">
      <span class="imds-icon"><i class="fa-solid fa-circle-xmark"></i></span>
      <p>存在しないリソースを利用しています。</p>
    </div>
  </div>
</div>
```

## 実装上の注意

- カラークラスごとに適切なアイコンを使い分ける（上記 mode セクション参照）
- `imds-message-title` と `imds-message-content` のクラス名は Message コンポーネントと共通
- `content-only` パターンでは構造が異なる（`imds-message-title` を使用せず、アイコンを直接配置する）
- BannerMessage は画面上部に固定配置する用途を想定している。通常のインライン表示には Message を使用する
