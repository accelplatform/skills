# 使用 IM-LogicDesigner 的处理对象插件

## 概述

通过 **IM-LogicDesigner 逻辑流**动态决定 IM-Workflow 处理对象的方式。
可作为 SSJS 插件（`authority_exec_event_listener.js`）的替代方案，以低代码方式实现逻辑。

### SSJS 插件 vs IM-LogicDesigner 的使用区分

| 比较维度 | SSJS 插件 | IM-LogicDesigner |
|---------|----------|-----------------|
| 实现方式 | JavaScript 代码 | 逻辑流（GUI） |
| 复杂业务逻辑 | ◎ 灵活 | △ 通过任务组合处理 |
| 数据库查询·API 联动 | ◎ 直接实现 | ○ 通过任务处理 |
| 维护·变更 | △ 需要发布 | ◎ 可从管理画面变更 |
| 调试 | △ 查看日志 | ○ 流程调试功能 |

---

## 流程定义的创建步骤

### 1. 创建 spec.json

以下面的模板为基础创建 `spec.json`。
输入定义（imwMatterInfo / imwApplyAuthInfo / imwBeforeNodeAuthInfo）可只保留实际需要的部分。

```json
{
  "featureName": "<功能名>",
  "flowCategories": [
    {
      "categoryId": "<分类ID>",
      "categoryName": "<分类名称（英文）>",
      "sortNumber": 100,
      "localizes": {
        "ja":    { "locale": "ja",    "categoryName": "<分类名称（日文）>" },
        "en":    { "locale": "en",    "categoryName": "<分类名称（英文）>" },
        "zh_CN": { "locale": "zh_CN", "categoryName": "<分类名称（中文）>" }
      },
      "parentId": null
    }
  ],
  "flows": [
    {
      "flowId": "<流程ID>",
      "flowName": "<流程名称>",
      "categoryId": "<分类ID>",
      "version": 1,
      "transaction": false,
      "validateRepositoryData": false,
      "notes": "IM-Workflow 处理对象插件用逻辑流",
      "constants": [],
      "variablesDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [{ "id": "root", "properties": [] }]
      },
      "inputDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [
          {
            "id": "root",
            "properties": [
              { "typeId": "im_logic_object_imw_matter_info",          "name": "imwMatterInfo",         "description": "案件信息",         "listingType": "none", "required": false, "basic": false },
              { "typeId": "im_logic_object_imw_apply_auth_info",      "name": "imwApplyAuthInfo",      "description": "申请处理权限信息", "listingType": "none", "required": false, "basic": false },
              { "typeId": "im_logic_object_imw_before_node_auth_info","name": "imwBeforeNodeAuthInfo", "description": "前节点处理权限信息", "listingType": "none", "required": false, "basic": false }
            ]
          },
          {
            "id": "im_logic_object_imw_matter_info",
            "properties": [
              { "typeId": "string", "name": "applyBaseDate",     "description": "申请基准日",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "contentsId",        "description": "内容ID",           "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "contentsVersionId", "description": "内容版本ID",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "flowId",            "description": "流程ID",           "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "flowVersionId",     "description": "流程版本ID",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "nodeId",            "description": "节点ID",           "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "routeId",           "description": "路由ID",           "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "routeVersionId",    "description": "路由版本ID",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "systemMatterId",    "description": "系统案件ID",       "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "userDataId",        "description": "用户数据ID",       "listingType": "none", "required": false, "basic": true }
            ]
          },
          {
            "id": "im_logic_object_imw_apply_auth_info",
            "properties": [
              { "typeId": "string", "name": "userCd",          "description": "申请者用户代码",     "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "companyCd",       "description": "申请者公司代码",     "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentSetCd", "description": "申请者组织集代码",   "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentCd",    "description": "申请者组织代码",     "listingType": "none", "required": false, "basic": true }
            ]
          },
          {
            "id": "im_logic_object_imw_before_node_auth_info",
            "properties": [
              { "typeId": "string", "name": "userCd",          "description": "前处理者用户代码",   "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "companyCd",       "description": "前处理者公司代码",   "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentSetCd", "description": "前处理者组织集代码", "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "departmentCd",    "description": "前处理者组织代码",   "listingType": "none", "required": false, "basic": true },
              { "typeId": "string", "name": "nodeId",          "description": "前节点ID",           "listingType": "none", "required": false, "basic": true }
            ]
          },
          { "id": "string", "properties": [] }
        ]
      },
      "outputDataDefinition": {
        "entrypoint": { "typeId": "root", "basic": false, "required": false, "listingType": "none" },
        "typeDefinitions": [
          {
            "id": "root",
            "properties": [
              {
                "typeId": "string",
                "name": "userCds",
                "description": "处理对象用户代码数组。返回 null 表示无权限者（不展开）。",
                "listingType": "array",
                "required": false,
                "basic": true
              }
            ]
          },
          { "id": "string", "properties": [] }
        ]
      },
      "tasks": [
        { "type": "im_start", "label": "开始" },
        { "type": "im_end",   "label": "结束" }
      ],
      "edges": [
        { "from": "im_start", "to": "im_end1" }
      ]
    }
  ]
}
```

### 2. 生成流程定义 ZIP

```bash
node .github/skills/jssp-im-logic-generator/scripts/build-flow.js <spec.json> --zip
```

输出路径：`src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip`

### 3. 验证流程定义

```bash
node .github/skills/jssp-im-logic-generator/scripts/validate-flow.js \
  src/main/storage/public/im_logic/im-logicdesigner-data-<featureName>.zip
```

确认输出 `PASS (0 warning(s))`。

---

## 在 IM-Workflow 路由定义 XML 中的指定

使用生成的流程的 `flowId`，在 IM-Workflow 路由定义 XML 中指定权限插件。
使用 `jssp-im-workflow-generator` 技能生成 XML 时，请参照 `authority-plugins.md` 的"逻辑流指定系"章节中的 XML 示例，在 spec.json 中进行记述。

```xml
<!-- 审批节点权限配置示例 -->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "<流程ID>", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "<流程ID>", "version" : null, "versionDecide" : false}</targetCode>
```

**可用的扩展点（已在实机确认）**

| 节点类型 | 扩展点 |
|---------|-------|
| 审批节点（前置节点为人员节点时） | `node.approve` |
| 确认节点 | `node.confirm` |
| 参照者设定 | `administrator.flow.handle` |

---

## 纳入租户环境安装

除了导入 IM-LogicDesigner 流程 ZIP 之外，还可以将 IM-Workflow 的插件注册纳入租户环境安装中。

### ⚠️ 执行顺序（必须）

`WorkflowLogicFlowManager.createLogicFlow`（插件注册）在 IM-LogicDesigner 中流程不存在的状态下会失败。**必须按以下顺序执行。**

```
1. <key>_logic_import.js    ← 导入 IM-LogicDesigner 流程 ZIP（先创建流程）
2. <key>_workflow_import.js ← 导入 IM-Workflow 定义 XML（可选）
3. <key>_import.js          ← 注册 IM-Workflow 逻辑流插件（最后执行）
```

> 构建脚本生成的 XML 顺序为 `_import.js` → `_workflow_import.js` → `_logic_import.js`，
> 因此**生成后需手动重新排列 `import-<artifactId>-config-<N>.xml` 中的 `<extends-import>` 部分。**

```xml
<!-- 正确顺序 -->
<extends-import>
  <extends-import-class>sample/initialize/1.0.0/sample_logic_import.js</extends-import-class>
  <extends-import-class>sample/initialize/1.0.0/sample_workflow_import.js</extends-import-class>
  <extends-import-class>sample/initialize/1.0.0/sample_import.js</extends-import-class>
</extends-import>
```

### 各 JS 文件的生成方法

| JS 文件 | 生成技能 | 说明 |
|--------|---------|------|
| `<key>_logic_import.js` | `jssp-tenant-setup-generator`（`logicImport` 章节） | 通过 `LogicFlowImporter` 导入流程 ZIP |
| `<key>_workflow_import.js` | `jssp-tenant-setup-generator`（`workflowImport` 章节） | 通过 `DataImportExecutor` 导入 WF 定义 XML |
| `<key>_import.js` | 手动创建（使用 `reference/imw-logic-plugin-import.md` 中的模板） | 通过 `WorkflowLogicFlowManager` 注册插件 |

插件注册 JS 的模板与实现详情，请参见
`.github/skills/jssp-tenant-setup-generator/reference/imw-logic-plugin-import.md`。

---

## 注意事项

- **通过引戻し·差戻し·案件操作引起节点移动**而到达该节点时，逻辑流不会执行，而是将最后一位处理者作为权限者采用（2023 Autumn 及以后的规范）
- 流程输出 `userCds` 返回 `null` 时，被视为"无权限者"（不展开）
- `version: null` 始终使用最新发布版本。如需固定到特定版本，请将 `version` 设为整数并将 `versionDecide` 设为 `true`
