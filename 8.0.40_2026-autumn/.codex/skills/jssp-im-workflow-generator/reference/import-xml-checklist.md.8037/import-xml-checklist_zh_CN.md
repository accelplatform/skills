# IM-Workflow 导入 XML 检查清单

使用 `jssp-im-workflow-generator` 技能生成 XML 时的自检清单。

### 生成前检查（pre）

在开始编写第 1 行 XML 之前完成以下内容。

- [ ] 已使用 **Read 工具实际读取**了 `assets/sample-complete-branch.md` 的 XML 部分（不得以代理摘要或推测代替）
- [ ] 已确认 contents / route / flow / matter_property / rule 各节的前 50 行以上
- [ ] 已确认输出目标为 `src/main/storage/public/im_workflow/`
- [ ] 已确认输出文件为**1个 XML 文件**，命名为 `im_workflow-{name}-import.xml`（不得分为5个文件）
- [ ] 已确认 XML 根元素为 `<data>`，直接子元素为 `<contents id="...">`, `<route id="...">` 等

### 输出格式检查（output）

- [ ] contents / route / flow / matter_property / rule 全部包含在**1个 `<data>` 元素**内
- [ ] 结构符合示例：`<contents id="..."><value type="array"><value type="object">`（不允许自定义标签）
- [ ] XML 声明为 `<?xml version="1.0" encoding="UTF-16"?>`
- [ ] 使用 Write 工具写出为 UTF-8 → 已通过 `iconv -f UTF-8 -t UTF-16LE` 转换
- [ ] 已执行 `reference/validate-xml-encoding.md` 的验证脚本（确认 `OK` 或 `FIXED`）
- [ ] 已按照 `reference/validate-xsd.md` 的步骤执行 XSD 验证（确认 `OK: ... is valid against the schema`）。如有错误，根据错误信息修正 XML，重新验证直至通过

### XML 结构检查（structure）

#### contents（内容定义）

- [ ] 每个语言环境的 `<details type="array">` 中包含版本（blank `_0` + active `_1`）
- [ ] 版本 ID 格式为 `{contentsId}_0`（blank）和 `{contentsId}_1`（active）
- [ ] 页面定义包含 `pagePathId`、`localeId`、`contentsId`、`contentsVersionId`、`pageName`、`pageType`、`defaultFlag`、`pathType`、`scriptPath`、`applicationId`、`serviceId`、`pagePath`
- [ ] 内容插件包含 `contentsPluginId`、`localeId`、`contentsId`、`contentsVersionId`、`exPointId`、`pluginId`、`pluginName`、`parameter`、`nodeType`、`defaultFlag`、`executeOrder`、`note`
- [ ] 内容规则关联包含 `contentsRuleId`、`contentsId`、`contentsVersionId`、`ruleData`
- [ ] 已定义 8 种页面类型（0～7）

#### route（路由定义）

- [ ] 有效版本包含 `routeFilePath`（格式：`im_workflow/data/default/master/route/{routeId}/{routeVersionId}/route.xml`）
- [ ] `routeXmlFile` 包含 `routeId`、`routeVersionId`、`routeType`
- [ ] 每个节点包含 `nodeId`、`nodeName`、`nodeType`、`nodeVariety`、`previousNodeIds`、`nextNodeIds`、`plugins`、`x`、`y`、`startNodeFlag`、`endNodeFlag`、`traceId`、`routeTemplateId`、`routeTemplateName`、`parentNode`
- [ ] 节点内插件包含 `routePluginId`、`routeId`、`routeVersionId`、`nodeId`、`nodeType`、`extensionPointId`、`pluginId`、`parameter`、`targetType`、`targetCode`
- [ ] 路由级别的 `<plugins type="array">` 也重复记录了与节点内相同的插件
- [ ] `routeXmlFile` 包含 `<comments type="array" />` 和 `<swimlanes type="array" />`
- [ ] `previousNodeIds` 与 `nextNodeIds` 双向一致
- [ ] 坐标（x、y）遵循各模板（`assets/template-*.md`）的计算公式
- [ ] 权限插件的扩展点根据直前节点类型正确选择——直前为人员节点（申请·审批等）→ `approve.{后缀}`，直前为系统节点（分支开始·同步开始等）→ `approve.static.{后缀}`
- [ ] 权限插件使用直接指定系（`.department`、`.post`、`.role` 等）、组合指定系（`.department_and_post` 等）或动态指定系（`.apply_user_department_and_post` 等）之一
- [ ] 直接指定系·组合指定系的 `targetType` / `targetCode` 有值（参阅 `reference/authority-plugins.md` 的 targetType 列表）
- [ ] 动态指定系的 `targetType` / `targetCode` 为空标签，`parameter` 格式符合后缀末尾：仅 `_department` → 空标签，`_and_post` → `|{公司}^{组织集}^{职位}`，`_and_role` → `|{角色ID}`

#### flow（流程定义）

- [ ] 流程节点包含 `flowId`、`flowVersionId`、`contentsVersionId`、`routeVersionId`、`nodeId`、`nodeType`、`localeId`
- [ ] 审批节点（人员）包含 `lumpProcessFlag`、`attachFileFlag`、`autoProcessFlag`、`autoProcessLimitDay`、`autoProcessLimitType`、`autoPressFlag`、`autoPressLimitDay`
- [ ] 系统节点（Branch_Start/End 等）的上述标志为 `type="null"`
- [ ] 所有节点包含 `<details type="array" />`、`<attributes type="array">`、`<unions type="array">`、`<routeNode type="null" />`
- [ ] 分支节点的 details 包含 `no`、`flowId`、`flowVersionId`、`contentsVersionId`、`routeVersionId`、`nodeId`、`cooperationType`、`cooperationClassify`、`cooperationId`、`emptyFlag`
- [ ] 分支节点的 unions 包含 `branchUnionId`、`flowId`、`flowVersionId`、`contentsVersionId`、`routeVersionId`、`nodeId`、`branchUnionGroupId`、`branchUnionGroupClassify`、`countTrue`、`countTargetNodeId`
- [ ] `details[n].no` 与 `unions[n].branchUnionId` 相互对应
- [ ] 分支节点的 attributes 中 `attributeKey` 为 `"NoSetting"`，`value` 为 `"1"`（规则自动判定）
- [ ] `handleUsers` 数组包含参照者设置
- [ ] flow 的 nodes 包含人员节点（Apply/Approve/Horizontal/Vertical），以及 Branch_Start/Branch_End/Sync_Start/Sync_End（不包含 Start/End 节点）
- [ ] 3路以上分支时，各分支使用单一条件并以嵌套分支组合（详细：`assets/template-branch.md`"实现复合条件（AND）的方法"）

#### matter_property（案件属性）

- [ ] 每个属性以 `<matter_property id="{key}">` 作为独立节
- [ ] 每个属性包含 `matterPropertyKey`、`localeId`、`matterPropertyName`、`matterPropertyModelType`、`matterPropertyTypeListPattern`、`matterPropertyTypeMailTemplate`、`matterPropertyTypeImBoxTpl`、`matterPropertyTypeRule`、`alignType`、`searchRangeType`、`commaSeparatedFlag`、`calendarFlag`、`note`、`updateCount`
- [ ] 分支条件中使用的属性，其 `matterPropertyTypeRule` 为 `"1"`

#### rule（分支规则）

- [ ] 每条规则以 `<rule id="{ruleId}">` 作为独立节
- [ ] 每条规则包含 `ruleId`、`localeId`、`ruleName`、`ruleUnionCondition`、`updateCount`、`ruleDetailModel`
- [ ] 规则条件使用 `no`、`ruleId`、`compareRuleId`、`compareVariable`、`conditionValue`、`conditionValueType`
- [ ] `compareVariable` 指定案件属性的 `matterPropertyKey`（不是标签名 `matterPropertyKey`）
- [ ] `conditionValue` 指定比较值（不是标签名 `compareValue`）
- [ ] 英文 `ruleName` 中包含 `<` `>` 时，已转义为 `&lt;` `&gt;`

### 语言环境·版本检查（locale）

- [ ] 所有节均存在 3 个语言环境（en / ja / zh_CN）
- [ ] 每个语言环境存在 2 个版本：空白期间（`versionStatus="9"`）和有效（`versionStatus="1"`）
- [ ] 空白期间的 `limitDate` 为有效版本 `startDate` 的前一天
- [ ] `nodeName` 在所有语言环境中使用相同的英文名称（不做本地化）
- [ ] 各语言环境的 ID·结构相同，仅名称（`contentsName`、`pageName`、`routeName`、`flowName`、`ruleName`、`matterPropertyName`）不同
- [ ] 同一元素的随机ID（`contentsPluginId`、`pagePathId`、`no` 等）在所有语言环境中值相同

### 常见错误检查（pitfall）

基于过去失败案例的检查项。生成后必须确认。

- [ ] 没有输出到 `src/main/conf/import/` 等错误目录 → 正确：`src/main/storage/public/im_workflow/`
- [ ] 没有分割为 contents.xml、route.xml 等多个文件 → 正确：单一 `im_workflow-{name}-import.xml`
- [ ] 没有使用 `<contents type="array"><content type="object">` 等自定义标签 → 正确：`<contents id="..."><value type="array"><value type="object">`
- [ ] 没有使用 `versionId` → 正确：`contentsVersionId` / `routeVersionId` / `flowVersionId`
- [ ] 节点中没有省略 `startNodeFlag`、`endNodeFlag` 等 → 输出示例中的全部属性
- [ ] 插件中没有省略 `targetType`、`targetCode` → 按示例包含
- [ ] flow 节点中没有省略 `flowId`、`flowVersionId` 等 → 按示例包含
- [ ] 规则中没有使用 `matterPropertyKey`、`compareValue` 标签 → 正确：`compareVariable`、`conditionValue`、`conditionValueType`
- [ ] 分支 `attributeKey` 没有指定为 `"0"` → 正确：`"NoSetting"`
- [ ] 动态指定系的 `parameter` 与后缀末尾一致 → `_and_post` 为 `|{职位}` 格式，`_and_role` 为 `|{角色ID}` 格式，仅 `_department` 为空标签（详细：`reference/authority-plugins.md`）
- [ ] 分支开始·同步开始等系统节点直后的审批节点没有使用 `approve.{后缀}` → 正确：`approve.static.{后缀}`（详细：`reference/authority-plugins.md`"静态审批（B-1）与动态审批（B-2）的使用区分"）
- [ ] 仅指定职位名（如"课长"等）时没有使用 `.post`（直接指定） → 正确：`.apply_user_department_and_post`（详细：`reference/authority-plugins.md`"审批者指示的默认解释规则"）
- [ ] 没有不读取示例就生成 → **必须先读取示例再生成**
- [ ] 动态指定系插件的 `parameter` 中没有公司代码·组织集代码的重复 → 例：`|comp_sample_01^comp_sample_01^comp_sample_01^comp_sample_01^ps003` 为错误。正确：`|comp_sample_01^comp_sample_01^ps003`。由 `validate-workflow.js` 的 `[param]` 检查自动检测。**在 spec.json 中，动态插件的 `targetCode` 仅指定职位代码等，不包含公司代码·组织集代码**（由 `build-workflow.js` 自动附加）
- [ ] contents 定义中的界面路径（`scriptPath` / `pagePath`）与文件系统上的实际位置一致 → 界面路径为 `{功能名}/workflow/...` 格式，文件置于 `src/main/jssp/src/{功能名}/workflow/...`
- [ ] `ruleId` / `contentsRuleId` / `cooperationId` 在 **20 个字符以内** → IM-Workflow 的 DB 列为 VARCHAR(20)。以 `rule_${shortName}_${rule.id}` 格式生成，`shortName` 与 `rule.id` 合计过长时会超出限制。由 `validate-workflow.js` 的 `[len]` 检查自动检测。
