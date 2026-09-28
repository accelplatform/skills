# Tool Calling 実装パターン（Java 版）

`ChatAction`+`ToolConfig` を使った、プロバイダ非依存の Tool Calling 実装パターン集。メソッドの正確なシグネチャは `reference/toolcalling-api-reference.md`（本スキル）・`reference/chat-action-api-reference.md`（`java-im-copilot-rag-generator`）を参照すること。

## パターン1: 非ストリーミングの Tool Calling（Assistant）

```java
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.foundation.copilot.action.ActionFactory;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatAction;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatMessage;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatMessage.ChatMessageBuilder;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatOption;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolCall;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolChoice;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolConfig;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition;
import jp.co.intra_mart.foundation.copilot.assistant.AbstractCopilotAssistant;
import jp.co.intra_mart.foundation.copilot.assistant.AssistantType;
import jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant;
import jp.co.intra_mart.foundation.copilot.assistant.exception.CopilotAssistantException;
import jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantParameter;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantResult;
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceException;
import jp.co.intra_mart.foundation.copilot.tool.JsonSchemaValidator;
import jp.co.intra_mart.foundation.copilot.tool.ToolJsonHelper;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.StringProperty;

@Assistant(id = "weather_toolcalling_assistant", name = "Weather Tool Calling Assistant",
        type = AssistantType.STANDARD, listEnable = true, storeMessage = false)
public class WeatherToolCallingAssistant extends AbstractCopilotAssistant<AssistantParameter> {

    /** get_weather ツールの引数。 */
    public static class GetWeatherArgument {
        @StringProperty(description = "都市名。例: 東京", required = true)
        private String city;

        public String getCity() {
            return city;
        }

        public void setCity(final String city) {
            this.city = city;
        }
    }

    @Override
    protected AssistantResult doExecute(final AssistantParameter parameter) throws CopilotAssistantException {
        if (parameter.getMessage() == null || parameter.getMessage().getContents() == null) {
            throw new CopilotAssistantException("message is required");
        }
        final String userMessage = String.valueOf(parameter.getMessage().getContents());

        try {
            final ToolDefinition weatherTool = ToolDefinition.builder()
                    .name("get_weather")
                    .description("指定した都市の現在の天気を取得する")
                    .parametersFromClass(GetWeatherArgument.class)
                    .build();
            final List<ToolDefinition> tools = new ArrayList<>();
            tools.add(weatherTool);

            final ChatAction chatAction = ActionFactory.getFactory().getChatAction();

            final List<ChatMessage> messages = ChatMessage.builder()
                    .newMessage().withRole("system").addTextContent("あなたは天気案内アシスタントです。必要に応じて get_weather ツールを使ってください。")
                    .newMessage().withRole("user").addTextContent(userMessage)
                    .build();

            final ChatOption option = ChatOption.builder().build();
            final ToolChoice toolChoice = ToolChoice.builder().auto().build();

            // 1回目の呼び出し：モデルがツール呼び出しを要求するかどうかを確認する
            final List<ChatMessage> response = chatAction.execute(messages, option, new ToolConfig(tools, toolChoice));
            final List<ToolCall> toolCalls = response.get(response.size() - 1).getToolCalls();

            if (toolCalls == null || toolCalls.isEmpty()) {
                // ツール呼び出しが要求されなかった場合はそのまま最終応答として返す
                final Object lastContent = response.get(response.size() - 1).getContent();
                return AssistantResult.builder()
                        .message(new AssistantMessage("assistant", String.valueOf(lastContent)))
                        .finishReason("stop")
                        .build();
            }

            // ツール呼び出しの引数を検証・実行する
            final ChatMessageBuilder toolResultBuilder = ChatMessage.builder().from(response).newMessage().withRole("tool");
            for (final ToolCall toolCall : toolCalls) {
                final JsonSchemaValidator validator = new JsonSchemaValidator(weatherTool.getParameters());
                if (!validator.isValid(toolCall.getArguments())) {
                    throw new CopilotAssistantException("ツール呼び出しの引数が不正です: " + validator.validate(toolCall.getArguments()));
                }
                final GetWeatherArgument args = ToolJsonHelper.deserialize(toolCall.getArguments(), GetWeatherArgument.class);
                // ここで実際のツール（外部API呼び出し等）を実行する。本例では固定文字列を返す
                final String weatherText = args.getCity() + "の天気は晴れです。";
                toolResultBuilder.addToolTextContent(weatherText, toolCall.getId());
            }

            // ツール実行結果を踏まえた最終応答を取得する（2回目の呼び出し）
            final List<ChatMessage> finalResponse = chatAction.execute(toolResultBuilder.build(), option, new ToolConfig(tools));
            final Object finalContent = finalResponse.get(finalResponse.size() - 1).getContent();

            return AssistantResult.builder()
                    .message(new AssistantMessage("assistant", String.valueOf(finalContent)))
                    .finishReason("stop")
                    .build();
        } catch (final CopilotServiceException e) {
            throw new CopilotAssistantException("Tool Calling 実行に失敗しました: " + e.getMessage(), e);
        }
    }
}
```

- `ToolChoice` は1回目の呼び出しにのみ指定すればよい（2回目の最終問い合わせでは `ToolConfig(tools)` のように `toolChoice` 省略でよい。ツール定義自体は同じものを渡し続ける）
- `CopilotServiceConfigurationException`・`CopilotServiceActionException`・`CopilotServiceException` はいずれも `CopilotServiceException` の継承関係にあるため、`catch` を1つの `CopilotServiceException` にまとめられる（別々に `catch (A | B e)` の形で書くと「スーパークラスとサブクラスを multi-catch できない」というコンパイルエラーになるので注意）

## パターン2: ストリーミングの Tool Calling

```java
import java.util.ArrayList;
import java.util.List;

import jp.co.intra_mart.common.aid.jdk.java.lang.StringUtil;
import jp.co.intra_mart.foundation.copilot.action.ActionFactory;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatAction;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatMessage;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatMessage.ChatMessageBuilder;
import jp.co.intra_mart.foundation.copilot.action.chat.ChatOption;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolCall;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolChoice;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolConfig;
import jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition;
import jp.co.intra_mart.foundation.copilot.assistant.AbstractCopilotAssistant;
import jp.co.intra_mart.foundation.copilot.assistant.AssistantType;
import jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant;
import jp.co.intra_mart.foundation.copilot.assistant.exception.CopilotAssistantException;
import jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantParameter;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantResult;
import jp.co.intra_mart.foundation.copilot.assistant.response.AssistantResponseWriter;
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceException;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.StringProperty;

@Assistant(id = "weather_toolcalling_stream_assistant", name = "Weather Tool Calling Assistant (Streaming)",
        type = AssistantType.STANDARD, listEnable = true, storeMessage = false)
public class WeatherToolCallingStreamAssistant extends AbstractCopilotAssistant<AssistantParameter> {

    @Override
    protected AssistantResult doExecute(final AssistantParameter parameter) throws CopilotAssistantException {
        if (parameter.getMessage() == null || parameter.getMessage().getContents() == null) {
            throw new CopilotAssistantException("message is required");
        }
        final String userMessage = String.valueOf(parameter.getMessage().getContents());

        try {
            final List<ToolDefinition> tools = buildTools();
            final ChatAction chatAction = ActionFactory.getFactory().getChatAction();

            final List<ChatMessage> messages = ChatMessage.builder()
                    .newMessage().withRole("system").addTextContent("あなたは天気案内アシスタントです。必要に応じて get_weather ツールを使ってください。")
                    .newMessage().withRole("user").addTextContent(userMessage)
                    .build();
            final ChatOption option = ChatOption.builder().build();

            try (AssistantResponseWriter writer = getAssistantContext().getResponseWriter()) {
                // 1回目：ストリーミングで応答を受け取りつつ、ツール呼び出し情報をチャンクから蓄積する
                final StringBuilder answer = new StringBuilder();
                final List<ToolCall> toolCalls = new ArrayList<>();
                chatAction.execute(messages, option, new ToolConfig(tools, ToolChoice.builder().auto().build()), chunk -> {
                    if (chunk.getDelta() != null && chunk.getDelta().getContent() != null) {
                        answer.append(chunk.getDelta().getContent());
                    }
                    if (chunk.getDelta() != null && chunk.getDelta().getToolCalls() != null) {
                        mergeToolCallChunks(toolCalls, chunk.getDelta().getToolCalls());
                    }
                });

                if (toolCalls.isEmpty()) {
                    // ツール呼び出しが無ければ、蓄積したテキストがそのまま最終応答
                    writer.writeResponse(AssistantResult.builder()
                            .message(new AssistantMessage("assistant", answer.toString()))
                            .finishReason("stop")
                            .build());
                    return null;
                }

                // ツールを実行し、実行結果を踏まえて2回目の呼び出しを行う
                // ストリーミングでは応答メッセージそのものが返らないため、
                // assistant のツール呼び出し情報（toolCalls）を明示的に追加してから tool ロールの結果を続ける
                final ChatMessageBuilder toolResultBuilder = ChatMessage.builder()
                        .from(messages)
                        .newMessage().withRole("assistant").toolCalls(toolCalls)
                        .newMessage().withRole("tool");
                for (final ToolCall toolCall : toolCalls) {
                    final String weatherText = "晴れです。"; // 実際のツール実行結果に置き換える
                    toolResultBuilder.addToolTextContent(weatherText, toolCall.getId());
                }

                final StringBuilder finalAnswer = new StringBuilder();
                chatAction.execute(toolResultBuilder.build(), option, new ToolConfig(tools), chunk -> {
                    if (chunk.getDelta() != null && chunk.getDelta().getContent() != null) {
                        finalAnswer.append(chunk.getDelta().getContent());
                    }
                });
                writer.writeResponse(AssistantResult.builder()
                        .message(new AssistantMessage("assistant", finalAnswer.toString()))
                        .finishReason("stop")
                        .build());
            }
        } catch (final CopilotServiceException | java.io.IOException e) {
            throw new CopilotAssistantException("Tool Calling 実行に失敗しました: " + e.getMessage(), e);
        }

        return null;
    }

    /** get_weather ツールの引数。 */
    public static class GetWeatherArgument {
        @StringProperty(description = "都市名。例: 東京", required = true)
        private String city;

        public String getCity() {
            return city;
        }

        public void setCity(final String city) {
            this.city = city;
        }
    }

    private List<ToolDefinition> buildTools() throws CopilotServiceException {
        final List<ToolDefinition> tools = new ArrayList<>();
        tools.add(ToolDefinition.builder()
                .name("get_weather")
                .description("指定した都市の現在の天気を取得する")
                .parametersFromClass(GetWeatherArgument.class)
                .build());
        return tools;
    }

    /**
     * ストリーミングのチャンクに分割して届く {@code ToolCall} を1つの呼び出し情報にマージする。<br>
     * 先頭チャンクに {@code id} が設定され、以降の断片チャンクは {@code id} が {@code null} で
     * {@code arguments} の断片のみを保持するため、直前に追加した要素へ連結する。
     */
    private void mergeToolCallChunks(final List<ToolCall> accumulated, final List<ToolCall> chunkToolCalls) {
        for (final ToolCall toolCall : chunkToolCalls) {
            if (toolCall.getId() != null) {
                accumulated.add(toolCall);
                continue;
            }
            final ToolCall base = accumulated.get(accumulated.size() - 1);
            if (!StringUtil.isBlank(toolCall.getArguments())) {
                final String baseArguments = base.getArguments() == null ? StringUtil.EMPTY_STRING : base.getArguments();
                base.setArguments(baseArguments + toolCall.getArguments());
            }
        }
    }
}
```

- ストリーミングでは `ChatAction.execute(..., handler)` が `void` を返すため、**応答メッセージ（`ChatMessage`）そのものは得られない**。テキストは `chunk.getDelta().getContent()` を連結して自前で組み立て、ツール呼び出しは `chunk.getDelta().getToolCalls()` を自前でマージする
- 2回目の呼び出し用メッセージを組み立てる際、ストリーミングでは1回目の `assistant` 応答メッセージが得られないため、`ChatMessage.builder().from(messages).newMessage().withRole("assistant").toolCalls(蓄積したtoolCalls)` のように**明示的に assistant のツール呼び出しメッセージを追加してから**、`tool` ロールの結果メッセージを続ける必要がある（非ストリーミング版と異なる点）

## 注意事項

- **`ToolConfig`+`ChatAction` は OpenAI・Azure OpenAI Service・Amazon Bedrock のいずれのテナントドライバでも同一コードで動作する。** ドライバ種別ごとの分岐や、プロバイダ固有のリクエスト/レスポンスクラス（`ChatCompletionRequest`・`MessagesRequest` 等、ドライバ実装内部のクラス）を直接使う必要はない
- **`CopilotServiceConfigurationException`/`CopilotServiceActionException` は `CopilotServiceException` のサブクラス。** これらを1つの `multi-catch`（`catch (A | B e)`）にまとめようとするとコンパイルエラーになる。基底の `CopilotServiceException` 1つで catch すればよい
- **ストリーミングでは応答メッセージが返らない。** ツール呼び出し情報はチャンクから自前で蓄積し、2回目の呼び出し用メッセージに `assistant` のツール呼び出し情報を明示的に追加する必要がある（非ストリーミングでは `response`（戻り値）をそのまま使い回せるため、この手間は不要）
- **Amazon Bedrock ドライバ利用時は一部制約がある**（`strict` 無視、`ToolChoice.none()` 不可、`addImageUrl` 不可等）。複数ドライバでの動作を想定する場合は `reference/toolcalling-api-reference.md`「Amazon Bedrock ドライバ利用時の制約」を確認すること
- ツール呼び出しの引数（`ToolCall.getArguments()`）は必ずしもスキーマ通りとは限らない。`JsonSchemaValidator` で検証してから `ToolJsonHelper.deserialize` でデシリアライズすることを推奨する
