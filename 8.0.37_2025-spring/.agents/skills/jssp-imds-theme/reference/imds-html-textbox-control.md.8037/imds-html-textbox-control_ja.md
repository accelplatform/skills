# TextboxControl

## 基本情報

TextboxControl は、テキストボックス内にアイコンを配置する際に使用する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textboxcontrol--documentation
- 基本クラス: imds-textbox-control

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-textbox-control | div 要素 | テキストボックスコントロールコンテナ | 必須 |
| is-left | imds-textbox-control | アイコンを左側に配置 | オプション |
| is-right | imds-textbox-control | アイコンを右側に配置（デフォルト） | オプション |
| is-static | input.imds-textbox（内側） | 参照専用の静的表示状態（`readonly` と併用、Textbox 側のクラス） | オプション |
| is-x-small | input.imds-textbox（内側） | 極小サイズ | オプション |
| is-small | input.imds-textbox（内側） | 小サイズ | オプション |
| is-normal | input.imds-textbox（内側） | 標準サイズ | オプション |
| is-medium | input.imds-textbox（内側） | 中サイズ | オプション |
| is-large | input.imds-textbox（内側） | 大サイズ | オプション |

## HTML スニペット

### 基本テキストボックスコントロール

```html
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

以降は基本テキストボックスコントロールからの差分のみを示す。

## バリエーション

### iconPosition（アイコン位置）

`div.imds-textbox-control` に配置クラスを付与する。

```html
<div class="imds-textbox-control is-left">   <!-- アイコン左 -->
<div class="imds-textbox-control is-right">  <!-- アイコン右 -->
```

### is-static（参照専用の静的表示、内側の input に付与）

値は編集できないが、値の選択やコピーはできる参照専用状態。`input.imds-textbox` に `is-static` クラスと `readonly` 属性を付与する（コンテナの `imds-textbox-control` 自体には付与しない）。

```html
<div class="imds-textbox-control">
  <input
    type="text"
    class="imds-textbox is-static"
    readonly
    value="text" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

### size（サイズ、内側の input に付与）

`input.imds-textbox` にサイズクラスを付与する。アイコンのサイズは入力欄より一段階小さいクラスを指定するとバランスが取れる（`is-large` の入力欄には `is-medium` のアイコン等）。

```html
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox is-x-small" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox is-large" value="" />
  <span class="imds-icon is-medium"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

## 組み合わせ例

### シンプルな検索フィールド

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

### 検索アイコン＋クリアボタン

Field 内にテキストボックスコントロールとクリアボタンを配置する。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">カテゴリ</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" placeholder="カテゴリを選択" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### コンボボックス（自由入力＋選択肢表示）

Popover と組み合わせてドロップダウン選択を実現する。

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">カテゴリ</label></div>
  <div class="imds-field-control">
    <div class="imds-popover">
      <div class="imds-textbox-control">
        <input type="text" placeholder="カテゴリを選択" class="imds-textbox" readonly value="" />
        <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
      </div>
      <div id="imds-popover-todo-replace-:r1:" role="menu" class="imds-popover-menu">
        <div class="imds-popover-content">contents</div>
      </div>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### バリデーションエラー

`div.imds-field` に `imds-validation-error` を付与し、末尾にエラーメッセージを追加する。
検索アイコン型とコンボボックス型の両方に適用可能。

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
  <span class="imds-error-text">エラーメッセージをここに表示します。</span>
</div>
```

## アクセシビリティ対応

- アイコンは装飾目的で使用し、操作の意味はラベルやプレースホルダーで伝える

## 実装上の注意

- テキストボックスコントロールは `div.imds-textbox-control > input.imds-textbox + span.imds-icon` の構造で記述する
- アイコン位置のデフォルトは右側（`is-right` 省略可）
- `is-static` / サイズクラス（`is-x-small`〜`is-large`）は `imds-textbox-control` ではなく、内側の `input.imds-textbox` に付与する
- クリアボタンは `imds-field-control` 内に `imds-textbox-control` と並列で配置する
- コンボボックスは Popover（`imds-popover`）で `imds-textbox-control` をラップする
- バリデーションエラー時は `imds-field` に `imds-validation-error` を付与し、`imds-error-text` でメッセージを表示する
