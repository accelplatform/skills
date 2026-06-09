# User-Defined Task Reference

In addition to regular tasks (`key.type = "application"`), IM-LogicDesigner provides **user-defined tasks** (`key.type = "localUserDefinition"`) where users can freely define input/output and logic.

## Differences from Regular Tasks

| Item | Regular Task | User-Defined Task |
|---|---|---|
| `key.type` | `"application"` | `"localUserDefinition"` |
| `key.id` | Fixed (`im_repositorySearchEntityData`, etc.) | User-specified `definitionId` |
| properties | Simple task-specific properties | All information contained within the `definition` object |
| Input/output definition | Within dataMap metadata (fixed template or MCP-resolved) | Within `properties.definition.definitionData` (freely defined) |

## Common Structure of properties.definition

```jsonc
{
  "definition": {
    "definitionId": "<unique ID>",
    "version": 1,
    "categoryId": "",
    "definitionType": "javascript",   // "javascript" | "rest" | "sql" | "db_fetch"
    "definitionName": "<display name (English)>",
    "sortNumber": 100,
    "definitionData": {
      "elementId": "<internal task ID>",
      "iconId": null,
      "elementProperties": { ... },   // Type-specific settings (described below)
      "inputDataDefinition": { ... }, // Input type definition (freely defined)
      "outputDataDefinition": { ... } // Output type definition (freely defined)
    },
    "localize": {
      "ja": "<Japanese name>"
    }
  },
  "continueOnError": false
}
```

## Type List

### 1. JavaScript Definition (`definitionType: "javascript"`)

A task where users can freely write JavaScript.
Runs on Rhino and follows the same coding conventions as function containers.

| Item | Value |
|---|---|
| `elementId` | `im_scriptExecutor` |
| Main properties | `script` (Rhino JavaScript code) |

**`elementProperties`:**

```jsonc
{
  "script": "function run(input) {\n  // Get values from input and return the processed result\n  return { message: 'hello' };\n}"
}
```

- The `run(input)` function is executed
- `input` has the fields defined in `inputDataDefinition`
- The return value must match the structure defined in `outputDataDefinition`

**Unavailable APIs:**

While IM-LogicDesigner JavaScript definitions can use various JSSP APIs, the following APIs cannot be used.

| Category | Unavailable APIs |
|---|---|
| Java Integration | `java`, `Packages`, `loadClass` |
| File / URL | `readFile`, `readUrl` |
| Runtime Control | `seal`, `serialize`, `spawn`, `sync`, `version` |
| Request Control | `execute`, `forward`, `include`, `load`, `redirect`, `secureRedirect`, `transmission` |
| File / Content | `Content`, `File` |
| Utilities | `ImAjaxUtil`, `LicenseRegister`, `Web`, `Transfer`, `Module`, `Procedure` |
| DB | `SystemDatabase` |
| Storage | `SystemStorage` |
| Managers | `PageManager`, `AdministratorManager`, `TenantInfoManager`, `WorkManager`, `PluginManager`, `VirtualTenantSwitcher` |
| Session / Client | `Client`, `Permanent` |
| Tenant / License | `TenantLicense`, `CustomerSuccessLicense`, `ImServiceRestrictor` |
| Other | `Imart`, `garbageCollector` |
| v7.2 Compatible (unsupported) | `BatchManager`, `BatchServer`, `System`, `DataSourceMappingConfigurater`, `JsTestSuite`, `JsUnit`, `ResinDataSourceConfigurater`, `Batch`, `AccessSecurityManager`, `ActiveSessionManager`, `DuplicateLoginManager`, `LicenseManager`, `LoginBlockManager`, `LoginGroupManager`, `AdminMenuManager`, `AdminUserManager`, `ShortCutManager`, `WSAccessManager` |

Using these will result in a runtime error. As an alternative, use REST definition tasks or SQL definition tasks for external integration.

### 2. REST Definition (`definitionType: "rest"`)

A task that performs arbitrary HTTP/HTTPS requests.
Equivalent to the browser's fetch.

| Item | Value |
|---|---|
| `elementId` | `im_httpclient` |

**`elementProperties`:**

```jsonc
{
  "endpointExpression": "https://api.example.com/items",
  "requestMethod": "GET",                  // "GET" | "POST" | "PUT" | "DELETE", etc.
  "requestType": "x-www-form-urlencoded",  // "x-www-form-urlencoded" | "json", etc.
  "requestHeaderNames": ["User-Agent"],
  "requestHeaderExpressions": ["MyApp/1.0"],
  "requestEncoding": "UTF-8",
  "requestFormKeys": ["Param1"],
  "requestFormValueExpressions": ["${param1}"],  // Reference input values with EL expressions
  "followRedirect": true,
  "requestTimeoutInSeconds": 30,
  "responseType": "text",                  // "text" | "binary"
  "responseEncoding": "UTF-8",
  "checkStatusCode": true
}
```

- Use `${<input field name>}` in `requestFormValueExpressions` to embed input values as parameters (PathVariables)
- Freely specify headers with `requestHeaderNames` / `requestHeaderExpressions`

**Standard Output Types:**

| Field | Type | Description |
|---|---|---|
| `status.statusCode` | integer | HTTP status code |
| `status.statusMessage` | string | HTTP status message |
| `headers` | map | Response headers |
| `body` | string | Response body |

### 3. SQL Definition (`definitionType: "sql"`)

A task that executes arbitrary SQL.
Uses 2way-sql.

| Item | Value |
|---|---|
| `elementId` | `im_queryExecutor` |

**`elementProperties`:**

```jsonc
{
  "query": "SELECT\n    id\n  , name\n  , status\nFROM\n    your_table\nWHERE\n    id = /*param1*/'dummyId'\nORDER BY\n    id ASC",
  "queryType": "SELECT",         // "SELECT" | "INSERT" | "UPDATE" | "DELETE"
  "databaseType": "TENANT",      // "TENANT" | "SHARED"
  "connectId": "default",
  "limitation": false
}
```

- Bind input values within `query` using `/*<input field name>*/` (2way-sql syntax)
- Same mechanism as the 2way-sql conventions in jssp
- **`query` should be properly line-broken with `\n`** — Do not put on one line; break at keywords such as SELECT / FROM / WHERE / ORDER BY for readability

#### Notes on LIKE Search (LIKE Pattern Injection Countermeasure)

When using the LIKE operator, the same countermeasures as the "LIKE Search Escaping" in `jssp-2way-sql.md` are required.

1. **Always append an `ESCAPE '\'` clause to the SQL**
2. **Escape LIKE special characters (`\`, `%`, `_`) and append wildcards on the server side** — Do not send `%keyword%` from the client
3. **In logic flows, perform the escaping with a `user_javascript` task** (placed before the SQL task)

```jsonc
// Example script in user_javascript task
{
  "script": "function run(input) {\n  let keyword = input.keyword || '';\n  let escaped = keyword\n    .replace(/\\\\/g, '\\\\\\\\')\n    .replace(/%/g, '\\\\%')\n    .replace(/_/g, '\\\\_');\n  return { keyword: '%' + escaped + '%' };\n}"
}
```

```
Flow structure: im_start → [JS: Escape processing] → [SQL: LIKE search] → im_end
```

**Standard Output Types for SELECT:**

| Field | Type | Description |
|---|---|---|
| `records` | list | Array of result records |
| `count` | integer | Record count |
| `query` | string | Executed SQL statement |

### 4. Database Fetch Definition (`definitionType: "db_fetch"`)

A task dedicated to SELECT that retrieves data one row at a time in a loop.
More memory-efficient than SQL definition when handling large numbers of records.

| Item | Value |
|---|---|
| `elementId` (start) | `im_startDbFetch` |

**`elementProperties`:**

```jsonc
{
  "query": "SELECT * FROM your_table WHERE id = /*param1*/'dummyId' ORDER BY id ASC",
  "databaseType": "TENANT",
  "connectId": "default",
  "fetchSize": "10",
  "limitation": false
}
```

- Specify the number of rows to fetch with `fetchSize`

#### Start/End Pair Structure

Database Fetch consists of **2 flowElements**:

| Element | key.id | Role |
|---|---|---|
| Start | `<definitionId>` (e.g., `sample-db-fetch`) | Loop start / SQL execution |
| End | `$<definitionId>$` (e.g., `$sample-db-fetch$`) | Loop end |

End element `properties`:
```jsonc
{ "startPoint": "sample-db-fetch" }
```

**Flow Structure:**
```
→ sample-db-fetch → [Loop processing] → $sample-db-fetch$ →
```

Within the loop processing, `item` (data for 1 row) can be referenced from the start element's output.

**Output Types:**

| Field | Type | Description |
|---|---|---|
| `item.<column name>` | Each column's type | Data for the current row |

### 5. Template Definition (`definitionType: "template"`)

A task that uses the FreeMarker template engine to generate text from input data.
Used for generating email bodies and reports.

| Item | Value |
|---|---|
| `elementId` | `im_templateProcessor` |

**`elementProperties`:**

```jsonc
{
  "defaultTemplate": "<#setting url_escaping_charset=\"UTF-8\">\nHello, ${userName}.\n...",
  "localizedTemplate": {
    "ja": "",      // Locale-specific template (uses defaultTemplate if empty)
    "en": "",
    "zh_CN": ""
  }
}
```

- Write the FreeMarker syntax template in `defaultTemplate`
- Can be overridden per locale with `localizedTemplate` (empty string = use defaultTemplate)
- Reference fields of the input data's `data` object inside the template using `${fieldName}`

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `locale` | locale | Locale for template selection |
| `data` | object | Data to pass to the template (freely defined) |

**Output Types:**

| Field | Type | Description |
|---|---|---|
| `output` | string | String result of template processing |

## How to Write User-Defined Tasks in spec.json

```jsonc
{
  "type": "user_javascript",         // Template name
  "label": "Mail Send Processing",
  "userDefinition": {
    "definitionId": "mail_sender",
    "definitionType": "javascript",
    "definitionName": "mail sender",
    "localize": { "ja": "メール送信処理" },
    "elementProperties": {
      "script": "function run(input) { ... }"
    },
    "inputDataDefinition": { ... },
    "outputDataDefinition": { ... }
  }
}
```

Write the definition content in the `userDefinition` field.
`build-flow.js` converts it to the `properties.definition` structure.

## When to Use SQL Definition vs. Database Fetch Definition

| Situation | Recommendation |
|---|---|
| Want to retrieve all results as an array | SQL Definition |
| Small number of records (up to a few hundred) | SQL Definition |
| Large number of records (thousands or more) | Database Fetch Definition |
| Want to process one row at a time sequentially | Database Fetch Definition |
| INSERT / UPDATE / DELETE | SQL Definition (Database Fetch is SELECT only) |
