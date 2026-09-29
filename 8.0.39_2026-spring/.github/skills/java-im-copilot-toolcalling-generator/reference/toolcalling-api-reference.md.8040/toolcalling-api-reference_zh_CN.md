# Tool Calling API 参考（Java 版）

基于 `im_copilot`/`im_copilot_core`/`im_copilot_base` 模块（`jp.co.intra_mart.foundation.copilot.action.chat.*`、`jp.co.intra_mart.foundation.copilot.tool.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

通过向 `ChatAction`（参照 `java-im-copilot-rag-generator` 的 `reference/chat-action-api-reference.md`）传入 `ToolConfig`，可以实现**在 OpenAI・Azure OpenAI Service・Amazon Bedrock 任一租户驱动下均以相同代码工作**的、与提供商无关的 Tool Calling。无需按驱动类型进行分支处理。

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
        public ToolDefinitionBuilder strict(Boolean strict); // 在 Amazon Bedrock 上会被忽略
        // 参数（JSON Schema，遵循 Draft 2020-12）的设置方式有 3 种
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
        public ToolChoiceBuilder auto();               // 由模型自动判断
        public ToolChoiceBuilder none();                // 不使用工具（在 Amazon Bedrock 上无法指定）
        public ToolChoiceBuilder required();            // 强制调用某个工具
        public ToolChoiceBuilder tool(String functionName); // 强制调用特定工具
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
    public String getArguments(); // JSON 字符串
    public void setArguments(String arguments); // 用于流式方式下的数据块合并
}
```

- `ToolDefinition.parametersFromClass(Class)` 会将附加在目标类字段上的 `SchemaProperties`（与 `java-im-mcp-generator`/`java-im-copilot-agent-generator` 的 `UserDefinedTool` 输入 DTO 使用的是同一注解类）转换为 JSON Schema（内部使用 `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator`）
- `parametersAddArgument(name, clazz, required)` 用于向已有的 `parameters` 逐个属性追加（当想将多个参数用类合并到一个工具定义中时使用）
- `ToolCall.getArguments()` 是表示工具调用参数的 JSON 字符串。使用 `ToolJsonHelper.deserialize(...)` 进行反序列化

## `ChatAction` 的 Tool Calling 支持方法

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public interface ChatAction {
    // 非流式
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
    // 流式
    void execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig, ChatActionChunkHandler handler) throws CopilotServiceActionException;
}
```

- 非流式版本返回追加了响应的 `List<ChatMessage>`。若末尾元素（`response.get(response.size() - 1)`）的 `getToolCalls()` 不为 `null`/非空，则表示请求了工具调用
- 流式版本按每个数据块接收 `ChunkChatMessage`。`chunk.getDelta().getToolCalls()` 中包含工具调用信息的片段。**首个数据块会设置 `id`，之后的数据块作为同一工具调用的 `arguments` 片段到达（`id` 为 `null`），因此调用方需要根据 `id` 的有无进行合并**（参照 `assets/toolcalling-basic-usage.md` 模式 2）

## 工具执行结果消息的构建（`ChatMessage.ChatMessageBuilder`）

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public final class ChatMessage {
    public static final class ChatMessageBuilder {
        public ChatMessageBuilder toolCalls(List<ToolCall> toolCalls); // 显式设置 assistant 的工具调用信息
        public ChatMessageBuilder addToolTextContent(String text, String toolCallId);   // 工具执行结果（文本）
        public ChatMessageBuilder addToolImageData(byte[] image, String toolCallId) throws CopilotServiceException; // 工具执行结果（图像）
    }
}
```

- 非流式方式下，只需将第 1 次 `execute(...)` 的返回值（`response`）原样传入 `ChatMessage.builder().from(response).newMessage().withRole("tool")...`，即可继承刚才 assistant 的工具调用信息（`toolCalls`）
- **流式方式下不会返回响应消息本身**（因为是 `void` 方法）。需要先从数据块自行累积工具调用信息，再显式追加 `ChatMessage.builder().from(messages).newMessage().withRole("assistant").toolCalls(累积的toolCalls)`，然后接续 `tool` 角色的结果消息（参照 `assets/toolcalling-basic-usage.md` 模式 2）
- 对于同一个工具调用，也可以叠加多个工具执行结果内容（文本＋图像等）。`addToolTextContent`/`addToolImageData` 可以指定相同的 `toolCallId` 连续调用

## 工具参数的校验・反序列化（`im_copilot_base` 提供的工具类）

```java
package jp.co.intra_mart.foundation.copilot.tool;

public class JsonSchemaValidator {
    public JsonSchemaValidator(Map<String, Object> schema);
    public JsonSchemaValidator(Map<String, Object> schema, Locale locale);
    public boolean isValid(String json);
    public List<SchemaValidationError> validate(String json); // 不合规时的错误详情列表
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

由于模型返回的值不一定完全符合模式定义，对于通过 `ToolCall.getArguments()` 获得的 JSON 字符串，建议在执行前先用 `JsonSchemaValidator.isValid(...)` 校验，再用 `ToolJsonHelper.deserialize(...)` 反序列化（平台自身的内部校验用测试代码中也使用了这一模式）。

## 使用 Amazon Bedrock 驱动时的约束（在 `ToolDefinition`/`ToolChoice`/`ChatMessage` 的 JavaDoc 中有明确说明）

- `ToolDefinition.strict(...)` 的设置会被忽略
- 无法指定 `ToolChoice.none()`（工具选择「无」）
- 无法使用 `ChatMessage.ChatMessageBuilder.addImageUrl(...)`（图像仅支持二进制（`addImageData`））
- 图像详情（`detail`）的指定会被忽略
- 系统消息（`role: "system"`）仅最新的 1 条有效

以上约束仅在通过 `ChatAction`/`ToolConfig` 使用 Amazon Bedrock 驱动时才相关，OpenAI・Azure OpenAI Service 不受此约束。由于驱动类型取决于租户设置（`conf/im-copilot-driver-config.xml`），若需兼容多种驱动，应确保实现不触及这些约束。
</content>
