# 参数类字段一览（JavaEE 开发模型）

基于 intra-mart Accel Platform（IM-Workflow）的平台 API 实际类定义（`im_workflow_core`）。**请勿凭记忆或猜测添加字段/方法。** 如需本文档未记载的字段，请先用 dev-knowledge（源代码搜索 MCP）确认相应类后再使用。

各字段通过 `getXxx()` / `setXxx()` 的 Getter/Setter 访问（字段本身为 `private`）。

---

## `ActionProcessParameter`

包：`jp.co.intra_mart.foundation.workflow.plugin.process.action`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| actFlag | String | 代理标志（0：本人处理 / 1：代理处理） |
| applyBaseDate | String | 申请基准日（`yyyy/MM/dd`） |
| authCompanyCode | String | 权限公司代码 |
| authOrgzCode | String | 权限组织代码 |
| authOrgzSetCode | String | 权限组织集代码 |
| authUserCd | String | 处理权限者代码 |
| contentsId | String | 内容ID |
| contentsVersionId | String | 内容版本ID |
| execUserCd | String | 处理执行者代码 |
| flowId | String | 流程ID |
| flowVersionId | String | 流程版本ID |
| localeId | String | 区域设置ID |
| loginGroupId | String | 登录组ID（与租户ID相同） |
| matterName | String | 案件名称 |
| matterNumber | String | 案件编号 |
| nodeId | String | 节点ID |
| nextNodeIds | String[] | 移动目标（下一节点）节点ID（在退回、撤回、案件操作时设置） |
| parameter | String | 参数（保存已注册实现类的 FQCN。业务逻辑通常不引用） |
| priorityLevel | String | 优先级 |
| processComment | String | 处理注释 |
| processDate | String | 处理日（`yyyy/MM/dd`） |
| resultStatus | String | 处理结果状态 |
| routeId | String | 路由ID |
| routeVersionId | String | 路由版本ID |
| systemMatterId | String | 系统案件ID |
| targetLocales | String[] | 目标区域设置ID |
| userDataId | String | 用户数据ID |
| lumpProcessFlag | String | 批量审批标志（0：一般审批 / 1：批量审批） |
| autoProcessFlag | String | 自动处理标志（0：一般处理 / 1：自动处理） |
| DCNodeConfigModels | DynamicAndCnfmNodeConfigModel[] | 动态・确认节点配置信息 |
| HVNodeConfigModels | HorizontalAndVerticalNodeConfigModel[] | 横向配置・纵向配置节点配置信息 |
| branchSelectModels | BranchSelectModel[] | 分支目标选择信息 |

## `ArriveProcessParameter`

包：`jp.co.intra_mart.foundation.workflow.plugin.process.arrive`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| actFlag | String | 代理标志 |
| applyBaseDate | String | 申请基准日 |
| contentsId / contentsVersionId | String | 内容ID／版本ID |
| flowId / flowVersionId | String | 流程ID／版本ID |
| localeId | String | 区域设置ID |
| loginGroupId | String | 登录组ID |
| matterName | String | 案件名称 |
| matterNumber | String | 案件编号 |
| nodeId | String | 到达节点ID |
| parameter | String | 参数 |
| preNodeAuthCompanyCode | String | 前一节点处理权限公司代码 |
| preNodeAuthOrgzCode | String | 前一节点处理权限组织代码 |
| preNodeAuthOrgzSetCode | String | 前一节点处理权限组织集代码 |
| preNodeAuthUserCd | String | 前一节点处理权限者代码 |
| preNodeExecUserCd | String | 前一节点处理执行者代码 |
| preNodeId | String | 前一节点ID |
| preNodeProcessComment | String | 前一节点处理注释 |

（可能还存在与到达前状态相关的其他字段。若需要以上未列出的字段，请用 dev-knowledge 确认 `ArriveProcessParameter`。）

## `MatterStartProcessParameter`

包：`jp.co.intra_mart.foundation.workflow.plugin.process.matter_start`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| applyBaseDate | String | 申请基准日 |
| contentsId / contentsVersionId | String | 内容ID／版本ID |
| flowId / flowVersionId | String | 流程ID／版本ID |
| localeId | String | 区域设置ID |
| loginGroupId | String | 登录组ID |
| parameter | String | 参数 |
| processDate | String | 处理日 |
| routeId | String | 路由ID |
| routeVersionId | String | （字段一览后续部分请用 dev-knowledge 确认 `MatterStartProcessParameter`。以上仅为开头部分的摘录） |
| systemMatterId | String | 系统案件ID |
| targetLocales | String[] | 目标区域设置ID |
| userDataId | String | 用户数据ID |

## `MatterEndProcessParameter`

包：`jp.co.intra_mart.foundation.workflow.plugin.process.matter_end`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| actFlag | String | 代理标志 |
| applyBaseDate | String | 申请基准日 |
| contentsId / contentsVersionId | String | 内容ID／版本ID |
| flowId / flowVersionId | String | 流程ID／版本ID |
| lastAuthUserCd | String | 最终处理权限者代码 |
| lastExecUserCd | String | 最终处理执行者代码 |
| lastProcessNodeId | String | 最终处理节点ID |
| lastResultStatus | String | 最终处理结果状态 |
| localeId | String | 区域设置ID |
| loginGroupId | String | 登录组ID |
| parameter | String | 参数 |
| processDate | String | 处理日 |
| mailIds | String[] | 邮件模板ID数组 |
| imBoxIds | String[] | IMBox模板ID数组 |
| mailReplaceMap | Map\<MailReplaceId, String\> | 邮件替换字符串信息 |
| imBoxReplaceMap | Map\<ImBoxReplaceId, String\> | IMBox替换字符串信息 |

（可能还存在消息相关字段（`messageIds` 等）。如需详情，请用 dev-knowledge 确认 `MatterEndProcessParameter`。）

## `RuleConditionParameter`

包：`jp.co.intra_mart.foundation.workflow.plugin.rule.condition`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| applyBaseDate | String | 申请基准日 |
| contentsId / contentsVersionId | String | 内容ID／版本ID |
| flowId / flowVersionId | String | 流程ID／版本ID |
| localeId | String | 区域设置ID |
| loginGroupId | String | 登录组ID |
| nodeId | String | 分支/合并节点ID |
| parameter | String | 参数 |
| processDate | String | 到达日 |
| routeId / routeVersionId | String | 路由ID／版本ID |
| systemMatterId | String | 系统案件ID |
| targetLocales | String[] | 目标区域设置ID |
| userDataId | String | 用户数据ID |

## `WorkflowAuthorityParameter`（处理对象者插件用）

包：`jp.co.intra_mart.foundation.workflow.listener.param`（继承 `WorkflowParameter`）

继承自 `WorkflowParameter` 的字段：

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| localeId | String | 区域设置ID |
| loginGroupId | String | 登录组ID |
| applyBaseDate | String | 申请基准日 |
| parameter | String | 参数 |
| targetLocales | String[] | 目标区域设置ID |

`WorkflowAuthorityParameter` 特有的字段：

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| targetCodes | String[] | 对象代码列表（通过撤回、退回、案件操作导致的节点移动到达该节点时，会设置最后处理该节点的用户代码。可能为 `null`） |

## `WorkflowMatterParameter`（处理对象者插件用・案件信息）

包：`jp.co.intra_mart.foundation.workflow.listener.param`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |
| contentsId / contentsVersionId | String | 内容ID／版本ID |
| routeId / routeVersionId | String | 路由ID／版本ID |
| flowId / flowVersionId | String | 流程ID／版本ID |
| nodeId | String | 节点ID |

## `UserDataModel`（处理对象者插件的返回值元素）

包：`jp.co.intra_mart.foundation.workflow.plugin.authority.im_master.model`

| 字段 | 类型 | 说明 |
|-----------|-----|------|
| localeId | String | 处理对象者的区域设置ID |
| userCode | String | 处理对象者的用户代码 |
| userName | String | 处理对象者的用户名 |
| userOrgzModels | OrgzDataModel[] | 处理对象者的所属组织信息（成为负责组织的选项） |

`OrgzDataModel` 保存公司名称、组织名称、公司代码、组织集代码、组织代码（与 JSSP 版 `userOrgzModels` 结构相同）。如需详细字段，请用 dev-knowledge 确认 `OrgzDataModel`。

---

## 案件删除监听器・案件归档监听器的参数

不使用 `Parameter` 对象，而是以各个 `String` 参数传递（参见 [assets/matter-delete-listener.md](../assets/matter-delete-listener.md) / [assets/matter-archive-listener.md](../assets/matter-archive-listener.md)）。

**未完成案件删除・已完成案件删除・案件归档处理的共通参数（4个）：**

| 参数名 | 类型 | 说明 |
|--------|-----|------|
| loginGroupId | String | 登录组ID |
| localeId | String | 区域设置ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |

**仅历史案件删除（`IWorkflowArcMatterDeleteListener`）不同（5个参数）：**

| 参数名 | 类型 | 说明 |
|--------|-----|------|
| loginGroupId | String | 登录组ID |
| localeId | String | 区域设置ID |
| systemMatterId | String | 系统案件ID |
| userDataId | String | 用户数据ID |
| archiveMonth | String | 归档年月（`yyyyMM` 格式）。历史案件按年月分表保存，因此需要此参数来确定删除对象 |

**注意：** 与其余两种（未完成/已完成）不同，历史案件删除监听器的末尾追加了 `archiveMonth`。若按4个参数实现，即使加了 `@Override` 也会因抽象方法未实现而导致编译错误。详情请参阅 [assets/matter-delete-listener.md](../assets/matter-delete-listener.md)。
