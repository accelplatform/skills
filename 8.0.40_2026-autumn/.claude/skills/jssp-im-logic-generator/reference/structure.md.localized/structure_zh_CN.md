# flow_definition.json 结构参考

## 顶层结构

```jsonc
{
  "flowCategories": [ /* 类别定义 */ ],
  "flowDefinitions": [
    "<流定义 1 经 JSON.stringify 后的字符串>",
    "<流定义 2 经 JSON.stringify 后的字符串>"
  ]
}
```

`flowDefinitions` 的每个元素是**经字符串转义的流定义 JSON**。
读取时需要 `JSON.parse`。

## flowCategories 的元素

```jsonc
{
  "categoryId": "imprtl_portlet_info",
  "categoryName": "Information Portlet",
  "sortNumber": 0,
  "localizes": {
    "ja":   { "locale":"ja",    "categoryName":"お知らせポートレット" },
    "en":   { "locale":"en",    "categoryName":"Information Portlet" },
    "zh_CN":{ "locale":"zh_CN", "categoryName":"门户组件" }
  },
  "parentId": "imprtl_portlet",
  "displayName": "お知らせポートレット"
}
```

## 流定义（解析后）的结构

```jsonc
{
  "flowId": "...",
  "version": 1,
  "categoryId": "...",
  "flowName": "...",
  "localizes": {},
  "notes": "",
  "versionComment": null,
  "transaction": true,
  "validateRepositoryData": false,
  "mappingOrder": "SOURCE_HIERARCHY",
  "constants": [
    { "name":"ERROR_NO_ARTICLE_FOUND_JA", "value":"...", "typeId":"string", "description":"", "common":false }
  ],
  "variablesDataDefinition": { /* 类型定义（见后文） */ },
  "flowElements": [ /* 任务或 sequence 的数组 */ ],
  "inputDataDefinition":  { /* 类型定义 */ },
  "outputDataDefinition": { /* 类型定义 */ },
  "additional": {
    "ui": "<JointJS 图形经 JSON.stringify 后的字符串>"
  }
}
```

## 类型定义（input/output/variables 通用）

```jsonc
{
  "entrypoint": {
    "typeId": "root",          // 引用 typeDefinitions[].id
    "basic": false,
    "required": false,
    "listingType": "none"      // "none" | "list" | "array"
  },
  "typeDefinitions": [
    {
      "id": "root",
      "properties": [
        { "typeId":"string",  "name":"foo", "listingType":"none", "required":true,  "basic":true },
        { "typeId":"imrepo_entity_xxx", "name":"input", "listingType":"none", "required":false, "basic":false }
      ]
    },
    { "id": "string",  "properties": [] },
    { "id": "integer", "properties": [] },
    { "id": "imrepo_entity_xxx", "properties": [ /* 实体字段 */ ] }
  ]
}
```

- **basic** = 基本类型为 `true`，复合类型为 `false`
- **listingType** = `"none"` / `"list"` / `"array"`（选择条件参见 [data-types.md](data-types.md#listingtype)）
- **typeId** 可指定基本类型（`string` / `integer` / `boolean` / `long` / `double` / `bigdecimal` / `date` / `imdatetime` 等）、实体引用类型（`imrepo_entity_*`）或流内本地类型（`im_logic_object_*`）。完整列表参见 [data-types.md](data-types.md)

## flowElements

混合包含两种元素。

### 任务元素

普通任务的 `key.type` 为 `"application"`，用户自定义任务为 `"localUserDefinition"`。

```jsonc
{
  "executeId": "im_repositorySearchEntityCount1",
  "alias": null,
  "key": { "type":"application", "id":"im_repositorySearchEntityCount", "version": null },
  "label": "获取实体数据件数",
  "comment": "",
  "properties": { "continueOnError": false, "entityId": "..." },
  "mappingDefinition": {
    "mappingRules": [
      { "id":"<uuid>", "target":"<path>", "source": { /* 见后文 */ } }
    ]
  }
}
```

### sequence 元素（连接线）

```jsonc
{
  "executeId": "im_start_im_repositorySearchEntityCount1",
  "alias": null,
  "key": { "type":"application", "id":"im_sequence", "version": null },
  "label": null,
  "comment": null,
  "properties": {
    "startPoint": "im_start",
    "endPoint": "im_repositorySearchEntityCount1",
    "condition": "${...}"   // 可选。来自 gateway 的分支条件
  },
  "mappingDefinition": null
}
```

## mappingRules.source 的 type

- **`value`**：值引用
  ```jsonc
  { "type":"value", "name":null, "path":"$input/foo/bar", "arguments":null }
  ```
- **`function`**：函数调用（递归地在 arguments 中包含 source）
  ```jsonc
  {
    "type":"function",
    "name":"im_array_size",
    "path":null,
    "arguments":[
      { "type":"value", "name":null, "path":"im_repositorySearchEntityData1", "arguments":null }
    ]
  }
  ```

`path` 的起点规范参见 [source-paths.md](source-paths.md)。

## additional.ui（JointJS 图形）

```jsonc
{
  "version": 2,
  "graph": {
    "cells": [
      { "type":"devs.StartModel", /* ... */ },
      { "type":"devs.ProcModel",  /* ... */ },
      { "type":"devs.EndModel",   /* ... */ },
      { "type":"link", /* 对应 sequence */ }
    ]
  },
  "dataMap":   { "<cellUuid>": { /* metadata, common, typical, mapping, (elementId) */ } },
  "optionMap": { "<cellUuid>": { "title":"...", "label":"...", "inNum":1, "outNum":1 } }
}
```

### 同步规则（必须）

- 对应每个任务元素 `flowElements[i]` 的 **task cell** 必须存在于 `graph.cells[]` 中
- task cell 的 **`id`** 为 UUID（由 `build-flow.js` 确定性生成）
- task cell 的 **`attrs."text.title".text`** 与 executeId 一致
- **`dataMap` 和 `optionMap` 以 cell.id（UUID）为键**（link cell 不在此列）
- 每个 sequence 元素对应一个 **link cell**（`source.id` / `target.id` 为两端 task cell 的 UUID）
- **`flowElements[].mappingDefinition.mappingRules` 与 `dataMap[cellId].mapping.json.connectors` 必须同步**（见后文）

`build-flow.js` 自动保证此同步。

### 用户自定义任务的 dataMap 附加字段

用户自定义任务（`key.type = "localUserDefinition"`）具有与普通任务不同的 `dataMap` 结构：

- **`metadata.key`**：`{ "type": "localUserDefinition", "id": "<definitionId>" }` — 存放实际的 `definitionId`，而非模板的示例 ID
- **`metadata.inputDataDefinition` / `outputDataDefinition`**：与 `properties.definition.definitionData` 内的类型定义同步
- **`metadata.pairElementKey`**：指向 Database Fetch 的开始/结束对。开始元素（`<definitionId>`）指向结束元素 `$<definitionId>$`，结束元素（`$<definitionId>$`）指向开始元素 `<definitionId>`
- **`metadata.iconId`**：任务的图标 ID（例：`"im_generic"`）
- **`elementId`（顶层）**：内部任务 ID。IM-LogicDesigner 解析元数据时**必须**存在

```jsonc
{
  "metadata": {
    "key": { "type": "localUserDefinition", "id": "my_js_task" },
    "inputDataDefinition": { ... },
    "outputDataDefinition": { ... },
    "pairElementKey": { ... },   // 仅 Database Fetch
    "iconId": "im_generic"
  },
  "common": { ... },
  "typical": { ... },             // 用户自定义：flowElement.properties 的副本
  "mapping": { ... },
  "elementId": "im_scriptExecutor" // ★ 顶层。IM-LogicDesigner 引用
}
```

| definitionType | elementId |
|---|---|
| javascript | `im_scriptExecutor` |
| rest | `im_httpclient` |
| sql | `im_queryExecutor` |
| db_fetch | `im_startDbFetch` |

### dataMap[cellId].mapping.json — UI 上的映射信息

**IM-LogicDesigner 读取此信息（而非 `flowElements[].mappingDefinition.mappingRules`）来绘制和保存 UI 中的映射连线。**
两者必须始终保持一致。

```jsonc
{
  "inputKeys": ["$input","$variable","$const","$account_context","im_xxx1"],
  "additionalKeys": [],
  "json": {
    "version": 1,
    "attrs": {},
    "connectors": [
      {
        "id": "<与 mappingRule.id 相同的 UUID>",
        "source": {
          "id": "<端口 UUID>",
          "type": "$input",                 // 固定（JointJS 端口类型）
          "path": "$input\tresourceURI",    // ★ 分隔符为 TAB（"\t"）
          "port": "out"
        },
        "target": {
          "id": "<端口 UUID>",
          "type": "$output",                // 固定
          "path": "im_authorizeAuthz1\tresourceURI",  // ★ TAB 分隔
          "port": "in"
        }
      }
    ],
    "size": { "width": 400, "height": 500 }
  }
}
```

要点：

- **path 分隔符为 TAB（`\t`）** — 与 `mappingRules.source.path` 中的 `/` 分隔符格式不同。`build-flow.js` 会自动转换。
- **connector 的 `id` 必须与 `mappingRule.id` 一致**
- **`inputKeys`** 需包含 `mappingRules` 中引用的所有根（`$input` / `$account_context` / `<上游任务 executeId>` 等）。标准包含 `$input` / `$variable` / `$const`。
- **`source.type` / `target.type`** 为 JointJS 内部端口类型。始终固定为 `"$input"` / `"$output"`（与实际数据起点无关）。

`build-flow.js` 从 `mappingRules` 自动生成此结构。

### function source 的 connector 表现形式

当 `source.type === "function"` 时，connector 的 source 采用不同形式：

```jsonc
{
  "id": "<与 mappingRule.id 相同的 UUID>",
  "source": {
    "id": "<端口 UUID>",
    "type": "im_array_size",      // ★ 填入函数名（而非 "$input"）
    "port": "out"                  // 不存在 path 字段
  },
  "target": {
    "id": "<端口 UUID>",
    "type": "$output",
    "path": "$output\tdata\tarticleCount",
    "port": "in"
  }
}
```

- **`source.type`** = 函数名（如 `"im_array_size"`）
- **`source.path`** = 不存在（函数参数仅存在于 `flowElements[].mappingRules[].source.arguments` 中，connector 中不包含）
- 无需在 `inputKeys` 中包含函数名（仅需包含参数中引用的任务 executeId 等）

## 添加 task-templates 的方法

新增 `task-templates/<keyId>.json`。
格式参考现有文件。
最少必需的字段：

```jsonc
{
  "kind": "task",
  "keyId": "im_xxx",
  "flowElementSample": {
    /* 任务元素的模板（executeId 会被序号覆盖，因此示例值即可） */
    "executeId": "im_xxx1",
    "alias": null,
    "key": { "type":"application", "id":"im_xxx", "version":null },
    "label": "...",
    "comment": "",
    "properties": { /* 默认 properties */ },
    "mappingDefinition": { "mappingRules": [] }
  },
  "cellSample": {
    /* JointJS 的 devs.ProcModel cell 模板（id, position, z 会被覆盖） */
    "type": "devs.ProcModel",
    "size": { "width": 280, "height": 50 },
    "inPorts": ["in"],
    "outPorts": ["out"],
    "position": { "x": 0, "y": 0 },
    "id": "placeholder",
    "z": 1,
    "attrs": { /* ... text.title, text.label, ports ... */ }
  },
  "dataMapMetadata": {
    /* dataMap[cellId].metadata 的内容（key, elementProperties, inputDataDefinition, outputDataDefinition） */
  },
  "dataMapTypical": { /* 默认 properties */ },
  "dataMapMappingDefaults": { "inputKeys": [...], "additionalKeys": [], "json": {} },
  "optionMap": { "title":"im_xxx1", "label":"...", "inNum":1, "outNum":1 }
}
```

现有模板是从 IM-LogicDesigner 实际保存的 `flow_definition.json` 中提取的。
添加新任务时，最可靠的做法是先从 IM-LogicDesigner 导出一次，然后再提取。
