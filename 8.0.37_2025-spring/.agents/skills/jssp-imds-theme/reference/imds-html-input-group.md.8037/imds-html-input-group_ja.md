# InputGroup

## 基本情報

InputGroup は、複数の入力要素やボタンを横並びに結合して表示するコンテナです。
Textbox、Select、Popover、IconButton 等を組み合わせて、検索欄やソート欄などを構成できます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-inputgroup--documentation
- 基本クラス: imds-input-group

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-input-group | div 要素 | 入力グループコンテナ | 必須 |

## HTML スニペット

### 基本入力グループ（Popover + Textbox + IconButton）

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="imds-popover-:r1:"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <input
    type="search"
    placeholder="検索"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

## 組み合わせ例

### 検索欄（Textbox + Popover + IconButton）

Popover 内にメニューを配置し、検索条件を切り替える例。

```html
<div class="imds-input-group">
  <input
    type="search"
    placeholder="検索"
    class="imds-textbox"
    value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="imds-popover-:r1:"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a><span>Menu 1</span></a></li>
            <li><a><span>Menu 2</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### 検索欄（Select + Textbox + IconButton）

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>すべて</option>
    <option>名称</option>
    <option>備考</option>
  </select>
  <input
    type="search"
    placeholder="検索"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### ソート（IconButton + Select）

```html
<div class="imds-input-group">
  <button
    type="button"
    class="imds-button"
    title="降順に並び替える">
    <span class="imds-icon is-small"><i class="fa-solid fa-arrow-down-short-wide"></i></span>
  </button>
  <select class="imds-select">
    <option>おすすめ順</option>
    <option>価格順</option>
    <option>販売数順</option>
  </select>
</div>
```

### Textbox + IconButton

```html
<div class="imds-input-group">
  <input
    type="search"
    placeholder="検索"
    class="imds-textbox"
    value="" />
  <button
    type="button"
    class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

### Select + TextboxControl

`imds-textbox-control` を使用してテキストボックス内にアイコンを配置する例。

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
  </select>
  <div class="imds-textbox-control is-left">
    <input
      type="search"
      placeholder="検索"
      class="imds-textbox"
      value="" />
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </div>
</div>
```

## UI パターン（要素の組み合わせ）

InputGroup は配置する要素の順序を変えることで、様々なレイアウトを構成できる。代表的な組み合わせパターンを以下に示す。

### Popover 先頭（Popover + Textbox）

Popover を先頭に配置し、検索条件を選んでから検索語を入力させるパターン。

```html
<div class="imds-input-group">
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r0:"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="imds-popover-:r0:" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <input type="search" placeholder="検索" class="imds-textbox" value="" />
</div>
```

### Textbox 先頭（Textbox + Popover）

Textbox を先頭に配置し、検索語を入力してから絞り込み条件を Popover で指定させるパターン。

```html
<div class="imds-input-group">
  <input type="search" placeholder="検索" class="imds-textbox" value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="imds-popover-:r1:" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
</div>
```

いずれの順序も正当なパターンであり、UI 上の意味（先に条件を選ばせたいか、先に語を入力させたいか）に応じて使い分ける。

### Select + Textbox（2要素、ボタンなし）

検索対象の切替のみを行い、実行ボタンを持たない（入力と同時に絞り込む）シンプルな2要素構成。

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
    <option>Select-3</option>
  </select>
  <input type="search" placeholder="検索" class="imds-textbox" value="" />
</div>
```

### Select + Textbox + Popover + Button（4要素）

検索対象の Select、検索語の Textbox、詳細条件の Popover、検索実行の Button を組み合わせた最大構成。

```html
<div class="imds-input-group">
  <select class="imds-select">
    <option>Select-1</option>
    <option>Select-2</option>
    <option>Select-3</option>
  </select>
  <input type="search" placeholder="検索" class="imds-textbox" value="" />
  <div class="imds-popover">
    <button
      aria-haspopup="true"
      aria-controls="imds-popover-:r2:"
      class="imds-button is-outlined">
      <span>popover</span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="imds-popover-:r2:" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">contents</div>
    </div>
  </div>
  <button type="button" class="imds-button">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

## 実装上の注意

- `imds-input-group` 内の要素は自動的に横並びに結合される
- Popover の `id` / `aria-controls` は一意の値に置き換えること（`:r1:` はプレースホルダー）
- Popover の開閉は JavaScript で制御する必要がある
- アイコンのみのボタンには `title` 属性または `aria-label` を付与してアクセシビリティを確保する
- 配置する要素の順序を変えることで、レイアウトを自由に構成できる（例: Popover + Textbox、Textbox + Popover、Select + Textbox、Select + Textbox + Popover + Button）
