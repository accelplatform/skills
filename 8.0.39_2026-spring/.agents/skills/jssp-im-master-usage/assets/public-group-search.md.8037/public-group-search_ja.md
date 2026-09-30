# パブリックグループ検索ダイアログの実装例

IM-共通マスタの `imACMSearch` を利用した、パブリックグループ検索ダイアログの呼び出し実装例。
テキストボックスのクリックで検索ダイアログを開き、選択結果をフォームに反映するパターンを示す。
キーワード検索タブとツリー検索タブの2タブ構成で実装する。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | IM-共通マスタ検索ダイアログの呼び出し |
| Field | （imds-theme） | パブリックグループ名入力フィールド |
| TextboxControl | （imds-theme） | 検索アイコン付きテキストボックス |

## 全体構成

```
<imart type="head">
├── <imart type="imACMSearch" />   ... 検索画面呼び出し用タグの読み込み
└── <script>
    ├── addEventListener('click')  ... テキストボックスのクリックで検索ダイアログを開く
    ├── imACMSearch.open(parameter) ... 検索画面をポップアップ表示
    ├── callbackFromImMaster()     ... 選択結果を受け取るコールバック関数
    └── window.callbackFromImMaster ... コールバック関数のグローバル登録

<div class="imds-container">
└── main
    └── form.imds-form
        └── section
            └── imds-field-container
                └── imds-field（パブリックグループ名）
                    ├── input[type="hidden"]    ... パブリックグループセットコード（隠しフィールド）
                    ├── input[type="hidden"]    ... パブリックグループコード（隠しフィールド）
                    └── imds-textbox-control    ... パブリックグループ名（検索アイコン付き・readonly）
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
パブリックグループ検索ではキーワード検索タブとツリー検索タブの2タブを指定する。

```html
<script type="text/javascript">
  // パブリックグループ名 クリック時イベント
  document.getElementById(':publicGroupName:').addEventListener('click', () => {
    const parameter = {
      tabs: [{
        id   : "jp.co.intra_mart.master.app.search.tabs.public_group.list",
        title: "キーワード"
      }, {
        id   : "jp.co.intra_mart.master.app.search.tabs.public_group.tree",
        title: "ツリー"
      }],
      prop: {
        'jp.co.intra_mart.master.app.search.tabs.public_group.list' : ['public_group_set_cd', 'public_group_cd', 'public_group_name'],
        'jp.co.intra_mart.master.app.search.tabs.public_group.tree' : ['public_group_set_cd', 'public_group_cd', 'public_group_name']
      },
      callback_function : 'callbackFromImMaster',
      basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
      wnd_title         : "パブリックグループ検索",
      message           : "パブリックグループ検索",
      wnd_close         : true,
      type              : 'single',
      deleted_data      : false,
      target_locale     : 'ja'
    };

    // 検索画面を開く
    imACMSearch.open(parameter);
  });
</script>
```

**ポイント:**
- `tabs` でパブリックグループ検索のプラグインIDを2つ指定し、キーワード検索（`public_group.list`）とツリー検索（`public_group.tree`）の両タブを表示する
- `prop` は各タブごとに取得項目を指定する。両タブで同じ項目を取得する場合でも、それぞれのキーに対して指定が必要
- `type: 'single'` で単一選択モード、`'multiple'` で複数選択モードになる
- `wnd_close: true` で選択後にダイアログを自動的に閉じる
- キーワード検索タブのみで十分な場合は `public_group.list` のみを `tabs` に指定する

### 1.3 コールバック関数

検索ダイアログで選択されたパブリックグループの情報を受け取り、フォームのフィールドに反映する。

```html
<script type="text/javascript">
  // コールバック関数
  function callbackFromImMaster(result) {
    const publicGroupSetCd = result[0].data.public_group_set_cd;
    const publicGroupCd    = result[0].data.public_group_cd;
    const publicGroupName  = result[0].data.public_group_name;
    document.getElementById(':publicGroupSetCode:').value = publicGroupSetCd;
    document.getElementById(':publicGroupCode:').value    = publicGroupCd;
    document.getElementById(':publicGroupName:').value    = publicGroupName;
  }
  // グローバルに関数を置く
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**ポイント:**
- コールバック関数には選択結果がオブジェクト配列で渡される
- 単一選択（`type: 'single'`）の場合は `result[0]` で取得する
- パブリックグループはプライマリキーが `public_group_set_cd` と `public_group_cd` の2つで構成されるため、両方を隠しフィールドに格納する
- パブリックグループ検索の `data` には `public_group_set_cd`、`public_group_cd`、`public_group_name`、`delete_flag` が含まれる
- コールバック関数は `window.関数名 = 関数名` でグローバルスコープに登録する必要がある

## 2. body 部（フォーム要素）

隠しフィールド（プライマリキーの保持用）と、検索アイコン付き readonly テキストボックス（名称表示用）を配置する。
パブリックグループはプライマリキーがパブリックグループセットコード・パブリックグループコードの2つで構成されるため、それぞれを隠しフィールドに格納する。

```html
<div class="imds-field is-horizontal imds-w-15 sample-public-group">
  <div class="imds-field-label"><label for=":publicGroupName:">パブリックグループ名</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="hidden" id=":publicGroupSetCode:" value="">
      <input type="hidden" id=":publicGroupCode:" value="">
      <input type="text" id=":publicGroupName:" placeholder="パブリックグループ名を選択" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
  </div>
</div>
```

**ポイント:**
- `input[type="hidden"]` でパブリックグループセットコード・パブリックグループコードの2つのプライマリキーを保持し、サーバ送信時に使用する
- 表示用テキストボックスは `readonly` にして、検索ダイアログからの選択のみ許可する
- `imds-textbox-control` 内に虫眼鏡アイコン（`fa-magnifying-glass`）を配置し、検索可能であることを示す
- `is-horizontal imds-w-15` でラベルとフィールドを横並びにし、ラベル幅を統一する

## 全体コード

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // パブリックグループ名 クリック時イベント
    document.getElementById(':publicGroupName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.public_group.list",
          title: "キーワード"
        }, {
          id   : "jp.co.intra_mart.master.app.search.tabs.public_group.tree",
          title: "ツリー"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.public_group.list' : ['public_group_set_cd', 'public_group_cd', 'public_group_name'],
          'jp.co.intra_mart.master.app.search.tabs.public_group.tree' : ['public_group_set_cd', 'public_group_cd', 'public_group_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "パブリックグループ検索",
        message           : "パブリックグループ検索",
        wnd_close         : true,
        type              : 'single',
        deleted_data      : false,
        target_locale     : 'ja'
      };

      // 検索画面を開く
      imACMSearch.open(parameter);
    });

    // コールバック関数
    function callbackFromImMaster(result) {
      const publicGroupSetCd = result[0].data.public_group_set_cd;
      const publicGroupCd    = result[0].data.public_group_cd;
      const publicGroupName  = result[0].data.public_group_name;
      document.getElementById(':publicGroupSetCode:').value = publicGroupSetCd;
      document.getElementById(':publicGroupCode:').value    = publicGroupCd;
      document.getElementById(':publicGroupName:').value    = publicGroupName;
    }
    // グローバルに関数を置く
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>

<!-- ページ全体のコンテナ（intra-mart テーマの imui-container の内側に配置されるため id は付与しない） -->
<div class="imds-container">
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p>IM-共通マスタ サンプル</p>
      <h1>パブリックグループ検索</h1>
    </div>
  </header>
  <main>
    <form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <div class="imds-field-container has-accent-color">
          <div class="imds-field is-horizontal imds-w-15 sample-public-group">
            <div class="imds-field-label"><label for=":publicGroupName:">パブリックグループ名</label></div>
            <div class="imds-field-control">
              <div class="imds-textbox-control">
                <input type="hidden" id=":publicGroupSetCode:" value="">
                <input type="hidden" id=":publicGroupCode:" value="">
                <input type="text" id=":publicGroupName:" placeholder="パブリックグループ名を選択" class="imds-textbox" readonly value="">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </div>
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
- 複数タブを使用する場合、`prop` は各タブのプラグインIDごとに取得項目を指定すること
- 表示用フィールドは `readonly` にし、検索ダイアログからの選択のみ許可すること
- `:publicGroupSetCode:`, `:publicGroupCode:`, `:publicGroupName:` はプレースホルダーであり、実装時に一意の ID に置き換えること
- `sample-` プレフィックスのクラスはレイアウト調整用の独自クラスであり、imds テーマの標準クラスではない
- 複数選択モード（`type: 'multiple'`）の場合は、コールバック内で `result` を `for` ループで処理すること
- 複数選択モードでは、コールバックの `result` を変数に保持し、再検索時に `default_selected` パラメータとして渡すことで、選択済みの項目をダイアログ上に復元すること。実装パターンは以下の通り:
  - 保持変数の宣言: `let selectedPublicGroup = [];`
  - コールバック内で保存: `selectedPublicGroup = result;`
  - ダイアログ起動時に渡す: `default_selected: selectedPublicGroup`
