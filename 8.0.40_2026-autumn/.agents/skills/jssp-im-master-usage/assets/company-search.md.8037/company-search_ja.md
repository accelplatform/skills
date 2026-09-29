# 会社検索ダイアログの実装例

IM-共通マスタの `imACMSearch` を利用した、会社検索ダイアログの呼び出し実装例。
テキストボックスのクリックで検索ダイアログを開き、選択結果をフォームに反映するパターンを示す。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | IM-共通マスタ検索ダイアログの呼び出し |
| Field | （imds-theme） | 会社名入力フィールド |
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
                └── imds-field（会社名）
                    ├── input[type="hidden"]    ... 会社コード（隠しフィールド）
                    └── imds-textbox-control    ... 会社名（検索アイコン付き・readonly）
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
  // 会社名 クリック時イベント
  document.getElementById(':companyName:').addEventListener('click', () => {
    const parameter = {
      tabs: [{
        id   : "jp.co.intra_mart.master.app.search.tabs.company.list",
        title: "キーワード"
      }],
      prop: {
        'jp.co.intra_mart.master.app.search.tabs.company.list' : ['company_cd', 'department_set_cd', 'department_name']
      },
      callback_function : 'callbackFromImMaster',
      basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
      wnd_title         : "会社検索",
      message           : "会社検索",
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
- `tabs` で会社検索のプラグインID `jp.co.intra_mart.master.app.search.tabs.company.list` を指定する
- `prop` でコールバック関数に渡される取得項目を指定する（`company_cd`, `department_set_cd`, `department_name`）
- `type: 'single'` で単一選択モード、`'multiple'` で複数選択モードになる
- `wnd_close: true` で選択後にダイアログを自動的に閉じる
- ユーザ検索固有のオプション（`additional_disp` 等）は会社検索では不要

### 1.3 コールバック関数

検索ダイアログで選択された会社の情報を受け取り、フォームのフィールドに反映する。

```html
<script type="text/javascript">
  // コールバック関数
  function callbackFromImMaster(result) {
    const companyCd   = result[0].data.company_cd;
    const companyName = result[0].data.department_name;
    document.getElementById(':companyCode:').value = companyCd;
    document.getElementById(':companyName:').value = companyName;
  }
  // グローバルに関数を置く
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**ポイント:**
- コールバック関数には選択結果がオブジェクト配列で渡される
- 単一選択（`type: 'single'`）の場合は `result[0]` で取得する
- 会社検索の `data` には `company_cd`、`department_set_cd`、`department_cd`、`department_name`、`delete_flag` が含まれる
- コールバック関数は `window.関数名 = 関数名` でグローバルスコープに登録する必要がある

## 2. body 部（フォーム要素）

隠しフィールド（コード値の保持用）と、検索アイコン付き readonly テキストボックス（名称表示用）を配置する。

```html
<div class="imds-field is-horizontal imds-w-15 sample-company">
  <div class="imds-field-label"><label for=":companyName:">会社名</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="hidden" id=":companyCode:" value="">
      <input type="text" id=":companyName:" placeholder="会社名を選択" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
  </div>
</div>
```

**ポイント:**
- `input[type="hidden"]` で会社コードを保持し、サーバ送信時に使用する
- 表示用テキストボックスは `readonly` にして、検索ダイアログからの選択のみ許可する
- `imds-textbox-control` 内に虫眼鏡アイコン（`fa-magnifying-glass`）を配置し、検索可能であることを示す
- `is-horizontal imds-w-15` でラベルとフィールドを横並びにし、ラベル幅を統一する

## 全体コード

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 会社名 クリック時イベント
    document.getElementById(':companyName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.company.list",
          title: "キーワード"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.company.list' : ['company_cd', 'department_set_cd', 'department_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "会社検索",
        message           : "会社検索",
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
      const companyCd   = result[0].data.company_cd;
      const companyName = result[0].data.department_name;
      document.getElementById(':companyCode:').value = companyCd;
      document.getElementById(':companyName:').value = companyName;
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
      <h1>会社検索</h1>
    </div>
  </header>
  <main>
    <form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <div class="imds-field-container has-accent-color">
          <div class="imds-field is-horizontal imds-w-15 sample-company">
            <div class="imds-field-label"><label for=":companyName:">会社名</label></div>
            <div class="imds-field-control">
              <div class="imds-textbox-control">
                <input type="hidden" id=":companyCode:" value="">
                <input type="text" id=":companyName:" placeholder="会社名を選択" class="imds-textbox" readonly value="">
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
- 表示用フィールドは `readonly` にし、検索ダイアログからの選択のみ許可すること
- `:companyCode:`, `:companyName:` はプレースホルダーであり、実装時に一意の ID に置き換えること
- `sample-` プレフィックスのクラスはレイアウト調整用の独自クラスであり、imds テーマの標準クラスではない
- 複数選択モード（`type: 'multiple'`）の場合は、コールバック内で `result` を `for` ループで処理すること
- 複数選択モードでは、コールバックの `result` を変数に保持し、再検索時に `default_selected` パラメータとして渡すことで、選択済みの項目をダイアログ上に復元すること。実装パターンは以下の通り:
  - 保持変数の宣言: `let selectedCompany = [];`
  - コールバック内で保存: `selectedCompany = result;`
  - ダイアログ起動時に渡す: `default_selected: selectedCompany`
