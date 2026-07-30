# 一覧画面の実装例

imds テーマのコンポーネントを組み合わせた、業務一覧画面の実装例。
「在庫管理」画面を題材に、ヘッダ・検索欄・テーブル・ページネーションの構成パターンを示す。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | アイコン付きページヘッダ |
| InputGroup | [input-group.md](../reference/input-group.md) | 検索キーワード入力欄 |
| Textbox | [textbox.md](../reference/textbox.md) | 検索テキスト入力 |
| Button | [button.md](../reference/button.md) | 検索ボタン・新規作成ボタン |
| Table | [table.md](../reference/table.md) | データ一覧テーブル |
| Pagination | [pagination.md](../reference/pagination.md) | ページ切替ナビゲーション |
| IconFont | [icon-font.md](../reference/icon-font.md) | 検索アイコン |

## 全体構成

```
imds-container
├── header.imds-header              ... ページヘッダ（アイコン・タイトル）
└── main
    └── section.imds-section
        ├── div.button-area         ... 操作エリア（検索欄 + 新規作成ボタン）
        │   ├── imds-input-group    ... 検索キーワード入力グループ
        │   └── button              ... 新規作成ボタン
        ├── div.imds-table          ... データ一覧テーブル
        └── div#pagination          ... ページネーション
```

## 1. ページヘッダ

アイコン + タイトル（サブタイトル付き）の基本構成。
サブタイトルとタイトルは `<imart>` タグでサーバサイドから動的に出力している。

```html
<header class="imds-header">
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**ポイント:**
- `<imart type="string">` でファンクションコンテナから渡された値を出力する
- `escapeXml="true"` で XSS 対策を行う

## 2. 操作エリア（検索欄 + 新規作成ボタン）

**「新規作成」「追加」等のデータ操作ボタンは、ヘッダ（`imds-header-actions`）ではなく一覧テーブルの直上に置く**（UI チームのデザインルール）。ヘッダに置いてよいのは「設定」「エクスポート」などのページレベルのメタ操作のみ。

### 2-A. 検索欄あり

`imds-input-group` による検索欄と、`imds-button is-primary` の新規作成ボタンを横並びに配置する。
`button-area` は独自クラスで、検索欄とボタンの横並びレイアウトを制御する。

```html
<div class="button-area imds-mb-3">
  <div class="imds-input-group">
    <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード">
    <button type="button" title="検索" class="imds-button">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </button>
  </div>
  <button type="button" id="create-button" class="imds-button is-primary">新規作成</button>
</div>
```

**ポイント:**
- `imds-input-group` 内に `imds-textbox`（`type="search"`）と検索アイコンボタンを結合配置
- 検索ボタンには `title="検索"` でアクセシビリティを確保
- `imds-mb-3` でテーブルとの間にマージンを設ける

### 2-B. 検索欄なし（新規作成ボタンのみ）

新規作成ボタンだけを置く場合は、テーブル直上に **右寄せ** で配置する。

```html
<div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
  <button type="button" id="create-button" class="imds-button is-primary">
    <span class="imds-icon"><i class="fa-solid fa-plus"></i></span>
    <span class="imds-button-text">新規作成</span>
  </button>
</div>
```

## 3. データ一覧テーブル

`imds-table` > `imds-table-inner` > `table` の3層構造で一覧テーブルを構成する。
`thead` で列ヘッダを定義し、`tbody` は JavaScript で動的に行を生成する。

```html
<div class="imds-table" id="stock-table">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th class="col-edit has-text-centered"><span>編集</span></th>
          <th><span>商品コード</span></th>
          <th><span>商品名</span></th>
          <th><span>単価</span></th>
          <th><span>在庫数</span></th>
          <th><span>倉庫番号</span></th>
          <th><span>備考</span></th>
        </tr>
      </thead>
      <tbody id="stock-table-body"></tbody>
    </table>
  </div>
</div>
```

**ポイント:**
- `tbody` は空で定義し、`id="stock-table-body"` を指定して JavaScript から行を動的に挿入する
- 「編集」列には独自クラス `col-edit` を付与し、列幅を CSS で制御する
- 必要に応じて `imds-table` に `is-hoverable`、`is-stripe`、`is-sticky` 等を追加できる

## 4. ページネーション

テーブル下部にページ切替ナビゲーションを配置する領域。
`id="pagination"` を指定し、JavaScript で `imds-pagination` を動的に生成する。

```html
<div class="imds-py-3" id="pagination"></div>
```

**ポイント:**
- `imds-py-3` でテーブルとの間に上下パディングを設ける
- ページネーションの HTML は JavaScript で動的に生成する（検索結果の件数に応じてページ数が変動するため）

## 全体コード

```html
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
        <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
      </div>
    </header>
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">
          <div class="button-area imds-mb-3">
            <div class="imds-input-group">
              <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード">
              <button type="button" title="検索" class="imds-button">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </button>
            </div>
            <button type="button" id="create-button" class="imds-button is-primary">新規作成</button>
          </div>
          <div class="imds-table" id="stock-table">
            <div class="imds-table-inner">
              <table>
                <thead>
                  <tr>
                    <th class="col-edit has-text-centered"><span>編集</span></th>
                    <th><span>商品コード</span></th>
                    <th><span>商品名</span></th>
                    <th><span>単価</span></th>
                    <th><span>在庫数</span></th>
                    <th><span>倉庫番号</span></th>
                    <th><span>備考</span></th>
                  </tr>
                </thead>
                <tbody id="stock-table-body"></tbody>
              </table>
            </div>
          </div>
          <div class="imds-py-3" id="pagination"></div>
        </section>
      </div>
    </main>
  </div>
</div>
```

## 実装上の注意

- `button-area` は imds テーマの標準クラスではなく、検索欄と新規作成ボタンの横並びレイアウト用の独自クラスである
- `col-edit` も独自クラスであり、編集列の幅調整に使用する
- `:searchKeywords:` はプレースホルダーであり、実装時に一意の ID に置き換えること
- テーブルの行データとページネーションは JavaScript で動的に生成・制御する
- 単価・在庫数など数値列は `td` に `has-text-right` を付与して右寄せにすることを推奨
