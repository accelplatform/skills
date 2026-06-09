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

使用 LIKE 运算符时，需要采取与 `jssp-2way-sql.md` 中"LIKE 搜索时的转义"相同的对策。

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
