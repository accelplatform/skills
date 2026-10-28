---
name: java-im-copilot-toolcalling-generator
description: A skill set for using intra-mart IM-Copilot's provider-agnostic Tool Calling API (`jp.co.intra_mart.foundation.copilot.action.chat.ChatAction`+`ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`) in Java (JavaEE development model) to implement function calling (Function Calling / Tool Use) for an AI assistant. Provides both non-streaming and streaming implementation patterns that work with the same code regardless of tenant driver — OpenAI, Azure OpenAI Service, or Amazon Bedrock. Use this when the user mentions implementing Tool Calling / Function Calling in Java, wanting an AI assistant to call external functions, or wanting to use `ChatAction`+`ToolConfig`. For high-level Tool Calling via the Agent framework (`UserDefinedTool`), use `java-im-copilot-agent-generator`; for RAG (retrieval-augmented generation), use `java-im-copilot-rag-generator`.
---

# intra-mart IM-Copilot Tool Calling (Java) Support Skill

## Purpose

A skill set for implementing function calling (Function Calling / Tool Use) for an AI assistant in Java code, using the **provider-agnostic Tool Calling API** (`ChatAction`+`ToolConfig`) provided by intra-mart Accel Platform's IM-Copilot.

## Class Structure (Important)

| Target | Type | Package |
|---|---|---|
| Chat invocation (Tool Calling support) | `ChatAction` (obtained via `ActionFactory.getFactory().getChatAction()`) | `jp.co.intra_mart.foundation.copilot.action.chat` |
| Tool configuration | `ToolConfig` (a list of `ToolDefinition` + `ToolChoice`) | Same as above |
| Tool definition | `ToolDefinition` (auto-generates a JSON Schema from a DTO annotated with `SchemaProperties`) | Same as above |
| Tool choice mode | `ToolChoice` (`auto`/`none`/`required`/`tool` (name-specified)) | Same as above |
| Tool call information | `ToolCall` (`id`/`name`/`arguments`) | Same as above |
| Tool argument validation/conversion | `JsonSchemaValidator`/`ToolJsonHelper` | `jp.co.intra_mart.foundation.copilot.tool` |
| Chat UI integration | `AbstractCopilotAssistant<T>` + `@Assistant` | `jp.co.intra_mart.foundation.copilot.assistant` |

**`ChatAction`+`ToolConfig` is a provider-agnostic API that works with the same code regardless of tenant driver — OpenAI, Azure OpenAI Service, or Amazon Bedrock.** There is no need to switch between request/response classes per driver type (`ActionFactory` automatically resolves the implementation according to the tenant configuration).

**The `UserDefinedTool` of `Agent`/`AgentBuilder` (the high-level API handled by `java-im-copilot-agent-generator`) is an even higher-level form of Tool Calling that has an Agent Loop (repeating tool invocation and result reflection) built in.** This skill's `ChatAction`+`ToolConfig` is a lower-level API where you assemble that Agent Loop yourself.

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method Javadoc |

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files). The `SchemaProperties` annotation applied to a tool's input parameter DTO is the exact same class (`jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`) used by `UserDefinedTool` in `java-im-mcp-generator`/`java-im-copilot-agent-generator`.

## API Overview

Pass a `ToolConfig` holding a list of `ToolDefinition` and a `ToolChoice` to `ChatAction.execute(messages, option, toolConfig)` (non-streaming) / `execute(messages, option, toolConfig, handler)` (streaming) to run a chat. When the response contains a tool call (`ToolCall`), the application executes the tool itself, adds the result as a message with the `tool` role, and calls `execute(...)` again — completing the round trip in at least two calls. See `reference/toolcalling-api-reference.md` (this skill) and `reference/chat-action-api-reference.md` (`java-im-copilot-rag-generator`) for details (do not write from memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|---------|------------|------|
| Non-streaming Tool Calling | `assets/toolcalling-basic-usage.md` Pattern 1 | `ChatAction.execute(messages, option, toolConfig)`, validating/executing `ToolCall`, building the result message |
| Streaming Tool Calling | `assets/toolcalling-basic-usage.md` Pattern 2 | `ChatAction.execute(messages, option, toolConfig, handler)`, accumulating/merging `ToolCall` from chunks |

### Reference

- `reference/toolcalling-api-reference.md` — all methods and signatures for `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`/`JsonSchemaValidator`/`ToolJsonHelper`, and the constraints when using the Amazon Bedrock driver
- `java-im-copilot-rag-generator`'s `reference/chat-action-api-reference.md` — `ActionFactory`/`ChatAction`/`ChatMessage`/`ChatOption`, etc., the Action API foundation that Tool Calling builds on

Both are based on the actual platform API class definitions (do not write from memory).

## When to Use

Use this skill when the user makes a request such as:
- "I want to implement Tool Calling / Function Calling in Java"
- "I want an AI assistant to call an external function/API"
- "I want to use `ChatAction`+`ToolConfig`"
- "I want to implement function calling with OpenAI/Azure OpenAI/Amazon Bedrock"

If it's not explicitly stated whether this is for Java or the JavaEE development model, confirm with the user which development model the existing project uses.

If the request falls into the following categories, explain that it is out of scope for this skill:
- RAG (retrieval-augmented generation) → `java-im-copilot-rag-generator`
- `UserDefinedTool` via the Agent framework (`Agent`/`AgentBuilder`) (high-level Tool Calling with an Agent Loop built in) → `java-im-copilot-agent-generator`
- MCP server implementation → `java-im-mcp-generator`

## Implementation Steps

1. Gather requirements from the user (the content/arguments of the tool to call, whether a streaming response is needed, whether functionality that differs by target driver (OpenAI/Azure OpenAI/Amazon Bedrock) is needed)
2. Precisely confirm the applicable methods in `reference/toolcalling-api-reference.md` and `java-im-copilot-rag-generator`'s `reference/chat-action-api-reference.md` (do not write from memory or guesswork)
3. Annotate the tool's argument DTO with `SchemaProperties`, and generate the schema with `ToolDefinition.builder().parametersFromClass(...)`
4. Implement by consulting `assets/toolcalling-basic-usage.md`. Start with non-streaming (Pattern 1), then extend to streaming (Pattern 2) if needed
5. When integrating with the IM-Copilot chat UI, create an `AbstractCopilotAssistant<T>` subclass annotated with `@Assistant`. **The parameter class `T` must be `AssistantParameter` itself, or a subclass of it** (a bespoke POJO leaves the chat UI unable to accept a prompt)
6. When an Assistant is created, **always implement/register `AssistantScanPackageFactory` and grant the IM-Authz permission** (omitting either one leaves the assistant missing from the assistant list; see "Registering with the Platform" in `java-im-copilot-agent-generator`'s `reference/assistant-integration-api-reference.md` for details)
7. Verify compliance with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## Notes

- **`ChatAction`+`ToolConfig` works with the same code regardless of tenant driver — OpenAI, Azure OpenAI Service, or Amazon Bedrock.** There is no need to use driver-specific request/response classes directly
- **`CopilotServiceConfigurationException`/`CopilotServiceActionException` are subclasses of `CopilotServiceException`.** Trying to combine them into a single `multi-catch` (`catch (A | B e)`) causes a compile error. Catch them with the single base `CopilotServiceException`
- **Streaming does not return the response message (`ChatMessage`) itself.** Tool call information (`ToolCall`) must be accumulated/merged from chunks (`ChunkChatMessageDelta.getToolCalls()`) by the application, and the `assistant`'s tool call information must be explicitly added to the message used for the second call
- **There are constraints when using the Amazon Bedrock driver** (`ToolDefinition.strict` is ignored, `ToolChoice.none()` is not available, `addImageUrl` is not available, only the most recent system message is effective). For implementations expected to work across multiple drivers, avoid running afoul of these constraints
- **Tool call arguments are not necessarily guaranteed to match the schema.** It is recommended to validate with `JsonSchemaValidator.isValid(...)` before deserializing with `ToolJsonHelper.deserialize(...)`
- **The `T` in `AbstractCopilotAssistant<T>` must be `AssistantParameter` itself, or a subclass of it.** A bespoke POJO leaves the chat UI unable to accept a prompt
- **Merely adding `@Assistant` does not make it appear in the assistant list.** Both registering `AssistantScanPackageFactory` and granting the IM-Authz permission are required (see `java-im-copilot-agent-generator`)

## Post-Generation Verification

Rather than an automated validation script, verify the following items manually.

1. Whether the `SchemaProperties` annotation is correctly applied to `ToolDefinition`'s argument DTO
2. Whether the check for tool calls (`toolCalls == null || toolCalls.isEmpty()`) and the construction of the tool execution result message (`addToolTextContent`/`addToolImageData`) are correctly implemented
3. For a streaming implementation, whether merging `ToolCall` from chunks (branching on whether `id` is present) and explicitly adding the `assistant`'s tool call information to the message for the second call are both done
4. Whether the `catch` for exceptions causes a compile error due to the inheritance relationship of `CopilotServiceException`
5. When an Assistant was created, whether the parameter class `T` is `AssistantParameter` itself or a subclass of it
6. When an Assistant was created, whether `AssistantScanPackageFactory` was implemented/registered, and whether a permit policy was granted for the resource `im-copilot-assistant://assistant/<assistant ID>` in IM-Authz
7. Whether the code complies with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
8. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|------|-----------|
| **Implementing Tool Calling in Java (JavaEE development model) (using `ChatAction`+`ToolConfig` directly)** | **This skill** |
| RAG (retrieval-augmented generation, using `VectorStore`/`ActionFactory` directly) | `java-im-copilot-rag-generator` |
| High-level Tool Calling using the Agent framework (`Agent`/`AgentBuilder`) and `UserDefinedTool` (with an Agent Loop built in) | `java-im-copilot-agent-generator` |
| MCP server implementation (`@MCPServer`/`@Tool`) | `java-im-mcp-generator` |
</content>
