# PaginationCompact

## 基本情報

PaginationCompact は、Pagination のページ番号部分を短くしたパターンの部品です。
ページ番号ボタンを並べる代わりにセレクトボックスで現在ページを選択する点が Pagination（imds-html-pagination.md）との違い。基本的には Pagination を使用し、画面幅が狭い場合にのみ PaginationCompact へ切り替える。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-pagination-paginationcompact--documentation
- 基本クラス: imds-pagination（Pagination と共通。コンパクト構造は内部の `imds-pagination-page-number` の中身で表現する）

## Pagination との使い分け基準（切替タイミング）

- **基本方針**: 基本的には Pagination を使用する。PaginationCompact は Pagination の代替（コンパクト表示）であり、狭いエリア用の縮小版という位置付け。
- **切替基準（Pagination.md 記載の注意事項に基づく）**: 画面サイズがタブレット幅（769px 〜 1023px 未満）の場合、Pagination ではなく PaginationCompact を使用する。画面サイズの区切り基準は Breakpoint のページを参照すること。
- デスクトップ幅（1024px 以上）では Pagination、タブレット幅（769px〜1023px）では PaginationCompact に切り替える、という運用が実DOMドキュメントの前提。モバイル幅（768px 以下）の扱いは各画面のレイアウト仕様に従う。
- レスポンシブな切替は CSS のみでは行われないため、ブレイクポイントに応じて描画する HTML 構造（Pagination か PaginationCompact か）自体を JavaScript 側で切り替える必要がある。

## 全体構造

```
nav.imds-pagination                       # ページネーション全体（サイズクラスを付与）
├── imds-pagination-controls              # 操作領域
│   ├── button (最初へ)                   # imds-button is-ghost + fa-angles-left
│   ├── button (前へ)                     # imds-button is-ghost + fa-angle-left
│   ├── imds-pagination-page-number       # ページ番号の代わりに select + "/" + 総ページ数
│   │   ├── select.imds-select            # 現在ページを選択
│   │   ├── span "/"
│   │   └── span (総ページ数)
│   ├── button (次へ)                     # imds-button is-ghost + fa-angle-right
│   └── button (最後へ)                   # imds-button is-ghost + fa-angles-right
└── imds-pagination-options               # オプション領域（オプション）
    ├── imds-pagination-records-per-page  # 表示件数セレクト（label + select.imds-select）
    └── span                              # 件数表示（例: 「76 - 90 / 260」）
```

Pagination の「最初/最後へ」ボタンは compact では常に表示される（Pagination 基本形には無く、Pagination の compact バリエーションと共通の構造）。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-pagination | nav 要素 | ページネーションコンテナ | 必須 |
| imds-pagination-controls | div 要素 | ページ操作領域（前後・最初/最後ボタン + ページ選択） | 必須 |
| imds-pagination-page-number | div 要素 | 現在ページ選択（select）+ 総ページ数表示 | 必須 |
| imds-pagination-options | div 要素 | オプション領域（表示件数 + 件数表示） | オプション |
| imds-pagination-records-per-page | div 要素 | 表示件数セレクト領域 | オプション |
| is-x-small | imds-pagination | 極小サイズ | オプション |
| is-small | imds-pagination | 小サイズ | オプション |
| is-normal | imds-pagination | 標準サイズ（デフォルト） | オプション |
| is-medium | imds-pagination | 中サイズ | オプション |
| is-large | imds-pagination | 大サイズ | オプション |

## HTML スニペット

### 基本形

```html
<nav class="imds-pagination">
  <div class="imds-pagination-controls">
    <button type="button" class="imds-button is-ghost" title="最初へ">
      <span class="imds-icon"><i class="fa-solid fa-angles-left"></i></span>
    </button>
    <button type="button" class="imds-button is-ghost" title="前へ">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
    </button>
    <div class="imds-pagination-page-number">
      <select class="imds-select">
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <!-- ページ数分の option を生成 -->
      </select>
      <span>/</span>
      <span>18</span>
    </div>
    <button type="button" class="imds-button is-ghost" title="次へ">
      <span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>
    </button>
    <button type="button" class="imds-button is-ghost" title="最後へ">
      <span class="imds-icon"><i class="fa-solid fa-angles-right"></i></span>
    </button>
  </div>
  <div class="imds-pagination-options">
    <div class="imds-pagination-records-per-page">
      <label for="todo-replace-:r0:">表示件数</label>
      <select id="todo-replace-:r0:" class="imds-select">
        <option>15</option>
        <option>30</option>
        <option>50</option>
        <option>100</option>
      </select>
    </div>
    <span>76 - 90 / 260</span>
  </div>
</nav>
```

以降は基本形からの差分のみを示す。

## バリエーション

### size（サイズ）

`nav.imds-pagination` にサイズクラスを付与する。通常は `is-normal`（デフォルト）を使用する。

```html
<nav class="imds-pagination is-x-small">  <!-- 極小 -->
<nav class="imds-pagination is-small">    <!-- 小 -->
<nav class="imds-pagination is-normal">   <!-- 標準 -->
<nav class="imds-pagination is-medium">   <!-- 中 -->
<nav class="imds-pagination is-large">    <!-- 大 -->
```

### hideRecordsPerPage（表示件数セレクト非表示）

`imds-pagination-records-per-page` を省略する。

```html
<div class="imds-pagination-options"><span>76 - 90 / 260</span></div>
```

## 実装上の注意

- 現在ページの選択は `select.imds-select` で行う（Pagination のようなページ番号ボタン群は使用しない）。
- 「最初へ」「最後へ」ボタンは PaginationCompact では常に構造に含める（`fa-angles-left` / `fa-angles-right`）。
- 前後・最初/最後ボタンには `title` 属性を付与してアクセシビリティを確保する。
- 最初/最後のページでは前後ボタンに `disabled` 属性を付与する（Pagination と同様）。
- `select` の `id` と `label` の `for` は一意の値に置き換えること（`todo-replace-:r0:` はプレースホルダー）。
- ページ切替・表示件数変更は JavaScript で制御する必要がある。
- **Pagination との切替基準**: 画面幅がタブレット幅（769px〜1023px 未満）になったら PaginationCompact に切り替える。基本は Pagination を使用し、PaginationCompact は狭い画面幅向けの代替として使う（詳細は本ファイル冒頭「Pagination との使い分け基準」を参照）。
