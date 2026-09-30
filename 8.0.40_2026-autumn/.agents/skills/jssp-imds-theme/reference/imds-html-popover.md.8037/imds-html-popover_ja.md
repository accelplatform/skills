# Popover

## 基本情報

Popover は、ページ内での補助的な（主要ではない）情報やアクションを、パネル上に表示する際に使用する部品です。
クリックまたはホバーすることでパネルが表示され、ページ上の他のすべての要素よりも前面に表示されます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-popover--documentation
- 基本クラス: imds-popover

## 全体構造

```
imds-popover                              # コンテナ（is-right / is-left / is-top / is-hoverable / is-active を付与）
├── button.imds-button                    # トリガーボタン（is-outlined / is-ghost 等、複数の正当なバリエーションあり）
│   │                                     #   属性: aria-haspopup="true" / aria-controls="<panel-id>"
│   ├── span                              # ラベル（アイコンのみトリガーの場合は省略可）
│   └── imds-icon (fa-chevron-down 等)    # 開閉インジケータアイコン（省略可）
└── imds-popover-menu (id=<panel-id>, role="menu") # パネル本体
    └── imds-popover-content              # コンテンツ領域
        └── （任意のコンテンツ / メニュー項目 / アクション等）
```

`button` の `aria-controls` と `imds-popover-menu` の `id` を **必ず一致** させる。開閉制御は JavaScript（`is-hoverable` 時は CSS のみで動作）。開いた状態は `div.imds-popover` に `is-active` クラスを付与して表す（JavaScript で `classList.toggle('is-active')` するのが実DOMでの標準パターン）。

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-popover | div 要素 | ポップオーバーコンテナ | 必須 |
| imds-popover-menu | div 要素 | ポップオーバーメニュー（パネル） | 必須 |
| imds-popover-content | div 要素 | パネル内のコンテンツ領域 | 必須 |
| is-right | imds-popover | 右寄せ表示 | オプション |
| is-left | imds-popover | 左寄せ表示 | オプション |
| is-top | imds-popover | 上方向表示 | オプション |
| is-hoverable | imds-popover | ホバーで開閉 | オプション |
| is-active | imds-popover | 開閉状態（開いている）を表す | オプション（JS で開閉時に付け外しする） |
| is-applied | トリガーボタン | 適用済みスタイル | オプション |
| is-ghost | トリガーボタン（`imds-button`） | 枠線なしトリガー（アイコンのみ等） | オプション |
| role="menu" | imds-popover-menu | パネルのロール | 必須 |

## HTML スニペット

### 基本ポップオーバー

```html
<div class="imds-popover">
  <button
    aria-haspopup="true"
    aria-controls="imds-popover-:r1:"
    class="imds-button is-outlined">
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  <div
    id="imds-popover-:r1:"
    role="menu"
    class="imds-popover-menu">
    <div class="imds-popover-content"><div>Contents</div></div>
  </div>
</div>
```

以降は基本ポップオーバーからの差分のみを示す。

## バリエーション

### isApplied（適用済み状態）

トリガーボタンに `is-applied` を追加する。

```html
<button ... class="imds-button is-outlined is-applied">
```

### disabled（無効化状態）

コンテナに `aria-disabled="true"`、ボタンに `disabled` を付与する。

```html
<div class="imds-popover" aria-disabled="true">
  <button ... class="imds-button is-outlined" disabled>
```

### position（コンテンツの表示位置）

`div.imds-popover` に位置クラスを付与する。組み合わせも可能。

```html
<div class="imds-popover is-right">       <!-- 右寄せ -->
<div class="imds-popover is-left">        <!-- 左寄せ -->
<div class="imds-popover is-top">         <!-- 上方向 -->
<div class="imds-popover is-top is-left"> <!-- 上方向 + 左寄せ -->
```

### hoverable（ホバー時、コンテンツ自動表示）

`div.imds-popover` に `is-hoverable` を付与すると、ホバー操作でコンテンツが表示される。

```html
<div class="imds-popover is-hoverable">
```

### トリガーボタンのバリエーション

トリガーボタンは `imds-button is-outlined` + `fa-chevron-down` に固定されているわけではない。用途に応じて複数の正当なパターンがある。

```html
<!-- ラベル + シェブロン（標準） -->
<button aria-haspopup="true" aria-controls="imds-popover-:r1:" class="imds-button is-outlined">
  <span>Popover</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>

<!-- アイコンのみ・is-ghost（ヘッダーナビ等でよく使われる） -->
<button type="button" class="imds-button is-ghost is-large" aria-haspopup="true" aria-controls="imds-popover-:r6:">
  <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
  <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
</button>

<!-- 省略メニュー（ellipsis）・アイコンのみ、開閉インジケータなし -->
<button class="imds-button is-ghost" title="その他の操作" aria-haspopup="true" aria-controls="imds-popover-:r8:">
  <span class="imds-icon is-small is-gray"><i class="fa-solid fa-ellipsis"></i></span>
</button>

<!-- 適用済み（Applied）: アイコン + ラベル + is-applied、開いている間は is-active -->
<div class="imds-popover is-active">
  <button aria-haspopup="true" aria-controls="imds-popover-:r0:" class="imds-button is-outlined is-applied">
    <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  ...
</div>
```

- ラベル付きトリガーは `fa-chevron-down` または `fa-caret-down` のいずれも使用実績がある
- アイコンのみのトリガー（`is-ghost`）では開閉インジケータアイコンを省略してよい。その場合は `title` 属性でボタンの意味を補う

### ネストしたメニュー（子階層）

Popover の中身に `nav.imds-menu` を配置し、`li` の中に `ul.imds-menu-list` をネストさせることで階層メニューを作成できる。階層が深くなるほど操作性が低下するため必要な場合のみ使用する。

```html
<div class="imds-popover-content">
  <nav class="imds-menu is-borderless">
    <div class="imds-menu-title">Menu Title</div>
    <ul class="imds-menu-list">
      <li>
        <a><span>Menu 1</span></a>
        <ul class="imds-menu-list">
          <li>
            <a><span>Menu 1-1</span></a>
            <ul class="imds-menu-list"></ul>
          </li>
        </ul>
      </li>
      <li>
        <a><span>Menu 2</span></a>
        <ul class="imds-menu-list"></ul>
      </li>
    </ul>
  </nav>
</div>
```

## 実装上の注意

- トリガーボタンの `aria-controls` とパネルの `id` を一致させること（`:r1:` は一意の値に置き換える）
- パネルの開閉制御は JavaScript で実装する必要がある（`is-hoverable` の場合は CSS のみで動作）。開閉は `div.imds-popover` への `is-active` クラスの付け外しで表現するのが標準実装であり、ドキュメント外クリックで `is-active` を除去する
- `aria-haspopup="true"` をトリガーボタンに必ず付与する。パネル本体には `role="menu"` を必ず付与する
- トリガーボタンの見た目は `imds-button is-outlined` + `fa-chevron-down` に限らない。`is-ghost`（アイコンのみ）や `fa-caret-down` を使う例も実DOMに存在する正当なバリエーション。用途（ラベル有無・設置場所）に応じて選択する
- disabled 時はボタンの `disabled` 属性に加え、コンテナに `aria-disabled="true"` も付与する
- メニュー項目が多い場合は `nav.imds-menu` + `ul.imds-menu-list` を使用し、必要であれば `li` 内に `ul.imds-menu-list` をネストして階層メニューを構成できる
