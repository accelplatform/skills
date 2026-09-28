# Tool Calling API Reference (Java)

Based on the actual class definitions in the `im_copilot`/`im_copilot_core`/`im_copilot_base` modules (`jp.co.intra_mart.foundation.copilot.action.chat.*`, `jp.co.intra_mart.foundation.copilot.tool.*`). Do not supplement methods/attributes from memory or guesswork.

By passing a `ToolConfig` to `ChatAction` (see `java-im-copilot-rag-generator`'s `reference/chat-action-api-reference.md`), you can implement provider-agnostic Tool Calling that **works with the same code regardless of tenant driver — OpenAI, Azure OpenAI Service, or Amazon Bedrock**. No branching per driver type is needed.

## `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall`

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

// Lombok @Data
public class ToolConfig {
    public ToolConfig(List<ToolDefinition> toolDefinitions);
    public ToolConfig(List<ToolDefinition> toolDefinitions, ToolChoice toolChoice);
}
```

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

// Lombok @Data + @AllArgsConstructor + @NoArgsConstructor
public class ToolDefinition {
    public static ToolDefinitionBuilder builder();

    public static class ToolDefinitionBuilder {
        public ToolDefinitionBuilder description(String description);
        public ToolDefinitionBuilder name(String name);
        public ToolDefinitionBuilder strict(Boolean strict); // Ignored on Amazon Bedrock
        // There are three ways to set the arguments (JSON Schema, conforming to Draft 2020-12)
        public ToolDefinitionBuilder parameters(Map<String, Object> parameters);
        public ToolDefinitionBuilder parametersFromClass(Class<?> clazz) throws CopilotServiceException;
        public ToolDefinitionBuilder parametersAddArgument(String name, Class<?> clazz, boolean required) throws CopilotServiceException;
        public ToolDefinition build();
    }

    public String getName();
    public Map<String, Object> getParameters();
}
```

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

// Lombok @Data + @Builder
public class ToolChoice {
    public static ToolChoiceBuilder builder();

    public static class ToolChoiceBuilder {
        public ToolChoiceBuilder auto();               // Let the model decide automatically
        public ToolChoiceBuilder none();                // Do not let it use a tool (cannot be specified on Amazon Bedrock)
        public ToolChoiceBuilder required();            // Always force it to call some tool
        public ToolChoiceBuilder tool(String functionName); // Force a call to a specific tool
        public ToolChoice build();
    }
}
```

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

// Lombok @Data + @Builder + @NoArgsConstructor + @AllArgsConstructor
public class ToolCall implements Serializable {
    public String getId();
    public String getName();
    public String getArguments(); // JSON string
    public void setArguments(String arguments); // Used when merging chunks during streaming
}
```

- `ToolDefinition.parametersFromClass(Class)` converts `SchemaProperties` (the same annotation class used by `UserDefinedTool` input DTOs in `java-im-mcp-generator`/`java-im-copilot-agent-generator`) applied to the target class's fields into a JSON Schema (internally uses `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator`)
- `parametersAddArgument(name, clazz, required)` adds one property at a time to the existing `parameters` (used when you want to combine multiple parameter classes into a single tool definition)
- `ToolCall.getArguments()` is the JSON string representing the tool call's arguments. Deserialize it with `ToolJsonHelper.deserialize(...)`

## `ChatAction`'s Tool Calling Methods

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public interface ChatAction {
    // Non-streaming
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
    // Streaming
    void execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig, ChatActionChunkHandler handler) throws CopilotServiceActionException;
}
```

- The non-streaming version returns the `List<ChatMessage>` with the response appended. A tool call is being requested if `getToolCalls()` on the last element (`response.get(response.size() - 1)`) is not `null`/empty
- The streaming version receives a `ChunkChatMessage` for each chunk. `chunk.getDelta().getToolCalls()` holds fragments of tool call information. **The `id` is set on the first chunk, and subsequent chunks arrive as fragments of `arguments` for the same tool call (with `id` as `null`), so the caller must merge them by checking whether `id` is present** (see `assets/toolcalling-basic-usage.md` Pattern 2)

## Building the Tool Execution Result Message (`ChatMessage.ChatMessageBuilder`)

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public final class ChatMessage {
    public static final class ChatMessageBuilder {
        public ChatMessageBuilder toolCalls(List<ToolCall> toolCalls); // Explicitly set the assistant's tool call information
        public ChatMessageBuilder addToolTextContent(String text, String toolCallId);   // Tool execution result (text)
        public ChatMessageBuilder addToolImageData(byte[] image, String toolCallId) throws CopilotServiceException; // Tool execution result (image)
    }
}
```

- For the non-streaming case, passing the return value (`response`) of the first `execute(...)` call as-is to `ChatMessage.builder().from(response).newMessage().withRole("tool")...` also carries over the immediately preceding assistant's tool call information (`toolCalls`)
- **For streaming, the response message itself is not returned** (since the method is `void`). After accumulating tool call information from the chunks yourself, you must explicitly add `ChatMessage.builder().from(messages).newMessage().withRole("assistant").toolCalls(accumulated toolCalls)` before continuing with the `tool`-role result message (see `assets/toolcalling-basic-usage.md` Pattern 2)
- Multiple tool execution result contents (e.g., text + image) can also be stacked for a single tool call. `addToolTextContent`/`addToolImageData` can be called consecutively with the same `toolCallId`

## Validating and Deserializing Tool Arguments (utilities provided by `im_copilot_base`)

```java
package jp.co.intra_mart.foundation.copilot.tool;

public class JsonSchemaValidator {
    public JsonSchemaValidator(Map<String, Object> schema);
    public JsonSchemaValidator(Map<String, Object> schema, Locale locale);
    public boolean isValid(String json);
    public List<SchemaValidationError> validate(String json); // A list of error details when invalid
}
```

```java
package jp.co.intra_mart.foundation.copilot.tool;

public final class ToolJsonHelper {
    public static <T> T deserialize(String json, Class<T> clazz);
    public static Map<String, Object> deserializeToMap(String json);
    public static String serialize(Map<String, Object> map);
}
```

Because the model does not necessarily return a value that matches the schema, it is recommended to validate the JSON string received from `ToolCall.getArguments()` with `JsonSchemaValidator.isValid(...)` before executing, then deserialize it with `ToolJsonHelper.deserialize(...)` (this pattern is also used in the platform's own internal validation test code).

## Constraints When Using the Amazon Bedrock Driver (documented in the Javadoc of `ToolDefinition`/`ToolChoice`/`ChatMessage`)

- The `ToolDefinition.strict(...)` setting is ignored
- `ToolChoice.none()` (tool choice "none") cannot be specified
- `ChatMessage.ChatMessageBuilder.addImageUrl(...)` is not available (images must be binary (`addImageData`) only)
- Specifying image detail (`detail`) is ignored
- Only the most recent system message (`role: "system"`) is effective

These constraints apply only when using the Amazon Bedrock driver via `ChatAction`/`ToolConfig`; they do not apply to OpenAI or Azure OpenAI Service. Since the driver type depends on the tenant configuration (`conf/im-copilot-driver-config.xml`), implementations expected to work across multiple drivers should avoid running afoul of these constraints.
</content>
