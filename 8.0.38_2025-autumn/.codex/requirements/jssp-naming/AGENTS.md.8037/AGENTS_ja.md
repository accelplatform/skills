# 命名規則

> **適用範囲**: 🟢 **常時** — ファイル・関数・変数の命名すべてに適用。

## 命名規則一覧

| 対象 | 規則 | 例 |
|------|------|-----|
| ファイル名 | スネークケース | `user_master.js` |
| 関数名 | キャメルケース | `getUserInfo`, `validateInput` |
| 変数名 | キャメルケース | `userId`, `itemList` |
| 定数 | 大文字スネークケース | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| バインド変数 | `$` + キャメルケース | `$data`, `$formData`, `$pageInfo` |

## 関数名

### 命名パターン

| プレフィックス | 用途 | 例 |
|--------------|------|-----|
| `get` | データ取得 | `getUserInfo`, `getItemList` |
| `set` | データ設定 | `setUserStatus`, `setDefaultValue` |
| `is` / `has` | 真偽値を返す | `isValid`, `hasPermission` |
| `validate` | 検証処理 | `validateInput`, `validateUserData` |
| `create` | 新規作成 | `createUser`, `createOrder` |
| `update` | 更新処理 | `updateUser`, `updateStatus` |
| `delete` | 削除処理 | `deleteUser`, `deleteItem` |
| `search` | 検索処理 | `searchUsers`, `searchItems` |
| `convert` | 変換処理 | `convertToJson`, `convertDateFormat` |
| `format` | 整形処理 | `formatDate`, `formatNumber` |

## 変数名

良い例:
```javascript
let userId = 'user001'; // 意味が明確
let userList = []; // 複数形でリストを表現
let isActive = true; // 真偽値は is/has プレフィックス
let maxRetryCount = 3; // 意味のある名前
let startDate = new Date(); // 日付であることが明確
```

悪い例:
```javascript
let a = 'user001'; // 意味不明
let data = []; // 何のデータか不明
let flag = true; // 何のフラグか不明
let tmp = getUser(); // 一時変数の乱用
let list1 = []; // 連番は避ける
```

## 定数

```javascript
// ファイル先頭で定義
let MAX_RETRY_COUNT = 3;
let DEFAULT_TIMEOUT = 30000;
let STATUS_ACTIVE = 'active';
let STATUS_INACTIVE = 'inactive';
let ERROR_CODE_NOT_FOUND = 'E001';
let ERROR_CODE_INVALID_INPUT = 'E002';
```

## バインド変数

プレゼンテーションページへ受け渡す変数には `$` プレフィクスを付与する。

### バインド変数の定義（ファンクションコンテナ）

```javascript
// バインド変数（プレゼンテーションページ連携用）
let $title = '画面タイトル';        // 画面自体の名称
let $subTitle = 'サブタイトル';     // 画面のサブ名称（画面が所属するカテゴリの名称）
let $data = '{}';

function init(request) {
  let response = {
    result: {
      userCode: '',
      userFirstName: '',
      userLastName: '',
      age: '',
    },
    error: {
      code: '',
      message: '',
    },
  };
  // JSON 内に </script> が含まれていると、スクリプトが終了してしまうため、
  // レスポンス中の '/' を '\/' に全置換する
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

### バインド変数の使用（プレゼンテーションページ）

```html
<!-- タイトル表示 -->
<title>
  <imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> -
  <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart>
</title>

<script>
  // バインド変数の場合のみ、value="$data" と書いてはならず、value=$data のようにクォートを使用せず書く
  // バインド変数以外については、type='string' と書いてはならず、type="string" のように必ずダブルクォートで囲む
  // これは imart タグ独自の仕様によるもの
  const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

  document.addEventListener('DOMContentLoaded', () => {
    // 各種 function は、外部から直接実行されないようにするため、
    // DOMContentLoaded イベント内に定義する

    function initializeView(result) {
      // TODO: ここに画面の初期化処理を追加します
    }

    // エラーチェック
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeView($data.result);
    }
  });
</script>
```

### バインド変数と通常変数の区別

```javascript
// バインド変数（プレゼンテーションページへ渡す）
let $title = '画面タイトル';        // 画面自体の名称
let $subTitle = 'サブタイトル';     // 画面のサブ名称（画面が所属するカテゴリの名称）
let $data = '{}';

// ローカル変数（関数内で使用）
let tempList = []; // プレフィクスなし
let processedData = {};
```

## 省略形の禁止

変数名・関数名・引数名は **省略せずフルスペルで書く** ことを原則とする。
省略すると意味の取り違えやコードレビュー時の認知負荷増加につながるため、文字数の短さよりも明確さを優先する。

### 禁止する省略形の例

| NG: 省略形 | OK: フルスペル |
|----------|-------------|
| `btn` | `button` |
| `msg` | `message` |
| `err` / `e`（catch 引数を除く） | `error` |
| `req` | `request` |
| `res` | `response` |
| `el` / `elem` | `element` |
| `idx` | `index` |
| `cnt` | `count` |
| `num` | `number` |
| `str` | `string` |
| `val` | `value` |
| `param` | `parameter`（複数形は `parameters`） |
| `prop` | `property` |
| `arr` | `array` |
| `obj` | `object` |
| `func` / `fn` | `function` |
| `ctx` | `context` |
| `cfg` / `conf` | `config` / `configuration` |
| `tmp` | `temporary` または用途を示した名前 |
| `dlg` | `dialog` |
| `ok` | （ボタンなら `okButton` など、文脈で意味を補う） |

### 許容される例外

以下は省略形を許容する。

- **広く定着した略語**: `id`, `url`, `uri`, `html`, `css`, `json`, `xml`, `api`, `ui`, `db`, `i18n`, `a11y`
- **ループカウンタの `i` / `j` / `k`**: 短いループ内のインデックス変数
- **`catch (e)`**: 例外オブジェクトの引数名としての `e`
- **業務上の正式略語**: `vat`（付加価値税）など、業務ドメインで標準化されている略語

### 良い例 / 悪い例

```javascript
// 悪い例:
const okBtn = dialog.querySelector('.ok');
const cancelBtn = dialog.querySelector('.cancel');
const msg = req.getParameter('msg');
const errMsg = e.message;
const userArr = [];

// 良い例:
const okButton = dialog.querySelector('.ok');
const cancelButton = dialog.querySelector('.cancel');
const message = request.getParameter('message');
const errorMessage = e.message;
const userList = [];
```

## 予約語との衝突回避

以下の名前は使用を避けること:
- JavaScript 予約語: `class`, `function`, `return`, `var`, `if`, `else` 等
- イントラマート予約語: `request`, `response`, `session`, `Contexts` 等
- グローバルオブジェクト: `Debug`, `Logger`, `Database` 等
