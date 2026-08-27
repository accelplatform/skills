---
name: java-im-workflow-usage
description: 用 Java（JavaEE 开发模型）新建生成 intra-mart IM-Workflow 联动程序。提供动作处理（申请・审批・否决・退回等）、到达处理、案件开始/结束处理、分支・合并条件处理、处理对象者插件、案件删除/归档监听器的实现模式。当用户提到想用 Java 制作工作流处理、想用 Java 实现动作处理、在 JavaEE 开发模型中进行工作流联动时使用。若要在 JSSP（脚本开发模型）中制作同等处理，请使用 jssp-im-workflow-usage。画面（申请/审批/确认画面）不在本技能范围内，目前仍沿用 jssp-im-workflow-usage 生成的 JSSP 画面。
allowed-tools: Bash, Read, Write, Glob
---

# IM-Workflow Java 联动程序生成支持技能

## 目的

使用 intra-mart Accel Platform 的 IM-Workflow 提供的 **JavaEE 开发模型**（`jp.co.intra_mart.foundation.workflow.plugin.process.*` 下的抽象类，以及 `jp.co.intra_mart.foundation.workflow.listener.*` 下的监听器接口），用于以 Java 新建生成工作流的批处理类处理（动作处理・到达处理・案件开始/结束处理・分支条件处理・处理对象者插件・各种监听器）的技能集。

**画面（申请/审批/确认画面）不在范围内。** 前提是 IM-Workflow 的画面目前仍沿用 JSSP（`jssp-im-workflow-usage`）。本技能仅处理无画面的「处理程序」。

## 与 JSSP 版的区别（重要）

JSSP 版（`jssp-im-workflow-usage`）与 Java 版针对相同的扩展点，是 **两套独立的执行体系**（脚本执行 / Java 类执行），实现模型有根本性的不同。若仅从表面上模仿生成，实机上将无法运行，因此务必遵循本文档的类型・签名。

| 角度 | JSSP 版 | Java 版 |
|------|---------|---------|
| 实现单位 | 在 1 个文件中定义 17 个函数（`apply`、`approve`、……） | 1 个类继承抽象类，**覆盖**所需处理时机的方法（未使用的部分保持父类的空实现） |
| 返回值 | 自行组装并返回 `{resultFlag, message, data}` 的 Object | 方法的返回值本身（`String` / `boolean` / `void`）。**失败以异常（`throw new Exception(...)`）表示**。不存在与 `resultFlag`/`message` 相当的结构体 |
| 错误通知 | `result.resultFlag = false; result.message = e.message;` | 让方法的 `throws Exception` 直接传播（由工作流引擎侧捕获并作为错误处理） |
| 注册方法 | 在导入用 XML 的 `plugins[].parameter` 中设置 **JSSP 文件路径**（不含扩展名） | 在导入用 XML 的 `plugins[].parameter` 中设置 **实现类的完全限定名（FQCN）** |
| 配置 | `src/main/jssp/src/{功能名}/workflow/...` | `src/main/java/{basePackage}/{功能名}/workflow/...`（需编译后配置到 Java 运行环境的类路径上） |
| 编码规约 | `.github/instructions/` 下的 jssp 系规约一套 | `.github/instructions/` 下的 java 系规约一套（`java-naming.md` / `java-code-style.md` / `java-javadoc.md` / `java-logging.md`） |

**本技能生成的终究只是 Java 源文件（`.java`）。** 工作流定义侧的导入用 XML（在 `plugins[].parameter` 中设置 FQCN 的部分），请参照 `base-im-workflow-generator` 的 Java 对应章节（「注册 Java 类执行（JavaEE 开发模型）时」）生成。

## 应参考的规约

| 规约 | 处理方式 |
|------|----------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |
| `.github/instructions/java-logging.instructions.md` | 🟡 实现日志时（`Logger.getLogger(XxxClass.class)`） |
| `.github/instructions/jssp-error-handling.instructions.md` | 🟡 **仅作为思路参考**（错误代码体系的思想。实现时需转换为 Java 的异常机制） |

`jssp-*` 系列规约（`jssp-code-style.md` 等）不在本技能范围内（不适用于 Java 文件）。

## 生成对象与模板

### 动作处理・到达处理・案件处理

| 生成对象 | 继承/实现来源 | 模板 | 大致配置位置 |
|---------|------------|------------|-----------|
| 动作处理（申请・审批・否决・退回等 全17个方法） | `ActionProcessEventListener`（抽象类继承） | `assets/action-process.md` | `{功能名}/workflow/action/` |
| 到达处理 | `ArriveProcessEventListener`（抽象类继承） | `assets/arrive-process.md` | `{功能名}/workflow/arrive/` |
| 案件开始处理 | `MatterStartProcessEventListener`（抽象类继承） | `assets/matter-start-process.md` | `{功能名}/workflow/` |
| 案件结束处理（有事务/无事务） | `MatterEndProcessEventListener`（抽象类继承） | `assets/matter-end-process.md` | `{功能名}/workflow/` |
| 分支条件・合并条件 | `RuleConditionEventListener`（抽象类继承） | `assets/rule-condition.md` | `{功能名}/workflow/rule/` |

### 插件・监听器

| 生成对象 | 继承/实现来源 | 模板 | 大致配置位置 |
|---------|------------|------------|-----------|
| 处理对象者插件 | `IWorkflowAuthorityExecEventListener`（接口实现） | `assets/authority-exec-listener.md` | `{功能名}/workflow/plugin/` |
| 未完成/已完成/历史案件删除监听器 | `IWorkflowActvMatterDeleteListener` 等（接口实现） | `assets/matter-delete-listener.md` | `{功能名}/workflow/` |
| 案件归档处理监听器 | `IWorkflowMatterArchiveListener`（接口实现） | `assets/matter-archive-listener.md` | `{功能名}/workflow/` |

### 参考资料

- `reference/parameter-reference.md` — 各处理接收的参数类字段一览（基于平台 API 的实际类定义。请勿凭记忆编写）
- `reference/registration-and-packaging.md` — 包结构・配置规约・向导入用 XML 注册的方法・运行时类路径配置的注意事项

## 使用时机

用户提出以下请求时：
- 「用 Java 制作工作流的动作处理」
- 「在 JavaEE 开发模型中实现到达处理」
- 「用 Java 类添加案件开始处理」
- 「用 Java 实现分支条件」
- 「用 Java 类实现处理对象者插件」
- 「用 Java 添加案件删除监听器」

若没有明确提及「用 Java」「在 JavaEE 开发模型中」等，仅要求「制作工作流的动作处理」时，**默认使用 JSSP 版（`jssp-im-workflow-usage`）**。仅当项目现有实现以 Java 为中心（例如 `src/main/java` 下已存在大量业务逻辑）时，才向用户确认 Java 版是否合适。

## 实现步骤

1. 听取用户需求（处理种类・功能名・业务逻辑内容・目标包）
2. 参照相应的 `assets/` 模板生成类
   - **未使用的方法保留父类的默认实现**（空的 `return null;` / `return true;` / 不做任何事）。不要强行填充动作处理中不实现的方法（例如不使用 `reserve`）
   - 参数类的字段务必参照 `reference/parameter-reference.md`（请勿凭记忆或猜测编写 `getXxx()`）
3. 决定包・配置路径（参见下方「配置规约」）
4. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
5. 告知用户需要在导入用 XML 侧的 `plugins[].parameter` 中设置所生成类的 FQCN（参见 `base-im-workflow-generator` 的 Java 对应章节。本技能本身不生成 XML）

## 配置规约

### 基础包

若项目已有既定的 Java 包规约，则遵循该规约。若没有，请仿照 `.github/instructions/java-naming.instructions.md` 的示例（`jp.co.intra_mart.sample.service` 等），以下作为默认值。**默认值终究只是默认值，若用户有明确指定，则以其指示为准。**

```
{basePackage}.{功能名}.workflow.{种类}
```

例：功能名 `leave`（休假申请）、基础包 `jp.co.intra_mart.sample` 的情况

```
jp.co.intra_mart.sample.leave.workflow.action    -> LeaveActionProcess.java
jp.co.intra_mart.sample.leave.workflow.arrive    -> LeaveArriveProcess.java
jp.co.intra_mart.sample.leave.workflow.rule      -> LeaveBranchRule.java
jp.co.intra_mart.sample.leave.workflow.plugin    -> LeaveAuthorityExecListener.java
jp.co.intra_mart.sample.leave.workflow           -> LeaveMatterStartProcess.java
                                                     LeaveMatterEndProcess.java
                                                     LeaveMatterArchiveListener.java
                                                     LeaveActiveMatterDeleteListener.java
```

### 文件配置位置

```
src/main/java/{basePackage 的路径分隔}/{功能名}/workflow/{种类}/{ClassName}.java
```

`{种类}` 目录的对应关系（与 JSSP 版 `.github/instructions/jssp-file-structure.instructions.md` 中 `workflow/` 下的惯例保持一致）：

| 处理 | 子目录 |
|------|----------------|
| 动作处理 | `action/` |
| 到达处理 | `arrive/` |
| 分支条件・合并条件 | `rule/` |
| 处理对象者插件 | `plugin/` |
| 案件开始/结束处理、各种删除/归档监听器 | 直接位于下方（无子目录） |

### 类命名

遵循 `.github/instructions/java-naming.instructions.md` 的帕斯卡命名规则。后缀与处理种类对应：

| 处理 | 后缀 | 示例 |
|------|------------|-----|
| 动作处理 | `ActionProcess` | `LeaveActionProcess` |
| 到达处理 | `ArriveProcess` | `LeaveArriveProcess` |
| 案件开始处理 | `MatterStartProcess` | `LeaveMatterStartProcess` |
| 案件结束处理 | `MatterEndProcess` | `LeaveMatterEndProcess` |
| 分支条件 | `BranchRule` | `LeaveBranchRule` |
| 合并条件 | `UnionRule` | `LeaveUnionRule` |
| 处理对象者插件 | `AuthorityExecListener` | `LeaveAuthorityExecListener` |
| 未完成案件删除监听器 | `ActiveMatterDeleteListener` | `LeaveActiveMatterDeleteListener` |
| 已完成案件删除监听器 | `CompletedMatterDeleteListener` | `LeaveCompletedMatterDeleteListener` |
| 历史案件删除监听器 | `ArchivedMatterDeleteListener` | `LeaveArchivedMatterDeleteListener` |
| 案件归档处理监听器 | `MatterArchiveListener` | `LeaveMatterArchiveListener` |

**配置路径的优先顺序：** 若用户在提示中明确指定了目标包・路径，则该指示最优先。本技能的默认值终究只是默认值。

## 注意事项

- 动作处理・案件开始/结束处理・分支条件处理的程序中，**请勿开启 DB 事务**（与 JSSP 版相同的约束。事务由引擎侧控制）
- **不要编写未实现的覆盖方法。** 由于父类抽象类提供了空实现（`return null;` 等），无需为不使用的处理时机的方法进行覆盖填充。仅覆盖实际实现业务逻辑的方法
- 失败时抛出 `throw new Exception("消息")` 或更具体的异常类。不存在与 JSSP 版 `result.resultFlag = false` 相当的结构体
- 异常消息请遵循 `.github/instructions/java-javadoc.instructions.md` 的规约，用日语进行说明性描述
- 案件结束处理无论有事务/无事务都使用**同一个类**（继承 `MatterEndProcessEventListener`）。注册到哪个扩展点由注册侧（导入用 XML）切换
- 分支条件・合并条件同样使用**同一个类**（继承 `RuleConditionEventListener`）。注册到哪个扩展点由注册侧切换
- 案件删除监听器（未完成/已完成/历史）实现的接口不同（`IWorkflowActvMatterDeleteListener` / `IWorkflowCplMatterDeleteListener` / `IWorkflowArcMatterDeleteListener`）。**仅历史案件删除（`IWorkflowArcMatterDeleteListener`）的 `execute` 参数为5个**（末尾追加了 `archiveMonth`），与其余两种（4个参数）的签名不同。若按4个参数实现，即使加了 `@Override` 也会因抽象方法未实现而导致编译错误。详情请参阅 `assets/matter-delete-listener.md`
- 类在运行时通过类加载器实例化（相当于 `Class.newInstance()`）。**需要无参构造函数**（即使不显式编写，隐式的默认构造函数也可满足，但请勿将构造函数设为 `private`）

## 生成后的确认

目前尚未完善类似 JSSP 版的专用验证脚本（相当于 `validate-workflow-code.js`）。请手动确认以下事项。

1. 继承来源的类・实现的接口的 FQCN 是否与 `reference/parameter-reference.md` 中的记载一致
2. 覆盖的方法签名（参数类型・返回值类型・`throws`）是否与抽象类/接口的定义完全一致（添加 `@Override` 让编译器进行验证）
3. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
4. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目另有针对 Java 的代码评审・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| 生成工作流定义（contents/route/flow）的导入用 XML | `base-im-workflow-generator` |
| 在 XML 的 `plugins[].parameter` 中设置 JSSP 脚本路径 | `base-im-workflow-generator`（默认） |
| 在 XML 的 `plugins[].parameter` 中设置 Java 类 FQCN | `base-im-workflow-generator`（Java 对应章节） |
| 配置 JSSP 实现（`.js`）的实体 | `jssp-im-workflow-usage` |
| **配置 Java 实现（`.java`）的实体** | **本技能** |
| 申请/审批/确认画面（`.html` + `.js`） | `jssp-im-workflow-usage`（不在本技能范围内） |
