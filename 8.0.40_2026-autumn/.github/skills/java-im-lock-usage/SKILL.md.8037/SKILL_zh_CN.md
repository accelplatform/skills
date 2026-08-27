---
name: java-im-lock-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 专有的应用锁 API（`jp.co.intra_mart.foundation.service.client.information.NewLock`）的技能集。提供分布式环境下基于数据库的互斥控制、普通锁（手动 unlock）与请求作用域锁（自动释放）的使用区分，以及作为 `java.util.concurrent.locks.Lock` 实现的限制。当提及想在 Java 中实现互斥控制、想在 Java 中使用 NewLock API、想在 JavaEE 开发模型中对编号处理或计数器更新进行互斥控制、想在分布式环境中对同一键的处理进行串行化时使用。若要在 JSSP（脚本开发模型）中实现同等处理，且 `d.ts/platform/` 下定义了对应的 SSJS 版 NewLock API，则应改用该 API。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Application Lock API（Java 版）使用支持技能

## 目的

用于在 Java 代码中实现分布式环境下互斥控制（对同一键的处理进行串行化）的技能集，使用 intra-mart Accel Platform 为 **JavaEE 开发模型** 提供的应用锁 API（`jp.co.intra_mart.foundation.service.client.information.NewLock`）。

## 两种锁作用域的使用区分（最重要）

`NewLock` 提供两类释放责任不同的 API。**须首先根据用途决定使用哪一种。**

| 类别 | 主要方法 | 释放责任 | 用途 |
|------|-------------|-----------|------|
| **普通锁** | `lock()` / `tryLock()` / `tryLock(long, TimeUnit)` | **调用方须显式调用 `unlock()`**（必须使用 `try`/`finally`） | 在方法内闭环完成的互斥控制（计数器更新、编号处理等） |
| **请求作用域锁** | `lockRequestScope()` / `tryLockRequestScope()` / `tryLockRequestScope(long, TimeUnit)` | **由平台标准的 `RequestScopeLockReleaseFilter` 在响应返回时自动释放**（无需显式 `unlock()`） | 需要在请求处理的多个位置（跨多个方法・多个类）持续持有锁的场景 |

判断标准:
- **可以在单个方法（或非常接近的作用域）内完成锁的获取与释放 → 使用普通锁。** 以 `try { lock.lock(); ... } finally { lock.unlock(); }` 的形式确保释放
- **锁的获取位置与释放位置相距较远，或需要跨多个方法持续持有锁 → 使用请求作用域锁。** 但这只是把普通锁"忘记释放会导致锁一直残留到下次请求"的风险，替换成了"持续保持到响应返回为止"，因此需注意不要让持有时间过长
- 在实际平台代码（`SimpleNumberCounterEvent#getNumber()`，工作流的编号处理）中，通过 `tryLockRequestScope(timeout, TimeUnit.SECONDS)` 对基于文件的计数器更新进行互斥控制，并在 `finally` 中调用 `unlock()`（即使是请求作用域锁，也可以显式调用 `unlock()`，若想提前释放则可以这样做）
- **若用户未明确指定，应默认使用普通锁（`lock()`/`tryLock()` + `try`/`finally`）。** 仅在明确存在跨作用域需求时才考虑使用请求作用域锁

**本技能仅处理 Java 源文件（`.java`）。** 若在 JSSP（`.js`）中实现，应改用 `d.ts/platform/` 下定义的对应 SSJS 版 API（如果存在）。

## 应参考的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.github/instructions` 下目前不存在规定异常处理方针的 Java 专用规约（截至2026年）。`NewLock` 的异常全部为非受检异常（详见后述），业务异常的包装方针应遵循 `assets/lock-basic-usage.md` 中的模式。

`jssp-*` 规约不适用于本技能（不适用于 Java 文件）。

## API 概述

`NewLock` 类属于 `jp.co.intra_mart.foundation.service.client.information` 包，实现了 `java.util.concurrent.locks.Lock`。由于锁信息在系统数据库中统一管理，即使在分布式环境（多应用服务器构成）下，也可以对同一 `id` 进行互斥控制。详细的签名・内部结构・相关类请参考 `reference/lock-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 在方法内闭环完成的互斥控制（普通锁，通过 `try`/`finally` 确保释放） | `assets/lock-basic-usage.md` | `lock()`/`tryLock(long, TimeUnit)` 的调用示例、`run(Runnable)` 工具方法的使用示例 |
| 跨请求多个位置的互斥控制（请求作用域锁） | `assets/lock-basic-usage.md` | `lockRequestScope()`/`tryLockRequestScope()` 的调用示例 |

### 参考资料

- `reference/lock-api-reference.md` — `NewLock` / `LockController` / `LockControlException` 系列的全部方法・签名，以及 `RequestScopeLockReleaseFilter` 自动释放的机制（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似需求时:
- "创建一个在 Java 中实现互斥控制的处理"
- "想在 JavaEE 开发模型中使用 NewLock API 对计数器更新进行互斥控制"
- "想防止分布式环境中同一键的处理被并发执行"
- "想给编号处理加锁"
- "想让更新处理串行化，即使跨多台服务器也不重复"

若未明确说明"在 Java 中"、"在 JavaEE 开发模型中"等，应向用户确认项目现有实现使用的是哪种开发模型。若是在 JSSP（专业代码）画面或函数容器内进行互斥控制，应改用 SSJS 版 API（如果存在）。

此外，**当互斥控制的对象仅限于单个 JVM 内（同一应用服务器内）的并发处理时**，由于 `NewLock` 需要与系统数据库通信，开销较大，标准的 `java.util.concurrent`（`ReentrantLock`、`synchronized` 等）可能更为合适。应向用户确认是否确实需要分布式环境下的唯一性，若不需要，也应将标准 API 作为备选方案提出。

## 实现步骤

1. 听取用户需求（互斥控制对象键的确定方式、是否需要分布式环境下的互斥控制、是否需要锁获取超时、锁失败时是否需要业务级错误处理）
2. 决定使用普通锁还是请求作用域锁（参考上表的判断标准。**若用户有明确指定，优先遵循用户指定**；若在单个方法内闭环完成，则默认使用普通锁）
3. 参考 `assets/lock-basic-usage.md` 实现（方法签名务必参考 `reference/lock-api-reference.md`，不要凭记忆或推测编写）
4. 设计锁ID（`NewLock` 的构造函数参数）：应使用能唯一表示互斥控制对象的键（例如 `loginGroupId + ":" + 目标资源路径`）。粒度过粗（例如固定的单一字符串）会导致无关处理也被串行化，应避免
5. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **普通锁必须通过 `try`/`finally` 释放。** 应将从 `lock()`/`tryLock()` 之后直到 `finally` 块中 `unlock()` 为止的部分用 `try` 包裹。若忘记释放，后续对同一 ID 的锁获取将永久（或直到超时）被阻塞
- **`NewLock` 的方法均通过非受检异常（`LockControlRuntimeException`）通知失败。** 这与 `Identifier#get()` 的受检异常 `IOException` 设计相反，因此无需声明 `throws`，但若要 `catch`，应针对 `LockControlRuntimeException`
- **`newCondition()` 会抛出 `UnsupportedOperationException`。** 这是 `Lock` 接口的标准功能，但 `NewLock` 不支持。无法基于 `Condition` 实现等待・通知
- **`lockInterruptibly()` 的行为与其名称不符。** 其内部实现仅仅是调用 `lock()`，并未实现真正的中断处理。若确实需要可中断的锁获取，应考虑其他实现
- **请求作用域锁的自动释放由平台标准的 `RequestScopeLockReleaseFilter` 负责。** 应用侧无需显式注册该过滤器。但 `NewLock.releaseRequestScope()`（静态方法）是 `@Deprecated` 且专供该过滤器使用的内部 API，不得从应用代码中直接调用
- **对于完全限于单个 JVM 内的并发处理，`NewLock` 可能显得过重。** 由于涉及与系统数据库的通信，若不需要分布式环境下的唯一性，通常 `java.util.concurrent`（`ReentrantLock` 等）更轻量、更合适
- 注意锁ID的粒度设计。粒度过粗（例如整个应用只用一个固定ID）会导致无关处理也被串行化，成为性能下降与死锁的根源。粒度过细（例如每次请求都使用不同的随机ID）则无法起到互斥控制的作用

## 生成后的确认

目前尚未配备类似 JSSP 版的专用验证脚本（相当于 `validate-jssp-code.js`）。请手动确认以下事项。

1. 使用普通锁的地方，从 `lock()`/`tryLock()` 到 `unlock()` 是否被 `try`/`finally` 确实包裹
2. 普通锁与请求作用域锁的选择是否符合锁的持有作用域（单个方法内，还是跨多个位置）
3. 是否从应用代码中直接调用了 `NewLock.releaseRequestScope()`（`@Deprecated`）
4. 锁ID的粒度是否适合互斥控制的对象（既不过粗也不过细）
5. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` 仅适用于 JSSP，不适用于本技能的生成物。若项目中另有针对 Java 的代码评审・安全检查技能，应使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| SSJS（JSSP）中的互斥控制实现 | 若存在对应的 SSJS 版 API，则使用该 API（不在本技能范围内） |
| **Java（JavaEE 开发模型）中的互斥控制实现** | **本技能** |
| Java 中的文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
| Java 中的唯一 ID 生成（`Identifier`） | `java-im-identifier-usage` |
| Java 中的工作流联动处理 | `java-im-workflow-usage` |
| 仅限于单个 JVM 内的并发控制 | 不在本技能范围内（应单独使用标准 `java.util.concurrent` 类实现） |
