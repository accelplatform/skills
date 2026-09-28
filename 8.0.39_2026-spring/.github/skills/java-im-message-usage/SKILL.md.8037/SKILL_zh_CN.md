---
name: java-im-message-usage
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart 特有的消息获取 API（`jp.co.intra_mart.foundation.security.message.MessageManager`，`im_core_base` 模块）的技能集。提供用户/租户/系统区域设置的解析顺序、占位符替换、消息存在性判断（`hasMessage`）、消息属性文件的配置与键命名规约。当用户提及在 Java 中处理消息属性、在 Java 中进行多语言化/本地化（i18n）、在 Java 中使用 MessageManager、在 JavaEE 开发模型中外部化消息时使用本技能。若需在 JSSP（脚本开发模型）中实现同等处理，请使用 `jssp-localize-support`。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart MessageManager API（Java 版）使用支持技能

## 目的

支持使用 intra-mart Accel Platform 面向 **JavaEE 开发模型** 提供的消息获取 API（`jp.co.intra_mart.foundation.security.message.MessageManager`），编写从消息属性文件中获取标签、错误消息等的 Java 代码实现的技能集。

**本技能仅处理 Java 源文件（`.java`）和消息属性文件（`.properties`）。** JSSP（`.js` / `.html`）的多语言化请使用 `jssp-localize-support`。

## 消息获取方法的选择（重要）

`MessageManager` 提供了区域设置解析范围不同的多组方法。**须首先根据用途决定使用哪一组。**

| 方法组 | 区域设置解析顺序 | 主要用途 |
|-----------|----------------|---------|
| `getMessage(String key, ...)` | 用户 → 租户 → 系统 → 未指定区域设置 | 画面显示用的标签、消息（**应用开发的默认选择**） |
| `getMessage(Locale locale, String key, ...)` | 指定区域设置 → 未指定区域设置 | 日志输出等不希望依赖用户区域设置的场景 |
| `getTenantMessage(String key, String...)` | 租户 → 系统 → 未指定区域设置 | **平台内部使用**。通常应用开发中不使用 |
| `hasMessage(...)` / `hasTenantMessage(...)` | （与对应的 `getMessage` 组相同的解析顺序，仅判断是否存在） | 需要以键是否存在本身作为业务逻辑分支条件时 |

判断基准：
- 画面标签、错误消息等**需要根据登录用户的语言设置区分显示的字符串 → 使用 `getMessage(String key, ...)`。若用户无明确指定，默认使用此方法。**
- 日志输出、审计追踪等**需要在系统范围内固定语言的字符串 → 使用 `getMessage(Locale, String key, ...)`**（显式指定 `Locale.JAPANESE` 等）
- `getTenantMessage` 的 Javadoc 明确记载为「用于获取 intra-mart Accel Platform 内部日志、异常所使用的消息的方法」，通常应用开发中不使用

详细的方法列表、解析顺序、异常规范请务必参照 `reference/message-manager-api-reference.md`（不要凭记忆或推测编写）。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.github/instructions` 下目前不存在定义消息属性文件配置、键命名的 Java 专用规约。本技能采用与 JSSP 侧 `jssp-localize-support` 相同的键命名规约（参见 `assets/message-manager-usage.md` 中的「消息键命名规约」）。若项目已有现有的消息属性文件，请优先遵循其现有键体系。

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。

## API 概要

`MessageManager` 属于 `jp.co.intra_mart.foundation.security.message` 包的 `final` 类，构造函数为 `private`。实例通过 `getInstance()`（单例）获取。详细的方法签名、解析顺序、异常规范请务必参照 `reference/message-manager-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 以用户区域设置获取消息（基本、占位符替换） | `assets/message-manager-usage.md` | `getMessage(key, args...)` 的调用模式 |
| 以显式指定区域设置获取消息（日志输出等） | `assets/message-manager-usage.md` | `getMessage(Locale, key, args...)` 的调用模式 |
| 将消息嵌入业务异常 | `assets/message-manager-usage.md` | 包含 `AccessSecurityException` 处理方式的实现示例 |
| 消息存在性判断 | `assets/message-manager-usage.md` | 使用 `hasMessage` 的分支模式 |
| 消息属性文件（`.properties`）本身 | `assets/message-manager-usage.md` | 键命名规约、native2ascii 转义、配置位置 |

### 参考资料

- `reference/message-manager-api-reference.md` — `MessageManager` / `AccessSecurityException` / `IllegalArgumentException` 的全部方法、签名、区域设置解析顺序、属性文件配置（基于平台 API 的实际类定义，不要凭记忆编写）

## 使用时机

当用户提出以下类似请求时使用本技能：
- 「创建处理消息属性的 Java 代码」
- 「想在 JavaEE 开发模型中将画面标签多语言化」
- 「想在 Java 中使用 MessageManager 获取错误消息」
- 「想把 Java 侧的日志消息外部化到属性文件中」

若未明确说明是 JSSP 还是 Java，需向用户确认现有项目采用哪种开发模型。若是 JSSP（脚本开发模型）画面或函数容器内的多语言化，请使用 `jssp-localize-support`。

## 实现步骤

1. 向用户收集需求（目标字符串应依赖用户区域设置还是系统固定、是否已有现有消息键体系）
2. 决定使用 `getMessage(String key, ...)` 还是 `getMessage(Locale, String key, ...)`（参照上表判断基准。**若用户有指定则优先采用**，画面显示用默认为 `getMessage(String key, ...)`）
3. 确定消息键，并按照 `assets/message-manager-usage.md` 中的「消息键命名规约」创建或追加属性文件（`.properties`，分别对应 `ja`/`en`/`zh_CN`/默认各区域设置）
4. 参照 `assets/message-manager-usage.md` 编写 Java 实现（方法签名务必参照 `reference/message-manager-api-reference.md`，不要凭记忆或推测编写）
5. 决定 `AccessSecurityException` 的处理方式（遵循 `assets/message-manager-usage.md` 中的模式。原则上应向上层传播，或作为内部错误处理）
6. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **即使消息键未定义，`getMessage` / `getTenantMessage` 也不会抛出异常。** 未定义时会回退为 `"undefined"`（或表示「未定义」的消息）。需要判断键是否存在时请使用 `hasMessage` / `hasTenantMessage`
- **`AccessSecurityException` 仅在 `key` / `locale` / `args` 传入 `null` 时抛出。** 表示调用方的实现错误，通常不应作为业务层面进行捕获恢复的对象
- **`jp.co.intra_mart.foundation.security.exception.IllegalArgumentException` 与 `java.lang.IllegalArgumentException` 是不同的类。** 注意不要在 IDE 自动 import 补全时混淆（详见 `reference/message-manager-api-reference.md`）
- **`getTenantMessage` 供平台内部使用。** 应用开发应使用 `getMessage`（用户区域设置）或 `getMessage(Locale, ...)`（显式指定区域设置）
- 消息属性文件中的非 ASCII 字符须以 `\uXXXX` 格式（native2ascii）转义。换行符使用 LF
- 占位符替换遵循 `MessageFormat#format`。消息正文中 `'` 需转义为 `''`，`{` 需转义为 `'{`

## 生成后的确认

并非通过自动验证脚本（如 JSSP 版的 `validate-i18n.js`），而是手动确认以下事项。

1. `getMessage(String key, ...)` / `getMessage(Locale, ...)` / `getTenantMessage` 的选择是否符合所需的区域设置解析范围（依赖用户还是系统固定）
2. 消息键是否符合 `assets/message-manager-usage.md` 中的命名规约（仅用点分隔，禁止下划线、连字符）
3. 属性文件是否齐备 ja / en / zh_CN / 默认各区域设置，且各文件间的键集合是否一致
4. `AccessSecurityException` 是否被吞掉未处理
5. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审/安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| SSJS（JSSP）中的消息多语言化（`<imart type="message">` 标签、SSJS 版 `MessageManager`） | `jssp-localize-support` |
| **Java（JavaEE 开发模型）中的消息属性 / `MessageManager` 实现** | **本技能** |
| Java 的整体架构 / 分层结构 | `java-im-architecture` |
