# Registering Java Class Execution (JavaEE Development Model)

## Overview

Each plugin extension point of IM-Workflow (action process, arrival process, matter start/end process, branch/union condition, various listeners, etc.) can be registered with either of two execution methods by setting the **path or class name to execute** in `plugins[].parameter`.

| Execution Method | `parameter` Value | `pluginId` Suffix | Implementation Skill |
|---------|------------------|----------------------|-----------|
| Script execution (JSSP / script development model) | JSSP file path (without extension) | `.pluginScriptExecutor` | `jssp-im-workflow-usage` |
| **Java class execution (JavaEE development model)** | **Fully qualified class name (FQCN) of the implementation class** | **`.pluginJavaExecutor`** | `java-im-workflow-usage` |

The `exPointId` itself is common regardless of the execution method. `pluginId` is simply `{exPointId}.pluginScriptExecutor` / `{exPointId}.pluginJavaExecutor` — there is no other structural difference (`build-workflow.js` outputs both forms following this rule).

This `.pluginJavaExecutor` rule is backed by the fact that, for each extension point, the platform itself ships an `Xxx**JavaExecutorEvent**` bridge class in `im_workflow_core` (e.g. `ActionProcessJavaExecutorEvent` / `ArriveProcessJavaExecutorEvent` / `MatterEndProcessJavaExecutorEvent` / `MatterStartProcessJavaExecutorEvent` / `MatterArchiveProcessJavaExecutorEvent` / `ActiveMatterDeleteProcessJavaExecutorEvent`, etc., and `RuleConditionJavaExecutorEvent`), each extending the corresponding `WorkflowXxxProcessEventListener` / `WorkflowRuleConditionEventListener`. This confirms the rule is a common mechanism across every extension point in the table below. The `exPointId` values themselves are defined as constants in `jp.co.intra_mart.system.workflow.engine.common.ExtensionPointConstants`.

**The "processing target user plugin" (a custom plugin that dynamically determines applicants/approvers) is out of scope here.** It uses a different framework (`plugin.xml`-based plugin registration) from the `EVENT_*` extension points this document covers. See "Registering a Processing Target User Plugin (Custom Implementation)" at the end of this document for details.

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
- The arrival process (`arriveProcess`) can also be auto-generated the same way. See `reference/lifecycle-plugin-fields.md` for details
- For branch/union conditions (the `branchMethod: "program"` user-program method), the node type code is output, but `build-workflow.js` does not yet register the corresponding plugin (add it manually using the "XML Sample" below, or register it as Java class execution from the IM-Workflow admin screen's node edit screen)

## `pluginId` (`.pluginJavaExecutor`) List

| Process | exPointId | pluginId | Implementation location in `java-im-workflow-usage` |
|------|-----------|---------------------|----------------------------------|
| Matter start extension process | `jp.co.intra_mart.workflow.plugin.event.matter.start.process` | `jp.co.intra_mart.workflow.plugin.event.matter.start.process.pluginJavaExecutor` | `assets/matter-start-process.md` |
| Matter end extension process (transactional) | `jp.co.intra_mart.workflow.plugin.event.matter.end.process` | `jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginJavaExecutor` | `assets/matter-end-process.md` |
| Action process | `jp.co.intra_mart.workflow.plugin.event.node.action.process` | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor` | `assets/action-process.md` |
| Arrival process | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process` | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.pluginJavaExecutor` | `assets/arrive-process.md` |
| Branch condition | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| Union condition | `jp.co.intra_mart.workflow.plugin.event.node.union.rule` | `jp.co.intra_mart.workflow.plugin.event.node.union.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| Active matter delete | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| Completed matter delete | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| Archived matter delete | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| Matter archive process | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process.pluginJavaExecutor` | `assets/matter-archive-listener.md` |

Both the branch and union conditions are mediated by the same underlying mechanism, `RuleConditionJavaExecutorEvent` (extending `WorkflowRuleConditionEventListener`); only the registered `exPointId` (`node.branch.rule` vs `node.union.rule`) differs. The implementation class on the `java-im-workflow-usage` side (extending `RuleConditionEventListener`) is likewise shared between the two — which extension point it is registered under is what switches its role.

**Important side finding:** an existing error in this skill's documentation regarding the matter end extension process `exPointId` has been fixed (it used a non-existent ID, `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process`; the correct value is `jp.co.intra_mart.workflow.plugin.event.matter.end.process`, and the non-transactional variant is `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`). This has been fixed across `build-workflow.js` / `reference/xml-structure.md` / `reference/im_workflow-import.xsd`.

## XML Sample

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

<!-- Java class execution version (parameter becomes the FQCN) -->
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

The branch condition, union condition, and arrival process can be registered with the same structure by substituting the `exPointId` / `pluginId` values from the table above (set `nodeType` to the value matching the node type).

## Registering a Processing Target User Plugin (Custom Implementation)

The processing target user plugin (a custom plugin that dynamically determines applicants/approvers/reviewers, etc.; implemented by `java-im-workflow-usage/assets/authority-exec-listener.md`) uses a **different framework** from the `EVENT_*` extension points covered in this document (where `exPointId`/`pluginId`/`parameter` are written directly into `plugins[]` of the workflow definition import XML).

According to the IM-Workflow Programming Guide, "9.2. Creating a Processing Target User Plugin," a processing target user plugin is registered via `plugin.xml` (an OSGi-like extension registration file managed by `PluginManager`). On the workflow definition import XML side, only the **ID** of the extension registered in this `plugin.xml` is referenced as a suffix — the common `.pluginJavaExecutor` suffix is not used.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plugin>
    <extension point="jp.co.intra_mart.workflow.plugin.authority.node.approve">
        <authority
            id="jp.co.intra_mart.sample.workflow.purchase.plugin.authority.node.approve.item_total.javaee"
            name="%jp.co.intra_mart.sample.workflow.purchase.plugin.authority.node.approve.item_total.javaee"
            version="8.0.99"
            rank="920"
            enable="true">
            <configPage>
                <javaee applicationId="imw_sample_purchase" serviceId="authority_item_total">
                    <parameter key="pluginName" value="SAMPLE.IMW.CAP.031" />
                </javaee>
            </configPage>
            <extend>
                <java class="jp.co.intra_mart.sample.workflow.purchase.plugin.authority.item_total.WorkflowAuthorityExecEventListener" />
            </extend>
        </authority>
    </extension>
</plugin>
```

- `<extension point="...">` specifies the target extension point to register against (`jp.co.intra_mart.workflow.plugin.authority.node.apply` / `.approve` / `.approve.static` / `.confirm`, etc. — see the "List of Extension Points" at the top of `reference/authority-plugins.md`)
- `<authority id="...">` is this plugin's own unique ID. On the workflow definition side, the tail of this ID (the part after the extension point ID) is concatenated as a suffix onto the approver-designation `pluginId` (the same idea as the suffix scheme in `reference/authority-plugins.md`)
- `<extend><java class="FQCN" /></extend>` specifies the FQCN of the `IWorkflowAuthorityExecEventListener` implementation class (`extend/java/class` is also defined on the platform side as `ExtensionPointConstants.XPATH_OF_JAVA_FILE` in `im_workflow_core`)
- `<configPage>` is the settings screen invoked when this plugin is selected from the processing target user list on the route definition screen. Specify `<javaee applicationId="..." serviceId="..." />` for the JavaEE version, or `<script pagePath="..." />` for the script version. **It cannot be omitted** (it is the entry point for selecting this plugin on the route definition screen)
- How to implement `configPage` (a service implementation class, or a JSSP page) is out of scope for `java-im-workflow-usage` (screens are currently assumed to follow the JSSP side)

**Use 2-space indentation consistently.** The code example above is quoted verbatim from the official guide, so it uses 4 spaces, but any `plugin.xml` newly created in this project must use 2-space indentation (to match `routing-jssp-config` and this project's other XML configuration files).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plugin>
  <extension point="jp.co.intra_mart.workflow.plugin.authority.node.approve">
    <authority
      id="jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee"
      name="%jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee"
      version="0.1.0"
      rank="920"
      enable="true">
      <configPage>
        <script pagePath="sample/java_ext_verify/workflow/plugin/authority/verify/verifyConfig">
          <parameter key="pluginName" value="SAMPLE.JAVA_EXT_VERIFY.CAP.001" />
        </script>
      </configPage>
      <extend>
        <java class="jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.VerifyAuthorityExecListener" />
      </extend>
    </authority>
  </extension>
</plugin>
```

### Where to place plugin.xml (important)

`plugin.xml` is read by `PluginManager` (`im_plugin_base` module), which scans under `WEB-INF/plugin/`. **Placing `plugin.xml` directly under `WEB-INF/plugin/` is not recognized.** `PluginManager` enumerates the subdirectories directly under `WEB-INF/plugin/` one by one and looks for `plugin.xml` directly inside each subdirectory, so it must always be placed inside a subdirectory. The subdirectory name is arbitrary (choose it freely per plugin).

```
WEB-INF/plugin/<any directory name>/plugin.xml   ← correct (source: src/main/plugin/<any directory name>/plugin.xml)
WEB-INF/plugin/plugin.xml                          ← wrong (with no subdirectory, it is never picked up by PluginManager's scan)
```

A directory name based on the plugin's extension point ID or feature name is easy to follow (the official sample uses the extension point ID itself as the directory name).

Changes to `plugin.xml` require a **server restart** to take effect, since `PluginManager` loads the plugin configuration at application startup (unlike JSSP, it is not picked up by hot deployment).

### Localizing the display name (plugin.properties)

If `<authority name="...">` is given a value starting with `%` (e.g. `%jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee`), that is a **resource key reference** into a properties file. Without a matching `.properties` file defining that key, the raw string with the leading `%` is displayed as-is on screen.

Place the following files in the **same directory as `plugin.xml`** (based on `PluginManager`'s Javadoc).

```
WEB-INF/plugin/<same directory as plugin.xml>/plugin.properties       # default (fallback when no locale matches)
WEB-INF/plugin/<same directory as plugin.xml>/plugin_ja.properties    # Japanese
WEB-INF/plugin/<same directory as plugin.xml>/plugin_en.properties    # English
WEB-INF/plugin/<same directory as plugin.xml>/plugin_zh_CN.properties # Simplified Chinese
```

The filename always starts with `plugin` (the part before `EXT_PROPERTIES`), and appending `_<locale>` marks it as a locale-specific file (per `PluginManager`'s `LOCALE_REGEXP` = `_(.*)\.properties`). The content is a standard Java properties file: use the key from `<authority name="...">` (with the leading `%` removed) as the property key, and the display name as its value.

**`java.util.Properties` reads the file as ISO-8859-1, so non-ASCII characters (Japanese, Chinese, etc.) written as raw UTF-8 come out garbled. Write them as `\uXXXX` Unicode escapes (equivalent to `native2ascii` output).**

```properties
# plugin_ja.properties (Unicode-escaped "検証用処理対象者プラグイン")
jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee=\u691c\u8a3c\u7528\u51e6\u7406\u5bfe\u8c61\u8005\u30d7\u30e9\u30b0\u30a4\u30f3
```

As with `plugin.xml`, changes require a server restart to take effect.
