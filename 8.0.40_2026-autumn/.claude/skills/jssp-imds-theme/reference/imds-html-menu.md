---
paths:
  - "src/main/jssp/**/*.html"
---

# Menu

## 基本情報

Menu は、機能選択や画面遷移のアクションをリスト形式でメニュー化する部品です。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/story/components-menu--default
- 基本クラス: imds-menu

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-menu | nav 要素 | メニューコンテナ | 必須 |
| imds-menu-title | div 要素 | メニューのタイトル | オプション |
| imds-menu-list | ul 要素 | メニューリスト | 必須 |
| imds-menu-list-item-additional | span 要素 | メニュー項目の追加情報領域（タグ等） | オプション |
| is-borderless | imds-menu | 区切り線なし | オプション |
| is-last-child-borderless | imds-menu | 最後の項目の区切り線なし | オプション |
| is-small | imds-menu | 小サイズ | オプション |
| is-normal | imds-menu | 標準サイズ | オプション |
| is-medium | imds-menu | 中サイズ | オプション |
| is-large | imds-menu | 大サイズ | オプション |
| is-disabled | li 要素 | 項目を無効化 | オプション |
| is-active | li 要素 | 項目をアクティブ表示 | オプション |
| has-text-right | imds-menu-list-item-additional | 追加情報を右寄せ | オプション |

## HTML スニペット

### 基本メニュー

```html
<nav class="imds-menu">
  <div class="imds-menu-title">Menu List</div>
  <ul class="imds-menu-list">
    <li><a><span>Menu 1</span></a></li>
    <li><a><span>Menu 2</span></a></li>
    <li><a><span>Menu 3</span></a></li>
  </ul>
</nav>
```

以降は基本メニューからの差分のみを示す。

## バリエーション

### lineStyle（区切り線スタイル）

`nav.imds-menu` にクラスを付与する。

```html
<nav class="imds-menu is-borderless">            <!-- 区切り線なし -->
<nav class="imds-menu is-last-child-borderless">  <!-- 最後の項目の区切り線なし -->
```

### size（サイズ）

`nav.imds-menu` にサイズクラスを付与する。

```html
<nav class="imds-menu is-small">   <!-- 小 -->
<nav class="imds-menu is-normal">  <!-- 標準 -->
<nav class="imds-menu is-medium">  <!-- 中 -->
<nav class="imds-menu is-large">   <!-- 大 -->
```

### disabled（無効化状態）

`li` 要素に `is-disabled` を付与する。

```html
<li class="is-disabled">
  <a><span>Menu 2</span></a>
</li>
```

### active（アクティブ状態）

`li` 要素に `is-active` を付与する。

```html
<li class="is-active">
  <a><span>Menu 2</span></a>
</li>
```

## 組み合わせ例

### Tag との組み合わせ

`imds-menu-list-item-additional` でタグ等の追加情報を配置する。`has-text-right` で右寄せにできる。

```html
<li>
  <a>
    <span>Menu 2</span>
    <span class="imds-menu-list-item-additional">
      <span class="imds-tag is-small is-green"><span>Tag</span></span>
    </span>
  </a>
</li>

<!-- 右寄せ -->
<li>
  <a>
    <span>Menu 2</span>
    <span class="imds-menu-list-item-additional has-text-right">
      <span class="imds-tag is-small is-green"><span>Tag</span></span>
    </span>
  </a>
</li>
```

### Icon との組み合わせ

`<a>` 内の `imds-icon` の配置順でアイコンの左右を制御する。

```html
<!-- 左側 -->
<li>
  <a>
    <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
    <span>Menu 1</span>
  </a>
</li>

<!-- 右側 -->
<li>
  <a>
    <span>Menu 1</span>
    <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
  </a>
</li>
```

### Accordion との組み合わせ

`imds-accordion-content` 内に `imds-menu` を配置する。
サイドメニュー等で使用する。`is-last-child-borderless` を付与すると最後の項目の区切り線が消える。

```html
<div class="imds-accordion-group">
  <div class="imds-accordion">
    <input
      type="checkbox"
      id="todo-replace-:r1:" />
    <label
      for="todo-replace-:r1:"
      class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>Accordion Title 1</span>
        <span class="imds-accordion-caption">Caption</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content">
      <nav class="imds-menu is-last-child-borderless">
        <ul class="imds-menu-list">
          <li><a><span>Menu 1</span></a></li>
          <li><a><span>Menu 2</span></a></li>
          <li><a><span>Menu 3</span></a></li>
        </ul>
      </nav>
    </div>
  </div>
  <!-- 同構造のアコーディオンを必要数繰り返す -->
</div>
```

## アクセシビリティ対応

### 子階層メニュー

- 子階層メニューは、ツリー構造が必要な目次やナビゲーションなどで使用する
- Menu 要素をリスト内にネストさせることで、階層的なメニューを作成できる
- ただし、階層が深くなるほどユーザの操作性が低下する可能性があるため、注意して設計する

### Popover 内での子階層

- 基本的に、Popover では子階層を持たない使用を推奨する
- Popover のコンテンツは表示領域が狭い場合が多く、常に表示される領域ではないなどの理由から、子階層のメニューは適していない
- MenuTitle を使用し、メニューのグルーピングを行う

## 実装上の注意

- `imds-menu-title` は省略可能。タイトル不要な場合は `imds-menu-list` のみ配置する
- Popover 内で使用する場合は `imds-popover-content` 内に配置する
- メニュー項目のリンク先は `<a>` の `href` 属性で指定する。JavaScript でハンドリングする場合は `href` を省略し、クリックイベントを設定する
