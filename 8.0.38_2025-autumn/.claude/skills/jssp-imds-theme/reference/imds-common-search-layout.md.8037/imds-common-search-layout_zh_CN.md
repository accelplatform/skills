---
paths:
  - "src/main/jssp/**/*.html"
---

# 検索レイアウト（common-parts）

## 基本情報

一覧・確認テーブルに付随する検索部品／検索エリアの確立パターン集である。
検索 UX は「サーバサイド検索」か「クライアントフィルタ（リアルタイム絞り込み）」か、および検索条件の複雑さ・配置（上部／右側）で使い分ける。

- 抽出元: `uiux-share/common-parts/検索レイアウト.md`
- **① 上部・検索部品（キーワード＋詳細検索 Popover）**: キーワード検索を基本に、Popover で複合条件も指定。検索ボタン or Enter で実行（サーバサイド検索向け）。
- **② 右側・検索エリア**: 検索欄を常時表示し、結果を見ながら複合条件を指定。列数が少なくテーブル右に余地がある場合。
- **③ 上部・フィルタ（リアルタイム絞り込み）**: 入力に反応して即時にクライアントフィルタ。検索ボタンなし。`input[type=search]` のクリアボタンを使う。インポート確認テーブル・小規模一覧の絞り込みに最適。
- 一覧の検索（①詳細検索 / ②右側エリア / ③フィルタ絞り込み）、インポート確認テーブルの絞り込み（③フィルタ）、申請＋テーブル等で一覧検索を持つ場合に用いる。

## 構成コンポーネント

| 使用する基本コンポーネント | 対応 reference |
|---|---|
| TextboxControl（`imds-textbox-control`） | [imds-html-textbox-control.md](imds-html-textbox-control.md) |
| Textbox（`imds-textbox`） | [imds-html-textbox.md](imds-html-textbox.md) |
| InputGroup（`imds-input-group`） | [imds-html-input-group.md](imds-html-input-group.md) |
| Popover（`imds-popover`） | [imds-html-popover.md](imds-html-popover.md) |
| Button（`imds-button`） | [imds-html-button.md](imds-html-button.md) |
| Field / FieldContainer（`imds-field` / `imds-field-container`） | [imds-html-field.md](imds-html-field.md) |
| Checkbox（`imds-checkbox`） | [imds-html-checkbox.md](imds-html-checkbox.md) |

## 重要な注意（検索ボタンの色）

検索ボタンには **塗り（無条件）の `is-primary` を使わない**こと。理由は、多くの一覧画面には「新規作成」ボタン等の主要アクションが既に `is-primary` で存在しており、DESIGN.md の「主要アクションは1画面に1つ」原則に反するためである。
検索ボタンは以下のいずれかとする。

- 無色の `imds-button`（① の詳細検索 Popover 外トリガのように、装飾を持たない場合）
- `imds-button is-outlined is-primary`（Popover 内・検索エリア内の submit ボタン等、検索が主要なアクションであることを示したい場合のセカンダリ表現）

以降のスニペットは、①②とも `is-outlined` ベースで統一している（ソースの `検索レイアウト.md` では①のみ塗り `is-primary` になっていたが、上記原則に基づき本 reference では ② と同じ `is-outlined is-primary` に補正している）。

## 重要な注意（検索入力の `aria-label`）

可視ラベルを持たない検索入力（`placeholder` のみの入力欄）には、必ず `aria-label` を付与すること。`placeholder` はラベルの代替にはならない。以降のスニペットは①③とも `aria-label` を付与している。

## HTML スニペット

### ③ 上部・フィルタ（リアルタイム絞り込み）— 最頻出・最小構成

虫眼鏡アイコンは入力欄の内側左に出す（`imds-textbox-control is-left`）。架空の `imds-search` クラスは使わない。

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" placeholder="[REPLACE: キーワードで絞り込む]" aria-label="[REPLACE: キーワードで絞り込む]" id="[REPLACE: filter-keyword]" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

- 可視ラベルを持たない場合は `aria-label` を必ず付ける（placeholder だけでは不可）。
- `type="search"` を使い、入力値のクリア（×ボタン）ができること。
- 入力に反応してリアルタイムに絞り込む（入力が止まったタイミングで発火）。検索ボタンは置かない。
- 検索対象を限定したい場合はカテゴリ選択（`imds-select` 等）を左に併設してよい。

### ① 上部・検索部品（キーワード＋詳細検索 Popover ＋検索ボタン）

`imds-input-group` でキーワード入力・詳細検索 Popover トリガ・検索ボタンを横並びにする。

```html
<div class="imds-input-group">
  <input type="text" class="imds-textbox gx-search-width" value="" placeholder="[REPLACE: キーワード]" aria-label="[REPLACE: キーワード]" />
  <div class="imds-popover is-left">
    <button type="button" class="imds-button">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div id="[REPLACE: imds-popover-r0]" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <form class="imds-form imds-p-4">
          <div class="imds-field-container">
            <div class="imds-field">
              <div class="imds-field-label"><label for="[REPLACE: r1]">[REPLACE: 条件名]</label></div>
              <div class="imds-field-control">
                <input type="text" id="[REPLACE: r1]" class="imds-textbox" value="" />
              </div>
            </div>
            <div class="gx-search-button-area">
              <button type="button" class="imds-button">クリア</button>
              <button type="submit" class="imds-button is-outlined is-primary">検索</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
  <button type="button" class="imds-button" aria-label="[REPLACE: 検索]">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

- `form` の submit を利用し、Enter キーで検索が発火すること（Implicit Submission）。
- Popover 内ボタンは左にクリア（標準）・右に検索。検索ボタンは `is-outlined is-primary`（塗りの `is-primary` は使わない。理由は上記「重要な注意（検索ボタンの色）」を参照）。`imds-dialog`/`imds-confirm` と同じく右側優先。
- 詳細検索の条件は Popover を閉じても保持する。クリアで全条件クリア、検索ボタンで実行し Popover を閉じる。
- 詳細検索条件が適用中であることは、トリガボタンに `is-applied` を付与して表す（下記 JS 制御）。
- Popover の外に置く虫眼鏡アイコンのみの検索ボタンは可視テキストを持たないため `aria-label` を付与すること。

### ② 右側・検索エリア（常時表示・複合条件）

テーブルの右側に検索フォームを常時表示する。`gx-search-column-form` でカラム幅を制御。

```html
<form class="imds-form gx-search-column-form imds-p-4">
  <div class="imds-field-container">
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rc]">[REPLACE: 条件名1]</label></div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: rc]" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <label class="imds-checkbox">
          <input type="checkbox" />
          <span>[REPLACE: 絞り込みオプション]</span>
        </label>
      </div>
    </div>
    <div class="gx-search-column-button-area">
      <button type="button" class="imds-button">クリア</button>
      <button type="submit" class="imds-button is-outlined is-primary">検索</button>
    </div>
  </div>
</form>
```

- ボタン配置は左クリア（標準）・右検索（`is-outlined is-primary`）。右側優先。
- クライアントフィルタの場合はクリアボタンのみ配置。
- `form` submit で Enter 検索。クリアで全条件クリア、検索ボタンで実行（クリックまで再検索しない）。

## JS 制御

詳細検索（①）で、条件が適用中であることをトリガボタンの `is-applied` で表す。

```javascript
// 詳細検索 Popover のトリガボタンに is-applied を反映する
const updateAppliedState = (trigger, form) => {
  const hasValue = Array.from(form.querySelectorAll('input, select, textarea'))
    .some((el) => {
      if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
      return el.value.trim() !== '';
    });
  trigger.classList.toggle('is-applied', hasValue);
};
```

リアルタイムフィルタ（③）は対象テーブル行を `input` イベントで絞り込む（debounce 推奨）。具体の絞り込みロジックは各画面の実装側に置く。

## CSS 意図

正規化した `gx-search-*` クラスの定義。生成 HTML の `<style>` ブロックに展開する（raw hex 禁止・トークン参照）。

```css
/* キーワード入力欄の標準幅 */
.gx-search-width {
  width: 20rem;
  max-width: 100%;
}

/* Popover 内のボタン行（左クリア / 右検索） */
.gx-search-button-area {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

/* 右側・検索エリアのカラム幅 */
.gx-search-column-form {
  width: 18rem;
  flex: 0 0 18rem;
}

/* 右側・検索エリアのボタン行 */
.gx-search-column-button-area {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
```

## 実装上の注意

- 検索ボタンに塗りの `is-primary` は使わない（「新規作成」等の主要アクションとの重複を避ける。「重要な注意（検索ボタンの色）」参照）。
- 可視ラベルの無い検索入力には必ず `aria-label` を付与する（「重要な注意（検索入力の `aria-label`）」参照）。
- パターン③はクライアントフィルタ専用（検索ボタンを置かない）、①②はサーバサイド検索を想定する。
