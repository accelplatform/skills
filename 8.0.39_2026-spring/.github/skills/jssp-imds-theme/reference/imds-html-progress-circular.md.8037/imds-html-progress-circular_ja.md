---
paths:
  - "src/main/jssp/**/*.html"
---

# ProgressCircular

## 基本情報

ProgressCircular は、実行中の処理の進捗状況を、円形で視覚的・直感的に表示します。
ステータスを表す色やアイコンを適切に使用することで、より処理状況を直感的に理解しやすくなります。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-progress-progresscircular--documentation
- 基本クラス: imds-progress-circular

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-progress-circular | div 要素 | 円形進捗コンテナ | 必須 |
| imds-progress-circular-track | circle 要素 | トラック（背景円） | 必須 |
| imds-progress-circular-fill | circle 要素 | フィル（進捗表示部分） | 必須 |
| imds-progress-circular-text | div 要素 | 中央テキスト領域 | オプション |
| is-primary | imds-progress-circular | プライマリカラー | オプション |
| is-warning | imds-progress-circular | 警告（黄） | オプション |
| is-danger | imds-progress-circular | 危険（赤） | オプション |
| is-success | imds-progress-circular | 成功（緑） | オプション |
| is-info | imds-progress-circular | 情報（青） | オプション |
| is-error | imds-progress-circular | エラー（赤） | オプション |
| is-blue | imds-progress-circular | 青 | オプション |
| is-green | imds-progress-circular | 緑 | オプション |
| is-red | imds-progress-circular | 赤 | オプション |
| is-yellow | imds-progress-circular | 黄 | オプション |
| is-orange | imds-progress-circular | オレンジ | オプション |
| is-cyan | imds-progress-circular | シアン | オプション |
| is-gray | imds-progress-circular | グレー | オプション |
| is-white | imds-progress-circular | 白 | オプション |

## HTML スニペット

### 基本円形進捗

```html
<div
  class="imds-progress-circular"
  style="width: 16rem; height: 16rem; font-size: 4rem;">
  <svg width="160" height="160" viewBox="0 0 160 160">
    <circle
      class="imds-progress-circular-track"
      r="74" cx="80" cy="80"
      fill="transparent" stroke-width="12"></circle>
    <circle
      class="imds-progress-circular-fill"
      r="74" cx="80" cy="80"
      fill="transparent" stroke-linecap="round" stroke-width="12"
      stroke-dasharray="464.96"
      stroke-dashoffset="185.98"></circle>
  </svg>
  <div class="imds-progress-circular-text"><span>60%</span></div>
</div>
```

以降は基本円形進捗からの差分のみを示す。

## バリエーション

### color（色）

`div.imds-progress-circular` にカラークラスを付与する。

```html
<div class="imds-progress-circular is-primary">  <!-- プライマリ -->
<div class="imds-progress-circular is-warning">  <!-- 警告 -->
<div class="imds-progress-circular is-danger">   <!-- 危険 -->
<div class="imds-progress-circular is-success">  <!-- 成功 -->
<div class="imds-progress-circular is-info">     <!-- 情報 -->
<div class="imds-progress-circular is-error">    <!-- エラー -->
<div class="imds-progress-circular is-blue">     <!-- 青 -->
<div class="imds-progress-circular is-green">    <!-- 緑 -->
<div class="imds-progress-circular is-red">      <!-- 赤 -->
<div class="imds-progress-circular is-yellow">   <!-- 黄 -->
<div class="imds-progress-circular is-orange">   <!-- オレンジ -->
<div class="imds-progress-circular is-cyan">     <!-- シアン -->
<div class="imds-progress-circular is-gray">     <!-- グレー -->
<div class="imds-progress-circular is-white">    <!-- 白 -->
```

### showProgressWithIcon（アイコンで進捗表示）

テキストの代わりにアイコンで進捗状態を表示する。`imds-progress-circular-text` 内の `<span>` を `imds-icon` に置き換える。

```html
<div class="imds-progress-circular-text">
  <span
    class="imds-icon is-medium is-success"
    title="タイトル属性にアイコンが何を表しているのか入力">
    <i class="fa-solid fa-check"></i>
  </span>
</div>
```

## 実装上の注意

- サイズは `imds-progress-circular` の `style` 属性（`width`, `height`, `font-size`）で制御する
- 進捗率は `stroke-dashoffset` で制御する。計算式: `円周 × (1 - 進捗率)`（円周 = `2 × π × r`）
- `stroke-dasharray` は円周の値を設定する（`r="74"` の場合: `2 × π × 74 ≈ 464.96`）
- 進捗テキストとアイコンは排他的に使用する（同時に配置しない）
- アイコン使用時は `title` 属性でアイコンの意味を説明し、アクセシビリティを確保する
- アイコンのカラークラス（`is-success` 等）はコンテナとアイコンの両方に付与する
- SVG の `width` / `height` / `viewBox` とコンテナの `style` サイズは用途に合わせて調整する
