# IM-LogicDesigner swagger spec 结构参考・调用代码模式

## swagger spec 概述

`<BASE-URL>/logic/all-api-docs` 会以 **Swagger 2.0** 格式返回租户中已注册的 IM-LogicDesigner 路由定义（作为 `flow_route.json` 导入的内容）。

顶层结构：

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

## paths 的解读方法

各 route 定义在 `paths["/logic/api/<route>"][<method>]`。`<method>` 为 `get` / `post` / `put` / `delete` 之一（小写）。

```jsonc
{
  "summary": "画面显示用说明文",
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
      "description": "流程执行成功时",
      "schema": { "$ref": "#/definitions/Model_<route>_1_out_root" }
    }
  },
  "tags": ["<功能分组名>"],
  "security": []
}
```

- **请求参数**：`parameters` 数组中 `name: "body"` 元素的 `schema.$ref` 指向输入数据定义。
- **响应**：`responses.default.schema.$ref` 指向输出数据定义。intra-mart 始终只使用 `default` 键（没有按状态码单独定义）。
- **`security`**：为空数组 `[]` 时，表示该路由不需要 securityDefinitions（Basic 认证）。非空时需要 Basic 认证等。

## definitions（$ref）的解析

`$ref: "#/definitions/Xxx"` 指向顶层的 `definitions.Xxx`。`properties` 中定义了属性名与类型。

```jsonc
"Model_sample-accounts_1_in_root": {
  "type": "object",
  "properties": {
    "user_cd": { "type": "string" }
  }
}
```

数组、嵌套对象同样通过 `$ref` 连锁引用（如 `items.$ref` 指向数组元素的类型）。使用 `scripts/fetch-logic-swagger.js --route <关键字>` 可自动将该连锁内联展开，无需手动追踪。

### 类型对照表（swagger → JS）

| swagger `type` | 备注 | JS 侧处理 |
|---|---|---|
| `string` | 无 `format` 时为普通字符串 | `string` |
| `integer` / `number` | 可能带有 `format: "int32"` 等 | `number` |
| `boolean` | | `boolean` |
| `array` | `items` 中定义元素类型 | `Array` |
| `object` | `properties` 中定义子属性 | 对象字面量 |

## fetch 调用代码模式

### 基本形式（以 JSON body 发送）

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
    imuiShowErrorMessage('调用逻辑流程API失败。(HTTP ' + response.status + ')');
    return null;
  }

  const result = await response.json();
  return result.records;
}
```

### 实现方针

- URL 以 **相对路径** `logic/api/<route>` 指定（遵循 `jssp-presentation-page.md` 的 URL 指定方针，上下文路径通过 `<imart type="head">` 输出的 `<base>` 标签解析）
- **成功/失败判定使用 `response.ok`（HTTP 状态码）。** JSSP 独有的 `{error, errorMessage}` 响应规约（`jssp-error-handling.md`）仅适用于 `routing-jssp-config` 中定义的自有 `api/*.js`，不适用于 IM-LogicDesigner 路由。响应体即为流程的 `outputDataDefinition` 本身。
- 响应的 `Content-Type` 取决于路由定义的 `responseType`（`imJsonResponse` 为 `application/json`，`imTextResponse` 等为纯文本）。若 spec 的 `definitions` 中定义了结构化属性，则很可能是 `imJsonResponse`，但无法确定时，应在调用 `response.json()` 前检查 `Content-Type` 头，或先用 `.text()` 读取后再安全解析。
- 异步处理使用 `async`/`await`
- 仅在确认目标路由 `secured: true` 时才在请求头中附加安全令牌（`X-Intramart-Secure-Token`）（此信息不会出现在 swagger spec 中，需通过路由定义侧的设置或实机确认判断）

### GET 方法下的 body 参数（已知注意事项）

在 intra-mart 的 swagger 生成中，即使是以 GET 注册的 route，`parameters[].in` 也可能被记述为 `"body"`。但浏览器的 `fetch` API **无法为 GET/HEAD 方法的请求附加 HTTP body**（会抛出 `TypeError: Request with GET/HEAD method cannot have body` 异常）。

若目标 route 为 GET 且带有输入参数，应采用以下任一方式实现，并**务必在实机环境中验证**（仅凭 spec 无法确定实际的接收方式）：

1. 将 body 对应的属性作为查询参数附加到 URL 上
   ```javascript
   const params = new URLSearchParams({ user_cd: userCd });
   const response = await fetch('logic/api/sample/accounts?' + params.toString(), {
     method: 'GET'
   });
   ```
2. 若不需要输入参数（空对象），则直接以不带 body 的方式发起 GET 请求

应通过浏览器开发者工具或服务器日志确认哪种方式正确，并请用户在实机环境中一并确认。

### 响应含有数组・嵌套结构时

`definitions` 中 `properties.records.items` 等嵌套结构，可直接按获取到的 JSON 追踪（响应的实际数据结构与 spec 的 `properties` 层级一致）。

```javascript
const result = await response.json();
// result.records 为数组（Model_..._out_im_logic_object_1Array 的展开结果）
result.records.forEach((record) => {
  // record.user_cd, record.create_date 等
});
```

## 参考文档

- 路由响应设置：`jssp-im-logic-generator/reference/routing-response.md`
- 路由定义 schema（`secured`、`authentication`、`authzUri` 等）：`jssp-im-logic-generator/reference/route_definition.schema.json`
- intra-mart 官方文档：https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/routing/index.html
