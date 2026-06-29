# InlineMessage

## 基本情報

InlineMessage は、ユーザに読んで欲しい情報をインラインで提示する部品です。
Message 共通の使用方法、注意事項は、Documentation を参照してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-message-inlinemessage--documentation
- 基本クラス: imds-inline-message

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-inline-message | div 要素 | インラインメッセージコンテナ | 必須 |
| is-outlined | imds-inline-message | アウトラインスタイル | オプション |
| is-borderless | imds-inline-message | ボーダーなしスタイル | オプション |
| is-info | imds-inline-message | 情報（青） | オプション |
| is-warning | imds-inline-message | 警告（黄） | オプション |
| is-danger | imds-inline-message | 危険（赤） | オプション |
| is-success | imds-inline-message | 成功（緑） | オプション |
| is-error | imds-inline-message | エラー（赤） | オプション |
| is-x-small | imds-inline-message | 極小サイズ | オプション |
| is-small | imds-inline-message | 小サイズ | オプション |
| is-normal | imds-inline-message | 標準サイズ | オプション |
| is-medium | imds-inline-message | 中サイズ | オプション |
| is-large | imds-inline-message | 大サイズ | オプション |

## HTML スニペット

### 基本インラインメッセージ

```html
<div class="imds-inline-message">
  <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
  <p>スケジュールの表示セットをドラッグ＆ドロップで並び替えます。</p>
</div>
```

以降は基本インラインメッセージからの差分のみを示す。

## バリエーション

### color（色）

`div.imds-inline-message` にカラークラスを付与する。
色に応じてアイコンも変更する。

```html
<div class="imds-inline-message is-info">     <!-- 情報: fa-circle-info -->
<div class="imds-inline-message is-warning">  <!-- 警告: fa-triangle-exclamation -->
<div class="imds-inline-message is-danger">   <!-- 危険: fa-triangle-exclamation -->
<div class="imds-inline-message is-success">  <!-- 成功: fa-circle-check -->
<div class="imds-inline-message is-error">    <!-- エラー: fa-circle-xmark -->
```

### messageStyle（スタイル）

`div.imds-inline-message` にスタイルクラスを付与する。

```html
<div class="imds-inline-message is-outlined">    <!-- アウトライン -->
<div class="imds-inline-message is-borderless">  <!-- ボーダーなし -->
```

### size（サイズ）

`div.imds-inline-message` にサイズクラスを付与する。

```html
<div class="imds-inline-message is-x-small">  <!-- 極小 -->
<div class="imds-inline-message is-small">    <!-- 小 -->
<div class="imds-inline-message is-normal">   <!-- 標準 -->
<div class="imds-inline-message is-medium">   <!-- 中 -->
<div class="imds-inline-message is-large">    <!-- 大 -->
```

## 実装上の注意

- InlineMessage は `imds-message-title` / `imds-message-content` を使用せず、アイコンとテキストを直接配置するシンプルな構造
- カラークラスごとに適切なアイコンを使い分ける（上記 color セクション参照）
- `is-outlined` と `is-borderless` は排他的に使用する（同時に付与しない）
- フォーム入力欄の直下にバリデーションメッセージを表示する等、コンパクトな用途に適している
