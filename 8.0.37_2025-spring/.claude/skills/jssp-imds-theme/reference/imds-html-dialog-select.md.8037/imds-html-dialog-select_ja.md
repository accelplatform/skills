---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog + Select（データ選択ダイアログ）

## 基本情報

Dialog（ポップアップウィンドウ）の中に **検索ボックス + 一覧テーブル** を組み合わせて、一覧から 1 件（または複数件）を選んで親画面に返す複合パターン。
ルックアップ・マスタ選択・参照選択等で使用する。

- 個別コンポーネントの詳細は以下を参照
  - ダイアログ本体: [imds-html-dialog.md](imds-html-dialog.md)
  - テーブル: [imds-html-table.md](imds-html-table.md)（`is-sticky` / `is-hoverable` / `is-sortable`）
  - 検索ボックス: [imds-html-textbox-control.md](imds-html-textbox-control.md)（`is-left` でアイコン左寄せ）
  - ボタン: [imds-html-button.md](imds-html-button.md)
- 基本クラス: `imds-dialog` + `imds-table is-sticky is-hoverable`

IM-共通マスタ（ユーザ / 組織 / 会社 / ロール等）の検索ダイアログを呼び出したい場合は、独自実装ではなく `jssp-im-master-usage` スキル（`imACMSearch`）を使うこと。本パターンは **独自テーブルで一覧選択** する場合のみ用いる。

## 全体構造

```
imds-dialog-wrapper                      # サイズ制御ラッパー（横長が基本）
└── imds-dialog                          # ダイアログ本体
    ├── imds-dialog-header               # ヘッダー（タイトル + 閉じるボタン）
    ├── imds-dialog-content (+ scrollbar)# コンテンツ領域
    │   └── imds-px-4 imds-py-3          # 内側余白ラッパー
    │       ├── imds-textbox-control is-left   # 検索ボックス（左にアイコン）
    │       └── imds-table is-area-bordered is-sticky is-hoverable imds-mt-4
    │           └── imds-table-inner
    │               └── table
    │                   ├── thead > tr > th (is-sortable で並べ替え可)
    │                   └── tbody > tr > td  (行クリックで選択)
    └── imds-dialog-footer               # フッター（キャンセル / 選択）
        └── imds-p-4
            ├── button (キャンセル)
            └── button.is-primary (選択)
```

## CSS Classes Reference（このパターン固有）

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-dialog-footer | div 要素（`imds-dialog` の末尾） | フッター領域 | 必須 |
| imds-textbox-control + is-left | 検索ボックス外枠 | アイコンを左に配置した検索フィールド | 推奨 |
| imds-table + is-sticky | テーブル外枠 | ヘッダ行固定（縦スクロール時もヘッダ可視） | 推奨 |
| imds-table + is-hoverable | テーブル外枠 | 行ホバー強調（クリック可能の視覚的ヒント） | 推奨 |
| imds-table + is-area-bordered | テーブル外枠 | テーブル外枠の罫線 | 推奨 |
| th.is-sortable | th 要素 | ソート可能列のマーカー | オプション |
| imds-mt-4 | テーブル外枠 | 検索ボックスとテーブルの縦間隔 | 推奨 |

その他のクラス（`imds-dialog-*` / `imds-button` 等）は個別の reference ファイル参照。

## HTML スニペット

### 基本：データ選択ダイアログ（`<dialog>` ルート / 推奨）

```html
<dialog
  id="route-select-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="route-select-dialog-title"
  style="width: 800px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="route-select-dialog-title" title="ルート選択">ルート選択</h1>
        </div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close"
        aria-label="閉じる">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar">
      <div class="imds-px-4 imds-py-3">
        <div
          class="imds-textbox-control is-left"
          style="width:200px">
          <input
            type="search"
            class="imds-textbox"
            aria-label="絞り込み検索"
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <div
          class="imds-table is-area-bordered is-sticky is-hoverable imds-mt-4"
          style="height: 100%; width: 100%; max-height: 220px;">
          <div class="imds-table-inner">
            <table>
              <thead>
                <tr>
                  <th>ヘッダ1</th>
                  <th class="is-sortable">
                    <span>ヘッダ2</span>
                    <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
                  </th>
                  <th class="is-sortable">
                    <span>ヘッダ3</span>
                    <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span>値-1-1</span></td>
                  <td><span>値-1-2</span></td>
                  <td><span>値-1-3</span></td>
                </tr>
                <!-- 残りの行は省略 -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="imds-dialog-footer">
      <div
        class="imds-p-4"
        style="display:flex; gap:0 1em; justify-content: flex-end">
        <button type="button" class="imds-button" style="width: 8em">キャンセル</button>
        <button type="button" class="imds-button is-primary" style="width: 8em">選択</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 開く（モーダル表示）
document.getElementById('route-select-dialog').showModal();

// 閉じる
document.getElementById('route-select-dialog').close();
```

以降は基本パターンからの差分のみを示す。

## 行選択の実装パターン

`is-hoverable` でホバー強調はされるが、**選択状態は自前で実装する** 必要がある（CSS だけでは選択行を区別できない）。

### 1. 単一選択（行クリックでハイライト）

選択中の行には imds の正規クラス `is-active`（[imds-html-table.md](imds-html-table.md) の isActive）を付与する。
`is-selected` 等の独自クラスで `tr` に `background-color` を指定する方法は使わないこと。imds は `td` 側に背景色を当てているため、`tr` の独自背景色は `td` の背景色に上書きされて実際には表示されない（クラスは付与されているのに見た目が変わらない不具合になる）。`is-active` は `td` 側にもスタイルが当たるため、この上書き問題が起きない。

```html
<tbody>
  <tr data-value="route-1"><td><span>値-1-1</span></td>...</tr>
  <tr class="is-active" data-value="route-2"><td><span>値-2-1</span></td>...</tr>
  <tr data-value="route-3"><td><span>値-3-1</span></td>...</tr>
</tbody>
```

```javascript
// 行クリックで選択行を切り替え（is-active は imds の標準クラスのため独自 CSS は不要）
document.querySelectorAll('#route-select-dialog tbody tr').forEach(function (tr) {
  tr.addEventListener('click', function () {
    document.querySelectorAll('#route-select-dialog tbody tr.is-active')
      .forEach(function (e) { e.classList.remove('is-active'); });
    tr.classList.add('is-active');
  });
});
// 行ダブルクリックで即確定する UX を加えたい場合は dblclick も拾う
```

**アクセシビリティ上の注意**: 行の背景色（ハイライト）のみで選択状態を伝えるのは、色を判別しにくいユーザやキーボードのみで操作するユーザにとって不十分。行クリックはマウス操作に限られるため、キーボード操作・スクリーンリーダー対応が必要な画面では次項「2. ラジオボタンでの単一選択」を併用し、行クリックとラジオの `change` の両方から同じ選択処理を呼んで状態を同期させること。

### 2. ラジオボタンでの単一選択（明示的）

選択 UI を視覚的に明示したい場合や、キーボード操作・スクリーンリーダー対応が必要な場合は、先頭列にラジオを置く。ラジオボタンにすることで選択状態が支援技術に伝わり（スクリーンリーダーの読み上げ対象になる）、`Tab` でのフォーカス・矢印キーでの選択も可能になる。

```html
<thead>
  <tr>
    <th style="width: 3em"></th>
    <th>ID</th>
    <th>名称</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="has-content-only"><label class="imds-radio"><input type="radio" name="route" value="route-1" aria-label="route-1 申請ルートA" /></label></td>
    <td><span>route-1</span></td>
    <td><span>申請ルートA</span></td>
  </tr>
</tbody>
```

行クリックでの選択も両立させたい場合は、1 の `is-active` 切替処理とラジオの `checked` 設定を 1 つの関数（例: `selectRow()`）にまとめ、`tr` の `click` と `input` の `change` の両方から呼ぶ。`radio.checked = true` は明示的に代入する（ラジオ／ラベルのクリックは `tr` にもバブリングして二重に呼ばれるが、処理は冪等にしておけば問題ない）。ラベルテキストを持たないラジオには `aria-label` を付与する（「ID + 名称」等、行を一意に識別できる文言）。値・`aria-label` 等のデータ由来の属性は `innerHTML` 文字列連結ではなく `setAttribute` で設定する（XSS 対策）。

ラジオの詳細は [imds-html-radio.md](imds-html-radio.md) を参照。

### 3. チェックボックスでの複数選択

選択行が複数になる場合は、先頭列にチェックボックスを置く。`thead` 側にも「全選択」チェックボックスを置けるとよい。

```html
<thead>
  <tr>
    <th style="width: 3em">
      <label class="imds-checkbox"><input type="checkbox" aria-label="全選択" /></label>
    </th>
    <th>ID</th>
    <th>名称</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><label class="imds-checkbox"><input type="checkbox" value="route-1" /></label></td>
    <td><span>route-1</span></td>
    <td><span>申請ルートA</span></td>
  </tr>
</tbody>
```

チェックボックスの詳細は [imds-html-checkbox.md](imds-html-checkbox.md) を参照。

## バリエーション

### ソート列の状態表示

`is-sortable` を付けた `th` の中のアイコンで現在のソート状態を表す。

| 状態 | アイコン |
|------|----------|
| ソート対象外 | `fa-sort` |
| 昇順 | `fa-sort-up` |
| 降順 | `fa-sort-down` |

```html
<th class="is-sortable">
  <span>登録日</span>
  <span class="imds-icon"><i class="fa-solid fa-sort"></i></span>
</th>
```

ソートロジック自体は JS で実装する（クリックで `data-order` 等を切り替えて再描画）。

### 検索ボックスの動作

`type="search"` を使うと、ブラウザによっては右端に「×」クリアボタンが自動表示される。検索のトリガは:

- **インクリメンタル検索**: `input` イベントを debounce してフィルタ実行
- **明示的検索**: 検索アイコンクリック or Enter キーで実行

```javascript
// インクリメンタル例（クライアントサイドで `<tbody>` の `<tr>` を絞り込む）
var input = document.querySelector('#route-select-dialog input[type=search]');
input.addEventListener('input', function () {
  var q = input.value.toLowerCase();
  document.querySelectorAll('#route-select-dialog tbody tr').forEach(function (tr) {
    tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
  });
});
```

### 0 件表示

検索結果 0 件のときは `<tbody>` 内に「該当データなし」を 1 行表示する。空 `<tbody>` のままにしない。

```html
<tbody>
  <tr>
    <td colspan="3" class="has-text-centered has-text-grey">該当するデータがありません</td>
  </tr>
</tbody>
```

### ページネーション併設

件数が多い場合はテーブル下にページネーションを付ける。

```html
<div class="imds-table is-area-bordered is-sticky is-hoverable imds-mt-4" ...>
  <!-- ... -->
</div>
<nav class="imds-pagination imds-mt-4">
  <!-- 詳細は imds-html-pagination.md -->
</nav>
```

詳細は [imds-html-pagination.md](imds-html-pagination.md) を参照。

### `<div>` ルート（非モーダル / 特殊用途のみ）

モーダル化が不要な場合のみ `<div>` ルート。原則 `<dialog>` ルートを使うこと。詳細は [imds-html-dialog.md](imds-html-dialog.md) を参照。

```html
<div
  class="imds-dialog-wrapper"
  style="width: 800px;">
  <div class="imds-dialog">
    <!-- header / content / footer は同一 -->
  </div>
</div>
```

### サイズ調整

`imds-dialog-wrapper` は **横幅優先**（800px 程度）が基本。高さは `imds-table` の `max-height` で内側スクロール量を制御する（ダイアログ全体の縦サイズは内容に応じて自動）。

```html
<!-- 横長・テーブル領域 220px 内でスクロール -->
<dialog class="imds-dialog-wrapper" style="width: 800px;">
  ...
  <div class="imds-table ..." style="height:100%; width:100%; max-height: 220px;">
```

ダイアログ自体に固定の `height` を付けるなら、検索ボックス＋テーブル＋フッターが収まる高さにする。

## 実装上の注意

- **テーブルは二重構造が必須**。`<div class="imds-table">` の直下に `<div class="imds-table-inner">` を入れ、その中に `<table>` を置く（[imds-html-table.md](imds-html-table.md)）
- **`is-sticky` はテーブル外枠に付与**するとヘッダ行固定、`th` / `td` に付与すると列固定。**両者は別概念** なので混同しないこと（[imds-html-table.md](imds-html-table.md) Reference 行 37 / 43）
- **`max-height` を `imds-table` 外枠に指定** することでテーブル内側スクロール領域を確定させる。これが無いと `is-sticky` の効きが弱くなる
- **検索 input の `aria-label`**: `<label>` を表示しない検索ボックスでは必ず `aria-label="絞り込み検索"` 等を付ける（スクリーンリーダー対応）
- **`type="button"` を必ず明示**。キャンセル・選択ともに `type="button"`。このパターンに `<form>` 要素は無いが、未指定だと submit 扱いになる
- **「選択」ボタンの押下時**: 選択行から値を取り出して親画面に返す → `close()` する流れ。選択行が無い状態では `disabled` にしておくと UX が安定する

  ```javascript
  var primary = document.querySelector('#route-select-dialog .imds-button.is-primary');
  primary.disabled = !document.querySelector('#route-select-dialog tbody tr.is-active');
  ```

- **選択行のハイライトは `is-active`（imds 標準クラス）を使う**。`is-selected` 等の独自クラスで `tr` に `background-color` を指定する方法は使わないこと（`td` の背景色に上書きされて機能しない。詳細は「1. 単一選択」を参照）。チェックボックス・ラジオ併用なら `:checked` + `:has()` セレクタで強調することも可能
- **ダブルクリックでの即確定**は強い UX だが、誤操作リスクもある。マスタ選択など「行が見えればすぐ選べる」場面のみ採用し、確認が必要な選択（権限変更等）では `click` で選択 → `選択` ボタン押下で確定の 2 ステップにする
- **大量データ対策**: クライアントサイドだけで数千件を `<tbody>` に積むと描画が遅い。サーバサイドフィルタ + ページネーション（[imds-html-pagination.md](imds-html-pagination.md)）に切り替える
- **IM-共通マスタの選択** はこのパターンを自作せず、`jssp-im-master-usage` スキルの `imACMSearch` タグを使うこと（パラメータやコールバックの詳細は同スキル reference を参照）
- **id 衝突回避**: 選択ダイアログを同一画面で複数並べる場合、`id="route-select-dialog"` / `id="user-select-dialog"` のように識別子で分ける
