---
name: jssp-im-logic-generator
description: Generates flow_definition.json for intra-mart IM-LogicDesigner from prompts. Use when the user requests "create a logic flow for ○○". Task palettes are predefined in task-templates/ (continuously extended).
allowed-tools: Bash, Read, Write, Glob
---

# jssp-im-logic-generator

A skill for assembling **IM-LogicDesigner logic flow definition JSON** for intra-mart from prompts.

## When to Use

- Requests such as "Create an IM-LogicDesigner flow" or "Generate a logic flow definition JSON"
- When JSON conforming to the structure of an existing `flow_definition.json` is needed

## Structure

```
jssp-im-logic-generator/
├── SKILL.md                  # This file
├── reference/
│   ├── structure.md          # flow_definition.json structure specification
│   ├── source-paths.md       # mappingRules.source path conventions
│   ├── el-expressions.md     # How to write EL expressions
│   ├── data-types.md         # Complete reference for data types (type IDs)
│   ├── user-definitions.md   # Reference for user-defined tasks
│   ├── mapping-functions.md  # Basic mapping functions reference (52 functions)
│   ├── spec.schema.json      # JSON Schema for spec.json
│   └── flow_definition.schema.json  # JSON Schema for flow_definition.json
├── task-templates/           # Templates per task type (135 files)
│   ├── im_start.json / im_end.json / im_errorEnd.json / im_gateway.json / im_sequence.json
│   ├── im_authorizeAuthz.json / im_logger.json / im_callFlow.json / ...
│   ├── im_repositorySearchEntityCount.json / im_repositorySearchEntityData.json / ...
│   ├── im_sendTextMail.json / im_sendHtmlMail.json / ...
│   ├── im_addAccount.json / im_updateAccount.json / im_deleteAccount.json / ...
│   ├── im_immGetCompany.json / im_immGetProfile.json / ...   # Common master tasks
│   ├── user_javascript.json / user_rest.json / user_sql.json  # User-defined
│   ├── user_db_fetch.json / user_db_fetch_end.json            # Database Fetch
│   ├── user_csv_fetch.json / user_csv_fetch_end.json          # CSV Fetch
│   ├── user_template.json / user_stored.json                  # Template / Stored procedure
│   ├── user_csv_output.json                                   # CSV Output
│   ├── user_excel_input.json / user_excel_output.json         # Excel Input / Output
│   ├── user_xml_parse.json / user_html_parse.json             # XML Parse / HTML Parse
│   └── ...(125 task types total + im_sequence + 12 user-defined types)
├── scripts/
│   ├── build-flow.js         # spec.json → flow_definition.json generator
│   └── validate-flow.js      # flow_definition.json validator
├── mcp-spec/                 # MCP endpoint specifications
│   ├── endpoints.md          # Endpoint specifications (5 endpoints: task/entity/function)
│   └── schemas/              # Response JSON Schemas
│       ├── imLogicListTaskTypes.response.json
│       ├── imLogicGetTaskTemplate.response.json
│       ├── imLogicResolveEntitySchema.response.json
│       ├── imLogicListMappingFunctions.response.json
│       └── imLogicGetMappingFunction.response.json
└── examples/
    └── article_count.spec.json  # Minimal sample spec
```

**Note:**
- **Adding task types**: Simply adding `task-templates/<keyId>.json` makes it recognized by `build-flow.js`. Refer to [reference/structure.md](reference/structure.md) for how to create templates.

## Generation Steps

Upon receiving a user request, proceed in the following order.

### 1. Clarify Requirements and Identify Gaps

Elicit the following information from the user. Ask if anything is missing:

- **flowId** / **flowName** / **categoryId**
  - `categoryId`: **Never reuse ones appearing in templates (e.g., `imprtl_portlet_info`)**. Assign a new category ID to new flows (e.g., `sample_authz`). Define new ones in `flowCategories` if needed.
- **Input data** (`inputDataDefinition`) — What arguments does it receive?
- **Output data** (`outputDataDefinition`) — What does it return?
- **Processing flow** — Which tasks are called in what order, and where does branching occur?
- **Entity ID** — `entityId` used in repository tasks (IM-Repository integration)
  - ※ A separate IM-Repository resolution mechanism is planned. For now, receive from the user.

### Task Label Language

Task `label` cannot be localized. Set it to match the prompt language:

- Japanese prompt → Japanese label (e.g., `"Authorization Check"` in Japanese)
- English prompt → English label (e.g., `"Authorization Check"`)

### Task Comments (comment)

**Each task must have a `comment` briefly describing its purpose.**
This makes it easier to understand the flow's intent during review. `label` represents "what it does", `comment` represents "why it does it".

```jsonc
{
  "type": "user_sql",
  "label": "Get target count",
  "comment": "Secure the count before DB Fetch and use it in the output after processing is complete",
  ...
}
```

- No comment needed for `im_start` / `im_end`
- Add to all other tasks
- Use the same language as `label` (match the prompt language)

### 2. Author the Intermediate Representation "spec"

Assemble a spec in the same format as [examples/article_count.spec.json](examples/article_count.spec.json).

Key fields:

```jsonc
{
  "flowCategories": [ /* Optional. Only define when creating new categories */ ],
  "flows": [
    {
      "flowId": "...",
      "flowName": "...",
      "categoryId": "...",
      "version": 1,
      "transaction": true,
      "constants": [],                       // Constant definitions (optional)
      "variablesDataDefinition": { ... },    // Empty root if omitted
      "inputDataDefinition":  { ... },       // Empty root if omitted
      "outputDataDefinition": { ... },       // Empty root if omitted
      "tasks": [
        // Order doesn't matter (connected via edges)
        { "type": "im_start" },
        { "type": "im_repositorySearchEntityCount",
          "label": "Get count",
          "properties": { "entityId": "..." } },
        { "type": "im_gateway",
          "label": "Existence check",
          "defaultRoot": "im_gateway1->im_errorEnd1" },
        { "type": "im_end",
          "mappingRules": [
            { "target": "$output/data/articleCount",
              "source": { "type":"value", "name":null,
                          "path":"im_repositorySearchEntityCount1/count",
                          "arguments":null } }
          ]
        }
      ],
      "edges": [
        { "from": "im_start", "to": "im_repositorySearchEntityCount1" },
        { "from": "im_repositorySearchEntityCount1", "to": "im_gateway1" },
        { "from": "im_gateway1", "to": "im_end1",
          "condition": "${!isEmpty(im_repositorySearchEntityCount1.count)}" },
        { "from": "im_gateway1", "to": "im_errorEnd1" }
      ]
    }
  ]
}
```

**executeId auto-numbering rules** (when not explicitly specified in spec):
- `im_start` → `im_start`
- `im_end` → `im_end1` (multiple in same flow: `im_end2`...)
- Others → `<key.id><number>` (e.g., `im_repositorySearchEntityCount1`)
- sequence executeId → `<from>_<to>`

Specify the `executeId` field when you want to explicitly set it.

### 3. Write spec to a Temp File and Run build-flow.js

```bash
node {{AGENT_ROOT}}/skills/jssp-im-logic-generator/scripts/build-flow.js \
     /tmp/<flowId>.spec.json \
     --zip
```

Options:

| Option | Behavior |
|--------|----------|
| `--zip` | Generates `<workspace>/src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip`. The zip contains `flow_definition.json`. If spec has `routes`, `flow_route.json` is also included. **Normally use this.** |
| `--zip-dir <dir>` | Override zip output directory |
| `--out <file>` | Additionally save formatted JSON to file |
| Nothing | Output formatted JSON to stdout |

**`featureName` is required at spec top level** (for zip output).
Example: `"featureName": "article-count"` → `im-logicdesigner-data-article-count.zip`.
When omitted, the first flow's `flowId` is used as fallback.

**Note:**
- ※ `zip` command is required (assumed to be available in dev container by default)

### 4. Verify Output

What build-flow.js generates:

**flow_definition.json** (always generated):
```json
{
  "flowCategories": [...],
  "flowDefinitions": [ "<escaped flow definition JSON string>", ... ]
}
```

This has the same top-level structure as the original `flow_definition.json` and can be imported into IM-LogicDesigner.

**flow_route.json** (generated only when spec has `routes`):
```json
[
  {
    "route": "my_app/get_user",
    "method": "GET",
    "flowId": "my_app_get_user",
    "version": -1,
    "authentication": "IMAuthentication",
    "authenticationParam": null,
    "authzUri": "im-logic-rest://my_app_get_user",
    "secured": true,
    "responseType": "imJsonResponse",
    "responseHeader": {}
  }
]
```

The routing definition allows HTTP execution of the flow at `<BASE-URL>/logic/api/<route>`.
`authzUri` is auto-completed to `im-logic-rest://<flowId>` when omitted.

**Example routes notation in spec:**

```jsonc
{
  "flows": [ ... ],
  "routes": [
    {
      "route": "sample/ajax/execute",   // Required: URL path (<BASE-URL>/logic/api/<route>)
      "flowId": "sample_ajax_execute",  // Required: flowId of the flow to execute
      "method": "POST",                // Default: GET
      "responseType": "imTextResponse", // Default: imJsonResponse
      "secured": true,                  // Default: false (but see rule below)
      "authentication": "IMAuthentication" // Default: IMAuthentication
    }
  ]
}
```

**`secured` setting rule:** Unless the user specifically instructs otherwise, always explicitly set `secured: true`.
Secure token usage is recommended as a CSRF countermeasure.

**Client-side requirements when `secured: true`:**
The secure token must be included in the request header.

```javascript
fetch('logic/api/sample/ajax/execute', {
  method: 'POST',
  headers: {
    'X-Intramart-Secure-Token': document.querySelector('meta[name=im_secure_token]').content
  }
});
```

On the screen HTML, embed `<meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">`.

**Important:** The properties to define in the flow's `outputDataDefinition` differ depending on `responseType`.
When generating routing, always refer to [routing-response.md](reference/routing-response.md) and set the flow's output definition appropriately.

### 5. Validate with validate-flow.js

Automatically validates the output of build-flow.js. **Always run after generation.**

```bash
node {{AGENT_ROOT}}/skills/jssp-im-logic-generator/scripts/validate-flow.js \
     <flow_definition.json or .zip>
```

Validation items:

- Are **start / end / all tasks / all sequences** present in `flowElements`?
- Do sequence `startPoint` / `endPoint` point to existing tasks?
- Are **cells / dataMap / optionMap in `additional.ui` synchronized**?
  - Keys in dataMap/optionMap are cell UUIDs (excluding link cells)
  - Cell `attrs."text.title".text` is executeId
  - `dataMap[cellId].common.executeId` matches the cell's text.title
- **Are `dataMap[cellId].mapping.json.connectors` and `flowElements[].mappingDefinition.mappingRules` synchronized**?
  - Output connector `id` matches mappingRule `id`
  - Number of output connectors = number of mappingRules
  - Path separator is TAB (`\t`) not (`/`)
  - Function argument connectors (target.type = function name) are separately permitted
- Does gateway `defaultRoot` point to an existing sequence executeId?
- User-defined task validation (`key.type = "localUserDefinition"`):
  - Does `properties.definition` have `definitionId` / `definitionType` / `definitionData` / `elementId`?
  - Is the Database Fetch start/end pair (`$<definitionId>$`) complete?

## How to Use User-Defined Tasks

In addition to standard tasks (`key.type = "application"`), **user-defined tasks** where users can freely define inputs, outputs, and logic can be written in spec.
See [reference/user-definitions.md](reference/user-definitions.md) for details.

### Spec Notation

```jsonc
{
  "type": "user_javascript",       // user_javascript | user_rest | user_sql | user_db_fetch | user_template | user_stored | user_csv_fetch | user_csv_output | user_excel_input | user_excel_output | user_xml_parse | user_html_parse
  "label": "Email sending process",
  "userDefinition": {
    "definitionId": "mail_sender",  // → becomes executeId and key.id
    "definitionType": "javascript",
    "definitionName": "mail sender",
    "localize": { "ja": "メール送信処理" },
    "elementProperties": {
      "script": "function run(input) { ... }"
    },
    "inputDataDefinition": { ... },
    "outputDataDefinition": { ... }
  },
  "mappingRules": [ ... ]
}
```

### Type Names per Category

| spec `type` | `definitionType` | Purpose |
|-------------|-----------------|---------|
| `user_javascript` | `javascript` | Free JavaScript processing (Rhino) |
| `user_rest` | `rest` | HTTP/HTTPS requests |
| `user_sql` | `sql` | Arbitrary SQL execution (2WaySQL) |
| `user_db_fetch` | `db_fetch` | Iterative processing one row at a time |
| `user_template` | `template` | Text generation with FreeMarker templates |
| `user_stored` | `stored` | Stored procedure / function call (IN/OUT parameters) |
| `user_csv_fetch` | `csv_fetch` | Iterative processing of a CSV on storage one row at a time (start/end pair) |
| `user_csv_output` | `csv_output` | Output a list of records to a CSV file (single task) |
| `user_excel_input` | `excel_in` | Read cell values / table data from an Excel file (single task) |
| `user_excel_output` | `excel_out` | Write data into the cells / tables of an Excel file (single task) |
| `user_xml_parse` | `xmlparser` | Extract values from XML data via XPath (single task) |
| `user_html_parse` | `htmlparser` | Extract values from HTML data via CSS selectors (single task) |

### Database Fetch / CSV Fetch Notes

Notes common to paired user definitions (`user_db_fetch` / `user_csv_fetch`).

- **The end element is auto-generated**. No need to write `user_db_fetch_end` / `user_csv_fetch_end` in spec `tasks`
- Reference the end element with `$<definitionId>$` in edges
- Nest loop processing tasks between start and end

```jsonc
"edges": [
  { "from": "im_start", "to": "my_db_fetch" },
  { "from": "my_db_fetch", "to": "im_logger1" },        // Processing inside loop
  { "from": "im_logger1", "to": "$my_db_fetch$" },       // Loop end
  { "from": "$my_db_fetch$", "to": "im_end1" }
]
```

### im_logger (Log Output Task)

Not a user-defined task, but commonly used inside loops as a standard task.

```jsonc
{
  "type": "im_logger",
  "label": "Log output",
  "properties": { "level": "INFO" },
  "mappingRules": [
    { "target": "im_logger1",
      "source": { "type": "value", "path": "my_db_fetch/item/column1" } }
  ]
}
```

`properties.level`: `"DEBUG"` / `"INFO"` / `"WARN"` / `"ERROR"`

## Combining Multiple Flows in One File

When a request is complex and doesn't fit in one flow, list multiple flow specs in `flows: [ ... ]`.
`build-flow.js` converts each to a separate JSON string and collects them in the `flowDefinitions` array.

## Important Constraints

- **`additional.ui` is required**. Cannot be empty. `build-flow.js` auto-generates from cell templates in task-templates.
- **Synchronization between executeId and cells is guaranteed by build-flow.js**. When manually editing JSON, always match both sides.
- **For unsupported task types**, the skill cannot generate until `task-templates/<keyId>.json` is added. Create a template following the procedure in `reference/structure.md`.
- **Layout**: Cells are placed vertically in edge route order (depth-first from `im_start`). Vertical spacing: 120px. When exceeding the designer's maximum size (3840px wide / 2880px tall), wrap right by 340px. Maximum 23 tasks per column.

## SQL Definition Task Notes

### SQL Readability

Use `\n` to appropriately line-break `query` in `user_sql` / `user_db_fetch` tasks.
Putting everything on one line reduces visibility in IM-LogicDesigner.

```jsonc
// NG: Don't put on one line
"query": "SELECT id, name FROM your_table WHERE id = /*param*/'dummy' ORDER BY id ASC"

// OK: Line break at each keyword
"query": "SELECT\n    id\n  , name\nFROM\n    your_table\nWHERE\n    id = /*param*/'dummy'\nORDER BY\n    id ASC"
```

### LIKE Search Security

When using the LIKE operator, **LIKE pattern injection countermeasures are mandatory**.
Refer to the "LIKE Search Notes" in [reference/user-definitions.md](reference/user-definitions.md) for details.

- Add `ESCAPE '\'` clause to SQL
- Use a `user_javascript` task to escape LIKE special characters (`\`, `%`, `_`) before appending wildcards
- **Never send `%keyword%` from the client (browser)**

## References

- [reference/structure.md](reference/structure.md) — JSON structure, how to add templates
- [reference/source-paths.md](reference/source-paths.md) — List of starting points for mappingRules.source.path
- [reference/el-expressions.md](reference/el-expressions.md) — How to use EL expressions
- [reference/data-types.md](reference/data-types.md) — Complete list of data types (type IDs) and how to choose
- [reference/user-definitions.md](reference/user-definitions.md) — Detailed specification for user-defined tasks
- [reference/mapping-functions.md](reference/mapping-functions.md) — Basic mapping functions (52 functions) and how to use them
- [examples/article_count.spec.json](examples/article_count.spec.json) — Minimal spec sample
