---
paths:
  - "src/main/jssp/**/*.html"
---

# Button

## 基本情報

Button は、ユーザがクリックすることで登録処理や検索、別画面への遷移などの処理を実行する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-button-button--documentation
- 基本クラス: imds-button

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-button | button 要素 | ボタン要素 | 必須 |
| imds-button-text | span 要素 | ボタンテキスト（アイコン併用時） | 条件付き必須 |
| is-outlined | imds-button | 枠線のみの明るい表示スタイル | オプション |
| is-ghost | imds-button | 枠線なしの透明スタイル | オプション |
| is-primary | imds-button | 主要アクション用のプライマリカラー | オプション |
| is-danger | imds-button | 削除・警告などの危険アクション用 | オプション |
| is-dark | imds-button | ダークカラー | オプション |
| is-x-small | imds-button | 極小サイズ | オプション |
| is-small | imds-button | 小サイズ | オプション |
| is-normal | imds-button | 標準サイズ | オプション |
| is-medium | imds-button | 中サイズ | オプション |
| is-large | imds-button | 大サイズ | オプション |

## HTML スニペット

### 基本ボタン

```html
<button
  type="button"
  class="imds-button">
  Button
</button>
```

以降は基本ボタンからの差分のみを示す。すべて `button.imds-button` にクラスまたは属性を付与する。

## バリエーション

### borderStyle（枠線）

```html
<button type="button" class="imds-button is-outlined">Button</button>  <!-- 枠線のみ -->
<button type="button" class="imds-button is-ghost">Button</button>     <!-- 枠線なし -->
```

### color（色）

`is-outlined` や `is-ghost` と組み合わせ可能。

```html
<button type="button" class="imds-button is-primary">Button</button>  <!-- プライマリ -->
<button type="button" class="imds-button is-danger">Button</button>   <!-- 危険 -->
<button type="button" class="imds-button is-dark">Button</button>     <!-- ダーク -->
```

### size（サイズ）

```html
<button type="button" class="imds-button is-x-small">Button</button>  <!-- 極小 -->
<button type="button" class="imds-button is-small">Button</button>    <!-- 小 -->
<button type="button" class="imds-button is-normal">Button</button>   <!-- 標準 -->
<button type="button" class="imds-button is-medium">Button</button>   <!-- 中 -->
<button type="button" class="imds-button is-large">Button</button>    <!-- 大 -->
```

### disabled（無効化状態）

`button` 要素に `disabled` 属性を付与する。クリック不可、視覚的にグレーアウトされる。

```html
<button type="button" class="imds-button" disabled>Button</button>
```

## 組み合わせ例

### Icon との組み合わせ

アイコン付きボタンの詳細は [icon-button.md](icon-button.md) を参照すること。
アイコンとテキストを併用する場合、テキストは必ず `imds-button-text` で囲む。

```html
<button type="button" class="imds-button is-primary">
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  <span class="imds-button-text">検索</span>
</button>
```

## 実装上の注意

- アイコンとテキストを併用する場合、テキストは必ず `<span class="imds-button-text">` で囲む。直接テキストノードを配置してはならない。詳細は [icon-button.md](icon-button.md) を参照
- `is-outlined` と `is-ghost` は排他的に使用する（同時に付与しない）
- カラークラスとスタイルクラスは組み合わせ可能（例: `is-outlined is-primary`, `is-ghost is-danger`）
