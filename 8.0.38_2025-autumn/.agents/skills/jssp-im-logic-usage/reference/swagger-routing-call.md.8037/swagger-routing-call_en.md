# IM-LogicDesigner swagger spec Structure Reference / Call Code Patterns

## Overview of the swagger spec

`<BASE-URL>/logic/all-api-docs` returns the IM-LogicDesigner routing definitions registered in the tenant (imported as `flow_route.json`) in **Swagger 2.0** format.

Top-level structure:

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

## Reading `paths`

Each route is defined at `paths["/logic/api/<route>"][<method>]`. `<method>` is one of `get` / `post` / `put` / `delete` (lowercase).

```jsonc
{
  "summary": "Description for display",
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
      "description": "When the flow executes successfully",
      "schema": { "$ref": "#/definitions/Model_<route>_1_out_root" }
    }
  },
  "tags": ["<feature group name>"],
  "security": []
}
```

- **Request parameters**: The `schema.$ref` of the `name: "body"` element in the `parameters` array points to the input data definition.
- **Response**: `responses.default.schema.$ref` points to the output data definition. intra-mart always uses only the `default` key (no per-status-code definitions).
- **`security`**: An empty array `[]` means no securityDefinitions (Basic auth) are required for that routing. A non-empty array means Basic auth etc. is required.

## Resolving `$ref` (definitions)

`$ref: "#/definitions/Xxx"` refers to `definitions.Xxx` at the top level. `properties` defines the property names and types.

```jsonc
"Model_sample-accounts_1_in_root": {
  "type": "object",
  "properties": {
    "user_cd": { "type": "string" }
  }
}
```

Arrays and nested objects chain through `$ref` in the same way (e.g. `items.$ref` for array element types). Use `scripts/fetch-logic-swagger.js --route <keyword>` to get this chain automatically inlined — there is no need to walk it manually.

### Type mapping (swagger → JS)

| swagger `type` | Notes | JS-side handling |
|---|---|---|
| `string` | Plain string unless `format` is given | `string` |
| `integer` / `number` | May carry `format: "int32"` etc. | `number` |
| `boolean` | | `boolean` |
| `array` | Element type in `items` | `Array` |
| `object` | Child properties in `properties` | object literal |

## fetch call code patterns

### Basic form (sending a JSON body)

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
    imuiShowErrorMessage('Failed to call the logic flow API. (HTTP ' + response.status + ')');
    return null;
  }

  const result = await response.json();
  return result.records;
}
```

### Implementation policy

- Specify the URL as a **relative path** `logic/api/<route>` (per the URL policy in `jssp-presentation-page.md`; the context path is resolved via the `<base>` tag emitted by `<imart type="head">`)
- **Judge success/failure by `response.ok` (HTTP status).** The JSSP-specific `{error, errorMessage}` response convention (`jssp-error-handling.md`) applies only to self-authored `api/*.js` defined in `routing-jssp-config`, not to IM-LogicDesigner routing. The response body is the flow's `outputDataDefinition` itself.
- The response `Content-Type` depends on the routing definition's `responseType` (`application/json` for `imJsonResponse`, plain text for `imTextResponse`, etc.). If `definitions` shows a structured set of properties, `imJsonResponse` is likely, but when unsure, check the `Content-Type` header before calling `response.json()`, or read with `.text()` and parse safely.
- Use `async`/`await` for asynchronous code
- Only attach the secure token (`X-Intramart-Secure-Token`) header when the target routing is confirmed to have `secured: true` (this information does not appear in the swagger spec — confirm via the routing definition or on the real server)

### Body parameter on GET (known caveat)

In intra-mart's swagger generation, routes registered as GET may still have `parameters[].in` set to `"body"`. However, the browser `fetch` API **cannot include an HTTP body on a GET/HEAD request** (it throws `TypeError: Request with GET/HEAD method cannot have body`).

If the target route is GET and takes input parameters, implement using one of the following, and **always verify against the real server** (the spec alone cannot confirm the actual receiving mechanism):

1. Attach the body-equivalent properties as query parameters on the URL
   ```javascript
   const params = new URLSearchParams({ user_cd: userCd });
   const response = await fetch('logic/api/sample/accounts?' + params.toString(), {
     method: 'GET'
   });
   ```
2. If no input parameters are needed (empty object), simply issue the GET without a body

Verify with the browser devtools or server logs which approach is correct, and ask the user to confirm on the real server as well.

### When the response has array/nested structure

Nested structures such as `definitions`' `properties.records.items` can be walked directly from the fetched JSON (the actual response data structure matches the `properties` hierarchy in the spec).

```javascript
const result = await response.json();
// result.records is an array (expansion of Model_..._out_im_logic_object_1Array)
result.records.forEach((record) => {
  // record.user_cd, record.create_date, etc.
});
```

## Reference documents

- Routing response configuration: `jssp-im-logic-generator/reference/routing-response.md`
- Routing definition schema (`secured`, `authentication`, `authzUri`, etc.): `jssp-im-logic-generator/reference/route_definition.schema.json`
- intra-mart official documentation: https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/routing/index.html
