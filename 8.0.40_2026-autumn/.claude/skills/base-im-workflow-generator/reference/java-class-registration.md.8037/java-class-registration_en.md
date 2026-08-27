# Registering Java Class Execution (JavaEE Development Model)

## Overview

Each plugin extension point of IM-Workflow (action process, arrival process, matter start/end process, branch/union condition, various listeners, etc.) can be registered with either of two execution methods by setting the **path or class name to execute** in `plugins[].parameter`.

| Execution Method | `parameter` Value | `pluginId` Suffix | Implementation Skill |
|---------|------------------|----------------------|-----------|
| Script execution (JSSP / script development model) | JSSP file path (without extension) | `.pluginScriptExecutor` | `jssp-im-workflow-usage` |
| **Java class execution (JavaEE development model)** | **Fully qualified class name (FQCN) of the implementation class** | **`.pluginJavaExecutor`** | `java-im-workflow-usage` |

The `exPointId` itself is common regardless of the execution method. `pluginId` is simply `{exPointId}.pluginScriptExecutor` / `{exPointId}.pluginJavaExecutor` — there is no other structural difference (`build-workflow.js` outputs both forms following this rule).

**This `.pluginJavaExecutor` suffix has been confirmed against a real production-equivalent XML actually registered as Java class execution and exported from the IM-Workflow admin screen** (confirmed for 6 extension points; see the table below for details).

## How to Specify in `spec.json`

Nodes using `actionProcess`, as well as `matterEndProcess`, let you choose the implementation method (`build-workflow.js` supports this).

```jsonc
{
  "nodes": [
    {
      "id": "01", "type": "approve", "name": "Manager",
      "actionProcess": "jp.co.intra_mart.sample.leave.workflow.action.LeaveActionProcess",
      "actionProcessImpl": "java"   // "java" | "jssp" (default "jssp")
    }
  ],
  "matterEndProcess": "jp.co.intra_mart.sample.leave.workflow.LeaveMatterEndProcess",
  "matterEndProcessImpl": "java"    // "java" | "jssp" (default "jssp")
}
```

- When `actionProcessImpl` / `matterEndProcessImpl` is `"java"`, the corresponding `actionProcess` / `matterEndProcess` value must be the **FQCN of the implementation class, not a JSSP file path** (generate the implementation with the `java-im-workflow-usage` skill)
- When omitted (`"jssp"`), it is output as script execution as before

## Confirmed `pluginId` Values (`.pluginJavaExecutor`)

The following values were confirmed from an XML (sample content `contents_javaee`) actually registered as Java class execution on the IM-Workflow admin screen and exported. The real data backs up the simple rule of concatenating `.pluginJavaExecutor` onto the `exPointId`.

| Process | exPointId | pluginId (confirmed) | Implementation location in `java-im-workflow-usage` |
|------|-----------|---------------------|----------------------------------|
| Matter start extension process | `jp.co.intra_mart.workflow.plugin.event.matter.start.process` | `jp.co.intra_mart.workflow.plugin.event.matter.start.process.pluginJavaExecutor` | `assets/matter-start-process.md` |
| Matter end extension process (transactional) | `jp.co.intra_mart.workflow.plugin.event.matter.end.process` | `jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginJavaExecutor` | `assets/matter-end-process.md` |
| Action process | `jp.co.intra_mart.workflow.plugin.event.node.action.process` | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor` | `assets/action-process.md` |
| Branch condition | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| Active matter delete | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| Completed matter delete | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| Archived matter delete | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| Matter archive process | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process.pluginJavaExecutor` | `assets/matter-archive-listener.md` |

**Important side finding:** during this on-machine verification, an existing error in this skill's documentation regarding the matter end extension process `exPointId` was discovered (it used a non-existent ID, `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process`), and has been fixed (correct value: `jp.co.intra_mart.workflow.plugin.event.matter.end.process`; the non-transactional variant is `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`). This has been fixed across `build-workflow.js` / `reference/xml-structure.md` / `reference/im_workflow-import.xsd`.

## Unconfirmed Extension Points (Estimated, Needs Verification)

The following have not been confirmed against real data, but the same naming rule (`{exPointId}.pluginJavaExecutor`) is estimated to hold (confirmed via source code investigation that a corresponding `XxxJavaExecutorEvent` bridge class exists in `im_workflow_core`). **Verify on an actual machine before production use.**

| Process | exPointId | Estimated pluginId |
|------|-----------|---------------|
| Arrival process | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process` | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.pluginJavaExecutor` |
| Union condition | `jp.co.intra_mart.workflow.plugin.event.node.union.rule` | `jp.co.intra_mart.workflow.plugin.event.node.union.rule.pluginJavaExecutor` |

The processing target user plugin (`java-im-workflow-usage/assets/authority-exec-listener.md`) is under the authority-related extension points (`AUTHORITY_*`) and follows the separate suffix scheme shown in `reference/authority-plugins.md` (e.g. `.apply_user_department_and_post`), so it is not verified whether the `.pluginJavaExecutor` rule in this document applies as-is.

## XML Sample (Based on a Real Export)

```xml
<!-- JSSP execution version -->
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

<!-- Java class execution version (confirmed form from a real export; parameter becomes the FQCN) -->
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

## Provisional Procedure for Unconfirmed Extension Points

If you want to register Java class execution for one of the "Unconfirmed Extension Points" above (arrival process, union condition) or the processing target user plugin:

1. On the node edit screen of the IM-Workflow admin screen, register the target node's plugin as "Java class execution" and set the FQCN of the class generated by `java-im-workflow-usage`
2. Export the target workflow as an import XML
3. Check the `plugins[]` element (`pluginId` value) in the exported XML and verify whether it matches the table above
4. If it matches, move the entry from the "Unconfirmed" table to the "Confirmed" table in this document
