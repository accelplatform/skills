---
paths:
  - "src/main/jssp/**/*.html"
---

# 固定ヘッダーレイアウト（common-parts）

## 基本情報

画面全体を「ヘッダ・フッタは常に固定表示し、コンテンツ領域のみが縦スクロールする」構成にするための、ルートコンテナ・`<main>`・スクロール領域の CSS 設計パターン。
一覧画面・フォーム画面・ウィザード画面（エクスポート/インポート）等、ページ全体テンプレートの土台として使用する。

> **本プロジェクトでの使い分け:** 一覧画面テンプレート（`assets/imds-list-page.md`）・フォーム画面テンプレート（`assets/imds-form-page.md`）では、本ファイルのような機能ごとのプレースホルダー prefix（`cc-app-*` 等）ではなく、固定クラス名 `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` を使う。`height` は `100vh` ではなく `100%` を使うため、`<imart type="head">` に `im_design_system/theme/css/theme-conditional-layout.css` の読み込みが必須（無いと `.imds-container` の高さが確定せず、コンテンツ領域が高さ 0 に潰れる）。新規画面は `assets/imds-list-page.md` / `assets/imds-form-page.md` の指示に従うこと。本ファイルの `cc-app-*` prefix 方式は、それらのテンプレートで扱わない特殊なレイアウト（本パターンの応用が必要な独自画面）を作る場合の参考として残す。

- 抽出元: `uiux-share` 各 `layout/*.md` の CSS 定義（`layout/フォーム画面.md`「CSS」等）
- 対応コンポーネント: `imds-container` / `imds-header` / `imds-scrollbar`

## 全体構造

```
div.imds-container                    # 根 div（会被放置在 intra-mart 主题的 imui-container 内部，因此不附加 id，也不夹带中间包装层）
├── header.imds-header                # 固定显示（grid 第1行）
└── main（纵向 flex 容器）
    ├── section（滚动区域。附加 imds-scrollbar，flex:1 0 0; overflow:auto）
    └── div（页脚。固定显示，flex:0 0 auto。位于滚动区域之外）
```

## 根 div 统一为一个（不要制造中间包装层）

根据 `jssp-presentation-page.md` 的规约，展示页面的根标签不应附加 id（因为 intra-mart 的主题功能会自动用 `<div id="imui-container">` 包裹页面内容，若在画面侧再叠加一层 id，会形成多余的双重包装）。
另一方面，`imds-container` 是 imds 主题的 CSS 所依赖的类，同样应附加在相当于画面根节点的元素上。
**不增加中间包装层，直接在根 `<div>` 上附加 `class="imds-container ..."` 即可满足这两点要求。** 无需在 `<div>` 内部再嵌套一层 `<div class="imds-container">`。

```html
<!-- ✅ OK：直接在根 div 上附加 imds-container 类，不制造中间包装层 -->
<div class="imds-container cc-app-layout-container">
  <header class="imds-header">...</header>
  <main class="cc-app-layout-main">
    ...
  </main>
</div>

<!-- ❌ NG：将 imds-container 的 div 又嵌套了一层（多余的中间包装层） -->
<div>
  <div class="imds-container cc-app-layout-container">
    <header class="imds-header">...</header>
    <main class="cc-app-layout-main">...</main>
  </div>
</div>
```

`header` / `main` は `imds-container` の**直下**に並べる（`header` を `main` の内側に置かない、という既存ルールは変わらない）。

## CSS 設計

### コンテナ（2 行グリッド）

`imds-container` に付与するカスタムクラス（例では `cc-app-layout-container`。**クラス名は機能ごとに置き換える**、後述「プレースホルダ prefix」参照）で 2 行グリッドを定義する。

```css
.cc-app-layout-container {
  height: 100vh;                              /* ★ 100% ではなく 100vh を推奨（後述） */
  display: grid;
  grid-template-rows: 5rem minmax(0, 1fr);     /* 1行目: ヘッダ高さ固定 / 2行目: 残り全部 */
  grid-template-columns: 100%;
}
.cc-app-layout-container > .imds-header {
  grid-row: 1 / 2;
}
```

- 2 行目を `1fr` ではなく **`minmax(0, 1fr)`** にすること。`1fr` のみだと、内側のスクロール領域が `flex:1 0 0` で高さを確定できず、コンテンツ量に応じてグリッド行自体が伸びてしまい、結果的に画面全体がスクロールしてページ内スクロールが機能しなくなる
- `height` は **`100%` ではなく `100vh` を推奨する**。`100%` はプラットフォーム側テーマ（`<html>`/`<body>` 等、本スキルセットが制御できない外側の要素）が高さ 100% のチェーンを持っていない場合に `auto` 相当へフォールバックし、後述のスクロール領域が高さ 0 に潰れて非表示になる不具合が実装検証時に実際に発生した。`100vh` はビューポート基準のため、祖先要素の高さ設定に依存せず確実に解決される

### main（縦 flex コンテナ）

```css
.cc-app-layout-main {
  grid-row: 2 / 3;
  display: flex;
  flex-direction: column;
  height: 100%;    /* 親（グリッドの2行目）は minmax(0,1fr) で高さが確定済みのため、ここは 100% で問題ない */
}
```

`<main>` 自身は `grid-template-rows` の 2 行目に配置されるグリッドアイテムであり、親グリッドコンテナがすでに `height: 100vh` を起点に確定した高さを持つため、`height: 100%` は正しく解決される。

### スクロール領域

`imds-scrollbar` を付与する要素（スクロールバーの見た目を細くするユーティリティクラス。詳細は `reference/imds-helper-scrollbar.md`）を、実際のスクロール領域として扱う。

```css
.cc-app-step-panel {
  flex: 1 0 0;
  overflow: auto;
}
```

```html
<section class="cc-app-step-panel imds-py-6 imds-px-8 imds-scrollbar">
  <!-- スクロールさせたいコンテンツ -->
</section>
```

⚠️ **アンチパターン: `main` 自身に `overflow: auto` を付けない**。フッタごとスクロールしてしまい、L-5（フッタ固定）を満たせなくなる。`overflow: auto` は必ずスクロールさせたい子要素（`imds-scrollbar` を付与した要素）にのみ付与する。

⚠️ **アンチパターン: スクロール領域に `flex: 1 0 0` 以外の記述を混ぜない**。`flex-basis` を `auto` にしたい場合でも、`main` および `imds-container` の高さが上記の通り確定していれば `flex: 1 0 0`（`flex-basis: 0`）のままで問題なく機能する（`0` が問題になるのは、祖先の高さが確定していない場合に限る）。

### フッタ（スクロール対象外）

操作ボタン群は、スクロール領域の**外側**・`<main>` の**直下**に置き、`flex: 0 0 auto` で固定サイズにする。

```css
.cc-app-footer {
  flex: 0 0 auto;
}
```

```html
<main class="cc-app-layout-main">
  <section class="cc-app-step-panel imds-py-6 imds-px-8 imds-scrollbar">...</section>
  <div class="cc-app-footer imds-py-2 imds-px-8 imds-border-t-1">
    <button type="button" class="imds-button is-primary">登録</button>
  </div>
</main>
```

## プレースホルダ prefix の置換

このファイルの CSS クラス名（`cc-app-layout-container` / `cc-app-layout-main` / `cc-app-step-panel` / `cc-app-footer` 等）は例示のプレースホルダである。**生成時は機能名に応じた prefix に置き換えること**（例: 商品管理画面なら `product-layout-container` 等）。

| 種別 | 置換対象か |
|---|---|
| `cc-app-*` のようなプレースホルダ prefix のカスタムクラス | ✅ 置換する（機能ごとに固有の prefix にする） |
| `imds-*` で始まる imds 標準クラス（`imds-container` / `imds-header` / `imds-scrollbar` / `imds-py-*` / `imds-px-*` / `imds-border-t-1` 等） | ❌ 置換しない。imds のスタイルはこのクラス名に対して定義されているため、改名すると枠・余白・スクロールバー等のスタイルが一切当たらなくなる |

```html
<!-- ✅ OK：只替换自定义类为按功能划分的 prefix，imds- 类保持不变 -->
<div class="imds-container product-layout-container">
  <main class="product-layout-main">
    <section class="product-step-panel imds-py-6 imds-px-8 imds-scrollbar">…</section>
  </main>
</div>

<!-- ❌ NG：替换过度，把 imds 标准类也一并改写了 -->
<div class="product-container product-layout-container">
  <main class="product-layout-main">
    <section class="product-step-panel product-py-6 product-scrollbar">…</section>
  </main>
</div>
```

生成物に `cc-app-*` や `sample-*` のようなプレースホルダ prefix がそのまま残っていないか、最終確認すること。

## 実装後の確認（目視・実機）

CSS・DOM の実装だけでなく、実際にブラウザで画面を開いて以下を確認すること（自動検証では担保できない）。

1. 画面を縦スクロールしても、ヘッダー（および固定フッタがある場合はフッタ）が動かず常に表示されている
2. スクロールするのはコンテンツ領域のみで、ブラウザのウィンドウ自体はスクロールしない（二重スクロールになっていない）
3. コンテンツ領域のスクロールバーが細い表示になっている（`imds-scrollbar` の `scrollbar-width: thin` が効いている）

ウィンドウ高さを縮めた状態で特に 1〜2 を確認すること（高さに余裕がある状態では固定/非固定の違いが見た目に現れないため）。

## 実装上の注意

- 根 `<div class="imds-container ...">` 应整合为一个元素，不要在内部再嵌套 `imds-container`（不制造中间包装层）
- `grid-template-rows` の 2 行目は必ず `minmax(0, 1fr)` にする（`1fr` 単独ではスクロール領域の高さが確定しない）
- `imds-container` に付与する高さは `height: 100vh` を推奨する（`height: 100%` は祖先要素の高さ解決に依存し、環境によってスクロール領域が高さ 0 に潰れる不具合が実際に発生したため）
- `overflow: auto` は `main` 自身ではなく、`imds-scrollbar` を付与したスクロール対象の子要素にのみ付与する
- フッタ（操作ボタン群）は `<main>` 直下・スクロール領域の外に置き、`flex: 0 0 auto` で固定する
- カスタムクラスのプレースホルダ prefix（`cc-app-*` 等）は機能名に応じて置換するが、`imds-` で始まる標準クラスは名前を変えずそのまま使う
- レイアウトの単純化（ナビゲーションやスクロールが不要な極小画面等）で本パターンが過剰な場合は、`imds-container` に直接 `height: 100vh` 系のグリッドを組まず、`assets/imds-list-page.md` 等の簡易な縦積み構成を使ってもよい。ただしフッタ固定・部分スクロールが要件にある画面では本パターンを使用すること
