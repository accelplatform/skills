---
name: jssp-page-generator
description: 为 intra-mart JSSP 新建画面、功能容器、公共处理及路由配置。当用户要求"创建○○画面"、"添加新页面"、"创建 JSSP 文件"、"实现表单"、"创建列表画面"、"添加输入画面"、"创建 CRUD 画面"时使用。包含 init 函数的服务端处理也属于本技能范围。批处理（Job Scheduler）请使用 jssp-im-job-generator，工作流相关请使用 jssp-im-workflow-usage。
allowed-tools: Bash, Read, Write, Glob
---

# JSSP 代码生成技能

## 目的

用于新建 intra-mart Accel Platform JSSP 代码的技能集。
按照模板和规范说明创建及配置新文件的步骤。

## 生成对象

- **功能容器**（.js）— 服务端逻辑（init 函数为入口点）
- **展示页面**（.html）— 画面显示
- **公共处理**（.js）— 服务端公共处理
- **路由配置**（.xml）— URL 设置

※ 批处理程序请使用 `jssp-im-job-generator`，工作流相关请使用 `jssp-im-workflow-usage`。

## 需参照的规约

本技能同时生成 `.js`（函数容器）+ `.html`（展示页面），因此涉及的规约较多。全局视图请参阅 `{{AGENT_RULES}}/README.md` 中的「规约文件一览（一行摘要 + 适用范围标签）」。本技能特有的重要度：

| 规约 | 处理方式 |
|------|---------|
| `jssp-presentation-page.md` | 🟢 **必读** — `.html` 的 HTML 结构、验证、id 命名 |
| `jssp-function-container.md` | 🟢 **必读** — `init()` 结构、validateRequest |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 必读 |
| `jssp-error-handling.md` / `jssp-security.md` | 🟢 必读 — 含表单输入 + API，二者均相关 |
| `jssp-2way-sql.md` | 🟡 **仅在实现含 DB 操作时参照**。只读 UI 等无 DB 操作的画面无需阅读 |
| `jssp-logging.md` | 🟡 仅在实现日志时 |
| `jssp-accessibility.md` | 🟠 **业务需求依赖** — 仅在规格书明确要求时厚涂适用。无要求时保持最小（`imdsConfirm`、`aria-label`、装饰图标的 `aria-hidden` 等基础） |

## 使用时机

当用户提出以下请求时：
- "创建○○画面"
- "添加新的 JSSP 文件"
- "创建列表画面"
- "实现输入表单"
- "创建 CRUD 画面"

---

## 集成工作流

**必须按照从上到下的顺序执行此工作流。禁止跳过或调整步骤顺序。**
每个步骤完成后再进入下一步。仅在第 11 步完成后向用户报告。

---

### 步骤 1：需求确认

向用户确认以下内容：

- 画面名称及功能概要
- 部署路径（放置在 `src/main/jssp/src/` 下的哪个位置）
- 是否需要新建数据表
- **画面是否包含让用户选择 IM 通用主数据值（用户・组织・公司・组・角色）的字段** → 若包含，请配合 `jssp-im-master-usage` 技能将其实现为主数据检索对话框（禁止使用自行制作的 `<input>` 进行手动输入）

---

### 步骤 2：读取资源示例

根据画面类型，**使用 Read 工具打开并读取对应的资源文件。**
不得省略此步骤。资源文件中包含符合 imds 规范的结构和类名使用示例。

| 画面类型 | 读取文件 |
|---------|---------|
| 输入表单 | `assets/simple-form.md` |
| 列表画面 | `assets/simple-list.md` |
| 向导     | `assets/simple-wizard.md` |
| 日历画面 | `assets/sample-calendar.md` |
| 文件上传/下载 REST-API | `assets/file-upload-download-api.md`（二进制传输相关请同时读取 `reference/api-binary-stream.md`） |
| 原始 JSON 接收 REST-API（POST `application/json`） | `assets/post-json-api.md` |

---

### 步骤 3：读取 imds 组件参考文档

参考 `jssp-imds-theme` 技能，**对画面中包含的每个 UI 组件，使用 Read 工具打开并读取对应的参考文件。**
不得凭记忆或猜测编写 imds 类名或标签结构。

| 组件 | 参考文件 |
|------|---------|
| 文本框 | `skills/jssp-imds-theme/reference/imds-html-textbox.md` |
| 文本域 | `skills/jssp-imds-theme/reference/imds-html-textarea.md` |
| 下拉选择 | `skills/jssp-imds-theme/reference/imds-html-select.md` |
| 复选框 | `skills/jssp-imds-theme/reference/imds-html-checkbox.md` |
| 单选按钮 | `skills/jssp-imds-theme/reference/imds-html-radio.md` |
| 按钮 | `skills/jssp-imds-theme/reference/imds-html-button.md` |
| 表格 | `skills/jssp-imds-theme/reference/imds-html-table.md` |
| 对话框 | `skills/jssp-imds-theme/reference/imds-html-dialog.md` |
| 对话框 + 表单（新建、编辑等） | `skills/jssp-imds-theme/reference/imds-html-dialog-form.md` |
| 分页 | `skills/jssp-imds-theme/reference/imds-html-pagination.md` |
| 字段（带标签） | `skills/jssp-imds-theme/reference/imds-html-field.md` |
| 字段组 | `skills/jssp-imds-theme/reference/imds-html-field-group.md` |
| 标签页 | `skills/jssp-imds-theme/reference/imds-html-tabs.md` |
| 折叠面板 | `skills/jssp-imds-theme/reference/imds-html-accordion.md` |
| 日历输入 | `skills/jssp-imds-theme/reference/imui-html-calendar.md` |
| 横幅消息 | `skills/jssp-imds-theme/reference/imds-html-banner-message.md` |
| 内联消息 | `skills/jssp-imds-theme/reference/imds-html-inline-message.md` |

其他组件存放于 `skills/jssp-imds-theme/reference/` 目录下。

---

### 步骤 4：生成功能容器和路由

参考 `{{AGENT_RULES}}/jssp-function-container.md` 和 `{{AGENT_RULES}}/jssp-presentation-page.md` 生成代码。

- 在 `src/main/jssp/src/{功能名}/` 下生成功能容器（.js）
- 根据需要生成路由配置（.xml）
- 必须使用安全令牌（参考 `reference/secure_token_check.md`）
- 如参考文件中有 `TODO`，按其指示实现

---

### 步骤 5：生成展示页面（HTML）

基于步骤 2、3 中读取的资源和参考 HTML 片段生成 `.html`。

**禁止事项：**
- 未读取资源或参考文档，凭记忆或猜测编写 imds 类名或结构
- 使用 `jssp-imds-theme` 参考文档中不存在的类名（例如：`imds-selectbox` 不存在，正确写法为 `imds-select`）
- 不使用 imds 组件，自行定义 HTML/CSS 结构
- **擅自修改资源的 HTML 结构**（表单顶层结构、`imds-field-container` / `imds-field-group` / `imds-field` 的嵌套、`is-horizontal` / `imds-w-15` 等布局类）。应原样沿用资源的结构，仅替换标签文本、`id`、输入类型和验证内容
- **基于个人设计判断进行布局修改**（例如："纵向排列更清晰"、"项目多所以想简化"等，如将 `is-horizontal` 改为 `is-vertical`，或省略 `imds-field-container` / `imds-field-group`）。如需与资源不同的结构，**生成前须向用户确认**
- **省略资源中包含的 JSDoc 注释（`/** ... */`）或分节注释（`// ===...===`）**。即使看似冗余，规约（`{{AGENT_RULES}}/jssp-function-container.md`）也将其视为必须项。保留它们可以使各函数的意图在代码中得到明确表达，便于后续审查和修改。资源中的注释原则上应照抄；若需修改，仅可将内容改写为对应功能的描述，不得删除。

**必须遵守的规则：**
- 带标签的表单元素必须使用 `imds-field` + `imds-field-label` + `imds-field-control` 结构
- 表格必须使用双层包裹结构：`imds-table` > `imds-table-inner` > `table`
- 按钮状态（primary/outlined 等）必须使用参考文档中的状态类，不得通过 CSS 设置颜色
- 表单主体结构须以**逐行照抄资源对应片段**为前提，不得简化为仅使用单独 `imds-field` 的结构。标准模式是在 `imds-field-container has-accent-color` 下直接放置 `imds-field-group`

---

### 步骤 6：生成 DDL（仅在需要新建数据表时）

若规格书中明确说明不需要 DDL，则跳过。否则，在 `src/main/storage/system/products/import/basic/{功能名}/{version}/` 下输出以下文件。

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
| `src/main/storage/system/products/import/basic/{功能名}/{version}/{功能名}-ddl_sqlserver.sql` | CREATE TABLE 语句（SQLServer 用） |
| `src/main/storage/system/products/import/basic/{功能名}/{version}/{功能名}_sample-dml.sql` | 示例记录 INSERT 语句（全 DB 通用，**推荐**） |

`import-<key>-config-1.xml` 中 `<create-file>` / `<insert-file>` 引用使用**不带 suffix 的文件名**（例如 `{功能名}-ddl.sql` / `{功能名}_sample-dml.sql`）。intra-mart Importer 会根据接续的 DB 自动追加 `_postgre` / `_oracle` / `_sqlserver`；若不存在对应方言的文件，则回退到不带 suffix 的文件。

- **DDL 按 3 个方言分别放置**（类型名・约束语法因 DB 而异）
- **DML 合并为 1 个文件**（INSERT 语句可使用标准 SQL 范围内的写法实现共用）

仅当 DML 中需要方言特定语法（如 PostgreSQL 的 `ON CONFLICT`、Oracle 的 `MERGE` 等）时，才拆分为 `{功能名}_sample-dml_postgre.sql` 等 3 个文件。

DDL 生成的详细规则，请参考本文件末尾的"DDL 生成规则详情"章节。

---

### 步骤 7：自动验证脚本（JSSP 代码）

对生成的文件执行 `validate-jssp-code.js`。**反复修正直到错误数为 0。**

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{功能名}/
```

常见检测模式：
- `db.select()` / `db.execute()` 的参数未用 `DbParameter` 包裹
- 向 `DbParameter.number()` 传递字符串（遗漏 `Number()` 转换）
- 使用 `var`（应使用 `let`）
- `imds-selectbox`（不存在的类名，正确为 `imds-select`）
- `imuiCalendar` 的 altField 引用了隐藏 input
- imart 标签的 value 属性被引号括起
- 使用 `include('**/common/**')` 加载公共模块（正确做法是使用 `load()`）
- `load('**/*.js')` 调用时附带 `.js` 扩展名（扩展名会自动添加，导致变成 `.js.js` 从而引发 FileNotFoundException）
- 未接收 `Transaction.begin(...)` 的返回值（忽略 `DatabaseResult` 会导致无法检测失败，出现"HTTP 200 成功但数据未写入 DB"的情况）
- TIMESTAMP/DATE 列的绑定使用了类似日期时间的变量名，如 `DbParameter.string(startAt|endAt|rangeFrom|rangeTo|...)`（在 PostgreSQL 中导致类型转换错误）

> **出现 JSSP-JS-022 警告时：** 必须打开对应的 SQL 文件，确认该参数是否被 `/*IF param != null*/.../*END*/` 包裹。已包裹 → 误报（在审查报告中注明"已确认 SQL 侧 /*IF*/ 保护"）。未包裹 → 修正为 `DbParameter.string(x || '')` 等空字符串回退方式。

---

### 步骤 8：DDL 类型验证（仅在步骤 6 中生成了 DDL 时）

若生成了 DDL 文件，执行 `validate-ddl.js`。**反复修正直到错误数为 0。**

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{功能名}/{version}/
```

常见检测模式：
- PostgreSQL DDL 中使用了 `NVARCHAR` / `VARCHAR2` / `NUMBER` / `DATETIME2` / `CLOB`
- Oracle DDL 中使用了 `VARCHAR(` / `NVARCHAR2` / `DECIMAL` / `DATETIME2` / `TEXT` / `BOOLEAN`
- SQLServer DDL 中使用了 `VARCHAR(` / `VARCHAR2` / `NUMBER` / `TIMESTAMP` / `CLOB` / `TEXT` / `BOOLEAN`
- DDL 中包含 `CREATE FUNCTION` / `CREATE TRIGGER` / `CREATE PROCEDURE` / `CREATE VIEW`（导致导入失败）
- CREATE TABLE 或 ALTER TABLE 中定义了 `CHECK` / `FOREIGN KEY` / `EXCLUDE` 约束
- DDL 策略：仅允许数据表、PK、UNIQUE 键和 CREATE INDEX
- 共通 DML 文件（`*-dml.sql`）中使用了 ODBC 转义 `{d '...'}` / `{t '...'}` / `{ts '...'}` / `{fn ...}` / `{oj ...}` / `{call ...}`（在 PostgreSQL 中导致语法错误）

---

### 步骤 9：tsc 类型检查

对生成的文件执行 TypeScript 编译器类型检查。**反复修正直到问题数为 0。**

```bash
bash {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/check-types.sh src/main/jssp/src/{功能名}/
```

常见检测模式：
- `result.data === 0` 这样的类型不匹配（更新件数应使用 `result.countRow`）
- 访问 d.ts 中不存在的方法或属性

---

### 步骤 10：手动检查

执行 `reference/post-generation-verification.md` 中的所有步骤。

---

### 步骤 11：代码审查和安全检查

步骤 7～10 完成后，**仅在技能可用时**，按顺序执行以下 2 个技能。
若技能不存在可跳过。在向用户报告前完成。

1. 若 `jssp-code-review` 技能可用则执行
2. 若 `jssp-security-check` 技能可用则执行

**以上全部完成后，向用户报告。**

---

## DDL 生成规则详情

在步骤 6 中生成 DDL 时，请遵守以下规则：

- 表名和列名必须与生成的功能容器 SQL 中的一致
- **列的类型必须遵照 `reference/ddl-type-mapping.md` 的类型映射表**（不得凭记忆或猜测填写类型名）
- DDL 须按数据库产品分文件输出（因为类型名和默认值语法各不相同）
- 示例 DML 须使用标准 SQL 的 INSERT 语句编写，以便 3 种产品通用
- 主数据表须插入 3～5 条示例记录
