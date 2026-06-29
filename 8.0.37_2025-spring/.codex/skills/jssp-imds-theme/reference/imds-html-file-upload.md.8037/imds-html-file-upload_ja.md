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

アップロード済みファイルのリスト表示は `imds-file-upload` の外側に、別途 JavaScript で構築する。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-file-upload | 外側 div | ファイルアップロードコンテナ | 必須 |
| imds-file-upload-drop-area | div 要素 | ドラッグ＆ドロップ領域 | 必須 |
| imds-file-upload-message | p 要素 | メインメッセージ | 必須 |
| imds-file-upload-text | p 要素 | 補足テキスト（「または」等） | オプション |
| is-small | imds-file-upload | 小サイズ表示 | オプション |

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

## 実装上の注意

- `input[type="file"]` はドロップ領域内に配置し、CSS で非表示にしてボタンクリックやドラッグ＆ドロップで操作する
- ファイル選択ボタンのクリック時に JavaScript で `input[type="file"]` の `click()` を呼び出す必要がある
- アップロード済みファイルのリスト表示は別途 JavaScript で実装する
- `is-small` 使用時はボタンサイズも `is-x-small` に変更し、メッセージも短縮する
