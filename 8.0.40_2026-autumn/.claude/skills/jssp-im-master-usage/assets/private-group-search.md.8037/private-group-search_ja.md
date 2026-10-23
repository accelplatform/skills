# プライベートグループ検索ダイアログの実装例

IM-共通マスタの `imACMSearch` を利用した、プライベートグループ検索ダイアログの呼び出し実装例。
テキストボックスのクリックで検索ダイアログを開き、選択結果をフォームに反映するパターンを示す。
ページ骨格は `jssp-imds-theme` の `assets/imds-form-page.md` に従い（ヘッダを固定表示しフォーム部分のみをスクロールさせる `pgstyle-layout-*` レイアウト）、ファンクションコンテナ（`index.js`）とプレゼンテーションページ（`index.html`）の組でそのまま画面として動作する。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | IM-共通マスタ検索ダイアログの呼び出し |
| Header | `jssp-imds-theme` の `imds-html-header.md` | ページヘッダ（アイコン・タイトル） |
| Field | `jssp-imds-theme` の `imds-html-field.md` | プライベートグループ名入力フィールド |
| TextboxControl | `jssp-imds-theme` の `imds-html-textbox-control.md` | 検索アイコン付きテキストボックス |
| IconButton | `jssp-imds-theme` の `imds-html-icon-button.md` | クリアボタン（×アイコン） |

## 全体構成

```
index.js（ファンクションコンテナ）
├── $title / $subTitle            ... ページヘッダ・<title> に出力する画面名
└── $targetLocale                 ... 検索ダイアログの表示ロケール（ログインユーザのロケール）

<imart type="head">
├── <title> / <meta>              ... タイトル・セキュアトークン
├── <link> / <style>              ... theme-conditional-layout.css の読み込み・pgstyle-layout-* の定義
├── <imart type="imACMSearch" />  ... 検索画面呼び出し用タグの読み込み
└── <script>
    ├── callbackFromImMaster()      ... 選択結果を受け取るコールバック関数（グローバルスコープ）
    ├── window.callbackFromImMaster ... コールバック関数のグローバル登録
    └── DOMContentLoaded
        ├── setSelectedPrivateGroup()   ... 選択結果のフォームへの反映（window._setSelectedPrivateGroup として公開）
        ├── addEventListener('click') ... テキストボックスのクリックで検索ダイアログを開く（imACMSearch.open）
        └── addEventListener('click') ... クリアボタンで選択結果を消去

div.imds-container.pgstyle-layout-container
├── header.imds-header            ... ページヘッダ（アイコン・タイトル）
└── main.pgstyle-layout-main
    └── form.imds-form.pgstyle-layout-content
        └── section
            └── imds-field-container
                └── imds-field（プライベートグループ名）
                    └── imds-field-control
                        ├── input[type="hidden"]    ... プライベートグループコード（隠しフィールド）
                        ├── imds-textbox-control    ... プライベートグループ名（検索アイコン付き・readonly）
                        └── button.imds-button      ... クリアボタン（×アイコン）
```

## 1. head 部（検索ダイアログの設定）

### 1.1 imACMSearch タグの読み込み

`<imart type="imACMSearch" />` を `<imart type="head">` 内に配置し、検索画面呼び出し用のオブジェクトを生成する。

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />
</imart>
```

**ポイント:**
- `<imart type="imACMSearch" />` は必ず `<imart type="head">` 内に配置する
- これにより `imACMSearch` オブジェクトがグローバルに生成される

### 1.2 検索ダイアログの起動

テキストボックスのクリックイベントで `imACMSearch.open(parameter)` を呼び出し、検索ダイアログをポップアップ表示する。

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // プライベートグループ名 クリック時イベント
    document.getElementById(':privateGroupName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.private_group.list",
          title: "キーワード"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.private_group.list' : ['private_group_cd', 'private_group_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "プライベートグループ検索",
        message           : "プライベートグループ検索",
        wnd_close         : true,
        type              : 'single',
        deleted_data      : false,
        target_locale     : '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'
      };

      // 検索画面を開く
      imACMSearch.open(parameter);
    });
  });
</script>
```

**ポイント:**
- `tabs` でプライベートグループ検索のプラグインID `jp.co.intra_mart.master.app.search.tabs.private_group.list` を指定する
- プライベートグループ検索はキーワード検索タブのみ（ツリー検索タブはない）
- `prop` でコールバック関数に渡される取得項目を指定する（`private_group_cd`, `private_group_name`）
- `type: 'single'` で単一選択モード、`'multiple'` で複数選択モードになる
- `wnd_close: true` で選択後にダイアログを自動的に閉じる
- 要素を参照するため、イベントの登録は `DOMContentLoaded` 内で行う（`<imart type="head">` 内のスクリプトは本文の要素より先に実行される）
- `target_locale` には、ファンクションコンテナでバインドした `$targetLocale`（ログインユーザのロケール。`Contexts.getAccountContext().locale`）を出力し、検索ダイアログをログインユーザのロケールで表示する。`<script>` 内の文字列リテラルのため `escapeXml="false" escapeJs="true"` を指定する（`jssp-presentation-page.md`「JavaScript の文字列リテラルとして使用する場合」）

### 1.3 コールバック関数

検索ダイアログで選択されたプライベートグループの情報を受け取り、1.4 の反映関数を呼び出してフォームのフィールドに反映する。

```html
<script type="text/javascript">
  // コールバック関数（imACMSearch から関数名で呼び出されるため、グローバルスコープに定義する）
  function callbackFromImMaster(result) {
    // 未選択の場合は何もしない（現在の値を保持する）
    if (!result || result.length === 0) {
      return;
    }
    if (typeof window._setSelectedPrivateGroup === 'function') {
      window._setSelectedPrivateGroup(result[0].data.private_group_cd, result[0].data.private_group_name);
    }
  }
  // グローバルに関数を置く
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**ポイント:**
- コールバック関数には選択結果がオブジェクト配列で渡される
- 単一選択（`type: 'single'`）の場合は `result[0]` で取得する
- 選択結果が空（未選択）の場合は何もせず、現在の値を保持する。選択結果の消去はクリアボタンで行う
- プライベートグループはプライマリキーが `private_grp_cd` の1つで構成される
- プライベートグループ検索の `data` には `private_group_cd`、`user_cd`、`private_group_name` が含まれる
- コールバック関数は `window.関数名 = 関数名` でグローバルスコープに登録する必要がある
- コールバック関数からは `DOMContentLoaded` 内の関数を直接参照できないため、`window._setSelectedPrivateGroup` として公開した関数を経由してフォームに反映する（`jssp-presentation-page.md`「グローバルスコープのコールバック関数（imACMSearch 等）」）

### 1.4 選択結果の反映とクリア

`DOMContentLoaded` 内で選択結果をフォームに反映する関数を定義し、コールバック関数用に `window._setSelectedPrivateGroup` として公開する。クリアボタンは同じ関数に空文字を渡して選択結果を消去する。

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    // 選択結果をフォームに反映する（クリア時は空文字を渡す）
    function setSelectedPrivateGroup(privateGroupCode, privateGroupName) {
      document.getElementById(':privateGroupCode:').value = privateGroupCode;
      document.getElementById(':privateGroupName:').value = privateGroupName;
    }
    // グローバルスコープのコールバック関数から呼び出せるように公開する
    window._setSelectedPrivateGroup = setSelectedPrivateGroup;

    // クリアボタン クリック時イベント
    document.getElementById('private-group-clear-button').addEventListener('click', () => {
      setSelectedPrivateGroup('', '');
    });
  });
</script>
```

**ポイント:**
- 隠しフィールド（コード値）と表示用テキストボックス（名称）を同じ関数で更新し、両者の値がずれないようにする
- 表示用テキストボックスは `readonly` のため、選択結果の消去はクリアボタンで行う

## 2. body 部（フォーム要素）

隠しフィールド（コード値の保持用）と、検索アイコン付き readonly テキストボックス（名称表示用）を配置する。
名称表示欄の右には、選択結果を消去するクリアボタンを併置する（`jssp-imds-theme` の `imds-html-textbox-control.md`「検索アイコン＋クリアボタン」）。

```html
<div class="imds-field is-horizontal imds-w-15 sample-private-group">
  <div class="imds-field-label"><label for=":privateGroupName:">プライベートグループ名</label></div>
  <div class="imds-field-control">
    <input type="hidden" id=":privateGroupCode:" value="">
    <div class="imds-textbox-control">
      <input type="text" id=":privateGroupName:" placeholder="プライベートグループ名を選択" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" id="private-group-clear-button" class="imds-button is-ghost" title="クリア">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

**ポイント:**
- `input[type="hidden"]` でプライベートグループコードを保持し、サーバ送信時に使用する
- 表示用テキストボックスは `readonly` にして、検索ダイアログからの選択のみ許可する
- `imds-textbox-control` 内に虫眼鏡アイコン（`fa-magnifying-glass`）を配置し、検索可能であることを示す
- `input[type="hidden"]` は `imds-textbox-control` の外（`imds-field-control` の直下）に置き、`imds-textbox-control` の中は `input.imds-textbox` と `span.imds-icon` のみにする
- クリアボタンはアイコンのみのボタンのため、`title` 属性で操作内容を示す（`imds-html-icon-button.md`）
- `is-horizontal imds-w-15` でラベルとフィールドを横並びにし、ラベル幅を統一する

## 全体コード

### ファンクションコンテナ（index.js）

```javascript
/**
 * プライベートグループ検索画面
 *
 * @file index.js
 * @description IM-共通マスタの検索ダイアログで選択した値をフォームに表示する画面を構成します。
 */

// ========================================
// バインド変数（プレゼンテーションページ連携用）
// ========================================
let $title = 'プライベートグループ検索';
let $subTitle = 'IM-共通マスタ サンプル';
let $targetLocale = '';    // 検索ダイアログの表示ロケール（ログインユーザのロケール）

// ========================================
// エントリーポイント
// ========================================
/**
 * 画面表示のエントリーポイントです。
 * 画面のURLにアクセスされたとき、最初に実行されます。
 * 検索ダイアログの表示ロケールとして、ログインユーザのロケールをバインド変数に設定します。
 *
 * @param {Object} request - リクエストオブジェクト
 */
function init(request) {
  // ログインユーザのロケールを検索ダイアログの表示ロケールとする
  $targetLocale = Contexts.getAccountContext().locale;
}
```

### プレゼンテーションページ（index.html）

```html
<!-- ヘッダ -->
<imart type="head">
  <!-- タイトル -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- セキュアトークン -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- テーマごとに異なるコンテンツ表示領域の高さ・幅を制御する CSS -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- プレゼンテーションページの独自スタイル -->
  <style>
    /* レイアウト制御用スタイル */
    .pgstyle-layout-container {
      grid-template-rows: 5rem minmax(0, 1fr);
      grid-template-columns: 100%;
      height: 100%;
      display: grid;
    }
    .pgstyle-layout-container > .imds-header {
      grid-row: 1 / 2;
    }
    .pgstyle-layout-main {
      flex-direction: column;
      grid-row: 2 / 3;
      height: 100%;
      display: flex;
    }
    .pgstyle-layout-content {
      flex: 1 0 0;
      overflow: auto;
    }
  </style>
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // コールバック関数（imACMSearch から関数名で呼び出されるため、グローバルスコープに定義する）
    function callbackFromImMaster(result) {
      // 未選択の場合は何もしない（現在の値を保持する）
      if (!result || result.length === 0) {
        return;
      }
      if (typeof window._setSelectedPrivateGroup === 'function') {
        window._setSelectedPrivateGroup(result[0].data.private_group_cd, result[0].data.private_group_name);
      }
    }
    // グローバルに関数を置く
    window.callbackFromImMaster = callbackFromImMaster;

    document.addEventListener('DOMContentLoaded', () => {
      // 選択結果をフォームに反映する（クリア時は空文字を渡す）
      function setSelectedPrivateGroup(privateGroupCode, privateGroupName) {
        document.getElementById(':privateGroupCode:').value = privateGroupCode;
        document.getElementById(':privateGroupName:').value = privateGroupName;
      }
      // グローバルスコープのコールバック関数から呼び出せるように公開する
      window._setSelectedPrivateGroup = setSelectedPrivateGroup;

      // プライベートグループ名 クリック時イベント
      document.getElementById(':privateGroupName:').addEventListener('click', () => {
        const parameter = {
          tabs: [{
            id   : "jp.co.intra_mart.master.app.search.tabs.private_group.list",
            title: "キーワード"
          }],
          prop: {
            'jp.co.intra_mart.master.app.search.tabs.private_group.list' : ['private_group_cd', 'private_group_name']
          },
          callback_function : 'callbackFromImMaster',
          basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
          wnd_title         : "プライベートグループ検索",
          message           : "プライベートグループ検索",
          wnd_close         : true,
          type              : 'single',
          deleted_data      : false,
          target_locale     : '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'
        };

        // 検索画面を開く
        imACMSearch.open(parameter);
      });

      // クリアボタン クリック時イベント
      document.getElementById('private-group-clear-button').addEventListener('click', () => {
        setSelectedPrivateGroup('', '');
      });
    });
  </script>
</imart>

<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container pgstyle-layout-container">
  <!-- ヘッダ -->
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-user-group"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <!-- メインコンテンツ -->
  <main class="pgstyle-layout-main">
    <form class="imds-form has-background-color-gray pgstyle-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <div class="imds-field-container has-accent-color">
          <div class="imds-field is-horizontal imds-w-15 sample-private-group">
            <div class="imds-field-label"><label for=":privateGroupName:">プライベートグループ名</label></div>
            <div class="imds-field-control">
              <input type="hidden" id=":privateGroupCode:" value="">
              <div class="imds-textbox-control">
                <input type="text" id=":privateGroupName:" placeholder="プライベートグループ名を選択" class="imds-textbox" readonly value="">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </div>
              <button type="button" id="private-group-clear-button" class="imds-button is-ghost" title="クリア">
                <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </form>
  </main>
</div>
```

## 実装上の注意

- `<imart type="imACMSearch" />` は必ず `<imart type="head">` 内に配置すること
- コールバック関数は `window.関数名 = 関数名` でグローバルスコープに登録すること
- `tabs` でプラグインIDを明示的に指定し、`prop` のキーと一致させること
- 表示用フィールドは `readonly` にし、検索ダイアログからの選択のみ許可すること
- `:privateGroupCode:`, `:privateGroupName:` は `jssp-presentation-page.md`「id 属性の命名規約」に従った入力要素の id である。1 画面に同じ検索欄を複数置く場合は、これらの id・クリアボタンの id・反映関数名が重複しないように変更すること
- `sample-` プレフィックスのクラスはレイアウト調整用の独自クラスであり、imds テーマの標準クラスではない
- ヘッダのタイトル・サブタイトルは直書きせず、ファンクションコンテナでバインドした `$title` / `$subTitle` を出力すること
- `target_locale` は `'ja'` 等を直書きせず、ファンクションコンテナでバインドした `$targetLocale`（ログインユーザのロケール）を `escapeXml="false" escapeJs="true"` で出力すること
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` は置き換えない固定クラス名である。`<imart type="head">` で `theme-conditional-layout.css` を読み込み、`<style>` にレイアウト制御用スタイルを定義すること（`jssp-imds-theme` の `assets/imds-form-page.md`）
- コールバックの `result` が空（未選択）の場合は何もせず、現在の値を消去しないこと
- 複数選択モード（`type: 'multiple'`）の場合は、コールバック内で `result` を `for` ループで処理すること
- 複数選択モードでは、コールバックの `result` を変数に保持し、再検索時に `default_selected` パラメータとして渡すことで、選択済みの項目をダイアログ上に復元すること。実装パターンは以下の通り:
  - 保持変数の宣言: `let selectedPrivateGroup = [];`
  - コールバック内で保存（`result` が空の場合は保存せず、選択済みの項目を保持する）: `selectedPrivateGroup = result;`
  - ダイアログ起動時に渡す: `default_selected: selectedPrivateGroup`
  - クリア時に空にする: `selectedPrivateGroup = [];`
- プライベートグループはログインユーザ自身のグループのみ表示される
