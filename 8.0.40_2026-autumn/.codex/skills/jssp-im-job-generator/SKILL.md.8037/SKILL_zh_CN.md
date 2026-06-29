---
name: jssp-im-job-generator
description: 新建在 intra-mart 作业调度器中执行的作业程序（批处理）。提供 execute() 入口点、参数获取、事务管理、JobResult 返回值的实现模式。在提及创建批处理、创建作业、定期执行、夜间批处理、计划执行时使用。没有画面的服务端定期处理、批量处理请使用本技能。工作流的动作处理、案件处理请使用 jssp-im-workflow-usage。带画面的服务端处理（init 函数）请使用 jssp-page-generator。
---

■■ 参考规则 清单（必须） ■■

实施前必须确认以下内容。有未确认项目时不得开始。

- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) 已参考并理解内容
- [ ] [jssp-error-handling](../../../requirements/jssp-error-handling/AGENTS.md) 已参考并理解内容
- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) 已参考并理解内容
- [ ] [jssp-function-container](../../../requirements/jssp-function-container/AGENTS.md) 已参考并理解内容
- [ ] [jssp-logging](../../../requirements/jssp-logging/AGENTS.md) 已参考并理解内容
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) 已参考并理解内容
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) 已参考并理解内容
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) 已参考并理解内容


# 作业调度器 作业程序生成技能

## 目的

用于新建在 intra-mart Accel Platform 作业调度器中执行的作业程序的技能集。
说明按照模板和规范创建及构建批处理程序的步骤。

## 需参照的规约

本技能生成批处理（仅 `.js`，无画面）。全局视图请参阅 `{{AGENT_RULES}}/README.md`。

| 规约 | 处理方式 |
|------|---------|
| `jssp-function-container.md` | 🟢 **必读** — `execute()` 入口的结构 |
| `jssp-error-handling.md` / `jssp-logging.md` | 🟢 **必读** — 批处理通常需要详细的日志与错误处理 |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 必读 |
| `jssp-2way-sql.md` | 🟡 **仅当批处理包含 DB 操作时**（批处理中常见） |
| `jssp-security.md` | 🟡 仅在处理外部输入（如作业参数）时 |
| `jssp-presentation-page.md` / `jssp-accessibility.md` | 🔴 **不需要；无画面** |

## 生成对象

- **作业程序**（.js）— 通过计划或手动执行的批处理。无画面

## 模板参考资料

- `assets/simple-job.md` — 作业程序的实现示例（事务管理和参数获取模式）
- `reference/how-to-job-scheduler.md` — 作业调度器的规范、参数设计、注册步骤、从程序执行的方法

## 使用时机

当用户提出以下类型的请求时：
- "创建批处理"
- "实现作业程序"
- "添加定期执行处理"
- "创建作业调度器的作业"
- "创建夜间批处理"

## 实现步骤

1. 听取用户需求（处理内容、参数、执行时机）
2. 参考 `assets/simple-job.md` 生成作业程序
3. 确认文件放置位置（`src/main/jssp/src/{功能名}/job/` 目录下）
4. 必要时按照 `reference/how-to-job-scheduler.md` 的作业注册步骤进行说明

## 作业程序的基本规则

### 入口点

- 作业的入口点是 **`execute()`** 函数（不是画面处理的 `init()`）
- 展示页面（.html）**不需要**

### 参数获取

作业参数通过函数开头的 **`@parameter` JSDoc 注解**进行声明，并通过 `Contexts.getJobSchedulerContext().getParameter()` **按键逐个获取**。`execute()` **不接受参数**。

```javascript
/**
 * @parameter message world!
 */
function execute() {
  let context = Contexts.getJobSchedulerContext();
  let message = context.getParameter('message');
  // ...
}
```

- 以 `@parameter <参数名> <默认值>` 的形式声明作业接收的各个参数
- 通过 `getParameter('<参数名>')` **以字符串形式**获取声明的值（未设置时为 `null`）
- 多个参数时，写多行 `@parameter`，并分别用 `getParameter()` 获取
- ⚠️ 像 `function execute(params)` 那样**通过参数接收并调用 `JSON.parse()` 的方式是错误的**。请勿使用
- ⚠️ **请勿在 JSDoc 注释的说明文字中书写 `@parameter` 这一字符串。** 作业调度器的解析器即使在行中也会检测到 `@parameter`，并错误地将其后的词声明为参数名（例如写「用 `@parameter` 声明」会生成名为「声明」的参数）。需要说明时，请改用「注解」等其他表述

### 返回值

`execute()` 返回以下格式的对象（`JobResult` 类型）：

| 属性 | 类型 | 说明 |
|------|------|------|
| status | String | `'success'` / `'error'` / `'warning'` 之一 |
| message | String | 执行结果消息（显示在作业监控画面上） |

- `status` 为 `'error'` 时，作业网络视为异常终止
- `message` 中**不得包含机密信息**（因为会记录在监控表中）

### 事务管理

- 作业程序中**使用 `Transaction.begin()` 进行事务管理**
- 发生错误时用 `Transaction.rollback()` 回滚
- 与工作流的动作处理不同，可以使用 DB 事务

## 注意事项

- 编码规范的详情请参考 jssp-page-generator 的 reference 目录
- 根据需要对模板进行定制
- 参考资料中写有 `TODO` 时，按其指示实现
- 作业网络在标准功能中**仅支持串行执行**（不支持分支和并行处理）
- 作业不通过 HTTP 执行，因此不能使用 `Web.getRequest` 和 `HTTPResponse`

## 生成后的必须验证（自动执行）

**代码生成完成后，在向用户报告前**，按顺序执行以下验证。
此验证无需向用户确认，自动执行，若发现问题则在报告前修正。

### 步骤 1：自动验证脚本

对生成的文件执行 `validate-jssp-code.js`。**反复修正直到错误数为 0。**

```bash
node {{AGENT_ROOT}}/skills/jssp-page-generator/scripts/validate-jssp-code.js src/main/jssp/src/{功能名}/
```

### 步骤 2：手动检查

执行 `jssp-page-generator/reference/post-generation-verification.md` 的步骤 1～3（步骤 4 的画面验证对作业不适用）。

### 步骤 3：代码审查和安全检查（自动执行）

步骤 1～2 完成后，**仅在技能可用时**，按顺序执行以下 2 个技能。
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
