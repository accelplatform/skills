---
paths:
  - "src/main/jssp/**/*.html"
---

# Header

## 基本情報

Header は、ページ上部のエリアを表示する部品です。
ユーザはこのエリアを通じて、画面遷移、ページ情報の参照、ページに対するコントロールを行うことができます。

- 抽出元URL: https://document.intra-mart.jp/design/?path=/docs/components-header--documentation
- 基本クラス: imds-header

## CSS Classes Reference

| クラス名 | 付与先 | 用途 | 必須/オプション |
|----------|--------|------|----------------|
| imds-header | header 要素 | ヘッダコンテナ | 必須 |
| imds-header-back-button | div 要素 | 戻るボタン領域 | オプション |
| imds-header-icon | div 要素 | アイコン領域 | オプション |
| imds-header-nav | div 要素 | ドロップダウンメニュー付きナビゲーション | オプション |
| imds-header-title | div 要素 | タイトル領域（h1 + p） | 必須 |
| imds-header-additional | div 要素 | 装飾タグ等の追加情報領域 | オプション |
| imds-header-actions | div 要素 | アクションボタン領域 | オプション |
| imds-header-reload-button | div 要素 | リロードボタン領域 | オプション |
| imds-icon-wrapper | span 要素 | アイコンの外側ラッパー | オプション |

## HTML スニペット

### 基本ヘッダ

```html
<header class="imds-header">
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p>サブタイトル</p>
    <h1>画面名</h1>
  </div>
</header>
```

以降は基本ヘッダからの差分のみを示す。

## バリエーション

バリエーションは「基本ヘッダ（アイコン + サブタイトル + タイトル）」からの差分を示す。
「サブタイトルなし」「アイコン省略（タイトルのみ）」は uiux-share の実DOM（`Title Only` ストーリー等）に存在する正式なバリエーションであり、それ自体は非推奨ではない。ただし本スキルの `SKILL.md` には別途「ヘッダ先頭に `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれか 1 つを必須とする」という運用ルールがあり、JSSP プロジェクトの業務画面ではそちらを優先する（詳細は各バリエーションの注記を参照）。

### icon（アイコン種類の変更）

`imds-header-icon` 内のアイコンクラスを変更する。Font-Awesome 6 のアイコンも使用可能。
画面内容に合うアイコンを選定する（一覧 → `fa-clipboard-list`、棚卸 → `fa-warehouse`、設定 → `fa-gear` など）。

```html
<span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
<span class="imds-icon is-medium"><i class="imds-iconfont imds-app-accel-studio"></i></span>
<span class="imds-icon is-medium"><i class="imds-iconfont imds-app-logic-designer"></i></span>
<span class="imds-icon is-medium"><i class="fa-regular fa-file"></i></span>
```

### backItemExists（戻るボタン: 編集・詳細画面など）

詳細画面・編集画面のように、一覧へ戻る導線が必要な画面では `imds-header-back-button` を配置する。`imds-header-back-button` はアイコン領域（`imds-header-icon` または `imds-header-nav`）と**併用可能**であり、back-button を置いた代わりにアイコン領域を削除してはならない（両者は排他ではない。意図的にアイコンを省略している画面の例外については「タイトルのみ」バリエーションの注記を参照）。

```html
<header class="imds-header">
  <div class="imds-header-back-button">
    <button type="button" class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title"><p>機能（製品）名</p><h1>画面名</h1></div>
</header>
```

### reloadItemExists（リロードボタン: ダッシュボード等）

`imds-header-reload-button` は、**ページ全体の再読み込みが必要な画面にのみ**配置する。一覧データの再取得のみが目的の場合は、ヘッダではなくコンテンツ側（一覧テーブル周辺）にボタンを置くこと。ヘッダに置くリロードボタンはページ全体の再読み込みであることが確定しているため、`title` は必ず「ページを再読み込み」を使用する。配置位置は `imds-header-actions` の**後**（ヘッダの最後尾）。

```html
<div class="imds-header-reload-button">
  <button type="button" class="imds-button is-ghost is-large" title="ページを再読み込み">
    <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
  </button>
</div>
```

### サブタイトルなし

`imds-header-title` 内の `<p>` を省略し、`<h1>` のみを配置する。uiux-share にも存在する正規のバリエーションであり、それ自体が非推奨というわけではない。
`$subTitle` バインドが定義されている場合はそれを `<p>` として出力するのが基本形だが、サブタイトルに相当する情報が無い画面ではこのバリエーションを使用してよい。

```html
<div class="imds-header-title"><h1>画面名</h1></div>
```

### タイトルのみ（Title Only / アイコン省略）

`imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれも配置せず、`imds-header-title` のみのシンプルな構成。uiux-share の `Title Only` ストーリーに存在する正規のバリエーションである。

```html
<header class="imds-header">
  <div class="imds-header-title">
    <p>機能（製品）名</p>
    <h1>画面名</h1>
  </div>
</header>
```

> **注記（SKILL.md との整合）**: 本スキルの `SKILL.md` では JSSP の業務画面向け運用ルールとして「ヘッダ先頭に `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれか 1 つを必須とする」と定めている（本ファイルの担当外・変更不可）。コンポーネント単体としてはタイトルのみの構成も正当だが、本プロジェクトの業務画面を生成する際は `SKILL.md` の運用ルールに従い、上記 3 つのいずれかを配置すること。

## 組み合わせ例

### Popover との組み合わせ

`imds-header-icon` の代わりに `imds-popover` + `imds-header-nav` を配置する。

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-:r1:">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-:r1:" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a><span>関連画面-1</span></a></li>
            <li><a><span>関連画面-2</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p>サブタイトル</p>
    <h1>画面名</h1>
  </div>
</header>
```

### Tag との組み合わせ

`imds-header-title` の後に `imds-header-additional` を配置する。

```html
<div class="imds-header-additional">
  <span class="imds-tag is-green"><span>Tag</span></span>
</div>
```

### Button との組み合わせ

`imds-header-title` の後に `imds-header-actions` を配置する。
複数ボタンを並べられる。

```html
<div class="imds-header-actions">
  <button class="imds-button is-primary" type="button">
    <span class="imds-icon"><i class="fa-solid fa-gear"></i></span>
    <span>ログ出力対象設定</span>
  </button>
  <button class="imds-button is-outlined" type="button">
    <span class="imds-icon"><i class="imds-iconfont imds-file-export"></i></span>
    <span class="imds-button-text">エクスポート</span>
  </button>
</div>
```

⚠️ **`imds-header-actions` に「新規登録」「追加」「登録」等のデータ操作ボタンを置かない**（UI チームのデザインルール）。
ヘッダに置いてよいのは **「設定」「エクスポート」「ログ出力対象設定」など、一覧データそのものを増減しないページレベルのメタ操作** に限る。
「新規登録」「追加」「一括取込」など、一覧の業務データを増減・編集するアクションは **一覧テーブルの直上に右寄せ** で配置する（例は `assets/imds-list-page.md` 参照）。

## 実装上の注意

- **本プロジェクト（JSSP 業務画面）では、`SKILL.md` の運用ルールに従いヘッダの先頭要素に `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれかを配置することを基本とする**（`SKILL.md` 側の既存ルール）:
  - 一般的なページ → `imds-header-icon`（画面内容を表す Font Awesome アイコン）
  - 編集画面・詳細画面など、戻る導線が必要 → `imds-header-back-button`（`imds-header-icon` / `imds-header-nav` と併用可能。back-button を置いてもアイコン領域は削除しない。「backItemExists」バリエーション参照）
  - 関連画面切替メニューが必要 → `imds-header-nav`（Popover と組み合わせ。`imds-header-icon` とは排他）

  なお、コンポーネント単体としては、いずれも配置せず `imds-header-title` のみとする「タイトルのみ」構成も uiux-share 上の正規パターンとして存在する（詳細は「タイトルのみ（Title Only / アイコン省略）」バリエーションを参照）。アイコン種類の選定は画面内容に応じて Font Awesome 6 から選ぶこと（`fa-clipboard-list`, `fa-warehouse`, `fa-box`, `fa-location-dot`, `fa-chart-column`, `fa-gear` 等）。

- **`imds-header-title` の中身は「`<p>サブタイトル</p>` + `<h1>タイトル</h1>`」の 2 段構成が基本形**（「サブタイトルなし」バリエーションの場合は `<p>` を省略）。リファレンス基本スニペットに従い、上段 `<p>` にアプリ名/モジュール名（例: 「社内備品貸出システム」「備品マスタ」）、下段 `<h1>` に画面名（例: 「保管場所管理」「承認一覧」）を配置する。両方ともファンクションコンテナの `$subTitle` / `$title` バインドから `<imart type="string" value=$subTitle ...>` で出力すること（HTML 直書きしない）。

- **`<header class="imds-header">` は `<main>` の外側に配置すること**。imds テーマの CSS は `<div class="imds-container">` の直下に置かれた `<header>` を前提にスタイル（アイコン位置・余白等）を当てているため、`<main>` の内側に置くとレイアウトが崩れ、`imds-header-icon` のアイコンが表示されない等の不具合が起きる。**ルートの `<div>` は 1 つに統合し、内側にさらに `imds-container` の `<div>` を入れ子にする中間ラッパーを作らないこと**（`jssp-presentation-page.md` の規約により、intra-mart のテーマ機能が `<div id="imui-container">` で画面内容を自動的に包むため、ルートタグに id は付与せず `imds-container` クラスのみを付与する）。
  ```html
  <!-- OK -->
  <div class="imds-container">
    <header class="imds-header">...</header>   <!-- main の外側 -->
    <main>
      ...
    </main>
  </div>

  <!-- NG（中間ラッパー: imds-container の div を入れ子にしている） -->
  <div>
    <div class="imds-container">
      <header class="imds-header">...</header>
      <main>...</main>
    </div>
  </div>
  ```
  ※ `jssp-accessibility.md` の「プレゼンテーションページに `<header>` を追加してはならない」はプラットフォームのグローバルヘッダとの重複を避ける主旨であり、imds の `<header class="imds-header">`（ページ内ヘッダ）はこの規則の対象外。
- 「ページヘッダ」を表すのに `imds-page-header` / `imds-page-header-title` / `imds-page-header-actions` といったクラス名を使ってはならない（リファレンスに存在しない架空のクラス。CSS が当たらず崩れる）。正しくは `imds-header` / `imds-header-title` / `imds-header-actions`。
- ヘッダ内の配置順序: `imds-header-back-button` → `imds-header-icon` / `imds-header-nav` → `imds-header-title` → `imds-header-additional` → `imds-header-actions` → `imds-header-reload-button`（**`imds-header-actions` が `imds-header-reload-button` より先**）
- アイコン領域の排他関係は要素の組み合わせによって異なる。まとめて「3 つとも排他」と扱わないこと。
  - `imds-header-icon` と `imds-header-nav` は排他（同時に配置しない。アイコン領域はどちらか一方）
  - `imds-header-back-button` は `imds-header-icon` / `imds-header-nav` と**併用可能**（back-button を置いてもアイコン領域は消さない。詳細は「backItemExists」バリエーションを参照）
  - `imds-header-back-button` と `imds-header-nav` の併用パターンは本リファレンスでは扱わない。従来通り排他として扱う
- ドロップダウンメニューの `id` / `aria-controls` は一意の値に置き換えること（`:r1:` はプレースホルダー）
- ドロップダウンメニューの開閉は JavaScript で制御する必要がある
