# 注册 Java 类执行（JavaEE 开发模型）

## 概述

IM-Workflow 的各扩展点（动作处理、到达处理、案件开始/结束处理、分支/结合条件、各种监听器等），可以通过在 `plugins[].parameter` 中设置**执行对象的路径或类名**，以两种执行方式中的任意一种注册。

| 执行方式 | `parameter` 的值 | `pluginId` 后缀 | 实现技能 |
|---------|------------------|----------------------|-----------|
| 脚本执行（JSSP / 脚本开发模型） | JSSP 文件路径（不含扩展名） | `.pluginScriptExecutor` | `jssp-im-workflow-usage` |
| **Java 类执行（JavaEE 开发模型）** | **实现类的完全限定名（FQCN）** | **`.pluginJavaExecutor`** | `java-im-workflow-usage` |

`exPointId` 本身与执行方式无关、通用。`pluginId` 只是 `{exPointId}.pluginScriptExecutor` / `{exPointId}.pluginJavaExecutor` 的简单组合，除此之外没有其他结构差异（`build-workflow.js` 遵循此规则可输出两种形式）。

该 `.pluginJavaExecutor` 规则得到以下事实的支撑：`im_workflow_core` 中，针对每个扩展点，平台自身都提供了对应的 `Xxx**JavaExecutorEvent**` 桥接类（例如 `ActionProcessJavaExecutorEvent` / `ArriveProcessJavaExecutorEvent` / `MatterEndProcessJavaExecutorEvent` / `MatterStartProcessJavaExecutorEvent` / `MatterArchiveProcessJavaExecutorEvent` / `ActiveMatterDeleteProcessJavaExecutorEvent` 等，以及 `RuleConditionJavaExecutorEvent`），它们分别继承对应的 `WorkflowXxxProcessEventListener` / `WorkflowRuleConditionEventListener`。这证实了下表所有扩展点采用的是同一套通用机制。`exPointId` 的值本身以常量形式定义在 `jp.co.intra_mart.system.workflow.engine.common.ExtensionPointConstants` 中。

**"处理对象者插件"（动态决定申请人/审批人的自定义插件）不在本文档范围内。** 它使用的是与本文档所述 `EVENT_*` 系扩展点不同的另一套框架（基于 `plugin.xml` 的插件注册）。详见本文档末尾的"处理对象者插件（自定义实现）的注册"。

## `spec.json` 中的指定方法

使用 `actionProcess` 的节点，以及 `matterEndProcess`，可以选择实现方式（`build-workflow.js` 已支持）。

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

- 当 `actionProcessImpl` / `matterEndProcessImpl` 为 `"java"` 时，对应的 `actionProcess` / `matterEndProcess` 值应指定**实现类的 FQCN，而非 JSSP 文件路径**（实现由 `java-im-workflow-usage` 技能生成）
- 省略时（`"jssp"`）按原样输出为脚本执行

## 完整的 `pluginId`（`.pluginJavaExecutor`）一览

| 处理 | exPointId | pluginId | `java-im-workflow-usage` 中的实现位置 |
|------|-----------|---------------------|----------------------------------|
| 案件开始扩展处理 | `jp.co.intra_mart.workflow.plugin.event.matter.start.process` | `jp.co.intra_mart.workflow.plugin.event.matter.start.process.pluginJavaExecutor` | `assets/matter-start-process.md` |
| 案件结束扩展处理（含事务） | `jp.co.intra_mart.workflow.plugin.event.matter.end.process` | `jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginJavaExecutor` | `assets/matter-end-process.md` |
| 动作处理 | `jp.co.intra_mart.workflow.plugin.event.node.action.process` | `jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginJavaExecutor` | `assets/action-process.md` |
| 到达处理 | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process` | `jp.co.intra_mart.workflow.plugin.event.node.arrive.process.pluginJavaExecutor` | `assets/arrive-process.md` |
| 分支条件 | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| 结合条件 | `jp.co.intra_mart.workflow.plugin.event.node.union.rule` | `jp.co.intra_mart.workflow.plugin.event.node.union.rule.pluginJavaExecutor` | `assets/rule-condition.md` |
| 未完成案件删除 | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.active.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 已完成案件删除 | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.completed.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 历史案件删除 | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archived.delete.process.pluginJavaExecutor` | `assets/matter-delete-listener.md` |
| 案件归档处理 | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process` | `jp.co.intra_mart.workflow.plugin.event.matter.archive.process.pluginJavaExecutor` | `assets/matter-archive-listener.md` |

分支条件与结合条件都由同一套机制 `RuleConditionJavaExecutorEvent`（继承 `WorkflowRuleConditionEventListener`）中转处理，仅注册所用的 `exPointId`（`node.branch.rule` / `node.union.rule`）不同。`java-im-workflow-usage` 侧的实现类（继承 `RuleConditionEventListener`）同样两者共用，仅在注册时切换分配给哪个扩展点。

**重要的附带发现：** 已修正本技能过往文档中关于案件结束扩展处理 `exPointId` 的错误（曾使用不存在的 ID `jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process`；正确值为 `jp.co.intra_mart.workflow.plugin.event.matter.end.process`，不含事务版本为 `jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process`）。已在 `build-workflow.js` / `reference/xml-structure.md` / `reference/im_workflow-import.xsd` 中一并修正。

## XML 示例

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

<!-- Java 类执行版（parameter 变为 FQCN） -->
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

分支条件、结合条件、到达处理同样可以将 `exPointId` / `pluginId` 替换为上表对应值后按相同结构注册（`nodeType` 需设置为与节点类型对应的值）。

## 处理对象者插件（自定义实现）的注册

处理对象者插件（动态决定申请人、审批人、确认人等的自定义插件；由 `java-im-workflow-usage/assets/authority-exec-listener.md` 负责实现），使用的是与本文档所述 `EVENT_*` 系扩展点（直接在工作流定义导入 XML 的 `plugins[]` 中写入 `exPointId`/`pluginId`/`parameter` 的方式）**不同的框架**。

根据 IM-Workflow 编程指南"9.2. 处理对象者插件的创建"，处理对象者插件通过 `plugin.xml`（由 `PluginManager` 管理的类 OSGi 扩展注册文件）注册。在工作流定义导入 XML 一侧，仅将该 `plugin.xml` 中注册的扩展 **ID 作为后缀** 引用，并不使用通用的 `.pluginJavaExecutor` 后缀。

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

- `<extension point="...">` 指定要注册到的扩展点（`jp.co.intra_mart.workflow.plugin.authority.node.apply` / `.approve` / `.approve.static` / `.confirm` 等，参见 `reference/authority-plugins.md` 开头的"扩展点一览"）
- `<authority id="...">` 是该插件自身的唯一 ID。在工作流定义一侧，会将该 ID 的末尾部分（去除扩展点 ID 后的部分）作为后缀拼接到审批人指定的 `pluginId` 上（与 `reference/authority-plugins.md` 中的后缀方式思路相同）
- `<extend><java class="FQCN" /></extend>` 中指定 `IWorkflowAuthorityExecEventListener` 实现类的 FQCN（`extend/java/class` 在平台侧也以 `im_workflow_core` 的 `ExtensionPointConstants.XPATH_OF_JAVA_FILE` 形式定义）
- `<configPage>` 是在路由定义画面的处理对象者列表中选择该插件时调用的设置画面。JavaEE 版通过 `<javaee applicationId="..." serviceId="..." />` 指定，脚本版通过 `<script pagePath="..." />` 指定。**不可省略**（是在路由定义画面选择该插件的入口）
- `configPage` 的实现（服务实现类，或 JSSP 页面）不在 `java-im-workflow-usage` 的范围内（画面部分目前假定沿用 JSSP 侧）

**缩进统一使用半角空格2个。** 上面的代码示例是官方指南原文引用，因此为4个空格，但本项目新建的 `plugin.xml` 应统一使用2空格缩进（与 `routing-jssp-config` 等本项目的其他 XML 配置文件保持一致）。

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

### plugin.xml 的放置位置（重要）

`plugin.xml` 由 `PluginManager`（`im_plugin_base` 模块）扫描 `WEB-INF/plugin/` 下的内容后读取。**直接将 `plugin.xml` 放在 `WEB-INF/plugin/` 根目录下不会被识别。** `PluginManager` 的实现是逐个枚举 `WEB-INF/plugin/` 根目录下的**子目录**，再从**每个子目录内部**查找 `plugin.xml`，因此必须放置在子目录中。子目录名称可任意指定（按插件自由决定）。

```
WEB-INF/plugin/<任意目录名>/plugin.xml   ← 正确（源文件位于 src/main/plugin/<任意目录名>/plugin.xml）
WEB-INF/plugin/plugin.xml                 ← 错误（没有子目录，不会被 PluginManager 的扫描捕获）
```

放置目录名建议使用插件的扩展点 ID 或功能名，便于识别（官方示例直接使用扩展点 ID 作为目录名）。

由于 `PluginManager` 是在应用启动时加载插件配置的，修改 `plugin.xml` 后**需要重启服务器才能生效**（与 JSSP 不同，无法通过热部署反映）。

### 显示名称的多语言化（plugin.properties）

若 `<authority name="...">` 指定了以 `%` 开头的值（例如 `%jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee`），这是对属性文件的**资源 key 引用**。若没有对应的 `.properties` 文件定义该 key，画面上会直接显示带 `%` 的原始字符串。

需要在**与 `plugin.xml` 相同的目录**下放置以下文件（依据 `PluginManager` 的 Javadoc）。

```
WEB-INF/plugin/<与 plugin.xml 相同的目录>/plugin.properties       # 默认（未匹配到语言区域时的兜底）
WEB-INF/plugin/<与 plugin.xml 相同的目录>/plugin_ja.properties    # 日语
WEB-INF/plugin/<与 plugin.xml 相同的目录>/plugin_en.properties    # 英语
WEB-INF/plugin/<与 plugin.xml 相同的目录>/plugin_zh_CN.properties # 简体中文
```

文件名固定以 `plugin` 开头（即 `EXT_PROPERTIES` 之前的部分），附加 `_<语言区域>` 即被识别为对应语言区域的文件（依据 `PluginManager` 的 `LOCALE_REGEXP` = `_(.*)\.properties` 判定）。内容为标准 Java 属性文件格式，以 `<authority name="...">` 中指定的 key（去掉开头的 `%`）作为属性 key，显示名称作为其值。

**`java.util.Properties` 按 ISO-8859-1 读取文件，若非 ASCII 字符（日语、中文等）以 UTF-8 原始字符书写会导致乱码。需以 `\uXXXX` 形式的 Unicode 转义（相当于 `native2ascii` 输出）书写。**

```properties
# plugin_ja.properties（"検証用処理対象者プラグイン" 的 Unicode 转义示例）
jp.co.intra_mart.sample.java_ext_verify.workflow.plugin.authority.node.approve.verify.javaee=\u691c\u8a3c\u7528\u51e6\u7406\u5bfe\u8c61\u8005\u30d7\u30e9\u30b0\u30a4\u30f3
```

与 `plugin.xml` 相同，修改后需要重启服务器才能生效。
