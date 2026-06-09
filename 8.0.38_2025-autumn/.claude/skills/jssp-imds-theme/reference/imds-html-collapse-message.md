---
paths:
  - "src/main/jssp/**/*.html"
---

# CollapseMessage

## 基本情報

CollapseMessage は、ユーザに読んで欲しい情報のうち、タイトルを常時表示し、詳細情報を折りたたんでおける部品です。
Message 共通の使用方法、注意事項は、Documentation を参照してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-message-collapsemessage--documentation
- 基本クラス: imds-collapse-message

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-collapse-message | div 要素 | 折り畳みメッセージコンテナ | 必須 |
| imds-message-title | div 要素 | タイトル領域（アイコン + テキスト） | 必須 |
| imds-message-content | div 要素 | 折り畳みコンテンツ | 必須 |
| imds-collapse-message-chevron | span 要素 | 開閉シェブロンアイコン | 必須 |
| is-outlined | imds-collapse-message | アウトラインスタイル | オプション |
| is-borderless | imds-collapse-message | ボーダーなしスタイル | オプション |
| is-info | imds-collapse-message | 情報（青） | オプション |
| is-warning | imds-collapse-message | 警告（黄） | オプション |
| is-danger | imds-collapse-message | 危険（赤） | オプション |
| is-success | imds-collapse-message | 成功（緑） | オプション |
| is-error | imds-collapse-message | エラー（赤） | オプション |
| is-x-small | imds-collapse-message | 極小サイズ | オプション |
| is-small | imds-collapse-message | 小サイズ | オプション |
| is-normal | imds-collapse-message | 標準サイズ | オプション |
| is-medium | imds-collapse-message | 中サイズ | オプション |
| is-large | imds-collapse-message | 大サイズ | オプション |

## HTML スニペット

### 基本折り畳みメッセージ

```html
<div class="imds-collapse-message">
  <input
    type="checkbox"
    id="todo-replace-:r1:" />
  <label for="todo-replace-:r1:">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>通知する機能や方法について設定します。</p>
    </div>
    <span class="imds-icon imds-collapse-message-chevron"><i class="fa-solid fa-chevron-down"></i></span>
  </label>
  <div class="imds-message-content">
    <ul>
      <li>メッセージ通知設定では、各機能の通知を受信するメディアを設定します。</li>
      <li>一般通知設定では、一般の通知を受信するメールアドレスを設定します。</li>
    </ul>
  </div>
</div>
```

以降は基本折り畳みメッセージからの差分のみを示す。

## バリエーション

### color（色）

`div.imds-collapse-message` にカラークラスを付与する。
色に応じてアイコンも変更する。

```html
<div class="imds-collapse-message is-info">     <!-- 情報: fa-circle-info -->
<div class="imds-collapse-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-collapse-message is-danger">   <!-- 危険: fa-triangle-exclamation -->
<div class="imds-collapse-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-collapse-message is-error">    <!-- エラー: fa-circle-xmark -->
```

### messageStyle（スタイル）

`div.imds-collapse-message` にスタイルクラスを付与する。

```html
<div class="imds-collapse-message is-outlined">    <!-- アウトライン -->
<div class="imds-collapse-message is-borderless">  <!-- ボーダーなし -->
```

### size（サイズ）

`div.imds-collapse-message` にサイズクラスを付与する。

```html
<div class="imds-collapse-message is-x-small">  <!-- 極小 -->
<div class="imds-collapse-message is-small">    <!-- 小 -->
<div class="imds-collapse-message is-normal">   <!-- 標準 -->
<div class="imds-collapse-message is-medium">   <!-- 中 -->
<div class="imds-collapse-message is-large">    <!-- 大 -->
```

## 実装上の注意

- 開閉は `input[type="checkbox"]` と `label` の連携で CSS のみで制御される（JavaScript 不要）
- `input` の `id` と `label` の `for` は一意の値に置き換えること（`todo-replace-:r1:` はプレースホルダー）
- カラークラスごとに適切なアイコンを使い分ける（上記 color セクション参照）
- `is-outlined` と `is-borderless` は排他的に使用する（同時に付与しない）
- `imds-message-title` と `imds-message-content` のクラス名は Message / BannerMessage コンポーネントと共通
