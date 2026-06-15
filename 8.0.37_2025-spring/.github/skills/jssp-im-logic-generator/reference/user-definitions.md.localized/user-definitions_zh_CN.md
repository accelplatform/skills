# 用户自定义任务参考

除普通任务（`key.type = "application"`）外，IM-LogicDesigner 还提供**用户自定义任务**（`key.type = "localUserDefinition"`），用户可以自由定义输入输出和逻辑。

## 与普通任务的区别

| 项目 | 普通任务 | 用户自定义任务 |
|---|---|---|
| `key.type` | `"application"` | `"localUserDefinition"` |
| `key.id` | 固定（`im_repositorySearchEntityData` 等） | 用户指定的 `definitionId` |
| properties | 任务特定的简单属性 | 全部信息包含在 `definition` 对象内 |
| 输入输出定义 | dataMap 的 metadata 内（模板固定或 MCP 解析） | `properties.definition.definitionData` 内（自由定义） |

## properties.definition 的通用结构

```jsonc
{
  "definition": {
    "definitionId": "<唯一 ID>",
    "version": 1,
    "categoryId": "",
    "definitionType": "javascript",   // "javascript" | "rest" | "sql" | "db_fetch"
    "definitionName": "<显示名称（英语）>",
    "sortNumber": 100,
    "definitionData": {
      "elementId": "<内部任务 ID>",
      "iconId": null,
      "elementProperties": { ... },   // 类型特定设置（见后文）
      "inputDataDefinition": { ... }, // 输入类型定义（自由定义）
      "outputDataDefinition": { ... } // 输出类型定义（自由定义）
    },
    "localize": {
      "ja": "<日语名称>"
    }
  },
  "continueOnError": false
}
```

## 类型列表

### 1. JavaScript 定义（`definitionType: "javascript"`）

用户可以自由编写 JavaScript 的任务。
在 Rhino 上运行，遵循与功能容器相同的编码规范。

| 项目 | 值 |
|---|---|
| `elementId` | `im_scriptExecutor` |
| 主要属性 | `script`（Rhino JavaScript 代码） |

**`elementProperties`：**

```jsonc
{
  "script": "function run(input) {\n  // 从 input 获取值并返回处理结果\n  return { message: 'hello' };\n}"
}
```

- 执行 `run(input)` 函数
- `input` 包含 `inputDataDefinition` 中定义的字段
- 返回值必须符合 `outputDataDefinition` 定义的结构

**不可用的 API：**

IM-LogicDesigner 的 JavaScript 定义中可以使用 JSSP 的各种 API，但以下 API 不可使用。

| 类别 | 不可用 API |
|---|---|
| Java 集成 | `java`, `Packages`, `loadClass` |
| 文件 / URL | `readFile`, `readUrl` |
| 运行时控制 | `seal`, `serialize`, `spawn`, `sync`, `version` |
| 请求控制 | `execute`, `forward`, `include`, `load`, `redirect`, `secureRedirect`, `transmission` |
| 文件 / 内容 | `Content`, `File` |
| 工具类 | `ImAjaxUtil`, `LicenseRegister`, `Web`, `Transfer`, `Module`, `Procedure` |
| DB | `SystemDatabase` |
| 存储 | `SystemStorage` |
| 管理器 | `PageManager`, `AdministratorManager`, `TenantInfoManager`, `WorkManager`, `PluginManager`, `VirtualTenantSwitcher` |
| 会话 / 客户端 | `Client`, `Permanent` |
| 租户 / 许可证 | `TenantLicense`, `CustomerSuccessLicense`, `ImServiceRestrictor` |
| 其他 | `Imart`, `garbageCollector` |
| v7.2 兼容（不支持） | `BatchManager`, `BatchServer`, `System`, `DataSourceMappingConfigurater`, `JsTestSuite`, `JsUnit`, `ResinDataSourceConfigurater`, `Batch`, `AccessSecurityManager`, `ActiveSessionManager`, `DuplicateLoginManager`, `LicenseManager`, `LoginBlockManager`, `LoginGroupManager`, `AdminMenuManager`, `AdminUserManager`, `ShortCutManager`, `WSAccessManager` |

使用这些 API 将导致运行时错误。替代方案是通过 REST 定义任务或 SQL 定义任务进行外部集成。

### 2. REST 定义（`definitionType: "rest"`）

执行任意 HTTP/HTTPS 请求的任务。
相当于浏览器的 fetch。

| 项目 | 值 |
|---|---|
| `elementId` | `im_httpclient` |

**`elementProperties`：**

```jsonc
{
  "endpointExpression": "https://api.example.com/items",
  "requestMethod": "GET",                  // "GET" | "POST" | "PUT" | "DELETE" 等
  "requestType": "x-www-form-urlencoded",  // "x-www-form-urlencoded" | "json" 等
  "requestHeaderNames": ["User-Agent"],
  "requestHeaderExpressions": ["MyApp/1.0"],
  "requestEncoding": "UTF-8",
  "requestFormKeys": ["Param1"],
  "requestFormValueExpressions": ["${param1}"],  // 使用 EL 表达式引用输入值
  "followRedirect": true,
  "requestTimeoutInSeconds": 30,
  "responseType": "text",                  // "text" | "binary"
  "responseEncoding": "UTF-8",
  "checkStatusCode": true
}
```

- 在 `requestFormValueExpressions` 中使用 `${<输入字段名>}` 将输入值嵌入参数（PathVariables）
- 通过 `requestHeaderNames` / `requestHeaderExpressions` 自由指定请求头

**标准输出类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `status.statusCode` | integer | HTTP 状态码 |
| `status.statusMessage` | string | HTTP 状态消息 |
| `headers` | map | 响应头 |
| `body` | string | 响应正文 |

### 3. SQL 定义（`definitionType: "sql"`）

执行任意 SQL 的任务。
使用 2way-sql。

| 项目 | 值 |
|---|---|
| `elementId` | `im_queryExecutor` |

**`elementProperties`：**

```jsonc
{
  "query": "SELECT\n    id\n  , name\n  , status\nFROM\n    your_table\nWHERE\n    id = /*param1*/'dummyId'\nORDER BY\n    id ASC",
  "queryType": "SELECT",         // "SELECT" | "INSERT" | "UPDATE" | "DELETE"
  "databaseType": "TENANT",      // "TENANT" | "SHARED"
  "connectId": "default",
  "limitation": false
}
```

- 在 `query` 中使用 `/*<输入字段名>*/` 绑定输入值（2way-sql 语法）
- 与 jssp 的 2way-sql 规范相同的机制
- **`query` 应使用 `\n` 进行适当换行** — 不要写成一行，在 SELECT / FROM / WHERE / ORDER BY 等关键字处换行以提高可读性

#### LIKE 搜索时的注意事项（LIKE 模式注入对策）

使用 LIKE 运算符时，需要采取与 `jssp-2way-sql.instructions.md` 中"LIKE 搜索时的转义"相同的对策。

1. **SQL 中必须附加 `ESCAPE '\'` 子句**
2. **LIKE 特殊字符（`\`、`%`、`_`）的转义和通配符添加必须在服务器端进行** — 不得从客户端发送 `%keyword%`
3. **在逻辑流中，使用 `user_javascript` 任务执行转义处理**（放置在 SQL 任务之前）

```jsonc
// user_javascript 任务的 script 示例
{
  "script": "function run(input) {\n  let keyword = input.keyword || '';\n  let escaped = keyword\n    .replace(/\\\\/g, '\\\\\\\\')\n    .replace(/%/g, '\\\\%')\n    .replace(/_/g, '\\\\_');\n  return { keyword: '%' + escaped + '%' };\n}"
}
```

```
流结构：im_start → [JS: 转义处理] → [SQL: LIKE 搜索] → im_end
```

**SELECT 时的标准输出类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `records` | list | 结果记录的数组 |
| `count` | integer | 记录数 |
| `query` | string | 实际执行的 SQL 语句 |

### 4. Database Fetch 定义（`definitionType: "db_fetch"`）

专用于 SELECT，逐行取出数据并循环处理的任务。
处理大量记录时比 SQL 定义更省内存。

| 项目 | 值 |
|---|---|
| `elementId`（开始） | `im_startDbFetch` |

**`elementProperties`：**

```jsonc
{
  "query": "SELECT * FROM your_table WHERE id = /*param1*/'dummyId' ORDER BY id ASC",
  "databaseType": "TENANT",
  "connectId": "default",
  "fetchSize": "10",
  "limitation": false
}
```

- 通过 `fetchSize` 指定每次读取的行数

#### 开始/结束对结构

Database Fetch 由 **2 个 flowElement** 组成：

| 元素 | key.id | 作用 |
|---|---|---|
| 开始 | `<definitionId>`（例：`sample-db-fetch`） | 循环开始 / SQL 执行 |
| 结束 | `$<definitionId>$`（例：`$sample-db-fetch$`） | 循环结束 |

结束元素的 `properties`：
```jsonc
{ "startPoint": "sample-db-fetch" }
```

**流结构：**
```
→ sample-db-fetch → [循环内处理] → $sample-db-fetch$ →
```

在循环内处理中，可以从开始元素的输出中引用 `item`（1 行数据）。

**输出类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `item.<列名>` | 各列的类型 | 当前行的数据 |

### 5. 模板定义（`definitionType: "template"`）

使用 FreeMarker 模板引擎从输入数据生成文本的任务。
用于生成邮件正文和报告。

| 项目 | 值 |
|---|---|
| `elementId` | `im_templateProcessor` |

**`elementProperties`：**

```jsonc
{
  "defaultTemplate": "<#setting url_escaping_charset=\"UTF-8\">\nHello, ${userName}.\n...",
  "localizedTemplate": {
    "ja": "",      // 各语言模板（空字符串时使用 defaultTemplate）
    "en": "",
    "zh_CN": ""
  }
}
```

- 在 `defaultTemplate` 中编写 FreeMarker 语法的模板
- 可通过 `localizedTemplate` 按语言覆盖（空字符串 = 使用 defaultTemplate）
- 在模板内使用 `${字段名}` 引用输入数据的 `data` 对象中的字段

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `locale` | locale | 用于模板选择的区域设置 |
| `data` | object | 传递给模板的数据（自由定义） |

**输出类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `output` | string | 模板处理结果的字符串 |

### 6. 存储过程定义（`definitionType: "stored"`）

调用数据库存储过程／函数的任务。
相当于 JDBC 的 CallableStatement，可处理 IN / OUT 参数和结果集。

| 项目 | 值 |
|---|---|
| `elementId` | `im_storedExecutor` |

**`elementProperties`：**

```jsonc
{
  "sql": "{ /*param3*/ = call my_func(/*param1*/, /*param2*/) }",
  "databaseType": "TENANT",   // "TENANT" | "SHARED"
  "connectId": "default"
}
```

- `sql` 使用 JDBC 的 CallableStatement 转义语法（`{ call ... }` / `{ ?= call ... }`）编写。
- 占位符使用 2way-sql 语法 `/*<输入字段名>*/`。
  - **IN 参数**：引用 `inputDataDefinition` 中定义的输入字段，例如 `/*param1*/`。
  - **OUT 参数（含返回值）**：引用 `outputDataDefinition` 中 `outParameters` 下定义的字段，例如 `/*param3*/`。
- `databaseType` / `connectId` 与 SQL 定义相同（指定目标数据库）。

**标准输出类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `outParameters.<名称>` | 各 OUT 参数的类型 | OUT 参数／返回值（例如以 `bigdecimal` 接收 `param3`） |
| `resultSets` | object | 存储过程返回的结果集（无返回时为空） |

- 在 `outParameters` 下定义 OUT 参数／返回值。类型需与所调用存储过程的定义一致（数值则用 `bigdecimal` 等）。
- 若存储过程返回结果集，则在 `resultSets` 下定义列结构。

### 7. CSV 提取定义（`definitionType: "csv_fetch"`）

逐行读取存储上的 CSV 文件并迭代的任务。
与 Database Fetch 一样具有**开始/结束成对结构**，可以低内存地顺序处理大型 CSV。

| 项目 | 值 |
|---|---|
| `elementId`（开始） | `im_startCsvFetch` |

**`elementProperties`：**

```jsonc
{
  "encoding": "UTF-8",          // 文件编码
  "quoteCharacter": "\"",       // 引用符
  "delimiterCharacter": ",",    // 分隔符
  "endOfLineSymbols": "\n",     // 换行符
  "skipHeader": true,            // 是否跳过首行（表头）
  "mismatchOnError": false       // 列数不匹配时是否报错
}
```

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `file` | storage | 要读取的 CSV 文件（存储上的文件） |

**输出类型（在循环内引用）：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `string1` / `string2` / ... | string | 当前行的各列值（按列数定义） |

#### 开始/结束成对结构

与 Database Fetch 相同，CSV 提取由 **两个 flowElement** 组成：

| 元素 | key.id | properties | 作用 |
|---|---|---|---|
| 开始 | `<definitionId>`（例如 `sample-csv-fetch`） | `{ definition, endPoint }` | 循环开始／读取 CSV |
| 结束 | `$<definitionId>$`（例如 `$sample-csv-fetch$`） | `{ startPoint }` | 循环结束 |

**流程结构：**
```
→ sample-csv-fetch → [循环内处理] → $sample-csv-fetch$ →
```

- 无需在 spec 的 `tasks` 中编写结束元素（`user_csv_fetch_end`）；`build-flow.js` 会自动生成。
- 循环内处理可引用开始元素的输出（`string1` 等）。

### 8. CSV 输出定义（`definitionType: "csv_output"`）

将输入的记录列表作为 CSV 文件输出到存储的任务。
与 CSV 提取不同，它是**单体任务**（非成对结构），并可定义各列的标签、数据类型和格式。

| 项目 | 值 |
|---|---|
| `elementId` | `im_csvOutput` |

**`elementProperties`：**

```jsonc
{
  "encoding": "UTF-8",          // 文件编码
  "quoteCharacter": "\"",       // 引用符
  "delimiterCharacter": ",",    // 分隔符
  "endOfLineSymbols": "\n",     // 换行符
  "addHeader": true,             // 是否输出表头行（labelName）
  "withBom": false,              // 是否添加 BOM
  "cols": [                       // 输出列定义（对应 records 的各字段）
    { "paramName": "param1", "labelName": "PARAM1", "dataType": "STRING", "format": "" },
    { "paramName": "param2", "labelName": "PARAM2", "dataType": "STRING", "format": "" }
  ]
}
```

- 用 `cols` 定义要输出的列：
  - `paramName`：`records` 各记录所持有的字段名
  - `labelName`：输出到表头行的列名（当 `addHeader: true` 时）
  - `dataType`：`STRING` / `NUMBER` / `DATETIME` 等
  - `format`：日期／数值的格式（按 `dataType` 指定；不需要时为空字符串）

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `outputFile` | storage | 输出目标 CSV 文件（存储上的文件） |
| `targetTimezone` | timezone | 输出日期时间字段时使用的时区 |
| `records` | list | 要输出的记录数组（各记录的字段对应 `cols.paramName`） |

**输出类型：**

无输出数据（空 root）。CSV 写入到目标文件（`outputFile`）。

### 9. Excel 输入定义（`definitionType: "excel_in"`）

从存储上的 Excel 文件（xlsx 等）读取单元格值和表格数据的任务。
它是**单体任务**，可组合单元格读取（`cells`）和表格读取（`tables`）。

| 项目 | 值 |
|---|---|
| `elementId` | `im_excelInput` |

**`elementProperties`：**

```jsonc
{
  "selectSheetType": "NAME",      // 工作表指定方式（"NAME"：按名称 / "INDEX"：按序号）
  "cells": [                       // 单元格读取定义
    { "sheet": "Sheet1", "address": "A1", "paramName": "param1", "dataType": "NUMERIC" }
  ],
  "tables": [                      // 表格读取定义
    {
      "sheet": "Sheet1",
      "arrParamName": "records1",  // 输出数组字段名
      "startCol": "A",             // 读取起始列
      "endCol": "B",               // 读取结束列
      "startRow": "1",             // 读取起始行
      "cols": [                     // 各列定义
        { "name": "A", "paramName": "columnA", "dataType": "NUMERIC", "disuse": false },
        { "name": "B", "paramName": "columnB", "dataType": "NUMERIC", "disuse": false }
      ],
      "inputEndCondition": "ALL_EMPTY",  // 读取结束条件（见下）
      "notReadLastRow": false,            // 是否不读取符合结束条件的最后一行
      "useBeforeValue": false             // 是否将前一个值沿用到空单元格
    }
  ],
  "dataTypeLenient": true          // 是否宽松地进行数据类型转换
}
```

**`cells` / `tables.cols` 的各项：**

- `sheet`：工作表名称（`selectSheetType: "NAME"` 时）或工作表序号（`"INDEX"` 时）
- `address`：单元格地址（仅 `cells`，例如 `A1`）
- `name`：列（仅 `tables.cols`，列字母，例如 `A`）
- `paramName`：输出字段名
- `dataType`：`STRING` / `NUMERIC` / `DATETIME` 等
- `disuse`（仅 `tables.cols`）：是否跳过该列

**`inputEndCondition`（表格读取结束条件）的 3 种模式：**

| 值 | 说明 | 附加属性 |
|---|---|---|
| `ALL_EMPTY` | 到达所有列均为空的行时结束 | 无 |
| `SPECIFY_ROWS` | 仅读取指定的行数 | `specifiedRows`（例如 `"5"`） |
| `CELL_EMPTY` | 指定列的单元格变为空时结束 | `specifiedEmptyCol`（例如 `"A"`） |

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `file` | storage | 要读取的 Excel 文件（存储上的文件） |
| `targetTimezone` | timezone | 读取日期时间单元格时使用的时区 |
| `password` | string | 打开受密码保护工作簿的密码（不需要时为空） |

**输出类型：**

输出 `cells` 的各 `paramName`（单值）以及 `tables` 的各 `arrParamName`（记录数组）。
数值单元格（`dataType: "NUMERIC"`）以 `double` 类型输出。

### 10. Excel 输出定义（`definitionType: "excel_out"`）

将输入数据写入 Excel 文件（xlsx 等）的单元格和表格并输出的任务。
它是**单体任务**：读取模板 Excel（`inputFile`），写入数据后保存到输出目标（`outputFile`）。

| 项目 | 值 |
|---|---|
| `elementId` | `im_excelOutput` |

**`elementProperties`：**

```jsonc
{
  "selectSheetType": "NAME",          // 工作表指定方式（"NAME"：按名称 / "INDEX"：按序号）
  "setFormulaRecalculation": false,    // 输出时是否重新计算公式
  "cells": [                           // 单元格写入定义
    { "sheet": "Sheet1", "address": "A1", "paramName": "param1", "dataType": "NUMERIC" }
  ],
  "tables": [                          // 表格写入定义
    {
      "sheet": "Sheet1",
      "arrParamName": "records1",      // 要写入的记录数组字段名
      "startCol": "A",                 // 写入起始列
      "endCol": "B",                   // 写入结束列
      "startRow": "1",                 // 写入起始行
      "cols": [                         // 各列定义
        { "name": "A", "paramName": "columnA", "dataType": "NUMERIC", "disuse": false },
        { "name": "B", "paramName": "columnB", "dataType": "NUMERIC", "disuse": false }
      ],
      "outputEndCondition": "ALL_DATA_WRITEN"  // 写入结束条件（见下）
    }
  ]
}
```

- `cells` / `tables` 的各项**与 Excel 输入定义相同**（`sheet` / `address` / `name` / `paramName` / `dataType` / `disuse`）。
- 与 Excel 输入定义不同，它具有 `setFormulaRecalculation`，且没有 `dataTypeLenient`。

**`outputEndCondition`（表格写入结束条件）的 2 种模式：**

| 值 | 说明 | 附加属性 |
|---|---|---|
| `ALL_DATA_WRITEN` | 写入全部输入记录 | 无 |
| `SPECIFY_ROWS` | 仅写入指定的行数 | `specifiedRows`（例如 `"5"`） |

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `outputFile` | storage | 输出目标 Excel 文件（存储上的文件） |
| `inputFile` | storage | 作为模板读取的 Excel 文件 |
| `targetTimezone` | timezone | 写入日期时间单元格时使用的时区 |
| `password` | string | 打开受密码保护工作簿的密码（不需要时为空） |
| `param1` 等 | （对应 `cells`） | 写入单元格的值 |
| `records1` 等 | list（对应 `tables`） | 写入表格的记录数组 |

**输出类型：**

无输出数据（空 root）。Excel 写入到目标文件（`outputFile`）。

### 11. XML 解析定义（`definitionType: "xmlparser"`）

解析 XML 数据并提取由 XPath 指定的值的任务。
它是**单体任务**：使用多个 XPath 表达式从输入 XML（二进制）中提取值并映射到输出字段。

| 项目 | 值 |
|---|---|
| `elementId` | `im_xmlparser` |

**`elementProperties`：**

```jsonc
{
  "paths": [                          // 提取值的定义（XPath -> 输出字段）
    { "paramName": "string1", "xpath": "/root/string1" },
    { "paramName": "string2", "xpath": "//string2" }
  ]
}
```

- `paths` 的各项将 `xpath` 指定节点的值提取到 `paramName` 输出字段：
  - `paramName`：输出字段名（对应 `outputDataDefinition` 的各字段）
  - `xpath`：XPath 表达式（绝对路径 `/root/...`、相对路径 `//...` 等）

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `xml` | binary | 要解析的 XML 数据（二进制） |

**输出类型：**

`paths` 的各 `paramName` 以 `string` 类型输出（由 XPath 提取的值）。

### 12. HTML 解析定义（`definitionType: "htmlparser"`）

解析 HTML 数据并提取由 CSS 选择器指定元素的值的任务。
它是**单体任务**：与 XML 解析定义类似，但使用 **CSS 选择器** 而非 XPath 来指定元素。

| 项目 | 值 |
|---|---|
| `elementId` | `im_htmlparser` |

**`elementProperties`：**

```jsonc
{
  "paths": [                          // 提取值的定义（CSS 选择器 -> 输出字段）
    { "paramName": "string1", "selector": "body>h1" },
    { "paramName": "string2", "selector": ".input-label span" }
  ]
}
```

- `paths` 的各项将 `selector` 指定元素的值提取到 `paramName` 输出字段：
  - `paramName`：输出字段名（对应 `outputDataDefinition` 的各字段）
  - `selector`：CSS 选择器（例如 `body>h1`、`.input-label span`、`#id` 等）

**标准输入类型：**

| 字段 | 类型 | 说明 |
|---|---|---|
| `html` | binary | 要解析的 HTML 数据（二进制） |
| `charset` | string | HTML 的字符编码（例如 `UTF-8`；不需要时为空） |

**输出类型：**

`paths` 的各 `paramName` 以 `string` 类型输出（由 CSS 选择器提取的值）。

## 在 spec.json 中编写用户自定义任务的方法

```jsonc
{
  "type": "user_javascript",         // 模板名称
  "label": "邮件发送处理",
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

在 `userDefinition` 字段中编写定义内容。
`build-flow.js` 会将其转换为 `properties.definition` 结构。

## SQL 定义与 Database Fetch 定义的使用场景对比

| 场景 | 推荐 |
|---|---|
| 想以数组形式获取全部结果 | SQL 定义 |
| 记录数量少（数百条以下） | SQL 定义 |
| 记录数量大（数千条以上） | Database Fetch 定义 |
| 想逐行顺序处理 | Database Fetch 定义 |
| INSERT / UPDATE / DELETE | SQL 定义（Database Fetch 仅用于 SELECT） |
| 想要调用存储过程／函数 | 存储过程定义 |
| 想要接收 OUT 参数／返回值 | 存储过程定义 |
| 想要逐行处理存储上的 CSV | CSV 提取定义 |
| 想要将记录列表输出为 CSV 文件 | CSV 输出定义 |
| 想要从 Excel 文件读取单元格值・表格数据 | Excel 输入定义 |
| 想要将数据写入 Excel 文件的单元格・表格 | Excel 输出定义 |
| 想要通过 XPath 从 XML 数据提取值 | XML 解析定义 |
| 想要通过 CSS 选择器从 HTML 数据提取值 | HTML 解析定义 |
