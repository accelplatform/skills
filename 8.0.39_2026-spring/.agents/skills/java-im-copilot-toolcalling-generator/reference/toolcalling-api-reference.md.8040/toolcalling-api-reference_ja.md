# Tool Calling API リファレンス（Java 版）

`im_copilot`/`im_copilot_core`/`im_copilot_base` モジュール（`jp.co.intra_mart.foundation.copilot.action.chat.*`、`jp.co.intra_mart.foundation.copilot.tool.*`）の実クラス定義に基づく。記憶や推測でメソッド・属性を補わないこと。

`ChatAction`（`java-im-copilot-rag-generator` の `reference/chat-action-api-reference.md` 参照）に `ToolConfig` を渡すことで、**OpenAI・Azure OpenAI Service・Amazon Bedrock のどのテナントドライバでも同一コードで動作する**、プロバイダ非依存の Tool Calling を実装できる。ドライバ種別ごとの分岐は不要。

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
        public ToolDefinitionBuilder strict(Boolean strict); // Amazon Bedrock では無視される
        // 引数（JSON Schema, Draft 2020-12準拠）の設定方法は3通り
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
        public ToolChoiceBuilder auto();               // モデルが自動判断
        public ToolChoiceBuilder none();                // ツールを使わせない（Amazon Bedrock では指定不可）
        public ToolChoiceBuilder required();            // 必ずいずれかのツールを呼ばせる
        public ToolChoiceBuilder tool(String functionName); // 特定のツールの呼び出しを強制する
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
    public String getArguments(); // JSON文字列
    public void setArguments(String arguments); // ストリーミング時のチャンク結合に使う
}
```

- `ToolDefinition.parametersFromClass(Class)` は、対象クラスのフィールドに付与された `SchemaProperties`（`java-im-mcp-generator`/`java-im-copilot-agent-generator` の `UserDefinedTool` 入力DTOと同一のアノテーションクラス）を JSON Schema に変換する（内部で `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator` を使用）
- `parametersAddArgument(name, clazz, required)` は、既存の `parameters` に対して1プロパティずつ追加する（複数のパラメータ用クラスを1つのツール定義にまとめたい場合に使う）
- `ToolCall.getArguments()` はツール呼び出しの引数を表す JSON 文字列。`ToolJsonHelper.deserialize(...)` でデシリアライズする

## `ChatAction` の Tool Calling 対応メソッド

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public interface ChatAction {
    // 非ストリーミング
    List<ChatMessage> execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig) throws CopilotServiceActionException;
    // ストリーミング
    void execute(List<ChatMessage> messages, ChatOption option, ToolConfig toolConfig, ChatActionChunkHandler handler) throws CopilotServiceActionException;
}
```

- 非ストリーミング版は、応答が追加された `List<ChatMessage>` を返す。末尾要素（`response.get(response.size() - 1)`）の `getToolCalls()` が `null`/空でなければツール呼び出しが要求されている
- ストリーミング版はチャンクごとに `ChunkChatMessage` を受け取る。`chunk.getDelta().getToolCalls()` にツール呼び出し情報の断片が入る。**先頭チャンクに `id` が設定され、以降のチャンクは同一ツール呼び出しの `arguments` の断片（`id` は `null`）として届くため、呼び出し側で `id` の有無を見てマージする必要がある**（`assets/toolcalling-basic-usage.md` パターン2参照）

## ツール実行結果メッセージの構築（`ChatMessage.ChatMessageBuilder`）

```java
package jp.co.intra_mart.foundation.copilot.action.chat;

public final class ChatMessage {
    public static final class ChatMessageBuilder {
        public ChatMessageBuilder toolCalls(List<ToolCall> toolCalls); // assistant のツール呼び出し情報を明示的に設定
        public ChatMessageBuilder addToolTextContent(String text, String toolCallId);   // ツール実行結果（テキスト）
        public ChatMessageBuilder addToolImageData(byte[] image, String toolCallId) throws CopilotServiceException; // ツール実行結果（画像）
    }
}
```

- 非ストリーミングの場合、1回目の `execute(...)` の戻り値（`response`）をそのまま `ChatMessage.builder().from(response).newMessage().withRole("tool")...` に渡せば、直前の assistant のツール呼び出し情報（`toolCalls`）も引き継がれる
- **ストリーミングの場合は応答メッセージそのものが返らない**（`void` メソッドのため）。ツール呼び出し情報をチャンクから自前で蓄積したうえで、`ChatMessage.builder().from(messages).newMessage().withRole("assistant").toolCalls(蓄積したtoolCalls)` を明示的に追加してから `tool` ロールの結果メッセージを続ける必要がある（`assets/toolcalling-basic-usage.md` パターン2参照）
- 1つのツール呼び出しに対し複数のツール実行結果コンテンツ（テキスト＋画像等）を積むことも可能。`addToolTextContent`/`addToolImageData` は同じ `toolCallId` を指定して連続で呼び出せる

## ツール引数の検証・デシリアライズ（`im_copilot_base` 提供のユーティリティ）

```java
package jp.co.intra_mart.foundation.copilot.tool;

public class JsonSchemaValidator {
    public JsonSchemaValidator(Map<String, Object> schema);
    public JsonSchemaValidator(Map<String, Object> schema, Locale locale);
    public boolean isValid(String json);
    public List<SchemaValidationError> validate(String json); // 妥当でない場合のエラー詳細一覧
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

`ToolCall.getArguments()` で受け取った JSON 文字列は、モデルが必ずしもスキーマ通りの値を返すとは限らないため、実行前に `JsonSchemaValidator.isValid(...)` で検証してから `ToolJsonHelper.deserialize(...)` でデシリアライズすることを推奨する（プラットフォーム自身の内部検証用テストコードでもこのパターンが使われている）。

## Amazon Bedrock ドライバ利用時の制約（`ToolDefinition`/`ToolChoice`/`ChatMessage` の JavaDoc に明記）

- `ToolDefinition.strict(...)` の設定は無視される
- `ToolChoice.none()`（ツール選択「なし」）は指定できない
- `ChatMessage.ChatMessageBuilder.addImageUrl(...)` は利用できない（画像はバイナリ（`addImageData`）のみ）
- 画像詳細（`detail`）の指定は無視される
- システムメッセージ（`role: "system"`）は最新の1つのみが有効

これらは `ChatAction`/`ToolConfig` 経由で Amazon Bedrock ドライバを使う場合にのみ関係する制約であり、OpenAI・Azure OpenAI Service では制約されない。ドライバ種別はテナント設定（`conf/im-copilot-driver-config.xml`）に依存するため、複数ドライバでの動作を想定する場合はこれらの制約に抵触しない実装にしておくこと。
