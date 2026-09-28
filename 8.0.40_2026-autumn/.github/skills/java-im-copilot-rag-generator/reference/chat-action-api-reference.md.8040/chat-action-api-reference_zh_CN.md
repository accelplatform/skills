# Action API 参考（Java 版）

基于 `im_copilot`/`im_copilot_core` 模块（`jp.co.intra_mart.foundation.copilot.action.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

`Action` 系列 API 相比 `im_copilot_agent` 模块的 `Agent`/`AgentBuilder`（`java-im-copilot-agent-generator` 所涉及、内置了 Tool/Knowledge/Skill 集成与执行循环的高层级 API），是**更低层级、专注于聊天・嵌入等单次调用的 API**。适用于 RAG 的查询生成・回答生成这类不需要 Agent Loop 的简单 LLM 调用。

## `ActionFactory`

```java
package jp.co.intra_mart.foundation.copilot.action;

public abstract class ActionFactory {
    public static ActionFactory getFactory();
    public abstract ChatAction getChatAction() throws CopilotServiceConfigurationException;
    public abstract EmbeddingsAction getEmbeddingsAction() throws CopilotServiceConfigurationException;
    public abstract AudioSpeechAction getAudioSpeechAction() throws CopilotServiceConfigurationException;
    public abstract AudioTranscriptionAction getAudioTranscriptionAction() throws CopilotServiceConfigurationException;
    public abstract ImageGenerationAction getImageGenerationAction() throws CopilotServiceConfigurationException;
    public abstract DriverType getDriverType(String tenantId, ActionType actionType) throws CopilotServiceConfigurationException;
    public abstract DriverType getTenantDriverType(ActionType actionType) throws CopilotServiceConfigurationException;
}
```

`ActionFactory.getFactory()` 会解析租户的驱动配置（`conf/im-copilot-driver-config.xml`），并根据所配置的驱动类型（OpenAI / Azure OpenAI Service / Amazon Bedrock 等）返回对应的 `ChatAction`/`EmbeddingsAction` 实现。**调用方无需关心驱动类型**（代码层面无需分支处理）。

## `ChatAction`

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public interface ChatAction extends Action<List<ChatMessage>, ChatOption, List<ChatMessage>> {
    List<ChatMessage> execute(List<ChatMessage> messages) throws CopilotServiceActionException;
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option) throws CopilotServiceActionException;
    void execute(List<ChatMessage> messages, ChatOption option, ChatActionChunkHandler handler) throws CopilotServiceActionException;

    // 支持 Tool Calling 的版本（参见 java-im-copilot-toolcalling-generator）
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
    void execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig, ChatActionChunkHandler handler) throws CopilotServiceActionException;

    // 8.0.5〜：返回包含令牌使用量等详细信息的执行结果
    ChatActionResult executeWithDetails(List<ChatMessage> messages) throws CopilotServiceActionException;
    ChatActionResult executeWithDetails(List<ChatMessage> messages, ChatOption option) throws CopilotServiceActionException;
    ChatActionResult executeWithDetails(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
}
```

- 非流式版本 `execute(messages, option)` 返回追加了响应的 `ChatMessage` 列表（末尾元素为响应消息）
- 流式版本 `execute(messages, option, handler)` 返回 `void`，每个数据块都会调用一次 `ChatActionChunkHandler`（接收 `ChunkChatMessage` 的函数式接口）
- 对于不涉及 Tool Calling 的简单聊天（如 RAG 的查询生成・回答生成），使用不传入 `ToolConfig` 的重载即可

## `ChatMessage`

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public final class ChatMessage {
    public static ChatMessageListBuilder builder();

    public static final class ChatMessageListBuilder {
        public ChatMessageListBuilder from(List<ChatMessage> historyMessages);
        public ChatMessageBuilder newMessage();
        public List<ChatMessage> build();
    }

    public static final class ChatMessageBuilder {
        public ChatMessageBuilder withRole(String role); // "system" | "user" | "assistant" | "tool"
        public ChatMessageBuilder addTextContent(String text);
        public ChatMessageBuilder addImageData(byte[] image) throws CopilotServiceException;
        public ChatMessageBuilder addImageUrl(String url);
        public ChatMessageBuilder addThinkingContent(String thinking, String signature);
        public ChatMessageBuilder finish(); // 返回 ChatMessageListBuilder
        public ChatMessageBuilder newMessage(); // 执行 finish() 后转到下一条消息
        public List<ChatMessage> build(); // finish().build() 的语法糖
    }

    public String getRole();
    public Object getContent();
    public List<ToolCall> getToolCalls();
}
```

基本形式：`ChatMessage.builder().newMessage().withRole("system").addTextContent("...").newMessage().withRole("user").addTextContent(userMessage).build()`。需要延续会话历史时，使用 `builder().from(history).newMessage()...`。

## `ChatOption`

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

// Lombok @Builder
public class ChatOption implements Option {
    // .model(String) .maxTokens(Integer) .temperature(Double) .topP(Double)
    // .stops(List<String>) .reasoningEffort(String) .verbosity(String)
    public static ChatOptionBuilder builder();
}
```

所有字段均可省略（仅 `ChatOption.builder().build()` 也可以）。省略 `model` 时将使用租户驱动配置中的默认模型。使用推理模型时，`temperature`/`topP`/`stops` 可能存在限制，详细信息请参照所使用的 AI 服务的官方文档。

## `EmbeddingsAction`/`EmbeddingsOption`

```java
package jp.co.intra_mart.foundation.copilot.action.embeddings;

public interface EmbeddingsAction extends Action<String, EmbeddingsOption, float[]> {
    float[] execute(String text) throws CopilotServiceActionException;
    float[] execute(String text, EmbeddingsOption option) throws CopilotServiceActionException;
    EmbeddingsActionResult executeWithDetails(String text) throws CopilotServiceActionException; // 8.0.5〜
    EmbeddingsActionResult executeWithDetails(String text, EmbeddingsOption option) throws CopilotServiceActionException; // 8.0.5〜
}
```

```java
package jp.co.intra_mart.foundation.copilot.action.embeddings;

// Lombok @Builder
public class EmbeddingsOption {
    // .model(String) .build()
}
```

`EmbeddingsAction.execute(...)` 返回 `float[]`。由于 `Embedder.generate(...)`（参见 `reference/vectorstore-api-reference.md`）返回 `List<Float>`，需要在 `Embedder` 实现内部将 `float[]` 转换为 `List<Float>`。

## `MessageTemplate`（系统提示词的模板化）

```java
package jp.co.intra_mart.foundation.copilot.assistant.template;

public class MessageTemplate {
    public static MessageTemplate getInstance();
    public String load(String templateName, Object dataModel) throws CopilotAssistantException; // 使用 AccountContext 的区域设置进行解析
    public String load(String templateName, Locale locale, Object dataModel) throws CopilotAssistantException;
}
```

模板引擎为 FreeMarker。模板文件从类路径（`src/main/resources/` 下）读取。从 `Assistant` 实现（`AbstractCopilotAssistant` 子类）调用时，使用自动采用 `AccountContext` 区域设置的两参数版本较为方便。

## `ChatMessageConverter`（与 Assistant 框架的相互转换）

```java
package jp.co.intra_mart.foundation.copilot.assistant.converter;

public final class ChatMessageConverter {
    public static List<ChatMessage> convert(Collection<AssistantMessage> messages);
}
```

将 `AbstractCopilotAssistant.getMessageHistory()`（`jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage` 的集合）转换为 `ChatAction` 所使用的 `ChatMessage` 列表。用于经由 Assistant 框架将聊天历史传递给 `ChatAction` 的场景。
