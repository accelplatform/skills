# Dialog + Detail（情報表示ダイアログ）

## 基本情報

Dialog（ポップアップウィンドウ）の中に **読み取り専用の情報** を縦型テーブルで表示する複合パターン。
詳細表示・閲覧モード・確認画面（入力を伴わない）等で使用する。

- 個別コンポーネントの詳細は以下を参照
  - ダイアログ本体: [imds-html-dialog.md](imds-html-dialog.md)
  - テーブル: [imds-html-table.md](imds-html-table.md)
  - ボタン: [imds-html-button.md](imds-html-button.md)
- 基本クラス: `imds-dialog` + `imds-table`（縦型 th/td レイアウト）

入力（追加・編集）を伴うダイアログは [imds-html-dialog-form.md](imds-html-dialog-form.md) を使うこと。

## 全体構造

```
imds-dialog-wrapper                      # サイズ制御ラッパー
└── imds-dialog                          # ダイアログ本体
    ├── imds-dialog-header               # ヘッダー（タイトル + 閉じるボタン）
    ├── imds-dialog-content (+ scrollbar)# コンテンツ領域
    │   └── imds-px-4 imds-py-3          # 内側余白ラッパー
    │       └── imds-table is-area-bordered is-bordered
    │           └── imds-table-inner
    │               └── table > tbody
    │                   └── tr 行ごとに「th: 項目名 / td: 値」
    └── imds-dialog-footer               # フッター（閉じるボタンのみ）
        └── imds-p-4
            └── button (閉じる)
```

## CSS Classes Reference（このパターン固有）

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-dialog-footer | div 要素（`imds-dialog` の末尾） | フッター領域（閉じるボタン配置） | 必須 |
| imds-table | div 要素 | 値の表示用テーブル外枠 | 必須 |
| is-area-bordered | imds-table 併用 | テーブル外枠の罫線 | 推奨 |
| is-bordered | imds-table 併用 | 全セル罫線（項目間の区切り） | 推奨 |
| imds-table-inner | div 要素 | テーブル内枠（必須の二重構造） | 必須 |
| imds-px-4 imds-py-3 | コンテンツ内ラッパー div | 横/縦の内側余白 | 必須相当（`imds-p-4` でも可） |

その他のクラス（`imds-dialog-*` / `imds-button` 等）は個別の reference ファイル参照。

## HTML スニペット

### 基本：詳細表示ダイアログ（`<dialog>` ルート / 推奨）

```html
<dialog
  id="category-detail-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="category-detail-dialog-title"
  style="height: 430px; width: 600px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="category-detail-dialog-title" title="カテゴリ詳細">カテゴリ詳細</h1>
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
        <div class="imds-table is-area-bordered is-bordered">
          <div class="imds-table-inner">
            <table>
              <tbody>
                <tr>
                  <th style="width:30%"><span>親カテゴリ</span></th>
                  <td><span>公開資料</span></td>
                </tr>
                <tr>
                  <th><span class="imds-required-label-required-asterisk">カテゴリID</span></th>
                  <td><span>public_documents_1</span></td>
                </tr>
                <tr>
                  <th><span>カテゴリ名</span></th>
                  <td><span>社内向け公開資料</span></td>
                </tr>
                <tr>
                  <th><span class="imds-required-label-required-asterisk">ソート番号</span></th>
                  <td><span>10</span></td>
                </tr>
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
        <button type="button" class="imds-button" style="width: 8em">閉じる</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 開く（モーダル表示）
document.getElementById('category-detail-dialog').showModal();

// 閉じる
document.getElementById('category-detail-dialog').close();
```

以降は基本パターンからの差分のみを示す。

## 行のバリエーション

`tbody` 内に並べる行のパターン。

### 1. 通常の項目

```html
<tr>
  <th><span>カテゴリ名</span></th>
  <td><span>社内向け公開資料</span></td>
</tr>
```

### 2. 必須属性のマーク表示

詳細表示では入力しないが、その項目が「登録時に必須」であることを示したい場合、`th` 内の `<span>` に `imds-required-label-required-asterisk` を付ける（label ではなく span に付与する点に注意）。

```html
<tr>
  <th><span class="imds-required-label-required-asterisk">カテゴリID</span></th>
  <td><span>public_documents_1</span></td>
</tr>
```

### 3. 長文・複数行のテキスト表示

長文値は `<td>` 内で改行を許容する。プレーンテキストの改行を反映する場合は CSS の `white-space: pre-wrap` を使う。

```html
<tr>
  <th><span>説明</span></th>
  <td><span style="white-space: pre-wrap">複数行の\n説明テキスト</span></td>
</tr>
```

### 4. 値が無い項目

空値は「（未設定）」等の固定文字、または `&mdash;` 等のプレースホルダで明示する（空 `<td>` は読み上げで意味が伝わらない）。

```html
<tr>
  <th><span>備考</span></th>
  <td><span class="has-text-grey">（未設定）</span></td>
</tr>
```

### 5. リンク・タグ等のリッチな値

`<td>` 内には任意の imds コンポーネントを置ける。

```html
<tr>
  <th><span>ステータス</span></th>
  <td><span class="imds-tag is-success">公開中</span></td>
</tr>
```

## バリエーション

### 編集ボタン併設（詳細 → 編集への導線）

「閉じる」と並べて「編集」ボタンを置く場合、プライマリアクション（編集）を右端に配置する。

```html
<div class="imds-dialog-footer">
  <div
    class="imds-p-4"
    style="display:flex; gap:0 1em; justify-content: flex-end">
    <button type="button" class="imds-button" style="width: 8em">閉じる</button>
    <button type="button" class="imds-button is-primary" style="width: 8em">編集</button>
  </div>
</div>
```

### 戻る + 閉じる（一覧から遷移してきた場合）

「閉じる」のみだと操作が一意なので、戻る導線がある場合のみ 2 ボタン配置にする。

```html
<div class="imds-dialog-footer">
  <div
    class="imds-p-4"
    style="display:flex; gap:0 1em; justify-content: space-between">
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
      <span class="imds-button-text">戻る</span>
    </button>
    <button type="button" class="imds-button" style="width: 8em">閉じる</button>
  </div>
</div>
```

### `<div>` ルート（非モーダル / 特殊用途のみ）

モーダル化が不要な場合のみ `<div>` ルート。原則 `<dialog>` ルートを使うこと。詳細は [imds-html-dialog.md](imds-html-dialog.md) を参照。

```html
<div
  class="imds-dialog-wrapper"
  style="height: 430px; width: 600px;">
  <div class="imds-dialog">
    <!-- header / content / footer は同一 -->
  </div>
</div>
```

### サイズ調整

`imds-dialog-wrapper` の `style` でダイアログサイズを変える。項目数に応じて高さを調整し、内容がはみ出すぶんは `imds-dialog-content imds-scrollbar` 側で縦スクロールさせる。

```html
<!-- 小（項目少なめ） -->
<dialog class="imds-dialog-wrapper" style="height: 320px; width: 480px;">

<!-- 大（項目多め / 長文値あり） -->
<dialog class="imds-dialog-wrapper" style="height: 600px; width: 720px;">
```

## 実装上の注意

- **このパターンは読み取り専用**。入力欄（`<input>` / `<select>` / `<textarea>`）は置かない。入力が必要なら [imds-html-dialog-form.md](imds-html-dialog-form.md) のパターンに切り替える
- **テーブルは二重構造が必須**。`<div class="imds-table">` の直下に `<div class="imds-table-inner">` を入れ、その中に `<table>` を置く（[imds-html-table.md](imds-html-table.md)）。これを省くと罫線スタイルが崩れる
- **th の幅は最初の `<tr>` の `<th>` に `style="width:30%"` 等で指定**。全行の th に書く必要は無く、`<colgroup>` の代わりとして最初の 1 セルだけで列幅が確定する
- **値は `<span>` でラップする**のが基本。`<td>` 直下のテキストノードはスタイル適用やスクリプトからの参照が面倒になるため避ける
- **空値はプレースホルダで明示**。空 `<td>` はスクリーンリーダーで「空」としか伝わらないため、「（未設定）」「&mdash;」等を入れる
- **`imds-required-label-required-asterisk` は label / span のどちらにも付けられる**が、詳細表示ではフォーム入力ではなく単なる項目名なので `<span>` に付ける（`<label for=...>` を使わない）
- **フッターのボタン配置**: 「閉じる」のみ → 右寄せ、「閉じる + 編集」 → 右寄せでプライマリを右端、「戻る + 閉じる」 → `justify-content: space-between` で左右に分割。汎用ルールはプライマリアクションを右端に置くこと
- **`type="button"` を必ず明示**。閉じる・編集等すべて `type="button"`（このパターンに `<form>` は存在しないが、ブラウザによっては最初の button が submit 扱いされ予期せぬ動作になる）
- **編集ボタン押下時の挙動**: 通常は詳細ダイアログを `close()` し、編集ダイアログ（[imds-html-dialog-form.md](imds-html-dialog-form.md)）を `showModal()` で開く。同じ id を 2 つのダイアログで使わないよう注意
- **タイトル `<h1>` の `title` 属性**: タイトルテキストが長い場合の省略表示に対応するため、`<h1 title="...">` を付ける（dialog 共通のルール）
- **id 衝突回避**: 同一画面で「新規作成 / 編集 / 詳細」の 3 ダイアログを並べる場合、`id="category-create-dialog"` / `id="category-edit-dialog"` / `id="category-detail-dialog"` のように識別子をプレフィックスで分ける
