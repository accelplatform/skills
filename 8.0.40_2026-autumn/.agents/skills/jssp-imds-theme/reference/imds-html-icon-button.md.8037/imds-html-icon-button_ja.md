# IconButton

## 基本情報

IconButton は、アイコン付きのボタン部品です。
文字のみの場合より視線を誘導できるため、より目立たせたい箇所で使用します。
Button 共通の使用方法、注意事項は、Button を参照してください。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-button-iconbutton--documentation
- 基本クラス: imds-button
- 基本ボタンの詳細は [button](button.md) を参照

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-button | button 要素 | ボタン要素 | 必須 |
| imds-button-text | span 要素 | ボタンテキストのラッパー | 必須 |
| imds-icon | span 要素 | アイコンのラッパー | 必須 |
| is-x-small | imds-icon | アイコンの極小サイズ（右シェブロン用） | オプション |
| is-outlined | imds-button | 枠線のみの明るい表示スタイル | オプション |
| is-ghost | imds-button | 枠線なしの透明スタイル | オプション |
| is-primary | imds-button | プライマリカラー | オプション |
| is-danger | imds-button | 危険アクション用カラー | オプション |
| is-dark | imds-button | ダークカラー | オプション |
| is-x-small | imds-button | 極小サイズ | オプション |
| is-small | imds-button | 小サイズ | オプション |
| is-normal | imds-button | 標準サイズ | オプション |
| is-medium | imds-button | 中サイズ | オプション |
| is-large | imds-button | 大サイズ | オプション |
| is-applied | imds-button | 適用済み状態のスタイル | オプション |

## HTML スニペット

### 基本アイコンボタン

```html
<button
  type="button"
  class="imds-button">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span class="imds-button-text">Button</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>
```

左アイコン・右アイコンはそれぞれ省略可能。以降は基本アイコンボタンからの差分のみを示す。

## 組み合わせ例

### Popover トリガー

Popover のコンテンツを表示するためのトリガーボタンとして使用する。

```html
<button type="button" class="imds-button">
  <span class="imds-button-text">検索対象</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>
```

### 省略メニュー（ellipsis）

省略されたメニューの表示ボタンとして使用する。アイコンのみのボタンは、操作内容の理解を補助する目的で `title` 属性を設定する。

```html
<button type="button" class="imds-button is-outlined" title="その他の操作">
  <span class="imds-icon"><i class="fa-solid fa-ellipsis"></i></span>
</button>
```

## バリエーション

### title（ツールチップ）

`button` 要素に `title` 属性を付与する。

```html
<button type="button" class="imds-button" title="description">
```

### buttonStyle（枠線）

```html
<button type="button" class="imds-button is-outlined">  <!-- 枠線のみ -->
<button type="button" class="imds-button is-ghost">     <!-- 枠線なし -->
```

### color（色）

`is-outlined` や `is-ghost` と組み合わせ可能。

```html
<button type="button" class="imds-button is-primary">  <!-- プライマリ -->
<button type="button" class="imds-button is-danger">   <!-- 危険 -->
<button type="button" class="imds-button is-dark">     <!-- ダーク -->
```

### size（サイズ）

```html
<button type="button" class="imds-button is-x-small">  <!-- 極小 -->
<button type="button" class="imds-button is-small">    <!-- 小 -->
<button type="button" class="imds-button is-normal">   <!-- 標準 -->
<button type="button" class="imds-button is-medium">   <!-- 中 -->
<button type="button" class="imds-button is-large">    <!-- 大 -->
```

### isApplied（適用済み状態）

フィルター等で選択が適用済みであることを示すスタイル。
左側アイコンの右上に、小さいバッジが表示される。

```html
<button type="button" class="imds-button is-applied">
```

### disabled（無効化状態）

`button` 要素に `disabled` 属性を付与する。クリック不可、視覚的にグレーアウトされる。

```html
<button type="button" class="imds-button" disabled>
```

## 実装上の注意

- アイコンのみのボタン（テキストを含まない構成）は、操作内容の理解を補助する目的で必ず `title` 属性（または `aria-label`）を設定する
