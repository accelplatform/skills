---
name: java-im-copilot-rag-generator
description: 用于在 Java（JavaEE 开发模型）中使用 intra-mart IM-Copilot 提供的向量存储 API（`jp.co.intra_mart.foundation.copilot.vectorstore.*`）与聊天/嵌入动作 API（`jp.co.intra_mart.foundation.copilot.action.*`），实现 RAG（检索增强生成）的技能集。提供文档的分块・向量化・向量存储登录（数据准备作业）、混合检索・相似检索・关键词检索、基于检索结果生成回答（Assistant）的实现模式。当用户提及想在 Java 中实现 RAG、想向向量存储登录文档、想使用 `VectorStore`/`VectorStoreBuilder`、想实现混合检索时使用。Tool Calling 请使用 `java-im-copilot-toolcalling-generator`，通过 Agent 框架实现的高层级 RAG（`Knowledge`/`RegisteredKnowledge`）请使用 `java-im-copilot-agent-generator`。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart IM-Copilot RAG（Java 版）使用支持技能

## 目的

支持使用 intra-mart Accel Platform 的 IM-Copilot 提供的 **向量存储 API**（`VectorStore`/`VectorStoreBuilder`）与 **聊天/嵌入动作 API**（`ChatAction`/`EmbeddingsAction`），在 Java 代码中实现 RAG（检索增强生成）的技能集。

## 类结构（最重要）

| 对象 | 类型 | 包 |
|---|---|---|
| 向量存储的构建 | `VectorStoreBuilder` | `jp.co.intra_mart.foundation.copilot.vectorstore.builder` |
| 向量存储本体 | `VectorStore`（登录・删除・各类检索） | `jp.co.intra_mart.foundation.copilot.vectorstore` |
| 文档信息 | `Document`（实现：`StandardRegistrationDocument`）/`ScoredDocument` | `jp.co.intra_mart.foundation.copilot.vectorstore.document` / `jp.co.intra_mart.system.copilot.vectorstore.document` |
| 嵌入生成 | `Embedder`（无默认实现，需包装 `EmbeddingsAction` 自行实现） | `jp.co.intra_mart.foundation.copilot.vectorstore.embedder` |
| 检索排序融合 | `Reranker`（实现：`StandardRrfReranker`） | `jp.co.intra_mart.foundation.copilot.vectorstore.reranker` / `jp.co.intra_mart.system.copilot.vectorstore.reranker` |
| 文本分割 | `TextSplitter`（实现：`RecursiveCharacterTextSplitter`） | `jp.co.intra_mart.foundation.copilot.assistant.splitter` |
| 聊天调用 | `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption` | `jp.co.intra_mart.foundation.copilot.action` / `.action.chat` |
| 嵌入调用 | `EmbeddingsAction`/`EmbeddingsOption` | `jp.co.intra_mart.foundation.copilot.action.embeddings` |
| 聊天界面对接 | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`VectorStore`/`ActionFactory` 是不依赖 `Agent`/`AgentBuilder`（`java-im-copilot-agent-generator` 所涉及的高层级 API）的低层级 Java API。** 适用于需要自行组装文档向量化・检索・聊天调用的场景。若需要使用 Agent 框架的 `Knowledge`/`RegisteredKnowledge` 实现更高抽象层级的 RAG 集成，请使用 `java-im-copilot-agent-generator`（参见「与其他技能的边界」）。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`jssp-*` 系列规约不适用于本技能（不应用于 Java 文件）。

## API 概要

RAG 由「数据准备阶段」（对文档进行分块・向量化并登录到向量存储，由作业调度器执行）与「查询应答阶段」（对用户的提问检索向量存储，基于检索结果生成回答，通过 Assistant 实现）两个阶段构成。通过 `VectorStoreBuilder.builder().useDefault().category(...).embedder(...).build()` 获取 `VectorStore`，并使用 `add`/`deleteAll`/`hybridSearch` 等方法进行操作。聊天・嵌入的调用使用通过 `ActionFactory.getFactory().getChatAction()`/`getEmbeddingsAction()` 获取的 `ChatAction`/`EmbeddingsAction`。详细信息请参照 `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md`（不要凭记忆或推测编写）。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| `Embedder` 适配器的实现 | `assets/rag-basic-usage.md` 模式 1 | 包装 `EmbeddingsAction` 的 `Embedder` 实现 |
| 数据准备作业（分块・向量化・登录） | `assets/rag-basic-usage.md` 模式 2 | `TextSplitter`、`VectorStoreBuilder`、`VectorStore.add`/`deleteAll` |
| 查询应答 Assistant（混合检索・流式回答） | `assets/rag-basic-usage.md` 模式 3 | `VectorStore.hybridSearch`、`ChatAction` 流式处理、`AssistantResponseWriter` |

### 参考资料

- `reference/vectorstore-api-reference.md` — `VectorStoreBuilder`/`VectorStore`/`Document`/`ScoredDocument`/`Embedder`/`Reranker`/`StandardRrfReranker`/`TextSplitter` 的全部方法、签名
- `reference/chat-action-api-reference.md` — `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption`/`EmbeddingsAction`/`EmbeddingsOption`/`MessageTemplate`/`ChatMessageConverter` 的全部方法、签名

均基于平台 API 的实际类定义（不要凭记忆编写）。

## 使用时机

当用户提出以下类似请求时：
- 「想在 Java 中实现 RAG」「想构建检索增强生成的机制」
- 「想向向量存储登录文档」
- 「想使用 `VectorStore`/`VectorStoreBuilder`」
- 「想实现混合检索・相似检索」
- 「想构建基于检索结果进行回答的助手」

若未明确说明是否「用 Java」「以 JavaEE 开发模型」，需向用户确认现有项目采用哪种开发模型。

若请求属于以下范畴，需说明其不在本技能范围内：
- Tool Calling（函数调用） → `java-im-copilot-toolcalling-generator`
- 通过 Agent 框架（`Agent`/`AgentBuilder`）使用 `Knowledge`/`RegisteredKnowledge` 的 RAG → `java-im-copilot-agent-generator`
- MCP 服务器的实现 → `java-im-mcp-generator`

## 实现步骤

1. 向用户收集需求（目标文档的类型・保存位置，检索方式（混合/相似/关键词），是否需要与聊天界面对接）
2. 在 `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md` 中准确确认对应方法（不要凭记忆或推测编写）
3. 参照 `assets/rag-basic-usage.md` 进行实现。按 `Embedder` 适配器（模式 1）→ 数据准备作业（模式 2）→ 查询应答 Assistant（模式 3）的顺序实现较为合适
4. 需要与 IM-Copilot 聊天界面对接时，创建标注了 `@Assistant` 的 `AbstractCopilotAssistant<T>` 子类。**参数类 `T` 必须是 `AssistantParameter` 本身，或其子类**（使用自定义 POJO 会导致聊天界面无法输入提示词）
5. 创建了 Assistant 时，**务必同时完成 `AssistantScanPackageFactory` 的实现・注册，以及 IM-Authz 权限的授予**（二者缺一，助手都不会出现在助手一览中。详见 `java-im-copilot-agent-generator` 的 `reference/assistant-integration-api-reference.md` 中的「对平台的注册」。注册机制本身与 Agent 框架的 Assistant 通用）
6. 数据准备作业需要注册到作业调度器（`job-scheduler.xml` 等租户配置资材，属于 `jssp-tenant-setup-generator` 的范畴）
7. 确认是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **`Document` 不应自行实现。** 直接使用平台提供的标准实现 `jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument`
- **`TextSplitter` 的分割方法为 `splitText(String)`。** 不存在 `split(String)` 方法
- **`VectorStoreBuilder.useDefault()` 应在 `embedder(...)` 之前调用。** `useDefault()` 内部会重置 `embedder` 字段，顺序颠倒会导致 `Embedder` 的设置丢失
- **平台不存在 `Embedder` 的默认实现。** 需要自行实现一个包装 `EmbeddingsAction`（`ActionFactory.getFactory().getEmbeddingsAction()`）的轻量适配器
- **`AbstractCopilotAssistant<T>` 的 `T` 必须是 `AssistantParameter` 本身，或其子类。** 若指定自定义 POJO，聊天界面将无法组装发送消息的输入框，导致无法输入提示词
- **仅添加 `@Assistant` 并不会出现在助手一览中。** 需要同时完成 `AssistantScanPackageFactory` 的注册和 IM-Authz 的权限授予（参见 `java-im-copilot-agent-generator`）
- 从文件中提取文本（解析 PDF・Word 等）本身不在本技能所涉及的向量存储・聊天动作 API 范围内。需根据目标文件格式在应用侧自行实现
- 向量存储的实际后端（Solr・关系数据库等）依赖于租户环境设置。8.0.5 新增的 `list`/`count`/`scanAll` 等部分方法，根据后端不同可能抛出 `UnsupportedOperationException`

## 生成后的确认

并非通过自动验证脚本，而是手动确认以下事项。

1. 是否自行实现了 `Document`（是否使用了 `StandardRegistrationDocument`）
2. `TextSplitter` 的调用方法名是否为 `splitText`
3. `VectorStoreBuilder` 的调用顺序是否为 `useDefault()` → `category(...)` → `embedder(...)` → `useScoreNormalize(...)` → `build()`
4. `Embedder` 适配器是否将 `EmbeddingsAction` 的异常（`CopilotServiceConfigurationException`/`CopilotServiceActionException`）转换为 `EmbedderException`
5. 创建了 Assistant 时，参数类 `T` 是否为 `AssistantParameter` 本身或其子类
6. 创建了 Assistant 时，是否已实现・注册 `AssistantScanPackageFactory`，是否已在 IM-Authz 中为资源 `im-copilot-assistant://assistant/<助手ID>` 授予许可策略
7. 是否符合 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
8. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目另有 Java 专用的代码评审・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中实现 RAG（直接使用 `VectorStore`/`ActionFactory`）** | **本技能** |
| Tool Calling（函数调用。`ChatAction`+`ToolConfig`） | `java-im-copilot-toolcalling-generator` |
| 使用 Agent 框架（`Agent`/`AgentBuilder`）、`Knowledge`/`RegisteredKnowledge` 的高层级 RAG 集成 | `java-im-copilot-agent-generator` |
| MCP 服务器的实现（`@MCPServer`/`@Tool`） | `java-im-mcp-generator` |
