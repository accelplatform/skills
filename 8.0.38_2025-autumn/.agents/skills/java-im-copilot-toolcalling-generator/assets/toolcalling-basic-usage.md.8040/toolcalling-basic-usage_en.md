# Tool Calling Implementation Patterns (Java)

A collection of implementation patterns for provider-agnostic Tool Calling using `ChatAction`+`ToolConfig`. Refer to `reference/toolcalling-api-reference.md` (this skill) and `reference/chat-action-api-reference.md` (`java-im-copilot-rag-generator`) for exact method signatures.

## Pattern 1: Non-Streaming Tool Calling (Assistant)

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

    /** Arguments for the get_weather tool. */
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

            // First call: check whether the model requests a tool call
            final List<ChatMessage> response = chatAction.execute(messages, option, new ToolConfig(tools, toolChoice));
            final List<ToolCall> toolCalls = response.get(response.size() - 1).getToolCalls();

            if (toolCalls == null || toolCalls.isEmpty()) {
                // If no tool call was requested, return the response as-is as the final answer
                final Object lastContent = response.get(response.size() - 1).getContent();
                return AssistantResult.builder()
                        .message(new AssistantMessage("assistant", String.valueOf(lastContent)))
                        .finishReason("stop")
                        .build();
            }

            // Validate and execute the tool call arguments
            final ChatMessageBuilder toolResultBuilder = ChatMessage.builder().from(response).newMessage().withRole("tool");
            for (final ToolCall toolCall : toolCalls) {
                final JsonSchemaValidator validator = new JsonSchemaValidator(weatherTool.getParameters());
                if (!validator.isValid(toolCall.getArguments())) {
                    throw new CopilotAssistantException("ツール呼び出しの引数が不正です: " + validator.validate(toolCall.getArguments()));
                }
                final GetWeatherArgument args = ToolJsonHelper.deserialize(toolCall.getArguments(), GetWeatherArgument.class);
                // Execute the actual tool (e.g., an external API call) here. This example returns a fixed string
                final String weatherText = args.getCity() + "の天気は晴れです。";
                toolResultBuilder.addToolTextContent(weatherText, toolCall.getId());
            }

            // Get the final response that reflects the tool execution result (second call)
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

- `ToolChoice` only needs to be specified on the first call (for the second, final call, `toolChoice` can be omitted, as in `ToolConfig(tools)`; keep passing the same tool definitions)
- Since `CopilotServiceConfigurationException`, `CopilotServiceActionException`, and `CopilotServiceException` are all related by inheritance to `CopilotServiceException`, the `catch` can be consolidated into a single `CopilotServiceException` (note that writing them separately in a `catch (A | B e)` form causes a "cannot multi-catch a superclass and a subclass" compile error)

## Pattern 2: Streaming Tool Calling

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
                // First call: receive the response as a stream while accumulating tool call information from the chunks
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
                    // If there is no tool call, the accumulated text is the final response as-is
                    writer.writeResponse(AssistantResult.builder()
                            .message(new AssistantMessage("assistant", answer.toString()))
                            .finishReason("stop")
                            .build());
                    return null;
                }

                // Execute the tools, then make the second call reflecting the execution results
                // Since streaming does not return the response message itself,
                // explicitly add the assistant's tool call information (toolCalls) before continuing with the tool-role result
                final ChatMessageBuilder toolResultBuilder = ChatMessage.builder()
                        .from(messages)
                        .newMessage().withRole("assistant").toolCalls(toolCalls)
                        .newMessage().withRole("tool");
                for (final ToolCall toolCall : toolCalls) {
                    final String weatherText = "晴れです。"; // Replace with the actual tool execution result
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

    /** Arguments for the get_weather tool. */
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
     * Merges {@code ToolCall} instances that arrive split across streaming chunks into a single call's information.<br>
     * The {@code id} is set on the first chunk, and subsequent fragment chunks have {@code id} as
     * {@code null} and hold only a fragment of {@code arguments}, so they are concatenated onto the most recently added element.
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

- Since streaming's `ChatAction.execute(..., handler)` returns `void`, **the response message (`ChatMessage`) itself is not obtained**. Assemble the text yourself by concatenating `chunk.getDelta().getContent()`, and merge tool calls yourself from `chunk.getDelta().getToolCalls()`
- When assembling the message for the second call, since streaming does not yield the first `assistant` response message, you must **explicitly add an assistant tool-call message** like `ChatMessage.builder().from(messages).newMessage().withRole("assistant").toolCalls(accumulated toolCalls)` before continuing with the `tool`-role result message (this differs from the non-streaming version)

## Notes

- **`ToolConfig`+`ChatAction` works with the same code regardless of tenant driver — OpenAI, Azure OpenAI Service, or Amazon Bedrock.** There is no need to branch per driver type or use provider-specific request/response classes directly (such as `ChatCompletionRequest`, `MessagesRequest`, etc. — classes internal to the driver implementation)
- **`CopilotServiceConfigurationException`/`CopilotServiceActionException` are subclasses of `CopilotServiceException`.** Trying to consolidate them into a single `multi-catch` (`catch (A | B e)`) causes a compile error. Catch them with the single base `CopilotServiceException`
- **Streaming does not return a response message.** Tool call information must be accumulated from the chunks yourself, and the `assistant`'s tool call information must be explicitly added to the message used for the second call (non-streaming does not require this extra step, since the `response` return value can be reused as-is)
- **There are some constraints when using the Amazon Bedrock driver** (`strict` is ignored, `ToolChoice.none()` is unavailable, `addImageUrl` is unavailable, etc.). For implementations expected to work across multiple drivers, check "Constraints When Using the Amazon Bedrock Driver" in `reference/toolcalling-api-reference.md`
- Tool call arguments (`ToolCall.getArguments()`) are not necessarily guaranteed to match the schema. It is recommended to validate with `JsonSchemaValidator` before deserializing with `ToolJsonHelper.deserialize`
</content>
