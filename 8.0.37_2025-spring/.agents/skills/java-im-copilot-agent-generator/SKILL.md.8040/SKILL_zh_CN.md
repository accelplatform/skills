---
name: java-im-copilot-agent-generator
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart IM-Copilot 提供的 Agent 框架（`jp.co.intra_mart.foundation.copilot.agent.*`，`im_copilot_agent` 模块），构建「接收提示词、进行处理、返回响应」的 AI 智能体的技能集。提供通过 `Agent`/`AgentBuilder` 构建智能体、通过 `UserDefinedTool` 实现自定义工具、集成 `Knowledge`（知识检索）、Structured Output（类型化输出）、通过 `AgentExecutionMiddleware` 介入执行流程、通过 Assistant 框架（`AbstractCopilotAssistant`/`@Assistant`）与聊天界面对接的实现模式。当用户提及想在 Java 中构建 AI 智能体、想使用 `Agent`/`AgentBuilder`、想为智能体添加工具・知识・技能、想构建与 IM-Copilot 聊天功能对接的智能体时使用。MCP 服务器的实现请使用 `java-im-mcp-generator`，基于 Web API Maker 的普通 REST API 请使用 `java-im-web-api-maker-usage`。
---

# intra-mart IM-Copilot Agent 框架（Java 版）使用支持技能

## 目的

支持使用 intra-mart Accel Platform 的 IM-Copilot 提供的 **Agent 框架**（`Agent`/`AgentBuilder`，`im_copilot_agent` 模块），在 Java 代码中实现「接收提示词、进行处理、返回响应」的 AI 智能体的技能集。

## 类结构（重要）

| 对象 | 类型 | 包 |
|---|---|---|
| 智能体本体 | `Agent<T>`（接口） | `jp.co.intra_mart.foundation.copilot.agent` |
| 智能体的构建 | `AgentBuilder<T>` | 同上（通过 `Agent.builder()` 获取） |
| 会话历史（有状态执行） | `Session`/`SessionContext` | 同上 |
| 消息 | `Message`（静态工厂方法：`user`/`system`/`assistant`/`tool`） | 同上 |
| 执行结果 | `AgentResponse<T>` | 同上 |
| 系统提示词 | `Instruction`（通过 `instruction(String)` 传入字符串。运行时的值在 Java 中嵌入后再传入） | `jp.co.intra_mart.foundation.copilot.agent.instruction` |
| 自定义工具 | `Tool<I,O>` → `BuiltinTool<I,O>` → `UserDefinedTool<I,O>` | `jp.co.intra_mart.foundation.copilot.agent.tool` |
| 知识（RAG） | `Knowledge`（引用已注册的知识库时用公开 API 实现） | `jp.co.intra_mart.foundation.copilot.agent.knowledge` |
| 技能（Markdown 知识资产） | `SkillEntry` | `jp.co.intra_mart.foundation.copilot.agent.skill` |
| Structured Output | `@Property` 注解 + `AgentBuilder.structuredOutput(Class)` | `jp.co.intra_mart.foundation.copilot.agent.structured` |
| 介入执行流程 | `AgentExecutionMiddleware`（责任链模式） | `jp.co.intra_mart.foundation.copilot.agent.middleware` |
| 聊天界面对接 | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |
| 读取在画面中定义的智能体 | `AgentManagementService`（`AgentManagementServiceFactory.getInstance().getService()`） | `jp.co.intra_mart.foundation.copilot.agent.definition` |

**`Agent`/`AgentBuilder` 是普通的 Java 对象，只需 `Agent.builder()...build()` 后调用 `run()`/`runStreaming()`，即可从 Web API Maker 端点、作业等任意 Java 代码中直接使用。** 仅当需要与 IM-Copilot 的聊天界面（会话线程管理・消息历史持久化・流式响应等，详见后文）对接时，才需要用 `AbstractCopilotAssistant` 进行包装。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **必读** — 类/方法 JavaDoc |

`.agents/requirements` 下不存在 Agent 框架实现的 Java 专用规约。自定义工具的输入参数 DTO 上所使用的 `SchemaProperties` 注解，与 MCP 工具（`java-im-mcp-generator`）使用的是同一个注解类（`jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`），记法上也可参照该技能的 `reference/mcp-annotation-api-reference.md`。

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。

## API 概要

`Agent`/`AgentBuilder` 属于 `im_copilot_agent` 模块（依赖 `im_copilot_core`/`im_copilot_base`）。通过 `Agent.builder()` 获取 `AgentBuilder<?>`，设置 `model`/`instruction`/各类工具/`knowledge`/`skill`/`middleware` 等后调用 `build()`，即可得到 `Agent<T>`（未设置 Structured Output 时 `T` 为 `?`）。智能体的执行分为 `run(...)`（同步・获取返回值）与 `runStreaming(...)`（按块回调）两大系列，各自又分为无状态执行（内部使用临时会话）与有状态执行（显式复用 `Session`，保留会话历史）。详细信息请参照 `reference/agent-core-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 构建最小配置的智能体并直接调用 | `assets/copilot-agent-basic-usage.md` 模式 1 | `Agent.builder()...build()`、`run(String)` |
| 有状态会话（保留历史） | `assets/copilot-agent-basic-usage.md` 模式 2 | `Session`、`run(Session, String)` |
| 为智能体添加自定义工具 | `assets/copilot-agent-basic-usage.md` 模式 3 | `UserDefinedTool` 实现、通过 `SchemaProperties` 和 `ToolDefinition.builder().parametersFromClass(...)`（`action.chat`）生成输入模式 |
| 强制类型化输出（Structured Output） | `assets/copilot-agent-basic-usage.md` 模式 4 | 标注了 `@Property` 的 DTO、`AgentBuilder.structuredOutput(Class)` |
| 介入执行流程（日志・监控・护栏） | `assets/copilot-agent-basic-usage.md` 模式 5 | `AgentExecutionMiddleware` |
| 引用已注册的知识库 | `assets/copilot-agent-basic-usage.md` 模式 6 | `Knowledge` 的实现、`AgentBuilder.knowledge(...)` |
| 让智能体使用已注册的技能 | `assets/copilot-agent-basic-usage.md` 模式 7 | 在画面的智能体定义中设置技能，并按模式 11 调用 |
| 与 IM-Copilot 聊天界面对接 | `assets/copilot-agent-basic-usage.md` 模式 8 | `@Assistant` + `AbstractCopilotAssistant` |
| 让平台识别 Assistant（与模式 8 成对） | `assets/copilot-agent-basic-usage.md` 模式 9 | 确认构建时自动生成的索引（`META-INF/im_services/annotation_classes`），授予 IM-Authz 权限 |
| 将自定义工具注册为内置工具（可在管理画面中选择） | `assets/copilot-agent-basic-usage.md` 模式 10 | `@Tool`（代理用）、`ToolCategory`、确认构建时自动生成的索引（`META-INF/im_services/annotation_classes`） |
| 读取并运行在画面（Accel Agent）中定义的智能体 | `assets/copilot-agent-basic-usage.md` 模式 11 | `AgentManagementService`，通过 `resolvePublishedVersion` 确定公开中的版本后调用 `getAgent(agentId, version)` |

### 参考资料

- `reference/agent-core-api-reference.md` — `Agent`/`AgentBuilder`/`Message`/`AgentResponse`/`Session`/`Instruction`/`RunContext`/`ModelConfig`/`AgentManagementService` 的全部方法、签名
- `reference/tool-knowledge-skill-api-reference.md` — `Tool`/`UserDefinedTool`/`ToolDefinition`/`AbstractToolDefinition`、`Knowledge`、`SkillEntry`、Structured Output（`@Property`）、`AgentExecutionMiddleware` 的全部方法、签名
- `reference/assistant-integration-api-reference.md` — `@Assistant`/`AbstractCopilotAssistant`/`AssistantMessage`/`AssistantResult`/`AssistantResponseWriter` 的全部方法、签名

均基于平台 API 的实际类定义（不要凭记忆编写）。

## 使用时机

当用户提出以下类似请求时使用本技能：
- 「想在 Java 中构建 AI 智能体」「想构建接收提示词并处理的智能体」
- 「想使用 `Agent`/`AgentBuilder`」
- 「想为智能体添加自定义工具（函数调用）」
- 「想以类型化（JSON）形式接收智能体的响应」
- 「想对智能体的执行进行日志记录・监控，想添加护栏」
- 「想构建与 IM-Copilot 聊天界面对接的智能体」
- 「想从 Web API・作业・Assistant 调用在画面（Accel Agent）中定义的智能体」

若未明确说明是否面向 Java 或 JavaEE 开发模型，需向用户确认现有项目采用哪种开发模型。

若请求属于以下范畴，需说明其不在本技能范围内：
- MCP 服务器的实现（`@MCPServer`/`@Tool`） → `java-im-mcp-generator`
- 带认证方式的普通 REST API（Web API Maker） → `java-im-web-api-maker-usage`
- IM-LogicDesigner 的逻辑流程元素 → `java-im-logic-generator`
- Agent Designer（无代码智能体定义界面）自身的实现・扩展 → 不在本技能范围内（从 Java 调用在画面中定义的智能体由模式 11 涉及）
- 直接使用 `VectorStore`/`ActionFactory` 的低层级 RAG 实现（不使用 Agent 框架的 `Knowledge`） → `java-im-copilot-rag-generator`
- 直接使用 `ChatAction`+`ToolConfig` 的低层级 Tool Calling 实现（不使用 Agent 框架的 `UserDefinedTool`/Agent Loop） → `java-im-copilot-toolcalling-generator`

## 实现步骤

1. 向用户收集需求（以何种方式调用——直接从 Java 代码调用，还是通过 IM-Copilot 聊天界面；是否需要工具・知识・技能；是否需要类型化输出；无状态还是有状态）
2. 在 `reference/agent-core-api-reference.md`/`reference/tool-knowledge-skill-api-reference.md`/`reference/assistant-integration-api-reference.md` 中准确确认对应方法（不要凭记忆或推测编写）
3. 参照 `assets/copilot-agent-basic-usage.md` 进行实现
4. 实现自定义工具时，为输入参数 DTO 的**所有字段**添加 `SchemaProperties` 注解，并通过公开 API `ToolDefinition.builder().parametersFromClass(...)`（`jp.co.intra_mart.foundation.copilot.action.chat`）生成模式。若要作为可在管理画面中选择的内置工具，请在类上标注 `@Tool`。构建后，确认 `target/classes`（或 jar）中的 `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool` 记载了 `@Tool` 类的完全限定名（模式 10）
5. 需要与 IM-Copilot 聊天界面对接时，创建标注了 `@Assistant` 的 `AbstractCopilotAssistant<T>` 子类（在 `doExecute` 内构建并执行 `Agent`）。**参数类 `T` 必须是 `AssistantParameter`（`jp.co.intra_mart.foundation.copilot.assistant.model`）本身，或其子类**（参见 `reference/assistant-integration-api-reference.md` 中的「`AssistantParameter`」；使用自定义 POJO 会导致聊天界面无法输入提示词）
6. 创建了 Assistant 时，**务必授予 IM-Authz 权限**（未授予时，Assistant 不会出现在助手一览中。`@Assistant` 类通过构建时自动生成的索引被识别，因此无需实现 `AssistantScanPackageFactory`。参见 `assets/copilot-agent-basic-usage.md` 模式 9）
7. 确认是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## 注意事项

- **`Agent`/`AgentBuilder` 是不依赖 Assistant 框架的独立 Java API。** 可从 Web API Maker 端点或作业直接调用 `Agent.builder()...build().run(...)`。仅当需要与 IM-Copilot 聊天界面（会话线程管理・流式响应・消息持久化）对接时，才用 `AbstractCopilotAssistant` 包装
- **在画面（Accel Agent）中定义的智能体，先通过 `AgentManagementService` 的 `resolvePublishedVersion(agentId, null)` 确定公开中的版本，再通过 `getAgent(agentId, version)` 读取（模式 11）。** 不指定版本的 `getAgent(agentId)` 不论公开状态都会读取最新版本，因此会运行画面中正在编辑的版本。`AgentManagementService` 不进行授权，是否允许执行智能体需在调用方的画面・API 中确认
- **`UserDefinedTool<I,O>` 的 `getDefinition()` 必须返回 `ToolDefinition`。** 由于 `AbstractToolDefinition` 不实现 `isEnabled()`，需自行准备实现了 `isEnabled()` 的子类，或使用其他具体实现（参照 `reference/tool-knowledge-skill-api-reference.md`）
- **工具输入参数 DTO 上所用的 `SchemaProperties` 与 `java-im-mcp-generator` 的 MCP 工具使用的是同一注解类。** 若记法有疑问，也可参照 `java-im-mcp-generator` 的 `reference/mcp-annotation-api-reference.md`
- **`AgentExecutionMiddleware` 是通过 `intercept(InvocationContext, Chain)` 介入执行流程的责任链模式。** 即使是通过 `Agent.builder()` 构建的智能体，平台也会自动加入执行记录，执行会显示在追踪列表中，因此不要为记录而编写 middleware。仅在有追踪无法满足的目的（如在自己的画面上显示执行进度）时（观测系。自行捕获观测处理的异常以实现 fail-open），以及需在校验・护栏等场景下中止处理时（控制系。fail-closed）才自行编写，两者都应实现公开接口 `AgentExecutionMiddleware`（不要继承非公开 API `ObservabilityMiddleware`）
- **通过 ID 引用知识管理中已注册的知识时，应实现 `Knowledge`（模式 6）。** 检索使用公开 API `KnowledgeServiceFactory`・`KnowledgeSearchRepositoryFactory`，不要使用非公开 API `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge`
- **没有从 Java 获取技能管理中已注册技能的公开 API。** 要让智能体使用技能时，在画面的智能体定义中设置技能，并按模式 11 的方法调用该智能体（模式 7）。`SkillEndpointFactory` 用于 Web API Maker 的 REST 端点，未作为 Java 使用的 API 公开；`jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` 是非公开 API，两者都不要使用。工具执行具体操作，而技能记述的是工具的使用方法・判断标准・步骤等知识资产
- **使用 Structured Output（`AgentBuilder.structuredOutput(Class)`）会改变 `Agent<T>` 的类型参数。** 应像 `Agent.<T>builder()` 那样显式指定类型，或将 `structuredOutput` 的返回值接收到新变量中（重新赋值给同一个构建器变量会导致类型不匹配）
- **`@Assistant` 类通过构建时自动生成的索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`）被平台识别。** 无需实现 `AssistantScanPackageFactory`，也无需在 `META-INF/services` 中注册。要显示在助手一览中，需在 IM-Authz 中为资源 `im-copilot-assistant://assistant/<助手ID>`（资源类型 `im-copilot-assistant`，操作 `execute`）授予许可策略（资源本身会在服务器启动时自动导入，但许可策略不会自动授予）。详见 `assets/copilot-agent-basic-usage.md` 模式 9
- **`AbstractCopilotAssistant<T>` 的 `T` 必须是 `AssistantParameter` 本身，或其子类。** 若指定了仅含自定义字段的不兼容 POJO，会导致运行时参数解析器无法处理而抛出异常，同时聊天界面也无法为发送消息组装输入框——助手会出现在一览中，但选中后无法输入提示词。用户发言应通过继承而来的 `getMessage().getContents()` 获取。详见 `reference/assistant-integration-api-reference.md` 中的「`AssistantParameter`」及 `assets/copilot-agent-basic-usage.md` 模式 8
- Knowledge 的内容源接入・向量化・检索的内部实现，以及 MCP 工具的 OAuth 集成部分，均为平台内部实现，并非应用开发者需要直接实现的对象。应用开发者所涉及的范围止于 `Knowledge` 等公开 API
- **`AgentBuilder<T>` 无法被继承。** 其构造函数（`AgentBuilder()`）为包私有（package-private），在 `jp.co.intra_mart.foundation.copilot.agent` 包之外 `extends` 该类会导致编译错误（隐式的 `super()` 调用无法访问）。若需按条件切换设置，不应继承，而应将构建器保存到 `AgentBuilder<?>` 类型的变量中，按条件继续调用方法后再执行 `build()`（不要把 `Agent.builder()...build()` 写成一整条链式调用，应先把中间的构建器赋值给变量）
- **`AgentBuilder.model(String)` 可以省略。** 省略时，底层的 `ChatOption.model` 将保持为 `null`，并回退到租户驱动配置（`conf/im-copilot-driver-config.xml`）中设置的默认模型。若显式指定了驱动不识别的模型ID，会在运行时出现 `invalid model ID` 等错误而失败
- **AI 服务调用失败时，异常消息有时会被统一归纳为一种通用措辞（例如「在 OpenAI 执行聊天失败」），而不区分具体原因。** 实际的失败原因（HTTP 状态码、响应体等）保存在异常的 cause 链深处，因此排查问题时，除了顶层的 `getMessage()` 之外，还应沿着 `getCause()` 追溯

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. 是直接调用 `Agent`/`AgentBuilder` 的结构，还是用 `AbstractCopilotAssistant` 包装的结构，是否与需求一致
2. 自定义工具的 `getDefinition()` 是否正确实现（包括 `isEnabled()`），输入 DTO 是否添加了 `SchemaProperties`
3. 使用 Structured Output 时，`Agent<T>` 的类型参数是否保持一致
4. Middleware 是观测系（捕获观测处理的异常・fail-open）还是控制系（让异常传播・fail-closed），是否与需求一致
5. `AgentException`/`CopilotAssistantException` 等受检异常是否被吞掉未处理
6. 创建了 Assistant 时，参数类 `T` 是否为 `AssistantParameter` 本身或其子类（若仍为自定义 POJO，聊天界面将无法输入提示词）
7. 创建了 Assistant 时，构建产物的索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`）中是否记载了 `@Assistant` 类的完全限定名，是否已在 IM-Authz 中为资源 `im-copilot-assistant://assistant/<助手ID>` 授予许可策略（没有许可策略则不会出现在助手一览中）
8. 是否符合 `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
9. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审/安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中实现 AI 智能体（`Agent`/`AgentBuilder`、Assistant 对接）** | **本技能** |
| 直接使用 `VectorStore`/`ActionFactory` 的低层级 RAG 实现 | `java-im-copilot-rag-generator` |
| 直接使用 `ChatAction`+`ToolConfig` 的低层级 Tool Calling 实现 | `java-im-copilot-toolcalling-generator` |
| MCP 服务器的实现（`@MCPServer`/`@Tool`） | `java-im-mcp-generator` |
| 基于 Web API Maker 的普通 REST API | `java-im-web-api-maker-usage` |
| IM-LogicDesigner 的逻辑流程元素 | `java-im-logic-generator` |
