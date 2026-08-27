---
name: java-im-identifier-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有的唯一 ID 生成 API（`jp.co.intra_mart.foundation.service.client.information.Identifier`）的技能集。提供分布式环境下系统级唯一 ID 获取（`get()`）与应用服务器内唯一 ID 获取（`make()`）的使用区分、异常处理模式。当提及想在 Java 中生成唯一 ID、想在 Java 中使用 Identifier API、想在 JavaEE 开发模型中实现唯一编号处理、想自动编号单据号或记录主键时使用。若要在 JSSP（脚本开发模型）中实现同等处理，且 `d.ts/platform/` 下定义了对应的 SSJS 版 Identifier API，则应改用该 API。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Identifier API（Java 版）使用支持技能

## 目的

用于在 Java 代码中生成单据号、编号键、跟踪 ID 等唯一标识符的技能集，使用 intra-mart Accel Platform 为 **JavaEE 开发模型** 提供的唯一 ID 生成 API（`jp.co.intra_mart.foundation.service.client.information.Identifier`）。

## 两种获取方法的使用区分（最重要）

`Identifier` 类提供两种唯一性保证范围不同的 ID 获取方式。**须首先根据用途决定使用哪一种。**

| 方法 | 签名 | 唯一性保证范围 | 生成字符串长度 | 异常 |
|---------|-----------|-----------------|------------------|------|
| `get()`（实例方法） | `public String get() throws IOException` | **系统整体**（即使在分布式环境・多应用服务器构成下，也通过共同的 Server Manager 保证唯一性） | 15 字节 | `IOException`（与 Server Manager 通信错误） |
| `make()`（静态方法） | `public static String make()` | **仅限应用服务器内**（在进程内唯一，不保证与其他服务器的唯一性） | 13 字节 | 无（无受检异常） |

判断标准:
- **需要在分布式环境（多应用服务器、集群构成）中保证唯一性 → 使用 `get()`。** 业务数据（单据号、申请编号、记录主键等，不得与其他服务器生成的 ID 重复的数据）原则上应使用此方法。
- **仅需在单一进程内闭环的临时标识符（日志跟踪 ID、请求作用域内的关联 ID、仅在单元测试或单进程中运行的处理编号等）即可满足需求 → 使用 `make()`。** 由于无需处理 `IOException`，代码会更简洁。
- 在实际平台代码（`EngineNumberingUtil#createNewNumber()`）中，通常情况下使用 `get()`，仅在单元测试模式等无法连接 Server Manager 的执行环境中才回退到 `make()`。**若用户未明确指定，业务数据的编号应默认使用 `get()`。**

**本技能仅处理 Java 源文件（`.java`）。** 若在 JSSP（`.js`）中实现，应改用 `d.ts/platform/` 下定义的对应 SSJS 版 API（如果存在）。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.github/instructions` 下目前不存在规定 `IOException` 包装方针的 Java 专用规约（截至2026年）。使用 `get()` 时的异常处理应遵循 `assets/identifier-basic-usage.md` 中的模式。

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`Identifier` 类属于 `jp.co.intra_mart.foundation.service.client.information` 包，是 `final` 类（不可继承）。构造函数仅有 `public Identifier()`，不持有状态（可线程安全地调用）。详细的签名・内部结构・相关类请参考 `reference/identifier-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 在分布式环境中编号唯一 ID 的处理（`get()`，包含 `IOException` 处理） | `assets/identifier-basic-usage.md` | 字段/方法中的调用示例、包装为业务异常 |
| 在应用服务器内编号轻量唯一 ID 的处理（`make()`） | `assets/identifier-basic-usage.md` | 日志跟踪 ID・关联 ID 等的调用示例 |

### 参考资料

- `reference/identifier-api-reference.md` — `Identifier` / `IdentifierSpi` / `SystemIdProvider` 的全部方法・签名、生成 ID 的格式、通过 `identifier-config.xml` 进行自定义的方法（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似需求时:
- "创建一个在 Java 中生成唯一 ID 的处理"
- "想在 JavaEE 开发模型中自动编号单据号"
- "想在 Java 中使用 Identifier API 为记录的主键编号"
- "想在 Java 中发行即使在分布式环境下也不重复的 ID"
- "想在 Java 中为日志跟踪 ID 编号"

若未明确说明"在 Java 中"、"在 JavaEE 开发模型中"等，应向用户确认项目现有实现使用的是哪种开发模型。若是在 JSSP（专业代码）画面或函数容器内编号，应改用 SSJS 版 API（如果存在）。

## 实现步骤

1. 听取用户需求（编号 ID 的用途、是否需要分布式环境下的唯一性、编号失败时是否需要业务级错误处理）
2. 决定使用 `get()` 还是 `make()`（参考上表的判断标准。**若用户有明确指定，优先遵循用户指定**；业务数据的编号默认使用 `get()`）
3. 参考 `assets/identifier-basic-usage.md` 实现（方法签名务必参考 `reference/identifier-api-reference.md`，不要凭记忆或推测编写）
4. 使用 `get()` 时，应根据 `assets/identifier-basic-usage.md` 中的模式决定是将 `IOException` 包装为业务异常，还是通过 `throws` 传播（若项目后续新增了 Java 专用的错误处理规约，应优先遵循该规约）
5. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **不要将 `Identifier` 用于生成安全用途的令牌。** 生成的 ID 由时间信息和内部序列号（`get()` 的情况下还包括系统 ID）构成，是可预测的值，并非密码学意义上的安全随机数。对于密码重置令牌・CSRF 令牌・会话 ID 等要求不可预测性的用途，应使用 `java.security.SecureRandom` 等其他 API（不在本技能范围内）
- **`get()` 会抛出 `IOException`。** 由于可能发生与 Server Manager 的通信错误，调用方必须 `try-catch` 或声明 `throws` 将其传播给调用方，不得吞掉异常
- **`make()` 仅在进程内唯一。** 若对可能在多台应用服务器上同时编号的处理（例如集群构成下的单据号发行）使用 `make()`，ID 可能重复。若需求中包含分布式环境下的唯一性，必须使用 `get()`
- **`Identifier` 是不持有状态的类。** 仅在调用 `get()` 时才需要实例化（`new Identifier()`）。`make()` 是静态方法，无需实例化
- 生成的 ID 是由字母数字组成的字符串（36 进制表示）。存入数据库列时，应考虑位数（`get()` 为 15 字节、`make()` 为 13 字节）来设计列长度
- 通过 `identifier-config.xml` 自定义生成算法（替换为自定义的 `IdentifierSpi` 实现）属于平台整体的配置变更，通常在个别应用开发中不需要。仅在用户明确要求时，才参考 `reference/identifier-api-reference.md` 的相应章节进行处理

## 生成后的确认

目前尚未配备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. `get()` / `make()` 的选择是否符合所要求的唯一性范围（分布式环境还是单一进程）
2. 使用 `get()` 的地方是否存在吞掉 `IOException` 的情况
3. 是否误用于安全令牌等要求不可预测性的用途
4. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
5. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目中另有针对 Java 的代码评审・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| SSJS（JSSP）中的唯一 ID 生成实现 | 若存在对应的 SSJS 版 API，则使用该 API（不在本技能范围内） |
| **Java（JavaEE 开发模型）中的唯一 ID 生成实现** | **本技能** |
| Java 中的文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java 中的工作流联动处理 | `java-im-workflow-usage` |
| 用于安全用途的不可预测令牌生成 | 不在本技能范围内（应单独使用 `java.security.SecureRandom` 等实现） |
