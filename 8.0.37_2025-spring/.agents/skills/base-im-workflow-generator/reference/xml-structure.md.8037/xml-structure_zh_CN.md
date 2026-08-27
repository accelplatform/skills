# IM-Workflow 导入 XML 结构参考

## 概述

IM-Workflow 导入 XML 是用于批量导入工作流定义的 XML 文件。
编码为 `UTF-16`，根元素为 `<data>`，各定义元素通过 `type` 属性表示值的类型。

### XML 特殊字符的转义

在元素值中包含特殊字符时，必须进行转义。
若不转义，导入时将产生 SAXParseException。

| 字符 | 转义 | 常见混入位置 |
|------|------|------------|
| `<` | `&lt;` | 规则名的条件表达式（例：`Amount<10000` → `Amount&lt;10000`） |
| `>` | `&gt;` | 规则名的条件表达式（例：`Amount>=50000` → `Amount&gt;=50000`） |
| `&` | `&amp;` | 名称中包含 `&` 的情况 |
| `"` | `&quot;` | 属性值内 |
| `'` | `&apos;` | 属性值内 |

**特别注意：** 规则名（`ruleName`）中包含比较运算符时，极易出现未转义的情况。
日语名称（例：`单价20000未满`）不会有问题，但英语名称（例：`UnitPrice<20000`）容易发生此问题。

## 整体结构

```xml
<?xml version="1.0" encoding="UTF-16"?>
<data>
  <contents id="{contentsId}">...</contents>      <!-- 内容定义 -->
  <route id="{routeId}">...</route>                <!-- 路由定义 -->
  <flow id="{flowId}">...</flow>                   <!-- 流程定义 -->
  <matter_property id="{key}">...</matter_property> <!-- 案件属性（Phase 2） -->
  <rule id="{ruleId}">...</rule>                   <!-- 分支规则（Phase 2） -->
  <mail id="{mailId}">...</mail>                   <!-- 邮件通知（Phase 3） -->
  <imBox id="{imBoxId}">...</imBox>                <!-- IMBox 通知（Phase 3） -->
  <list_pattern id="{patternId}">...</list_pattern> <!-- 列表模式（Phase 3） -->
  <message_template id="{templateId}">...</message_template> <!-- 消息（Phase 3） -->
</data>
```

**重要：`<data>` 直接子元素的标签名必须严格遵守上述规定。**
禁止使用自定义标签名（例：`<contentsDataList>`、`<routeDataList>`、`<contentsData>`、`<contentsVersion>` 等）。
IM-Workflow 导入器仅识别上述固定标签名。
各定义元素的内部结构也必须原样使用后述的属性名（`contentsId`、`routeId`、`flowId`、`details`、`pages` 等）。

## 类型属性

XML 的各元素通过 `type` 属性明确声明值的类型。

| type 值 | 含义 | 示例 |
|---------|------|------|
| `string` | 字符串 | `<flowId type="string">flow_01</flowId>` |
| `number` | 数值 | `<x type="number">50</x>` |
| `array` | 数组 | `<value type="array"><value type="object">...</value></value>` |
| `object` | 对象 | `<value type="object"><key type="string">val</key></value>` |
| `null` | null 值 | `<note type="null" />` |

## 语言环境结构

所有定义元素在 `<value type="array">` 中并列 3 个语言环境（`en`、`ja`、`zh_CN`）的条目。
每个语言环境有 `localeId`，用于对名称等进行本地化。

### 支持多语言与不支持多语言的项目

| 项目 | 多语言支持 | 说明 |
|------|-----------|------|
| contentsName | 支持 | 内容名称 |
| routeName | 支持 | 路由名称 |
| flowName | 支持 | 流程名称 |
| pageName | 支持 | 页面名称 |
| ruleName | 支持 | 规则名称 |
| matterPropertyName | 支持 | 案件属性名称 |
| **nodeName** | **不支持** | **所有语言环境使用相同的英文名称** |

**重要：`nodeName`（节点名称）不支持多语言。**
由于节点名称在 IM-Workflow 路由编辑器中与语言无关地统一显示，因此必须在所有语言环境（en / ja / zh_CN）中设置相同的英文名称。
设置日语或中文节点名称，可能在导出·再导入时造成不一致。

```xml
<contents id="contents_sample">
  <value type="array">
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">en</localeId>
      <contentsName type="string">English name</contentsName>
      ...
    </value>
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">ja</localeId>
      <contentsName type="string">日本語名</contentsName>
      ...
    </value>
    <value type="object">
      <contentsId type="string">contents_sample</contentsId>
      <localeId type="string">zh_CN</localeId>
      <contentsName type="string">中文名</contentsName>
      ...
    </value>
  </value>
</contents>
```

## 版本结构

根据 IM-Workflow 规范，需要覆盖 `2000/01/01` 至 `2999/12/31` 整个期间的版本。
没有注册定义的期间用 `versionStatus=9`（空白期间）填充。

各定义的 `details` 数组必须恰好有 2 个版本。
有效版本的 `startDate` 设置为 XML 生成日期（当天），空白期间的 `limitDate` 设置为其前一天。

| 版本 | startDate | limitDate | versionStatus | 用途 |
|------|-----------|-----------|---------------|------|
| 空白期间 | 2000/01/01 | **生成日前一天**（例：`2026/03/31`） | 9 | 没有注册定义的期间（空数据） |
| 有效 | **生成日**（例：`2026/04/01`） | 2999/12/31 | 1 | 使用中的有效数据 |

### versionStatus 的值

| 值 | 说明 |
|----|------|
| 0 | 无效（定义已注册但暂时禁用） |
| 1 | 有效（使用中） |
| 9 | 空白期间（用于填充没有注册定义期间的虚拟数据） |

版本 ID 命名规则：`{parentId}_{序号}`（从 0 开始的序号。例：`cnt_purchase_0`、`cnt_purchase_1`、...）

---

## 1. contents（内容定义）

内容定义工作流中使用的页面路径。

### 主要属性

| 属性 | 类型 | 说明 |
|------|------|------|
| contentsId | string | 内容 ID（唯一） |
| localeId | string | 语言环境 ID（en/ja/zh_CN） |
| contentsName | string | 内容名称 |
| contentsType | string | `0` = 脚本开发模型 |
| updateCount | string | 更新计数（`1`） |

### pages（页面路径定义）

在有效版本的 `pages` 数组中定义页面路径。

| 属性 | 类型 | 说明 |
|------|------|------|
| pagePathId | string | 页面路径 ID（`{prefix}_page_{序号}`） |
| pageName | string | 页面名称 |
| pageType | string | 页面类型（参见下表） |
| defaultFlag | string | `1` = 默认 |
| pathType | string | `0` = 脚本路径 |
| scriptPath | string | JSSP 文件路径（不含扩展名，相对于 `src/main/jssp/src/` 的相对路径）。**按照实际文件位置指定**。如果文件是 `apply/index.js`，则指定 `{basePath}/apply/index`（例：`wf_auto_parts/apply/index`）。不是路由的 URL 路径。 |
| applicationId | string/null | Java EE 时使用 |
| serviceId | string/null | Java EE 时使用 |
| pagePath | string/null | Java EE 时使用 |

### pageType（页面类型）

| 值 | 页面类型 | 说明 |
|----|---------|------|
| 0 | 申请页面 | 新申请时的输入页面 |
| 1 | 暂存页面 | 从暂存恢复的页面 |
| 2 | 申请（处理）页面 | 申请业务页面 |
| 3 | 重新申请页面 | 被退回后的重新申请页面 |
| 4 | 处理页面 | 审批·否决·退回的处理页面 |
| 5 | 确认页面 | 确认者用的查阅页面 |
| 6 | 处理详情页面 | 已处理案件的详情页面 |
| 7 | 参照详情页面 | 用于参照的详情页面 |

### rules（规则关联）

在内容**有效版本**的 `rules` 数组中描述对所用规则定义的引用。
若没有此关联，即使导入规则定义也不会与内容定义联动。

| 属性 | 类型 | 说明 |
|------|------|------|
| contentsRuleId | string | 要关联的规则 ID（与 `rule` 节的 `ruleId` 一致） |
| contentsId | string | 内容 ID |
| contentsVersionId | string | 内容版本 ID |
| ruleData | string/null | 规则数据（通常为 null） |

```xml
<rules type="array">
  <value type="object">
    <contentsRuleId type="string">{{ruleId}}</contentsRuleId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <ruleData type="null" />
  </value>
</rules>
```

**注意：** 空白期间版本（versionStatus=9）的 `rules` 保持为空数组。

### plugins（内容插件）

在内容**有效版本**的 `plugins` 数组中描述对插件程序的引用。
插件类型通过 `exPointId` 区分。

**何时包含：**
- **使用案件属性时（分支路由等）**：必须包含。在申请节点指定动作处理，以在申请时将表单数据保存到案件属性。若没有此设置，评估分支条件时会发生错误。
- **不使用案件属性时（直线路由等）**：若不需要动作处理，可以使用空数组。若通过动作处理执行业务逻辑（DB 保存等）时需包含。
- **用户程序方式的分支**：需要注册分支条件程序。

#### 动作处理插件

| 属性 | 类型 | 说明 |
|------|------|------|
| contentsPluginId | string | 插件 ID（随机 ID，15 位，`[0-9A-Za-z]`，跨语言环境共享） |
| localeId | string | 语言环境 ID |
| contentsId | string | 内容 ID |
| contentsVersionId | string | 内容版本 ID |
| exPointId | string | `jp.co.intra_mart.workflow.plugin.event.node.action.process` |
| pluginId | string | JSSP 实现（脚本开发模型）：`{exPointId}.pluginScriptExecutor` / Java 实现（JavaEE 开发模型）：`{exPointId}.pluginJavaExecutor`（已通过实机导出的 XML 确认。详见 [java-class-registration.md](java-class-registration.md)） |
| pluginName | string | 插件名称（任意） |
| parameter | string | JSSP 实现：动作处理的 JSSP 文件路径（不含扩展名） / Java 实现：实现类的完全限定名（FQCN） |
| nodeType | string | 节点类型编号（参见 `reference/node-types.md` 的数值代码）。在申请节点使用时指定 `2`。 |
| defaultFlag | string | `1` |
| executeOrder | string | `0`、`1`、...（每个插件的序号） |

```xml
<plugins type="array">
  <value type="object">
    <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
    <localeId type="string">{{localeId}}</localeId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process</exPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.action.process.pluginScriptExecutor</pluginId>
    <pluginName type="string">action_process</pluginName>
    <parameter type="string">{{actionProcessPath}}</parameter>
    <nodeType type="string">2</nodeType>
    <defaultFlag type="string">1</defaultFlag>
    <executeOrder type="string">0</executeOrder>
    <note type="string" />
  </value>
</plugins>
```

#### 分支条件插件（用于用户程序方式的分支）

| 属性 | 类型 | 说明 |
|------|------|------|
| contentsPluginId | string | 插件 ID（随机 ID，15 位，`[0-9A-Za-z]`，跨语言环境共享）。在 flow 的 details 中作为 `cooperationId` 引用。 |
| localeId | string | 语言环境 ID |
| contentsId | string | 内容 ID |
| contentsVersionId | string | 内容版本 ID |
| exPointId | string | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` |
| pluginId | string | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor` |
| pluginName | string | 插件名称（任意） |
| parameter | string | 分支条件程序的 JSSP 文件路径（不含扩展名） |
| nodeType | string | 空字符串 |
| defaultFlag | string | `0` |
| executeOrder | string | `0`、`1`、...（每个插件的序号） |

```xml
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId_rule}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor</pluginId>
  <pluginName type="string">{{pluginName}}</pluginName>
  <parameter type="string">{{ruleScriptPath}}</parameter>
  <nodeType type="string" />
  <defaultFlag type="string">0</defaultFlag>
  <executeOrder type="string">0</executeOrder>
  <note type="string" />
</value>
```

#### 案件终了处理插件

| 属性 | 类型 | 说明 |
|------|------|------|
| contentsPluginId | string | 插件 ID（随机 ID，跨语言环境共享） |
| localeId | string | 语言环境 ID |
| contentsId | string | 内容 ID |
| contentsVersionId | string | 内容版本 ID |
| exPointId | string | 有事务：`jp.co.intra_mart.workflow.plugin.event.matter.end.process` / 无事务：`jp.co.intra_mart.workflow.plugin.event.matter.end_no_transaction.process` |
| pluginId | string | JSSP 实现：`{exPointId}.pluginScriptExecutor` / Java 实现：`{exPointId}.pluginJavaExecutor`（已通过实机导出的 XML 确认。详见 [java-class-registration.md](java-class-registration.md)） |
| pluginName | string | `matter_end_process` |
| parameter | string | JSSP 实现：案件终了处理的 JSSP 文件路径（不含扩展名） / Java 实现：实现类的完全限定名（FQCN） |
| nodeType | string | 空字符串 |
| defaultFlag | string | `1` |
| executeOrder | string | 动作处理插件之后的序号 |

```xml
<value type="object">
  <contentsPluginId type="string">{{contentsPluginId}}</contentsPluginId>
  <localeId type="string">{{localeId}}</localeId>
  <contentsId type="string">{{contentsId}}</contentsId>
  <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
  <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.matter.end.process</exPointId>
  <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.matter.end.process.pluginScriptExecutor</pluginId>
  <pluginName type="string">matter_end_process</pluginName>
  <parameter type="string">{{matterEndProcessPath}}</parameter>
  <nodeType type="string" />
  <defaultFlag type="string">1</defaultFlag>
  <executeOrder type="string">1</executeOrder>
  <note type="null" />
</value>
```

**注意：** 空白期间版本（versionStatus=9）的 `plugins` 保持为空数组。

---

## 2. route（路由定义）

路由定义工作流的节点构成和连接关系。

### 主要属性

| 属性 | 类型 | 说明 |
|------|------|------|
| routeId | string | 路由 ID（唯一） |
| routeName | string | 路由名称 |
| routeType | string | `0` = 标准 |

### routeXmlFile（路由定义本体）

在有效版本的 `routeXmlFile` 中描述节点构成。

```xml
<routeXmlFile type="object">
  <routeId type="string">{routeId}</routeId>
  <routeVersionId type="string">{routeVersionId}</routeVersionId>
  <routeType type="string">0</routeType>
  <nodes type="array">
    <!-- 节点定义的数组 -->
  </nodes>
  <comments type="array" />
  <swimlanes type="array" />
</routeXmlFile>
```

### nodes（节点定义）

各节点的结构：

| 属性 | 类型 | 说明 |
|------|------|------|
| nodeId | string | 节点 ID（唯一） |
| nodeName | string | 节点显示名称（**最大 100 字节，所有语言环境使用相同的英文名称**） |
| nodeType | string | 节点类型编号（参见 `reference/node-types.md` 的数值代码） |
| nodeVariety | string | `system` / `human` |
| previousNodeIds | array | 前驱节点 ID 的数组 |
| nextNodeIds | array | 后继节点 ID 的数组 |
| plugins | array | 权限插件的数组 |
| x | number | X 坐标（路由编辑器上的位置） |
| y | number | Y 坐标 |
| startNodeFlag | string | `true` = 开始节点 |
| endNodeFlag | string | `true` = 结束节点 |
| traceId | string | 追踪 ID（参见下述规则） |
| routeTemplateId | null/string | 模板路由 ID |
| routeTemplateName | null/string | 模板路由名称 |
| parentNode | string/null | 父节点 ID |

### traceId 的规则

| 节点类型 | traceId | 示例 |
|---------|---------|------|
| Start / End | `0.0` | `0.0` |
| 直线节点（Apply、Approve） | `0.{序号}` | `0.1`、`0.2`、`0.3` |
| Branch_Start / Branch_End（对节点使用相同值） | `{前驱节点的下一序号}-0.0` | `0.3-0.0` |
| 分支路径内节点 | `{分支的 traceId 前缀}-{路径编号}.{节点编号}` | `0.3-1.1`、`0.3-2.1` |

- Branch_Start 及其对应的 Branch_End 使用**相同的 traceId**（用于识别配对关系）
- 横向排列·纵向排列节点也以 `-0.0` 结尾（在路由定义阶段，末尾始终为 `-0.0`）
- 路径编号从 `1` 开始的序号。节点编号也从 `1` 开始。
- "直行路径"（Branch_Start → Branch_End 的直接连接）使用路径编号 `1`。

#### 嵌套分支的 traceId

当分支路径内还有分支时，traceId 呈层次化延伸。

```
Start (0.0) → Apply (0.1) → Approve_A (0.2) → Branch_Start_01 (0.3-0.0)
  ├─ 直行路径 → Branch_End_01 (0.3-0.0)
  └─ 路径2：Approve_B (0.3-2.1) → Branch_Start_02 (0.3-2.2-0.0)
       ├─ 直行路径 → Branch_End_02 (0.3-2.2-0.0)
       └─ 路径2：Approve_C (0.3-2.2-2.1) → Branch_End_02
  Branch_End_01 → End (0.0)
```

| 节点 | traceId | 说明 |
|------|---------|------|
| Approve_A | `0.2` | 分支前的直线节点 |
| Branch_Start_01 / Branch_End_01 | `0.3-0.0` | 外层分支的配对 |
| Approve_B | `0.3-2.1` | 外层分支路径2，节点1 |
| Branch_Start_02 / Branch_End_02 | `0.3-2.2-0.0` | 内层分支的配对（在路径2节点2的位置） |
| Approve_C | `0.3-2.2-2.1` | 内层分支路径2，节点1 |

### plugins（权限插件）

在路由级别和节点级别均定义相同的 plugins（需要双重记录）。

| 属性 | 类型 | 说明 |
|------|------|------|
| routePluginId | string | 插件 ID（**最大 20 字节**。`plg_{短名称}_{序号}`） |
| routeId | string | 路由 ID（**最大 20 字节**） |
| routeVersionId | string | 路由版本 ID（**最大 20 字节**） |
| nodeId | string | 目标节点 ID（**最大 20 字节**） |
| nodeType | string | 节点类型编号（参见 `reference/node-types.md` 的数值代码） |
| extensionPointId | string | 扩展点 ID（参见 node-types.md） |
| pluginId | string | 插件 ID（参见 `reference/authority-plugins.md`） |
| parameter | string | 各插件指定的参数（参见 `reference/authority-plugins.md`） |
| targetType | string | 权限插件的 targetType（参见 `reference/authority-plugins.md`） |
| targetCode | string | 设置与 parameter 相同的值 |

---

## 3. flow（流程定义）

流程将内容和路由关联起来，定义工作流整体的行为设置。

### 主要属性

| 属性 | 类型 | 说明 |
|------|------|------|
| flowId | string | 流程 ID（唯一） |
| flowName | string | 流程名称 |
| contentsId | string | 要关联的内容 ID |
| routeId | string | 要关联的路由 ID |

### 流程设置标志

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| lumpProcessFlag | string | `1` | 批量处理可否（`0`=不可，`1`=可） |
| lumpConfirmFlag | string | `1` | 批量确认可否（`0`=不可，`1`=可） |
| attachFileFlag | string | `1` | 附件可否（**流程级别：** `0`=不可，`1`=可。**节点级别：** `0`=不可，`1`=可附加·不可删除，`2`=可附加·可删除） |
| confirmUserSetupFlag | string | `0` | 确认者设置可否（`0`=不可，`1`=可） |
| completeMatterConfirmFlag | string | `0` | 完成案件确认可否 |
| autoProcessFlag | string | `0` | 自动处理（`0`=不进行，`1`=进行） |
| autoProcessLimitDay | number/null | null | 自动处理期限天数 |
| autoProcessLimitType | string | `0` | 自动处理期限类型 |
| autoPressFlag | string | `0` | 自动催促可否（`0`=不可，`1`=可） |
| autoPressLimitDay | number/null | null | 自动催促期限天数 |
| asyncProcessFlag | string/null | null | 异步处理可否（`0`/null=不可，`1`=可） |
| sysDateTargetExpandFlag | string/null | null | 系统日期对象展开可否（`0`/null=不可，`1`=可） |
| calendarId | string/null | null | 日历 ID |

### handleUsers（参照者）

定义可以参照·操作工作流案件的用户。设置为可选（空数组也可以）。
在有效版本的 `handleUsers` 数组中设置。空白期间版本（versionStatus=9）保持为空数组。
**若用户未指定参照者，则指定空数组。** 不得将示例数据的值作为默认值填入。
参考：https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/operation_reference/index.html

| 属性 | 类型 | 说明 |
|------|------|------|
| no | string | 唯一 ID（随机 ID，15 位，`[0-9A-Za-z]`，跨语言环境共享） |
| flowId | string | 流程 ID |
| flowVersionId | string | 流程版本 ID |
| extensionPointId | string | `jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle` |
| pluginId | string | 插件 ID（参见 `reference/authority-plugins.md`） |
| parameter | string | 各插件指定的参数（参见 `reference/authority-plugins.md`） |
| targetType | string | 权限插件的 targetType（参见 `reference/authority-plugins.md`） |
| targetCode | string | 设置与 parameter 相同的值 |
| handleLevel | string | `0` |
| reserveCancelFlag | string | 预约取消可否（`0`=不可，`1`=可） |
| changeUserFlag | string | 处理者变更可否（`0`=不可，`1`=可） |
| expandUserFlag | string | 展开可否（`0`=不可，`1`=可） |
| deleteDynamicNodeFlag | string | 动态节点删除可否（`0`=不可，`1`=可） |
| undeleteDynamicNodeFlag | string | 动态节点删除取消可否（`0`=不可，`1`=可） |
| horizontalNodeConfigFlag | string | 横向排列节点设置可否（`0`=不可，`1`=可） |
| verticalNodeConfigFlag | string | 纵向排列节点设置可否（`0`=不可，`1`=可） |
| handleMoveForwardFlag | string | 案件推进可否（`0`=不可，`1`=可） |
| handleMoveBackwardFlag | string | 案件退回可否（`0`=不可，`1`=可） |
| handleTerminateFlag | string | 案件终止可否（`0`=不可，`1`=可） |

pluginId·targetType·parameter 的指定方法及示例数据参见 `reference/authority-plugins.md`。
设置多个参照者时，在 `handleUsers` 数组中并列多个条目。
各条目的 `no` 必须为每个条目不同的随机 ID（跨语言环境共享）。

### 模板

```xml
<handleUsers type="array">
  <value type="object">
    <no type="string">{{handleUserNo}}</no>
    <flowId type="string">flow_{{name}}</flowId>
    <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
    <extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle</extensionPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle.{{suffix}}</pluginId>
    <parameter type="string">{{parameter}}</parameter>
    <targetType type="string">{{targetType}}</targetType>
    <targetCode type="string">{{parameter}}</targetCode>
    <handleLevel type="string">0</handleLevel>
    <reserveCancelFlag type="string">0</reserveCancelFlag>
    <changeUserFlag type="string">0</changeUserFlag>
    <expandUserFlag type="string">0</expandUserFlag>
    <deleteDynamicNodeFlag type="string">0</deleteDynamicNodeFlag>
    <undeleteDynamicNodeFlag type="string">0</undeleteDynamicNodeFlag>
    <horizontalNodeConfigFlag type="string">0</horizontalNodeConfigFlag>
    <verticalNodeConfigFlag type="string">0</verticalNodeConfigFlag>
    <handleMoveForwardFlag type="string">0</handleMoveForwardFlag>
    <handleMoveBackwardFlag type="string">0</handleMoveBackwardFlag>
    <handleTerminateFlag type="string">0</handleTerminateFlag>
  </value>
  <!-- 设置多个时重复条目 -->
</handleUsers>
```

### defaultOrgzs / flows

- `defaultOrgzs`：申请基准组织的默认设置。通常为空数组。
- `flows`：子流程定义。通常为空数组。

### nodes（流程节点设置）

流程内各节点的个别设置：

| 属性 | 类型 | 说明 |
|------|------|------|
| flowId | string | 流程 ID |
| flowVersionId | string | 流程版本 ID |
| contentsVersionId | string | 内容版本 ID |
| routeVersionId | string | 路由版本 ID |
| nodeId | string | 节点 ID（与路由的节点 ID 一致） |
| nodeType | string | 节点类型编号（参见 `reference/node-types.md` 的数值代码） |
| lumpProcessFlag | string/null | 节点级别的批量处理设置 |
| attachFileFlag | string/null | 节点级别的附件（`0`=不可，`1`=可附加·不可删除，`2`=可附加·可删除） |
| details | array | 分支节点的规则关联数组（普通节点为空数组） |
| attributes | array | 节点属性数组 |
| unions | array | 分支节点的路径关联数组（普通节点为空数组） |
| routeNode | string/null | 路由节点 |

### details（分支节点的条件关联）

在 Branch_Start 节点（nodeType=9）的 `details` 数组中，指定应用于各分支路径的条件。
`cooperationType` 因分支方式不同而异。

| cooperationType | cooperationClassify | cooperationId 的引用目标 | 分支方式 |
|-----------------|--------------------|-----------------------|---------|
| `19` | `2` | rule 节的 `ruleId` | 规则自动判定 |
| `4` | `0` | contents plugins 的 `contentsPluginId` | 用户程序 |

| 属性 | 类型 | 说明 |
|------|------|------|
| no | string | 唯一 ID（随机 ID，15 位，`[0-9A-Za-z]`，与 unions 的 `branchUnionId` 对应） |
| cooperationType | string | `19`（规则）/ `4`（用户程序） |
| cooperationClassify | string | `2`（规则）/ `0`（程序） |
| cooperationId | string | 关联目标的 ID（参见上表） |
| emptyFlag | string | `0`（固定值） |

※ 普通的 Apply / Approve 节点的 details 为空数组。

### unions（分支节点的路径关联）

在 Branch_Start 节点（nodeType=9）的 `unions` 数组中，指定规则成立时的分支目标。
与 details 一一对应。

| 属性 | 类型 | 说明 |
|------|------|------|
| branchUnionId | string | 与 details 的 `no` **相同的值**（关联键） |
| branchUnionGroupId | string | 分组 ID（随机 ID，15 位，`[0-9A-Za-z]`，每个 union 各不相同的唯一值） |
| branchUnionGroupClassify | string | `0`（固定值） |
| countTrue | string | `1`（固定值） |
| countTargetNodeId | string | 分支目标路径的首节点 ID |

※ 普通的 Apply / Approve 节点及 Branch_End 节点的 unions 为空数组。

---

## 4. matter_property（案件属性）

定义与案件关联的业务数据项目。用作分支规则的条件变量和列表显示的列。

### 主要属性

| 属性 | 类型 | 说明 |
|------|------|------|
| matterPropertyKey | string | 属性键（唯一，用作 ID） |
| localeId | string | 语言环境 ID |
| matterPropertyName | string | 显示名称 |
| matterPropertyModelType | string | 数据类型（`1` = 数值，`0` = 字符串） |
| matterPropertyTypeListPattern | string | 可用于列表模式（`1` = 可） |
| matterPropertyTypeMailTemplate | string | 可用于邮件模板（`0` = 不可） |
| matterPropertyTypeImBoxTpl | string | 可用于 IMBox 模板（`0` = 不可） |
| matterPropertyTypeRule | string | 可用于分支规则（`1` = 可） |
| alignType | string | 显示对齐（`0` = 左，`1` = 居中，`2` = 右） |
| searchRangeType | string | 搜索范围类型（`0` = 精确匹配，`1` = 范围） |
| commaSeparatedFlag | string | 逗号分隔显示（`0` = 不） |
| calendarFlag | string | 日历使用（`0` = 不） |
| updateCount | string | 更新计数（`1`） |

### 模板

```xml
<matter_property id="{{propertyKey}}">
  <value type="array">
    <!-- 按语言环境重复（ja、en、zh_CN） -->
    <value type="object">
      <matterPropertyKey type="string">{{propertyKey}}</matterPropertyKey>
      <localeId type="string">{{localeId}}</localeId>
      <matterPropertyName type="string">{{propertyName}}</matterPropertyName>
      <matterPropertyModelType type="string">{{modelType}}</matterPropertyModelType>
      <matterPropertyTypeListPattern type="string">1</matterPropertyTypeListPattern>
      <matterPropertyTypeMailTemplate type="string">0</matterPropertyTypeMailTemplate>
      <matterPropertyTypeImBoxTpl type="string">0</matterPropertyTypeImBoxTpl>
      <matterPropertyTypeRule type="string">1</matterPropertyTypeRule>
      <alignType type="string">2</alignType>
      <searchRangeType type="string">1</searchRangeType>
      <commaSeparatedFlag type="string">0</commaSeparatedFlag>
      <calendarFlag type="string">0</calendarFlag>
      <note type="null" />
      <updateCount type="string">1</updateCount>
    </value>
  </value>
</matter_property>
```

---

## 5. rule（分支规则）

定义在分支路由中使用的条件判定规则。将案件属性的值与比较条件进行对照。

### 主要属性

| 属性 | 类型 | 说明 |
|------|------|------|
| ruleId | string | 规则 ID（唯一） |
| ruleName | string | 规则名称（条件的说明） |
| ruleUnionCondition | string | 复合条件的结合方式（`0` = AND） |
| updateCount | string | 更新计数（`1`） |

### ruleDetailModel（条件详情）

| 属性 | 类型 | 说明 |
|------|------|------|
| no | string | 条件编号（`{ruleId}_{序号}`） |
| ruleId | string | 父规则 ID |
| compareRuleId | string | 比较运算符（参见下表） |
| compareVariable | string | 要比较的案件属性键 |
| conditionValue | string | 比较值 |
| conditionValueType | string | 值的类型（`0` = 固定值） |

### compareRuleId（条件类型：ConditionType）

官方参考：https://api.intra-mart.jp/im_workflow_v72/com/imwCodeList.html#ConditionType

| 值 | 代码名 | 说明 |
|----|--------|------|
| 0 | condTyp_Include | 包含以下内容 |
| 1 | condTyp_NotInclude | 不包含以下内容 |
| 2 | condTyp_Corresponding | 与以下内容一致 |
| 3 | condTyp_Different | 与以下内容不同 |
| 4 | condTyp_Start | 以以下内容开头 |
| 5 | condTyp_End | 以以下内容结尾 |
| 6 | condTyp_Larger | 大于以下内容 |
| 7 | condTyp_More | 大于等于以下内容 |
| 8 | condTyp_Smaller | 小于以下内容 |
| 9 | condTyp_Less | 小于等于以下内容 |
| 10 | condTyp_CorrespondingEither | 与以下任意内容一致 |

**常用值：** 金额等数值比较使用 `7`（大于等于）和 `8`（小于）。

### 模板

```xml
<rule id="{{ruleId}}">
  <value type="array">
    <!-- 按语言环境重复（en、ja、zh_CN） -->
    <value type="object">
      <ruleId type="string">{{ruleId}}</ruleId>
      <localeId type="string">{{localeId}}</localeId>
      <ruleName type="string">{{ruleName}}</ruleName>
      <note type="null" />
      <ruleUnionCondition type="string">0</ruleUnionCondition>
      <updateCount type="string">1</updateCount>
      <ruleDetailModel type="array">
        <value type="object">
          <no type="string">{{ruleId}}_1</no>
          <ruleId type="string">{{ruleId}}</ruleId>
          <compareRuleId type="string">{{compareRuleId}}</compareRuleId>
          <compareVariable type="string">{{propertyKey}}</compareVariable>
          <conditionValue type="string">{{value}}</conditionValue>
          <conditionValueType type="string">0</conditionValueType>
        </value>
        <!-- 复合条件时并列追加条件 -->
      </ruleDetailModel>
    </value>
  </value>
</rule>
```

### 使用示例：按金额的 3 阶段分支

| 规则 | 条件 | compareRuleId | conditionValue |
|------|------|---------------|----------------|
| rule_01 | 10,000 未满 | 8（小于） | 10000 |
| rule_02 | 10,000 以上 50,000 未满 | 7（>=）+ 8（<） | 10000, 50000 |
| rule_03 | 50,000 以上 | 7（>=） | 50000 |

---

## 随机 ID 生成规则

XML 内的 `no`、`contentsPluginId`、`branchUnionGroupId` 等字段使用随机生成的唯一 ID。

| 项目 | 规格 |
|------|------|
| 字符集 | 半角字母数字 `[0-9A-Za-z]` |
| 位数 | 15 位 |
| 唯一性 | 在 XML 文件内不得重复 |
| 跨语言环境 | 相同元素在 3 个语言环境中共享相同的 `no` |

示例：`5hx2qt35p8oslxo`、`A3bC7dE9fG1hJ5k`

## ID 命名规则

**重要：内容 ID·路由 ID·流程 ID·各版本 ID·节点 ID 均最大 20 字节。**
由于版本 ID 会附加后缀 `_{序号}`（2 个字符以上），父 ID 必须包含后缀在内控制在 20 字节以内。
若名称较长，可将前缀缩短：`contents_` → `cnt_`、`route_` → `rte_`、`flow_` → `flw_`。

| 对象 | 模式 | 上限 | 示例 |
|------|------|------|------|
| 内容 ID | `cnt_{名称}` 或 `contents_{名称}` | **20 字节** | `cnt_purchase` |
| 内容版本 ID | `{contentsId}_{序号}` | **20 字节** | `cnt_purchase_1` |
| 页面路径 ID | `{prefix}_page_{序号}` | 20 字节 | `purchase_page_0` |
| 路由 ID | `rte_{名称}` 或 `route_{名称}` | **20 字节** | `rte_purchase` |
| 路由版本 ID | `{routeId}_{序号}` | **20 字节** | `rte_purchase_1` |
| 节点 ID | `{routePrefix}_{序号}` / `{routePrefix}_start` / `{routePrefix}_end` | **20 字节** | `purchase_01`、`purchase_start` |
| 流程 ID | `flw_{名称}` 或 `flow_{名称}` | **20 字节** | `flw_purchase` |
| 流程版本 ID | `{flowId}_{序号}` | **20 字节** | `flw_purchase_1` |
| 插件 ID | `plg_{短名称}_{序号}` | **20 字节** | `plg_purch_01` |

### 前缀缩短指南

当名称部分（`{名称}`）较长，使用标准前缀（`contents_` / `route_` / `flow_`）时版本 ID 会超过 20 个字符，此时使用以下缩短前缀。

| 标准前缀 | 缩短前缀 | 使用场景 |
|---------|---------|---------|
| `contents_`（9 字符） | `cnt_`（4 字符） | 名称为 10 个字符以上时 |
| `route_`（6 字符） | `rte_`（4 字符） | 名称为 13 个字符以上时 |
| `flow_`（5 字符） | `flw_`（4 字符） | 名称为 14 个字符以上时 |

## 坐标布局规则

节点的 x、y 坐标表示路由编辑器上的位置。

| 节点类型 | x 间距 | y 位置 |
|---------|--------|--------|
| Start | 50 | 50（主线） |
| Apply | 160 | 50 |
| Approve（直线） | 每次 +110 | 50 |
| End | 最后节点 +100 | 50 |
| Branch_Start | 前驱节点 +100 | 50 |
| Branch_End | 最后分支节点 +120~160 | 50 |
| 分支目标节点（上） | Branch_Start +180 | 110 |
| 分支目标节点（下） | Branch_Start +110~240 | 200~210 |
