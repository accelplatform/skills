---
paths:
  - "src/main/jssp/**/*.html"
---

# FileUpload

## 基本情報

FileUpload は、ファイルのアップロードを行う部品です。
ファイルはドラッグアンドドロップ、または「ファイルを選択」ボタンを使用してアップロードできます。
アップロードしたファイルは、ファイルのアップロードエリアの下にリスト形式で表示されます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-fileupload--documentation
- 基本クラス: imds-file-upload

## 全体構造

```
imds-file-upload                          # コンテナ（is-small でサイズ変更）
└── imds-file-upload-drop-area            # ドラッグ＆ドロップ領域
    ├── input[type=file]                  # ファイル選択 input（CSS で非表示 / multiple 可）
    ├── imds-icon                         # アップロードアイコン
    ├── p.imds-file-upload-message        # メインメッセージ
    ├── p.imds-file-upload-text           # 補足テキスト（「または」等、オプション）
    └── button.imds-button                # ファイル選択ボタン（is-outlined + is-small/is-x-small）
```

アップロード済みファイルのリスト表示は `imds-file-upload` の外側に、`imds-file-upload-list` テーブル構造として実装する（詳細は後述の「アップロード後のファイル一覧」を参照）。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-file-upload | 外側 div | ファイルアップロードコンテナ | 必須 |
| imds-file-upload-drop-area | div 要素 | ドラッグ＆ドロップ領域 | 必須 |
| imds-file-upload-message | p 要素 | メインメッセージ | 必須 |
| imds-file-upload-text | p 要素 | 補足テキスト（「または」等） | オプション |
| is-small | imds-file-upload | 小サイズ表示 | オプション |
| imds-file-upload-list | div 要素（`table` を内包） | アップロード後のファイル一覧コンテナ | ファイル一覧表示時は必須 |
| imds-file-upload-name | span 要素 | ファイル名表示 | ファイル一覧表示時は必須 |
| imds-file-upload-file-icon | span.imds-icon | ファイルアイコン（アップロード前の一覧・ダウンロード不可） | 状況に応じて |
| imds-file-upload-download-icon | span.imds-icon | ダウンロードアイコン（参照時のファイルリンク） | 状況に応じて |
| imds-file-upload-date | td 要素 | アップロード日時列 | オプション |
| imds-file-upload-size | td 要素 | ファイルサイズ列 | オプション |

## HTML スニペット

### 基本ファイルアップロード

```html
<div class="imds-file-upload">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">ここにファイルをドラッグ＆ドロップしてください</p>
    <p class="imds-file-upload-text">または</p>
    <button
      type="button"
      class="imds-button is-outlined is-small is-primary">
      ファイルを選択
    </button>
  </div>
</div>
```

以降は基本ファイルアップロードからの差分のみを示す。

## バリエーション

### multiple（複数ファイル）

`input[type="file"]` に `multiple` 属性を付与する。

```html
<input type="file" multiple />
```

### small（小サイズ）

`div.imds-file-upload` に `is-small` を付与する。
ボタンも `is-x-small` に変更する。

```html
<div class="imds-file-upload is-small">
  <div class="imds-file-upload-drop-area">
    <input type="file" />
    <span class="imds-icon"><i class="fa-solid fa-file-arrow-up"></i></span>
    <p class="imds-file-upload-message">ここにファイルをドラッグ＆ドロップ</p>
    <p class="imds-file-upload-text">または</p>
    <button
      type="button"
      class="imds-button is-outlined is-x-small is-primary">
      ファイルを選択
    </button>
  </div>
</div>
```

### アップロード後のファイル一覧

アップロードされたファイルを表示するリストテーブル。`imds-file-upload` コンテナの外側（下）に配置する。ファイル名・アップロード日時・サイズはサンプルであり必須項目ではないため、適宜選択して表示する。

#### アップロード前（未確定）のファイルリスト

まだサーバに確定保存されていない選択中ファイルの一覧。ファイル名はリンクにならず、アイコンは `fa-regular fa-file`（`imds-file-upload-file-icon`）。

```html
<div class="imds-file-upload-list">
  <table>
    <tbody>
      <tr>
        <td>
          <span>
            <span class="imds-icon is-gray-light imds-file-upload-file-icon"><i class="fa-regular fa-file"></i></span>
            <span class="imds-file-upload-name">sample-file-1.xlsx</span>
          </span>
        </td>
        <td class="imds-file-upload-date"><span>2024/06/04 17:23:34</span></td>
        <td class="imds-file-upload-size"><span>100KB</span></td>
        <td>
          <button type="button" class="imds-button is-ghost" title="削除">
            <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

#### 参照時（アップロード済み）のファイルリスト

すでにサーバに保存済みの添付ファイルを参照する場合の一覧。アップロード前との違いはファイル名が `<a>` リンクになり、アイコンがダウンロードアイコン（`fa-solid fa-download`、`imds-file-upload-download-icon`）になる点。

```html
<div class="imds-file-upload-list">
  <table>
    <tbody>
      <tr>
        <td>
          <a href="#" title="sample-file-1.xlsx">
            <span class="imds-icon is-gray-light imds-file-upload-download-icon"><i class="fa-solid fa-download"></i></span>
            <span class="imds-file-upload-name">sample-file-1.xlsx</span>
          </a>
        </td>
        <td class="imds-file-upload-date"><span>2024/06/04 17:23:34</span></td>
        <td class="imds-file-upload-size"><span>100KB</span></td>
        <td>
          <button type="button" class="imds-button is-ghost" title="削除">
            <span class="imds-icon"><i class="fa-regular fa-circle-xmark"></i></span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## 実装上の注意

- `input[type="file"]` はドロップ領域内に配置し、CSS で非表示にしてボタンクリックやドラッグ＆ドロップで操作する
- ファイル選択ボタンのクリック時に JavaScript で `input[type="file"]` の `click()` を呼び出す必要がある
- アップロード済みファイルのリスト表示は `imds-file-upload-list` > `table` > `tbody` > `tr` の構造で実装する（JavaScript で行を動的生成する場合もこの構造に従う）
- アップロード前は `imds-file-upload-file-icon`（ファイルアイコン・非リンク）、アップロード済み参照時は `imds-file-upload-download-icon`（ダウンロードアイコン・`<a>` リンク）を使い分ける
- 削除ボタンは `imds-button is-ghost` + `title="削除"` + `fa-regular fa-circle-xmark` を使用する
- `is-small` 使用時はボタンサイズも `is-x-small` に変更し、メッセージも短縮する
