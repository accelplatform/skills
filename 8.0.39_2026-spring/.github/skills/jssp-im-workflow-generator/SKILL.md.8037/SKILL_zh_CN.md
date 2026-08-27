---
name: jssp-im-workflow-generator
description: 新建 IM-Workflow 导入用 XML 定义文件。根据提示指示（工作流名称、路线模式、审批节点构成）生成包含 contents/route/flow 段的导入 XML。当提及"生成工作流定义"、"创建 WF 导入 XML"、"工作流定义文件"时使用。工作流程序（动作处理、画面）请使用 jssp-im-workflow-usage。
allowed-tools: Bash, Read, Write, Glob, mcp__im_workflow__list_authority_plugins
---

# IM-Workflow 导入 XML 生成技能

## 目的

根据提示指示从零生成 IM-Workflow 导入用 XML 定义文件。
生成的 XML 可通过 IM-Workflow 管理画面的导入功能导入。

## 需参照的规约

本技能仅生成 **XML 定义文件**（`.xml`），不实现 `.js` / `.html`（实现由 `jssp-im-workflow-usage` 负责）。因此需参照的规约最少化。全局视图请参阅 `.github/instructions/README.md`。

| 规约 | 处理方式 |
|------|---------|
| `jssp-file-structure.md` | 🟢 必读 — XML 的输出位置（`src/main/storage/public/im_workflow/`） |
| `jssp-naming.md` | 🟢 必读 — workflowName / shortName 等命名 |
| `jssp-function-container.md` / `jssp-presentation-page.md` / `jssp-code-style.md` 等 | 🔴 **本技能单独不需要**（仅 XML 生成。`.js` / `.html` 的实现由 `jssp-im-workflow-usage` 负责） |
| `jssp-2way-sql.md` / `jssp-accessibility.md` / `jssp-logging.md` 等 | 🔴 **本技能单独不需要** |

## 生成对象

- **contents**（内容定义）— 画面路径（申请/审批/确认/详情等 8 种）+ 规则关联
- **route**（路线定义）— 节点构成（Start/Apply/Approve/Branch/End 等）与连接
- **flow**（流程定义）— 内容与路线的关联、流程设置
- **matter_property**（案件属性）— 业务数据项目（金额等，用于分支条件）
- **rule**（分支规则）— 基于案件属性的条件判断规则

## 支持的路线模式

| 模式 | 模板 | 说明 |
|------|------|------|
| 直线路线 | `assets/template-straight.md` | Start → Apply → Approve（N个）→ End |
| 分支路线 | `assets/template-branch.md` | 条件分支（Branch_Start / Branch_End） |
| 同步路线 | `assets/template-sync.md` | 并行处理·等待所有路径完成（Sync_Start / Sync_End） |
| 横向路线 | `assets/template-parallel.md` | 顺序审批（nodeTyp_Horizontal）— 按顺序逐一处理 |
| 纵向路线 | `assets/template-vertical.md` | 并行审批（nodeTyp_Vertical）— 同时到达所有人，顺序不限 |

### 多名审批者顺序不限时的节点选择

当多名审批者**顺序不限**（任一人先均可）且**需要全员审批**时，使用**同步节点（Sync_Start / Sync_End）**或**纵向节点（nodeTyp_Vertical）**。
横向节点（nodeTyp_Horizontal）为顺序处理，不得使用。

| 节点类型 | 用途 | 审批者指定方法 |
|---------|------|--------------|
| 同步节点 | 各审批者分别配置为独立 Approve 节点的并行路径。等待所有路径完成 | 在路线定义时静态指定审批者（推荐） |
| 纵向节点 | 在一个节点内动态配置多名审批者。同时到达所有人，顺序不限地审批 | 在流程设置中设定审批者数量 |
| ~~横向节点~~ | ~~顺序审批（按顺序逐一处理）~~ | **不适用于顺序不限的审批。不得使用** |

### 动态审批流（条件性多段审批）的选择指引

按案件数据条件动态增减审批者的多段审批，默认使用 **`matterProperties` + `rules` + `branch_start` 节点（分支路线）**。判断流程、典型示例（采购价格 10 万日元以上时追加部门经理审批）以及与其他实现方式（案件开始处理 / 自定义插件）的取舍，请参见 [reference/dynamic-approval-flow.md](reference/dynamic-approval-flow.md)。

## 文件结构

```
jssp-im-workflow-generator/
├── SKILL.md
├── scripts/
│   ├── build-workflow.js          # spec.json → 导入 XML 生成器（UTF-16LE 输出）
│   ├── validate-workflow.js       # 生成 XML 的验证器
│   ├── validate-xml-encoding.js   # UTF-16LE 编码验证·修复
│   └── validate-xsd.js            # XSD 结构验证
├── reference/
│   ├── xml-structure.md        # XML 整体结构·类型属性·版本规则·语言区域
│   ├── node-types.md           # 节点类型·AttributeType·AttributeKey 规格
│   ├── authority-plugins.md    # 权限插件规格（后缀·targetType）
│   ├── default-notification.md # 通知模板规格
│   ├── validate-xml-encoding.md # UTF-16LE 编码验证脚本
│   ├── validate-xsd.md         # XSD 结构验证步骤
│   ├── import-xml-checklist.md # 自检清单
│   └── im_workflow-import.xsd  # XSD Schema
├── mcp-spec/                   # MCP 端点规格
│   ├── endpoints.md            # MCP 端点规格（处理对象人插件）
│   └── schemas/
│       └── mcp__im_workflow__list_authority_plugins.response.json
├── examples/
│   ├── straight.spec.json    # 直线路线 spec 示例
│   └── branch.spec.json      # 嵌套分支路线 spec 示例
└── assets/
    ├── sample-complete-branch.md # 完整版 XML 示例（结构参考用）
    ├── template-straight.md      # 直线路线 spec 设计参考
    ├── template-branch.md        # 分支路线 spec 设计参考
    ├── template-sync.md          # 同步路线 spec 设计参考
    ├── template-parallel.md      # 横向路线 spec 设计参考
    └── template-vertical.md      # 纵向路线 spec 设计参考
```

## 使用时机

用户提出以下需求时：
- "创建工作流定义"
- "生成工作流导入数据（XML）"
- "创建 WF 导入文件"
- "用 XML 定义申请→审批流程"

## 生成步骤

### 1. 需求确认

从用户处确认以下信息：

| 项目 | 必须 | 示例 |
|------|------|------|
| 工作流名称（英文 ID） | YES | `purchase`, `expense` |
| 流程名称（日文） | YES | `购买申请`, `费用申请` |
| 流程名称（英文） | YES | `Purchase Request` |
| 路线模式 | YES | 直线 / 分支 / 同步 / 横向 / 纵向 |
| 审批节点构成 | YES | 科长→部长 / 含条件分支（参见下方"审批者解释规则"） |
| 画面路径基础 | YES | `sample/purchase/workflow` |

### 审批者解释规则（权限插件选择）

用户指定审批者时，根据**指示的具体程度**选择使用的权限插件。
详情参见 `reference/authority-plugins.md` 的"审批者指示默认解释规则"章节。

| 用户指示示例 | 解释 | 后缀 |
|------------|------|------|
| "科长"、"部长"（仅职位名） | 申请者所属组织＋职位 | `.apply_user_department_and_post` |
| "销售部科长"（组织＋职位） | 特定组织＋职位 | `.department_and_post` |
| "申请者上级组织的部长" | 申请者上级组织＋职位 | `.apply_user_one_step_upper_department_and_post` |
| "前一审批者的部长" | 前处理者所属组织＋职位 | `.before_user_department_and_post` |
| "WF管理员"（仅角色名） | 直接指定角色（不按组织筛选） | `.role` |
| "销售部WF负责人"（组织＋角色） | 特定组织＋角色 | `.department_and_role` |
| "田中先生"（个人名） | 直接指定用户 | `.user` |
| "财务部"（仅组织名） | 指定组织 | `.department` |
| "通过 IM-LogicDesigner 获取"、"按流程 ID 动态决定" | IM-LogicDesigner 流程联动 | `.logic_flow_user` |

**重要：**
- **apply 节点**（申请权限）使用 `.role`（例：`im_workflow_user`）。动态 `apply_user_*` 系列插件不能用于 apply 扩展点。
- 仅职位名的指示（"科长"、"部长"等）不得使用 `.post`（直接指定）。`.post` 的目标为所有组织中该职位的人员，可能与业务意图不符。默认使用 **`.apply_user_department_and_post`**（申请者所属组织＋职位）。
- 仅角色名的指示（"WF管理员"等）使用 `.role`（直接指定）。角色具有系统管理·功能权限的性质，按组织筛选可能导致无审批者。
- 以上为后缀选择规则。扩展点（`approve` vs `approve.static`）由前置节点类型另行决定。前置为人员节点 → `approve.{后缀}`，前置为系统节点 → `approve.static.{后缀}`。必须同时应用两项判断。
- 不符合上述任何情况的指示（例："2026/10/01之后入职的用户"等自定义条件），使用 `mcp__im_workflow__list_authority_plugins` 进行关键字搜索，查找自定义插件。详见 [mcp-spec/endpoints.md](mcp-spec/endpoints.md)。
- 使用 **`.logic_flow_user`** 时，`targetCode` 可以以 JSON 对象形式传入，`build-workflow.js` 会自动转换为 JSON 字符串。`targetType` 也无需显式指定（自动推断为 `logic_flow_user`）。
  ```jsonc
  // approve / confirm 节点使用 IM-LogicDesigner 流程联动
  { "id": "01", "type": "approve", "name": "Approver",
    "plugin": { "suffix": "logic_flow_user",
                "targetCode": { "flowId": "my_authority_flow", "version": null, "versionDecide": false } } }
  ```

#### `targetCode` 的取值获取方法

上述例子中出现的 `ps003`、`comp_sample_01^comp_sample_01^ps003` 等值，均为 intra-mart 标准示例租户（`comp_sample_01`）的值，**实际项目中使用不同的代码体系**。请按以下优先级确认实际代码：

1. **项目规格书／设计书**中明确记载时 → 使用其中的代码（最高优先级）。
2. 使用 **`mcp__im_workflow__list_authority_plugins`** 定位插件，参考 `parameterHint` 向用户确认所需代码值。
3. 以上均无法获得时 → 暂以示例值占位，并**务必明确请求用户确认实际代码**（不得将示例值原样交付）。

职位代码·组织代码·角色 ID 等的示例一览参见 `reference/authority-plugins.md` 的「示例数据」章节（**仅用于学习参考**，不得作为实际代码原样转写）。

### 2. 组装 spec.json

根据需求确认结果创建 spec.json。编码代理只编写此 spec。
示例：[examples/straight.spec.json](examples/straight.spec.json)（直线）、[examples/branch.spec.json](examples/branch.spec.json)（嵌套分支）
XML 结构（3语言区域展开·2版本·插件双重注册等）由 `build-workflow.js` 自动生成。

```jsonc
{
  "workflowName": "purchase_request",         // 英文 ID（snake_case）
  "shortName": "pur_req",                     // 插件 ID 用短名称
  "names": {
    "en": "Purchase Request",
    "ja": "購買申請",
    "zh_CN": "采购申请"
  },
  "screenBasePath": "purchase/workflow",       // 画面路径基础（用于默认路径生成）
  "screens": {                                 // 个别画面路径指定（省略时从 screenBasePath 自动生成）
    "apply": "purchase/workflow/apply/index",   //   申请画面（pageType=0）
    "tempSave": null,                          //   临时保存画面（pageType=1, null=与申请画面共用）
    "applyTask": null,                         //   申请任务画面（pageType=2）
    "reapply": "purchase/workflow/apply/index", //   再申请画面（pageType=3, 可与申请画面共用）
    "process": "purchase/workflow/approve/index", // 处理画面（pageType=4）
    "confirm": null,                           //   确认画面（pageType=5）
    "processDetail": "purchase/workflow/detail/index", // 处理详情画面（pageType=6）
    "referDetail": "purchase/workflow/detail/index"    // 参照详情画面（pageType=7, 可与处理详情共用）
  },
  "pattern": "straight",                       // straight / branch / sync / horizontal / vertical
  "generationDate": "2026/04/10",             // 版本切换日期

  "nodes": [
    { "id": "start",  "type": "start" },
    { "id": "apply",  "type": "apply",   "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps003" } },
    { "id": "01",     "type": "approve", "name": "Manager",  "plugin": { "suffix": "apply_user_department_and_post", "targetCode": "ps002" } },
    { "id": "02",     "type": "approve", "name": "Director", "plugin": { "suffix": "role", "targetCode": "im_workflow_user" } },
    { "id": "end",    "type": "end" }
  ],

  // straight 时 edges 可省略（按 nodes 顺序自动连接）
  // branch/sync 时需明确指定：
  "edges": [
    { "from": "start", "to": "apply" },
    { "from": "apply", "to": "01" }
  ],

  // 仅分支模式时：
  "matterProperties": [
    { "key": "unitPrice", "type": "numeric", "names": { "en": "Unit Price", "ja": "単価", "zh_CN": "单价" } }
  ],
  // 单条件（旧格式·向后兼容）
  "rules": [
    { "id": "01", "property": "unitPrice", "operator": "<", "value": "20000",
      "names": { "en": "UnitPrice less than 20000", "ja": "単価20000未満", "zh_CN": "单价不足20000" } }
  ]

  // 多条件（新格式）：AND / OR 均可指定
  // "rules": [
  //   {
  //     "id": "02",
  //     "unionCondition": "and",   // "and"（省略时默认）或 "or"
  //     "conditions": [
  //       { "property": "amount",     "operator": ">=", "value": "20000" },
  //       { "property": "item_total", "operator": ">=", "value": "100000" }
  //     ],
  //     "names": { "en": "...", "ja": "金額20000以上 かつ 合計金額100000以上", "zh_CN": "..." }
  //   }
  // ]
}
```

**画面路径（screens）指定规则：**
- `screens` 中个别指定的画面路径优先。省略的键从 `screenBasePath` 自动生成。
- **画面文件的标准命名为 `{功能名}/{画面类型}/index.js` + `index.html`**。不使用 `apply/apply` 这样的冗余路径。
- 申请画面与再申请画面共用同一画面时，两者指定相同路径（例：`"apply": "leave/apply/index", "reapply": "leave/apply/index"`）。
- 处理详情画面与参照详情画面同样可共用。
- **省略 `screens` 时的默认路径**：`{screenBasePath}/apply/index`、`{screenBasePath}/process/index` 等。

**节点名称（name）的语言：**
- `nodeName` 无法多语言化。**在所有语言区域使用相同的英文名**。
- 节点名称为一般用户可见的地方，无论提示语言如何，建议统一使用英文。

**节点 type 一览：**

| type | nodeType | 说明 |
|------|----------|------|
| `start` | nodeTyp_Start | 开始 |
| `end` | nodeTyp_End | 结束 |
| `apply` | nodeTyp_Apply | 申请 |
| `approve` | nodeTyp_Approve | 审批 |
| `confirm` | nodeTyp_Confirm | 确认（仅查看・无审批权限）。**作为独立于主流程的终端枝**挂接在审批节点等上。直线路线（straight）中若在 nodes 中排列，会被自动连接到下一节点并导致校验器报错，因此**必须显式指定 edges，仅编写指向确认节点的入边，且不写确认节点的出边**。 |
| `branch_start` | nodeTyp_Branch_Start | 分支开始 |
| `branch_end` | nodeTyp_Branch_End | 分支结束 |
| `sync_start` | nodeTyp_Sync_Start | 同步开始 |
| `sync_end` | nodeTyp_Sync_End | 同步结束 |
| `horizontal` | nodeTyp_Horizontal | 横向（顺序审批） |
| `vertical` | nodeTyp_Vertical | 纵向（并行审批） |

**节点动作处理（actionProcess）：**

在 apply/approve 节点的 `actionProcess` 字段中指定动作处理脚本路径。
**未指定 `actionProcess` 的节点不会注册动作处理插件。**

```jsonc
{
  "id": "apply", "type": "apply",
  "actionProcess": "leave/action/ActionProcess1"  // 动作处理脚本路径
},
{
  "id": "01", "type": "approve", "name": "Manager"
  // 未指定 actionProcess → 无动作处理（插件未注册）
},
{
  "id": "02", "type": "approve", "name": "HR",
  "actionProcess": "leave/action/ActionProcess2"  // 审批完成时扣减剩余天数
}
```

注意：
- 路径中不含 `.js` 扩展名（IM-Workflow 自动补全）
- 不需要动作处理的节点不要指定 `actionProcess`（指定后会因引用不存在的文件而出错）

**案件终了处理（matterEndProcess）：**

在 spec 顶层的 `matterEndProcess` 字段中指定案件终了处理的脚本路径。
指定后，案件终了处理插件将自动注册到内容定义的 `plugins` 中。

```jsonc
{
  "workflowName": "leave_request",
  // ...
  "matterEndProcess": "leave/action/MatterEndProcess",  // 案件终了处理脚本路径（无扩展名）
  "matterEndProcessNoTransaction": false  // true 时使用无事务版本（省略时：false）
}
```

| 字段 | 必须 | 默认值 | 说明 |
|------|------|--------|------|
| `matterEndProcess` | No | 无 | 案件终了处理脚本路径（无扩展名）。省略时不注册插件 |
| `matterEndProcessNoTransaction` | No | `false` | `true` 时使用无事务版扩展点 |

- 有事务：`jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process`
- 无事务：`jp.co.intra_mart.workflow.plugin.event.flow.matter.end.process.no.transaction`

**分支节点（branch_start）的附加字段：**

```jsonc
{
  "id": "brs1", "type": "branch_start", "name": "Start branch",
  "branchMethod": "rule",    // "rule" | "user_select" | "program"
  "paths": [
    { "condition": { "ruleId": "01", "property": "unitPrice", "operator": "<", "value": "20000" },
      "nodes": ["prs1"] },   // 此路径的首个节点 ID
    { "condition": { "ruleId": "02", ... },
      "nodes": ["dir"] }
  ]
}
```

**流程功能设置（flowSettings）：**

通过 spec 的 `flowSettings` 对象控制 IM-Workflow 流程定义的功能设置。
省略时使用默认值。

```jsonc
{
  "flowSettings": {
    "lumpProcess": true,            // 批量处理功能（默认：true）
    "attachFile": false,            // 附件（默认：true）
    "confirmUserSetup": false,      // 确认者设置（默认：false）
    "completedMatterConfirm": true, // 已完成案件的确认（默认：false）
    "autoProcess": false,           // 自动处理（默认：false）
    "autoProcessLimitDay": null,    // 自动处理期限天数
    "autoProcessLimitType": null,   // 期限后处理类型：0=审批/1=否决/2=退回（autoProcess=true 时默认：0）
    "autoPress": false,             // 自动催促（默认：false）
    "autoPressLimitDay": null,      // 自动催促期限天数
    "asyncProcess": false,          // 异步处理（默认：false）
    "sysDateTargetExpand": false,   // 对象者展开日：true=处理日/false=案件开始日（默认：false）
    "calendarId": null              // 日历 ID（默认：null=标准日历）
  }
}
```

**注意：** 以下设置超出导入 XML 的范围，需在管理画面手动设置：
- 防止申请者自我审批（`applyUserApprovePreventFlag`）
- 案件操作权限者（`handleUsers` 输出为空数组）
- 标准组织（`defaultOrgzs` 输出为空数组）

### 3. 执行 build-workflow.js

```bash
node .github/skills/jssp-im-workflow-generator/scripts/build-workflow.js \
     /tmp/<workflowName>.spec.json
```

省略 `--out` 时输出至 `src/main/storage/public/im_workflow/im_workflow-<workflowName>-import.xml`。

build-workflow.js 自动执行的内容：
- 3语言区域（en/ja/zh_CN）× 2版本（blank + active）的全量展开
- 8种页面类型的多语言页面名生成
- 节点 ID 组装（`<shortName>_<id>`）
- 节点间连接解析（straight 自动，其他从 edges）
- 自动判断 `extensionPointId`（根据前置节点类型切换 approve / approve.static）
- 插件双重注册（节点内 + 路线级别）
- 坐标计算
- 分支节点的 flowDetails / flowUnions / flowAttributes 生成
- UTF-16LE（带 BOM）转换

### 4. 使用 validate-workflow.js 验证

```bash
node .github/skills/jssp-im-workflow-generator/scripts/validate-workflow.js \
     <输出的 .xml>
```

验证项目：
- 带 BOM 的 UTF-16LE 编码
- XML 声明 + `<data>` 根节点
- contents / route / flow 段的存在
- 3语言区域展开
- 2版本（blank + active）
- 路线节点连接一致性（prev/next 引用目标的存在）
- 插件双重注册
- 流程定义节点中不包含 Start/End
- 分支规则引用一致性
- 页面类型 0-7 的存在
- nodeName 在所有语言区域中相同

### 5. XSD 验证（可选）

按照 `reference/validate-xsd.md` 的步骤，使用 `reference/im_workflow-import.xsd` 进行结构验证。

## 注意事项

- **生成时的注意事项和常见错误已在 `reference/import-xml-checklist.md` 中整理为清单。** 生成 XML 后必须确认所有项目。
- **输出位置不得从 `src/main/storage/public/im_workflow/` 变更。** 该目录是 IM-Workflow 导入资源的固定存放位置，若通过 `--out` 输出到其他位置（如 `spec/` 等），则不会被租户环境设置（Importer / `jssp-tenant-setup-generator` 的集成处理）引用并导入。
- 本技能专用于工作流**定义文件**的生成。工作流集成**程序**（动作处理·申请画面·审批画面）请使用 `jssp-im-workflow-usage` 技能。

## 与其他技能的边界·一致性职责

XML 中引用的 `scriptPath`（画面路径）与 `jssp-im-workflow-usage` 生成的实际文件位置**必须在两个技能间保持一致**。职责范围如下：

| 职责 | 负责技能 |
|------|----------|
| 通过 spec.json 的 `screens` 决定各 pageType 的画面路径 | **本技能（generator）** |
| XML 内 `<scriptPath>` 的输出 | **本技能（generator）** |
| 在上述路径放置对应的 `.js` / `.html` 实体文件 | `jssp-im-workflow-usage` |
| 验证路径一致性（XML 引用的 JS 是否存在） | `jssp-im-workflow-usage/scripts/validate-workflow-code.js` 的 `WF-XML-001` |

### pageType 与 usage 惯例目录的对应表

`spec.json` 中省略 `screens` 时的默认行为，与 `jssp-im-workflow-usage` 的惯例目录名以及 IM-Workflow 的一般业务模式相一致。**新项目原则上可以省略 `screens`**。

| pageType | 键 | 默认行为 | 用途 |
|---|---|---|---|
| 0 | `apply` | 生成 `apply/index` | 申请画面（**必需**） |
| 1 | `tempSave` | **与 `apply` 共用**（同一申请画面兼作临时保存） | 临时保存画面。仅在需要专用画面时显式指定路径。可通过 `false` 省略 |
| 2 | `applyTask` | **默认省略**（不输出到 XML） | 申请（起票案件）画面。仅用于月报、期初目标设定等通过作业自动起票的定期申请模式。仅在显式指定路径时输出（与 `reapply` 相同，如需与申请画面 `apply` 共用，指定相同路径） |
| 3 | `reapply` | **与 `apply` 共用**（同一路径）作为默认输出 | 再申请画面。即使无退回操作，也需要支持申请人的「引回」操作 |
| 4 | `process` | 生成 **`approve/index`** | **处理画面（审批/退回/否决的选择）（必需）** |
| 5 | `confirm` | 生成 `confirm/index` | 确认画面。可通过 `false` 省略 |
| 6 | `processDetail` | 生成 `process_detail/index` | 处理详情画面（与处理画面分别实现较稳妥；显示内容和编辑权限可能有差异） |
| 7 | `referDetail` | **与 `processDetail` 共用**（同一路径）作为默认输出 | 参照详情画面。仅在规格书要求显著差异时指定单独路径 |

**关于 `pageType=4`（处理画面）的注意：** IM-Workflow 官方用语为 `process`，但本项目中 usage 按「审批画面」（`approve/`）实现，因此默认 suffix 与之对齐为 `approve/index`。

### `screens` 字段与一致性验证

`spec.json` 的 `screens` 可对各 pageType 的输出进行精细控制（字符串=路径指定 / `false`=排除 / 未填写=默认）。详细取值含义、画面省略·共用的典型模式（A: 最小配置、B: 标准配置、C: 含起票运用、D: 详情画面单独实现）以及使用 `validate-workflow-code.js` 的一致性验证流程（`WF-XML-001` 警告的处理），请参见 [reference/screens-and-script-paths.md](reference/screens-and-script-paths.md)。

## 使用范围区分

| 技能 | 用途 |
|------|------|
| **jssp-im-workflow-generator**（本技能） | 生成 WF 定义 XML（contents/route/flow） |
| jssp-im-workflow-usage | 生成 WF 集成程序（.js/.html） |
| jssp-page-generator | 生成一般画面·函数容器 |
