---
name: java-im-propagation-generator
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 特有的模块间数据联动 API（`jp.co.intra_mart.foundation.propagation.*`、`im_propagation` 模块）的技能集，新建通过 `PropagationManager` 发送数据、`Encoder`/`GenericModel`（发送方）、`Decoder`/`Procedure`（接收方）以及收发配置文件（`propagation-senders-config`/`propagation-receivers-config`/`propagation-config`）的完整套件。同时提供在自定义模块中接收 intra-mart 默认发送的数据（租户、账户、角色、IM-Authz、菜单、日历、作业网等的变更通知）的监听器实现模式，以及向 IM-Box（应用通知/关注）等 intra-mart 标准功能发送数据的实现模式。当用户提到想在 Java 中实现模块间数据联动、想使用 `PropagationManager`/`Encoder`/`Decoder`/`Procedure`、想通过 IM-Propagation 收发数据、想实现接收 intra-mart 标准变更通知（租户创建、角色更新等）的监听器时使用。尚未提供面向 JSSP（脚本开发模型）的同等 API。
allowed-tools: Bash, Read, Write, Glob
---

# IM-Propagation（模块间数据联动）实现支持技能（Java 版）

## 目的

使用 intra-mart Accel Platform 为 **JavaEE 开发模型**提供的模块间数据联动 API（IM-Propagation，`jp.co.intra_mart.foundation.propagation.*`），新建实现以下内容的技能集。

1. 从自定义模块向其他模块（或 intra-mart 标准功能）发送数据（发送方完整套件）
2. 在自定义模块中处理从其他模块（或 intra-mart 标准功能）发送来的数据（接收方完整套件）
3. 定义收发对应关系的配置文件完整套件

IM-Propagation 是一种松耦合的联动基础设施，使"模块 A 无需了解模块 B 的实现（类），即可在同一事务内（而非异步）传达数据变更/事件"。发送方完全不引用接收方的实现类（仅通过配置文件中 `source`（数据模型的完全限定类名）与 `operationType` 的组合来建立关联）。

## 基本概念（最重要）

IM-Propagation 的组成要素为发送方 3 个、接收方 3 个共 6 个类，以及 3 种配置文件。

```
发送方                                                    接收方
──────                                                    ──────
① 数据模型（POJO）                                         ④ 数据模型（POJO，不必与①是同一个类）
② GenericModel（继承 AbstractGeneric。收发双方共享的可还原序列化数据）
③ Encoder（将① → ②转换）                                   ⑤ Decoder（将② → ④转换）
                                                           ⑥ Procedure（接收④并执行业务处理）

PropagationManager#send(operationType, dataClass, data, resultClass)
  → propagation-senders-config.xml 根据 source(①的FQCN)+operationType 解析出 Encoder → 生成②
  → propagation-receivers-config.xml 根据 source(①的FQCN)+operationType 解析出 Decoder/Procedure
  → Decoder 将② → ④ 转换 → Procedure#onReceive(parameter, ④) 执行业务处理
```

- **`GenericModel`（继承 `AbstractGeneric`）是收发双方之间实际交换的唯一数据形式。** 发送方的原始数据（①）、接收方还原后的数据（④）仅在各自模块内部使用，完全不对外公开
- **发送方完全不了解接收方的实现类（Decoder/Procedure）。** 二者仅通过 `propagation-senders-config.xml`/`propagation-receivers-config.xml` 中 `source`（数据模型的完全限定类名）+`operationType` 的组合建立关联，Java 代码层面无需进行监听器注册
- **`source` 中指定的数据模型 FQCN 相当于一个"主题名"标识符，事后难以更改。** 应采用包含模块 ID、功能名的稳定命名（例如：`jp.co.intra_mart.sample.leave.propagation.LeaveApprovedData`）
- `PropagationManager` 是发送数据的入口点，通过 `begin()`/`send()`/`decide()`/`abort()` 提供会话控制（通常与数据库事务联动）。详细方法签名参见 `reference/propagation-api-reference.md`

**本技能仅涉及 Java 源文件（`.java`）和配置文件（`WEB-INF/conf/propagation-*-config/*.xml`、`WEB-INF/conf/propagation-config.xml`）。** 尚未提供面向 JSSP（`.js`）的同等 SSJS API。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.claude/rules/java-code-style.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.claude/rules/java-javadoc.md` | 🟢 **必读** — 类/方法 JavaDoc |
| `.claude/rules/java-logging.md` | 🟡 实现日志时（如 `Procedure` 内的错误日志输出等） |

`.claude/rules` 下不存在 IM-Propagation 专用规约。数据模型・`GenericModel`・`Encoder`/`Decoder`/`Procedure` 的结构与命名遵循 `assets/sender-usage.md`/`assets/receiver-usage.md` 中的模式。

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`PropagationManager`（属于 `jp.co.intra_mart.foundation.propagation` 包）通过 `PropagationManagerFactory.getInstance().getPropagationManager()` 获取。发送方通过继承 `AbstractEncoder<D, G>`（`jp.co.intra_mart.foundation.propagation.sender` 包）实现；接收方通过继承 `AbstractDecoder<G, D>` 以及 `AbstractProcedure<D, R>`/`AbstractSessionableProcedure<D, R>`（均属于 `jp.co.intra_mart.foundation.propagation.receiver` 包）实现。共享数据类型继承自 `AbstractGeneric`（`jp.co.intra_mart.foundation.propagation.model.generic` 包）。所有类的详细方法签名・异常层次结构务必参考 `reference/propagation-api-reference.md`，配置文件的 XML 元素/属性/XSD 命名空间务必参考 `reference/propagation-config-reference.md`（不要凭记忆或猜测编写）。

## 生成对象与模板

### 发送自定义数据（发送方）

| 生成对象 | 继承/实现来源 | 模板 | 大致存放位置 |
|---------|------------|------------|-----------|
| 数据模型（发送源 POJO） | 无（普通 POJO） | `assets/sender-usage.md` | `{功能名}/propagation/` |
| GenericModel | 继承 `AbstractGeneric` | `assets/sender-usage.md` | `{功能名}/propagation/` |
| Encoder | 继承 `AbstractEncoder<D, G>` | `assets/sender-usage.md` | `{功能名}/propagation/encoder/` |
| 发送处理（调用 `PropagationManager`） | 无（调用代码） | `assets/sender-usage.md` | 服务类等执行业务处理的类内部 |
| 发送配置文件 | `propagation-senders-config` | `assets/sender-usage.md` | `WEB-INF/conf/propagation-senders-config/{任意名}.xml` |

### 接收来自其他模块・intra-mart 标准功能的数据（接收方）

| 生成对象 | 继承/实现来源 | 模板 | 大致存放位置 |
|---------|------------|------------|-----------|
| 数据模型（接收目标 POJO） | 无（普通 POJO） | `assets/receiver-usage.md` | `{功能名}/propagation/` |
| Decoder | 继承 `AbstractDecoder<G, D>` | `assets/receiver-usage.md` | `{功能名}/propagation/decoder/` |
| Procedure（面向数据库处理） | 继承 `AbstractProcedure<D, R>` | `assets/receiver-usage.md` | `{功能名}/propagation/procedure/` |
| Procedure（非数据库资源・需要自定义事务控制时） | 继承 `AbstractSessionableProcedure<D, R>` | `assets/receiver-usage.md` | `{功能名}/propagation/procedure/` |
| 接收配置文件 | `propagation-receivers-config` | `assets/receiver-usage.md` | `WEB-INF/conf/propagation-receivers-config/{任意名}.xml` |

### intra-mart 标准数据的收发（标准监听器）

| 用途 | 模板 |
|------|------------|
| 在自定义模块中接收 intra-mart 默认发送的数据（租户・账户・角色・IM-Authz・菜单・日历・作业网・Salesforce 联动・Wiki 等的变更通知） | `assets/standard-listener-usage.md` |
| 从自定义模块向 IM-Box（应用通知、注册/取消关注）等 intra-mart 标准功能准备好的接收处理（`GenericModel`）发送数据 | `assets/standard-listener-usage.md` |

### 参考资料

- `reference/propagation-api-reference.md` — `PropagationManager`/`PropagationManagerFactory`/`Encoder`/`Decoder`/`Procedure`/`AbstractGeneric`/`ReceiveResult`/`EventStatus`/`OperationType`/异常层次结构的全部方法与签名（基于平台 API 的实际类定义，不要凭记忆编写）
- `reference/propagation-config-reference.md` — `propagation-senders-config`/`propagation-receivers-config`/`propagation-config` 的 XML 元素・属性・XSD 命名空间・存放位置的详细说明

## 使用时机

当用户提出以下类似请求时：
- "用 Java 实现模块间的数据联动"
- "想使用 `PropagationManager` 发送数据"
- "使用 Encoder/GenericModel 创建发送自定义数据的处理"
- "使用 Decoder/Procedure 创建接收其他模块数据的处理"
- "创建发送配置文件（`propagation-senders-config`）/接收配置文件（`propagation-receivers-config`）"
- "实现接收租户创建・角色更新等 intra-mart 标准变更通知的监听器"
- "想从自定义模块进行 IM-Box 的关注注册"

即使没有明确提及"用 Java"或"在 JavaEE 开发模型中"，由于尚不存在与 IM-Propagation 对应的 JSSP（脚本开发模型）SSJS API，也可始终将其视为本技能的适用范围。

## 实现步骤

1. 听取用户需求
   - 自定义模块是发送方还是接收方（也可能两者兼有）
   - 若为发送方：发送数据的内容、发送时机（是否需要与数据库更新处于同一事务）、`operationType`（从 `reference/propagation-api-reference.md` 的标准常量中选择，还是使用自定义字符串）
   - 若为接收方：接收对象是"其他自定义模块"还是"intra-mart 标准数据"（后者的 `source`/`operationType` 是固定的，需从 `assets/standard-listener-usage.md` 的清单中选择）、接收数据的处理内容是否可以搭载在数据库事务上（若不能，考虑使用 `AbstractSessionableProcedure`）
2. 实现发送方时，参考 `assets/sender-usage.md`，按数据模型 → `GenericModel`（继承 `AbstractGeneric`）→ `Encoder`（继承 `AbstractEncoder`）→ `PropagationManager` 调用代码 → 发送配置文件的顺序实现（方法签名务必参考 `reference/propagation-api-reference.md`，不要凭记忆或猜测编写）
3. 实现接收方时，参考 `assets/receiver-usage.md`，按 `Decoder`（继承 `AbstractDecoder`）→ `Procedure`（继承 `AbstractProcedure` 或 `AbstractSessionableProcedure`）→ 接收配置文件的顺序实现。**`source`/`operationType` 需与发送方（自建情形参见步骤 2，intra-mart 标准数据情形参见 `assets/standard-listener-usage.md` 的清单）完全一致**。**实现前必须确认 `Decoder<G, D>` 中指定为 `G` 的类是否具有 `public` 的无参构造函数**（若不具备就注册为接收方，会导致发送方自身的处理被破坏，参见"注意事项"）。**接收 intra-mart 标准数据时，`G` 不应直接使用领域模型类，而应使用 `jp.co.intra_mart.foundation.propagation.model.generic` 包中对应的 `Generic*` 类**（参见 `assets/standard-listener-usage.md` 的对应表，并先在验证环境中确认）
4. `GenericModel` 的类与字段结构在发送方・接收方之间不必是完全相同的类，但字段名・类型差异过大会导致还原时数据丢失。应与用户协商是在收发双方使用同一个 `GenericModel` 类（例如放置于共享库中），还是在留意字段结构的前提下各自单独定义
5. 确认是否符合 `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## 存放规约

### 基础包・目录

若项目已有既定的 Java 包规约，则遵循该规约。若没有，则仿照 `.claude/rules/java-naming.md` 的示例，采用以下作为默认值。**默认值仅为兜底方案，若用户有明确指定则优先采用用户的指示。**

```
{basePackage}.{功能名}.propagation
{basePackage}.{功能名}.propagation.encoder    … Encoder 实现（仅发送方）
{basePackage}.{功能名}.propagation.decoder    … Decoder 实现（仅接收方）
{basePackage}.{功能名}.propagation.procedure  … Procedure 实现（仅接收方）
```

示例：功能名 `leave`（请假申请）、基础包 `jp.co.intra_mart.sample` 时

```
jp.co.intra_mart.sample.leave.propagation            -> LeaveApprovedData.java（数据模型）
                                                         LeaveApprovedGeneric.java（GenericModel）
jp.co.intra_mart.sample.leave.propagation.encoder    -> LeaveApprovedEncoder.java
jp.co.intra_mart.sample.leave.propagation.decoder    -> LeaveApprovedDecoder.java
jp.co.intra_mart.sample.leave.propagation.procedure  -> LeaveApprovedProcedure.java
```

### 配置文件存放位置

```
src/main/conf/propagation-senders-config/{任意名}.xml     … 发送配置（不是 src/main/webapp/WEB-INF/conf/）
src/main/conf/propagation-receivers-config/{任意名}.xml   … 接收配置
src/main/conf/propagation-config.xml                        … 全局配置（死锁检测等，单一文件）
```

以上文件在构建时都会按原有相对结构原样复制到 `WEB-INF/conf/` 下（不创建包层级，直接放置文件）。

### 类命名

遵循 `.claude/rules/java-naming.md` 的 PascalCase 规则。后缀对应角色：

| 角色 | 后缀 | 示例 |
|------|------------|-----|
| GenericModel | `Generic` | `LeaveApprovedGeneric` |
| Encoder | `Encoder` | `LeaveApprovedEncoder` |
| Decoder | `Decoder` | `LeaveApprovedDecoder` |
| Procedure | `Procedure` | `LeaveApprovedProcedure` |

**存放路径的优先级：** 若用户在提示词中明确指定了存放包・路径，则优先采用该指示。本技能的默认值仅为兜底方案。

## 注意事项

- **【最重要】`Decoder<G, D>` 中指定为 `G`（GenericModel）的类，必须拥有 `public` 的无参构造函数。** IM-Propagation 传递 GenericModel 时并非使用 `Serializable`，而是内部采用基于 JSON 的转换；接收方会通过反射（无参构造函数）重建该类的实例后再传给 `decode()`。**若将不具备无参构造函数的类注册为接收方的 `G`，无论接收方实现是否正确，都会导致发送方自身的处理以 `SendException` 失败。** 若发送方是 intra-mart 标准功能，则会造成该标准功能整体不可用这一严重影响。`jp.co.intra_mart.foundation.admin.account.model.AccountInfo`（仅有 `public AccountInfo(String userCd)` 这一个带参构造函数）不满足该要求
- **接收 intra-mart 标准数据时，不要将 `AccountInfo` 等管理类 API 的领域模型类直接指定为 `G`，而应使用 `jp.co.intra_mart.foundation.propagation.model.generic` 包提供的官方 `Generic*` 类（`GenericAccount`/`GenericTenant`/`GenericRole` 等）。** `source` 属性（用于路由）保持为领域模型类的 FQCN 不变，仅将 `G`（实际从 JSON 还原的类）替换为对应的 `Generic*` 类。`AccountInfo` → `GenericAccount` 的组合可以正常接收。详情参见 `reference/propagation-api-reference.md` 中的"`jp.co.intra_mart.foundation.propagation.model.generic` 包"及 `assets/standard-listener-usage.md` 的对应表。仅当找不到对应的 `Generic*` 类时，才考虑自行编写满足本包要求（无参构造函数等）的镜像类，并且同样应先在验证环境中确认后再部署到生产等同环境**
- **`PropagationManager` 的会话（通过 `begin()` 开启的会话）必须通过 `decide()`/`abort()`/`close()` 之一结束。** 若放任不结束，会导致数据库事务无法结束、或后续通过 `PropagationManagerFactory` 的获取挂起等严重故障。惯例做法是将 `abort()` 放在 `finally` 块中（若已调用过 `decide()`，则该调用为安全的空操作，无需担心重复调用）
- **`Encoder`/`Decoder` 在转换失败时应抛出 `ConvertException`（或其子类），`Procedure` 在处理失败时应抛出 `ProcedureException`（或其子类）。** `PropagationManagerException` 是框架内部专用的异常，不得从应用代码（Encoder/Decoder/Procedure 的实现）中抛出
- **`operationType` 在发送方・接收方之间必须作为字符串完全一致。** 应优先使用标准常量（`OperationType` 类，如 `DATA_CREATED`/`DATA_UPDATED`/`DATA_DELETED`/`PROC_STARTED`/`PROC_COMPLETED` 等），仅在表示自定义操作时才定义自定义字符串常量
- **`source` 属性中指定的数据模型 FQCN 事后难以更改。** 进行类名变更（重构等）时，需要告知用户运行中的发送配置与接收配置两侧文件都需要更新
- **若接收方的 Procedure 是需要数据库事务的常规业务处理，使用 `AbstractProcedure`。** 由于会搭载在宿主方（发送源）的事务上，Procedure 内部无需自行开启・结束事务
- **若接收方的处理涉及非数据库资源（外部 API 调用・文件操作等），且需要在提交前自行进行判定・确定处理，使用 `AbstractSessionableProcedure`。** 按 `onInitialize` → `onReceive` → `onPrepare` → `onDecide`/`onAbort` 这种类似两阶段提交的生命周期实现
- `propagation-config.xml`（`each-thread-sleep`/`max-thread-sleep`）是用于死锁检测的休眠时间设置，通常的应用开发中无需更改。若要更改数值，应先与用户确认意图
- **接收 intra-mart 标准数据时，`source`/`operationType` 必须与 `assets/standard-listener-usage.md` 清单中所列的值完全一致。** 若使用自行推测的值，会导致接收配置文件不起作用，接收处理在没有任何报错的情况下始终不会被调用
- **向 IM-Box 等 intra-mart 标准功能发送数据时，对应的接收方（Decoder/Procedure）已在 intra-mart 一侧实现完毕，应用侧无需创建接收配置文件。** 仅需实现发送方的完整套件（数据模型・标准提供的 `GenericModel`・发送配置文件）

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. 发送配置文件的 `source`/`operationType` 与接收配置文件的 `source`/`operationType`（或 intra-mart 标准数据情形下 `assets/standard-listener-usage.md` 中记载的值）是否完全一致
2. `Encoder`/`Decoder` 在转换失败时是否抛出 `ConvertException`（或其子类），`Procedure` 在处理失败时是否抛出 `ProcedureException`（或其子类）（是否误将 `PropagationManagerException` 抛出）
3. `PropagationManager` 的会话（`begin()`）在所有执行路径（正常路径・异常路径）下是否都能通过 `decide()`/`abort()`/`close()` 之一确实地结束
4. `GenericModel`（继承 `AbstractGeneric`）类是否正确实现了 `Serializable`，是否定义了 `serialVersionUID`
5. **`Decoder<G, D>` 中指定为 `G` 的类是否具有 `public` 的无参构造函数（自定义类如另行定义了构造函数，需特别确认）。接收 intra-mart 标准数据时，`G` 是否使用了 `jp.co.intra_mart.foundation.propagation.model.generic` 包中对应的 `Generic*` 类而非直接使用领域模型类，是否在部署到生产等同环境之前先在验证环境中确认过**
6. 是否根据接收方 Procedure 是否需要数据库事务，恰当地选择了 `AbstractProcedure`/`AbstractSessionableProcedure`
7. 配置文件的存放位置是否为 `src/main/conf/propagation-senders-config/`・`src/main/conf/propagation-receivers-config/`（而非 `src/main/webapp/WEB-INF/conf/`）
8. 是否符合 `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
9. `jssp-code-review` / `jssp-security-check` 是 JSSP 专用的，不适用于本技能的生成物。若项目中另有面向 Java 的代码审查・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中实现 IM-Propagation 的收发（`PropagationManager`/`Encoder`/`Decoder`/`Procedure`/配置文件）** | **本技能** |
| 在 JSSP（脚本开发模型）中的同等实现 | 尚未提供对应的 SSJS API（不在本技能范围内） |
| IM-Workflow 的动作处理・到达处理等（与 IM-Propagation 相互独立的扩展机制） | `java-im-workflow-usage`（Java）/`jssp-im-workflow-usage`（JSSP） |
| IM-共通主数据（用户・组织等）本身的 CRUD | `java-im-master-usage`。若需通过 IM-Propagation 接收 IM-共通主数据的变更通知，应与本技能配合使用 |
