# Accordion

## 基本情報

Accordion は、常に表示する必要のないエリアを閉じておく際に使用する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-accordion-accordion--documentation
- 基本クラス: imds-accordion

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-accordion | コンテナ div | アコーディオンコンテナ | 必須 |
| imds-accordion-title | label 要素 | タイトル部分 | 必須 |
| imds-accordion-title-inner | span 要素 | タイトルテキストとキャプションのラッパー | 必須 |
| imds-accordion-caption | span 要素 | タイトル下の補足テキスト | オプション |
| imds-accordion-chevron | span 要素 | 開閉用シェブロンアイコン | 必須 |
| imds-accordion-content | div 要素 | コンテンツパネル | 必須 |
| imds-icon | span 要素 | アイコン共通クラス（シェブロンに使用） | 必須 |
| is-small | imds-icon | アイコンの小サイズ指定 | オプション |
| is-outlined | imds-accordion | 上下左右の全方向に枠線 | オプション |
| is-borderless | imds-accordion | 枠線を表示しない | オプション |
| is-left | imds-accordion | シェブロンアイコンを左配置 | オプション |
| is-right | imds-accordion | シェブロンアイコンを右配置 | オプション |
| is-primary | imds-icon | シェブロンアイコンをプライマリカラーに変更 | オプション |
| is-x-small | imds-accordion | 極小サイズ | オプション |
| is-small | imds-accordion | 小サイズ | オプション |
| is-normal | imds-accordion | 標準サイズ | オプション |
| is-medium | imds-accordion | 中サイズ | オプション |
| is-large | imds-accordion | 大サイズ | オプション |
| is-gray | imds-accordion-title | タイトル背景色をグレーに変更 | オプション |
| is-light | imds-accordion-title | 薄いグレー（is-gray と併用） | オプション |
| has-text-weight-bold | imds-accordion-title | タイトルを太字にする | オプション |
| has-text-weight-normal | imds-accordion-title | タイトルを標準の太さにする | オプション |
| imds-tag | span 要素 | タグ要素（imds-accordion-title 内に配置） | オプション |

## HTML スニペット

### 基本アコーディオン

```html
<div class="imds-accordion">
  <input
    type="checkbox"
    id="todo-replace-:r1:" />
  <label
    for="todo-replace-:r1:"
    class="imds-accordion-title">
    <span class="imds-accordion-title-inner">
      <span>Accordion Title</span>
      <span class="imds-accordion-caption">Caption (Sub Title)</span>
    </span>
    <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  </label>
  <div class="imds-accordion-content"><div class="imds-px-4 imds-py-3">Content</div></div>
</div>
```

以降のスニペットはすべて基本アコーディオンからの差分のみを示す。

## バリエーション

### accordionStyle（枠線）

`div.imds-accordion` にクラスを付与する。デフォルトは上下方向のみのシンプルな枠線。

```html
<!-- 全方向に枠線 -->
<div class="imds-accordion is-outlined">

<!-- 枠線なし -->
<div class="imds-accordion is-borderless">
```

### titleBackgroundColor（タイトル背景色）

`label.imds-accordion-title` にクラスを付与する。

```html
<!-- グレー背景 -->
<label class="imds-accordion-title is-gray">

<!-- 薄いグレー背景 -->
<label class="imds-accordion-title is-gray is-light">
```

### titleFontWeight（タイトル文字の太さ）

`label.imds-accordion-title` にクラスを付与する。

```html
<!-- 太字 -->
<label class="imds-accordion-title has-text-weight-bold">

<!-- 標準の太さ -->
<label class="imds-accordion-title has-text-weight-normal">
```

### isOpen（初期表示で開いた状態）

`input[type="checkbox"]` に `checked` 属性を付与する。

```html
<input type="checkbox" id="todo-replace-:r1:" checked />
```

### disabled（無効化状態）

`input[type="checkbox"]` に `disabled` 属性を付与する。

```html
<input type="checkbox" id="todo-replace-:r1:" disabled />
```

### chevronIconPosition（シェブロンアイコンの配置）

`div.imds-accordion` にクラスを付与する。デフォルトは右配置。

```html
<!-- シェブロンを左配置 -->
<div class="imds-accordion is-left">
```

### chevronIconColor（シェブロンアイコンの色）

`span.imds-icon` に `is-primary` を付与する。

```html
<span class="imds-icon is-small is-primary imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
```

### size（サイズ）

`div.imds-accordion` にサイズクラスを付与する。

```html
<div class="imds-accordion is-x-small">  <!-- 極小 -->
<div class="imds-accordion is-small">    <!-- 小 -->
<div class="imds-accordion is-normal">   <!-- 標準 -->
<div class="imds-accordion is-medium">   <!-- 中 -->
<div class="imds-accordion is-large">    <!-- 大 -->
```

### titleOnly（タイトルのみ）

キャプションを省略し、`imds-accordion-title-inner` の中にテキストを直接配置する。

```html
<span class="imds-accordion-title-inner">Accordion Title</span>
```

## 組み合わせ例

### Tag との組み合わせ

`label.imds-accordion-title` 内のシェブロンアイコンの後に `imds-tag` 要素を配置する。

```html
<label
  for="todo-replace-:r1:"
  class="imds-accordion-title">
  <span class="imds-accordion-title-inner">
    <span>Accordion Title</span>
    <span class="imds-accordion-caption">caption</span>
  </span>
  <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  <span class="imds-tag is-yellow is-small"><span>warning</span></span>
</label>
```

### Icon との組み合わせ

タイトルの先頭（`imds-accordion-title-inner` の前）に `imds-icon` 要素を配置する。

```html
<label
  for="todo-replace-:r1:"
  class="imds-accordion-title">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span class="imds-accordion-title-inner">
    <span>Accordion Title</span>
    <span class="imds-accordion-caption">caption</span>
  </span>
  <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
</label>
```

利用可能なアイコン例:
- `fa-solid fa-circle-check` - 完了・成功
- `fa-solid fa-triangle-exclamation` - 警告
- `fa-solid fa-circle-info` - 情報・補足

### `is-outlined` + `imui-table`（詳細情報の表示・移行注記付き）

詳細情報を非表示にしておき、必要な場合のみ参照できるようにする用途。`div.imds-accordion` に `is-outlined` を付与し、`imds-accordion-content` 内に `table.imui-table`（旧テーマの imui コンポーネント）を配置する構成。

> **移行に関する注記**: 将来的に `imui-table` は `imds-table` を使用する方法へ移行予定。現時点では `imds-table` 側で本パターン（`th`/`td` を用いた項目名・値の表形式表示、`rowspan`/`colspan` の混在）に完全対応できていないため、暫定的に `imui-table` との組み合わせをサンプルとして提供している。`imds-table` への移行後もこの `imds-accordion is-outlined` の構造自体はそのまま利用できる。

```html
<div class="imds-accordion is-outlined">
  <input type="checkbox" id="todo-replace-:r6:" />
  <label for="todo-replace-:r6:" class="imds-accordion-title">
    <span class="imds-accordion-title-inner">
      <span>ワークフロー名</span>
      <span class="imds-accordion-caption">workflow-id</span>
    </span>
    <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  </label>
  <div class="imds-accordion-content">
    <div class="imds-px-4 imds-pt-3 imds-pb-1">
      <table class="imui-table">
        <tbody>
          <tr>
            <th colspan="2"><label>アプリケーション名</label></th>
            <td>AccelStudioアプリケーション名</td>
          </tr>
          <tr>
            <th rowspan="2" class="wd-15"><label>ワークフロー情報</label></th>
            <th class="wd-15"><label>定義名</label></th>
            <td>ワークフロー名 （ ID: workflow-id ）</td>
          </tr>
          <tr>
            <th><label>備考</label></th>
            <td>
              <p>
                「ワークフロー名」のフロー定義です。
                <br />
                このフロー定義はサンプルです。
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
```

## アクセシビリティ対応

- `input[type="checkbox"]` と `label` の `id` / `for` 属性を一致させ、クリックで開閉できるようにする
- 同一ページ内で `id` が重複しないようにする（複数アコーディオンを配置する場合は一意の `id` を付与する）
- `disabled` 属性を付与した場合、スクリーンリーダーでも操作不可であることが伝わる
- コンテンツ領域（`imds-accordion-content`）内のテキストや要素は、アコーディオンが閉じた状態でも DOM 上に存在するため、スクリーンリーダーが読み上げる可能性がある点に留意する

## 実装上の注意

- `id` 属性は必ず一意の値に置き換えること（`todo-replace-:r1:` はプレースホルダー）
- checkbox ベースの開閉のため JavaScript は不要だが、プログラムから開閉状態を制御する場合は `checked` 属性を操作する
- `imds-accordion-content` 内のパディングは `imds-px-4 imds-py-3` で調整している。コンテンツに応じて変更可能
- 複数のアコーディオンをグループ化する場合は [accordion-group](accordion-group.md) を使用する
