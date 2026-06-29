# Tabs

## 基本情報

Tabs は、複数の情報やコンテンツを切り替えて表示するための部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/story/components-tabs--default
- 基本クラス: imds-tabs

## 全体構造

```
imds-tabs                                 # タブコンテナ（サイズ・配置・スタイルを付与）
├── ul                                    # タブリスト
│   └── li.imds-tabs-tab                  # 各タブ（is-active / has-tab-close 等を付与）
│       ├── button                        # タブ本体（label + 任意で imds-icon）
│       └── button.is-tab-close-button    # 閉じるボタン（has-tab-close 時のみ）
└── imds-tabs-actions                     # 右側アクション領域（オプション）
    ├── label.imds-checkbox / button 等   # チェックボックス・ボタン等を配置
    └── ...
```

タブ切替時の表示コンテンツ（パネル）は `imds-tabs` の外側に別途配置し、JavaScript で表示制御する。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-tabs | div 要素 | タブコンテナ | 必須 |
| imds-tabs-tab | li 要素 | 各タブ項目 | 必須 |
| imds-tabs-actions | div 要素 | タブ右側のアクション領域 | オプション |
| is-active | imds-tabs-tab | アクティブ（選択中）タブ | オプション |
| is-bordered | imds-tabs | ボーダー付きスタイル | オプション |
| is-right | imds-tabs | 右寄せ | オプション |
| is-centered | imds-tabs | 中央寄せ | オプション |
| is-left | imds-tabs | 左寄せ（デフォルト） | オプション |
| is-full-width | imds-tabs | タブを均等幅で全幅表示 | オプション |
| is-x-small | imds-tabs | 極小サイズ | オプション |
| is-small | imds-tabs | 小サイズ | オプション |
| is-normal | imds-tabs | 標準サイズ | オプション |
| is-medium | imds-tabs | 中サイズ | オプション |
| is-large | imds-tabs | 大サイズ | オプション |
| has-tab-close | imds-tabs-tab | 閉じるボタン付きタブ | オプション |
| is-tab-close-button | button 要素 | タブ閉じるボタン | オプション |
| imds-line-clamp-1 | span 要素 | テキスト1行で省略 | オプション |
| imds-line-clamp-2 | span 要素 | テキスト2行で省略 | オプション |

## HTML スニペット

### 基本タブ

```html
<div class="imds-tabs">
  <ul>
    <li class="imds-tabs-tab is-active">
      <button><span>Tab1</span></button>
    </li>
    <li class="imds-tabs-tab">
      <button><span>Tab2</span></button>
    </li>
    <li class="imds-tabs-tab">
      <button><span>Tab3</span></button>
    </li>
  </ul>
</div>
```

以降は基本タブからの差分のみを示す。

## バリエーション

### tabsStyle（スタイル）

`div.imds-tabs` にスタイルクラスを付与する。

```html
<div class="imds-tabs is-bordered">  <!-- ボーダー付き -->
```

### position（配置）

`div.imds-tabs` に配置クラスを付与する。

```html
<div class="imds-tabs is-right">     <!-- 右寄せ -->
<div class="imds-tabs is-centered">  <!-- 中央寄せ -->
<div class="imds-tabs is-left">      <!-- 左寄せ -->
```

### fullWidth（均等幅）

`div.imds-tabs` に `is-full-width` を付与する。
タブが均等幅で全幅に広がる。

```html
<div class="imds-tabs is-full-width">
```

### size（サイズ）

`div.imds-tabs` にサイズクラスを付与する。

```html
<div class="imds-tabs is-x-small">  <!-- 極小 -->
<div class="imds-tabs is-small">    <!-- 小 -->
<div class="imds-tabs is-normal">   <!-- 標準 -->
<div class="imds-tabs is-medium">   <!-- 中 -->
<div class="imds-tabs is-large">    <!-- 大 -->
```

### disabled

タブの `button` に `disabled` 属性を付与する。

```html
<button disabled><span>disabled</span></button>
```

### lineClamp（テキスト省略）

長いラベルを省略表示する。
`span` に `imds-line-clamp-1`（1行）または `imds-line-clamp-2`（2行）を付与し、`button` に `title` で全文を設定する。
`span` の `style` で幅を制限する。

```html
<button title="長いタブ名の全文をここに記載">
  <span class="imds-line-clamp-1" style="width: 100px;">長いタブ名の全文をここに記載</span>
</button>
```

### closeButton（閉じるボタン）

`li` に `has-tab-close` を付与し、タブボタンの後に閉じるボタンを追加する。

```html
<li class="imds-tabs-tab is-active has-tab-close">
  <button><span>Tab1</span></button>
  <button
    title="閉じる"
    class="imds-button is-ghost is-tab-close-button">
    <span class="imds-icon is-x-small"><i class="fa-solid fa-xmark"></i></span>
  </button>
</li>
```

## 組み合わせ例

### Button との組み合わせ

`ul` の後に `imds-tabs-actions` を追加する。
チェックボックスやボタンなどを配置できる。

```html
<div class="imds-tabs">
  <ul>
    <!-- タブ項目 -->
  </ul>
  <div class="imds-tabs-actions">
    <label class="imds-checkbox">
      <input id="todo-replace-:r1:" type="checkbox" />
      <span>Checkbox</span>
    </label>
    <button type="button" class="imds-button is-primary">Button</button>
  </div>
</div>
```

### Icon との組み合わせ

`button` 内に `imds-icon` を追加する。
ラベルの前後どちらにも配置可能。

```html
<!-- アイコン左 -->
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-home"></i></span>
  <span>Tab1</span>
</button>

<!-- アイコン右 -->
<button>
  <span>Tab1</span>
  <span class="imds-icon is-small"><i class="fa-solid fa-home"></i></span>
</button>
```

## 実装上の注意

- タブは `ul > li` のリスト構造で記述する
- `is-active` は同時に1つのタブにのみ付与する
- タブ切替時のコンテンツ表示制御は JavaScript で実装する
- 閉じるボタンのクリックイベントは JavaScript で制御する（タブ削除処理）
- `imds-line-clamp-*` 使用時は `button` の `title` 属性に全文を設定し、ホバーで確認できるようにする
- `imds-tabs-actions` はタブリスト（`ul`）と同階層に配置する
