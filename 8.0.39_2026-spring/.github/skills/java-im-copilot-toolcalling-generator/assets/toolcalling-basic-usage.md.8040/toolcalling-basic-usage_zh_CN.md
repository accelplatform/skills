# Tool Calling 实现模式（Java 版）

使用 `ChatAction`+`ToolConfig` 的、与提供商无关的 Tool Calling 实现模式集。方法的准确签名请参照 `reference/toolcalling-api-reference.md`（本技能）・`reference/chat-action-api-reference.md`（`java-im-copilot-rag-generator`）。

## 模式 1：非流式的 Tool Calling（Assistant）

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

    /** get_weather 工具的参数。 */
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

            // 第 1 次调用：确认模型是否要求调用工具
            final List<ChatMessage> response = chatAction.execute(messages, option, new ToolConfig(tools, toolChoice));
            final List<ToolCall> toolCalls = response.get(response.size() - 1).getToolCalls();

            if (toolCalls == null || toolCalls.isEmpty()) {
                // 未请求工具调用时，直接作为最终响应返回
                final Object lastContent = response.get(response.size() - 1).getContent();
                return AssistantResult.builder()
                        .message(new AssistantMessage("assistant", String.valueOf(lastContent)))
                        .finishReason("stop")
                        .build();
            }

            // 校验并执行工具调用的参数
            final ChatMessageBuilder toolResultBuilder = ChatMessage.builder().from(response).newMessage().withRole("tool");
            for (final ToolCall toolCall : toolCalls) {
                final JsonSchemaValidator validator = new JsonSchemaValidator(weatherTool.getParameters());
                if (!validator.isValid(toolCall.getArguments())) {
                    throw new CopilotAssistantException("ツール呼び出しの引数が不正です: " + validator.validate(toolCall.getArguments()));
                }
                final GetWeatherArgument args = ToolJsonHelper.deserialize(toolCall.getArguments(), GetWeatherArgument.class);
                // 在此处执行实际的工具（外部 API 调用等）。本示例返回固定字符串
                final String weatherText = args.getCity() + "の天気は晴れです。";
                toolResultBuilder.addToolTextContent(weatherText, toolCall.getId());
            }

            // 获取基于工具执行结果的最终响应（第 2 次调用）
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

- `ToolChoice` 只需在第 1 次调用时指定即可（第 2 次的最终询问中，如 `ToolConfig(tools)` 那样省略 `toolChoice` 即可。工具定义本身需持续传入相同的内容）
- `CopilotServiceConfigurationException`・`CopilotServiceActionException`・`CopilotServiceException` 均处于 `CopilotServiceException` 的继承关系中，因此可以将 `catch` 合并为一个 `CopilotServiceException`（若分别写成 `catch (A | B e)` 的形式，会因「无法对超类和子类进行 multi-catch」而导致编译错误，需注意）

## 模式 2：流式的 Tool Calling

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
                // 第 1 次：以流式方式接收响应的同时，从数据块中累积工具调用信息
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
                    // 若没有工具调用，则累积的文本即为最终响应
                    writer.writeResponse(AssistantResult.builder()
                            .message(new AssistantMessage("assistant", answer.toString()))
                            .finishReason("stop")
                            .build());
                    return null;
                }

                // 执行工具，并基于执行结果进行第 2 次调用
                // 由于流式方式下不会返回响应消息本身，
                // 需先显式追加 assistant 的工具调用信息（toolCalls），再接续 tool 角色的结果
                final ChatMessageBuilder toolResultBuilder = ChatMessage.builder()
                        .from(messages)
                        .newMessage().withRole("assistant").toolCalls(toolCalls)
                        .newMessage().withRole("tool");
                for (final ToolCall toolCall : toolCalls) {
                    final String weatherText = "晴れです。"; // 替换为实际的工具执行结果
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

    /** get_weather 工具的参数。 */
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
     * 将以流式数据块分片到达的 {@code ToolCall} 合并为一条调用信息。<br>
     * 首个数据块会设置 {@code id}，之后的分片数据块 {@code id} 为 {@code null}，
     * 仅持有 {@code arguments} 的片段，因此需连接到刚才追加的元素上。
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

- 流式方式下，`ChatAction.execute(..., handler)` 返回 `void`，因此**无法获得响应消息（`ChatMessage`）本身**。文本需通过连接 `chunk.getDelta().getContent()` 自行组装，工具调用需通过 `chunk.getDelta().getToolCalls()` 自行合并
- 在组装第 2 次调用用的消息时，由于流式方式下无法获得第 1 次的 `assistant` 响应消息，需要像 `ChatMessage.builder().from(messages).newMessage().withRole("assistant").toolCalls(累积的toolCalls)` 那样**显式追加 assistant 的工具调用消息**，然后再接续 `tool` 角色的结果消息（这一点与非流式版本不同）

## 注意事项

- **`ToolConfig`+`ChatAction` 在 OpenAI・Azure OpenAI Service・Amazon Bedrock 任一租户驱动下均以相同代码工作。** 无需按驱动类型分支处理，也无需直接使用提供商特有的请求/响应类（`ChatCompletionRequest`・`MessagesRequest` 等驱动实现内部的类）
- **`CopilotServiceConfigurationException`/`CopilotServiceActionException` 是 `CopilotServiceException` 的子类。** 若试图将它们合并为一个 `multi-catch`（`catch (A | B e)`）会导致编译错误。用基类 `CopilotServiceException` 统一捕获即可
- **流式方式下不会返回响应消息。** 工具调用信息需从数据块自行累积，并在第 2 次调用用的消息中显式追加 `assistant` 的工具调用信息（非流式方式下可以直接沿用 `response`（返回值），无需这一步骤）
- **使用 Amazon Bedrock 驱动时存在部分约束**（`strict` 被忽略、`ToolChoice.none()` 不可用、`addImageUrl` 不可用等）。若实现需兼容多种驱动，请确认 `reference/toolcalling-api-reference.md`「使用 Amazon Bedrock 驱动时的约束」
- 工具调用的参数（`ToolCall.getArguments()`）不一定完全符合模式定义。建议先用 `JsonSchemaValidator` 校验，再用 `ToolJsonHelper.deserialize` 反序列化
</content>
