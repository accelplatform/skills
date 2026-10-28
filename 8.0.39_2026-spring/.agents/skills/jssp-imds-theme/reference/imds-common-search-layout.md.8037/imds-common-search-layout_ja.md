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

ページ上に直接置く検索ボタンには **塗りの `is-primary` を使わない**こと。多くの一覧画面には「新規作成」ボタン等の主要アクションが既に `is-primary` で存在しており、DESIGN.md の「主要アクションは1画面に1つ」原則に反するためである。
検索ボタンは配置場所に応じて以下とする。

- 無色の `imds-button`（① の Popover 外に置く虫眼鏡ボタンのように、装飾を持たない場合）
- `imds-button is-outlined is-primary`（② の検索エリア内の submit ボタンのように、ページ上で検索を主要なアクションとして示したい場合のセカンダリ表現）
- `imds-button is-primary`（塗り。① の詳細検索 Popover 内の検索ボタン。imds の Storybook（Popover「一覧における検索フィルタ、表示項目の設定」）に準拠し、Popover 内の主要アクションとして 1 つだけ置く）

## 重要な注意（検索入力の `aria-label`）

可視ラベルを持たない検索入力（`placeholder` のみの入力欄）には、必ず `aria-label` を付与すること。`placeholder` はラベルの代替にはならない。以降のスニペットは①③とも `aria-label` を付与している。

## HTML スニペット

### ③ 上部・フィルタ（リアルタイム絞り込み）— 最頻出・最小構成

虫眼鏡アイコンは入力欄の内側左に出す（`imds-textbox-control is-left`）。架空の `imds-search` クラスは使わない。

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" placeholder="[REPLACE: 項目名]で絞り込む" aria-label="[REPLACE: 項目名]で絞り込む" id="[REPLACE: filter-keyword]" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

- 可視ラベルを持たない場合は `aria-label` を必ず付ける（placeholder だけでは不可）。
- `placeholder` / `aria-label` は「〈対象の項目名〉で絞り込む」とする（検索ボタンで実行する①は「〈対象の項目名〉で検索」）。
- `type="search"` を使い、入力値のクリア（×ボタン）ができること。
- 入力に反応してリアルタイムに絞り込む（入力が止まったタイミングで発火）。検索ボタンは置かない。
- 検索対象を限定したい場合はカテゴリ選択（`imds-select` 等）を左に併設してよい。

### ① 上部・検索部品（キーワード＋詳細検索 Popover ＋検索ボタン）

`imds-input-group` でキーワード入力・詳細検索 Popover トリガ・検索ボタンを横並びにする。Popover の中身は imds の Storybook（Popover「一覧における検索フィルタ、表示項目の設定」）の構造に準拠する。

```html
<div class="imds-input-group">
  <input id=":searchKeywords:" type="search" class="imds-textbox" style="width: 20rem; max-width: 100%;" placeholder="[REPLACE: 項目名]で検索" aria-label="[REPLACE: 項目名]で検索" />
  <div class="imds-popover is-left">
    <button
      type="button"
      aria-haspopup="true"
      aria-controls="search-popover"
      aria-label="詳細検索"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="search-popover"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">
        <div style="display: grid; grid-template-rows: 1fr auto; width: max-content;">
          <div
            class="imds-py-3 imds-px-4 imds-scrollbar"
            style="grid-row: 1 / 2; overflow: auto;">
            <form id="search-condition-form" class="imds-form">
              <div class="imds-field-container">
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":matterNumber:">案件番号</label></div>
                  <div class="imds-field-control">
                    <input type="text" id=":matterNumber:" class="imds-textbox" value="" />
                  </div>
                </div>
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":matterName:">案件名</label></div>
                  <div class="imds-field-control">
                    <input type="text" id=":matterName:" class="imds-textbox" value="" />
                  </div>
                </div>
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":status:">ステータス</label></div>
                  <div class="imds-field-control">
                    <select id=":status:" class="imds-select">
                      <option>すべて</option>
                      <option>新規</option>
                      <option>実行中</option>
                      <option>完了</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div
            class="imds-py-2 imds-px-4 imds-border-t-1"
            style="grid-row: 2 / 3;">
            <div style="display: flex; justify-content: flex-end; gap: 1em;">
              <button type="button" style="min-width: 8em;" class="imds-button is-normal">クリア</button>
              <button type="submit" form="search-condition-form" style="min-width: 8em;" class="imds-button is-normal is-primary">検索</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <button type="button" class="imds-button" aria-label="検索">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

```javascript
// 詳細検索の実行（Popover 内の Enter・検索ボタン）
document.getElementById('search-condition-form').addEventListener('submit', function (event) {
  event.preventDefault();   // 必須。抑止漏れは画面リロード事故になる
  searchList();             // キーワード + 詳細条件で検索する（画面側で実装）
  document.getElementById('search-popover').closest('.imds-popover').classList.remove('is-active');
});
```

- **Popover の中身は `width: max-content` のグリッドで包む**。幅を指定しないとパネルがトリガボタンを基準に縮み、ラベルやボタンの文字が 1 文字ずつ折り返すほど横幅が潰れる
- 条件の入力欄（`imds-scrollbar` 付き・`overflow: auto`）とボタン行（`imds-border-t-1` で区切る）を分け、条件が多くてもボタン行が常に見えるようにする
- 条件のラベル幅は `imds-field` に `imds-w-15` を付与して揃える。条件の項目は画面に合わせて置き換える
- ボタン行は右寄せで、左にクリア（標準）・右に検索（塗りの `is-primary`）。間隔は `gap: 1em`、各ボタンに `style="min-width: 8em;"` を付ける（独自クラスは定義しない）
- 検索ボタンはボタン行（`<form>` の外）に置いたまま、`form` 属性でフォームに関連付けて `type="submit"` にする。関連付けた submit ボタンが無いと、入力欄が 2 つ以上のフォームでは Enter を押しても送信されない
- `submit` イベントハンドラで必ず `event.preventDefault()` を呼び、画面の再読み込みを防ぐ。クリア・トリガボタンは `type="button"` にする（`type` を省略した `<button>` はフォーム内で submit ボタンになる）
- Popover 内に `<form>` を持つため、`imds-input-group` 全体をさらに `<form>` で囲まない（`<form>` の入れ子は HTML で無効）。キーワード欄の Enter 検索は `keydown` で実装し（`.agents/requirements/jssp-presentation-page/AGENTS.md`「Enter キーイベントの実装」参照）、虫眼鏡ボタンの `click` と同じ検索処理を呼ぶ
- トリガボタンはアイコンのみ（`fa-sliders` + `fa-chevron-down`）とし、アイコン間の `<span></span>` は空のままにする（「詳細検索」等の表示テキストを入れない。imds の Storybook の見た目に合わせるため）。可視テキストを持たないため `aria-label`（例: `aria-label="詳細検索"`）を付与する
- トリガボタンの `aria-controls` と `imds-popover-menu` の `id` を一致させる（[imds-html-popover.md](imds-html-popover.md) 参照）。id は機能に合わせて一意な名前にする（入力要素ではないためコロンは付けない）
- 詳細検索の条件は Popover を閉じても保持する。クリアで全条件クリア、検索ボタンで実行し Popover を閉じる
- 詳細検索条件が適用中であることは、トリガボタンに `is-applied` を付与して表す（下記 JS 制御）
- Popover の外に置く虫眼鏡アイコンのみの検索ボタンは可視テキストを持たないため `aria-label` を付与すること

### ② 右側・検索エリア（常時表示・複合条件）

テーブルの右側に検索フォームを常時表示する。カラム幅はインライン `style`（`width: 18rem; flex: 0 0 18rem;`）で指定する。

```html
<form class="imds-form imds-p-4" style="width: 18rem; flex: 0 0 18rem;">
  <div class="imds-field-container">
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rc]">[REPLACE: 条件名1]</label></div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: rc]" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rd]">[REPLACE: 条件名2]</label></div>
      <div class="imds-field-control">
        <div class="imds-checkbox-group">
          <label class="imds-checkbox">
            <input type="checkbox" id="[REPLACE: rd]" />
            <span>[REPLACE: 絞り込みオプション]</span>
          </label>
        </div>
      </div>
    </div>
    <div class="imds-mt-4" style="display: flex; justify-content: flex-end; gap: 1em;">
      <button type="button" class="imds-button" style="min-width: 8em;">クリア</button>
      <button type="submit" class="imds-button is-outlined is-primary" style="min-width: 8em;">検索</button>
    </div>
  </div>
</form>
```

- ボタン配置は左クリア（標準）・右検索（`is-outlined is-primary`）。右側優先。
- クライアントフィルタの場合はクリアボタンのみ配置。
- `form` submit で Enter 検索（`submit` イベントハンドラで必ず `event.preventDefault()` を呼ぶ）。クリアで全条件クリア、検索ボタンで実行（クリックまで再検索しない）。

## JS 制御

詳細検索（①）で、条件が適用中であることをトリガボタンの `is-applied` で表す。

```javascript
// 詳細検索 Popover のトリガボタンに is-applied を反映する
const updateAppliedState = (trigger, form) => {
  const hasValue = Array.from(form.querySelectorAll('input, select, textarea'))
    .some((element) => {
      if (element.type === 'checkbox' || element.type === 'radio') return element.checked;
      return element.value.trim() !== '';
    });
  trigger.classList.toggle('is-applied', hasValue);
};
```

リアルタイムフィルタ（③）は対象テーブル行を `input` イベントで絞り込む（debounce 推奨）。具体の絞り込みロジックは各画面の実装側に置く。

## CSS 意図

本パターンは独自クラス（旧 `gx-search-*`）を使わない。幅・間隔はインライン `style`、余白は imds のヘルパークラス（`imds-mt-4` 等）で指定する。独自クラスは imds 既定のスタイルと詳細度が並んで上書きできないことがあり、`<style>` への定義が漏れると表示が崩れる（ボタンの間隔が無くなる等）ためである（`.agents/requirements/jssp-presentation-page/AGENTS.md`「アンチパターン: カスタム `.max-width-NNem` / `.min-width-NNem` クラスを定義しない」参照）。

## 実装上の注意

- ページ上に置く検索ボタンに塗りの `is-primary` は使わない（「新規作成」等の主要アクションとの重複を避ける）。詳細検索 Popover 内の検索ボタンのみ塗りの `is-primary` とする（「重要な注意（検索ボタンの色）」参照）。
- 可視ラベルの無い検索入力には必ず `aria-label` を付与する（「重要な注意（検索入力の `aria-label`）」参照）。
- パターン③はクライアントフィルタ専用（検索ボタンを置かない）、①②はサーバサイド検索を想定する。
