# 分支路由 XML 模板

## 概述

根据条件使审批路径分叉的工作流定义。
用 `Branch_Start` / `Branch_End` 节点包围分支区间，定义多个审批路径。
分支前后可放置公共的直线节点。也支持分支嵌套（嵌套分支）。

### 分支评估方式

分支评估方式有 3 种。通过 Branch_Start 节点的 `attributes`（`attributeType=7`）进行切换。

| attributeType=7 的 value | 分支方式 | 说明 |
|--------------------------|---------|------|
| `1` | **规则自动判定** | 使用 `rule` 自动评估案件属性值，进入符合条件的路径。需要定义 `matter_property` 和 `rule`。 |
| `0` | **处理者选择** | 指定节点的处理者（申请者/审批者）在处理时通过界面选择分支目的地。无需 `rule` / `matter_property`。 |
| `2` | **用户程序** | 服务端 JS（分支条件程序）返回 `true`/`false` 来决定分支目的地。在 contents 的 `plugins` 中注册程序，并在 flow 的 `details` 中进行关联。 |

## 路由图

### 基本形式

```
                              ┌─ [Approve_A] ─────────────────┐
[Start] → [Apply] → [Branch_Start] ─ [Approve_B] → [Approve_C] → [Branch_End] → [End]
                              └─（默认：直接连接）──────────┘
```

### 分支前放置公共节点

所有路径共用的审批者可放在分支之前。

```
[Start] → [Apply] → [Approve_公共] → [Branch_Start] ─┬─ ... ─ [Branch_End] → [End]
                                                      └─ ... ─┘
```

### 嵌套分支

可以在分支路径内部再放置分支。Branch_Start / Branch_End 必须成对使用。

```
[Start] → [Apply] → [Approve_A] → [Branch_Start_01] ─┬─(直行)─────────────────── [Branch_End_01] → [End]
                                                       └─ [Approve_B] → [Branch_Start_02] ─┬─(直行)── [Branch_End_02] ┘
                                                                                            └─ [Approve_C] ────────────┘
```

## 使用示例

### 规则自动判定方式

- "费用申请工作流。不足10万日元仅需课长审批；10万日元及以上需课长→部长依次审批。"
- "所有案件经课长审批后，50万日元及以上需部长审批，100万日元及以上需部长→本部长依次审批。"（嵌套分支）

### 处理者选择方式

- "由申请者选择分支目的地。"
- "课长审批时，由课长选择下一路径。"
- "允许在申请时和上级审批时均可选择分支目的地。"

### 用户程序方式

- "使用服务端程序判断分支目的地。"
- "基于数据库值通过程序控制分支。"
- "根据外部系统状态用 JS 实现分支条件。"

## 实现复合条件（AND）的方法

将多个条件用 AND 组合的方法取决于**分支路径数量**。

### 2 选 1：1 个 AND 规则（无需嵌套分支）

对于"满足条件则追加审批，不满足则跳过"这种 **2 选 1** 的情况，一个 `ruleUnionCondition=0`（AND 结合）的规则即可判定。无需嵌套分支。

```
Branch_Start
  ├─ 条件A AND 条件B → 审批者X → Branch_End
  └─（直行：不满足条件）→ Branch_End
Branch_End → ...
```

示例：仅当 `unitPrice > 20000 AND totalAmount > 100000` 时追加部长审批。

### 3 选 1 及以上：嵌套分支（按条件分开分支节点）

当条件组合产生 **3 条或更多不同路径** 时，使用嵌套分支。
将所有模式的 AND 规则全部列举维护性较差，因此将每个分支节点设为单一条件，以嵌套结构进行组合。

```
Branch1_Start（按条件A分支）
  ├─ 条件A=true → Branch2_Start（按条件B分支）
  │   ├─ 条件B=true → 审批者X → Branch2_End
  │   └─ 条件B=false →（直行）→ Branch2_End
  │ Branch2_End → Branch1_End
  └─ 条件A=false →（其他处理）→ Branch1_End
Branch1_End → ...
```

- 每条规则设为**单一条件**（对一个案件属性进行一次比较）
- 条件的组合通过嵌套分支结构来表达
- 规则可在多个分支节点间共享（例：在 Branch2 和 Branch3 中使用相同的 `totalAmount >= 100000` 规则）

完整示例请参阅 `assets/sample-complete-branch.md`。

### 判断标准汇总

| 分支路径数 | 方式 | 规则设计 |
|-----------|------|---------|
| 2 选 1（满足条件或跳过） | 单一分支 | 1 个 AND 规则 |
| 3 选 1 及以上（条件组合产生不同处理） | 嵌套分支 | 每个分支为单一条件规则 |

## 参数

除 template-straight.md 的参数外，还需：

| 参数 | 必须 | 说明 | 示例 |
|------|------|------|------|
| branches | YES | 分支路径定义的数组 | 参见下方 |

### branches 定义

```
[
  {
    name: "path_a",         // 路径名（用于生成 ID）
    nodes: [                // 路径内审批节点数组
      { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" }
    ]
  },
  {
    name: "path_b",
    nodes: [
      { nodeName: "Manager", targetType: "role", targetCode: "im_workflow_user" },
      { nodeName: "Director", targetType: "role", targetCode: "im_workflow_user" }
    ]
  }
]
```

**注意：** `nodeName` 在所有语言环境中使用统一的英文名称（不做多语言处理）。

## contents 节

与直线路由相同。
请参阅 template-straight.md。

## route 节（分支特有部分）

### 节点构成

以直线路由的 route 模板为基础，将 Apply 和 End 之间的节点替换为以下内容。

#### 节点定义（分支区间）

XML 整体结构遵循 `sample-complete-branch.md`。以下为分支特有的节点规格。

| nodeId | nodeName | nodeType | nodeVariety | prev | next | plugins |
|--------|----------|----------|-------------|------|------|---------|
| `{{name}}_branch_s` | Start branch | nodeTyp_Branch_Start | system | Apply | 各路径首节点 | 空 |
| `{{name}}_{{path}}_{{N}}` | {{nodeName}} | nodeTyp_Approve | human | 前节点（首节点为 Branch_Start） | 后节点（末节点为 Branch_End） | 审批权限 |
| `{{name}}_branch_e` | End branch | nodeTyp_Branch_End | system | 各路径末节点 | End | 空 |

- 将 Apply 的 nextNodeIds 改为 `{{name}}_branch_s`，将 End 的 previousNodeIds 改为 `{{name}}_branch_e`
- Branch_Start / Branch_End 的 traceId：`{{BRANCH_TRACE_PREFIX}}-0.0`
- 路径节点的 traceId：`{{BRANCH_TRACE_PREFIX}}-{路径编号}.{节点编号}`（路径编号从 1 开始，节点编号也从 1 开始）
- 路径A 的 y = 110，路径B 的 y = 200
- 所有节点共通：`startNodeFlag=false`，`endNodeFlag=false`，`routeTemplateId=null`，`routeTemplateName=null`，`parentNode=null`

### BRANCH_TRACE_PREFIX 的计算

`BRANCH_TRACE_PREFIX` 是 Branch_Start 直前节点的 traceId 序号的下一个值。

| 模式 | 直前节点的 traceId | BRANCH_TRACE_PREFIX |
|------|------------------|---------------------|
| Apply → Branch_Start | `0.1` | `0.2` |
| Approve(0.2) → Branch_Start | `0.2` | `0.3` |
| 嵌套：外层路径2的节点1(0.3-2.1) → 内层 Branch_Start | `0.3-2.1` | `0.3-2.2` |

### 坐标计算公式（分支路由）

| 节点 | x 坐标 | y 坐标 |
|------|--------|--------|
| Start | 50 | 50 |
| Apply | 160 | 50 |
| 分支前的公共节点 | 160 + N * 110 | 50 |
| Branch_Start | 前节点.x + 110 | 50 |
| 路径A 节点 | Branch_Start.x + 180 + (n-1)*130 | 110 |
| 路径B 节点 | Branch_Start.x + 110 + (n-1)*130 | 200 |
| Branch_End | max(所有分支节点.x) + 120 | 50 |
| End | Branch_End.x + 80 | 50 |

坐标换行规则请参阅 template-straight.md（路由设计器：10000 x 5000 px，x > 9500 时换行）。

### nextNodeIds 的顺序规则

`Branch_Start` 的 `nextNodeIds`：
1. 路径A 的首节点
2. 路径B 的首节点
3. ...（路径增加时）
4. **仅当存在"无需审批立即结束"的路径时**才添加 `Branch_End`

`Branch_End` 的 `previousNodeIds`：
1. 各分支路径的末节点
2. **仅当存在"无需审批立即结束"的路径时**才添加 `Branch_Start`

**判断标准：** 所有分支路径都至少有 1 个审批节点时，不需要 `Branch_Start` → `Branch_End` 的直连路径。
仅当存在"条件不满足时无审批通过"类路径时才包含直连路径。

## flow 节（分支特有部分）

以与直线路由相同的结构为基础，**在 flow 的 `nodes` 中也包含 Branch_Start 节点和 Branch_End 节点**。
在 Branch_Start 节点中设置 `details`（规则关联）、`unions`（路径关联）和 `attributes`。

### Branch_Start 节点的 Flow 设置

```xml
<value type="object">
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <nodeType type="string">9</nodeType>
  <lumpProcessFlag type="null" />
  <attachFileFlag type="null" />
  <autoProcessFlag type="null" />
  <autoProcessLimitDay type="null" />
  <autoProcessLimitType type="null" />
  <autoPressFlag type="null" />
  <autoPressLimitDay type="null" />
  <localeId type="string">{{localeId}}</localeId>
  <!-- details：规则与分支的对应关系（按分支路径数重复） -->
  <details type="array">
    {{BRANCH_DETAILS}}
  </details>
  <!-- attributes：分支节点属性 -->
  <attributes type="array">
    <!-- attributeType=7：分支方式（1=规则自动判定 / 0=处理者选择） -->
    <value type="object">
      <no type="string">{{uniqueNo_attr}}</no>
      <flowId type="string">flow_{{name}}</flowId>
      <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
      <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
      <routeVersionId type="string">route_{{name}}_1</routeVersionId>
      <nodeId type="string">{{name}}_branch_s</nodeId>
      <localeId type="string">{{localeId}}</localeId>
      <attributeType type="string">7</attributeType>
      <attributeKey type="string">NoSetting</attributeKey>
      <value type="string">1</value>
    </value>
    <!-- 仅处理者选择方式：按可选节点数添加 attributeType=11 条目 -->
    {{BRANCH_SELECT_NODE_ATTRIBUTES}}
  </attributes>
  <!-- unions：规则与分支目标节点的对应关系（按分支路径数重复） -->
  <unions type="array">
    {{BRANCH_UNIONS}}
  </unions>
  <routeNode type="null" />
</value>
```

### details 元素

每个 details 元素定义"满足哪个条件时"。
根据分支方式，`cooperationType` 和 `cooperationId` 不同。

#### 规则自动判定方式（cooperationType=19）— 每个分支路径 1 个

```xml
<value type="object">
  <no type="string">{{uniqueNo_detail}}</no>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <cooperationType type="string">19</cooperationType>
  <cooperationClassify type="string">2</cooperationClassify>
  <cooperationId type="string">{{ruleId}}</cooperationId>
  <emptyFlag type="string">0</emptyFlag>
</value>
```

| 属性 | 值 | 说明 |
|------|-----|------|
| no | 随机ID（15位，`[0-9A-Za-z]`） | 唯一ID（与 unions 的 `branchUnionId` 对应） |
| cooperationType | `19` | 分支规则类型（固定值） |
| cooperationClassify | `2` | 规则分类（固定值） |
| cooperationId | `rule_xxx` | **关联的 rule 节的 ruleId** |
| emptyFlag | `0` | 空标志（固定值） |

#### 用户程序方式（cooperationType=4）— 每个程序 1 个

```xml
<value type="object">
  <no type="string">{{uniqueNo_detail}}</no>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <cooperationType type="string">4</cooperationType>
  <cooperationClassify type="string">0</cooperationClassify>
  <cooperationId type="string">{{contentsPluginId}}</cooperationId>
  <emptyFlag type="string">0</emptyFlag>
</value>
```

| 属性 | 值 | 说明 |
|------|-----|------|
| no | 随机ID（15位，`[0-9A-Za-z]`） | 唯一ID（与 unions 的 `branchUnionId` 对应） |
| cooperationType | `4` | **用户程序类型** |
| cooperationClassify | `0` | 程序分类 |
| cooperationId | `{{contentsPluginId}}` | **在 contents plugins 中注册的分支条件插件的 `contentsPluginId`** |
| emptyFlag | `0` | 空标志（固定值） |

### unions 元素（每个分支路径 1 个）

每个 unions 元素定义"规则成立时进入哪个路径"。

```xml
<value type="object">
  <branchUnionId type="string">{{uniqueNo_detail}}</branchUnionId>
  <flowId type="string">flow_{{name}}</flowId>
  <flowVersionId type="string">flow_{{name}}_1</flowVersionId>
  <contentsVersionId type="string">contents_{{name}}_1</contentsVersionId>
  <routeVersionId type="string">route_{{name}}_1</routeVersionId>
  <nodeId type="string">{{name}}_branch_s</nodeId>
  <branchUnionGroupId type="string">{{uniqueNo_group}}</branchUnionGroupId>
  <branchUnionGroupClassify type="string">0</branchUnionGroupClassify>
  <countTrue type="string">1</countTrue>
  <countTargetNodeId type="string">{{pathFirstNodeId}}</countTargetNodeId>
</value>
```

| 属性 | 值 | 说明 |
|------|-----|------|
| branchUnionId | 与 details 的 `no` **相同的值** | 与 details 的关联键 |
| branchUnionGroupId | 随机ID（15位，`[0-9A-Za-z]`） | 组ID（每个 union 各不相同的唯一值） |
| branchUnionGroupClassify | `0` | 组分类（固定值） |
| countTrue | `1` | 计数条件（固定值） |
| countTargetNodeId | 例：`expense_a_01` | **分支目标路径的首节点 ID** |

### details 与 unions 的关联关系

```
details[0].no ─────────────── = unions[0].branchUnionId
details[0].cooperationId      = rule_01（规则ID）
unions[0].countTargetNodeId   = expense_a_01（路径A 首节点）

details[1].no ─────────────── = unions[1].branchUnionId
details[1].cooperationId      = rule_02（规则ID）
unions[1].countTargetNodeId   = expense_b_01（路径B 首节点）
```

**重要：** 将 `details[n].no` 和 `unions[n].branchUnionId` 设为相同值，可建立"规则 → 分支目标"的对应关系。

### attributes 的规格

在 Branch_Start 节点的 attributes 中设置以下属性。

#### attributeType=7（attrTyp_branchCondition：分支条件）— 必填，1 条

| 属性 | 值 | 说明 |
|------|-----|------|
| attributeType | `7` | 分支条件 |
| attributeKey | `NoSetting` | 固定值 |
| value | `1`=规则自动判定 / `0`=处理者选择 / `2`=用户程序 | 分支评估方式 |

#### attributeType=11（attrTyp_branchSettableNodePlural：可设置分支目标节点）— 仅处理者选择方式

使用处理者选择方式（`attributeType=7` 的 `value=0`）时添加。
按允许选择分支目标的节点数重复添加条目。

| 属性 | 值 | 说明 |
|------|-----|------|
| attributeType | `11` | 可设置分支目标节点（多个） |
| attributeKey | `NoSetting` | 固定值 |
| value | 节点ID（例：`expense_apply`） | **允许选择分支目标的节点的 nodeId** |

AttributeType / AttributeKey 的完整代码列表，请参阅 `reference/node-types.md` 的"AttributeType（属性类型）"。

```xml
<!-- 处理者选择方式的 attributes 示例 -->
<attributes type="array">
  <!-- 分支方式：处理者选择 -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_1}}</no>
    ...（flowId/flowVersionId/contentsVersionId/routeVersionId/nodeId/localeId 为公共值）
    <attributeType type="string">7</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">0</value>
  </value>
  <!-- 可选节点1：申请节点 -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_2}}</no>
    ...
    <attributeType type="string">11</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">{{name}}_apply</value>
  </value>
  <!-- 可选节点2：直前审批节点 -->
  <value type="object">
    <no type="string">{{uniqueNo_attr_3}}</no>
    ...
    <attributeType type="string">11</attributeType>
    <attributeKey type="string">NoSetting</attributeKey>
    <value type="string">{{name}}_approve_1</value>
  </value>
</attributes>
```

#### no 的编号规则

`no` 是随机ID（15位，`[0-9A-Za-z]`），在各语言环境间共享（与 details/unions 的 `no` 值不同）。
attributeType=7 条目和每个 attributeType=11 条目各自拥有不同的 `no`。

### Branch_End 节点的 Flow 设置

Branch_End 节点包含在 flow 的 `nodes` 中，但 details / unions / attributes 均为空数组。

| nodeId | nodeType | 标志类 | details | attributes | unions |
|--------|----------|--------|---------|------------|--------|
| `{{name}}_branch_e` | `10` | 全部 null | 空数组 | 空数组 | 空数组 |

"标志类" = lumpProcessFlag, attachFileFlag, autoProcessFlag, autoProcessLimitDay, autoProcessLimitType, autoPressFlag, autoPressLimitDay（全部 `type="null"`）

### Flow nodes 的记述顺序

```
1. Apply 节点（nodeType=2）
2. Branch_Start 节点（nodeType=9）— 有 details/unions/attributes
3. 各审批节点（nodeType=3）— 按路径A、路径B…的顺序列举
4. Branch_End 节点（nodeType=10）— details/unions/attributes 为空
```

---

## 与 matter_property / rule 的联动（仅规则自动判定方式）

**规则自动判定方式**（`attributeType=7` 的 `value=1`）中，通过 `rule` 根据案件属性值控制进入哪条路径。
`matter_property` 和 `rule` 与 contents / route / flow 并列，直接放在 `<data>` 下方。

**处理者选择方式**（`attributeType=7` 的 `value=0`）中，不需要 `matter_property` / `rule` / `details` / `unions`。
但 `details` 和 `unions` 不应为空数组，仍需按分支路径数设置条目（规则ID可为任意值）。

### 使用示例：按金额分支

提示语："不足10万日元仅需课长审批；10万日元及以上需课长→部长依次审批。"

所需定义：
1. **matter_property**：`item_total`（合计金额，数值型）
2. **rule_01**：合计金额 < 100000（路径A：仅课长）
3. **rule_02**：合计金额 >= 100000（路径B：课长→部长）

matter_property / rule 的 XML 结构遵循 `sample-complete-branch.md`。以下仅展示配置值。

#### matter_property 定义

| matterPropertyKey | matterPropertyName (ja/en/zh_CN) | matterPropertyModelType | matterPropertyTypeRule |
|-------------------|----------------------------------|------------------------|----------------------|
| `item_total` | 合計金額 / Total amount / 合计金额 | `1`（数值） | `1`（用于规则条件） |

其他属性（matterPropertyTypeListPattern 等）使用与示例相同的默认值。

#### rule 定义

| ruleId | ruleName (ja) | compareRuleId | compareVariable | conditionValue |
|--------|--------------|---------------|-----------------|---------------|
| `rule_01` | 合計金額：100000未満 | `8`（小于） | `item_total` | `100000` |
| `rule_02` | 合計金額：100000以上 | `7`（大于等于） | `item_total` | `100000` |

- `ruleUnionCondition`：`0`（AND 结合）
- `conditionValueType`：`0`（固定值）
- `ruleDetailModel.no`：`{ruleId}_1` 格式
- en / zh_CN 的 `ruleName` 也需本地化

### 注意事项

- `matter_property` 的 `matterPropertyTypeRule` 不设为 `1` 则无法用作规则的条件变量
- `compareVariable` 必须与 `matter_property` 的 `matterPropertyKey` 一致
- 规则与路径的关联在**流程定义的 Branch_Start 节点**（`details` + `unions`）中完成。XML 导入即可完成，无需在管理界面手动设置
- 数值比较时，`matterPropertyModelType` 设为 `1`（数值）

---

## 用户程序方式的附加设置（attributeType=7 的 value=2）

**用户程序方式**中，服务端 JS（分支条件程序）判断分支目标。
程序实现请参阅 `jssp-im-workflow-usage` 的 `simple-rule-condition.md`。
程序的 `execute(parameter)` 返回 `data: true` 的路径将被执行。

### 1. 在 contents 的 plugins 中注册分支条件插件

在 contents **有效版本**的 `plugins` 数组中，每个分支条件程序添加 1 条记录。

```xml
<plugins type="array">
  <!-- 现有动作处理插件（如有） -->
  ...
  <!-- 分支条件程序 1 -->
  <value type="object">
    <contentsPluginId type="string">{{contentsPluginId_rule1}}</contentsPluginId>
    <localeId type="string">{{localeId}}</localeId>
    <contentsId type="string">{{contentsId}}</contentsId>
    <contentsVersionId type="string">{{contentsVersionId}}</contentsVersionId>
    <exPointId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule</exPointId>
    <pluginId type="string">jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor</pluginId>
    <pluginName type="string">{{pluginName}}</pluginName>
    <parameter type="string">{{ruleScriptPath}}</parameter>
    <nodeType type="string" />
    <defaultFlag type="string">0</defaultFlag>
    <executeOrder type="string">{{executeOrder}}</executeOrder>
    <note type="string" />
  </value>
  <!-- 分支条件程序 2（多路径时） -->
  ...
</plugins>
```

| 属性 | 值 | 说明 |
|------|-----|------|
| contentsPluginId | 随机ID（15位，`[0-9A-Za-z]`） | 唯一ID。在 flow 的 details 中作为 `cooperationId` 被引用 |
| exPointId | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule` | **分支条件插件的扩展点** |
| pluginId | `jp.co.intra_mart.workflow.plugin.event.node.branch.rule.pluginScriptExecutor` | **脚本执行插件** |
| pluginName | 任意名称 | 插件显示名称 |
| parameter | JSSP 文件路径（不含扩展名） | 分支条件程序的路径（例：`wf_expense/rule/rule01`） |
| nodeType | 空字符串 | 分支条件插件不指定节点类型 |
| defaultFlag | `0` | 默认标志（固定为 `0`） |
| executeOrder | `0`，`1`，… | 执行顺序（从 0 开始，每个插件递增） |

### 2. 在 flow 的 details 中以 cooperationType=4 进行关联

在 Branch_Start 节点的 `details` 中，每个分支条件程序添加一条 `cooperationType=4` 的记录。
`cooperationId` 指定 contents 的 `contentsPluginId`。

### 3. 在 flow 的 unions 中关联路径

对应 `cooperationType=4` 的 details 记录，使用 unions 记录指定程序返回 `true` 时的目标节点。

### details 与 unions 的关联关系（用户程序方式）

```
details[0].no ─────────────── = unions[0].branchUnionId
details[0].cooperationType    = 4（用户程序）
details[0].cooperationId      = {{contentsPluginId_rule1}}（contents 插件ID）
unions[0].countTargetNodeId   = expense_president（路径A 首节点）

details[1].no ─────────────── = unions[1].branchUnionId
details[1].cooperationType    = 4（用户程序）
details[1].cooperationId      = {{contentsPluginId_rule2}}（contents 插件ID）
unions[1].countTargetNodeId   = expense_branch_e（路径B = 无需审批直接连接）
```

## 生成检查清单

### 公共（两种方式）

- [ ] template-straight.md 检查清单中的所有项目
- [ ] Branch_Start 的 nextNodeIds 包含所有路径的首节点
- [ ] Branch_End 的 previousNodeIds 包含所有路径的末节点
- [ ] 分支路径内节点的连接正确（路径内串联）
- [ ] 各路径的 Y 坐标不同（不重叠）
- [ ] traceId 的路径编号在每个分支中唯一
- [ ] Branch_Start 和 Branch_End 的 traceId 值相同（识别配对）
- [ ] 存在嵌套分支时，内层 traceId 前缀是外层路径内序号的延续
- [ ] flow 的 nodes 包含 Branch_Start（nodeType=9）和 Branch_End（nodeType=10）
- [ ] Branch_Start 的 details 数 = unions 数 = 分支路径数
- [ ] details 的 `no` 与 unions 的 `branchUnionId` 一一对应
- [ ] unions 的 `countTargetNodeId` 引用各路径的首节点ID
- [ ] attributes 中有 1 条 `attributeType=7` 的记录

### 规则自动判定方式（attributeType=7 的 value=1）附加检查

- [ ] details 的 `cooperationId` 引用了正确的 ruleId
- [ ] matter_property 的 matterPropertyTypeRule 为 `1`
- [ ] rule 的 compareVariable 与 matter_property 的 key 一致
- [ ] rule 具备 3 个语言环境版本
- [ ] 所有使用的 ruleId 已在 contents 的 rules 数组中注册

### 处理者选择方式（attributeType=7 的 value=0）附加检查

- [ ] attributes 中 `attributeType=11` 的条目数等于允许选择分支目标的节点数
- [ ] `attributeType=11` 的 `value` 正确引用了节点ID（Apply/Approve）
- [ ] 指定的节点位于 Branch_Start 之前

### 用户程序方式（attributeType=7 的 value=2）附加检查

- [ ] contents 的 plugins 中已注册分支条件程序（`exPointId` = `jp.co.intra_mart.workflow.plugin.event.node.branch.rule`）
- [ ] plugins 的 `contentsPluginId` 在各语言环境间共享
- [ ] flow 的 details 中 `cooperationType=4` 的条目数等于分支条件程序数
- [ ] details 的 `cooperationId` 与 contents plugins 的 `contentsPluginId` 一致
- [ ] unions 的 `countTargetNodeId` 引用了各程序对应的分支目标节点ID
- [ ] 分支条件程序（.js）的实现符合 `jssp-im-workflow-usage` 的 `simple-rule-condition.md`
