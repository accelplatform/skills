# Table

## 基本情報

表形式でデータを表示するための部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/story/components-table--default
- 基本クラス: imds-table

## 全体構造

```
imds-table                                # テーブルコンテナ（サイズ・スクロール制御）
└── imds-table-inner                      # 内部ラッパー
    └── table                             # 素の <table> 要素
        ├── thead
        │   └── tr
        │       └── th                    # ヘッダセル（is-sticky / is-sortable 等を付与）
        └── tbody
            └── tr                        # 各行（is-active / is-danger 等を付与）
                └── td                    # 各セル（is-sticky / has-content-only / has-text-right 等を付与）
```

`div.imds-table > div.imds-table-inner > table` の **3 層構造が必須**。`table` を直接書かない。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-table | div 要素 | テーブルコンテナ | 必須 |
| imds-table-inner | div 要素 | テーブル内部ラッパー | 必須 |
| is-sticky | imds-table | ヘッダ行固定（縦スクロール時） | オプション |
| is-hoverable | imds-table | 行ホバーハイライト | オプション |
| is-bordered | imds-table | 全セル罫線 | オプション |
| is-area-bordered | imds-table | テーブル外枠罫線 | オプション |
| is-narrow | imds-table / tr 要素 | セル余白を狭くする | オプション |
| is-stripe | imds-table | 偶数行の背景色を変える | オプション |
| is-sticky | th / td 要素 | 列固定（横スクロール時） | オプション |
| is-border-right | th / td 要素 | 固定列の右側に境界線を表示 | オプション |
| is-sortable | th 要素 | ソート可能列 | オプション |
| is-max-content | imds-table | 横スクロール推奨（列幅をコンテンツ幅基準にする） | オプション |
| is-active | tr / td 要素 | アクティブ（選択済み）ハイライト | オプション |
| has-content-only | th / td 要素 | セル内余白を除去（ボタン・チェックボックス用） | オプション |
| has-text-right | td 要素 | テキスト右寄せ（数値列向け） | オプション |
| is-danger | tr / td 要素 | 削除・期限切れ（赤） | オプション |
| is-error | tr / td 要素 | 処理失敗・エラー（赤） | オプション |
| is-success | tr / td 要素 | 処理成功・正常（緑） | オプション |
| is-add | tr / td 要素 | 新規追加（緑） | オプション |
| is-warning | tr / td 要素 | 注意・警告（黄） | オプション |
| is-disabled | tr / td 要素 | 非活性状態（グレー） | オプション |
| is-white | tr / td 要素 | 装飾色（白） | オプション |
| is-green | tr / td 要素 | 装飾色（緑） | オプション |
| is-red | tr / td 要素 | 装飾色（赤） | オプション |
| is-yellow | tr / td 要素 | 装飾色（黄） | オプション |
| is-cyan | tr / td 要素 | 装飾色（シアン） | オプション |
| is-gray | tr / td 要素 | 装飾色（グレー） | オプション |

## HTML スニペット

### 基本テーブル

```html
<div
  class="imds-table"
  style="width: 100%; height: 100%; max-height: 250px;">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th>ヘッダ1</th>
          <th><span>ヘッダ2</span></th>
          <th><span>ヘッダ3</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span>値-1-1</span></td>
          <td><span>値-1-2</span></td>
          <td><span>値-1-3</span></td>
        </tr>
        <!-- 同構造の tr を必要数繰り返す -->
      </tbody>
    </table>
  </div>
</div>
```

以降は基本テーブルからの差分のみを示す。

## バリエーション

### isSticky（ヘッダ固定）

`div.imds-table` に `is-sticky` を付与する。
縦スクロール時にヘッダ行が固定される。

```html
<div class="imds-table is-sticky" ...>
```

### isHoverable（行ホバー）

`div.imds-table` に `is-hoverable` を付与する。

```html
<div class="imds-table is-hoverable" ...>
```

### isBordered（全セル罫線）

`div.imds-table` に `is-bordered` を付与する。

```html
<div class="imds-table is-bordered" ...>
```

### isAreaBordered（外枠罫線）

`div.imds-table` に `is-area-bordered` を付与する。

```html
<div class="imds-table is-area-bordered" ...>
```

### isStripe（ストライプ）

`div.imds-table` に `is-stripe` を付与する。偶数行の背景色が変わる。

```html
<div class="imds-table is-stripe" ...>
```

### isMaxContent（横スクロール推奨）

列数が多い・各セルの文字数が多いなど横スクロールが発生する可能性が高いテーブルには、`div.imds-table` に `is-max-content` を付与する。
列幅がコンテンツ幅基準になり、セル内の折り返しを避けられる。

```html
<div class="imds-table is-hoverable is-sticky is-area-bordered is-max-content" ...>
```

逆に、列数が少なく横スクロールさせずに全列を表示したい場合は `is-max-content` を付与しない。この場合、長い文字列は折り返されて表示される。

```html
<!-- 横スクロールさせない場合（is-max-content なし） -->
<div class="imds-table is-hoverable is-sticky is-area-bordered" ...>
```

### isNarrow（コンパクト）

テーブル全体に適用する場合は `div.imds-table` に、特定の行のみに適用する場合は `tr` に `is-narrow` を付与する。

```html
<!-- テーブル全体 -->
<div class="imds-table is-narrow" ...>

<!-- 特定の行のみ -->
<tr class="is-narrow">
  <td colspan="3"><span>狭い行のサンプル</span></td>
</tr>
```

### isVerticalSticky（列固定）

横スクロール時に特定の列を固定する。
`th` / `td` に `is-sticky` を付与し、2列目以降は `left` で位置を指定する。
固定列の最後に `is-border-right` を付与して境界線を表示する。

```html
<thead>
  <tr>
    <th class="is-sticky"><span>固定列1</span></th>
    <th class="is-sticky" style="left: 70px;"><span>固定列2</span></th>
    <th class="is-sticky is-border-right" style="left: 140px;"><span>詳細</span></th>
    <th>ヘッダ1</th>
    <!-- 通常列 -->
  </tr>
</thead>
<tbody>
  <tr>
    <td class="is-sticky is-cyan"><span>固定列1</span></td>
    <td class="is-sticky is-cyan" style="left: 70px;"><span>固定列2</span></td>
    <td class="is-sticky has-content-only is-border-right is-cyan" style="left: 140px;">
      <button type="button" class="imds-button is-ghost is-small">
        <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
      </button>
    </td>
    <td><span>値-1-1</span></td>
    <!-- 通常列 -->
  </tr>
</tbody>
```

### isSelectable（行選択）

チェックボックス列を追加する。
`th` / `td` に `has-content-only` を付与してセル余白を除去する。
テーブル文脈のチェックボックスは `label.imds-checkbox` 内に `input` のみを置き、`span` は付与しない（フォーム単体のチェックボックスと異なる点に注意）。

```html
<th class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" id="checkbox-all-xxxxx" />
  </label>
</th>
<!-- tbody 内の各行にも同構造の td を追加 -->
<td class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" id="checkbox-child-0-xxxxx" />
  </label>
</td>
```

### isDetailsButton（詳細ボタン列）

詳細ボタン列を追加する。
`th` はヘッダテキストのみのため `has-text-centered` を付与して中央寄せにする。`td` はボタンのみのため `has-content-only` を付与する。

```html
<th class="has-text-centered"><span>詳細</span></th>
<!-- tbody 内の各行 -->
<td class="has-content-only">
  <button type="button" class="imds-button is-ghost is-small">
    <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
  </button>
</td>
```

### isSortable（ソート可能）

ソート対象の `th` に `is-sortable` を付与し、`imds-table-column-actions > button.imds-table-sorter > span.imds-table-sort-label + span.imds-icon` の構造でソートボタンを追加する。
`span.imds-icon` の中には `fa-sort-up`（昇順アイコン）・`fa-sort-down`（降順アイコン）の 2 つの `<i>` を常に両方記述し、CSS でソート状態に応じた表示切替を行う（1 アイコンのみを動的に差し替える実装ではない）。
`button.imds-table-sorter` には現在の操作を表す `title` 属性（例: `"昇順に並べ替え"` / `"降順に並べ替え"` / `"並べ替えを解除"`）を付与する。

```html
<th class="is-sortable">
  <div class="imds-table-column-actions">
    <button class="imds-table-sorter" title="昇順に並べ替え">
      <span class="imds-table-sort-label">ヘッダ2</span>
      <span class="imds-icon">
        <i class="fa-solid fa-sort-up"></i>
        <i class="fa-solid fa-sort-down"></i>
      </span>
    </button>
  </div>
</th>
```

ソート状態は「昇順 → 降順 → 未適用」の順で切り替える。`title` はその時点で次にクリックすると発生する操作を表す文言にする。

### hasTextRight（テキスト右寄せ）

数値列など右寄せにしたい `td` に `has-text-right` を付与する。

```html
<td class="has-text-right"><span>1,000</span></td>
```

### isActive（アクティブ行 / セル）

行全体をハイライトする場合は `tr` に、セル単位の場合は `td` に `is-active` を付与する。

```html
<!-- 行全体 -->
<tr class="is-active">

<!-- セル単位 -->
<td class="is-active"><span>値</span></td>
```

### color（セル背景色）

`tr` または `td` にカラークラスを付与する。`is-active` と組み合わせ可能。

| クラス | 用途 |
|--------|------|
| （なし） | 通常の色 |
| is-danger | 削除・期限切れ |
| is-error | 処理失敗・エラー |
| is-success | 処理成功・正常 |
| is-add | 新規追加 |
| is-warning | 注意・警告 |
| is-disabled | 非活性状態 |
| is-white / is-green / is-red / is-yellow / is-cyan / is-gray | 装飾色 |

```html
<tr class="is-danger">            <!-- 行全体に色付け -->
<td class="is-success">           <!-- セル単位で色付け -->
<td class="is-warning is-active"> <!-- 色 + アクティブの組み合わせ -->
```

### 縦型レイアウト（項目名と値の横並び表示）

詳細・参照画面やダイアログでサマリー情報を表示する際に使用する、項目名と値を横並びで表示するテーブル。
表の行に見出しを配置する場合は `th` を使用する（`thead` は使わず `tbody` 内に `th`/`td` を交互に並べる）。

```html
<div class="imds-table is-bordered is-area-bordered">
  <div class="imds-table-inner">
    <table>
      <tbody>
        <tr>
          <th><span>アプリケーション名</span></th>
          <td><span>アプリケーション1</span></td>
          <th><span>アプリケーションID</span></th>
          <td><span>sample_app_1</span></td>
        </tr>
        <tr>
          <th><span>カテゴリ名</span></th>
          <td><span>カテゴリ1</span></td>
          <th><span>カテゴリID</span></th>
          <td><span>ct_1</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## アクセシビリティ対応

### ヘッダラベル

- ラベルは基本的に左寄せで配置する
- ただし、以下のケースは中央寄せを使用する

  **中央寄せ**: `th` に `has-text-centered` クラスを指定
  - テーブルに対する操作ボタンを表示する場合
  - ステータスを表すアイコンを表示する場合
  - 「編集」「詳細」等のヘッダテキストのみを表示する場合（`has-content-only` は使用しない。`has-content-only` は th 自体がチェックボックス等のコンポーネントのみで、ヘッダテキストを持たない場合にのみ使用する）

### tbody

- データ項目は表の列の見出し同様、基本的に左寄せで配置する
- ただし、以下のケースは中央寄せ・右寄せを使用する

  **中央寄せ**: `td` に `has-text-centered` クラスを指定
  - テーブルに対する操作ボタンを表示する場合
  - ステータスを表すアイコンを表示する場合

  **右寄せ:**: `td` に `has-text-right` クラスを指定
  - 金額・数値など、桁数を意識するデータを表示する場合

  **コンポーネントのみ**: `td` に `has-content-only` クラスを指定
  - チェックボックス・ボタン・アイコン・タグ等のコンポーネントのみを表示する場合

## 実装上の注意

- テーブルは `div.imds-table > div.imds-table-inner > table` の3層構造で記述する
- `imds-table` の `style` でサイズ制御を行う（`max-height` でスクロール領域を設定）
- `is-sticky`（テーブル全体）と `is-sticky`（th/td）は異なる用途: 前者はヘッダ行固定、後者は列固定
- 列固定時の `left` 値は前の固定列の幅に応じて手動で計算する
- 列固定時の `td` には背景色クラス（`is-cyan` 等）を付与しないとスクロール時に背景が透過する
- ソート処理は JavaScript で実装する（`is-sortable` 状態クラスの切替とデータ並び替え）。ヘッダ内のソートアイコンは `fa-sort-up` / `fa-sort-down` の2つを常に併記し、CSS 側の状態クラスで表示を切り替える
- 横スクロールが発生しやすい（列数・文字数が多い）テーブルには `is-max-content` を付与する。列数が少なく横スクロールさせたくない場合は付与しない
- `has-content-only` はボタンやチェックボックスなどセル余白が不要な場合に使用する
- `th` にヘッダテキスト（`<span>編集</span>` 等）がある場合は `has-content-only` を付与しない。中央寄せにしたい場合は `has-text-centered` を使う。`has-content-only` は th 自身がチェックボックス等のコンポーネントのみで、ヘッダテキストを持たない場合に限る
- 複数のバリエーションは組み合わせ可能（例: `is-sticky is-hoverable is-stripe`）
- **行・セルの背景色に独自クラスを使わない**。imds は `td` 側に背景色を当てているため、`tr` に独自クラスで `background-color` を指定しても `td` の背景色に上書きされて見えない（クラスは付いているのに見た目が変わらない、気づきにくい不具合になる）。選択済み行のハイライトは `is-active`（[isActive（アクティブ行 / セル）](#isactiveアクティブ行--セル)）、状態に応じた色分けは `is-danger` / `is-warning` / `is-success` 等のカラークラス（[color（セル背景色）](#colorセル背景色)）を使うこと。`is-active` とカラークラスは組み合わせ可能
