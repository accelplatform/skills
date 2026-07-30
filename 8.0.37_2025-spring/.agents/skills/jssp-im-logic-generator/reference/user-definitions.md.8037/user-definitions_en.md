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

### 6. Stored Procedure Definition (`definitionType: "stored"`)

A task that calls a database stored procedure / function.
It is equivalent to a JDBC CallableStatement and can handle IN / OUT parameters and result sets.

| Item | Value |
|---|---|
| `elementId` | `im_storedExecutor` |

**`elementProperties`:**

```jsonc
{
  "sql": "{ /*param3*/ = call my_func(/*param1*/, /*param2*/) }",
  "databaseType": "TENANT",   // "TENANT" | "SHARED"
  "connectId": "default"
}
```

- Write `sql` using the JDBC CallableStatement escape syntax (`{ call ... }` / `{ ?= call ... }`).
- Placeholders use the 2way-sql syntax `/*<input field name>*/`.
  - **IN parameters**: reference an input field defined in `inputDataDefinition`, e.g. `/*param1*/`.
  - **OUT parameters (including return value)**: reference a field defined under `outParameters` in `outputDataDefinition`, e.g. `/*param3*/`.
- `databaseType` / `connectId` work the same as in the SQL Definition (target database selection).

**Standard Output Types:**

| Field | Type | Description |
|---|---|---|
| `outParameters.<name>` | type of each OUT parameter | OUT parameters / return value (e.g. receive `param3` as `bigdecimal`) |
| `resultSets` | object | Result sets returned by the procedure (empty if none) |

- Define OUT parameters / return values under `outParameters`. Match the type to the called procedure's definition (e.g. `bigdecimal` for numeric).
- If the procedure returns a result set, define the column structure under `resultSets`.

### 7. CSV Fetch Definition (`definitionType: "csv_fetch"`)

A task that reads a CSV file on storage one row at a time and iterates.
It has the same **start/end pair structure** as Database Fetch, and can process a large CSV sequentially with low memory.

| Item | Value |
|---|---|
| `elementId` (start) | `im_startCsvFetch` |

**`elementProperties`:**

```jsonc
{
  "encoding": "UTF-8",          // File encoding
  "quoteCharacter": "\"",       // Quote character
  "delimiterCharacter": ",",    // Delimiter character
  "endOfLineSymbols": "\n",     // End-of-line symbols
  "skipHeader": true,            // Whether to skip the first (header) row
  "mismatchOnError": false       // Whether a column-count mismatch is an error
}
```

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `file` | storage | The CSV file to read (a file on storage) |

**Output Types (referenced inside the loop):**

| Field | Type | Description |
|---|---|---|
| `string1` / `string2` / ... | string | Column values of the current row (define according to the number of columns) |

#### Start/End Pair Structure

Like Database Fetch, CSV Fetch consists of **two flowElements**:

| Element | key.id | properties | Role |
|---|---|---|---|
| Start | `<definitionId>` (e.g. `sample-csv-fetch`) | `{ definition, endPoint }` | Loop start / read CSV |
| End | `$<definitionId>$` (e.g. `$sample-csv-fetch$`) | `{ startPoint }` | Loop end |

**Flow structure:**
```
→ sample-csv-fetch → [in-loop processing] → $sample-csv-fetch$ →
```

- You do not need to write the end element (`user_csv_fetch_end`) in the spec `tasks`; `build-flow.js` generates it automatically.
- In-loop processing can reference the start element's output (`string1`, etc.).

### 8. CSV Output Definition (`definitionType: "csv_output"`)

A task that writes a list of input records to storage as a CSV file.
Unlike CSV Fetch, it is a **single task** (not a pair structure), and you can define each column's label, data type, and format.

| Item | Value |
|---|---|
| `elementId` | `im_csvOutput` |

**`elementProperties`:**

```jsonc
{
  "encoding": "UTF-8",          // File encoding
  "quoteCharacter": "\"",       // Quote character
  "delimiterCharacter": ",",    // Delimiter character
  "endOfLineSymbols": "\n",     // End-of-line symbols
  "addHeader": true,             // Whether to output a header row (labelName)
  "withBom": false,              // Whether to prepend a BOM
  "cols": [                       // Output column definitions (map to each field of records)
    { "paramName": "param1", "labelName": "PARAM1", "dataType": "STRING", "format": "" },
    { "paramName": "param2", "labelName": "PARAM2", "dataType": "STRING", "format": "" }
  ]
}
```

- Define the output columns with `cols`:
  - `paramName`: the field name on each record of `records`
  - `labelName`: the column name written to the header row (when `addHeader: true`)
  - `dataType`: `STRING` / `NUMBER` / `DATETIME`, etc.
  - `format`: format for dates/numbers (specify according to `dataType`; empty string if not needed)

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `outputFile` | storage | The destination CSV file (a file on storage) |
| `targetTimezone` | timezone | The timezone used when outputting datetime fields |
| `records` | list | The array of records to output (each record's fields map to `cols.paramName`) |

**Output Types:**

No output data (empty root). The CSV is written to the destination file (`outputFile`).

### 9. Excel Input Definition (`definitionType: "excel_in"`)

A task that reads cell values and table data from an Excel file (xlsx, etc.) on storage.
It is a **single task**, and you can combine single-cell reads (`cells`) and tabular reads (`tables`).

| Item | Value |
|---|---|
| `elementId` | `im_excelInput` |

**`elementProperties`:**

```jsonc
{
  "selectSheetType": "NAME",      // How to select the sheet ("NAME": by name / "INDEX": by index)
  "cells": [                       // Single-cell read definitions
    { "sheet": "Sheet1", "address": "A1", "paramName": "param1", "dataType": "NUMERIC" }
  ],
  "tables": [                      // Tabular read definitions
    {
      "sheet": "Sheet1",
      "arrParamName": "records1",  // Output array field name
      "startCol": "A",             // Read start column
      "endCol": "B",               // Read end column
      "startRow": "1",             // Read start row
      "cols": [                     // Column definitions
        { "name": "A", "paramName": "columnA", "dataType": "NUMERIC", "disuse": false },
        { "name": "B", "paramName": "columnB", "dataType": "NUMERIC", "disuse": false }
      ],
      "inputEndCondition": "ALL_EMPTY",  // Read termination condition (see below)
      "notReadLastRow": false,            // Whether to skip the last row that matched the end condition
      "useBeforeValue": false             // Whether to carry over the previous value into empty cells
    }
  ],
  "dataTypeLenient": true          // Whether to perform data-type conversion leniently
}
```

**Items of `cells` / `tables.cols`:**

- `sheet`: sheet name (when `selectSheetType: "NAME"`) or sheet index (when `"INDEX"`)
- `address`: cell address (`cells` only, e.g. `A1`)
- `name`: column (`tables.cols` only, column letter, e.g. `A`)
- `paramName`: output field name
- `dataType`: `STRING` / `NUMERIC` / `DATETIME`, etc.
- `disuse` (`tables.cols` only): whether to skip that column

**The 3 modes of `inputEndCondition` (table read termination):**

| Value | Description | Extra property |
|---|---|---|
| `ALL_EMPTY` | Stop when a row where all columns are empty is reached | none |
| `SPECIFY_ROWS` | Read the specified number of rows | `specifiedRows` (e.g. `"5"`) |
| `CELL_EMPTY` | Stop when the cell in the specified column becomes empty | `specifiedEmptyCol` (e.g. `"A"`) |

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `file` | storage | The Excel file to read (a file on storage) |
| `targetTimezone` | timezone | The timezone used when reading datetime cells |
| `password` | string | The password to open a password-protected workbook (empty if not needed) |

**Output Types:**

Each `paramName` of `cells` (single value) and each `arrParamName` of `tables` (array of records) is output.
Numeric cells (`dataType: "NUMERIC"`) are output as the `double` type.

### 10. Excel Output Definition (`definitionType: "excel_out"`)

A task that writes input data into the cells and tables of an Excel file (xlsx, etc.) and outputs it.
It is a **single task**: it reads a template Excel (`inputFile`), writes the data, and saves it to the destination (`outputFile`).

| Item | Value |
|---|---|
| `elementId` | `im_excelOutput` |

**`elementProperties`:**

```jsonc
{
  "selectSheetType": "NAME",          // How to select the sheet ("NAME": by name / "INDEX": by index)
  "setFormulaRecalculation": false,    // Whether to recalculate formulas on output
  "cells": [                           // Single-cell write definitions
    { "sheet": "Sheet1", "address": "A1", "paramName": "param1", "dataType": "NUMERIC" }
  ],
  "tables": [                          // Tabular write definitions
    {
      "sheet": "Sheet1",
      "arrParamName": "records1",      // Field name of the record array to write
      "startCol": "A",                 // Write start column
      "endCol": "B",                   // Write end column
      "startRow": "1",                 // Write start row
      "cols": [                         // Column definitions
        { "name": "A", "paramName": "columnA", "dataType": "NUMERIC", "disuse": false },
        { "name": "B", "paramName": "columnB", "dataType": "NUMERIC", "disuse": false }
      ],
      "outputEndCondition": "ALL_DATA_WRITEN"  // Write termination condition (see below)
    }
  ]
}
```

- The items of `cells` / `tables` are the **same as in the Excel Input Definition** (`sheet` / `address` / `name` / `paramName` / `dataType` / `disuse`).
- Unlike the Excel Input Definition, it has `setFormulaRecalculation` and does not have `dataTypeLenient`.

**The 2 modes of `outputEndCondition` (table write termination):**

| Value | Description | Extra property |
|---|---|---|
| `ALL_DATA_WRITEN` | Write all input records | none |
| `SPECIFY_ROWS` | Write the specified number of rows | `specifiedRows` (e.g. `"5"`) |

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `outputFile` | storage | The destination Excel file (a file on storage) |
| `inputFile` | storage | The Excel file to read as a template |
| `targetTimezone` | timezone | The timezone used when writing datetime cells |
| `password` | string | The password to open a password-protected workbook (empty if not needed) |
| `param1`, etc. | (maps to `cells`) | Values written to single cells |
| `records1`, etc. | list (maps to `tables`) | The array of records written to tables |

**Output Types:**

No output data (empty root). The Excel is written to the destination file (`outputFile`).

### 11. XML Parse Definition (`definitionType: "xmlparser"`)

A task that parses XML data and extracts values specified by XPath.
It is a **single task**: it extracts values from the input XML (binary) using multiple XPath expressions and maps them to output fields.

| Item | Value |
|---|---|
| `elementId` | `im_xmlparser` |

**`elementProperties`:**

```jsonc
{
  "paths": [                          // Value extraction definitions (XPath -> output field)
    { "paramName": "string1", "xpath": "/root/string1" },
    { "paramName": "string2", "xpath": "//string2" }
  ]
}
```

- Each item of `paths` extracts the value of the node specified by `xpath` into the `paramName` output field:
  - `paramName`: the output field name (maps to each field of `outputDataDefinition`)
  - `xpath`: the XPath expression (absolute path `/root/...`, relative path `//...`, etc.)

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `xml` | binary | The XML data to parse (binary) |

**Output Types:**

Each `paramName` of `paths` is output as the `string` type (the value extracted by XPath).

### 12. HTML Parse Definition (`definitionType: "htmlparser"`)

A task that parses HTML data and extracts the value of elements specified by CSS selectors.
It is a **single task**: similar to the XML Parse Definition, but it specifies elements with **CSS selectors** instead of XPath.

| Item | Value |
|---|---|
| `elementId` | `im_htmlparser` |

**`elementProperties`:**

```jsonc
{
  "paths": [                          // Value extraction definitions (CSS selector -> output field)
    { "paramName": "string1", "selector": "body>h1" },
    { "paramName": "string2", "selector": ".input-label span" }
  ]
}
```

- Each item of `paths` extracts the value of the element specified by `selector` into the `paramName` output field:
  - `paramName`: the output field name (maps to each field of `outputDataDefinition`)
  - `selector`: the CSS selector (e.g. `body>h1`, `.input-label span`, `#id`, etc.)

**Standard Input Types:**

| Field | Type | Description |
|---|---|---|
| `html` | binary | The HTML data to parse (binary) |
| `charset` | string | The character encoding of the HTML (e.g. `UTF-8`; empty if not needed) |

**Output Types:**

Each `paramName` of `paths` is output as the `string` type (the value extracted by the CSS selector).

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
| Want to call a stored procedure / function | Stored Procedure Definition |
| Want to receive OUT parameters / a return value | Stored Procedure Definition |
| Want to process a CSV on storage one row at a time | CSV Fetch Definition |
| Want to output a list of records to a CSV file | CSV Output Definition |
| Want to read cell values / table data from an Excel file | Excel Input Definition |
| Want to write data into the cells / tables of an Excel file | Excel Output Definition |
| Want to extract values from XML data via XPath | XML Parse Definition |
| Want to extract values from HTML data via CSS selectors | HTML Parse Definition |
