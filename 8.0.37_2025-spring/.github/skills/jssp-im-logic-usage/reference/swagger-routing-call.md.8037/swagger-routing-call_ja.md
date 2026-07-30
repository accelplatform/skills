# IM-LogicDesigner swagger spec 構造リファレンス・呼び出しコードパターン

## swagger spec の概要

`<BASE-URL>/logic/all-api-docs` は、テナントに登録済みの IM-LogicDesigner ルーティング定義（`flow_route.json` として import されたもの）を **Swagger 2.0** 形式で返却する。

トップレベル構造:

```jsonc
{
  "swagger": "2.0",
  "info": { "title": "IM-LogicDesigner REST API", "version": "8.0.xx-PATCH_xxx" },
  "host": "127.0.0.1",
  "basePath": "/imart",
  "schemes": ["http"],
  "securityDefinitions": { "im_basic": { "type": "basic" } },
  "tags": [ { "name": "...", "description": "..." }, ... ],
  "paths": { "/logic/api/<route>": { "<method>": { ... } }, ... },
  "definitions": { "Model_<...>_in_root": { ... }, "Model_<...>_out_root": { ... }, ... }
}
```

## paths の読み方

各 route は `paths["/logic/api/<route>"][<method>]` に定義される。`<method>` は `get` / `post` / `put` / `delete` のいずれか（小文字）。

```jsonc
{
  "summary": "画面表示用の説明文",
  "operationId": "operation_...",
  "parameters": [
    {
      "name": "body",
      "in": "body",
      "schema": { "$ref": "#/definitions/Model_<route>_1_in_root" }
    }
  ],
  "responses": {
    "default": {
      "description": "フローの実行に成功した場合",
      "schema": { "$ref": "#/definitions/Model_<route>_1_out_root" }
    }
  },
  "tags": ["<機能グループ名>"],
  "security": []
}
```

- **リクエストパラメータ**: `parameters` 配列内の `name: "body"` 要素の `schema.$ref` が入力データ定義を指す。
- **レスポンス**: `responses.default.schema.$ref` が出力データ定義を指す。intra-mart は常に `default` キーのみを使用する（個別のステータスコード別定義は無い）。
- **`security`**: 空配列 `[]` の場合、そのルーティングでは securityDefinitions（Basic認証）が要求されていないことを示す。空でない場合は Basic認証等が必要。

## definitions（$ref）の解決

`$ref: "#/definitions/Xxx"` は、トップレベルの `definitions.Xxx` を指す。`properties` にプロパティ名と型が定義される。

```jsonc
"Model_sample-accounts_1_in_root": {
  "type": "object",
  "properties": {
    "user_cd": { "type": "string" }
  }
}
```

配列・ネストしたオブジェクトも同様に `$ref` で連鎖する（`items.$ref` で配列要素の型を指す等）。`scripts/fetch-logic-swagger.js --route <キーワード>` を使えば、この連鎖を自動的にインライン展開した状態で取得できるため、手動でたどる必要はない。

### 型対応表（swagger → JS）

| swagger `type` | 備考 | JS 側での扱い |
|---|---|---|
| `string` | `format` が無ければ通常文字列 | `string` |
| `integer` / `number` | `format: "int32"` 等が付与される場合がある | `number` |
| `boolean` | | `boolean` |
| `array` | `items` に要素の型定義 | `Array` |
| `object` | `properties` に子プロパティ | オブジェクトリテラル |

## fetch 呼び出しコードパターン

### 基本形（JSON ボディで送信するケース）

```javascript
async function callSampleAccounts(userCd) {
  const response = await fetch('logic/api/sample/accounts', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_cd: userCd })
  });

  if (!response.ok) {
    imuiShowErrorMessage('ロジックフローAPIの呼び出しに失敗しました。(HTTP ' + response.status + ')');
    return null;
  }

  const result = await response.json();
  return result.records;
}
```

### 実装方針

- URLは `logic/api/<route>` を **相対パス** で指定する（`jssp-presentation-page.md` の URL 指定方針に準拠。コンテキストパスは `<imart type="head">` の `<base>` タグにより解決される）
- **エラー判定は `response.ok`（HTTPステータス）で行う。** JSSP 独自の `{error, errorMessage}` 形式のレスポンス規約（`jssp-error-handling.md`）は、`routing-jssp-config` で定義される自前の `api/*.js` にのみ適用されるものであり、IM-LogicDesigner のルーティングにはこの規約は適用されない。レスポンスボディはフローの `outputDataDefinition` そのものである。
- レスポンスの `Content-Type` は、ルーティング定義の `responseType` に依存する（`imJsonResponse` なら `application/json`、`imTextResponse` 等ならプレーンテキスト）。spec の `definitions` に構造化されたプロパティが定義されている場合は `imJsonResponse` である可能性が高いが、確証が持てない場合は `response.json()` の前に `Content-Type` ヘッダを確認するか、`.text()` で受けてから安全にパースすること。
- 非同期処理は `async`/`await` を使用する
- セキュアトークン（`X-Intramart-Secure-Token`）は、対象ルーティングの `secured: true` が確認できている場合のみヘッダに付与する（swagger spec には出てこない情報のため、ルーティング定義側の設定 or 実機確認で判断する）

### GET メソッドでの body パラメータ（既知の注意点）

intra-mart の swagger 生成では、GET で登録されたルートであっても `parameters[].in` が `"body"` として記述されることがある。しかし、ブラウザの `fetch` API は **GET/HEAD メソッドのリクエストにHTTPボディを含めることができない**（`TypeError: Request with GET/HEAD method cannot have body` で例外になる）。

対象ルートが GET かつ入力パラメータを持つ場合、以下のいずれかで実装し、**必ず実機で動作確認すること**（spec だけでは実際の受け取り方式を確定できない）。

1. body 相当のプロパティをクエリパラメータとして URL に付与する
   ```javascript
   const params = new URLSearchParams({ user_cd: userCd });
   const response = await fetch('logic/api/sample/accounts?' + params.toString(), {
     method: 'GET'
   });
   ```
2. 入力パラメータが不要（空オブジェクト）であれば、そのまま body 無しで GET する

いずれの方式が正しいかは、実際にブラウザの開発者ツールやサーバログで確認し、ユーザにも実機確認を依頼すること。

### レスポンスが配列・ネスト構造を持つ場合

`definitions` の `properties.records.items` 等、ネストした構造は取得した JSON をそのまま辿ってよい（レスポンスの実データ構造は spec の `properties` 階層と一致する）。

```javascript
const result = await response.json();
// result.records は配列（Model_..._out_im_logic_object_1Array の展開結果）
result.records.forEach((record) => {
  // record.user_cd, record.create_date 等
});
```

## 参考ドキュメント

- ルーティングのレスポンス設定: `jssp-im-logic-generator/reference/routing-response.md`
- ルーティング定義スキーマ（`secured`・`authentication`・`authzUri` 等）: `jssp-im-logic-generator/reference/route_definition.schema.json`
- intra-mart 公式ドキュメント: https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/routing/index.html
