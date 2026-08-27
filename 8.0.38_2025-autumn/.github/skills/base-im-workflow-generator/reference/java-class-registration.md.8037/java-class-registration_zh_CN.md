# 注册 Java 类执行（JavaEE 开发模型）时

## 概述

IM-Workflow 的各种插件扩展点（动作处理・到达处理・案件开始/结束处理・分支/合并条件・各种监听器等），可以通过在 `plugins[].parameter` 中设置**要执行的路径或类名**，以两种执行方式中的任意一种进行注册。

| 执行方式 | `parameter` 的值 | `pluginId` 后缀 | 实现技能 |
|---------|------------------|----------------------|-----------|
| 脚本执行（JSSP / 脚本开发模型） | JSSP 文件路径（不含扩展名） | `.pluginScriptExecutor` | `jssp-im-workflow-usage` |
| **Java 类执行（JavaEE 开发模型）** | **实现类的完全限定名（FQCN）** | **`.pluginJavaExecutor`** | `java-im-workflow-usage` |

`exPointId` 本身与执行方式无关，是共通的。`pluginId` 只是 `{exPointId}.pluginScriptExecutor` / `{exPointId}.pluginJavaExecutor` 的简单组合，除此之外没有其他结构差异（`build-workflow.js` 按此规则输出两种形式）。

**此 `.pluginJavaExecutor` 后缀已通过在 IM-Workflow 管理画面实际注册为 Java 类执行并导出的生产等效 XML 得到确认**（已确认 6 个扩展点，详见下表）。

## `spec.json` 中的指定方法

使用 `actionProcess` 的节点，以及 `matterEndProcess`，都可以选择实现方式（`build-workflow.js` 已支持）。

```jsonc
{
  "nodes": [
    {
      "id": "01", "type": "approve", "name": "Manager",
      "actionProcess": "jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess",
      "actionProcessImpl": "java"   // "java" | "jssp"（省略时为 "jssp"）
    }
  ],
  "matterEndProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterEndProcess",
  "matterEndProcessImpl": "java"    // "java" | "jssp"（省略时为 "jssp"）
}
```

- 当 `actionProcessImpl` / `matterEndProcessImpl` 为 `"java"` 时，对应的 `actionProcess` / `matterEndProcess` 的值必须是**实现类的 FQCN，而不是 JSSP 文件路径**（用 `java-im-workflow-usage` 技能生成实现）
- 省略时（`"jssp"`）按以往方式作为脚本执行输出

## 已实机确认的 `pluginId`（`.pluginJavaExecutor`）

以下是从在 IM-Workflow 管理画面实际注册为 Java 类执行并导出的 XML（示例内容 `contents_javaee`）中确认的值。实际数据证实了将 `.pluginJavaExecutor` 简单拼接到 `exPointId` 后的规则成立。

| 处理 | exPointId | pluginId（已确认） | `java-im-workflow-usage` 中的实现位置 |
|------|-----------|---------------------|----------------------------------|
| 案件开始扩展处理 | `jp.co.intra_mart.workflow.plugin.event.matter.start.process` | `jp.co.intra_mart.workflow.plugin.event.matter.start.process.pluginJavaExecutor` | `assets/matter-start-process.md` |
| 案件结束扩展处理（有事务） | `jp.co.intra_mart.workflow.plugin.event.matter.end.process` | `jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginJavaExecutor` | `assets/matter-end-process.md` |
| 动作处理 | `jp.co.intra_mart.workflow.plugin.event.node.action.process` | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor` | `assets/action-process.md` |
| 分支条件 | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| 未完成案件删除 | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 已完成案件删除 | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 历史案件删除 | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 案件归档处理 | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process.pluginJavaExecutor` | `assets/matter-archive-listener.md` |

**重要的附带发现：** 在此次实机确认过程中，发现本技能既有文档中关于案件结束扩展处理 `exPointId` 的记载有误（使用了不存在的 `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process`），现已修正（正确值：`jp.co.intra_mart.workflow.plugin.event.matter.end.process`；无事务版本为 `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`）。已在 `build-workflow.js` / `reference/xml-structure.md` / `reference/im_workflow-import.xsd` 中一并修正。

## 未确认的扩展点（推测・需验证）

以下扩展点尚未通过实机数据确认，但推测符合相同的命名规则（`{exPointId}.pluginJavaExecutor`）（已通过源代码调查确认 `im_workflow_core` 中存在对应的 `XxxJavaExecutorEvent` 桥接类）。**投入生产环境前请务必在实机上确认一次。**

| 处理 | exPointId | 推测的 pluginId |
|------|-----------|---------------|
| 到达处理 | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process` | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.pluginJavaExecutor` |
| 合并条件 | `jp.co.intra_mart.workflow.plugin.event.node.union.rule` | `jp.co.intra_mart.workflow.plugin.event.node.union.rule.pluginJavaExecutor` |

处理对象者插件（`java-im-workflow-usage/assets/authority-exec-listener.md`）位于权限相关扩展点（`AUTHORITY_*`）之下，遵循 `reference/authority-plugins.md` 所示的另一套后缀方式（例如 `.apply_user_department_and_post`），因此本文件的 `.pluginJavaExecutor` 规则是否同样适用尚未验证。

## XML 示例（基于实机导出结果）

```xml
<!-- JSSP 执行版 -->
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor</pluginId>
  <pluginName type="string">action_process</pluginName>
  <parameter type="string">sample/leave/workflow/action/action_process</parameter>
  <nodeType type="string">2</nodeType>
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>

<!-- Java 类执行版（实机导出确认的形式。parameter 变为 FQCN） -->
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor</pluginId>
  <pluginName type="string">action_process</pluginName>
  <parameter type="string">jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess</parameter>
  <nodeType type="string">2</nodeType>
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>
```

## 使用未确认扩展点时的临时步骤

若要为上述「未确认的扩展点」（到达处理・合并条件）或处理对象者插件注册 Java 类执行：

1. 在 IM-Workflow 管理画面的节点编辑画面中，将目标节点的插件注册为「Java 类执行」，并设置由 `java-im-workflow-usage` 生成的类的 FQCN
2. 将目标工作流导出为导入用 XML
3. 确认导出的 XML 中 `plugins[]` 元素的 `pluginId` 值，核实是否与上表一致
4. 若一致，则将该条目从本文件的「未确认」表移动到「已实机确认」表
