---
name: java-im-copilot-rag-generator
description: A skill set for using intra-mart IM-Copilot's vector store API (`jp.co.intra_mart.foundation.copilot.vectorstore.*`) and chat/embeddings action API (`jp.co.intra_mart.foundation.copilot.action.*`) in Java (JavaEE development model) to implement RAG (Retrieval-Augmented Generation). Provides implementation patterns for document chunk splitting, vectorization, and registration to the vector store (data preparation jobs), hybrid search / similarity search / keyword search, and answer generation based on search results (Assistant). Use this when the user mentions implementing RAG in Java, registering documents to a vector store, using `VectorStore`/`VectorStoreBuilder`, or implementing hybrid search. For Tool Calling, use `java-im-copilot-toolcalling-generator`; for higher-level RAG via the Agent framework (`Knowledge`/`RegisteredKnowledge`), use `java-im-copilot-agent-generator`.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart IM-Copilot RAG (Java) Support Skill

## Purpose

A skill set for implementing RAG (Retrieval-Augmented Generation) in Java code using the **vector store API** (`VectorStore`/`VectorStoreBuilder`) and **chat/embeddings action API** (`ChatAction`/`EmbeddingsAction`) provided by intra-mart Accel Platform's IM-Copilot.

## Class Structure (Most Important)

| Target | Type | Package |
|---|---|---|
| Building the vector store | `VectorStoreBuilder` | `jp.co.intra_mart.foundation.copilot.vectorstore.builder` |
| The vector store itself | `VectorStore` (registration, deletion, various searches) | `jp.co.intra_mart.foundation.copilot.vectorstore` |
| Document information | `Document` (implementation: `StandardRegistrationDocument`) / `ScoredDocument` | `jp.co.intra_mart.foundation.copilot.vectorstore.document` / `jp.co.intra_mart.system.copilot.vectorstore.document` |
| Embedding generation | `Embedder` (no default implementation; implement yourself by wrapping `EmbeddingsAction`) | `jp.co.intra_mart.foundation.copilot.vectorstore.embedder` |
| Search rank fusion | `Reranker` (implementation: `StandardRrfReranker`) | `jp.co.intra_mart.foundation.copilot.vectorstore.reranker` / `jp.co.intra_mart.system.copilot.vectorstore.reranker` |
| Text splitting | `TextSplitter` (implementation: `RecursiveCharacterTextSplitter`) | `jp.co.intra_mart.foundation.copilot.assistant.splitter` |
| Chat invocation | `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption` | `jp.co.intra_mart.foundation.copilot.action` / `.action.chat` |
| Embeddings invocation | `EmbeddingsAction`/`EmbeddingsOption` | `jp.co.intra_mart.foundation.copilot.action.embeddings` |
| Chat UI integration | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`VectorStore`/`ActionFactory` are low-level Java APIs that do not depend on `Agent`/`AgentBuilder` (the higher-level API handled by `java-im-copilot-agent-generator`).** Use them when you need to build document vectorization, search, and chat invocation yourself. If you need a more abstract level of RAG integration using the Agent framework's `Knowledge`/`RegisteredKnowledge`, use `java-im-copilot-agent-generator` (see "Boundaries with Other Skills").

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.claude/rules/java-naming.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.claude/rules/java-code-style.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.claude/rules/java-javadoc.md` | 🟢 **Required reading** — class/method Javadoc |

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

RAG consists of two phases: a "data preparation phase" (splitting and vectorizing documents, then registering them to the vector store; executed via the job scheduler) and a "query response phase" (searching the vector store for a user's question and generating an answer based on the search results; implemented via an Assistant). Obtain a `VectorStore` via `VectorStoreBuilder.builder().useDefault().category(...).embedder(...).build()`, and operate on it with `add`/`deleteAll`/`hybridSearch`, etc. For chat and embeddings invocation, use the `ChatAction`/`EmbeddingsAction` obtained via `ActionFactory.getFactory().getChatAction()`/`getEmbeddingsAction()`. See `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md` for details (do not write from memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|--------------------|----------|---------|
| Implementing an `Embedder` adapter | `assets/rag-basic-usage.md` Pattern 1 | An `Embedder` implementation wrapping `EmbeddingsAction` |
| Data preparation job (splitting, vectorizing, registration) | `assets/rag-basic-usage.md` Pattern 2 | `TextSplitter`, `VectorStoreBuilder`, `VectorStore.add`/`deleteAll` |
| Query response Assistant (hybrid search, streaming answer) | `assets/rag-basic-usage.md` Pattern 3 | `VectorStore.hybridSearch`, `ChatAction` streaming, `AssistantResponseWriter` |

### Reference

- `reference/vectorstore-api-reference.md` — All methods and signatures for `VectorStoreBuilder`/`VectorStore`/`Document`/`ScoredDocument`/`Embedder`/`Reranker`/`StandardRrfReranker`/`TextSplitter`
- `reference/chat-action-api-reference.md` — All methods and signatures for `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption`/`EmbeddingsAction`/`EmbeddingsOption`/`MessageTemplate`/`ChatMessageConverter`

Both are based on the actual platform API class definitions (do not write from memory).

## When to Use

Use this skill when the user makes a request such as:
- "I want to implement RAG in Java" / "I want to build a retrieval-augmented generation mechanism"
- "I want to register documents to a vector store"
- "I want to use `VectorStore`/`VectorStoreBuilder`"
- "I want to implement hybrid search / similarity search"
- "I want to build an assistant that answers based on search results"

If it's not explicitly stated whether this is for Java or the JavaEE development model, confirm with the user which development model the existing project uses.

If the request falls into the following categories, explain that it is out of scope for this skill:
- Tool Calling (function calling) → `java-im-copilot-toolcalling-generator`
- RAG using `Knowledge`/`RegisteredKnowledge` via the Agent framework (`Agent`/`AgentBuilder`) → `java-im-copilot-agent-generator`
- MCP server implementation → `java-im-mcp-generator`

## Implementation Steps

1. Gather requirements from the user (type and storage location of target documents, search method (hybrid/similarity/keyword), whether chat UI integration is needed)
2. Precisely confirm the applicable methods in `reference/vectorstore-api-reference.md`/`reference/chat-action-api-reference.md` (do not write from memory or guesswork)
3. Implement by consulting `assets/rag-basic-usage.md`. It's a good idea to implement in the order: `Embedder` adapter (Pattern 1) → data preparation job (Pattern 2) → query response Assistant (Pattern 3)
4. When integrating with the IM-Copilot chat UI, create an `AbstractCopilotAssistant<T>` subclass annotated with `@Assistant`. **The parameter class `T` must be `AssistantParameter` itself, or a subclass of it** (a bespoke POJO leaves the chat UI unable to accept a prompt)
5. When an Assistant is created, **always implement/register `AssistantScanPackageFactory` and grant the IM-Authz permission** (omitting either one leaves the assistant missing from the assistant list; see "Platform Registration" in `java-im-copilot-agent-generator`'s `reference/assistant-integration-api-reference.md` for details — the registration mechanism itself is shared with the Agent framework's Assistant)
6. The data preparation job needs to be registered with the job scheduler (tenant configuration assets such as `job-scheduler.xml`; handled by `jssp-tenant-setup-generator`)
7. Verify compliance with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Do not implement `Document` yourself.** Use the platform's standard implementation, `jp.co.intra_mart.system.copilot.vectorstore.document.StandardRegistrationDocument`, as-is
- **`TextSplitter`'s split method is `splitText(String)`.** `split(String)` does not exist
- **Call `VectorStoreBuilder.useDefault()` before `embedder(...)`.** `useDefault()` resets the `embedder` field internally, so calling it out of order loses the `Embedder` setting
- **There is no default implementation of `Embedder` in the platform.** You must implement a thin adapter yourself that wraps `EmbeddingsAction` (`ActionFactory.getFactory().getEmbeddingsAction()`)
- **`T` in `AbstractCopilotAssistant<T>` must be `AssistantParameter` itself, or a subclass of it.** Specifying a bespoke POJO leaves the chat UI unable to build an input box for the outgoing message, so a prompt cannot be entered
- **Merely adding `@Assistant` does not make the assistant appear in the assistant list.** Both registering `AssistantScanPackageFactory` and granting the IM-Authz permission are required (see `java-im-copilot-agent-generator`)
- Text extraction from files (parsing PDF, Word, etc.) itself is out of scope for the vector store / chat action API handled by this skill. Implement it on the application side according to the target file format
- The vector store's actual backend (Solr, an RDB, etc.) depends on the tenant environment configuration. Some methods added in 8.0.5, such as `list`/`count`/`scanAll`, may throw `UnsupportedOperationException` depending on the backend

## Post-Generation Verification

Rather than an automated validation script, verify the following items manually.

1. Whether `Document` is implemented from scratch (it should use `StandardRegistrationDocument`)
2. Whether the `TextSplitter` invocation method name is `splitText`
3. Whether the `VectorStoreBuilder` invocation order is `useDefault()` → `category(...)` → `embedder(...)` → `useScoreNormalize(...)` → `build()`
4. Whether the `Embedder` adapter converts `EmbeddingsAction`'s exceptions (`CopilotServiceConfigurationException`/`CopilotServiceActionException`) into `EmbedderException`
5. When an Assistant was created, whether the parameter class `T` is `AssistantParameter` itself or a subclass of it
6. When an Assistant was created, whether `AssistantScanPackageFactory` was implemented/registered, and whether a permit policy was granted for the resource `im-copilot-assistant://assistant/<assistant ID>` in IM-Authz
7. Whether the code complies with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
8. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|------|-----------|
| **Implementing RAG in Java (JavaEE development model) (using `VectorStore`/`ActionFactory` directly)** | **This skill** |
| Tool Calling (function calling; `ChatAction`+`ToolConfig`) | `java-im-copilot-toolcalling-generator` |
| Higher-level RAG integration using the Agent framework (`Agent`/`AgentBuilder`), `Knowledge`/`RegisteredKnowledge` | `java-im-copilot-agent-generator` |
| MCP server implementation (`@MCPServer`/`@Tool`) | `java-im-mcp-generator` |
