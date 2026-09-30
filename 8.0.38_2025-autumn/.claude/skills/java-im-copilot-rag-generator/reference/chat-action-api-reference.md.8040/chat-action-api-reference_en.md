# Action API Reference (Java Edition)

Based on the actual class definitions of the `im_copilot`/`im_copilot_core` modules (`jp.co.intra_mart.foundation.copilot.action.*`). Do not supplement methods/attributes from memory or guesswork.

The `Action` family of APIs is a **lower-level API dedicated to single-shot calls such as chat and embeddings**, compared to `Agent`/`AgentBuilder` in the `im_copilot_agent` module (the higher-level API handled by `java-im-copilot-agent-generator`, which has Tool/Knowledge/Skill integration and an execution loop built in). It is suited to simple LLM calls that don't need an Agent Loop, such as query generation and answer generation in RAG.

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

`ActionFactory.getFactory()` resolves the tenant's driver configuration (`conf/im-copilot-driver-config.xml`) and returns a `ChatAction`/`EmbeddingsAction` implementation corresponding to the configured driver type (OpenAI / Azure OpenAI Service / Amazon Bedrock, etc.). **The calling side does not need to be aware of the driver type** (no branching is needed in code).

## `ChatAction`

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public interface ChatAction extends Action<List<ChatMessage>, ChatOption, List<ChatMessage>> {
    List<ChatMessage> execute(List<ChatMessage> messages) throws CopilotServiceActionException;
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option) throws CopilotServiceActionException;
    void execute(List<ChatMessage> messages, ChatOption option, ChatActionChunkHandler handler) throws CopilotServiceActionException;

    // Tool Calling-enabled versions (see java-im-copilot-toolcalling-generator)
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
    void execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig, ChatActionChunkHandler handler) throws CopilotServiceActionException;

    // Since 8.0.5: returns an execution result including details such as token usage
    ChatActionResult executeWithDetails(List<ChatMessage> messages) throws CopilotServiceActionException;
    ChatActionResult executeWithDetails(List<ChatMessage> messages, ChatOption option) throws CopilotServiceActionException;
    ChatActionResult executeWithDetails(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
}
```

- The non-streaming version, `execute(messages, option)`, returns a list of `ChatMessage` with the response appended (the last element is the response message)
- The streaming version, `execute(messages, option, handler)`, returns `void` and invokes `ChatActionChunkHandler` (a functional interface receiving a `ChunkChatMessage`) for each chunk
- For simple chats that don't involve Tool Calling (such as query generation/answer generation in RAG), use the overload that doesn't take a `ToolConfig`

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
        public ChatMessageBuilder finish(); // Returns to ChatMessageListBuilder
        public ChatMessageBuilder newMessage(); // Calls finish() and moves to the next message
        public List<ChatMessage> build(); // Sugar for finish().build()
    }

    public String getRole();
    public Object getContent();
    public List<ToolCall> getToolCalls();
}
```

Basic form: `ChatMessage.builder().newMessage().withRole("system").addTextContent("...").newMessage().withRole("user").addTextContent(userMessage).build()`. To carry forward conversation history, use `builder().from(history).newMessage()...`.

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

All fields are optional (`ChatOption.builder().build()` alone is fine). If `model` is omitted, the tenant's driver configuration's default model is used. When using a reasoning model, there may be constraints on `temperature`/`topP`/`stops`, so refer to the official documentation of the AI service being used for details.

## `EmbeddingsAction`/`EmbeddingsOption`

```java
package jp.co.intra_mart.foundation.copilot.action.embeddings;

public interface EmbeddingsAction extends Action<String, EmbeddingsOption, float[]> {
    float[] execute(String text) throws CopilotServiceActionException;
    float[] execute(String text, EmbeddingsOption option) throws CopilotServiceActionException;
    EmbeddingsActionResult executeWithDetails(String text) throws CopilotServiceActionException; // Since 8.0.5
    EmbeddingsActionResult executeWithDetails(String text, EmbeddingsOption option) throws CopilotServiceActionException; // Since 8.0.5
}
```

```java
package jp.co.intra_mart.foundation.copilot.action.embeddings;

// Lombok @Builder
public class EmbeddingsOption {
    // .model(String) .build()
}
```

`EmbeddingsAction.execute(...)` returns `float[]`. Since `Embedder.generate(...)` (`reference/vectorstore-api-reference.md`) returns `List<Float>`, convert `float[]` → `List<Float>` inside the `Embedder` implementation.

## `MessageTemplate` (Templating System Prompts)

```java
package jp.co.intra_mart.foundation.copilot.assistant.template;

public class MessageTemplate {
    public static MessageTemplate getInstance();
    public String load(String templateName, Object dataModel) throws CopilotAssistantException; // Resolved with the AccountContext locale
    public String load(String templateName, Locale locale, Object dataModel) throws CopilotAssistantException;
}
```

The template engine is FreeMarker. Template files are loaded from the classpath (under `src/main/resources/`). When calling from an `Assistant` implementation (an `AbstractCopilotAssistant` subclass), the 2-argument version, which automatically uses the `AccountContext` locale, is convenient.

## `ChatMessageConverter` (Interconversion with the Assistant Framework)

```java
package jp.co.intra_mart.foundation.copilot.assistant.converter;

public final class ChatMessageConverter {
    public static List<ChatMessage> convert(Collection<AssistantMessage> messages);
}
```

Converts a collection of `AbstractCopilotAssistant.getMessageHistory()` (`jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage`) into a list of `ChatMessage` handled by `ChatAction`. Use it when passing chat history to `ChatAction` via the Assistant framework.
