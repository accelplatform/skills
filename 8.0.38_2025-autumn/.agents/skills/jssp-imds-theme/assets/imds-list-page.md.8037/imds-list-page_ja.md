# 一覧画面の実装例

imds テーマのコンポーネントを組み合わせた、業務一覧画面の実装例。
「在庫管理」画面を題材に、ヘッダ・検索欄・テーブル・ページネーションの構成パターンを示す。

本ページのヘッダ固定・スクロール領域は、固定クラス名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` を用いたレイアウト制御パターンを使用する（`height: 100%` ベースのため `<imart type="head">` での `theme-conditional-layout.css` の読み込みが必須。詳細は「実装上の注意」を参照）。機能ごとに異なるプレースホルダー prefix を使う旧方式の解説は [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md) を参照。検索欄の実装は [imds-common-search-layout.md](../reference/imds-common-search-layout.md) のサーバサイド検索パターン（`<form>` + `type="submit"` + `preventDefault()`）に準拠する。

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

`imds-container` に `pgstyle-layout-container`（2 行グリッド）、`<main>` に `pgstyle-layout-main`（縦 flex）、スクロールさせるコンテンツ領域に `pgstyle-layout-content`（`flex:1 0 0; overflow:auto`）を付与する。中間の `<section>` ラッパーは置かず、`<main>` 直下の div 1 枚にテーブル関連要素をまとめる。

```
div.imds-container.pgstyle-layout-container    ... ルート div（intra-mart テーマの imui-container の内側に配置されるため id は付与しない、中間ラッパーも挟まない）
├── header.imds-header                        ... ページヘッダ（アイコン・タイトル。固定表示）
└── main.pgstyle-layout-main（縦 flex コンテナ）
    └── div.pgstyle-table-wrapper.pgstyle-layout-content（imds-scrollbar 付与。flex:1 0 0; overflow:auto）
        ├── form                    ... 検索フォーム（サーバサイド検索。type="submit" + preventDefault()）
        │   └── div.pgstyle-toolbar ... 操作エリア（検索欄 + 新規作成ボタン）
        │       ├── imds-input-group ... 検索キーワード入力グループ
        │       └── button           ... 新規作成ボタン
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
`pgstyle-toolbar` は独自クラスで、検索欄とボタンの横並びレイアウトを制御する。

**この一覧画面の検索はサーバサイド検索**（キーワードでサーバに再検索を依頼する方式）である。[imds-common-search-layout.md](../reference/imds-common-search-layout.md) の正規パターンに従い、検索欄を `<form>` で囲み、Enter の暗黙 submit と検索ボタン（`type="submit"`）の経路を 1 本化する（`type="button"` のクリックハンドラで検索を実行する実装は誤用）。

```html
<form id="search-form" class="imds-form">
  <div class="pgstyle-toolbar imds-mb-2">
    <div class="imds-input-group">
      <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード" aria-label="検索キーワード">
      <button type="submit" title="検索" class="imds-button is-outlined">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
    <button type="button" id="create-button" class="imds-button is-primary">新規作成</button>
  </div>
</form>
```

```javascript
document.getElementById('search-form').addEventListener('submit', function (event) {
  event.preventDefault();   // 必須。抑止漏れは画面リロード事故になる
  searchStockList();
});
```

**ポイント:**
- `imds-input-group` 内に `imds-textbox`（`type="search"`）と検索アイコンボタンを結合配置
- 検索欄・検索ボタンは `<form>` で囲み、検索ボタンは `type="submit"` にする（Enter キーでも同じ経路で検索が実行される）
- `submit` イベントハンドラで必ず `event.preventDefault()` を呼び、画面リロードを防ぐ
- 「新規作成」ボタンは検索とは無関係の操作のため `type="button"` のままとし、`<form>` の submit に巻き込まれないようにする
- 検索ボタンには `title="検索"` でアクセシビリティを確保
- `imds-mb-2` でテーブルとの間にマージンを設ける

**検索ボタンの色は `is-primary` にしない（重要）:**
検索ボタンには **無色（プレーンな `imds-button`）または `is-outlined` を使い、`is-primary` は付与しない**。
理由は以下の 2 点。
- DESIGN.md の「主要アクション（primary）は 1 画面に 1 つ」の原則があり、この一覧画面では「新規作成」ボタンが primary の役割を担っている。検索ボタンも `is-primary` にすると 1 画面に primary が 2 つ並び、原則に反する。
- 検索は「新規作成」より操作頻度・重要度が低い補助アクションであるため、視覚的な優先度を下げるべきである。

**検索入力の `aria-label` は必須（重要）:**
検索テキストボックスは `placeholder` はあっても可視の `<label>` を持たないため、スクリーンリーダー利用者が入力欄の用途を判別できない。
**可視ラベルの無い検索入力には必ず `aria-label`（例: `aria-label="検索キーワード"` や `aria-label="検索"`）を付与すること。** `placeholder` は `aria-label` の代替にならない（フォーカス時に消える・支援技術での扱いが不安定なため）。

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
<div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
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
- `is-area-bordered is-sticky is-narrow is-hoverable` と `style="height: 100%"` を付与し、`pgstyle-layout-content` のスクロール領域いっぱいにテーブルを表示する（`is-sticky` によりヘッダ固定・縦スクロールにも対応する）
- 列に `has-text-right` で右寄せする数値列がある場合は、`imds-table` に `is-bordered` も追加する
- 必要に応じて `imds-table` に `is-stripe` 等を追加できる

## 4. ページネーション

テーブル下部にページ切替ナビゲーションを配置する領域。
`id="pagination"` を指定し、JavaScript で `imds-pagination` を動的に生成する。

```html
<div class="imds-mt-2" id="pagination"></div>
```

**ポイント:**
- `imds-mt-2` でテーブルとの間に上マージンを設ける
- ページネーションの HTML は JavaScript で動的に生成する（検索結果の件数に応じてページ数が変動するため）

## 全体コード

ルート `<div>` には id を付与せず `class="imds-container ..."` のみを付与し、中間ラッパーを作らない。`imds-container` には `pgstyle-layout-container`（2 行グリッド）を、`<main>` には `pgstyle-layout-main`（縦 flex）を、スクロールさせるコンテンツ領域（`imds-scrollbar` 付与）には `pgstyle-table-wrapper pgstyle-layout-content`（`flex: 1 0 0; overflow: auto;`）を適用する。中間の `<section>` ラッパーは置かず、`<main>` 直下の div 1 枚に操作エリア・テーブル・ページネーションをまとめる。

```html
<div class="imds-container pgstyle-layout-container">
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
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <form id="search-form" class="imds-form">
        <div class="pgstyle-toolbar imds-mb-2">
          <div class="imds-input-group">
            <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード" aria-label="検索キーワード">
            <button type="submit" title="検索" class="imds-button is-outlined">
              <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <button type="button" id="create-button" class="imds-button is-primary">新規作成</button>
        </div>
      </form>
      <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
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
      <div class="imds-mt-2" id="pagination"></div>
    </div>
  </main>
</div>
```

## 実装上の注意

- `pgstyle-toolbar` は imds テーマの標準クラスではなく、検索欄と新規作成ボタンの横並びレイアウト用の独自クラスである
- `col-edit` も独自クラスであり、編集列の幅調整に使用する
- `:searchKeywords:` はプレースホルダーであり、実装時に一意の ID に置き換えること
- テーブルの行データとページネーションは JavaScript で動的に生成・制御する
- 単価・在庫数など数値列は `td` に `has-text-right` を付与して右寄せにすることを推奨
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-table-wrapper` / `pgstyle-toolbar` は機能ごとに置き換えないプレースホルダー**ではない**固定クラス名である。生成時もクラス名は変更しないこと
- 本テンプレートは HTML 部分のみのため、`<imart type="head">` の `<style>` に以下のレイアウト制御用スタイルを定義すること（このファイルで実際に使用するクラスのみを掲載する。フッタは無いため `pgstyle-layout-footer` は書かない）

  ```css
  /* レイアウト制御用スタイル */
  .pgstyle-layout-container {
    grid-template-rows: 5rem minmax(0, 1fr);
    grid-template-columns: 100%;
    height: 100%;
    display: grid;
  }
  .pgstyle-layout-container > .imds-header {
    grid-row: 1 / 2;
  }
  .pgstyle-layout-main {
    flex-direction: column;
    grid-row: 2 / 3;
    height: 100%;
    display: flex;
  }
  .pgstyle-layout-content {
    flex: 1 0 0;
    overflow: auto;
  }
  .pgstyle-table-wrapper {
    display: flex;
    flex-direction: column;
  }
  .pgstyle-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    gap: 0.5em 1em;
  }
  ```

- `<imart type="head">` にはさらに `im_design_system/theme/css/theme-conditional-layout.css`（テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS）の読み込みが必須。これが無いと `.imds-container` の高さが確定せず、`pgstyle-layout-content` の `flex: 1 0 0` の伸長先が無くなってコンテンツ領域が高さ 0 に潰れる。

  ```html
  <!-- テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```

## 5. 2 カラムレイアウト（ナビゲーション付き一覧）

一覧画面には「1 カラムレイアウト」（本例のような検索欄 + テーブルのみ）と「2 カラムレイアウト」（左側にナビゲーションを配置）の 2 パターンがある。

- **1 カラム**: ナビゲーションが不要な、分類の無いシンプルな一覧（例: 上記「在庫管理」画面）
- **2 カラム**: 一覧データに階層構造や分類があり、左カラムでカテゴリ・分類を絞り込みたい場合（ツリーまたはリスト形式のナビゲーションを使用）

2 カラムレイアウトを選択する目安は「一覧データの分類・絞り込みをユーザーに提供する必要があるか」で判断する。単純な CRUD 対象マスタで分類が無い場合は 1 カラムのままでよい。

### 全体構成（2 カラム）

ページ全体のヘッダ固定・スクロール（`imds-container` に `pgstyle-layout-container`、`<main>` に `pgstyle-layout-main`、`flex:1 0 0; overflow:auto` のスクロール領域に `pgstyle-layout-content`）は「全体コード」節と同じ。以下の `<div>` は、その `<main>` 内のスクロール領域（`pgstyle-layout-content`）の**中身を丸ごと置き換える**ものであり、下記の `nav` 内の `overflow-y:auto` はさらにその内側の**コンポーネント単位のスクロール**（ナビゲーションのツリー/リストのみ）であって、ページレベルの固定ヘッダーレイアウトとは別の話である。

```
div.imds-container.pgstyle-layout-container（固定ヘッダーレイアウト・id は付与しない。詳細は「実装上の注意」参照）
├── header.imds-header
└── main.pgstyle-layout-main
    └── div.pgstyle-layout-content.imds-scrollbar（flex:1 0 0; overflow:auto。display:flex; 左右分割）
        ├── nav（左カラム／横幅 250px 固定）
        │   ├── div.nav-search             ... カテゴリ検索欄
        │   └── div.nav-scroll-area         ... ツリー or リスト（コンポーネント単位のスクロール。このエリアのみ）
        └── div（右カラム／メインコンテンツ）
            ├── form                        ... 検索フォーム（サーバサイド検索）
            │   └── div.pgstyle-toolbar     ... 検索欄 + 新規作成ボタン
            ├── div.imds-table               ... データ一覧テーブル
            └── div#pagination                ... ページネーション
```

### 実装例

```html
<div class="imds-px-3 imds-py-2 pgstyle-layout-content imds-scrollbar" style="display:flex; gap:1.5em; align-items:flex-start;">
  <!-- 左カラム: ナビゲーション（横幅 250px 固定） -->
  <nav style="width:250px; flex:0 0 250px; display:flex; flex-direction:column;">
    <div class="imds-input-group imds-mb-2">
      <input type="search" class="imds-textbox" placeholder="カテゴリ検索" aria-label="カテゴリ検索">
      <button type="button" title="検索" class="imds-button is-outlined is-small">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
    <!--
      ナビゲーション部分のみスクロールさせる（検索欄・操作ボタンはスクロールさせない）。
      親要素（nav / section / main）に明確な高さが無い場合、flex-basis を 0 にする（flex: 1 0 0）と
      伸長先の余白が無いため高さ 0 に潰れて非表示になる（実装時に実際に発生した不具合）。
      flex-basis は auto にし、内容の自然な高さを基準に max-height でスクロール上限を設けること。
    -->
    <div class="imds-scrollbar" style="overflow-y:auto; flex:0 1 auto; max-height: 480px;">
      <nav class="imds-menu">
        <ul class="imds-menu-list">
          <li><a href="#"><span>すべて</span></a></li>
          <li><a href="#"><span>カテゴリA</span></a></li>
          <li><a href="#"><span>カテゴリB</span></a></li>
        </ul>
      </nav>
    </div>
  </nav>
  <!-- 右カラム: メインコンテンツ -->
  <div style="flex:1 1 auto; min-width:0;">
    <form id="search-form" class="imds-form">
      <div class="pgstyle-toolbar imds-mb-2">
        <div class="imds-input-group">
          <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="検索キーワード" aria-label="検索キーワード">
          <button type="submit" title="検索" class="imds-button is-outlined">
            <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
          </button>
        </div>
        <button type="button" id="create-button" class="imds-button is-primary">新規作成</button>
      </div>
    </form>
    <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
      <div class="imds-table-inner">
        <table>
          <thead>
            <tr>
              <th><span>商品コード</span></th>
              <th><span>商品名</span></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
    <div class="imds-mt-2" id="pagination"></div>
  </div>
</div>
```

**ポイント:**
- ナビゲーションの横幅は **250px 固定**とする
- ナビゲーション（ツリー/リスト部分）だけを `overflow-y:auto`（`imds-scrollbar` 併用）でスクロールさせ、検索欄や操作ボタンは常時表示のまま固定する
- ツリー形式は階層構造を持つ分類に、リスト形式は階層の無い分類に使用する。全件表示用に「すべて」ノードを用意する
- **アンチパターン: スクロールエリアに `flex: 1 0 0`（flex-basis: 0）を使わない**。`nav` / `section` / `main` に明確な高さが設定されていない環境（実装時に実際に発生）では、伸長先の余白が無いため高さ 0 に潰れて表示されなくなる。`flex: 0 1 auto`（flex-basis: auto）にし、内容の自然な高さを基準に `max-height` でスクロール上限を設けること

## 6. `isSticky`（テーブルヘッダ固定）

一覧データが多くテーブルが縦に長くなる場合、テーブルヘッダ（`thead`）を固定し、データ部分（`tbody`）のみを縦スクロールさせることで、スクロールしても列見出しが常に見える状態にする。

```html
<div class="imds-table is-sticky" style="max-height: 480px;">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th class="col-edit has-text-centered"><span>編集</span></th>
          <th><span>商品コード</span></th>
          <th><span>商品名</span></th>
        </tr>
      </thead>
      <tbody id="stock-table-body"></tbody>
    </table>
  </div>
</div>
```

**ポイント（実 DOM 仕様）:**
- `imds-table` に `is-sticky` を付与し、`thead` を固定する。`div.imds-table` に `max-height` を指定して縦スクロール領域を作る
- 実際にスクロールするのはデータ領域（`tbody`）のみだが、CSS 仕様上ヘッダ部分にもスクロールバーが表示される（見た目上の制約であり実害はない）
- 特定の列（行を識別する列・主要リンク列）を横スクロール時も固定したい場合は、固定したい列の `th`/`td` に **`is-sticky`** を付与する（`imds-table` 側は列固定専用のモディファイアは付けず、`th`/`td` 単位で指定する）。列固定は基本的に **左側のみ** とし、行を識別するための項目や主に利用するリンク・ボタン列を対象にする
- 列を固定した場合、固定列の下にもスクロールバーが表示されるが、実際の横スクロール領域は固定列以外の部分になる

## 7. ページネーションの初期値・件数選択

- 一覧が「テーブル」の場合は原則ページネーションを配置する。想定運用期間でデータ量が少なく取得に時間がかからない場合は省略してよい（省略時は検索条件も配置しない）
- 「表示件数選択」は必ず表示する。**デフォルト値は 100 件**、選択肢は 25 または 50 刻みで **5 段階**用意する
  - 例: `100, 125, 150, 175, 200`（初期表示 100）
  - 例: `50, 100, 150, 200, 250`（初期表示 100）
  - カード（1 行複数カード）の場合は 1 行の枚数の倍数で選択肢を用意する（例: 1 行 4 カードなら `40, 80, 120, 160, 200`、初期表示 80）
- 画面幅がタブレット以下（769px〜1023px 未満）になったら、`imds-pagination` の代わりに `imds-html-pagination-compact.md` の PaginationCompact に切り替える

```html
<div class="imds-pagination-options">
  <div class="imds-pagination-records-per-page">
    <label for="records-per-page">表示件数</label>
    <select id="records-per-page" class="imds-select">
      <option value="100" selected>100</option>
      <option value="125">125</option>
      <option value="150">150</option>
      <option value="175">175</option>
      <option value="200">200</option>
    </select>
  </div>
  <span>1 - 100 / 320</span>
</div>
```

## 8. 空状態 UI（データ 0 件）

一覧に表示するデータが存在しない場合は、テーブルやページネーションの代わりに空状態 UI を表示する。実装には `reference/imds-html-empty-state.md` の EmptyState コンポーネントを使用する。

一覧画面で発生しうる空状態は 2 パターンあり、表示内容を区別する。

| パターン | 発生条件 | 表示内容 |
|---|---|---|
| **データ未登録** | 検索条件を指定していない状態で、そもそもデータが 1 件も登録されていない | 「まだデータが登録されていません」等のメッセージ + 「新規作成」ボタン（次に取るべきアクションを提示） |
| **検索結果 0 件** | 検索条件・ナビゲーションの絞り込み条件に一致するデータが無い | 「該当するデータが見つかりませんでした」等のメッセージ（検索条件の見直しを促す。新規作成ボタンは任意） |

**ポイント:**
- 「検索結果 0 件」の場合、テーブルが存在する画面ではテーブルヘッダ（`thead`）はそのまま表示し、`tbody` 部分に空状態メッセージを表示する（列見出し自体は消さない）
- どちらのパターンでもページネーションは表示しない
- 具体的な `imds-empty-state` の HTML 構造・バリエーションは `reference/imds-html-empty-state.md` を参照すること（本ファイルでは概要のみ扱う）

## 9. 検索条件保持ルール（画面遷移・状態管理）

一覧画面の検索条件・ページ状態は、以下のルールに従って保持・リセットする。

| 操作 | 検索条件 | ページ番号 | ソートキー/並び順 | ナビゲーション選択 | 表示件数 |
|---|---|---|---|---|---|
| 表示件数を変更 | 保持 | - | 保持 | 保持 | 変更後の値を**画面再読み込みまで**保持 |
| ナビゲーションでカテゴリ選択 | 保持 | **1 にリセット** | 保持 | 選択状態を**画面再読み込みまで**保持 | 保持 |
| ソートを実行 | 保持 | **1 にリセット** | 変更後の値を保持 | 保持 | 保持 |
| 検索条件を変更して検索を実行 | 変更後の値を保持 | **1 にリセット** | 保持 | 保持 | 保持 |
| 他画面へ遷移後、「戻る」で復帰 | 保持 | 保持 | 保持 | 保持 | 保持 |

**ポイント:**
- 「検索条件を変更して検索を実行」「ソートを実行」はどちらもページ番号を 1 にリセットするが、もう一方の状態（検索条件 or ソート）は保持する（両者は独立して状態管理する）
- 他画面へ遷移して「戻る」で復帰した場合は、ナビゲーション選択・検索条件・ページ番号・表示件数・ソートキーと並び順の**すべてを保持**する
- 実装上は、検索条件・ページ番号・ソート情報を URL クエリパラメータまたは `SessionScopeStorage` に保持し、画面初期表示時に復元する構成にする
