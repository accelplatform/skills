# IM-Workflow 逻辑流插件注册（扩展导入）

将 IM-LogicDesigner 的逻辑流通过 `WorkflowLogicFlowManager` 注册为 IM-Workflow 处理对象插件（`.logic_flow_user`）的扩展导入。

实现模板（`IMW_LOGIC_FLOW_PLUGINS` 数组 + `doImport` + `registerLogicFlowPlugin`）·`WorkflowLogicFlowManager` 的 API 规范（`deleteLogicFlow` / `createLogicFlow`）·`resourceTypes` 的种类·全量刷新方式与租户环境设置相同。
请参见 `.agents/skills/jssp-tenant-setup-generator/reference/imw-logic-plugin-import.md`。

**全量刷新方式（`deleteLogicFlow` -> `createLogicFlow`）原样适用于每次都会执行的示例数据设置，无需变更。**

## 差异

| 租户环境设置 | **示例数据设置** |
|---|---|
| `<key>/initialize/<version>/<key>_import.js` | `<key>/initialize/<key>_import.js`（无 `<version>`） |
| `<key>/initialize/<version>/<key>_workflow_import.js` | `<key>/initialize/<key>_workflow_import.js` |
| `<key>/initialize/<version>/<key>_logic_import.js` | `<key>/initialize/<key>_logic_import.js` |
| 顺序控制：拆分 config 或记述顺序 | **仅记述顺序**（无法拆分 config） |
| 出错时：整个 Importer 立即停止 | **后续处理会继续执行** |

## ⚠️ 执行顺序（必须）

`WorkflowLogicFlowManager.createLogicFlow` 会引用 LD 的流程注册状态，因此**在 LD 流程不存在的状态下执行会失败**。

```
1. <key>_logic_import.js    ← 导入 LD 流程 ZIP（创建流程）
2. <key>_workflow_import.js ← 导入 IM-Workflow 定义 XML
3. <key>_import.js          ← 插件注册（最后）
```

`build-sample-setup-import.js` 会按 `_import.js` -> `_workflow_import.js` -> `_logic_import.js` 的顺序生成。**由于是相反顺序，生成后需手动重新排列 XML。**

```xml
<extends-import>
  <extends-import-class>any_app/initialize/any_app_logic_import.js</extends-import-class>
  <extends-import-class>any_app/initialize/any_app_workflow_import.js</extends-import-class>
  <extends-import-class>any_app/initialize/any_app_import.js</extends-import-class>
</extends-import>
```

由于只能创建 1 个设置文件，无法通过拆分 config 控制顺序。**这种重新排列是唯一的手段。**

## 错误检测

即使抛出异常，后续的设置处理也会继续执行。请确认 `<key>.initialize` 日志的输出，以及 IM-Workflow 管理画面"逻辑流列表"中的注册情况。

## 相关 reference

- [extends-import.md](extends-import.md)
- [logic-import.md](logic-import.md)：需要先执行
- [workflow-import.md](workflow-import.md)
