---
name: java-im-copilot-toolcalling-generator
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart IM-Copilot 提供的、与提供商无关的 Tool Calling API（`jp.co.intra_mart.foundation.copilot.action.chat.ChatAction`+`ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`），为 AI 助手实现函数调用（Function Calling / Tool Use）的技能集。提供在 OpenAI・Azure OpenAI Service・Amazon Bedrock 任一租户驱动下均以相同代码工作的、非流式与流式两种实现模式。当用户提及想在 Java 中实现 Tool Calling / Function Calling、想让 AI 助手调用外部函数、想使用 `ChatAction`+`ToolConfig` 时使用。通过 Agent 框架实现的高层级 Tool Calling（`UserDefinedTool`）请使用 `java-im-copilot-agent-generator`，RAG（检索增强生成）请使用 `java-im-copilot-rag-generator`。
---

# intra-mart IM-Copilot Tool Calling（Java 版）使用支持技能

## 目的

支持使用 intra-mart Accel Platform 的 IM-Copilot 提供的 **与提供商无关的 Tool Calling API**（`ChatAction`+`ToolConfig`），在 Java 代码中实现 AI 助手的函数调用（Function Calling / Tool Use）的技能集。

## 类结构（最重要）

| 对象 | 类型 | 包 |
|---|---|---|
| 聊天调用（支持 Tool Calling） | `ChatAction`（通过 `ActionFactory.getFactory().getChatAction()` 获取） | `jp.co.intra_mart.foundation.copilot.action.chat` |
| 工具配置 | `ToolConfig`（`ToolDefinition` 列表 + `ToolChoice`） | 同上 |
| 工具定义 | `ToolDefinition`（从标注了 `SchemaProperties` 的 DTO 自动生成 JSON Schema） | 同上 |
| 工具选择方式 | `ToolChoice`（`auto`/`none`/`required`/`tool（指定名称）`） | 同上 |
| 工具调用信息 | `ToolCall`（`id`/`name`/`arguments`） | 同上 |
| 工具参数的校验・转换 | `JsonSchemaValidator`/`ToolJsonHelper` | `jp.co.intra_mart.foundation.copilot.tool` |
| 聊天界面对接 | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`ChatAction`+`ToolConfig` 是在 OpenAI・Azure OpenAI Service・Amazon Bedrock 任一租户驱动下均以相同代码工作的、与提供商无关的 API。** 无需按驱动类型分别使用不同的请求/响应类（`ActionFactory` 会根据租户设置自动解析对应实现）。

**`Agent`/`AgentBuilder`（`java-im-copilot-agent-generator` 所涉及的高层级 API）的 `UserDefinedTool`，是内置了 Agent Loop（工具调用〜结果反映的循环）的、抽象度更高的 Tool Calling。** 本技能的 `ChatAction`+`ToolConfig` 是需要自行搭建该 Agent Loop 的、更底层的 API。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。附加在工具输入参数 DTO 上的 `SchemaProperties` 注解，与 `java-im-mcp-generator`/`java-im-copilot-agent-generator` 的 `UserDefinedTool` 使用的是同一个类（`jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`）。

## API 概要

向 `ChatAction.execute(messages, option, toolConfig)`（非流式）/`execute(messages, option, toolConfig, handler)`（流式）传入持有 `ToolDefinition` 列表与 `ToolChoice` 的 `ToolConfig`，执行聊天。当响应中包含工具调用（`ToolCall`）时，由应用侧执行工具，将结果作为 `tool` 角色的消息追加后再次调用 `execute(...)`——通过这样的往返（至少调用 2 次）完成整个流程。详情请参照 `reference/toolcalling-api-reference.md`（本技能）・`reference/chat-action-api-reference.md`（`java-im-copilot-rag-generator`）（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 非流式的 Tool Calling | `assets/toolcalling-basic-usage.md` 模式 1 | `ChatAction.execute(messages, option, toolConfig)`、`ToolCall` 的校验・执行、结果消息的构建 |
| 流式的 Tool Calling | `assets/toolcalling-basic-usage.md` 模式 2 | `ChatAction.execute(messages, option, toolConfig, handler)`、从数据块累积・合并 `ToolCall` |

### 参考资料

- `reference/toolcalling-api-reference.md` — `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`/`JsonSchemaValidator`/`ToolJsonHelper` 的全部方法、签名，以及使用 Amazon Bedrock 驱动时的约束
- `java-im-copilot-rag-generator` 的 `reference/chat-action-api-reference.md` — `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption` 等，作为 Tool Calling 基础的 Action API 全貌

均基于平台 API 的实际类定义（不要凭记忆编写）。

## 使用时机

当用户提出以下类似请求时：
- 「想在 Java 中实现 Tool Calling / Function Calling」
- 「想让 AI 助手调用外部函数・API」
- 「想使用 `ChatAction`+`ToolConfig`」
- 「想在 OpenAI/Azure OpenAI/Amazon Bedrock 上实现函数调用」

若未明确说明是否面向 Java 或 JavaEE 开发模型，需向用户确认现有项目采用哪种开发模型。

若请求属于以下范畴，需说明其不在本技能范围内：
- RAG（检索增强生成） → `java-im-copilot-rag-generator`
- 通过 Agent 框架（`Agent`/`AgentBuilder`）的 `UserDefinedTool`（内置 Agent Loop 的高层级 Tool Calling） → `java-im-copilot-agent-generator`
- MCP 服务器的实现 → `java-im-mcp-generator`

## 实现步骤

1. 向用户收集需求（想要调用的工具内容・参数、是否需要流式响应、目标驱动（OpenAI/Azure OpenAI/Amazon Bedrock）之间存在差异的功能是否需要）
2. 在 `reference/toolcalling-api-reference.md`・`java-im-copilot-rag-generator` 的 `reference/chat-action-api-reference.md` 中准确确认对应方法（不要凭记忆或推测编写）
3. 为工具的参数 DTO 附加 `SchemaProperties` 注解，通过 `ToolDefinition.builder().parametersFromClass(...)` 生成模式
4. 参照 `assets/toolcalling-basic-usage.md` 进行实现。建议先从非流式（模式 1）着手，如有需要再扩展为流式（模式 2）
5. 需要与 IM-Copilot 聊天界面对接时，创建标注了 `@Assistant` 的 `AbstractCopilotAssistant<T>` 子类。**参数类 `T` 必须是 `AssistantParameter` 本身，或其子类**（使用自定义 POJO 会导致聊天界面无法输入提示词）
6. 创建了 Assistant 时，**务必同时完成 `AssistantScanPackageFactory` 的实现・注册，以及 IM-Authz 权限的授予**（二者缺一，助手都不会出现在助手一览中。详情请参照 `java-im-copilot-agent-generator` 的 `reference/assistant-integration-api-reference.md`「向平台注册」）
7. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## 注意事项

- **`ChatAction`+`ToolConfig` 在 OpenAI・Azure OpenAI Service・Amazon Bedrock 任一租户驱动下均以相同代码工作。** 无需直接使用驱动特有的请求/响应类
- **`CopilotServiceConfigurationException`/`CopilotServiceActionException` 是 `CopilotServiceException` 的子类。** 若试图用 `multi-catch`（`catch (A | B e)`）将它们合并捕获会导致编译错误。应用基类 `CopilotServiceException` 统一捕获
- **流式方式下不会返回响应消息（`ChatMessage`）本身。** 需自行从数据块（`ChunkChatMessageDelta.getToolCalls()`）累积・合并工具调用信息（`ToolCall`），并在第 2 次调用用的消息中显式追加 `assistant` 的工具调用信息
- **使用 Amazon Bedrock 驱动时存在约束**（`ToolDefinition.strict` 被忽略、`ToolChoice.none()` 不可用、`addImageUrl` 不可用、系统消息仅最新 1 条有效）。若实现需兼容多种驱动，应避免触及这些约束
- **工具调用的参数不一定完全符合模式定义。** 建议先用 `JsonSchemaValidator.isValid(...)` 校验，再用 `ToolJsonHelper.deserialize(...)` 反序列化
- **`AbstractCopilotAssistant<T>` 的 `T` 必须是 `AssistantParameter` 本身，或其子类。** 使用自定义 POJO 会导致聊天界面无法输入提示词
- **仅附加 `@Assistant` 并不会出现在助手一览中。** 需同时完成 `AssistantScanPackageFactory` 的注册，以及 IM-Authz 的权限授予（参照 `java-im-copilot-agent-generator`）

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. `ToolDefinition` 的参数 DTO 上是否正确附加了 `SchemaProperties` 注解
2. 工具调用有无的判定（`toolCalls == null || toolCalls.isEmpty()`）与工具执行结果消息的构建（`addToolTextContent`/`addToolImageData`）是否正确实现
3. 流式实现时，是否正确地从数据块合并 `ToolCall`（依据有无 `id` 分支处理），以及是否在第 2 次调用用的消息中显式追加了 `assistant` 的工具调用信息
4. 异常的 `catch` 是否因 `CopilotServiceException` 的继承关系而发生编译错误
5. 创建了 Assistant 时，参数类 `T` 是否为 `AssistantParameter` 本身或其子类
6. 创建了 Assistant 时，是否已实现・注册 `AssistantScanPackageFactory`，是否已在 IM-Authz 中为资源 `im-copilot-assistant://assistant/<助手ID>` 授予许可策略
7. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
8. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中实现 Tool Calling（直接使用 `ChatAction`+`ToolConfig`）** | **本技能** |
| RAG（检索增强生成，直接使用 `VectorStore`/`ActionFactory`） | `java-im-copilot-rag-generator` |
| 使用 Agent 框架（`Agent`/`AgentBuilder`）、`UserDefinedTool` 的高层级 Tool Calling（内置 Agent Loop） | `java-im-copilot-agent-generator` |
| MCP 服务器的实现（`@MCPServer`/`@Tool`） | `java-im-mcp-generator` |
</content>
