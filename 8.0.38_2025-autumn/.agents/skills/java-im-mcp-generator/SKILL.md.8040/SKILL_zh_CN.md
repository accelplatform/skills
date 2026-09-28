---
name: java-im-mcp-generator
description: 在 intra-mart Accel Platform 上用 Java（JavaEE 开发模型）新建运行的 MCP（Model Context Protocol）服务器。提供基于 `im_copilot_mcp` 模块的 `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`/`Tool` 注解实现 Streamable HTTP MCP 服务器、通过 `SchemaProperties` 定义工具参数、通过 `McpScanPackageFactory`/`META-INF/im_services/annotation_classes` 向平台注册的实现模式。当用户提及想用 Java 构建 MCP 服务器、想在 intra-mart 上实现 MCP 服务器、想使用 `@MCPServer`/`@Tool`、想在 JavaEE 开发模型中为 AI 智能体发布工具时使用。
---

# intra-mart MCP 服务器实现支持技能（Java 版）

## 目的

支持使用 intra-mart Accel Platform 的 `im_copilot_mcp` 模块提供的注解（`@MCPServer`/`@Tool`），仅通过为 Java 类添加注解即可实现 MCP（Model Context Protocol）服务器（Streamable HTTP 传输）的技能集。

**本技能仅处理 Java 源文件（`.java`）以及注册用的配置文件（`META-INF/services/*` 或 `META-INF/im_services/annotation_classes/*`）。**

## MCP 服务器的基本概念（重要）

标注了 `@MCPServer` 的 Java 类本身即作为一个 MCP 服务器发挥作用。该类中标注了 `@Tool` 的 `public` 方法会被公开为 MCP 工具。

```
@MCPServer 类（1 个类 = 1 个 MCP 服务器 = 1 个 URL）
├── @Tool 方法 1（1 个方法 = 1 个 MCP 工具）
├── @Tool 方法 2
└── ...
```

- URL 映射为 `<CONTEXT_PATH>/copilot/mcp<path>`（`path` 为 `@MCPServer.path()` 的值）
- 工具的输入参数由一个 DTO 类表示，该类的字段上标注 `SchemaProperties`（`StringProperty`/`IntegerProperty`/`BooleanProperty`/`NumberProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`）
- **仅添加注解并不会被平台识别。** 必须通过 `McpScanPackageFactory`（推荐）或 `META-INF/im_services/annotation_classes` 之一进行明确注册（详见「MCP 服务器的注册」）

详细的属性签名、注册方式请务必参照 `reference/mcp-annotation-api-reference.md`（不要凭记忆或推测编写）。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.agents/requirements` 下不存在 MCP 服务器实现的专用规约。类命名遵循平台自身实现中观察到的命名惯例，记述于 `assets/mcp-server-basic-usage.md` 的「类结构」中（`Xxx` + `McpServer`、`Xxx` + `McpTool` + `{ToolName}`）。

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。

## API 概要

`@MCPServer`/`@Tool` 属于 `jp.co.intra_mart.foundation.copilot.mcp.annotation` 包（`im_copilot_mcp` 模块）。用于定义参数的 `SchemaProperties`/`SchemaArrayItemProperties` 属于 `jp.co.intra_mart.foundation.copilot.tool.annotation` 包。详细的属性签名请务必参照 `reference/mcp-annotation-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| MCP 服务器的入口类（`@MCPServer`） | `assets/mcp-server-basic-usage.md` 模式 1 | 最小构成的实现示例 |
| 工具参数 DTO（各类 `SchemaProperties`） | `assets/mcp-server-basic-usage.md` 模式 2 | String/Integer/Boolean/Array 各属性类型的使用示例 |
| 使用平台上下文的工具实现 | `assets/mcp-server-basic-usage.md` 模式 3 | 与 `Contexts`/`MessageManager` 的集成 |
| 包注册（`McpScanPackageFactory`） | `assets/mcp-server-basic-usage.md` 模式 4 | 推荐的注册方式 |
| 显式注册（`META-INF/im_services/annotation_classes`） | `assets/mcp-server-basic-usage.md` 模式 5 | 备选的注册方式 |

### 参考资料

- `reference/mcp-annotation-api-reference.md` — `@MCPServer`/`@Tool`/`SchemaProperties`/`SchemaArrayItemProperties`/`McpScanPackageFactory` 的全部属性、签名、依赖声明、URL 映射、注册方式（基于 `im_copilot_mcp` 模块的实际类定义/字节码，不要凭记忆编写）

## 使用时机

当用户提出以下类似请求时使用本技能：
- 「想用 Java 构建 MCP 服务器」
- 「想实现在 intra-mart 上运行的 MCP 服务器」
- 「想使用 `@MCPServer`/`@Tool`」
- 「想在 JavaEE 开发模型中为 AI 智能体发布工具」

若未明确说明是面向 MCP 服务器还是 Java 注解，而只是笼统地说「想创建 REST API」，需向用户确认是要面向 MCP 客户端（AI 智能体）发布工具，还是普通的 REST API。普通 REST API（Web API Maker）请使用 `java-im-web-api-maker-usage`。

## 实现步骤

1. 向用户收集需求（MCP 服务器的 `path`（构成 URL 的一部分）、要发布的工具清单、各工具的输入参数与处理内容）
2. 设计包名与类名（遵循 `.agents/requirements/java-naming/AGENTS.md`。入口类为 `Xxx` + `McpServer`，工具实现类为 `Xxx` + `McpTool` + `{ToolName}`，必要时加 `Parameter`）
3. 在 `pom.xml` 中添加对 `im_copilot_mcp` 的依赖（显式指定版本，参见 `reference/mcp-annotation-api-reference.md` 中的「依赖关系」）。若项目已有该依赖，直接复用，不要重复添加
4. 参照 `assets/mcp-server-basic-usage.md` 实现 `@MCPServer` 类、工具实现类、参数 DTO（属性签名务必参照 `reference/mcp-annotation-api-reference.md`，不要凭记忆或推测编写）
5. **进行 MCP 服务器的注册（严禁省略）。** 若项目已存在 `McpScanPackageFactory` 实现，只需将新类放入其目标包下即可。若没有，则按照 `assets/mcp-server-basic-usage.md` 模式 4 新建
6. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **仅添加 `@MCPServer`/`@Tool` 并不会生效。** 必须完成「MCP 服务器的注册」（`McpScanPackageFactory` 或 `META-INF/im_services/annotation_classes`）。生成后务必检查这一点
- **不要创建多个具有相同 `path` 的 `@MCPServer` 类。** 设计时应确保项目内 `path` 不冲突
- **`@Tool` 方法只能接受一个参数（参数 DTO）。** 多个输入值应汇总到该 DTO 的字段中
- **DTO 字段若未标注对应的 `SchemaProperties`，则不会在 MCP 工具的输入模式中公开。** 仅有 getter/setter 是不够的
- `@Tool` 方法的返回值类型为 `String`。若要返回 JSON，需显式序列化（如使用 Jackson）——不存在类似 Web API Maker 那样的自动响应包装
- `im_copilot_mcp` 的 Maven 依赖须显式指定版本（父 POM 的依赖管理中可能未包含该项）

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. `@MCPServer` 类是否位于某个 `McpScanPackageFactory` 的目标包下，或其完全限定名是否已记载于 `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`
2. `path` 是否与项目内其他 `@MCPServer` 类冲突
3. 参数 DTO 的所有字段是否都标注了与其用途对应的 `SchemaProperties` 注解（`StringProperty`/`IntegerProperty`/`BooleanProperty`/`NumberProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`）
4. 应为必填的参数是否设置了 `required`
5. `@Tool` 的 `description` 是否具体到足以让 LLM 判断该工具的用途与使用场景
6. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审/安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **Java（JavaEE 开发模型）中的 MCP 服务器实现（`@MCPServer`/`@Tool`）** | **本技能** |
| Java（JavaEE 开发模型）中的普通 REST API（Web API Maker） | `java-im-web-api-maker-usage` |
| Java（JavaEE 开发模型）中的 IM-LogicDesigner 扩展任务实现（与 `ElementScanPackageFactory` 相同类型的注册模式） | `java-im-logic-generator` |
