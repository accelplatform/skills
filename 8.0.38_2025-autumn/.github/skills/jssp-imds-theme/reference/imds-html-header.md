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
| imds-header-icon | div 要素 | アイコン領域 | オプション |
| imds-header-title | div 要素 | タイトル領域（h1 + p） | 必須 |
| imds-header-back-button | div 要素 | 戻るボタン領域 | オプション |
| imds-header-reload-button | div 要素 | リロードボタン領域 | オプション |
| imds-header-nav | div 要素 | ドロップダウンメニュー付きナビゲーション | オプション |
| imds-header-additional | div 要素 | 装飾タグ等の追加情報領域 | オプション |
| imds-header-actions | div 要素 | アクションボタン領域 | オプション |
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
推奨度の高い順に並べているため、上から検討すること。後半の「非推奨」項目は、基本構造から要素を **省略する** パターンであり、業務画面では原則として採用しない。

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

詳細画面・編集画面のように、一覧へ戻る導線が必要な画面では、`imds-header-icon` の **代わりに** `imds-header-back-button` を配置する（両方は排他で同時配置不可）。

```html
<div class="imds-header-back-button">
  <button type="button" class="imds-button is-ghost is-large">
    <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
  </button>
</div>
```

### reloadItemExists（リロードボタン: ダッシュボード等）

`imds-header-title` の **後** に `imds-header-reload-button` を配置する（`imds-header-icon` と併用可）。

```html
<div class="imds-header-reload-button">
  <button type="button" class="imds-button is-ghost is-large">
    <span class="imds-icon is-small"><i class="fa-solid fa-rotate-right"></i></span>
  </button>
</div>
```

### サブタイトルなし（非推奨: 業務画面では避ける）

⚠️ 一般的な業務画面では非推奨。デザイン上の特別な要求がある場合のみ採用すること。

`imds-header-title` 内の `<p>` を省略する。サブタイトルが無いとヘッダが間延びして見え、imds テーマのデザインを満たさない。
`$subTitle` バインドが定義済みであれば必ず `<p>` で出力すること。

```html
<div class="imds-header-title"><h1>画面名</h1></div>
```

### アイコン省略（非推奨: 業務画面では避ける）

⚠️ 一般的な業務画面では非推奨。`imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれも置かない構成は、ヘッダ左端が空白になり imds のヘッダデザインとして崩れる。
極めて限定的な特殊用途（外部埋め込み・印刷ビュー等）でのみ採用すること。

```html
<header class="imds-header">
  <div class="imds-header-title">
    <p>サブタイトル</p>
    <h1>画面名</h1>
  </div>
</header>
```

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

- **ヘッダの先頭要素は `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` のいずれかを必ず配置すること**。これらは排他的なので、画面に応じて 1 つを必ず付ける:
  - 一般的なページ → `imds-header-icon`（画面内容を表す Font Awesome アイコン）
  - 編集画面・詳細画面など、戻る導線が必要 → `imds-header-back-button`
  - 関連画面切替メニューが必要 → `imds-header-nav`（Popover と組み合わせ）

  どれも配置しないと、ヘッダのタイトル部分が左寄せのテキストのみになり、imds のヘッダデザインとして崩れる（実際に `imds-header-title` のみの実装で「アイコンが表示されない」という不具合が頻発）。アイコン種類の選定は画面内容に応じて Font Awesome 6 から選ぶこと（`fa-clipboard-list`, `fa-warehouse`, `fa-box`, `fa-location-dot`, `fa-chart-column`, `fa-gear` 等）。

- **`imds-header-title` の中身は「`<p>サブタイトル</p>` + `<h1>タイトル</h1>`」の 2 段構成にすること**（バリエーション「サブタイトルなし」の場合のみ `<p>` を省略可）。`<h1>` 単独で画面名直書きの実装は誤り。リファレンス基本スニペットに従い、上段 `<p>` にアプリ名/モジュール名（例: 「社内備品貸出システム」「備品マスタ」）、下段 `<h1>` に画面名（例: 「保管場所管理」「承認一覧」）を配置する。両方ともファンクションコンテナの `$subTitle` / `$title` バインドから `<imart type="string" value=$subTitle ...>` で出力すること（HTML 直書きしない）。

- **`<header class="imds-header">` は `<main>` の外側に配置すること**。imds テーマの CSS は `<div class="imds-container">` の直下に置かれた `<header>` を前提にスタイル（アイコン位置・余白等）を当てているため、`<main>` の内側に置くとレイアウトが崩れ、`imds-header-icon` のアイコンが表示されない等の不具合が起きる。
  ```html
  <!-- OK -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">...</header>   <!-- main の外側 -->
      <main>
        ...
      </main>
    </div>
  </div>
  ```
  ※ `jssp-accessibility.instructions.md` の「プレゼンテーションページに `<header>` を追加してはならない」はプラットフォームのグローバルヘッダとの重複を避ける主旨であり、imds の `<header class="imds-header">`（ページ内ヘッダ）はこの規則の対象外。
- 「ページヘッダ」を表すのに `imds-page-header` / `imds-page-header-title` / `imds-page-header-actions` といったクラス名を使ってはならない（リファレンスに存在しない架空のクラス。CSS が当たらず崩れる）。正しくは `imds-header` / `imds-header-title` / `imds-header-actions`。
- ヘッダ内の配置順序: `imds-header-back-button` / `imds-header-icon` / `imds-header-nav` → `imds-header-title` → `imds-header-additional` → `imds-header-reload-button` → `imds-header-actions`
- `imds-header-icon`、`imds-header-back-button`、`imds-header-nav` は排他的に使用する（同時に配置しない）
- ドロップダウンメニューの `id` / `aria-controls` は一意の値に置き換えること（`:r1:` はプレースホルダー）
- ドロップダウンメニューの開閉は JavaScript で制御する必要がある
