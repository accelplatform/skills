---
name: jssp-im-logic-generator
description: 根据提示为 intra-mart IM-LogicDesigner 生成 flow_definition.json。当用户请求"创建执行○○的逻辑流"时使用。任务调色板已在 task-templates/ 中预定义（持续扩展）。
---

# jssp-im-logic-generator

根据提示组装 intra-mart **IM-LogicDesigner 逻辑流定义 JSON** 的技能。

## 使用时机

- "创建 IM-LogicDesigner 流程"、"生成逻辑流定义 JSON" 等需求
- 需要符合现有 `flow_definition.json` 结构的 JSON 时

## 结构

```
jssp-im-logic-generator/
├── SKILL.md                  # 本文件
├── reference/
│   ├── structure.md          # flow_definition.json 结构规格
│   ├── source-paths.md       # mappingRules.source 的 path 规范
│   ├── el-expressions.md     # EL 表达式的写法
│   ├── data-types.md         # 数据类型（类型 ID）全量参考
│   ├── user-definitions.md   # 用户定义任务的参考
│   ├── mapping-functions.md  # 映射函数基础（52件）参考
│   ├── spec.schema.json      # spec.json 的 JSON Schema
│   └── flow_definition.schema.json  # flow_definition.json 的 JSON Schema
├── task-templates/           # 各任务类型的模板（135个文件）
│   ├── im_start.json / im_end.json / im_errorEnd.json / im_gateway.json / im_sequence.json
│   ├── im_authorizeAuthz.json / im_logger.json / im_callFlow.json / ...
│   ├── im_repositorySearchEntityCount.json / im_repositorySearchEntityData.json / ...
│   ├── im_sendTextMail.json / im_sendHtmlMail.json / ...
│   ├── im_addAccount.json / im_updateAccount.json / im_deleteAccount.json / ...
│   ├── im_immGetCompany.json / im_immGetProfile.json / ...   # 公共主数据系
│   ├── user_javascript.json / user_rest.json / user_sql.json  # 用户定义
│   ├── user_db_fetch.json / user_db_fetch_end.json            # Database Fetch
│   ├── user_csv_fetch.json / user_csv_fetch_end.json          # CSV Fetch
│   ├── user_template.json / user_stored.json                  # 模板 / 存储过程
│   ├── user_csv_output.json                                   # CSV 输出
│   ├── user_excel_input.json / user_excel_output.json         # Excel 输入 / 输出
│   ├── user_xml_parse.json / user_html_parse.json             # XML 解析 / HTML 解析
│   └── ...（共 125 种任务类型 + im_sequence + 12 种用户定义）
├── scripts/
│   ├── build-flow.js         # spec.json → flow_definition.json 生成器
│   └── validate-flow.js      # flow_definition.json 验证器
├── mcp-spec/                 # MCP 端点规格
│   ├── endpoints.md          # 端点规格（5个：任务/实体/函数）
│   └── schemas/              # 响应 JSON Schema
│       ├── mcp__im_logic__list_task_types.response.json
│       ├── mcp__im_logic__get_task_template.response.json
│       ├── mcp__im_logic__list_entities.response.json
│       ├── mcp__im_logic__resolve_entity_schema.response.json
│       ├── mcp__im_logic__list_mapping_functions.response.json
│       └── mcp__im_logic__get_mapping_function.response.json
└── examples/
    └── article_count.spec.json  # 最小示例 spec
```

**注意：**
- **添加任务类型**：只需添加 `task-templates/<keyId>.json` 即可被 `build-flow.js` 识别。模板的创建方法参见 [reference/structure.md](reference/structure.md)。

## 生成步骤

收到用户请求后，按以下顺序进行。

### 1. 整理需求，确认缺失信息

从用户处获取以下信息。如有缺失，请提问：

- **flowId** / **flowName** / **categoryId**
  - `categoryId`：**绝对不得沿用模板中出现的值（如 `imprtl_portlet_info`）**。为新流程分配新的类别 ID（例：`sample_authz`）。如有需要，在 `flowCategories` 中新建定义。
- **输入数据** (`inputDataDefinition`) — 接收哪些参数？
- **输出数据** (`outputDataDefinition`) — 返回什么？
- **处理流程** — 以什么顺序调用哪些任务，在哪里分支？
- **实体 ID** — 在仓库系任务中使用的 `entityId`（IM-Repository 集成）
  - ※ 另行整备 IM-Repository 解析机制。暂时从用户处获取。

### 任务名称（label）的语言

任务的 `label` 无法多语言化。根据提示的语言设置：

- 日文提示 → 日文标签（例：`"认可判断"` 用日文）
- 英文提示 → 英文标签（例：`"Authorization Check"`）
- 中文提示 → 中文标签（例：`"授权判断"`）

### 任务注释（comment）

**每个任务必须在 `comment` 中简洁描述该任务的目的。**
这样在审查时更容易理解流程的意图。`label` 表示"做什么"，`comment` 表示"为什么这样做"。

```jsonc
{
  "type": "user_sql",
  "label": "获取目标件数",
  "comment": "在 DB Fetch 前确保件数，在处理完成后用于输出",
  ...
}
```

- `im_start` / `im_end` 不需要注释
- 其他所有任务均需添加
- 语言与 `label` 相同（与提示语言一致）

### 2. 编写中间表示"spec"

按与 [examples/article_count.spec.json](examples/article_count.spec.json) 相同的格式组装 spec。

主要字段：

```jsonc
{
  "flowCategories": [ /* 可省略。仅在定义新类别时使用 */ ],
  "flows": [
    {
      "flowId": "...",
      "flowName": "...",
      "categoryId": "...",
      "version": 1,
      "transaction": true,
      "constants": [],                       // 常量定义（可省略）
      "variablesDataDefinition": { ... },    // 省略时为空 root
      "inputDataDefinition":  { ... },       // 省略时为空 root
      "outputDataDefinition": { ... },       // 省略时为空 root
      "tasks": [
        // 顺序无关（通过 edges 连接）
        { "type": "im_start" },
        { "type": "im_repositorySearchEntityCount",
          "label": "获取件数",
          "properties": { "entityId": "..." } },
        { "type": "im_gateway",
          "label": "存在性检查",
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

**executeId 自动编号规则**（spec 中未明确指定时）：
- `im_start` → `im_start`
- `im_end` → `im_end1`（同一流程内有多个时为 `im_end2`...）
- 其他 → `<key.id><序号>`（例：`im_repositorySearchEntityCount1`）
- sequence 的 executeId → `<from>_<to>`

需要明确指定时，填写 `executeId` 字段。

### 3. 将 spec 写入临时文件并执行 build-flow.js

```bash
node {{AGENT_ROOT}}/skills/jssp-im-logic-generator/scripts/build-flow.js \
     /tmp/<flowId>.spec.json \
     --zip
```

选项：

| 选项 | 行为 |
|------|------|
| `--zip` | 生成 `<workspace>/src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip`。zip 内包含 `flow_definition.json`。spec 中有 `routes` 时也包含 `flow_route.json`。**通常使用此选项。** |
| `--zip-dir <dir>` | 覆盖 zip 输出目标目录 |
| `--out <file>` | 另外将格式化 JSON 保存至文件 |
| 不指定 | 将格式化 JSON 输出至标准输出 |

**`featureName` 是 spec 顶层的必填字段**（zip 输出时）。
例：`"featureName": "article-count"` → `im-logicdesigner-data-article-count.zip`。
省略时使用第一个流程的 `flowId` 作为回退值。

**注意：**
- ※ 需要 `zip` 命令（假设 dev container 中已标准安装）

### 4. 确认输出

build-flow.js 生成的内容：

**flow_definition.json**（始终生成）：
```json
{
  "flowCategories": [...],
  "flowDefinitions": [ "<转义后的流程定义 JSON 字符串>", ... ]
}
```

与原始 `flow_definition.json` 具有相同的顶层结构，可导入 IM-LogicDesigner。

**flow_route.json**（仅在 spec 有 `routes` 时生成）：
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

通过路由定义，可以通过 `<BASE-URL>/logic/api/<route>` 以 HTTP 方式执行流程。
省略 `authzUri` 时自动补全为 `im-logic-rest://<flowId>`。

**spec 中的 routes 记法示例：**

```jsonc
{
  "flows": [ ... ],
  "routes": [
    {
      "route": "sample/ajax/execute",   // 必填：URL 路径（<BASE-URL>/logic/api/<route>）
      "flowId": "sample_ajax_execute",  // 必填：要执行的流程的 flowId
      "method": "POST",                // 省略时：GET
      "responseType": "imTextResponse", // 省略时：imJsonResponse
      "secured": true,                  // 省略时：false（但参见下方规则）
      "authentication": "IMAuthentication" // 省略时：IMAuthentication
    }
  ]
}
```

**`secured` 的设置规则：** 除非用户特别指示，否则必须明确设置 `secured: true`。
推荐使用安全令牌作为 CSRF 对策。

**`secured: true` 时的客户端要求：**
需要在请求头中包含安全令牌。

```javascript
fetch('logic/api/sample/ajax/execute', {
  method: 'POST',
  headers: {
    'X-Intramart-Secure-Token': document.querySelector('meta[name=im_secure_token]').content
  }
});
```

画面侧 HTML 中需嵌入 `<meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">`。

**重要：** 根据 `responseType` 的不同，流程 `outputDataDefinition` 中需要定义的属性也不同。
生成路由时，必须参考 [routing-response.md](reference/routing-response.md)，适当设置流程的输出定义。

### 5. 使用 validate-flow.js 验证

自动验证 build-flow.js 的输出。**生成后必须执行。**

```bash
node {{AGENT_ROOT}}/skills/jssp-im-logic-generator/scripts/validate-flow.js \
     <flow_definition.json 或 .zip>
```

验证项目：

- `flowElements` 中是否具备 **start / end / 所有任务 / 所有 sequence**？
- sequence 的 `startPoint` / `endPoint` 是否指向实际存在的任务？
- **`additional.ui` 内的 cells / dataMap / optionMap 是否同步**？
  - dataMap·optionMap 的键为 cell 的 UUID（排除 link cell）
  - cell 的 `attrs."text.title".text` 为 executeId
  - `dataMap[cellId].common.executeId` 与 cell 的 text.title 一致
- **`dataMap[cellId].mapping.json.connectors` 与 `flowElements[].mappingDefinition.mappingRules` 是否同步**？
  - 输出 connector 的 `id` 与 mappingRule 的 `id` 一致
  - 输出 connector 数 = mappingRule 数
  - path 分隔符为 TAB（`\t`）而非（`/`）
  - 函数参数 connector（target.type = 函数名）另行允许存在
- gateway 的 `defaultRoot` 是否指向实际存在的 sequence 的 executeId？
- 用户定义任务（`key.type = "localUserDefinition"`）的验证：
  - `properties.definition` 中是否存在 `definitionId` / `definitionType` / `definitionData` / `elementId`？
  - Database Fetch 的开始/结束对（`$<definitionId>$`）是否齐全？

## 用户定义任务的使用方法

除通常任务（`key.type = "application"`）外，还可以在 spec 中编写用户可自由定义输入输出和逻辑的**用户定义任务**。
详情参见 [reference/user-definitions.md](reference/user-definitions.md)。

### spec 记法

```jsonc
{
  "type": "user_javascript",       // user_javascript | user_rest | user_sql | user_db_fetch | user_template | user_stored | user_csv_fetch | user_csv_output | user_excel_input | user_excel_output | user_xml_parse | user_html_parse
  "label": "邮件发送处理",
  "userDefinition": {
    "definitionId": "mail_sender",  // → 成为 executeId 和 key.id
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

### 各类型的 type 名称

| spec 的 `type` | `definitionType` | 用途 |
|----------------|-----------------|------|
| `user_javascript` | `javascript` | 自由 JavaScript 处理（Rhino） |
| `user_rest` | `rest` | HTTP/HTTPS 请求 |
| `user_sql` | `sql` | 任意 SQL 执行（2WaySQL） |
| `user_db_fetch` | `db_fetch` | 逐行迭代处理 SELECT |
| `user_template` | `template` | 使用 FreeMarker 模板生成文本 |
| `user_stored` | `stored` | 调用存储过程／函数（IN/OUT 参数） |
| `user_csv_fetch` | `csv_fetch` | 逐行迭代处理存储上的 CSV（开始/结束成对） |
| `user_csv_output` | `csv_output` | 将记录列表输出为 CSV 文件（单体） |
| `user_excel_input` | `excel_in` | 从 Excel 文件读取单元格值・表格数据（单体） |
| `user_excel_output` | `excel_out` | 将数据写入 Excel 文件的单元格・表格（单体） |
| `user_xml_parse` | `xmlparser` | 通过 XPath 从 XML 数据提取值（单体） |
| `user_html_parse` | `htmlparser` | 通过 CSS 选择器从 HTML 数据提取值（单体） |

### Database Fetch / CSV 提取的注意事项

成对型用户定义（`user_db_fetch` / `user_csv_fetch`）的共通注意点。

- **结束元素自动生成**。无需在 spec 的 `tasks` 中编写 `user_db_fetch_end` / `user_csv_fetch_end`
- 在 edges 中用 `$<definitionId>$` 引用结束元素
- 将循环内处理任务夹在开始和结束之间

```jsonc
"edges": [
  { "from": "im_start", "to": "my_db_fetch" },
  { "from": "my_db_fetch", "to": "im_logger1" },        // 循环内处理
  { "from": "im_logger1", "to": "$my_db_fetch$" },       // 循环结束
  { "from": "$my_db_fetch$", "to": "im_end1" }
]
```

### im_logger（日志输出任务）

虽然不是用户定义任务，但经常在循环内处理中使用的通常任务。

```jsonc
{
  "type": "im_logger",
  "label": "日志输出",
  "properties": { "level": "INFO" },
  "mappingRules": [
    { "target": "im_logger1",
      "source": { "type": "value", "path": "my_db_fetch/item/column1" } }
  ]
}
```

`properties.level`：`"DEBUG"` / `"INFO"` / `"WARN"` / `"ERROR"`

## 将多个流程合并在一个文件中

需求复杂、无法在一个流程中完成时，在 `flows: [ ... ]` 中并列多个流程的 spec。
`build-flow.js` 将各流程分别转换为独立的 JSON 字符串，收集到 `flowDefinitions` 数组中。

## 重要约束

- **`additional.ui` 是必填项**。不能为空。`build-flow.js` 从 task-templates 的 cell 模板自动生成。
- **executeId 与 cell 的同步由 build-flow.js 保证**。手动编辑 JSON 时，必须同时保持两侧一致。
- **任务类型不支持**的情况下，在添加 `task-templates/<keyId>.json` 之前技能无法生成。按 `reference/structure.md` 的步骤创建模板。
- **布局**：Cell 按 edges 路由顺序（从 `im_start` 深度优先）纵向排列。纵向间距 120px。超过设计器最大尺寸（宽 3840px / 高 2880px）时向右折叠 340px。每列最多 23 个任务。

## SQL 定义任务的注意事项

### SQL 可读性

`user_sql` / `user_db_fetch` 任务的 `query` 须用 `\n` 适当换行。
合并为一行会导致在 IM-LogicDesigner 上难以阅读。

```jsonc
// NG：不要合并为一行
"query": "SELECT id, name FROM your_table WHERE id = /*param*/'dummy' ORDER BY id ASC"

// OK：每个关键字换行
"query": "SELECT\n    id\n  , name\nFROM\n    your_table\nWHERE\n    id = /*param*/'dummy'\nORDER BY\n    id ASC"
```

### LIKE 搜索的安全性

使用 LIKE 运算符时，**LIKE 模式注入对策是必须的**。
详情参见 [reference/user-definitions.md](reference/user-definitions.md) 的"LIKE 搜索时的注意"。

- 在 SQL 中添加 `ESCAPE '\'` 子句
- 使用 `user_javascript` 任务对 LIKE 特殊字符（`\`、`%`、`_`）进行转义后再添加通配符
- **不得从客户端（浏览器）发送 `%keyword%`**

## 参考资料

- [reference/structure.md](reference/structure.md) — JSON 结构、模板添加方法
- [reference/source-paths.md](reference/source-paths.md) — mappingRules.source.path 的起点列表
- [reference/el-expressions.md](reference/el-expressions.md) — EL 表达式的使用方法
- [reference/data-types.md](reference/data-types.md) — 数据类型（类型 ID）全量与选择方法
- [reference/user-definitions.md](reference/user-definitions.md) — 用户定义任务的详细规格
- [reference/mapping-functions.md](reference/mapping-functions.md) — 映射函数基础（52件）与使用方法
- [examples/article_count.spec.json](examples/article_count.spec.json) — 最小 spec 示例
