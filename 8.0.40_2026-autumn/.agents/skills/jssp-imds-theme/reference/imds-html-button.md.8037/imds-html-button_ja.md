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
| is-applied | imds-button | 適用中バッジを表示（アイコンが存在する場合のみ利用可） | オプション |

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

### applied（適用中バッジ）

詳細検索エリアなど、ボタンクリックで表示・非表示が切り替わるエリア内で検索条件などが適用されていることを示すバッジ。アイコンが存在する場合のみ利用できる。

```html
<button type="button" class="imds-button is-applied" title="">
  <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
  <span class="imds-button-text">Button</span>
</button>
```

## 組み合わせ例

### Icon との組み合わせ

アイコン付きボタンの詳細は [imds-html-icon-button.md](imds-html-icon-button.md) を参照すること。
アイコンとテキストを併用する場合、テキストは必ず `imds-button-text` で囲む。

```html
<button type="button" class="imds-button is-primary">
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  <span class="imds-button-text">検索</span>
</button>
```

### 最小幅（min-width）

「登録/更新」のようにボタン内のラベルが短い場合は、ボタンの押しやすさと視認性を高めるために、インライン `style="min-width: 8em;"` で最小幅を指定する（`min-width-8em` 等のカスタムクラスは定義しない。`.agents/requirements/jssp-presentation-page/AGENTS.md`「アンチパターン: カスタム `.max-width-NNem` / `.min-width-NNem` クラスを定義しない」参照）。

```html
<button type="button" class="imds-button is-primary" style="min-width: 8em;">登録</button>
```

### ページ全体に対する操作（固定フッタ）

ページ下部の「登録」「更新」「削除」等、ページ全体に対する操作ボタンは、スクロール領域の外の固定フッタ（`pgstyle-layout-footer`。CSS 定義は `assets/imds-form-page.md`「実装上の注意」参照）にまとめる。`pgstyle-layout-footer` はボタン間に 2em の間隔を空ける。補助的な操作（「コピー新規」等）は `style="margin-left: 3em;"` で主要ボタン群との間隔を広げ、複雑性を下げる。

```html
<div class="pgstyle-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button type="button" class="imds-button is-primary" style="min-width: 8em;">更新</button>
  <button type="button" class="imds-button is-outlined is-danger" style="min-width: 8em;">削除</button>
  <button type="button" class="imds-button is-outlined is-primary" style="min-width: 8em; margin-left: 3em;">コピー新規</button>
</div>
```

### ツールバー

ツールバーでボタンを並べる場合は、ボタン間を 1em 空ける（例: 親要素に `style="display: flex; gap: 1em;"`）。検索欄と新規作成ボタンを並べる一覧画面の操作エリアは、`assets/imds-list-page.md` の `pgstyle-toolbar` を使う。

```html
<div style="display: flex; gap: 1em;">
  <button type="button" class="imds-button is-primary" style="min-width: 8em;">新規作成</button>
  <button type="button" class="imds-button is-outlined" style="min-width: 8em;">エクスポート</button>
</div>
```

## 実装上の注意

- アイコンとテキストを併用する場合、テキストは必ず `<span class="imds-button-text">` で囲む。直接テキストノードを配置してはならない。詳細は [imds-html-icon-button.md](imds-html-icon-button.md) を参照
- `is-outlined` と `is-ghost` は排他的に使用する（同時に付与しない）
- カラークラスとスタイルクラスは組み合わせ可能（例: `is-outlined is-primary`, `is-ghost is-danger`）
- **1画面1つの主要色ボタン原則**: 色付きの標準ボタン（`is-primary` / `is-danger` の無地ボタン）は、画面やダイアログ内で最も重要な一つのボタンにのみ適用する。同じ画面・ダイアログ内に色付き標準ボタンを複数配置してはならない（ポータルのように複数の独立したコンテンツエリアが存在する場合は、各エリア内に一つずつ配置可）。「一時保存」等の補助的な操作には `is-outlined is-primary`（枠線付き）を使用し、無地の `is-primary` と併存させないこと
  - ✅ OK例: `is-primary`（登録） + `is-outlined is-primary`（一時保存）
  - ❌ NG例: `is-primary`（登録） + `is-primary`（一時保存）— 主要ボタンが2つになる
- ボタンを並べて配置する場合はサイズを揃える（`is-large` 等を他と混在させない）
