# IM-LogicDesigner 数据类型参考

IM-LogicDesigner 逻辑流中可使用的数据类型（类型 ID）的完整列表。
在 `inputDataDefinition` / `outputDataDefinition` / `variablesDataDefinition` 的 `typeId` 以及 `constants[].typeId` 中指定。

出处：[IM-LogicDesigner 规格书 - 数据类型](https://document.intra-mart.jp/library/iap/public/im_logic/im_logic_specification/texts/function_specification/logic_flow/index.html#function-specification-logic-flow-data-type)

## 基本类型

### 字符串和布尔值

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `string` | String | 字符串 |
| `boolean` | Boolean | 布尔值 |

### 整数

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `byte` | Byte | 1 字节整数（-128 ~ 127） |
| `character` | Character | 2 字节字符数据（u0000 ~ uffff） |
| `short` | Short | 2 字节整数（-32768 ~ 32767） |
| `integer` | Integer | 4 字节整数（-2147483648 ~ 2147483647） |
| `long` | Long | 8 字节整数 |
| `biginteger` | BigInteger | 任意精度有符号整数 |

### 浮点数

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `float` | Float | 4 字节单精度浮点数 |
| `double` | Double | 8 字节双精度浮点数 |
| `bigdecimal` | BigDecimal | 任意精度有符号小数 |

### 日期和时间

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `calendar` | Calendar | 日期操作用日历（包含日期时间和时区信息） |
| `date` | Date | 日期时间（不含时区信息） |
| `imdatetime` | IM DateTime | 日期时间（intra-mart 专有，包含时区信息） |
| `imduration` | IM Duration | 时间段 |
| `sqldate` | SQL Date | 对应 java.sql.Date 的日期类型（不含时区信息） |
| `sqltimestamp` | SQL Timestamp | 对应 java.sql.Timestamp 的日期类型（不含时区信息） |

### 区域设置和时区

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `locale` | Locale | 区域设置 |
| `timezone` | TimeZone | 时区 |

### 数据和存储

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `binary` | Binary | 二进制数据 |
| `sqlclob` | SQL Clob | 对应 java.sql.Clob 的类型 |
| `storage` | Storage | 可在 intra-mart Accel Platform 上使用的存储 |
| `map` | Map | 对应 java.util.Map 的类型 |

### 特殊类型

| 类型 ID | 数据类型 | 说明 |
|---|---|---|
| `any` | Any | 未知类型。接受任意值 |

## 类型选择指南

### 日期和时间

**如有疑问，请使用 `imdatetime`。** 它完整保存日期时间和时区，是最安全的选择。

| 场景 | 推荐类型 |
|---|---|
| 日期时间的输入输出和变量（通用） | `imdatetime` |
| 需要与 Java Calendar 相互转换 | `calendar` |
| 仅需日期，不需要时区 | `date` |
| DB 列为 java.sql.Date | `sqldate` |
| DB 列为 java.sql.Timestamp | `sqltimestamp` |
| 时间段（天数、时间差等） | `imduration` |

### 整数

**通常 `integer` 已足够。** `byte` / `short` 几乎不使用。

| 场景 | 推荐类型 |
|---|---|
| 数量、ID、一般整数 | `integer` |
| 超过 integer 范围的大整数 | `long` |
| long 也不够用的任意精度整数 | `biginteger` |

### 小数

**基本采用 `bigdecimal`。** 在金额等不允许计算误差的场景中必须使用。

| 场景 | 推荐类型 |
|---|---|
| 需要精度的计算，如金额、税率等 | `bigdecimal` |
| 优先考虑性能且可接受误差 | `double` |

### 数据和存储

| 场景 | 推荐类型 |
|---|---|
| 内存中的二进制数据（相当于 byte[]） | `binary` |
| 存储上的文件（通过文件路径引用） | `storage` |
| SQL 用户自定义响应（仅输出值） | `sqlclob` |

**注意：**
- 不使用 SQL 时不要使用 `sqlclob`。
- 向 `storage` 类型的映射只支持 `string`（文件路径字符串）或 `storage` 类型。不支持从其他类型映射。

## 复合类型

除上述基本类型外，还可以将以下复合类型用作 `typeId`。
这些类型在 `typeDefinitions` 中以 `id` 定义，并通过 `properties` 包含字段。

| 模式 | 说明 | 示例 |
|---|---|---|
| `imr_entity` | IM-Repository 实体 | - |
| `imrepo_entity_*` | 实体引用类型（通过 mcp__im_logic__resolve_entity_schema 解析） | `imrepo_entity_search_imprtl_portlet_info_tables_imprtl_portlet_info` |
| `im_logic_object_*` | 流内本地对象类型 | `im_logic_object_1` |
| `jp_co_intra_mart_*` | 基于 Java 类的类型（在任务输入输出定义内） | `jp_co_intra_mart_foundation_logic_element_authz_AuthorizeAuthzTaskResultObject` |
| `root` | 类型定义的根（从 entrypoint 引用） | - |

## listingType

通过将 `listingType` 与 `typeId` 组合使用，可以表示数组类型。

| listingType | 含义 | 选择条件 |
|---|---|---|
| `none` | 单个值 | 值只有 1 条时（标量值、1 个对象） |
| `list` | 列表型数组 | 在用户自定义输入输出或流变量中处理多条记录时 |
| `array` | 数组类型 | 内置任务输出定义（基于 Java 类的类型）返回多条记录时 |

在 spec 中定义输入输出或流变量时，使用 `none` 或 `list`。
`array` 主要出现在内置任务模板输出中，因此在创建 spec 时明确指定的机会较少。
