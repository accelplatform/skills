---
paths:
  - "src/main/jssp/**/*.html"
---

# Pagination

## 基本情報

Pagination は、一覧データをページ単位で表示するためのナビゲーションとして使用する部品です。
大量のコンテンツを表示する際に、スクロールせずにコンテンツを探せるので、ユーザが情報を見つけやすくなります。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-pagination-pagination--documentation
- 基本クラス: imds-pagination

## 全体構造

```
nav.imds-pagination                       # ページネーション全体（サイズクラスを付与）
├── imds-pagination-controls              # 操作領域（前後ボタン + ページ番号）
│   ├── button (前へ / 最初へ)            # imds-button is-ghost + 矢印アイコン
│   ├── imds-pagination-page-number       # ページ番号ボタン群
│   │   ├── button.is-primary             # 現在ページ（is-primary）
│   │   ├── button.is-ghost               # その他ページ（is-ghost）
│   │   ├── imds-pagination-page-ellipsis # 省略記号「…」（オプション）
│   │   └── ...                           # compact モード時は select で代替
│   └── button (次へ / 最後へ)
└── imds-pagination-options               # オプション領域（オプション）
    ├── imds-pagination-records-per-page  # 表示件数セレクト（label + select.imds-select）
    └── span                              # 件数表示（例: 「501 - 600 / 2000」）
```

最初/最後のページでは前後ボタンに `disabled` を付与する。ページ切替・件数変更は JavaScript で制御する。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-pagination | nav 要素 | ページネーションコンテナ | 必須 |
| imds-pagination-controls | div 要素 | ページ操作領域（前後ボタン + ページ番号） | 必須 |
| imds-pagination-page-number | div 要素 | ページ番号ボタン群 | 必須 |
| imds-pagination-page-ellipsis | div 要素 | 省略記号（…） | オプション |
| imds-pagination-options | div 要素 | オプション領域（表示件数 + 件数表示） | オプション |
| imds-pagination-records-per-page | div 要素 | 表示件数セレクト領域 | オプション |
| is-x-small | imds-pagination | 極小サイズ | オプション |
| is-small | imds-pagination | 小サイズ | オプション |
| is-normal | imds-pagination | 標準サイズ | オプション |
| is-medium | imds-pagination | 中サイズ | オプション |
| is-large | imds-pagination | 大サイズ | オプション |

## HTML スニペット

### 基本ページネーション

```html
<nav class="imds-pagination">
  <div class="imds-pagination-controls">
    <button type="button" class="imds-button is-ghost" title="前へ">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
    </button>
    <div class="imds-pagination-page-number">
      <button type="button" class="imds-button is-ghost">1</button>
      <button type="button" class="imds-button is-ghost">2</button>
      <button type="button" class="imds-button is-primary">3</button>
      <button type="button" class="imds-button is-ghost">4</button>
      <button type="button" class="imds-button is-ghost">5</button>
      <div class="imds-pagination-page-ellipsis"><span>…</span></div>
      <button type="button" class="imds-button is-ghost">20</button>
    </div>
    <button type="button" class="imds-button is-ghost" title="次へ">
      <span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>
    </button>
  </div>
  <div class="imds-pagination-options">
    <div class="imds-pagination-records-per-page">
      <label for="todo-replace-:r1:">表示件数</label>
      <select id="todo-replace-:r1:" class="imds-select">
        <option value="100">100</option>
        <option value="200">200</option>
        <option value="300">300</option>
      </select>
    </div>
    <span>501 - 600 / 2000</span>
  </div>
</nav>
```

以降は基本ページネーションからの差分のみを示す。

## バリエーション

### size（サイズ）

`nav.imds-pagination` にサイズクラスを付与する。

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
<div class="imds-pagination-options">
  <span>501 - 600 / 2000</span>
</div>
```

### compact（コンパクト）

ページ番号ボタンの代わりにセレクトボックスで現在ページを選択する。
最初/最後へのボタンも追加される。

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
      <label for="todo-replace-:r1:">表示件数</label>
      <select id="todo-replace-:r1:" class="imds-select">
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

## 実装上の注意

- 現在のページは `is-primary`、それ以外は `is-ghost` をボタンに付与する
- ページ数が多い場合は `imds-pagination-page-ellipsis`（…）を使用して省略する
- 前後ボタンには `title` 属性を付与してアクセシビリティを確保する
- 最初/最後のページでは前後ボタンに `disabled` 属性を付与する
- `select` の `id` と `label` の `for` は一意の値に置き換えること（`todo-replace-:r1:` はプレースホルダー）
- ページ切替・表示件数変更は JavaScript で制御する必要がある
