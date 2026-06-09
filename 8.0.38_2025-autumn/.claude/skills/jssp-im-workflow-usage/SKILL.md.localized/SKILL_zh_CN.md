---
name: jssp-im-workflow-usage
description: 新建 IM-Workflow 集成程序。提供动作处理（申请·审批·否决·退回）、案件开始/终了处理、分支条件处理、申请画面、审批画面的实现模式。当提及工作流、申请画面、审批画面、动作处理、案件处理、分支条件、审批流程时使用。作业调度器的定期批处理请使用 jssp-im-job-generator。
allowed-tools: Bash, Read, Write, Glob
---

# IM-Workflow 程序生成支持技能

## 目的

用于新建 intra-mart Accel Platform 的 IM-Workflow 集成程序的技能集。
按照模板和规范，说明创建和组织各种工作流处理程序的步骤。

## 需参照的规约

本技能生成申请画面・审批画面（`.html` + `.js`）以及动作处理（`.js`）。全局视图请参阅 `{{AGENT_RULES}}/README.md` 中的「规约文件一览（一行摘要 + 适用范围标签）」。本技能特有的重要度：

| 规约 | 处理方式 |
|------|---------|
| `jssp-presentation-page.md` | 🟢 **必读** — 申请/审批画面的 HTML 结构、验证、id 命名 |
| `jssp-function-container.md` | 🟢 **必读** — `init()` 结构、workflowOpenPage 参数接收 |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 必读 |
| `jssp-error-handling.md` / `jssp-security.md` | 🟢 必读 |
| `jssp-2way-sql.md` | 🔴 **画面侧原则上不需要**（申请/审批画面仅通过 `workflowOpenPage` 提交，无 DB 操作）。仅当动作处理侧使用 `db.executeByTemplate` 时参照 |
| `jssp-logging.md` | 🟡 仅在动作处理中实现日志时 |
| `jssp-accessibility.md` | 🟠 **业务需求依赖** — 仅在规格书明确要求时厚涂适用。无要求时保持最小（`imdsConfirm`、`aria-label`、装饰图标的 `aria-hidden` 等基础） |

## 生成对象与模板

### 画面

| 生成对象 | 模板 | 存放位置 |
|---------|------|---------|
| 申请画面（.html / .js） | `assets/simple-apply-screen.md` | `{功能名}/workflow/apply/` |
| 审批画面（.html / .js） | `assets/simple-approve-screen.md` | `{功能名}/workflow/approve/` |

### 批处理

| 生成对象 | 模板 | 存放位置 |
|---------|------|---------|
| 动作处理（.js） | `assets/simple-action-process.md` | `{功能名}/workflow/action/` |
| 到达处理（.js） | `assets/simple-arrive-process.md` | `{功能名}/workflow/arrive/` |
| 分支条件/分支合并处理（.js） | `assets/simple-rule-condition.md` | `{功能名}/workflow/rule/` |
| 案件开始处理（.js） | `assets/simple-matter-start-process.md` | `{功能名}/workflow/` |
| 案件终了处理（.js） | `assets/simple-matter-end-process.md` | `{功能名}/workflow/` |

### 监听器·插件

| 生成对象 | 模板 | 存放位置 |
|---------|------|---------|
| 处理对象者插件（.js） | `assets/simple-authority-exec-event-listener.md` | `{功能名}/workflow/plugin/` |
| 未完成案件删除监听器（.js） | `assets/simple-actv-matter-delete-listener.md` | `{功能名}/workflow/` |
| 完成案件删除监听器（.js） | `assets/simple-cpl-matter-delete-listener.md` | `{功能名}/workflow/` |
| 过去案件删除监听器（.js） | `assets/simple-arc-matter-delete-listener.md` | `{功能名}/workflow/` |
| 案件归档处理监听器（.js） | `assets/simple-matter-archive-listener.md` | `{功能名}/workflow/` |

### 参考资料

- `reference/imart-tag-workflow-open-page.md` — workflowOpenPage 标签参考
- `reference/api-user-actv-matter-property-value.md` — 案件属性值 API 参考
- `reference/screen-generation-checklist.md` — 画面生成时的自检清单
- `jssp-im-workflow-generator/reference/node-types.md` — 节点类型·权限插件一览（相关技能）

## 使用时机

用户提出以下需求时：
- "创建工作流动作处理"
- "创建申请画面"
- "实现审批画面"
- "添加案件开始处理"
- "实现分支条件"
- "创建到达处理"
- "实现处理对象者插件"
- "添加案件删除监听器"

## 实现步骤

1. 向用户确认需求（处理类型、功能名、业务逻辑内容）
2. 参考对应的 assets 模板进行生成
3. 确认文件存放位置（`src/main/jssp/src/{功能名}/workflow/` 目录下）

**注意：** IM-Workflow 的申请·审批画面在内容定义中直接指定 JSSP 路径，因此不需要路由表（XML）。

### DDL 生成

生成需要新建表的工作流时，除非规格书注明不需要 DDL，否则将以下文件输出至 `src/main/storage/system/products/import/basic/{功能名}/{version}/` 目录。

**放置位置固定的理由**：DDL 与示例 DML 的运行前提是 **由租户环境设置（Importer）批量导入**。因此无论是否直接使用 `jssp-tenant-setup-generator`，都必须放置在 `storage/system` 下的此路径（属于无法从导入画面单独导入的资源）。详见 `jssp-tenant-setup-generator/SKILL.md` 的「DDL / 示例 DML 放置位置的意义」章节。

`{version}` 的决定优先级如下：
1. 用户或规格书中明确指定的版本号
2. 项目根目录的 `module.xml`（或 `src/main/jssp/module.xml`）的 `<version>` 标签的值
3. 项目根目录的 `pom.xml` 的 `<version>` 标签的值（排除 `<parent>` 内的 version）
4. 以上都不存在时，使用 `1.0.0`

| 文件 | 内容 |
|------|------|
| `src/main/storage/system/products/import/basic/{功能名}/{version}/{功能名}-ddl_postgre.sql` | CREATE TABLE 语句（PostgreSQL 用） |
| `src/main/storage/system/products/import/basic/{功能名}/{version}/{功能名}-ddl_oracle.sql` | CREATE TABLE 语句（Oracle 用） |
| `src/main/storage/system/products/import/basic/{功能名}/{version}/{功能名}-ddl_sqlserver.sql` | CREATE TABLE 语句（SQL Server 用） |
| `src/main/storage/system/products/import/basic/{功能名}/{version}/{功能名}_sample-dml.sql` | 示例 INSERT 语句（全 DB 通用，**推荐**） |

`import-<key>-config-1.xml` 中 `<create-file>` / `<insert-file>` 引用使用**不带 suffix 的文件名**（例如 `{功能名}-ddl.sql` / `{功能名}_sample-dml.sql`）。intra-mart Importer 会根据接续的 DB 自动追加 `_postgre` / `_oracle` / `_sqlserver`；若不存在对应方言的文件，则回退到不带 suffix 的文件。

- **DDL 按 3 个方言分别放置**（类型名・约束语法因 DB 而异）
- **DML 合并为 1 个文件**（INSERT 语句可使用标准 SQL 范围内的写法实现共用）

仅当 DML 中需要方言特定语法（如 PostgreSQL 的 `ON CONFLICT`、Oracle 的 `MERGE` 等）时，才拆分为 `{功能名}_sample-dml_postgre.sql` 等 3 个文件。

- 表名·列名须与动作处理的 SQL 一致
- **列的类型须遵循 `jssp-page-generator/reference/ddl-type-mapping.md` 的类型映射表**（不得凭记忆或推测书写类型名）
- DDL 须按 DB 产品分别建立文件（类型名和默认值语法不同）
- 示例 DML 使用标准 SQL 的 INSERT 语句，确保三种产品均可使用
- 主数据表（取引先主数据等）插入 3～5 条示例记录

### 文件存放路径构建规则

> **注记**：IM-Workflow 画面由工作流引擎通过 XML 的 `scriptPath` 直接调用，不经过路由表。因此适用于 **与 `{{AGENT_RULES}}/jssp-file-structure.md` 的 `view/{view}.js`（每个画面的 snake_case 唯一名）规约不同的另一套规约**——这源于调用方不同。请按本章节的规约处理（`{{AGENT_RULES}}/jssp-file-structure.md` 中也以「不经过路由表调用的画面的例外规约」明确记载）。

文件存放路径必须按以下规则构建：

- **基础路径**：`src/main/jssp/src/`
- **功能名路径**：`{功能名}/workflow/` — 功能名从用户指示或内容定义的画面路径推导
- **完整路径**：`src/main/jssp/src/{功能名}/workflow/{子目录}/`

示例：功能名为 `sample/wf_housing_assistance` 时
- 正确：`src/main/jssp/src/sample/wf_housing_assistance/workflow/apply/index.html`

### 画面文件命名规则

IM-Workflow 的画面文件通过目录区分画面类型，文件名统一为 **`index.js` / `index.html`**。
不使用 `apply/apply.js` 这样的冗余命名。

```
# OK：统一为 {功能名}/workflow/{画面类型}/index
leave/workflow/apply/index.js      + index.html
leave/workflow/approve/index.js    + index.html
leave/workflow/detail/index.js     + index.html

# NG：省略 /workflow
leave/apply/index.js               + index.html

# NG：文件名冗余
leave/workflow/apply/apply.js      + apply.html
```

内容定义的 scriptPath 指定到目录名的路径（例：`leave/workflow/apply/index`）。

**存放路径的优先级：**
用户在提示中明确指定存放路径时，该指示具有最高优先级。
技能的默认规范（`{功能名}/workflow/{画面类型}/index`）仅在没有明确指示时适用。

## 注意事项

- 动作处理·案件开始/终了处理·分支条件处理的程序中**不得开启 DB 事务**
- 由于动作处理·案件处理·分支条件处理均为函数容器，须遵守编码规范（`let` 的使用、命名规则等）。详情参见 jssp-page-generator 的 reference 目录
- 根据需要自定义模板
- 参考文件中出现 `TODO` 时，按其指示实现
- **详情画面（确认画面·处理详情·参照详情）不得放置"返回"按钮**。详情画面在工作流引擎的 iframe 内显示，前一页面路径不存在，会导致跳转至空页面。省略所有返回按钮的 HTML、JS 事件监听器和返回表单（`imw-back-form`）。
- **展示页面（.html）须遵守 `{{AGENT_RULES}}/jssp-presentation-page.md` 的编码规范**。尤其是验证实现的规范遵守是必须的。生成完成后，使用 `reference/screen-generation-checklist.md` 进行自检。
- **画面中需要输入 IM 通用主数据值（用户・组织・公司・组・角色）时，请不要自行制作 UI，而是配合 `jssp-im-master-usage` 技能嵌入主数据检索对话框**（例如："申请人的上级"、"目标部门"、"处理人" 等字段）。禁止手动输入代码。

## 生成后必须验证（自动执行）

**代码生成完成后，在向用户报告之前**按顺序执行以下验证。
此验证无需向用户确认，自动执行，有问题须在报告前修正。

### 步骤 1：自动验证脚本

对生成的文件执行 `validate-workflow-code.js`。**反复修正直到错误数为 0。**

```bash
node {{AGENT_ROOT}}/skills/jssp-im-workflow-usage/scripts/validate-workflow-code.js src/main/jssp/src/{功能名}/
```

主要检测模式：
- `db.select()` / `db.execute()` 的参数未用 `DbParameter` 包装
- 向 `DbParameter.number()` 传入字符串（缺少 `Number()` 转换）
- `workflowOpenPage` 中存在无效的 pageType（`'0'`～`'5'` 以外）
- `imds-selectbox`（不存在的类名，正确应为 `imds-select`）
- `imuiCalendar` 的 altField 引用了 hidden input
- 审批画面中存在单独的审批/退回/否决按钮
- imart 标签的 value 属性被引号包围

### 步骤 2：DDL 类型验证（生成了 DDL 时）

生成了 DDL 文件时，执行 `validate-ddl.js`。**反复修正直到错误数为 0。**

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{功能名}/{version}/
```

### 步骤 3：手动检查（`post-generation-verification.md`）

执行 `jssp-page-generator/reference/post-generation-verification.md` 的所有步骤。
以下是过去曾发生问题的重点项目：
1. SQL 文件中是否使用了 `/*$param*/`（直接嵌入）？→ 使用 `/*param*/`（绑定）
2. `executeByTemplate` 的参数是否用 `DbParameter.xxx()` 包装？
3. API 调用是否与 d.ts 定义一致（static vs instance、方法名、参数）？
4. SQL 中是否直接引用了 intra-mart 内部表（以 `im` 开头的表）？（仅在用户明确指示时允许）
5. 画面的下拉选择框·日期输入是否指定了适当的 `max-width`？

### 步骤 4：画面 HTML 的 imds 合规性再检查（仅在生成 HTML 时）

申请画面·审批画面·详情画面·确认画面等 **生成了 `.html` 时必须执行**。虽然 `validate-workflow-code.js` 能检测出诸如 `imds-selectbox` 之类的已知错误类名，但 **它无法覆盖与 reference 的完整对照**，因此须打开 `jssp-imds-theme/reference/` 进行目视再确认。

#### 实施步骤

1. 扫描已生成的各 `.html`，列出使用的 imds 组件（文本框、文本区域、下拉框、复选框、单选框、按钮、表格、对话框、字段、标签页、日历输入、横幅/行内消息等）
2. 针对每个组件，**使用 Read 工具打开 `skills/jssp-imds-theme/reference/imds-html-{component}.md` 进行再确认**（不依赖记忆）
3. 将 reference 的类名、标签结构、属性与生成的 HTML 进行对照

#### 重点检查项

| 观点 | 确认要点 | 不一致时的处理 |
|------|---------|--------------|
| 类名存在性 | 是否使用了 `imds-selectbox` / `imds-input` 等 reference 中不存在的类？ | 替换为 reference 的正式名称（`imds-select` / `imds-textbox` 等） |
| 字段层级 | 是否保持 `imds-field-container has-accent-color` > `imds-field-group is-horizontal imds-w-15` > `imds-field-group-label` / `imds-field-group-control` > `imds-field` 的嵌套结构（与素材 `simple-apply-screen.md` / `simple-approve-screen.md` 逐行一致）？ | 从素材逐行重新抄写。不要简化为单独使用 `imds-field` |
| 必填标签 | 必填项目是否附加了 `<span class="imds-required-label-required" data-required-label="必須">`？ | 添加。`imds-required-label-required` 类名和 `data-required-label` 属性两者均为必需 |
| 错误显示 | `imds-field` 是否带有 `for=":fieldName:"` 属性，紧接其下是否配置了 `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>`？ | 按规约配置。不要忘记 display:none 的初始隐藏 |
| 表格 | 是否使用了 `imds-table` > `imds-table-inner` > `table` 的双层包装结构？ | 补足包装层 |
| 按钮状态 | 是否使用 `is-primary` / `is-outlined` / `is-ghost` / `is-danger` / `is-small` / `is-large` 等状态类，而不是 CSS 染色？ | 替换为状态类 |
| 对话框 | 是否使用 `<dialog class="imds-dialog">` + `imds-dialog-header` / `imds-dialog-body` / `imds-dialog-footer` 结构，并以 `showModal()` / `close()` 开闭？ | 按 reference `imds-html-dialog.md` / `imds-html-dialog-form.md` 修改 |
| 图标按钮 | 带文本的按钮是否用 `<span class="imds-button-text">` 包裹，纯图标按钮是否使用常规尺寸？ | 遵循 `imds-html-icon-button.md` |
| imuiCalendar | 是否指定了 `floatable="true"`，且 `altField` 是否引用了非 hidden 的输入？ | 按 `imui-html-calendar.md` 修改 |
| 横幅/行内 | 是否用自定义 CSS 添加了警告色？（应使用 `imds-banner-message` / `imds-inline-message`） | 替换为相应的状态类（`is-warning` 等） |
| 素材改动 | 是否对素材（`simple-apply-screen.md` / `simple-approve-screen.md`）的 HTML 结构进行了 **基于独立判断的布局变更**（`is-horizontal` → `is-vertical` 等）？ | 还原为素材的结构。如需变更须事先与用户确认 |

#### 与 `<imart type="workflowOpenPage">` 相关的追加检查

- `<imart type="workflowOpenPage">` 标签是否带有 `id` 属性（应仅使用 `name`）
- 表单内的输入字段是否带有 `name` 属性（应仅 hidden 字段持有 `name`）
- 单选按钮的输入用与 hidden 用是否使用不同的 `name`

#### 发现不一致时

以 reference 的描述为准，**修改生成的 HTML**。修改后再次从步骤 1（`validate-workflow-code.js`）执行，全部 PASS 后再进入下一步。

### 步骤 5：代码审查和安全检查（自动执行）

步骤 1～4 完成后，**仅在技能可用时**，按顺序执行以下 2 个技能。
若技能不存在可跳过。在向用户报告前完成。

1. 若 `jssp-code-review` 技能可用则执行
2. 若 `jssp-security-check` 技能可用则执行

#### JSSP-JS-022 警告的处理

自动验证脚本（步骤 1）输出以下类型警告时：

```
WARN [JSSP-JS-022] xxx.js:NN  存在传入 null 的可能性
```

**必须打开对应的 SQL 文件，确认该参数是否被 `/*IF param != null*/.../*END*/` 包裹。**

- 已包裹 → 无问题（误报）。在审查报告中注明"已确认 SQL 侧 /*IF*/ 保护"。
- 未包裹 → 修正为 `DbParameter.string(x || '')` 等空字符串回退方式。

## 与其他技能的边界·一致性职责

本技能生成的文件位置必须**与 `jssp-im-workflow-generator` 生成的 XML 中 `<scriptPath>`（或 spec.json 的 `screens`）完全一致**。职责分担如下：

| 职责 | 负责技能 |
|------|----------|
| 通过 spec.json 的 `screens` 决定画面路径 | `jssp-im-workflow-generator` |
| XML 内 `<scriptPath>` 的输出 | `jssp-im-workflow-generator` |
| 放置实际的 `.js` / `.html` 文件 | **本技能（usage）** |
| 验证路径一致性 | `scripts/validate-workflow-code.js` 的 `WF-XML-001` |

### pageType 与本技能惯例目录的对应表

由于 `jssp-im-workflow-generator` 的默认值已与本技能的惯例目录名保持一致，**新项目可在 spec.json 中省略 `screens`**。

| pageType | 键 | 本技能的放置位置 | 用途 |
|---|---|---|---|
| 0 | `apply` | `{功能名}/workflow/apply/` | 申请画面 |
| 1 | `tempSave` | `{功能名}/workflow/tempsave/` | 临时保存画面 |
| 2 | `applyTask` | `{功能名}/workflow/apply_task/` | 申请（起票案件）画面 |
| 3 | `reapply` | `{功能名}/workflow/reapply/`（或与 apply 共用） | 再申请画面 |
| 4 | `process` | **`{功能名}/workflow/approve/`** | **处理画面（审批/退回/否决的选择）** |
| 5 | `confirm` | `{功能名}/workflow/confirm/` | 确认画面 |
| 6 | `processDetail` | `{功能名}/workflow/process_detail/`（或 detail） | 处理详情画面 |
| 7 | `referDetail` | `{功能名}/workflow/refer_detail/`（或与 detail 共用） | 参照详情画面 |

**关于 `pageType=4`：** generator 的默认 suffix 为 `approve/index`（与本项目业务惯例「审批画面」对齐，而非 IM-Workflow 官方用语「process」）。本技能的模板 [`assets/simple-approve-screen.md`](assets/simple-approve-screen.md) 也遵循此惯例。

### 推荐的生成顺序

1. 使用 `jssp-im-workflow-generator` 创建 spec.json 并生成 XML（先确定画面路径）。
2. 用本技能生成 XML 引用的各画面文件。
3. 运行 `validate-workflow-code.js`，确认未出现 `WF-XML-001` 警告（若出现，请区分是有意省略还是忘记生成）。

详细对应表与共用模式请参阅 `jssp-im-workflow-generator` 技能的 SKILL.md 「与其他技能的边界·一致性职责」章节。
