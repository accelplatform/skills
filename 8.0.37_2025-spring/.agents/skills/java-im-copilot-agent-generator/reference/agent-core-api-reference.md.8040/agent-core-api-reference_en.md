# Agent Core API Reference (Java)

Based on the actual class definitions in the `im_copilot_agent`/`im_copilot_base` modules (`jp.co.intra_mart.foundation.copilot.agent.*`). Do not supplement methods/attributes from memory or guesswork.

## `Agent<T>` (Core Interface)

```java
package jp.co.intra_mart.foundation.copilot.agent;

public interface Agent<T> {
    // Stateless execution (internally creates a temporary session)
    AgentResponse<T> run(Message message) throws AgentException;
    AgentResponse<T> run(String userMessage) throws AgentException;
    AgentResponse<T> run(Message message, RunContext runContext) throws AgentException;

    // Stateful execution (conversation accumulates in the Session's history)
    AgentResponse<T> run(Session session, Message message) throws AgentException;
    AgentResponse<T> run(Session session, String userMessage) throws AgentException;
    AgentResponse<T> run(Session session, Message message, RunContext runContext) throws AgentException;

    // Streaming execution
    void runStreaming(Session session, Message message, StreamingResponseHandler handler) throws AgentException;
    void runStreaming(Session session, Message message, RunContext runContext, StreamingResponseHandler handler) throws AgentException;
    void runStreaming(Session session, String userMessage, StreamingResponseHandler handler) throws AgentException;

    Session createSession();
    AgentConfig getConfig();

    static AgentBuilder<?> builder() {
        return new AgentBuilder<>();
    }
}
```

- `run(Message/String)` is stateless execution. Each call internally creates a temporary session, so conversation history is not retained
- `run(Session, ...)` is stateful execution. Reusing the same `Session` accumulates past utterances/responses in `SessionContext`, which are then included in subsequent LLM calls
- `RunContext` is an object for passing per-run data (such as `inputParameters`, used for `${...}` variable expansion in `Instruction`). It's optional (equivalent to `RunContext.empty()`)
- All methods declare the checked exception `jp.co.intra_mart.foundation.copilot.agent.exception.AgentException`

## `AgentBuilder<T>`

Obtained via `Agent.builder()`. Main configuration methods (Builder pattern; each returns `this` or a new builder):

**`AgentBuilder<T>`'s constructor (`AgentBuilder()`) is package-private, so it cannot be `extends`-ed from outside the `jp.co.intra_mart.foundation.copilot.agent` package** (the subclass's implicit `super()` call fails to compile). To switch settings conditionally, don't subclass — hold the builder in an `AgentBuilder<?>`-typed variable and call further methods on it before `build()`.

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class AgentBuilder<T> {
    // Model / tuning parameters
    public AgentBuilder<T> model(String model);
    public AgentBuilder<T> driver(String driver);
    public AgentBuilder<T> temperature(double temperature);
    public AgentBuilder<T> maxTokens(int maxTokens);
    public AgentBuilder<T> reasoningEffort(String reasoningEffort);
    public AgentBuilder<T> verbosity(String verbosity);
    public AgentBuilder<T> stops(List<String> stops);
    public AgentBuilder<T> modelConfig(ModelConfig modelConfig); // Sets the above tuning items all at once (unset items revert to null)

    // Instruction (system prompt)
    public AgentBuilder<T> instruction(String instructionText); // Creates a SimpleInstruction
    public AgentBuilder<T> instruction(Instruction instruction);

    // Tools
    public AgentBuilder<T> userDefinedTool(UserDefinedTool<?, ?> userDefinedTool);
    public AgentBuilder<T> userDefinedTools(UserDefinedTool<?, ?>... userDefinedTools);
    public AgentBuilder<T> builtinTool(BuiltinTool<?, ?> builtinTool);
    public AgentBuilder<T> builtinTools(BuiltinTool<?, ?>... builtinTools);
    public AgentBuilder<T> logicFlowTool(Tool<?, ?> logicFlowTool); // An IM-LogicDesigner flow tool
    public AgentBuilder<T> mcpTool(Tool<?, ?> mcpTool); // Pass an already-resolved tool from an MCP server
    public AgentBuilder<T> mcpTools(Collection<? extends Tool<?, ?>> mcpTools);

    // Knowledge / Skills
    public AgentBuilder<T> knowledge(Knowledge knowledge);
    public AgentBuilder<T> skill(SkillEntry skill);
    public AgentBuilder<T> skills(Collection<? extends SkillEntry> skills);

    // Middleware
    public AgentBuilder<T> middleware(AgentExecutionMiddleware middleware);
    public AgentBuilder<T> middlewares(AgentExecutionMiddleware... middlewares);

    // Structured Output (note that the type parameter changes)
    public <U> AgentBuilder<U> structuredOutput(Class<U> outputClass); // + an overload accepting maxRetries
    public <U> AgentBuilder<U> structuredOutput(Map<String, Object> schemaMap); // + overloads accepting targetClass, maxRetries
    public <U> AgentBuilder<U> structuredOutputSchema(String jsonSchema); // + overloads accepting targetClass, maxRetries

    // Execution control
    public AgentBuilder<T> maxIterations(int maxIterations); // Default when unset: 20
    public AgentBuilder<T> timeoutMs(long timeoutMs); // No timeout when unset
    public AgentBuilder<T> autoCompaction(Double triggerRatio); // Greater than 0, up to 1. Trigger ratio for automatic conversation-history compaction
    public AgentBuilder<T> contextWindow(Long contextWindow); // Token count used to compute the auto-compaction threshold

    public Agent<T> build();
}
```

- **`structuredOutput`/`structuredOutputSchema` return a new builder with a changed type parameter `T`.** Reassigning the result to an `AgentBuilder<T>`-typed variable will fail to type-check; either declare the type explicitly from the start (e.g. `Agent.<OutputType>builder()`), or receive it into a new variable, e.g. `final AgentBuilder<OutputType> typedBuilder = builder.structuredOutput(...)`
- Tools fall into 4 families (`userDefinedTool`/`builtinTool`/`logicFlowTool`/`mcpTool`). Application development basically only implements `userDefinedTool` (see `reference/tool-knowledge-skill-api-reference.md`)
- **`model(String)` is optional.** Internally, whatever model name `AgentBuilder` holds is passed straight through to `ChatAction`'s `ChatOption.model`. If `model(...)` is never called, `ChatOption.model` stays `null` and falls back to the default model configured in the tenant's driver settings (`conf/im-copilot-driver-config.xml`). Conversely, explicitly specifying a model ID the driver doesn't recognize returns an error such as `invalid model ID` from the AI service and fails at runtime
- **When an AI service call fails, the exception message is sometimes collapsed into a generic wording (e.g. "Failed to execute chat at OpenAI") regardless of the actual cause.** The real failure reason — an invalid model ID, an authentication error, rate limiting, a moderation hit, etc. — lives deeper in the exception's cause chain (in the HTTP response carried by classes such as `CopilotServiceInvalidResponseException`), so when troubleshooting, follow `getCause()` as well as the top-level `getMessage()`

## `Message`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class Message implements java.io.Serializable {
    public static Message system(String content);
    public static Message user(String content);
    public static Message assistant(String content);
    public static Message tool(String toolCallId, String toolName, String content);
    public static Message userWithImage(String content, String imageUrl);
    public static Message userWithImage(String content, String imageUrl, ImageDetail detail);

    public static Message.MessageBuilder builder();

    public String getRole();
    public String getContent();
    public List<MessageContent> getContents(); // Contents when multimodal
    public List<ToolCall> getToolCalls();
    public String getToolCallId();
    public String getToolName();
    public Map<String, Object> getMetadata();
    public boolean hasMultimodalContent();
}
```

## `AgentResponse<T>`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class AgentResponse<T> implements java.io.Serializable {
    private String id;
    private Message message;            // The assistant message (the LLM's response)
    private String finishReason;        // stop / tool_calls / length / error / guardrail_violation
    private List<ToolCall> toolCalls;   // Defaults to an empty list
    private Map<String, Object> usage;  // inputTokens/outputTokens, etc.
    private Map<String, Object> metadata;
    private T parsedData;               // Non-null only when Structured Output is configured (the parsed data)
    // There is also a raw JSON output field (LangChain include_raw compliant)

    // Lombok @Data generates getters/setters for all fields
}
```

- Use `getMessage().getContent()` to get the response text
- `getParsedData()` is `null` when Structured Output is not configured
- `getFinishReason()` is checked via string comparison (e.g. `"stop".equals(...)`). Constants such as `AgentResponse.FinishReason.STOP`/`TOOL_CALLS` are provided (per the javadoc; consult the actual class for details)

## `Session`/`SessionContext`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public interface Session {
    SessionContext getContext();
    void clear(); // Clears the message history / memory
    String getSessionId(); // null if not persisted
}
```

`SessionContext` is the context that holds message history. `session.getContext().addMessage(message)` lets you manually add to the history (the pattern `AgentTrialRunAssistant` uses when restoring past chat history). In typical application code, you only need to call `agent.run(session, ...)` — the `Agent` handles adding to the history automatically.

## `Instruction`

```java
package jp.co.intra_mart.foundation.copilot.agent.instruction;

public interface Instruction {
    String getText() throws InstructionException;
    String getText(InstructionContext context) throws InstructionException;
}
```

Main implementations (in the `jp.co.intra_mart.system.copilot.agent.instruction` package):
- `SimpleInstruction(String text)` — a fixed text
- `TemplateInstruction(String template)` — supports `${var}`-style variable expansion. Set values via `InstructionContext` (implementation: `StandardInstructionContext`) using `setVariable(name, value)`, then call `getText(context)` to expand

**The framework automatically injects tool information into the system prompt.** Write only your business logic (the agent's role, response style) into `instruction` — you don't need to write instructions like "use the tool" (this is auto-generated).

## `RunContext`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public final class RunContext implements java.io.Serializable {
    public static RunContext empty();
    public static RunContext.Builder builder();

    public Map<String, Object> getInputParameters();
    public String getTraceId();
    public String getParentSpanId();
}
```

Use `RunContext.builder().inputParameters(Map)` or `.putInputParameter(name, value)` to pass input parameters used for `${...}` expansion in an `Instruction` (`TemplateInstruction`). Use it as the argument to `run(message, runContext)` / `run(session, message, runContext)`.

## `ModelConfig`/`AgentConfig`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class ModelConfig implements java.io.Serializable {
    private Double temperature;      // Unset: model default
    private Integer maxTokens;
    private String reasoningEffort;  // Valid values differ by model
    private List<String> stops;
    private String verbosity;        // low/medium/high. Supported only by OpenAI/AzureOpenAI

    public static ModelConfig.ModelConfigBuilder builder();
    // Lombok @Data generates getters/setters for all fields
}
```

`AgentConfig` is a snapshot of a built agent's configuration, obtained via `Agent#getConfig()` (holds `model`/`modelConfig`/`driver`/`timeoutMs`/`agentDefinitionId`/`agentType`/`additionalParams`/`autoCompactionTriggerRatio`/`contextWindow`, etc.).

## Exceptions

`jp.co.intra_mart.foundation.copilot.agent.exception.AgentException` (a checked exception). Declared by all execution methods on the `Agent` interface.
