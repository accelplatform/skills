# 組織検索ダイアログの実装例

IM-共通マスタの `imACMSearch` を利用した、組織検索ダイアログの呼び出し実装例。
テキストボックスのクリックで検索ダイアログを開き、選択結果をフォームに反映するパターンを示す。
キーワード検索タブとツリー検索タブの2タブ構成で実装する。

## 使用コンポーネント一覧

| コンポーネント | reference | 本例での用途 |
|---------------|-----------|-------------|
| imACMSearch | [imart-tag-acm-search.md](../reference/imart-tag-acm-search.md) | IM-共通マスタ検索ダイアログの呼び出し |
| Field | （imds-theme） | 組織名入力フィールド |
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

<div id="container">
└── imds-container
    └── main
        └── form.imds-form
            └── section
                └── imds-field-container
                    └── imds-field（組織名）
                        ├── input[type="hidden"]    ... 会社コード（隠しフィールド）
                        ├── input[type="hidden"]    ... 組織セットコード（隠しフィールド）
                        ├── input[type="hidden"]    ... 組織コード（隠しフィールド）
                        └── imds-textbox-control    ... 組織名（検索アイコン付き・readonly）
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
組織検索ではキーワード検索タブとツリー検索タブの2タブを指定する。

```html
<script type="text/javascript">
  // 組織名 クリック時イベント
  document.getElementById(':departmentName:').addEventListener('click', () => {
    const parameter = {
      tabs: [{
        id   : "jp.co.intra_mart.master.app.search.tabs.department.list",
        title: "キーワード"
      }, {
        id   : "jp.co.intra_mart.master.app.search.tabs.department.tree",
        title: "ツリー"
      }],
      prop: {
        'jp.co.intra_mart.master.app.search.tabs.department.list' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name'],
        'jp.co.intra_mart.master.app.search.tabs.department.tree' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name']
      },
      callback_function : 'callbackFromImMaster',
      basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
      wnd_title         : "組織検索",
      message           : "組織検索",
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
- `tabs` で組織検索のプラグインIDを2つ指定し、キーワード検索（`department.list`）とツリー検索（`department.tree`）の両タブを表示する
- `prop` は各タブごとに取得項目を指定する。両タブで同じ項目を取得する場合でも、それぞれのキーに対して指定が必要
- `type: 'single'` で単一選択モード、`'multiple'` で複数選択モードになる
- `wnd_close: true` で選択後にダイアログを自動的に閉じる
- キーワード検索タブのみで十分な場合は `department.list` のみを `tabs` に指定する

### 1.3 コールバック関数

検索ダイアログで選択された組織の情報を受け取り、フォームのフィールドに反映する。

```html
<script type="text/javascript">
  // コールバック関数
  function callbackFromImMaster(result) {
    const companyCd       = result[0].data.company_cd;
    const departmentSetCd = result[0].data.department_set_cd;
    const departmentCd    = result[0].data.department_cd;
    const departmentName  = result[0].data.department_name;
    document.getElementById(':companyCode:').value       = companyCd;
    document.getElementById(':departmentSetCode:').value = departmentSetCd;
    document.getElementById(':departmentCode:').value    = departmentCd;
    document.getElementById(':departmentName:').value    = departmentName;
  }
  // グローバルに関数を置く
  window.callbackFromImMaster = callbackFromImMaster;
</script>
```

**ポイント:**
- コールバック関数には選択結果がオブジェクト配列で渡される
- 単一選択（`type: 'single'`）の場合は `result[0]` で取得する
- 組織検索の `data` には `company_cd`、`department_set_cd`、`department_cd`、`department_name`、`delete_flag` が含まれる
- コールバック関数は `window.関数名 = 関数名` でグローバルスコープに登録する必要がある

## 2. body 部（フォーム要素）

隠しフィールド（プライマリキーの保持用）と、検索アイコン付き readonly テキストボックス（名称表示用）を配置する。
組織はプライマリキーが会社コード・組織セットコード・組織コードの3つで構成されるため、それぞれを隠しフィールドに格納する。

```html
<div class="imds-field is-horizontal imds-w-15 sample-department">
  <div class="imds-field-label"><label for=":departmentName:">組織名</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="hidden" id=":companyCode:" value="">
      <input type="hidden" id=":departmentSetCode:" value="">
      <input type="hidden" id=":departmentCode:" value="">
      <input type="text" id=":departmentName:" placeholder="組織名を選択" class="imds-textbox" readonly value="">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
  </div>
</div>
```

**ポイント:**
- `input[type="hidden"]` で会社コード・組織セットコード・組織コードの3つのプライマリキーを保持し、サーバ送信時に使用する
- 表示用テキストボックスは `readonly` にして、検索ダイアログからの選択のみ許可する
- `imds-textbox-control` 内に虫眼鏡アイコン（`fa-magnifying-glass`）を配置し、検索可能であることを示す
- `is-horizontal imds-w-15` でラベルとフィールドを横並びにし、ラベル幅を統一する

## 全体コード

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script type="text/javascript">
    // 組織名 クリック時イベント
    document.getElementById(':departmentName:').addEventListener('click', () => {
      const parameter = {
        tabs: [{
          id   : "jp.co.intra_mart.master.app.search.tabs.department.list",
          title: "キーワード"
        }, {
          id   : "jp.co.intra_mart.master.app.search.tabs.department.tree",
          title: "ツリー"
        }],
        prop: {
          'jp.co.intra_mart.master.app.search.tabs.department.list' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name'],
          'jp.co.intra_mart.master.app.search.tabs.department.tree' : ['company_cd', 'department_set_cd', 'department_cd', 'department_name']
        },
        callback_function : 'callbackFromImMaster',
        basic_area        : 'jp.co.intra_mart.master.app.search.headers.readonly',
        wnd_title         : "組織検索",
        message           : "組織検索",
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
      const companyCd       = result[0].data.company_cd;
      const departmentSetCd = result[0].data.department_set_cd;
      const departmentCd    = result[0].data.department_cd;
      const departmentName  = result[0].data.department_name;
      document.getElementById(':companyCode:').value       = companyCd;
      document.getElementById(':departmentSetCode:').value = departmentSetCd;
      document.getElementById(':departmentCode:').value    = departmentCd;
      document.getElementById(':departmentName:').value    = departmentName;
    }
    // グローバルに関数を置く
    window.callbackFromImMaster = callbackFromImMaster;
  </script>
</imart>

<!-- ページ全体のコンテナ -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-icon">
        <span class="imds-icon-wrapper is-large">
          <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
        </span>
      </div>
      <div class="imds-header-title">
        <p>IM-共通マスタ サンプル</p>
        <h1>組織検索</h1>
      </div>
    </header>
    <main>
      <form class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <div class="imds-field-container has-accent-color">
            <div class="imds-field is-horizontal imds-w-15 sample-department">
              <div class="imds-field-label"><label for=":departmentName:">組織名</label></div>
              <div class="imds-field-control">
                <div class="imds-textbox-control">
                  <input type="hidden" id=":companyCode:" value="">
                  <input type="hidden" id=":departmentSetCode:" value="">
                  <input type="hidden" id=":departmentCode:" value="">
                  <input type="text" id=":departmentName:" placeholder="組織名を選択" class="imds-textbox" readonly value="">
                  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </main>
  </div>
</div>
```

## 実装上の注意

- `<imart type="imACMSearch" />` は必ず `<imart type="head">` 内に配置すること
- コールバック関数は `window.関数名 = 関数名` でグローバルスコープに登録すること
- `tabs` でプラグインIDを明示的に指定し、`prop` のキーと一致させること
- 複数タブを使用する場合、`prop` は各タブのプラグインIDごとに取得項目を指定すること
- 表示用フィールドは `readonly` にし、検索ダイアログからの選択のみ許可すること
- `:companyCode:`, `:departmentSetCode:`, `:departmentCode:`, `:departmentName:` はプレースホルダーであり、実装時に一意の ID に置き換えること
- `sample-` プレフィックスのクラスはレイアウト調整用の独自クラスであり、imds テーマの標準クラスではない
- 複数選択モード（`type: 'multiple'`）の場合は、コールバック内で `result` を `for` ループで処理すること
- 複数選択モードでは、コールバックの `result` を変数に保持し、再検索時に `default_selected` パラメータとして渡すことで、選択済みの項目をダイアログ上に復元すること。実装パターンは以下の通り:
  - 保持変数の宣言: `let selectedDepartment = [];`
  - コールバック内で保存: `selectedDepartment = result;`
  - ダイアログ起動時に渡す: `default_selected: selectedDepartment`
