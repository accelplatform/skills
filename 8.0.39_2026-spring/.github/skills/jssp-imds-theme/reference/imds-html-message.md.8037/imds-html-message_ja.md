---
paths:
  - "src/main/jssp/**/*.html"
---

# Message

## 基本情報

Message は、ユーザに読んで欲しい情報を提示する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-message-message--documentation
- 基本クラス: imds-message

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-message | div 要素 | メッセージコンテナ | 必須 |
| imds-message-title | div 要素 | タイトル領域（アイコン + テキスト） | 必須 |
| imds-message-content | div 要素 | メッセージ本文 | オプション |
| is-outlined | imds-message | アウトラインスタイル | オプション |
| is-borderless | imds-message | ボーダーなしスタイル | オプション |
| is-info | imds-message | 情報（青） | オプション |
| is-warning | imds-message | 警告（黄） | オプション |
| is-danger | imds-message | 危険（赤） | オプション |
| is-success | imds-message | 成功（緑） | オプション |
| is-error | imds-message | エラー（赤） | オプション |
| is-x-small | imds-message | 極小サイズ | オプション |
| is-small | imds-message | 小サイズ | オプション |
| is-normal | imds-message | 標準サイズ（デフォルト） | オプション |
| is-medium | imds-message | 中サイズ | オプション |
| is-large | imds-message | 大サイズ | オプション |
| imds-message-content-only | imds-message | 詳細（`imds-message-content`）のみ表示。`imds-message-title` を使わずアイコンと本文を直接配置 | オプション |

## HTML スニペット

### 基本メッセージ

```html
<div class="imds-message">
  <div class="imds-message-title">
    <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
    <p>キャッシュについて</p>
  </div>
  <div class="imds-message-content">
    <p>IM-Repository で利用している列挙型・辞書項目・エンティティ等の情報をキャッシュしています。</p>
  </div>
</div>
```

以降は基本メッセージからの差分のみを示す。

## バリエーション

### style（スタイル）

`div.imds-message` にスタイルクラスを付与する。

```html
<div class="imds-message is-outlined">    <!-- アウトライン -->
<div class="imds-message is-borderless">  <!-- ボーダーなし -->
```

### color（色）

`div.imds-message` にカラークラスを付与する。
色に応じてアイコンも変更する。

```html
<div class="imds-message is-info">     <!-- 情報: fa-circle-info -->
<div class="imds-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-message is-danger">   <!-- 危険: fa-triangle-exclamation -->
<div class="imds-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-message is-error">    <!-- エラー: fa-circle-xmark -->
```

### タイトルのみ（本文なし）

`imds-message-content` を省略する。

```html
<div class="imds-message is-success">
  <div class="imds-message-title">
    <span class="imds-icon is-medium"><i class="fa-solid fa-circle-check"></i></span>
    <p>エンティティとテーブルの情報は一致しています。</p>
  </div>
</div>
```

### アイコン無し（No Icon）

`imds-message-title` 内の `span.imds-icon` を省略する。アイコンが不要な場合や外観を簡素化したい場合に使用する。`imds-message-content-only` と組み合わせる場合は、コンテナ直下のアイコンごと省略する。

```html
<div class="imds-message">
  <div class="imds-message-title"><p>キャッシュについて</p></div>
  <div class="imds-message-content">
    <p>IM-Repository で利用している列挙型・辞書項目・エンティティ等の情報をキャッシュしています。</p>
  </div>
</div>
```

タイトルのみ・アイコン無しの場合:

```html
<div class="imds-message">
  <div class="imds-message-title"><p>キャッシュについて</p></div>
</div>
```

### 詳細のみ（Content Only）

タイトルより本文内容が重要な場合、長文テキストでスペースを節約したい場合に使用する。`div.imds-message` に `imds-message-content-only` を追加し、`imds-message-title` を使わずアイコンと `imds-message-content` を直接配置する。

```html
<div class="imds-message imds-message-content-only">
  <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
  <div class="imds-message-content"><p>IM-BloomMaker を利用したアプリ画面を作成するための情報を定義します。</p></div>
</div>
```

アイコンも省略する場合:

```html
<div class="imds-message imds-message-content-only">
  <div class="imds-message-content">
    <p>IM-Repository で利用している列挙型・辞書項目・エンティティ等の情報をキャッシュしています。</p>
  </div>
</div>
```

### size（サイズ）

`div.imds-message` にサイズクラスを付与する。通常は `is-normal`（デフォルト）を使用し、必要に応じて選択する。

```html
<div class="imds-message is-x-small">  <!-- 極小 -->
<div class="imds-message is-small">    <!-- 小 -->
<div class="imds-message is-normal">   <!-- 標準（デフォルト） -->
<div class="imds-message is-medium">   <!-- 中 -->
<div class="imds-message is-large">    <!-- 大 -->
```

### 本文にリストを使用

`imds-message-content` 内に `<ul>` を配置する。

```html
<div class="imds-message-content">
  <ul>
    <li>注意事項1</li>
    <li>注意事項2</li>
  </ul>
</div>
```

## 実装上の注意

- カラークラスごとに適切なアイコンを使い分ける（上記 color セクション参照）
- `imds-message-content` は省略可能。タイトルのみで伝わる場合は本文を省略する
- `is-outlined` と `is-borderless` は排他的に使用する（同時に付与しない）
- 本文内は `<p>` や `<ul>` を自由に組み合わせられる
- `imds-message-content-only` 使用時は `imds-message-title` を使わず、アイコン（`span.imds-icon`、省略可）と `imds-message-content` を `imds-message` 直下に並べる
