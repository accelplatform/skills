---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog

## 基本情報

Dialogは、ユーザとシステムの間で特定の情報をやり取りするために表示される小さなウィンドウです。
元の画面の上にポップアップ表示されます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/story/components-dialog--default
- 基本クラス: imds-dialog

## 全体構造

```
imds-dialog-wrapper                       # サイズ制御ラッパー（<dialog> 推奨 / <div> も可）
└── imds-dialog                           # ダイアログ本体
    ├── imds-dialog-header                # ヘッダー
    │   ├── imds-dialog-title-wrapper
    │   │   ├── imds-dialog-title-bread-crumbs-warp  # パンくず（オプション）
    │   │   └── imds-dialog-title         # タイトル（h1 + サブタイトル <p>）
    │   └── button.imds-dialog-header-close # 閉じるボタン（オプション）
    └── imds-dialog-content (+ imds-scrollbar) # コンテンツ領域
        └── imds-p-4                       # 内側余白ラッパー（必須相当）
            └── （任意のコンテンツ）
```

入力フォームを内包する場合は [imds-html-dialog-form.md](imds-html-dialog-form.md) を参照。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-dialog-wrapper | 外側要素（`<dialog>` または `<div>`） | ダイアログのサイズ制御ラッパー | 必須 |
| imds-dialog | 内側 div | ダイアログ本体 | 必須 |
| imds-dialog-header | div 要素 | ヘッダー領域 | 必須 |
| imds-dialog-title-wrapper | div 要素 | タイトル部分のラッパー | 必須 |
| imds-dialog-title | div 要素 | タイトル表示領域 | 必須 |
| imds-dialog-title-bread-crumbs-warp | div 要素 | パンくずリスト表示領域 | オプション |
| imds-dialog-header-close | button 要素 | 閉じるボタン | オプション |
| imds-dialog-content | div 要素 | コンテンツ領域 | 必須 |
| imds-scrollbar | imds-dialog-content | スクロールバースタイル | オプション |

## HTML スニペット

### 基本ダイアログ（`<dialog>` ルート / 推奨）

`imds-dialog-wrapper` は **HTML5 ネイティブの `<dialog>` 要素** をルートにして実装するのが基本。
`<dialog>` + `showModal()` により以下が JavaScript / CSS の追加実装なしで自動的に得られる:

- 背景の半透明オーバーレイ（`::backdrop`）
- 背面要素の操作禁止（モーダル）
- `Escape` キーで自動 close
- フォーカストラップ（Tab が dialog 内で循環）

```html
<dialog
  id="item-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="item-dialog-title"
  style="width: 500px; min-width: 150px; max-width: 1000px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="item-dialog-title" title="ダイアログのタイトル">ダイアログのタイトル</h1>
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
      <div class="imds-p-4">
        コンテンツの内容
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 開く（モーダル表示）
document.getElementById('item-dialog').showModal();

// 閉じる
document.getElementById('item-dialog').close();
```

#### `<dialog>` ルート使用時のルール

- `<dialog>` 要素自体が `role="dialog"` 相当なので、`role` / `aria-modal` を付けない（`aria-labelledby` のみ残す）
- `style="display:none"` で隠さない（`<dialog>` 要素は閉じている状態がデフォルト）
- `style.display = ''` で表示してはならない。**必ず `showModal()` を呼ぶ**（背面の操作禁止が効くのはこの方法のみ）
- 自前で `<div>` + `position:fixed` + 背景 overlay を実装してはならない
- `imds-dialog-content` には **デフォルトで padding が無い**。`<div class="imds-p-4">` でコンテンツを必ずラップする（`imds-p-2` / `imds-p-6` で調整可）。これを怠るとフォーム要素やボタンがダイアログの縁にぴったり貼り付いて表示される

以降は基本ダイアログからの差分のみを示す。

## バリエーション

### サブタイトル

`imds-dialog-title` 内の `h1` の後に `<p>` 要素を追加する。

```html
<div class="imds-dialog-title">
  <h1 title="ダイアログのタイトル">ダイアログのタイトル</h1>
  <p>サブタイトル</p>
</div>
```

### パンくずリスト

`imds-dialog-title-wrapper` 内の `imds-dialog-title` の前に `imds-dialog-title-bread-crumbs-warp` を追加する。

```html
<div class="imds-dialog-title-wrapper">
  <div class="imds-dialog-title-bread-crumbs-warp">
    <span title="パンくずリスト1">パンくずリスト 1</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-angle-right"></i></span>
    <span title="パンくずリスト2">パンくずリスト 2</span>
  </div>
  <div class="imds-dialog-title"><h1 title="ダイアログのタイトル">ダイアログのタイトル</h1></div>
</div>
```

### タイトルなし

タイトルを表示しないパターン。`imds-dialog-header` 内に `imds-dialog-title-wrapper` を置かず、閉じるボタンのみを残す。

```html
<div class="imds-dialog-header">
  <button
    type="button"
    class="imds-button is-ghost is-small imds-dialog-header-close"
    aria-label="閉じる">
    <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
  </button>
</div>
```

### `<div>` ルート（非モーダル / 特殊用途のみ）

モーダル化（背面操作禁止）が **不要** な場合、または `<dialog>` 要素が使えない特殊環境の場合にのみ、`<div>` をルートに使う。基本パターンではなく **サブの選択肢** として扱うこと。

```html
<div
  class="imds-dialog-wrapper"
  style="height: 220px; width: 500px; min-height: 150px; min-width: 150px; max-height: 1000px; max-width: 1000px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title"><h1 title="ダイアログのタイトル">ダイアログのタイトル</h1></div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar"><div class="imds-p-4">コンテンツの内容</div></div>
  </div>
</div>
```

⚠️ `<div>` ルートでは以下を **自前で実装する必要がある**:
- 表示/非表示の制御（`style.display` 等）
- 背景の半透明オーバーレイ（必要なら別の `<div>` を重ねる）
- 背面要素の操作禁止
- ESC キーでのクローズ
- フォーカストラップ

これらを正しく実装するのは難しく、抜け漏れがバグの温床になる。**特別な理由がなければ必ず `<dialog>` ルートを採用すること**。

## 実装上の注意

- `imds-dialog-wrapper` の `style` 属性でダイアログのサイズ（height, width, min/max）を制御する
- 閉じるボタンには `imds-button is-ghost is-small imds-dialog-header-close` を使用する
- コンテンツ領域のパディングは `imds-p-4` で調整している。コンテンツに応じて変更可能
- `imds-scrollbar` を付与するとコンテンツがオーバーフローした際にスクロールバーが表示される
- パンくずリストのクラス名は `imds-dialog-title-bread-crumbs-warp`（typo ではなく公式のクラス名）

### 推奨サイズ

固定サイズ（px）で指定する場合、1280px × 720px まで画面を縮小しても適切に表示できるよう、以下を推奨値とする。

- `width`: 1080px 以下
- `height`: 520px 以下

一覧選択系のダイアログなど、画面サイズに応じてなるべく広く表示したい場合は `width` / `height` を % 指定する。% 指定時にダイアログが大きくなりすぎる場合は `max-width` / `max-height` を併用して上限を設ける。

### トリガーボタンとタイトルの命名一致

ダイアログを開くトリガーボタンのラベルと、ダイアログの `imds-dialog-title` に表示するタイトルは一致させること。

- 登録・編集ダイアログの場合は、何をするダイアログかを明確にするため、「機能名 - 処理名」の形式でタイトルを設定する（例: トリガーボタン「カテゴリ新規作成」→ タイトル「カテゴリ新規作成」）。

```html
<!-- トリガーボタン -->
<button type="button" class="imds-button is-primary" onclick="showDialog('category-create-dialog')">
  カテゴリ新規作成
</button>

<!-- ダイアログ側タイトル（ボタンのラベルと一致させる） -->
<div class="imds-dialog-title"><h1 title="カテゴリ新規作成">カテゴリ新規作成</h1></div>
```

### ダイアログの二重スタック禁止

ダイアログの上にさらにダイアログを重ねて表示することは、原則として避けること。どのダイアログに対する操作か分かりにくくなり、コンテンツの見落としや誤操作を招く。

- 二重スタックを避ける回避策:
  - ダイアログではなく [Popover](imds-html-popover.md) の利用を検討する（例: Popover を利用した検索）。
  - ダイアログ内で画面表示の切り替えが必要な場合は、ウィザード形式（[Stepper](imds-html-stepper.md) 等）での切り替えを検討する。
- やむを得ず二重にダイアログを表示する場合（特定の情報を選択するダイアログ等）は、タイトルやパンくずリスト（`imds-dialog-title-bread-crumbs-warp`）を使って操作対象・操作内容を明確に示すこと。
