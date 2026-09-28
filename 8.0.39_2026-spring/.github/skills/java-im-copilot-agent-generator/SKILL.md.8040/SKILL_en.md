---
name: java-im-copilot-agent-generator
description: A skill set for using intra-mart IM-Copilot's Agent framework (`jp.co.intra_mart.foundation.copilot.agent.*`, `im_copilot_agent` module) in Java (JavaEE development model) to build AI agents that receive a prompt, process it, and return a response. Provides implementation patterns for building an agent with `Agent`/`AgentBuilder`, implementing custom tools with `UserDefinedTool`, integrating `Knowledge` (knowledge search) and `SkillEntry` (Markdown skills), Structured Output (typed output), intervening in the execution flow with `AgentExecutionMiddleware`, and wiring the agent into the IM-Copilot chat UI via the Assistant framework (`AbstractCopilotAssistant`/`@Assistant`). Use this when the user mentions building an AI agent in Java, using `Agent`/`AgentBuilder`, giving an agent tools/knowledge/skills, or wiring an agent into IM-Copilot's chat feature. For MCP server implementation, use `java-im-mcp-generator`; for regular REST APIs via Web API Maker, use `java-im-web-api-maker-usage`.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart IM-Copilot Agent Framework (Java) Support Skill

## Purpose

A skill set for implementing AI agents in Java code — agents that "receive a prompt, process it, and return a response" — using the **Agent framework** (`Agent`/`AgentBuilder`, `im_copilot_agent` module) provided by intra-mart Accel Platform's IM-Copilot.

## Class Structure (Important)

| Target | Type | Package |
|---|---|---|
| The agent itself | `Agent<T>` (interface) | `jp.co.intra_mart.foundation.copilot.agent` |
| Building an agent | `AgentBuilder<T>` | Same as above (obtained via `Agent.builder()`) |
| Conversation history (stateful execution) | `Session`/`SessionContext` | Same as above |
| Message | `Message` (static factories: `user`/`system`/`assistant`/`tool`) | Same as above |
| Execution result | `AgentResponse<T>` | Same as above |
| System prompt | `Instruction` (implementations: `SimpleInstruction`/`TemplateInstruction`) | `jp.co.intra_mart.foundation.copilot.agent.instruction` |
| Custom tool | `Tool<I,O>` → `BuiltinTool<I,O>` → `UserDefinedTool<I,O>` | `jp.co.intra_mart.foundation.copilot.agent.tool` |
| Knowledge (RAG) | `Knowledge` (implementation: `RegisteredKnowledge`) | `jp.co.intra_mart.foundation.copilot.agent.knowledge` / `jp.co.intra_mart.system.copilot.agent.knowledge` |
| Skill (Markdown knowledge asset) | `SkillEntry` (resolved via `SkillCatalogService`) | `jp.co.intra_mart.foundation.copilot.agent.skill` / `jp.co.intra_mart.system.copilot.agent.skill.service` |
| Structured Output | `@Property` annotation + `AgentBuilder.structuredOutput(Class)` | `jp.co.intra_mart.foundation.copilot.agent.structured` |
| Intervening in the execution flow | `AgentExecutionMiddleware` (Chain of Responsibility) | `jp.co.intra_mart.foundation.copilot.agent.middleware` |
| Chat UI integration | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`Agent`/`AgentBuilder` are plain Java objects — simply call `Agent.builder()...build()` and then `run()`/`runStreaming()` to use them directly from any Java code, such as a Web API Maker endpoint or a job.** Wrap the agent in `AbstractCopilotAssistant` only when you need to integrate with IM-Copilot's chat UI (thread/message-history persistence, streaming responses, etc. — see below).

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method Javadoc |

There is no dedicated Java convention under `.github/instructions` for Agent framework implementation. The `SchemaProperties` annotation used on a custom tool's input parameter DTO is the exact same class as the one MCP tools use (`jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`, covered by `java-im-mcp-generator`'s `reference/mcp-annotation-api-reference.md`) — you can refer to that document for the notation as well.

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

`Agent`/`AgentBuilder` belong to the `im_copilot_agent` module (which depends on `im_copilot_core`/`im_copilot_base`). Obtain an `AgentBuilder<?>` via `Agent.builder()`, configure it with `model`/`instruction`/various tools/`knowledge`/`skill`/`middleware`, etc., and call `build()` to get an `Agent<T>` (`T` is `?` when Structured Output is not configured). Execution comes in two families — `run(...)` (synchronous, returns a value) and `runStreaming(...)` (chunk-by-chunk callback) — each of which has a stateless variant (internal temporary session) and a stateful variant (explicitly reusing a `Session` to retain conversation history). See `reference/agent-core-api-reference.md` for details (do not write from memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|--------------------|----------|---------|
| Build a minimal agent and call it directly | `assets/copilot-agent-basic-usage.md` Pattern 1 | `Agent.builder()...build()`, `run(String)` |
| Stateful conversation (history retained) | `assets/copilot-agent-basic-usage.md` Pattern 2 | `Session`, `run(Session, String)` |
| Give the agent a custom tool | `assets/copilot-agent-basic-usage.md` Pattern 3 | `UserDefinedTool` implementation, input schema generation via `SchemaProperties`/`JsonSchemaGenerator` |
| Enforce typed output (Structured Output) | `assets/copilot-agent-basic-usage.md` Pattern 4 | A DTO annotated with `@Property`, `AgentBuilder.structuredOutput(Class)` |
| Intervene in the execution flow (logging, observability, guardrails) | `assets/copilot-agent-basic-usage.md` Pattern 5 | `AgentExecutionMiddleware`/`ObservabilityMiddleware` |
| Reference a registered knowledge base | `assets/copilot-agent-basic-usage.md` Pattern 6 | `RegisteredKnowledge`, `AgentBuilder.knowledge(...)` |
| Reference a Markdown skill | `assets/copilot-agent-basic-usage.md` Pattern 7 | `SkillCatalogService`, `AgentBuilder.skills(...)` |
| Integrate with the IM-Copilot chat UI | `assets/copilot-agent-basic-usage.md` Pattern 8 | `@Assistant` + `AbstractCopilotAssistant` |
| Register the Assistant with the platform (paired with Pattern 8) | `assets/copilot-agent-basic-usage.md` Pattern 9 | Implementing/registering `AssistantScanPackageFactory`, granting an IM-Authz permission (**both are required**) |

### Reference

- `reference/agent-core-api-reference.md` — All methods and signatures for `Agent`/`AgentBuilder`/`Message`/`AgentResponse`/`Session`/`Instruction`/`RunContext`/`ModelConfig`
- `reference/tool-knowledge-skill-api-reference.md` — All methods and signatures for `Tool`/`UserDefinedTool`/`ToolDefinition`/`AbstractToolDefinition`, `Knowledge`/`RegisteredKnowledge`, `SkillEntry`/`SkillCatalogService`, Structured Output (`@Property`), and `AgentExecutionMiddleware`
- `reference/assistant-integration-api-reference.md` — All methods and signatures for `@Assistant`/`AbstractCopilotAssistant`/`AssistantMessage`/`AssistantResult`/`AssistantResponseWriter`

All are based on the actual platform API class definitions (do not write from memory).

## When to Use

Use this skill when the user makes a request such as:
- "Build an AI agent in Java" / "I want to build an agent that receives a prompt and processes it"
- "I want to use `Agent`/`AgentBuilder`"
- "I want to give the agent a custom tool (function calling)"
- "I want the agent's response as typed (JSON) output"
- "I want to log/monitor agent execution, or add guardrails"
- "I want to build an agent that integrates with the IM-Copilot chat screen"

If it's not explicitly stated whether this is for Java or the JavaEE development model, confirm with the user which development model the existing project uses.

If the request falls into the following categories, explain that it is out of scope for this skill:
- MCP server implementation (`@MCPServer`/`@Tool`) → `java-im-mcp-generator`
- A regular authenticated REST API (Web API Maker) → `java-im-web-api-maker-usage`
- IM-LogicDesigner logic-flow elements → `java-im-logic-generator`
- Implementing/extending Agent Designer (the no-code agent-definition UI) itself → out of scope for this skill (this skill only covers implementation patterns for using `Agent`/`AgentBuilder` directly from Java code)
- A low-level RAG implementation that uses `VectorStore`/`ActionFactory` directly (not the Agent framework's `Knowledge`/`RegisteredKnowledge`) → `java-im-copilot-rag-generator`
- A low-level Tool Calling implementation that uses `ChatAction`+`ToolConfig` directly (not the Agent framework's `UserDefinedTool`/Agent Loop) → `java-im-copilot-toolcalling-generator`

## Implementation Steps

1. Gather requirements from the user (how it will be invoked — directly from Java code, or via the IM-Copilot chat UI; whether tools/knowledge/skills are needed; whether typed output is needed; stateless or stateful)
2. Precisely confirm the applicable methods in `reference/agent-core-api-reference.md`/`reference/tool-knowledge-skill-api-reference.md`/`reference/assistant-integration-api-reference.md` (do not write from memory or guesswork)
3. Implement by consulting `assets/copilot-agent-basic-usage.md`
4. When implementing a custom tool, annotate the input parameter DTO with `SchemaProperties` and generate the schema with `JsonSchemaGenerator.generateSchema(...)`
5. When integrating with the IM-Copilot chat UI, create an `AbstractCopilotAssistant<T>` subclass annotated with `@Assistant` (build and run the `Agent` inside `doExecute`). **The parameter class `T` must be `AssistantParameter` itself (`jp.co.intra_mart.foundation.copilot.assistant.model`), or a subclass of it** (see "`AssistantParameter`" in `reference/assistant-integration-api-reference.md` — a bespoke POJO leaves the chat UI unable to accept a prompt)
6. When an Assistant is created, **always implement/register `AssistantScanPackageFactory` and grant the IM-Authz permission** (omitting either one leaves the assistant missing from the assistant list; `assets/copilot-agent-basic-usage.md` Pattern 9)
7. Verify compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **`Agent`/`AgentBuilder` is an independent Java API that does not depend on the Assistant framework.** You can call `Agent.builder()...build().run(...)` directly from a Web API Maker endpoint or a job. Wrap it in `AbstractCopilotAssistant` only when you need to integrate with the IM-Copilot chat UI (thread management, streaming responses, message persistence)
- **`UserDefinedTool<I,O>` must return a `ToolDefinition` from `getDefinition()`.** Since `AbstractToolDefinition` does not implement `isEnabled()`, either prepare a subclass that implements `isEnabled()` yourself, or use another concrete implementation (see `reference/tool-knowledge-skill-api-reference.md`)
- **The `SchemaProperties` annotation used on a tool's input parameter DTO is the exact same annotation class used by MCP tools in `java-im-mcp-generator`.** If you're unsure of the notation, you can also consult `java-im-mcp-generator`'s `reference/mcp-annotation-api-reference.md`
- **`AgentExecutionMiddleware` is a Chain of Responsibility that intervenes in the execution flow via `intercept(InvocationContext, Chain)`.** For observation-only use (logging, monitoring), extend `ObservabilityMiddleware`, which fails open (swallows its own exceptions). If you need to potentially halt processing (validation, guardrails), implement `AgentExecutionMiddleware` directly (fail-closed)
- **`Knowledge` is typically used via `RegisteredKnowledge` (referencing, by ID, a knowledge base already registered in knowledge management).** Only implement `Knowledge` yourself when you need custom search logic
- **`SkillEntry` (a Markdown skill) is resolved via `SkillCatalogService`, which reads `im_copilot/agent/skills/<skillId>/SKILL.md` from Storage.** Whereas a tool performs a concrete operation, a skill is a knowledge asset describing how to use tools, decision criteria, and procedures
- **Using `AgentBuilder.structuredOutput(Class)` changes the type parameter of `Agent<T>`.** Either declare the type explicitly with `Agent.<T>builder()`, or receive the return value of `structuredOutput` into a new variable (reassigning it to the same builder variable will not type-check)
- **Merely adding `@Assistant` does not make the platform recognize it, and it does not appear in the assistant list.** Both of the following are required:
  1. Implement `AssistantScanPackageFactory` and register the class name under `META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory` (so the package containing the `@Assistant` class is included in the scan target)
  2. In IM-Authz, grant a permit policy for the resource `im-copilot-assistant://assistant/<assistant ID>` (resource type `im-copilot-assistant`, action `execute`) — the resource itself is auto-imported at server startup, but the permit policy is not granted automatically
  - Missing either one leaves it out of the list. See `assets/copilot-agent-basic-usage.md` Pattern 9 for details
- **The parameter class `T` in `AbstractCopilotAssistant<T>` must be `AssistantParameter` itself, or a subclass of it.** Specifying an incompatible POJO with only custom fields causes the parameter parser to fail at runtime, and also leaves the chat UI unable to build an input box for the outgoing message — the assistant still appears in the list, but the user cannot enter a prompt after selecting it. Read the user's utterance from the inherited `getMessage().getContents()`. See "`AssistantParameter`" in `reference/assistant-integration-api-reference.md` and Pattern 8 in `assets/copilot-agent-basic-usage.md` for details
- The internal implementation of Knowledge's content-source ingestion, vectorization, and search, as well as the OAuth integration of MCP tools, are platform-internal implementation details that application developers do not implement directly. The scope application developers work with ends at the public API — `Knowledge`/`RegisteredKnowledge`, etc.
- **`AgentBuilder<T>` cannot be subclassed.** Its constructor (`AgentBuilder()`) is package-private, so `extends`-ing it from outside the `jp.co.intra_mart.foundation.copilot.agent` package fails to compile (the implicit `super()` call is inaccessible). To switch settings conditionally, hold the builder in an `AgentBuilder<?>`-typed variable and call further methods on it before `build()`, rather than subclassing (don't chain `Agent.builder()...build()` in a single expression — assign the intermediate builder to a variable first)
- **`AgentBuilder.model(String)` is optional.** If omitted, the underlying `ChatOption.model` stays `null` and falls back to the default model configured in the tenant's driver settings (`conf/im-copilot-driver-config.xml`). Explicitly specifying a model ID the driver doesn't recognize fails at runtime with an error such as `invalid model ID`
- **When an AI service call fails, the exception message is sometimes collapsed into a generic wording (e.g. "Failed to execute chat at OpenAI") regardless of the actual cause.** The real failure reason (HTTP status, response body, etc.) lives deeper in the exception's cause chain, so when troubleshooting, follow `getCause()` as well as the top-level `getMessage()`

## Post-Generation Verification

Rather than an automated validation script, verify the following items manually.

1. Whether the code is structured to call `Agent`/`AgentBuilder` directly, or to wrap it in `AbstractCopilotAssistant` — and whether that choice matches the requirements
2. Whether the custom tool's `getDefinition()` is correctly implemented (including `isEnabled()`), and whether the input DTO has `SchemaProperties` annotations
3. When using Structured Output, whether the `Agent<T>` type parameter is consistent throughout
4. Whether a Middleware is observation-only (extends `ObservabilityMiddleware`, fail-open) or control-oriented (implements directly, fail-closed), and whether that matches the requirements
5. Whether checked exceptions such as `AgentException`/`CopilotAssistantException` are being swallowed anywhere
6. When an Assistant was created, whether the parameter class `T` is `AssistantParameter` itself or a subclass of it (leaving it as a bespoke POJO means the chat UI cannot accept a prompt)
7. When an Assistant was created, whether `AssistantScanPackageFactory` was implemented/registered, and whether a permit policy was granted for the resource `im-copilot-assistant://assistant/<assistant ID>` in IM-Authz (both are required for it to appear in the assistant list)
8. Whether the code complies with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
9. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|-----------------|------------------|
| **Implementing an AI agent in Java (JavaEE development model) (`Agent`/`AgentBuilder`, Assistant integration)** | **This skill** |
| A low-level RAG implementation using `VectorStore`/`ActionFactory` directly | `java-im-copilot-rag-generator` |
| A low-level Tool Calling implementation using `ChatAction`+`ToolConfig` directly | `java-im-copilot-toolcalling-generator` |
| MCP server implementation (`@MCPServer`/`@Tool`) | `java-im-mcp-generator` |
| Regular REST APIs via Web API Maker | `java-im-web-api-maker-usage` |
| IM-LogicDesigner logic-flow elements | `java-im-logic-generator` |
