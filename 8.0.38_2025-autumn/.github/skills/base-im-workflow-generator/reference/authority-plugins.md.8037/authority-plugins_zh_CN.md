# 权限插件参考

## 概述

IM-Workflow 的权限插件是用于指定处理对象（申请者、审批者、参照者等）的机制。
pluginId 由 `{扩展点ID}.{后缀}` 的形式构成，通过后缀切换指定方式。

## 扩展点列表

扩展点ID因用途而异。后缀部分可以通用。

| 用途 | 扩展点ID |
|------|---------|
| 申请权限 | `jp.co.intra_mart.workflow.plugin.authority.node.apply` |
| 审批权限（静态） | `jp.co.intra_mart.workflow.plugin.authority.node.approve.static` |
| 审批权限（动态） | `jp.co.intra_mart.workflow.plugin.authority.node.approve` |
| 动态审批·横向排列·纵向排列 | `jp.co.intra_mart.workflow.plugin.authority.node.dynamic` |
| 确认权限 | `jp.co.intra_mart.workflow.plugin.authority.node.confirm` |
| 参照者 | `jp.co.intra_mart.workflow.plugin.authority.administrator.flow.handle` |

### 静态审批（B-1）与动态审批（B-2）的使用区分

官方文档：https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/process_target/process_auth/detail_guide_38.html#id8

**直前节点的类型**决定使用哪个扩展点。

**B-1：`approve.static`（静态）** — 直前节点为以下类型时：
- 系统节点、同步开始/结束节点、分支开始/结束节点
- 动态审批节点、横向排列节点、纵向排列节点

**B-2：`approve`（动态）** — 其余情况（申请节点、审批节点等人员节点）

| 扩展点 | 模式 | 直前节点 |
|--------|------|---------|
| `approve.static` | B-1 | Sync_Start/End、Branch_Start/End 等（系统节点） |
| `approve` | B-2 | 申请节点、审批节点等（人员节点） |

## 审批者指示的默认解释规则

当用户模糊地指定审批者时，按以下规则选择插件。

### 判断流程图

```
用户的审批者指示
  │
  ├─ 个人姓名·用户代码 → `.user`（直接指定）
  │
  ├─ 仅组织名（如"财务部"等） → `.department`（直接指定）
  │
  ├─ 仅职位名（如"课长"、"部长"等）
  │    │
  │    └─ 无组织修饰 → `.apply_user_department_and_post`（申请者所属组织+职位）
  │
  ├─ 仅角色名（如"WF管理员"、"WF用户"等）
  │    │
  │    └─ 无组织修饰 → `.role`（直接指定·不按组织限定）
  │
  ├─ 组织+职位（如"销售部的课长"等） → `.department_and_post`（组合指定）
  │
  ├─ 组织+角色（如"销售部的WF负责人"等） → `.department_and_role`（组合指定）
  │
  ├─ 以"申请者的～"开头的修饰
  │    ├─ "上级组织的部长" → `.apply_user_one_step_upper_department_and_post`
  │    ├─ "所有上级组织的部长" → `.apply_user_all_step_upper_department_and_post`
  │    ├─ "下级组织的课长" → `.apply_user_one_step_lower_department_and_post`
  │    ├─ "所属的WF负责人" → `.apply_user_department_and_role`
  │    └─ "上级组织的WF管理员" → `.apply_user_one_step_upper_department_and_role`
  │
  ├─ 以"前一审批者的～"、"前处理者的～"开头的修饰
  │    ├─ "前处理者的课长" → `.before_user_department_and_post`
  │    ├─ "前处理者上级组织的部长" → `.before_user_one_step_upper_department_and_post`
  │    ├─ "前处理者所有上级组织的部长" → `.before_user_all_step_upper_department_and_post`
  │    └─ "前处理者的WF负责人" → `.before_user_department_and_role`
  │
  └─ "申请者本人" → `.apply_user`
```

### 默认选择的依据

**仅指定职位名时，使用 `.apply_user_department_and_post`（动态指定）而非 `.post`（直接指定）的原因：**

- `.post` 不按组织限定，**所有组织中该职位的持有者**均为审批对象
- "请课长审批"这一业务指令，通常意味着"申请者所属组织的课长"
- `.apply_user_department_and_post` 可根据申请者的所属动态决定审批者，具有通用性

**仅指定角色名时，直接使用 `.role`（直接指定）的原因：**

- 角色代表系统管理·功能权限（如 `im_workflow_manager` 等），倾向于不限定在特定组织
- "请WF管理员审批"意为"拥有该权限的某人"，限定在申请者所属组织的意图较弱
- 按组织限定时，若申请者所属组织中没有该角色的人，则存在审批者缺失的风险
- 如需按组织+角色限定，请明确指定组织（如"销售部的WF负责人"）

### 与扩展点的组合（重要）

上述流程图仅决定**后缀部分**。
实际的 pluginId 为 `{扩展点ID}.{后缀}`，扩展点根据**直前节点的类型**进行切换（参阅本文件开头的"静态审批（B-1）与动态审批（B-2）的使用区分"）。

| 直前节点 | 扩展点 | pluginId 示例（后缀 `.apply_user_department_and_post` 时） |
|---------|--------|------|
| 申请·审批等（人员节点） | `approve`（动态） | `...node.approve.apply_user_department_and_post` |
| 分支开始·同步开始等（系统节点） | `approve.static`（静态） | `...node.approve.static.apply_user_department_and_post` |

**后缀的选择（本节）与扩展点的选择（B-1/B-2）是独立判断，必须同时应用两者。**

### XML 输出示例

```xml
<!-- 指定"课长" + 直前为申请节点（人员节点）→ approve（动态） -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- 指定"课长" + 直前为分支开始节点（系统节点）→ approve.static（静态） -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.static.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- 指定"销售部的课长" + 直前为申请节点 → approve（动态） -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department_and_post</pluginId>
<parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string">departmentAndPost</targetType>
<targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</targetCode>
```

**注意：** 动态指定系（`apply_user_*`、`before_user_*`）的 `targetType` / `targetCode` 为空标签。
与直接指定·组合指定的结构不同，请勿混淆。

## 后缀列表

### 直接指定系（在 parameter / targetCode 中指定代码值）

| 后缀 | targetType | parameter / targetCode 格式 | 说明 |
|------|-----------|------|------|
| `.user` | `user` | `{用户代码}` | 直接指定用户 |
| `.department` | `department` | `{公司代码}^{组织集代码}^{组织代码}` | 指定组织 |
| `.post` | `post` | `{公司代码}^{组织集代码}^{职位代码}` | 指定职位 |
| `.role` | `role` | `{角色ID}` | 指定角色 |
| `.public_group` | `publicGroup` | `{组群集代码}^{组群代码}` | 指定公共组群 |
| `.public_group_role` | `publicGroupRole` | `{组群集代码}^{角色代码}` | 指定公共组群中的角色 |

**注意：** targetType 基本为驼峰命名法（`publicGroup`、`publicGroupRole`）。`user`、`department`、`post`、`role` 为纯小写，复合词必须使用驼峰命名法。

### 组合指定系（经实机导出数据验证）

parameter 和 targetCode 值相同。分隔符为竖线 `|`（非插入符 `^`）。

| 后缀 | targetType | parameter / targetCode 格式 | 说明 |
|------|-----------|------|------|
| `.department_and_post` | `departmentAndPost` | `{公司}^{组织集}^{组织}\|{公司}^{组织集}^{职位}` | 组织+职位 |
| `.department_and_role` | `departmentAndRole` | `{公司}^{组织集}^{组织}\|{角色ID}` | 组织+角色 |
| `.public_group_and_public_group_role` | `publicGroupAndPublicGroupRole` | `{组群集}^{组群}\|{组群集}^{角色}` | 公共组群+角色 |
| `.public_group_and_role` | `publicGroupAndRole` | `{组群集}^{组群}\|{角色ID}` | 公共组群+角色 |

**注意：** targetType 为驼峰命名法（`departmentAndPost`、`publicGroupAndRole`）。

```xml
<!-- 示例：组织+职位 -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.department_and_post</pluginId>
<parameter type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string">departmentAndPost</targetType>
<targetCode type="string">comp_sample_01^comp_sample_01^dept_sample_10|comp_sample_01^comp_sample_01^ps003</targetCode>

<!-- 示例：公共组群+角色 -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.public_group_and_role</pluginId>
<parameter type="string">sample_public^public_group_a|im_workflow_user</parameter>
<targetType type="string">publicGroupAndRole</targetType>
<targetCode type="string">sample_public^public_group_a|im_workflow_user</targetCode>
```

### 动态指定系（经实机导出数据验证，共37种模式）

基于申请者或前处理者的所属组织等动态决定审批者。
将 `targetType` / `targetCode` 设为空标签。

**parameter 的规则（由后缀末尾决定）：**

| 后缀末尾 | parameter | 格式 |
|---------|-----------|------|
| 仅 `_department` | 空标签 | `<parameter type="string" />` |
| `_and_post` | `\|{公司代码}^{组织集代码}^{职位代码}` | 前置竖线 `\|` + 职位代码 |
| `_and_role` | `\|{角色ID}` | 前置竖线 `\|` + 角色ID |
| `apply_user`（本人） | 空标签 | `<parameter type="string" />` |

**XML 示例：**

```xml
<!-- 仅组织：parameter 为空标签 -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department</pluginId>
<parameter type="string" />
<targetType type="string" />
<targetCode type="string" />

<!-- 组织+职位：parameter 为 |{公司代码}^{组织集代码}^{职位代码} -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_post</pluginId>
<parameter type="string">|comp_sample_01^comp_sample_01^ps003</parameter>
<targetType type="string" />
<targetCode type="string" />

<!-- 组织+角色：parameter 为 |{角色ID} -->
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.apply_user_department_and_role</pluginId>
<parameter type="string">|im_workflow_user</parameter>
<targetType type="string" />
<targetCode type="string" />
```

#### 申请者系（apply_user_*）

| 后缀 | 说明 | 示例 parameter |
|------|------|-------------|
| `.apply_user` | 申请者本人 | 空标签 |
| `.apply_user_department` | 申请者的所属组织 | 空标签 |
| `.apply_user_department_and_post` | 申请者的所属组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_department_and_role` | 申请者的所属组织+角色 | `\|im_workflow_user` |
| `.apply_user_one_step_upper_department` | 申请者的上级组织 | 空标签 |
| `.apply_user_one_step_upper_department_and_post` | 申请者的上级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_one_step_upper_department_and_role` | 申请者的上级组织+角色 | `\|im_workflow_user` |
| `.apply_user_all_step_upper_department` | 申请者的所有上级组织 | 空标签 |
| `.apply_user_all_step_upper_department_and_post` | 所有上级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_all_step_upper_department_and_role` | 所有上级组织+角色 | `\|im_workflow_user` |
| `.apply_user_one_step_lower_department` | 申请者的下级组织 | 空标签 |
| `.apply_user_one_step_lower_department_and_post` | 申请者的下级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_one_step_lower_department_and_role` | 申请者的下级组织+角色 | `\|im_workflow_user` |
| `.apply_user_all_step_lower_department` | 申请者的所有下级组织 | 空标签 |
| `.apply_user_all_step_lower_department_and_post` | 所有下级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.apply_user_all_step_lower_department_and_role` | 所有下级组织+角色 | `\|im_workflow_user` |

#### 前处理者系（before_user_*）

| 后缀 | 说明 | 示例 parameter |
|------|------|-------------|
| `.before_user_department` | 前处理者的所属组织 | 空标签 |
| `.before_user_department_and_post` | 前处理者的所属组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_department_and_role` | 前处理者的所属组织+角色 | `\|im_workflow_user` |
| `.before_user_one_step_upper_department` | 前处理者的上级组织 | 空标签 |
| `.before_user_one_step_upper_department_and_post` | 前处理者的上级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_one_step_upper_department_and_role` | 前处理者的上级组织+角色 | `\|im_workflow_user` |
| `.before_user_all_step_upper_department` | 前处理者的所有上级组织 | 空标签 |
| `.before_user_all_step_upper_department_and_post` | 所有上级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_all_step_upper_department_and_role` | 所有上级组织+角色 | `\|im_workflow_user` |
| `.before_user_one_step_lower_department` | 前处理者的下级组织 | 空标签 |
| `.before_user_one_step_lower_department_and_post` | 前处理者的下级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_one_step_lower_department_and_role` | 前处理者的下级组织+角色 | `\|im_workflow_user` |
| `.before_user_all_step_lower_department` | 前处理者的所有下级组织 | 空标签 |
| `.before_user_all_step_lower_department_and_post` | 所有下级组织+职位 | `\|comp_sample_01^comp_sample_01^ps003` |
| `.before_user_all_step_lower_department_and_role` | 所有下级组织+角色 | `\|im_workflow_user` |

### 层级指定系（以某组织为起点展开上下级）

层级指定系与动态指定系不同，`targetType` / `targetCode` 有值。
`parameter` 与 `targetCode` 值相同。

| 后缀末尾 | targetType | parameter / targetCode 格式 |
|---------|-----------|------|
| 仅 `_department` | `department` | `{公司代码}^{组织集代码}^{组织代码}` |
| `_and_post` | `departmentAndPost` | `{公司}^{组织集}^{组织}\|{公司}^{组织集}^{职位}` |
| `_and_role` | `departmentAndRole` | `{公司}^{组织集}^{组织}\|{角色ID}` |

**注意：** 层级指定系的分隔符为竖线 `|`（在组织与职位/角色之间，而非在开头）。

| 后缀 | 说明 | 示例 parameter | targetType |
|------|------|-------------|-----------|
| `.department_all_step_upper_department` | 组织+所有上级 | `comp_sample_01^comp_sample_01^dept_sample_11` | `department` |
| `.department_all_step_upper_department_and_post` | 组织+所有上级+职位 | `comp_sample_01^comp_sample_01^dept_sample_11\|comp_sample_01^comp_sample_01^ps003` | `departmentAndPost` |
| `.department_all_step_upper_department_and_role` | 组织+所有上级+角色 | `comp_sample_01^comp_sample_01^dept_sample_11\|im_workflow_user` | `departmentAndRole` |
| `.department_all_step_lower_department` | 组织+所有下级 | `comp_sample_01^comp_sample_01^dept_sample_11` | `department` |
| `.department_all_step_lower_department_and_post` | 组织+所有下级+职位 | `comp_sample_01^comp_sample_01^dept_sample_11\|comp_sample_01^comp_sample_01^ps003` | `departmentAndPost` |
| `.department_all_step_lower_department_and_role` | 组织+所有下级+角色 | `comp_sample_01^comp_sample_01^dept_sample_11\|im_workflow_user` | `departmentAndRole` |

## 示例数据

> ⚠️ **以下所有值均为 intra-mart 标准示例租户 `comp_sample_01` 的数据**。
> 实际项目中使用不同的代码体系（独自的组织代码、职位代码、角色命名等），因此不得将这些值原样用作实际代码。
> 编写 spec.json 时，请务必从以下来源获取实际代码：
>
> 1. **项目规格书·设计书**（最高优先级）
> 2. **MCP `mcp__im_workflow__resolve_authority`** 的解析结果（传入审批者的自然语言描述）
> 3. 无法获取时 → 暂以示例值占位，并**务必明确请求用户确认实际代码**。
>
> 以下表格仅用于**理解结构（分隔符、代码长度、格式）和学习参考**用途。

### 用户

| 用户代码 | 姓名 |
|---------|------|
| `ueda` | 上田辰男 |
| `aoyagi` | 青柳辰巳 |
| `hayashi` | 林政義 |
| `maruyama` | 円山益男 |
| `sekine` | 関根千香 |
| `terada` | 寺田雅彦 |
| `yoshikawa` | 吉川一哉 |
| `ohiso` | 大磯博文 |
| `hagimoto` | 萩本順子 |
| `ikuta` | 生田一哉 |
| `katayama` | 片山聡 |
| `harada` | 原田浩二 |

### 组织

| parameter / targetCode | 说明 |
|----------------------|------|
| `comp_sample_01^comp_sample_01^comp_sample_01` | 示例公司（顶层） |
| `comp_sample_01^comp_sample_01^dept_sample_10` | 示例部门10 |
| `comp_sample_01^comp_sample_01^dept_sample_11` | 示例部门11 |
| `comp_sample_01^comp_sample_01^dept_sample_12` | 示例部门12 |
| `comp_sample_01^comp_sample_01^dept_sample_20` | 示例部门20 |
| `comp_sample_01^comp_sample_01^dept_sample_21` | 示例部门21 |
| `comp_sample_01^comp_sample_01^dept_sample_22` | 示例部门22 |
| `comp_other_01^comp_other_01^comp_other_01` | 其他公司（顶层） |
| `comp_other_01^comp_other_01^dept_other_10` | 其他部门10 |
| `comp_other_01^comp_other_01^dept_other_11` | 其他部门11 |

### 职位

| parameter / targetCode | 说明 |
|----------------------|------|
| `comp_sample_01^comp_sample_01^ps001` | 社长 |
| `comp_sample_01^comp_sample_01^ps002` | 部长 |
| `comp_sample_01^comp_sample_01^ps003` | 课长 |

### 角色

| 角色ID | 说明 |
|--------|------|
| `accel_studio_manager` | Accel Studio 管理员 |
| `account_manager` | 账户管理员 |
| `authz_manager` | 授权管理员 |
| `bis_auditor` | BIS 审计员 |
| `bis_business_manager` | BIS 业务管理员 |
| `bis_manager` | BIS 管理员 |
| `bis_user` | BIS 负责人 |
| `bis_ws_imw_user` | IM-Workflow (IM-BIS) WEB 服务用户 |
| `calendar_manager` | 日历管理员 |
| `file_exc_manager` | FileExchange 管理员 |
| `forma_app_creator` | Forma 应用创建者 |
| `forma_app_manager` | Forma 应用管理员 |
| `forma_ws_imw_user` | IM-Workflow (Forma) WEB 服务用户 |
| `im_knowledge_manager` | Knowledge 组群管理员 |
| `im_knowledge_user` | Knowledge 内容使用者 |
| `im_master_manager` | IM-共通主数据 管理员（主数据管理员） |
| `im_master_operator` | IM-共通主数据 运营管理员 |
| `im_workflow_auditor` | IM-Workflow 审计员 |
| `im_workflow_manager` | IM-Workflow 管理员（主数据管理员） |
| `im_workflow_operator` | IM-Workflow 运营管理员 |
| `im_workflow_user` | IM-Workflow 用户 |
| `imbm_manager` | IM-BloomMaker 管理员 |
| `imld_manager` | LogicDesigner 管理员 |
| `imprtl_manager` | 门户（低代码版）门户管理员 |
| `imprtl_prlt_manager` | 门户（低代码版）Portlet 管理员 |
| `imr_log_manager` | IM-Repository 日志管理员 |
| `imr_manager` | IM-Repository 管理员 |
| `job_sche_manager` | 作业调度管理员 |
| `menu_manager` | 菜单管理员 |
| `menu_operator` | 菜单运营管理员 |
| `portal_manager` | 门户管理员 |
| `role_manager` | 角色管理员 |
| `tablemainte_manager` | TableMaintenance 管理员 |
| `tenant_manager` | 租户管理员 |
| `ticket_manager` | 工单管理员 |
| `viewcreator_manager` | ViewCreator 管理员 |

### 公共组群

| parameter / targetCode | 说明 |
|----------------------|------|
| `sample_public^sample_public` | 示例公共组群（顶层） |
| `sample_public^public_group_a` | 公共组群A |
| `sample_public^public_group_b` | 公共组群B |
| `sample_public^public_group_c` | 公共组群C |
| `sample_public^public_group_d` | 公共组群D |
| `sample_public^public_team_a` | 团队A |
| `sample_public^public_team_b` | 团队B |

### 角色（公共组群角色）

无示例数据。

---

## 逻辑流程指定系（IM-LogicDesigner 集成）（已通过实机导出数据验证）

通过执行 IM-LogicDesigner 的逻辑流程来动态决定处理对象者的方式。
可以在流程中实现 DB 查询、外部 API 调用等复杂逻辑。

### 后缀

| 后缀 | targetType | parameter / targetCode 格式 | 说明 |
|------|-----------|------|------|
| `.logic_flow_user` | `logic_flow_user` | `{"flowId" : "<フローID>", "version" : null, "versionDecide" : false}` | 通过 IM-LogicDesigner 流程决定处理对象者 |

- `parameter` 和 `targetCode` 始终是**相同的 JSON 字符串**
- `version`：`null` = 使用最新版本。指定整数则使用固定版本
- `versionDecide`：`false` = 自动决定版本（最新）。`true` = 使用 `version` 字段的值

### 可用扩展点（已通过实机验证）

| 扩展点 | pluginId |
|--------|---------|
| `node.approve`（审批权限・动态） | `...node.approve.logic_flow_user` |
| `node.confirm`（确认权限） | `...node.confirm.logic_flow_user` |
| `administrator.flow.handle`（参照者） | `...administrator.flow.handle.logic_flow_user` |

> ⚠️ `node.apply`（申请权限）和 `node.approve.static`（静态审批权限）的 `.logic_flow_user` 在实机数据中未经确认。

### XML 示例

```xml
<!-- 审批权限（动态）：前一节点为人工节点（如申请节点）-->
<extensionPointId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve</extensionPointId>
<pluginId type="string">jp.co.intra_mart.workflow.plugin.authority.node.approve.logic_flow_user</pluginId>
<parameter type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</parameter>
<targetType type="string">logic_flow_user</targetType>
<targetCode type="string">{"flowId" : "my_authority_flow", "version" : null, "versionDecide" : false}</targetCode>
```

### 流程定义的创建

有关创建步骤和 spec.json 模板，请参考 `.github/skills/jssp-im-workflow-usage/assets/logic-flow-authority-plugin.md`。

**输出（必须）**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `userCds` | string[]（数组） | 处理对象者用户代码数组。返回 `null` 表示无权限者（不展开） |
