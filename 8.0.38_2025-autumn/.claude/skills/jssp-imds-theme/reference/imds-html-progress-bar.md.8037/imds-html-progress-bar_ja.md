---
paths:
  - "src/main/jssp/**/*.html"
---

# ProgressBar

## 基本情報

ProgressBar は、実行中の処理の進捗状況を、棒状で視覚的・直感的に表示する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-progress-progressbar--documentation
- 基本クラス: imds-progress-bar

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-progress-bar | div 要素 | 進捗バーコンテナ | 必須 |
| imds-progress-bar-track | div 要素 | トラック（背景バー） | 必須 |
| imds-progress-bar-fill | div 要素 | フィル（進捗表示部分） | 必須 |
| imds-progress-bar-text | span 要素 | 進捗テキスト（パーセント表示） | オプション |
| is-primary | imds-progress-bar | プライマリカラー | オプション |
| is-warning | imds-progress-bar | 警告（黄） | オプション |
| is-danger | imds-progress-bar | 危険（赤） | オプション |
| is-success | imds-progress-bar | 成功（緑） | オプション |
| is-info | imds-progress-bar | 情報（青） | オプション |
| is-error | imds-progress-bar | エラー（赤） | オプション |
| is-blue | imds-progress-bar | 青 | オプション |
| is-green | imds-progress-bar | 緑 | オプション |
| is-red | imds-progress-bar | 赤 | オプション |
| is-yellow | imds-progress-bar | 黄 | オプション |
| is-orange | imds-progress-bar | オレンジ | オプション |
| is-cyan | imds-progress-bar | シアン | オプション |
| is-gray | imds-progress-bar | グレー | オプション |
| is-white | imds-progress-bar | 白 | オプション |
| is-x-small | imds-progress-bar | 極小サイズ | オプション |
| is-small | imds-progress-bar | 小サイズ | オプション |
| is-normal | imds-progress-bar | 標準サイズ | オプション |
| is-medium | imds-progress-bar | 中サイズ | オプション |
| is-large | imds-progress-bar | 大サイズ | オプション |

## HTML スニペット

### 基本進捗バー

```html
<div class="imds-progress-bar">
  <div class="imds-progress-bar-track">
    <div class="imds-progress-bar-fill" style="width: 60%;"></div>
  </div>
  <span class="imds-progress-bar-text">60%</span>
</div>
```

以降は基本進捗バーからの差分のみを示す。

## バリエーション

### color（色）

`div.imds-progress-bar` にカラークラスを付与する。

```html
<div class="imds-progress-bar is-primary">  <!-- プライマリ -->
<div class="imds-progress-bar is-warning">  <!-- 警告 -->
<div class="imds-progress-bar is-danger">   <!-- 危険 -->
<div class="imds-progress-bar is-success">  <!-- 成功 -->
<div class="imds-progress-bar is-info">     <!-- 情報 -->
<div class="imds-progress-bar is-error">    <!-- エラー -->
<div class="imds-progress-bar is-blue">     <!-- 青 -->
<div class="imds-progress-bar is-green">    <!-- 緑 -->
<div class="imds-progress-bar is-red">      <!-- 赤 -->
<div class="imds-progress-bar is-yellow">   <!-- 黄 -->
<div class="imds-progress-bar is-orange">   <!-- オレンジ -->
<div class="imds-progress-bar is-cyan">     <!-- シアン -->
<div class="imds-progress-bar is-gray">     <!-- グレー -->
<div class="imds-progress-bar is-white">    <!-- 白 -->
```

### size（サイズ）

`div.imds-progress-bar` にサイズクラスを付与する。

```html
<div class="imds-progress-bar is-x-small">  <!-- 極小 -->
<div class="imds-progress-bar is-small">    <!-- 小 -->
<div class="imds-progress-bar is-normal">   <!-- 標準 -->
<div class="imds-progress-bar is-medium">   <!-- 中 -->
<div class="imds-progress-bar is-large">    <!-- 大 -->
```

### showProgressWithIcon（アイコンで進捗表示）

テキストの代わりにアイコンで進捗状態を表示する。
`imds-progress-bar-text` を `imds-icon` に置き換える。

```html
<div class="imds-progress-bar is-success is-x-small">
  <div class="imds-progress-bar-track">
    <div class="imds-progress-bar-fill" style="width: 60%;"></div>
  </div>
  <span
    class="imds-icon is-success"
    title="タイトル属性にアイコンが何を表しているのか入力">
    <i class="fa-solid fa-circle-check"></i>
  </span>
</div>
```

### ステータス別アイコンマッピング

`showProgressWithIcon` で使用するアイコンは、ステータス（カラークラス）に応じて以下を使い分ける。

| ステータス | カラークラス | アイコン | 意味の例 |
|-----------|-------------|---------|---------|
| 成功 | is-success | fa-circle-check | 完了 |
| 警告 | is-warning | fa-triangle-exclamation | 進捗に遅延が発生している |
| 危険 | is-danger | fa-triangle-exclamation | 進捗に大きく遅延が発生している |
| エラー | is-error | fa-circle-xmark | エラーが発生した |

```html
<span class="imds-icon is-warning" title="進捗に遅延が発生しています">
  <i class="fa-solid fa-triangle-exclamation"></i>
</span>
<span class="imds-icon is-danger" title="進捗に大きく遅延が発生しています">
  <i class="fa-solid fa-triangle-exclamation"></i>
</span>
<span class="imds-icon is-error" title="エラーが発生しました">
  <i class="fa-solid fa-circle-xmark"></i>
</span>
```

## 実装上の注意

- 進捗率は `imds-progress-bar-fill` の `style="width: XX%;"` で制御する（0〜100%）
- 進捗テキストとアイコンは排他的に使用する（同時に配置しない）
- アイコン使用時は `title` 属性でアイコンの意味を説明し、アクセシビリティを確保する
- アイコンのカラークラス（`is-success` 等）はコンテナとアイコンの両方に付与する
- 進捗率の更新は JavaScript で `imds-progress-bar-fill` の `width` と表示テキストを同期させる
