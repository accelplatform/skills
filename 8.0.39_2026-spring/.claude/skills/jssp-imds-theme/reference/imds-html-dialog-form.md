---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog + Form（ダイアログ内フォーム）

## 基本情報

Dialog（ポップアップウィンドウ）の中に Form（入力フォーム）を組み合わせて配置する複合パターン。
新規作成・編集・複製などのモーダル入力で使用する。

- 個別コンポーネントの詳細は以下を参照
  - ダイアログ本体: [imds-html-dialog.md](imds-html-dialog.md)
  - フォーム要素: [imds-html-field.md](imds-html-field.md) / [imds-html-field-group.md](imds-html-field-group.md)
  - 入力部品: [imds-html-textbox.md](imds-html-textbox.md) / [imds-html-textbox-control.md](imds-html-textbox-control.md) / [imds-html-button.md](imds-html-button.md)
- 基本クラス: `imds-dialog` + `imds-form`

## 全体構造

```
imds-dialog-wrapper                      # サイズ制御ラッパー
└── imds-dialog                          # ダイアログ本体
    ├── imds-dialog-header               # ヘッダー（タイトル + 閉じるボタン）
    ├── imds-dialog-content (+ scrollbar)# コンテンツ領域（縦オーバーフロー時にスクロール）
    │   └── imds-px-4 imds-py-3          # 内側余白ラッパー（form と縁を離す）
    │       └── form.imds-form
    │           └── imds-field-container # 全 field をまとめる
    │               ├── imds-field        # 各入力項目
    │               ├── imds-field-group  # 複合入力（多言語入力など）
    │               └── ...
    └── imds-dialog-footer               # フッター（アクションボタン群）
        └── imds-p-4                     # 内側余白ラッパー
            ├── button (キャンセル)
            └── button.is-primary (登録 / 更新 等)
```

## CSS Classes Reference（このパターン固有）

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-dialog-footer | div 要素（`imds-dialog` の末尾） | フッター領域（アクションボタン配置） | 必須（フォーム用途では推奨） |
| imds-form | form 要素 | フォームスタイル適用 | 必須 |
| imds-field-container | div 要素 | 複数 field のまとまり | 必須 |
| imds-px-4 imds-py-3 | コンテンツ内ラッパー div | 横/縦の内側余白 | 必須相当（`imds-p-4` でも可） |

その他のクラスは個別の reference ファイル参照。

## HTML スニペット

### 基本：新規作成ダイアログ（`<dialog>` ルート / 推奨）

```html
<dialog
  id="category-create-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="category-create-dialog-title"
  style="height: 450px; width: 600px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="category-create-dialog-title" title="カテゴリ新規作成">カテゴリ新規作成</h1>
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
        <form class="imds-form">
          <div class="imds-field-container">
            <!-- ここに各 imds-field / imds-field-group を並べる -->
          </div>
        </form>
      </div>
    </div>
    <div class="imds-dialog-footer">
      <div
        class="imds-p-4"
        style="display:flex; gap:0 1em; justify-content: flex-end">
        <button type="button" class="imds-button" style="width: 8em">キャンセル</button>
        <button type="submit" class="imds-button is-primary" style="width: 8em">登録</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// 開く
document.getElementById('category-create-dialog').showModal();

// 閉じる
document.getElementById('category-create-dialog').close();
```

以降は基本パターンからの差分（フィールド差分・バリエーション）のみを示す。

## フィールド配置パターン

`imds-field-container` の中に並べる入力項目のバリエーション。

### 1. 必須テキスト入力（アスタリスク表示）

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      for="categoryId"
      class="imds-required-label-required-asterisk has-text-weight-bold">
      カテゴリID
    </label>
  </div>
  <div class="imds-field-control">
    <input type="text" id="categoryId" class="imds-textbox" />
  </div>
</div>
```

### 2. 多言語入力（field-group ＋ 言語切替ボタン）

「標準言語の入力欄 ＋ 他言語ダイアログを開く地球儀アイコン」の複合入力。
外枠は装飾的なボーダー付き `<div>` で囲み、中に `imds-field-group` を入れる。

```html
<div class="imds-field-group">
  <div class="imds-field-group-label">
    <label for="categoryNameStd" class="has-text-weight-bold">カテゴリ名</label>
  </div>
  <div style="border:1px solid #d6d6d6; border-radius:4px; padding: 1em;">
    <div class="imds-field-group">
      <div class="imds-field-group-control">
        <div class="imds-field">
          <div class="imds-field-label">
            <label for="categoryNameStd" class="imds-required-label-required-asterisk">標準</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id="categoryNameStd" class="imds-textbox" value="" />
            <button type="button" class="imds-button" aria-label="多言語入力を開く">
              <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3. 数値入力（min/max + 幅制限）

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      for="sortNumber"
      class="imds-required-label-required-asterisk has-text-weight-bold">
      ソート番号
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="number"
      id="sortNumber"
      min="0"
      max="99999"
      class="imds-textbox"
      style="max-width: 10em" />
  </div>
</div>
```

### 4. ポップアップ選択（readonly テキスト + 検索アイコン + クリアボタン）

別の選択ダイアログから値をセットする項目。`input` は `readonly` にして直接編集を防ぎ、検索アイコンでポップアップ呼び出し、`×` ボタンで選択値クリア。

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label class="has-text-weight-bold">親カテゴリ</label>
  </div>
  <div class="imds-field-control">
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            id="parentCategoryName"
            readonly="readonly"
            placeholder="カテゴリを選択"
            class="imds-textbox" />
          <span class="imds-icon is-small">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
        <button
          type="button"
          title="クリア"
          class="imds-button is-ghost"
          aria-label="親カテゴリをクリア">
          <span class="imds-icon">
            <i class="fa-regular fa-xmark-circle"></i>
          </span>
        </button>
      </div>
    </div>
  </div>
</div>
```

## バリエーション

### 編集ダイアログ

タイトルとボタンラベルを変更するだけで、構造は新規作成ダイアログと共通。

```html
<div class="imds-dialog-title">
  <h1 title="カテゴリ編集">カテゴリ編集</h1>
</div>
<!-- ... -->
<button type="submit" class="imds-button is-primary" style="width: 8em">更新</button>
```

### 削除確認ダイアログとの使い分け

- **入力が伴う**（新規・編集・複製等）→ このパターン（dialog + form）
- **確認だけ**（削除・破棄）→ [imds-csjs-confirm.md](imds-csjs-confirm.md) の `imdsConfirm` を使う

### サイズ調整

`imds-dialog-wrapper` の `style` でダイアログサイズを変える。

```html
<!-- 小さめ -->
<dialog class="imds-dialog-wrapper" style="height: 320px; width: 480px;">

<!-- 大きめ（多くの入力項目を縦に並べる） -->
<dialog class="imds-dialog-wrapper" style="height: 600px; width: 720px;">
```

入力項目が増えてもダイアログ自体は固定サイズにし、`imds-dialog-content imds-scrollbar` 側で縦スクロールさせる。

## 実装上の注意

- **ルート要素は `<dialog>` を基本とする**。`<div>` ルートはモーダル化・ESC クローズ・フォーカストラップを自前実装する必要があり、抜け漏れがバグの温床になる（詳細は [imds-html-dialog.md](imds-html-dialog.md)）
- **コンテンツ領域の内側余白は必須**。`imds-dialog-content` 自体は padding を持たないため、必ず内側を `imds-px-4 imds-py-3`（横:1rem / 縦:0.75rem）または `imds-p-4`（全方向 1rem）でラップする。これを省くと form の縁がダイアログのフチに張り付く
- **`imds-dialog-footer` は固定配置**。`imds-dialog-content` がスクロールしてもフッターのボタン群は常に表示される。アクションボタンは必ず footer 側に置き、content 内には置かない
- **ボタン配置は右寄せが基本**。`display:flex; gap:0 1em; justify-content: flex-end` で「キャンセル → プライマリアクション」の順に並べる
- **`<form>` の submit ハンドリング**: 登録ボタンは `type="submit"`、キャンセル・閉じるボタンは `type="button"` を明示する。`type` 未指定だと submit 扱いになりブラウザ依存でフォーム送信されるため必ず指定する
- **入力 id は一意にする**。同一画面で複数ダイアログを定義する場合、`id="categoryId"` のような汎用的な id は衝突する。ダイアログ識別子をプレフィックスとして付与する（例: `id="create-categoryId"` / `id="edit-categoryId"`）
- **バリデーション**: 個別 `imds-field` のエラー表示は [imds-html-field.md](imds-html-field.md) の「バリデーションエラー」セクション参照（`imds-validation-error` クラス + `imds-error-text` 要素）。submit 前に JS で値検証して該当 field に付け外しする
- **多言語入力ボタン（地球儀アイコン）**は別ダイアログを開いて他言語の値を入力する用途。多言語化が不要な画面では削除して単純な textbox にする
- **ポップアップ選択フィールド**で IM-共通マスタの検索ダイアログを開く場合は、`jssp-im-master-usage` スキルの reference を参照すること（`imACMSearch` タグのパラメータを記憶で書かない）
