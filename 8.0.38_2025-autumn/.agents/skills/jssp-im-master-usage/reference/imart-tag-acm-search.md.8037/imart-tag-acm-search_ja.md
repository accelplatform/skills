# IMART imACMSearch タグ リファレンス

## 概要

`<imart type="imACMSearch" />` タグは、IM-共通マスタの検索画面をポップアップで呼び出すオブジェクトを生成するタグである。
生成したオブジェクトの `open` メソッドで検索画面をポップアップ表示し、検索結果はコールバック関数の引数としてオブジェクト形式で渡される。

## 属性一覧

| 属性 | 型 | デフォルト | 説明 |
|------|------|-----------|------|
| name | String | `"imACMSearch"` | 生成するオブジェクト名 |
| noscript | Boolean | false | `true` の場合、スクリプトを読み込まない |

## パラメータ一覧

`open` メソッドに渡すオブジェクトに設定する。

### 必須パラメータ

| パラメータ | 型 | 説明 |
|-----------|------|------|
| callback_function | String | コールバック関数名 |

### 主要オプションパラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|-----------|------|
| tabs | Array | - | 使用タブセット。`{id, title}` の配列。 `target` を指定しない場合は必須 |
| target | String | - | 検索対象（プラグインID）。省略して `tabs` を明示すると指定タブのみ表示 |
| prop | Object | - | 取得する情報（項目）。タブIDをキー、フィールド名配列を値とする |
| default_tab_id | String | - | タブの初期フォーカス（タブの `id` を指定） |
| type | String | - | 選択モード。`"single"`（単一）/ `"multiple"`（複数） |
| wnd_title | String | - | ウィンドウタイトル |
| message | String | - | タイトルバーメッセージ |
| wnd_close | Boolean | - | 選択後にウィンドウを閉じるか |
| width | Number | - | ウィンドウ幅 |
| height | Number | - | ウィンドウ高さ |
| basic_area | String | - | 基本条件エリア設定 |
| target_date | Date | - | 検索基準日 |
| target_locale | String | - | 表示ロケール |
| deleted_data | Boolean | false | 削除データを含めるか |
| default_selected | Array | - | 初期選択オブジェクト |

### ユーザ検索固有パラメータ

| パラメータ | 型 | デフォルト | 説明 |
|-----------|------|-----------|------|
| additional_disp | Boolean | - | 補足情報を表示するか |
| additional_user_search_name | Boolean | - | 検索名を表示するか |
| additional_dept | Boolean | - | 所属を表示するか |

## 検索画面タブ プラグインID

### ユーザ検索

| プラグインID | 説明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.user.list_user` | ユーザ（キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_user_non_authz` | ユーザ（キーワード・認可考慮なし） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_department` | ユーザ（会社組織・キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.user.tree_department` | ユーザ（会社組織・ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_public_group` | ユーザ（パブリックグループ・キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.user.tree_public_group` | ユーザ（パブリックグループ・ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_private_group` | ユーザ（プライベートグループ） |
| `jp.co.intra_mart.master.app.search.tabs.user.list_role` | ユーザ（ロール） |

### 会社・組織検索

| プラグインID | 説明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.company.list` | 会社（キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.department_set.tree` | 組織セット（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.department.list` | 組織（キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.department.tree` | 組織（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.company_post.tree` | 役職（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.department_post.tree` | 組織・役職（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.attached_department_post.tree` | 所属役職（ツリー） |

### パブリックグループ検索

| プラグインID | 説明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.public_group.list` | パブリックグループ（キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.public_group.tree` | パブリックグループ（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.public_group_set_role.tree` | 役割（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.public_group_role.tree` | パブリックグループ・役割（ツリー） |
| `jp.co.intra_mart.master.app.search.tabs.attached_public_group_role.tree` | 所属役割（ツリー） |

### その他の検索

| プラグインID | 説明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.private_group.list` | プライベートグループ |
| `jp.co.intra_mart.master.app.search.tabs.role.list` | ロール |
| `jp.co.intra_mart.master.app.search.tabs.account.list` | アカウント（キーワード） |
| `jp.co.intra_mart.master.app.search.tabs.application_role.list` | アプリケーションロール |

### 複合検索

| プラグインID | 説明 |
|-------------|------|
| `jp.co.intra_mart.master.app.search.tabs.department_and_role.tree_and_list` | 組織＋ロール |
| `jp.co.intra_mart.master.app.search.tabs.department_and_user_category_item.tree_and_list` | 組織＋ユーザ分類項目 |
| `jp.co.intra_mart.master.app.search.tabs.public_group_and_role.tree_and_list` | パブリックグループ＋ロール |

### スマートフォン用

| プラグインID | 説明 |
|-------------|------|
| `jp.co.intra_mart.im_master.app.search.tabs.user.department.tree_with_list.smartphone` | ユーザ検索（組織ツリー） |

## コールバック関数の引数

コールバック関数にはオブジェクトの配列が渡される。各要素の構造は以下のとおり。

| プロパティ | 型 | 説明 |
|-----------|------|------|
| keyFields | String[] | オブジェクトを一意に判別するフィールド名 |
| displayName | String | 画面表示用文字列 |
| deleteFlag | Boolean | 論理削除フラグ |
| type | String | データ型（基本テーブル名） |
| data | Object | データベースから取得したレコードの内容 |
| basic_info | Object | 基本条件情報 |

### data オブジェクトの主要フィールド

各検索タブの `type`・`keyFields` と、`data` に含まれるデフォルト取得項目を示す。
`prop` パラメータで追加指定した項目も `data` に含まれる。

#### ユーザ検索

| 項目 | 値 |
|------|------|
| type | `imm_user` |
| keyFields | `["user_cd"]` |

| フィールド | 説明 |
|-----------|------|
| user_cd | ユーザコード |
| user_name | ユーザ名 |
| delete_flag | 削除フラグ |

#### 組織検索

| 項目 | 値 |
|------|------|
| type | `imm_department` |
| keyFields | `["company_cd", "department_set_cd", "department_cd"]` |

| フィールド | 説明 |
|-----------|------|
| company_cd | 会社コード |
| department_set_cd | 組織セットコード |
| department_cd | 組織コード |
| department_name | 組織名 |
| delete_flag | 削除フラグ |

#### 会社検索

| 項目 | 値 |
|------|------|
| type | `imm_company` |
| keyFields | `["company_cd"]` |

| フィールド | 説明 |
|-----------|------|
| company_cd | 会社コード |
| department_set_cd | 組織セットコード |
| department_cd | 組織コード |
| department_name | 組織名 |
| delete_flag | 削除フラグ |

#### パブリックグループ検索

| 項目 | 値 |
|------|------|
| type | `imm_public_grp` |
| keyFields | `["public_group_set_cd", "public_group_cd"]` |

| フィールド | 説明 |
|-----------|------|
| public_group_set_cd | パブリックグループセットコード |
| public_group_cd | パブリックグループコード |
| public_group_name | パブリックグループ名 |
| delete_flag | 削除フラグ |

#### プライベートグループ検索

| 項目 | 値 |
|------|------|
| type | `imm_private_grp` |
| keyFields | `["private_grp_cd"]` |

| フィールド | 説明 |
|-----------|------|
| private_group_cd | プライベートグループコード |
| user_cd | ユーザコード |
| private_group_name | プライベートグループ名 |

#### ロール検索

| 項目 | 値 |
|------|------|
| type | `b_m_role_b` |
| keyFields | `["role_id"]` |

| フィールド | 説明 |
|-----------|------|
| role_id | ロールID |

#### アカウント検索

| 項目 | 値 |
|------|------|
| type | `b_m_account_b` |
| keyFields | `["user_cd"]` |

| フィールド | 説明 |
|-----------|------|
| user_cd | ユーザコード |

#### アプリケーションロール検索

| 項目 | 値 |
|------|------|
| type | `application_role` |

| フィールド | 説明 |
|-----------|------|
| name | アプリケーションロール名 |
| type | ロール種別 |
| applicationId | アプリケーションID |
| applicationName | アプリケーション名 |
| license | ライセンス |

## 使用例

`<imart type="head">` 内のスクリプトは本文の要素より先に実行されるため、要素の参照（`getElementById` 等）は `DOMContentLoaded` 内で行う。コールバック関数はグローバルスコープに定義し、`DOMContentLoaded` 内で `window._関数名` として公開した反映関数を経由してフォームに反映する（`.agents/requirements/jssp-presentation-page/AGENTS.md`「グローバルスコープのコールバック関数（imACMSearch 等）」）。

### ユーザ検索（キーワードのみ、単数選択）

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script>
    // コールバック関数（imACMSearch から関数名で呼び出されるため、グローバルスコープに定義する）
    function callbackFromImMaster(result) {
      // 未選択の場合は何もしない（現在の値を保持する）
      if (!result || result.length === 0) {
        return;
      }
      if (typeof window._setSelectedUser === 'function') {
        window._setSelectedUser(result[0].data.user_cd, result[0].data.user_name);
      }
    }
    // グローバルに関数を置く
    window.callbackFromImMaster = callbackFromImMaster;

    document.addEventListener('DOMContentLoaded', () => {
      // 選択結果をフォームに反映する
      function setSelectedUser(userCode, userName) {
        document.getElementById(':userCode:').value = userCode;
        document.getElementById(':userName:').value = userName;
      }
      // グローバルスコープのコールバック関数から呼び出せるように公開する
      window._setSelectedUser = setSelectedUser;

      // ユーザ名 クリック時イベント
      document.getElementById(':userName:').addEventListener('click', () => {
        const parameter = {
          tabs: [{
            id   : 'jp.co.intra_mart.master.app.search.tabs.user.list_user',
            title: 'キーワード'
          }],
          prop: {
            'jp.co.intra_mart.master.app.search.tabs.user.list_user': ['user_cd', 'user_name']
          },
          callback_function           : 'callbackFromImMaster',
          wnd_title                   : 'ユーザ検索',
          message                     : 'ユーザ検索',
          wnd_close                   : true,
          type                        : 'single'
        };

        // 検索画面を開く
        imACMSearch.open(parameter);
      });
    });
  </script>
</imart>

<!-- 本文（フォーム要素） -->
<input type="hidden" id=":userCode:" value="">
<input type="text" id=":userName:" readonly value="">
```

### ユーザ検索（キーワード＋組織ツリー、複数選択）

```html
<imart type="head">
  <!-- IM-共通マスタ検索画面呼び出し用タグ -->
  <imart type="imACMSearch" />

  <script>
    // コールバック関数（imACMSearch から関数名で呼び出されるため、グローバルスコープに定義する）
    function callbackFromImMaster(result) {
      // 未選択の場合は何もしない（現在の値を保持する）
      if (!result || result.length === 0) {
        return;
      }
      if (typeof window._setSelectedUsers === 'function') {
        window._setSelectedUsers(result);
      }
    }
    // グローバルに関数を置く
    window.callbackFromImMaster = callbackFromImMaster;

    document.addEventListener('DOMContentLoaded', () => {
      // 選択結果（複数）をフォームに反映する
      function setSelectedUsers(result) {
        const userCodes = [];
        const userNames = [];
        for (let i = 0; i < result.length; i++) {
          userCodes.push(result[i].data.user_cd);
          userNames.push(result[i].data.user_name);
        }
        document.getElementById(':userCodes:').value = userCodes.join(',');
        document.getElementById(':userNames:').value = userNames.join(', ');
      }
      // グローバルスコープのコールバック関数から呼び出せるように公開する
      window._setSelectedUsers = setSelectedUsers;

      // ユーザ名 クリック時イベント
      document.getElementById(':userNames:').addEventListener('click', () => {
        const parameter = {
          tabs: [{
            id: 'jp.co.intra_mart.master.app.search.tabs.user.list_user',
            title: 'キーワード'
          }, {
            id: 'jp.co.intra_mart.master.app.search.tabs.department.tree',
            title: '組織（ツリー）'
          }],
          prop: {
            'jp.co.intra_mart.master.app.search.tabs.user.list_user': ['user_cd', 'user_name']
          },
          default_tab_id    : 'jp.co.intra_mart.master.app.search.tabs.department.tree',
          callback_function : 'callbackFromImMaster',
          wnd_title         : 'ユーザ検索',
          wnd_close         : true,
          type              : 'multiple'
        };

        // 検索画面を開く
        imACMSearch.open(parameter);
      });
    });
  </script>
</imart>

<!-- 本文（フォーム要素） -->
<input type="hidden" id=":userCodes:" value="">
<input type="text" id=":userNames:" readonly value="">
```

## 注意事項

- `<imart type="imACMSearch" />` タグは HTML の `<head>` タグ内に配置すること
- コールバック関数はグローバルスコープで定義すること（即時関数内では参照できない）
- コールバック関数から `DOMContentLoaded` 内の関数は直接参照できないため、`window._関数名` として公開した関数を経由してフォームに反映すること。要素の参照（`getElementById` 等）は `<imart type="head">` 内のスクリプトの読み込み時ではなく `DOMContentLoaded` 内で行うこと
- コールバック関数の `result` が空（未選択）の場合は何もせず、現在の値を保持すること
- `target` を指定すると、その対象に紐づくタブが全て有効になる。特定タブのみ表示したい場合は `target` を省略して `tabs` で指定する
- `target` を不適切に設定すると parseJSON エラーが発生する場合がある
- `prop` に渡すフィールド名はタブ実装が返すキーと一致している必要がある
- `target_locale` は検索画面の表示ロケールである。ログインユーザのロケールで表示する場合は `'ja'` 等を直書きせず、ファンクションコンテナで `$targetLocale = Contexts.getAccountContext().locale;` をバインドし、`target_locale: '<imart type="string" value=$targetLocale escapeXml="false" escapeJs="true"></imart>'` として出力すること（`.agents/requirements/jssp-presentation-page/AGENTS.md`「JavaScript の文字列リテラルとして使用する場合」）
