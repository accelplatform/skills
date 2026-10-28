---
name: java-im-secure-token-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 特有的安全令牌 API（`jp.co.intra_mart.foundation.secure_token.SecureTokenManager`，`im_core_base` 模块）的技能集。提供用于 CSRF 防护的令牌签发（`createToken`）・验证（`verify`）、一次性令牌与可重用令牌的选择、通过参数绑定令牌进行篡改检测、通过 `HTTPContextManager` 获取 `HttpServletRequest` 的实现模式。当用户提及想在 Java 中签发/验证 SecureToken、想在 Java 中实现 CSRF 防护、想使用 `SecureTokenManager`、想在不依赖 Web API Maker 的 `@Secured` 的情况下处理安全令牌时使用。若需在 Web API Maker 端点上进行声明式的安全令牌验证，请使用 `java-im-web-api-maker-usage`（`@Secured`）。
---

# intra-mart SecureToken API（Java 版）使用支持技能

## 目的

支持使用 intra-mart Accel Platform 面向 **JavaEE 开发模型** 提供的安全令牌 API（`jp.co.intra_mart.foundation.secure_token.SecureTokenManager`），在 Java 代码中实现 CSRF（跨站请求伪造）防护——即令牌的签发与验证——的技能集。

这是一种用于阻止未经正规流程（显示画面 → 提交表单等）到达的请求的机制，Web API Maker 的 `@Secured` 注解内部也使用了该 API。**本技能针对不依赖 `@Secured`、直接调用 `SecureTokenManager` 的实现**（Servlet、自定义标签、Web API Maker 以外的 Java 端点等）。

## 令牌的生命周期（重要）

`SecureTokenManager` 针对「签发」与「验证」提供了不同的方法组。**须首先根据用途决定使用哪一组、以及使用哪种令牌类型。**

| 阶段 | 方法 | 判断要点 |
|------|---------|-------------|
| 签发 | `createToken(boolean useOneTimeToken)` / `createToken(boolean, Map<String, List<String>>)` | 一次性（`true`）还是可重用（`false`）。**状态变更操作默认使用一次性** |
| 验证 | `verify()` / `verify(String)` / `verify(String, Map<String, List<String>>)` | 自动从请求参数获取令牌，还是显式传入令牌字符串 |

判断基准：
- **一次性的状态变更操作（注册、更新、删除、登录处理等）→ 默认使用 `createToken(true)`（一次性令牌）**
- **同一画面可能多次提交请求的操作（带分页的检索表单等）→ 可考虑使用 `createToken(false)`（可重用令牌）**
- **还需要确认重要参数（金额、权限级别等）在画面跳转过程中未被篡改 → 使用参数绑定令牌**（接受 `Map<String, List<String>>` 的重载；参见 `assets/secure-token-basic-usage.md` 模式 3）

**本技能仅处理 Java 源文件（`.java`）。** JSSP（`.html`/`.js`）中的 CSRF 防护请使用 `<imart type="imSecureToken" />` 标签（参见 `.agents/requirements/jssp-security/AGENTS.md`）或 JSSP 版的令牌验证。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.agents/requirements` 下不存在 SecureToken 实现的 Java 专用规约。异常处理・令牌验证失败时的响应方针请遵循 `assets/secure-token-basic-usage.md` 中的模式。

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。

## API 概要

`SecureTokenManager` 属于 `jp.co.intra_mart.foundation.secure_token` 包，其构造函数需要传入 `ServletRequest`。在未以参数形式传递 `HttpServletRequest` 的场景下，可通过 `HTTPContextManager` 获取。详细的方法签名请务必参照 `reference/secure-token-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| Servlet 中的令牌签发・验证（基本形式） | `assets/secure-token-basic-usage.md` 模式 1 | `doGet`/`doPost` 中 `createToken`/`verify` 的调用示例 |
| 未以参数形式接收 `HttpServletRequest` 的场景下的实现 | `assets/secure-token-basic-usage.md` 模式 2 | 通过 `HTTPContextManager` 获取请求 |
| 参数绑定令牌（篡改检测） | `assets/secure-token-basic-usage.md` 模式 3 | 在签发时与验证时传入相同参数的实现 |
| 一次性/可重用令牌的选择 | `assets/secure-token-basic-usage.md` 模式 4 | 按用途划分的 `createToken` 调用示例 |
| 异常处理・验证失败时的响应 | `assets/secure-token-basic-usage.md` 模式 5 | `SecureTokenException` 与 `verify()` 的 `false` 判定的区分处理 |

### 参考资料

- `reference/secure-token-api-reference.md` — `SecureTokenManager`/`SecureToken`/`SecureTokenException`/`HTTPContextManager` 的全部方法、签名（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似请求时使用本技能：
- 「创建签发・验证 SecureToken 的 Java 代码」
- 「想在 Java 中实现 CSRF 防护」
- 「想使用 `SecureTokenManager`」
- 「想在不使用 Web API Maker 的情况下验证安全令牌」

若未明确说明是否面向 Java 或 JavaEE 开发模型，需向用户确认现有项目采用哪种开发模型。若是 JSSP（脚本开发模型）画面的 CSRF 防护，请使用 `<imart type="imSecureToken" />` 标签（`.agents/requirements/jssp-security/AGENTS.md`）。若是 Web API Maker 端点，请使用 `java-im-web-api-maker-usage` 的 `@Secured`。

## 实现步骤

1. 向用户收集需求（签发与验证的位置、是否为状态变更操作、是否需要参数篡改检测、该场景下是否能直接获取 `HttpServletRequest`）
2. 决定使用一次性令牌还是可重用令牌（参照上表判断基准。**若用户有指定则优先采用**，状态变更操作默认使用一次性）
3. 参照 `assets/secure-token-basic-usage.md` 进行实现（方法签名务必参照 `reference/secure-token-api-reference.md`，不要凭记忆或推测编写）
4. 决定 `HttpServletRequest` 的获取方式（根据是否以参数形式传递，使用 `assets/secure-token-basic-usage.md` 模式 1 或模式 2）
5. 将 `verify()` 返回 `false` 时的响应（如 `403`）与 `SecureTokenException` 的处理分开实现（`assets/secure-token-basic-usage.md` 模式 5）
6. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## 注意事项

- **不要混淆 `verify()` 返回 `false` 与抛出 `SecureTokenException`。** 前者是表示「未经正规流程的访问」的正常判定结果（以 `403` 等拒绝），后者是令牌处理本身的异常（会话不一致等，应作为系统错误处理）
- **`createToken()` 会将令牌存储到与构造函数传入的 `HttpServletRequest` 关联的会话中。** 在会话尚未建立的状态下调用将无法正常工作
- **不要在生产环境中启用仅供开发使用的验证跳过系统属性（`jp.co.intra_mart.foundation.secure_token.SecureTokenManager.ignore_token_check`）。** 这会导致 CSRF 防护失效
- **一次性令牌在验证后会被无效化。** 对已无效化的 `SecureToken` 再次调用 `getString()` 等方法会抛出 `SecureTokenException`
- 若需要在 Web API Maker 端点上进行安全令牌验证，不要直接调用本 API，而应使用 `java-im-web-api-maker-usage` 的 `@Secured`（避免重复实现验证逻辑）

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. 状态变更操作是否使用了一次性令牌，可能多次提交的操作是否使用了可重用令牌
2. `verify()` 的 `false` 判定（拒绝访问）与 `SecureTokenException`（系统错误）是否被区分处理
3. `HttpServletRequest` 的获取方式（直接参数／`HTTPContextManager`）是否符合实现场景
4. 使用参数绑定令牌时，签发与验证是否传入了相同格式的参数
5. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
6. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审/安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| JSSP（脚本开发模型）画面的 CSRF 防护 | `<imart type="imSecureToken" />` 标签（`.agents/requirements/jssp-security/AGENTS.md`） |
| Web API Maker 端点上的声明式安全令牌验证（`@Secured`） | `java-im-web-api-maker-usage` |
| **Java（JavaEE 开发模型）中直接使用 `SecureTokenManager`（Servlet・自定义标签等）** | **本技能** |
