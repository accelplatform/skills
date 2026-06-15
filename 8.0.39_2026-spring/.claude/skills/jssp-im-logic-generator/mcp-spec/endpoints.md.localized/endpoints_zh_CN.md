# MCP 服务器端点规范

提供 IM-LogicDesigner 任务定义的 MCP 服务器的端点规范。

为避免与其他 MCP 服务器混淆，所有工具名均添加 `imLogic` 前缀。

---

## 1. `imLogicListTaskTypes`

返回任务类别的一览。
用于从 300 多个任务中定位目标任务。

### 参数

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `query` | string | No | 关键字检索。对 `keyId` / `label` / `description` / `category` 进行部分匹配。省略时返回全部 |
| `category` | string | No | 按类别过滤（完全匹配） |
| `keyType` | string | No | 按任务类别过滤。`application`（普通任务） / `userDefinition`（用户定义任务） |
| `definitionType` | string | No | 按用户定义任务的种别过滤。`javascript` / `rest` / `sql` / `db_fetch` / `template`。隐含指定 `keyType = userDefinition` |

### 响应

参见 [imLogicListTaskTypes.response.json](schemas/imLogicListTaskTypes.response.json)。

### 调用示例

```jsonc
// 获取全部
{ "method": "imLogicListTaskTypes", "params": {} }

// 关键字检索
{ "method": "imLogicListTaskTypes", "params": { "query": "授权" } }

// 类别过滤
{ "method": "imLogicListTaskTypes", "params": { "category": "仓库" } }

// 仅获取用户定义任务
{ "method": "imLogicListTaskTypes", "params": { "keyType": "userDefinition" } }

// 仅获取模板种别的用户定义任务
{ "method": "imLogicListTaskTypes", "params": { "definitionType": "template" } }
```

### 备注

- 即使获取全部，由于仅含概要，预计可控制在数十 KB 左右
- `hasEntityId: true` 的任务在制作 spec 时需要追加调用 `imLogicResolveEntitySchema`（用户定义任务始终为 `false`）
- 除普通任务（`keyType = "application"`）外，还包含已在租户环境注册的用户定义任务（`keyType = "userDefinition"`）。用户定义任务通过 `definitionType`（`javascript` / `rest` / `sql` / `db_fetch` / `template`）区分。用户定义任务的结构参见 [reference/user-definitions.md](../reference/user-definitions.md)

---

## 2. `imLogicGetTaskTemplate`

返回指定任务类别的完整模板（1 件）。
包含 `build-flow.js` 消费的全部信息。

### 参数

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `keyId` | string | Yes | 任务类别 ID。普通任务为任务类别 ID（例: `im_authorizeAuthz`），用户定义任务为 `definitionId`（例: `mail_sender`） |
| `keyType` | string | Yes | 按任务类别过滤。`application`（普通任务） / `userDefinition`（用户定义任务） |

### 响应

参见 [imLogicGetTaskTemplate.response.json](schemas/imLogicGetTaskTemplate.response.json)。

### 调用示例

```jsonc
// 普通任务
{ "method": "imLogicGetTaskTemplate", "params": { "keyId": "im_authorizeAuthz" } }

// 用户定义任务（指定 definitionId）
{ "method": "imLogicGetTaskTemplate", "params": { "keyId": "mail_sender" } }
```

### 备注

- 对于实体任务（`hasEntityId: true`），`dataMapMetadata.inputDataDefinition` / `outputDataDefinition` 返回未指定实体时的默认值（空或通用 schema）。基于实际实体的类型应通过 `imLogicResolveEntitySchema` 取得并覆盖
- `cellSample` 的 `id` / `position` / `z` 会被 build-flow.js 覆盖，因此模板内的值为占位符
- `optionMap` 的 `title` / `label` 同样会被覆盖
- 对于用户定义任务（`keyType = "userDefinition"`），`flowElementSample.properties` 具有 `{ definition: { definitionId, definitionType, definitionData: { elementId, elementProperties, inputDataDefinition, outputDataDefinition }, localize, ... }, continueOnError }` 结构。`elementProperties` 的内容因 `definitionType` 而异（`javascript`: `{ script }`、`sql`: `{ query, queryType, ... }` 等）。详情参见 [reference/user-definitions.md](../reference/user-definitions.md)
- 用户定义任务的 `inputDataDefinition` / `outputDataDefinition` 由用户在租户侧自由定义，无需通过 `imLogicResolveEntitySchema` 覆盖

---

## 3. `imLogicListEntities`

返回 IM-Repository 实体的一览。
用于定位将实体用作输入／输出的流，或实体任务中使用的 `entityId`。
**由于向 `imLogicResolveEntitySchema` 传入不存在的 `entityId` 可能导致挂起，请先用本端点定位真实存在的 `entityId` 再传入。**

### 参数

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `query` | string | No | 关键字检索。对 `entityId` / `entityName` / `category` / `description` 进行部分匹配。省略时返回全部 |
| `category` | string | No | 按类别过滤（完全匹配） |
| `dataSourceType` | string | No | 按数据源种别过滤。`table` / `view` / `query` / `static` / `webservice` |

### 响应

参见 [imLogicListEntities.response.json](schemas/imLogicListEntities.response.json)。

### 调用示例

```jsonc
// 获取全部
{ "method": "imLogicListEntities", "params": {} }

// 关键字检索（显示名・ID 的部分匹配）
{ "method": "imLogicListEntities", "params": { "query": "富文本" } }

// 类别过滤
{ "method": "imLogicListEntities", "params": { "category": "门户组件" } }
```

### 备注

- 不含字段（列）定义的轻量概要。字段定义通过 `imLogicResolveEntitySchema` 取得（与 `imLogicListTaskTypes` ⇒ `imLogicGetTaskTemplate` 相同的两段式）
- `entityId` 与 `entityName` 为必填。`category` / `dataSourceType` / `description` 可能被省略
- 即使获取全部，由于仅含概要，预计可保持轻量

---

## 4. `imLogicResolveEntitySchema`

基于实体 ID，动态解析并返回任务的输入/输出字段定义。
从 IM-Repository 取得实体的 schema，并根据任务类别构建 `inputDataDefinition` / `outputDataDefinition`。

### 参数

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `keyId` | string | Yes | 任务类别 ID（例: `im_repositorySearchEntityData`） |
| `entityId` | string | Yes | 实体 ID（例: `imprtl_portlet_info_tables_imprtl_portlet_info`） |

### 响应

参见 [imLogicResolveEntitySchema.response.json](schemas/imLogicResolveEntitySchema.response.json)。

### 调用示例

```jsonc
{
  "method": "imLogicResolveEntitySchema",
  "params": {
    "keyId": "im_repositorySearchEntityData",
    "entityId": "imprtl_portlet_info_tables_imprtl_portlet_info"
  }
}
```

### 备注

- 返回的 `inputDataDefinition` / `outputDataDefinition` 用于覆盖通过 `imLogicGetTaskTemplate` 取得的模板的 `dataMapMetadata` 内的同名字段
- 若实体未找到，服务器侧将抛出异常并使工具执行失败（详情参见末尾「错误时的行为」）。仅传入真实存在的 `entityId`

---

## 5. `imLogicListMappingFunctions`

返回可在映射中使用的函数一览。
在变量间映射中需要值的转换・加工时使用。

### 参数

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `query` | string | No | 关键字检索。对 `name` / `label` / `description` / `category` 进行部分匹配。省略时返回全部 |
| `category` | string | No | 按类别过滤（完全匹配） |

### 响应

参见 [imLogicListMappingFunctions.response.json](schemas/imLogicListMappingFunctions.response.json)。

### 调用示例

```jsonc
// 获取全部
{ "method": "imLogicListMappingFunctions", "params": {} }

// 关键字检索
{ "method": "imLogicListMappingFunctions", "params": { "query": "数组" } }

// 类别过滤
{ "method": "imLogicListMappingFunctions", "params": { "category": "字符串操作" } }
```

### 备注

- 目前约 50 件。即使获取全部也很轻量（数 KB）
- `argCount` 可大致了解参数数量。详情通过 `imLogicGetMappingFunction` 取得

---

## 6. `imLogicGetMappingFunction`

返回指定函数的完整定义。
包含参数 schema・返回值类型・使用示例。

### 参数

| 名称 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `name` | string | Yes | 函数名（例: `im_array_size`） |

### 响应

参见 [imLogicGetMappingFunction.response.json](schemas/imLogicGetMappingFunction.response.json)。

### 调用示例

```jsonc
{ "method": "imLogicGetMappingFunction", "params": { "name": "im_array_size" } }
```

### 备注

- `arguments[]` 的顺序对应 `mappingRules.source.arguments[]` 的索引
- `examples[]` 包含使用示例。可作为编码代理组装正确 `source` 结构的素材
- 函数的嵌套（将另一个函数作为参数传入）可通过 `mappingSource` 的递归结构表达

---

## 使用流程

1. `imLogicListTaskTypes(query?, keyType?, definitionType?)` ⇒ `imLogicGetTaskTemplate(keyId)`
   - 定位符合目的的任务 `keyId`（普通任务或用户定义任务）
   - 取得模板（相当于 `build-flow.js` 的 `task-templates/*.json`）
   - 用户定义任务可通过 `keyType = userDefinition` 或 `definitionType` 过滤

2. `imLogicListEntities(query?, category?)` ⇒ `imLogicResolveEntitySchema(keyId, entityId)`  ※ 仅在使用实体时
   - 用 `imLogicListEntities` 定位真实存在的 `entityId`（`hasEntityId: true` 的任务，或将实体用作输入/输出的流）
   - 用 `imLogicResolveEntitySchema` 取得实体特有的输入/输出类型定义
   - 覆盖模板的 `dataMapMetadata.inputDataDefinition` / `outputDataDefinition`（用于流输入/输出时作为类型定义转用）
   - **不要向 `imLogicResolveEntitySchema` 传入猜测的 `entityId`**（避免挂起；务必传入通过 `imLogicListEntities` 定位的值）
   - 用户定义任务不需要

3. `imLogicListMappingFunctions(query?)` ⇒ `imLogicGetMappingFunction(name)`  ※ 仅在需要值的转换・加工时
   - 取得映射中使用的函数的名称・参数定义

4. 组装 `spec.json` 并运行 `build-flow.js`

## 错误时的行为

所有端点通用。

当指定了不存在的 `keyId` / `name` / `entityId` 等时，服务器**不返回结构化的错误响应（JSON），而是在服务器侧抛出异常并使工具执行本身失败**。

服务器日志输出如下所示。

```
[ERROR] j.c.i.f.c.m.s.McpAsyncServer - [E.IWP.COPILOT.MCP.00058] 工具执行失败。
java.lang.IllegalArgumentException: Task type not found. keyId=im_no_such_task, keyType=application
```

**注意（面向编码代理）：**

- 当工具执行失败（异常）时，调用方（MCP 客户端）无法接收响应，**可能陷入等待状态（挂起）**。
- 因此，调用 `imLogicGetTaskTemplate` / `imLogicGetMappingFunction` / `imLogicResolveEntitySchema` 时，不要传入猜测的不存在 ID。
- 先用一览类端点（`imLogicListTaskTypes` / `imLogicListMappingFunctions`）定位真实存在的 `keyId` / `name`，仅将这些值传入详情取得类端点。
- 对于实体（`hasEntityId: true`）同样，仅向 `imLogicResolveEntitySchema` 传入真实存在的 `entityId`。
