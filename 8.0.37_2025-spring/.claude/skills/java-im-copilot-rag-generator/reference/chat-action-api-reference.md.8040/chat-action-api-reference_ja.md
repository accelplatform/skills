# Action API リファレンス（Java 版）

`im_copilot`/`im_copilot_core` モジュール（`jp.co.intra_mart.foundation.copilot.action.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

`Action` 系 API は、`im_copilot_agent` モジュールの `Agent`/`AgentBuilder`（`java-im-copilot-agent-generator` が扱う、Tool/Knowledge/Skill 統合・実行ループを内蔵した高レベル API）よりも**低レベルな、チャット・埋め込み等の単発呼び出しに徹した API**である。RAG のクエリ生成・回答生成のような、Agent Loop を必要としない単純な LLM 呼び出しに適する。

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

`ActionFactory.getFactory()` はテナントのドライバ設定（`conf/im-copilot-driver-config.xml`）を解決し、設定されているドライバ種別（OpenAI / Azure OpenAI Service / Amazon Bedrock 等）に応じた `ChatAction`/`EmbeddingsAction` 実装を返す。**呼び出し側はドライバ種別を意識しない**（コード上の分岐は不要）。

## `ChatAction`

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public interface ChatAction extends Action<List<ChatMessage>, ChatOption, List<ChatMessage>> {
    List<ChatMessage> execute(List<ChatMessage> messages) throws CopilotServiceActionException;
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option) throws CopilotServiceActionException;
    void execute(List<ChatMessage> messages, ChatOption option, ChatActionChunkHandler handler) throws CopilotServiceActionException;

    // Tool Calling 対応版（java-im-copilot-toolcalling-generator 参照）
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
    void execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig, ChatActionChunkHandler handler) throws CopilotServiceActionException;

    // 8.0.5〜：トークン使用量等の詳細を含む実行結果を返す
    ChatActionResult executeWithDetails(List<ChatMessage> messages) throws CopilotServiceActionException;
    ChatActionResult executeWithDetails(List<ChatMessage> messages, ChatOption option) throws CopilotServiceActionException;
    ChatActionResult executeWithDetails(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
}
```

- 非ストリーミング版 `execute(messages, option)` は、応答が追加された `ChatMessage` のリストを返す（末尾要素が応答メッセージ）
- ストリーミング版 `execute(messages, option, handler)` は `void` を返し、チャンクごとに `ChatActionChunkHandler`（`ChunkChatMessage` を受け取る関数型インタフェース）を呼び出す
- Tool Calling を行わない単純なチャット（RAG のクエリ生成・回答生成等）では `ToolConfig` を渡さないオーバーロードを使えばよい

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
        public ChatMessageBuilder finish(); // ChatMessageListBuilder へ戻る
        public ChatMessageBuilder newMessage(); // finish() して次のメッセージへ
        public List<ChatMessage> build(); // finish().build() の糖衣構文
    }

    public String getRole();
    public Object getContent();
    public List<ToolCall> getToolCalls();
}
```

基本形: `ChatMessage.builder().newMessage().withRole("system").addTextContent("...").newMessage().withRole("user").addTextContent(userMessage).build()`。会話履歴を引き継ぐ場合は `builder().from(history).newMessage()...` とする。

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

すべてのフィールドは省略可能（`ChatOption.builder().build()` だけでもよい）。`model` を省略した場合はテナントのドライバ設定の既定モデルが使われる。推論モデル利用時は `temperature`/`topP`/`stops` に制約がある場合があるため、詳細は利用する AI サービスの公式ドキュメントを参照する。

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

`EmbeddingsAction.execute(...)` は `float[]` を返す。`Embedder.generate(...)`（`reference/vectorstore-api-reference.md`）は `List<Float>` を返すため、`Embedder` 実装内で `float[]` → `List<Float>` へ変換する。

## `MessageTemplate`（システムプロンプトのテンプレート化）

```java
package jp.co.intra_mart.foundation.copilot.assistant.template;

public class MessageTemplate {
    public static MessageTemplate getInstance();
    public String load(String templateName, Object dataModel) throws CopilotAssistantException; // AccountContext のロケールで解決
    public String load(String templateName, Locale locale, Object dataModel) throws CopilotAssistantException;
}
```

テンプレートエンジンは FreeMarker。テンプレートファイルはクラスパス（`src/main/resources/` 配下）から読み込まれる。`Assistant` 実装（`AbstractCopilotAssistant` サブクラス）から呼び出す場合、`AccountContext` のロケールが自動的に使われる2引数版が便利。

## `ChatMessageConverter`（Assistant フレームワークとの相互変換）

```java
package jp.co.intra_mart.foundation.copilot.assistant.converter;

public final class ChatMessageConverter {
    public static List<ChatMessage> convert(Collection<AssistantMessage> messages);
}
```

`AbstractCopilotAssistant.getMessageHistory()`（`jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage` のコレクション）を `ChatAction` が扱う `ChatMessage` のリストへ変換する。Assistant フレームワーク経由でチャット履歴を `ChatAction` に渡す場合に使う。
