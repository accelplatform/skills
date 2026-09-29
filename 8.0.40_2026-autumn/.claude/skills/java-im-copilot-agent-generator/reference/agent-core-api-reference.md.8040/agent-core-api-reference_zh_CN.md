# Agent 核心 API 参考手册（Java 版）

基于 `im_copilot_agent`/`im_copilot_base` 模块（`jp.co.intra_mart.foundation.copilot.agent.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

## `Agent<T>`（核心接口）

```java
package jp.co.intra_mart.foundation.copilot.agent;

public interface Agent<T> {
    // 无状态执行（内部生成临时会话）
    AgentResponse<T> run(Message message) throws AgentException;
    AgentResponse<T> run(String userMessage) throws AgentException;
    AgentResponse<T> run(Message message, RunContext runContext) throws AgentException;

    // 有状态执行（会话在 Session 的历史中累积）
    AgentResponse<T> run(Session session, Message message) throws AgentException;
    AgentResponse<T> run(Session session, String userMessage) throws AgentException;
    AgentResponse<T> run(Session session, Message message, RunContext runContext) throws AgentException;

    // 流式执行
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

- `run(Message/String)` 为无状态执行。每次调用都会在内部生成临时会话，因此不会保留会话历史
- `run(Session, ...)` 为有状态执行。复用同一个 `Session` 时，过去的发言・响应会累积在 `SessionContext` 中，并包含在后续的 LLM 调用中
- `RunContext` 是用于传递按次运行数据（例如用于 `Instruction` 的 `${...}` 变量展开的 `inputParameters` 等）的对象，可省略（相当于 `RunContext.empty()`）
- 所有方法均声明受检异常 `jp.co.intra_mart.foundation.copilot.agent.exception.AgentException`

## `AgentBuilder<T>`

通过 `Agent.builder()` 获取。主要设置方法（Builder 模式，各方法返回 `this` 或新的构建器）：

**`AgentBuilder<T>` 的构造函数（`AgentBuilder()`）为包私有，因此无法在 `jp.co.intra_mart.foundation.copilot.agent` 包之外对其 `extends`**（子类隐式的 `super()` 调用会导致编译错误）。若需按条件切换设置，不应继承，而应将构建器保存到 `AgentBuilder<?>` 类型的变量中，按条件继续调用方法后再执行 `build()`。

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class AgentBuilder<T> {
    // 模型・调优参数
    public AgentBuilder<T> model(String model);
    public AgentBuilder<T> driver(String driver);
    public AgentBuilder<T> temperature(double temperature);
    public AgentBuilder<T> maxTokens(int maxTokens);
    public AgentBuilder<T> reasoningEffort(String reasoningEffort);
    public AgentBuilder<T> verbosity(String verbosity);
    public AgentBuilder<T> stops(List<String> stops);
    public AgentBuilder<T> modelConfig(ModelConfig modelConfig); // 一次性设置上述调优项（未设置项将变回 null）

    // 指令（系统提示词）
    public AgentBuilder<T> instruction(String instructionText); // 生成 SimpleInstruction
    public AgentBuilder<T> instruction(Instruction instruction);

    // 工具
    public AgentBuilder<T> userDefinedTool(UserDefinedTool<?, ?> userDefinedTool);
    public AgentBuilder<T> userDefinedTools(UserDefinedTool<?, ?>... userDefinedTools);
    public AgentBuilder<T> builtinTool(BuiltinTool<?, ?> builtinTool);
    public AgentBuilder<T> builtinTools(BuiltinTool<?, ?>... builtinTools);
    public AgentBuilder<T> logicFlowTool(Tool<?, ?> logicFlowTool); // IM-LogicDesigner 流程工具
    public AgentBuilder<T> mcpTool(Tool<?, ?> mcpTool); // 传递已解析的 MCP 服务器工具
    public AgentBuilder<T> mcpTools(Collection<? extends Tool<?, ?>> mcpTools);

    // 知识・技能
    public AgentBuilder<T> knowledge(Knowledge knowledge);
    public AgentBuilder<T> skill(SkillEntry skill);
    public AgentBuilder<T> skills(Collection<? extends SkillEntry> skills);

    // Middleware
    public AgentBuilder<T> middleware(AgentExecutionMiddleware middleware);
    public AgentBuilder<T> middlewares(AgentExecutionMiddleware... middlewares);

    // Structured Output（注意类型参数会发生变化）
    public <U> AgentBuilder<U> structuredOutput(Class<U> outputClass); // + 可指定 maxRetries 的重载
    public <U> AgentBuilder<U> structuredOutput(Map<String, Object> schemaMap); // + 可指定 targetClass、maxRetries 的重载
    public <U> AgentBuilder<U> structuredOutputSchema(String jsonSchema); // + 可指定 targetClass、maxRetries 的重载

    // 执行控制
    public AgentBuilder<T> maxIterations(int maxIterations); // 未设置时的默认值：20
    public AgentBuilder<T> timeoutMs(long timeoutMs); // 未设置时无超时限制
    public AgentBuilder<T> autoCompaction(Double triggerRatio); // 大于0且不超过1。会话历史自动压缩的触发比例
    public AgentBuilder<T> contextWindow(Long contextWindow); // 用于计算自动压缩阈值的令牌数

    public Agent<T> build();
}
```

- **`structuredOutput`/`structuredOutputSchema` 会返回类型参数 `T` 已变更的新构建器。** 若重新赋值给 `AgentBuilder<T>` 类型的变量将出现类型不匹配，应从一开始就显式指定类型（如 `Agent.<输出类型>builder()`），或用新变量接收（如 `final AgentBuilder<输出类型> typedBuilder = builder.structuredOutput(...)`）
- 工具分为 4 个系列（`userDefinedTool`/`builtinTool`/`logicFlowTool`/`mcpTool`）。应用开发中基本上只需实现 `userDefinedTool`（详见 `reference/tool-knowledge-skill-api-reference.md`）
- **`model(String)` 可以省略。** 内部会将 `AgentBuilder` 所持有的模型名原样传递给 `ChatAction` 的 `ChatOption.model`。若从未调用过 `model(...)`，`ChatOption.model` 将保持为 `null`，并回退到租户驱动配置（`conf/im-copilot-driver-config.xml`）中设置的默认模型。反之，若显式指定了驱动不识别的模型ID，AI 服务会返回 `invalid model ID` 等错误，导致运行时失败
- **AI 服务调用失败时，异常消息有时会被统一归纳为一种通用措辞（例如「OpenAIにてチャット実行に失敗しました」），而不区分具体原因。** 实际的失败原因——模型ID错误、认证错误、速率限制、触发内容审核等——保存在异常的 cause 链深处（例如 `CopilotServiceInvalidResponseException` 等类所携带的 HTTP 响应中），因此排查问题时，除了顶层的 `getMessage()` 之外，还应沿着 `getCause()` 追溯

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
    public List<MessageContent> getContents(); // 多模态时的内容
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
    private Message message;            // 助手消息（LLM 的响应）
    private String finishReason;        // stop / tool_calls / length / error / guardrail_violation
    private List<ToolCall> toolCalls;   // 默认为空列表
    private Map<String, Object> usage;  // inputTokens/outputTokens 等
    private Map<String, Object> metadata;
    private T parsedData;               // 仅在设置了 Structured Output 时非 null（解析后的数据）
    // 另有原始 JSON 输出相关字段（遵循 LangChain include_raw 规范）

    // 通过 Lombok @Data 为所有字段生成 getter/setter
}
```

- 通过 `getMessage().getContent()` 获取响应文本
- 未设置 Structured Output 时 `getParsedData()` 为 `null`
- `getFinishReason()` 通过字符串比较判断（如 `"stop".equals(...)`）。提供了 `AgentResponse.FinishReason.STOP`/`TOOL_CALLS` 等常量（记载于 javadoc，详情请参照实际类定义）

## `Session`/`SessionContext`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public interface Session {
    SessionContext getContext();
    void clear(); // 清除消息历史・记忆
    String getSessionId(); // 未持久化时为 null
}
```

`SessionContext` 是保存消息历史的上下文。可通过 `session.getContext().addMessage(message)` 手动向历史中添加消息（`AgentTrialRunAssistant` 恢复过往聊天历史时所使用的模式）。通常的应用代码只需调用 `agent.run(session, ...)` 即可，添加历史的工作由 `Agent` 自动完成。

## `Instruction`

```java
package jp.co.intra_mart.foundation.copilot.agent.instruction;

public interface Instruction {
    String getText() throws InstructionException;
    String getText(InstructionContext context) throws InstructionException;
}
```

主要实现（位于 `jp.co.intra_mart.system.copilot.agent.instruction` 包）：
- `SimpleInstruction(String text)` — 固定文本
- `TemplateInstruction(String template)` — 支持 `${var}` 形式的变量展开。通过 `InstructionContext`（实现：`StandardInstructionContext`）的 `setVariable(name, value)` 设置值，再调用 `getText(context)` 进行展开

**框架会自动将工具信息注入系统提示词。** `instruction` 中只需记述业务逻辑（智能体的角色・响应风格），无需编写「请使用工具」之类的指示（会自动生成）。

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

通过 `RunContext.builder().inputParameters(Map)` 或 `.putInputParameter(name, value)`，可传递用于 `Instruction`（`TemplateInstruction`）的 `${...}` 展开的输入参数。作为 `run(message, runContext)` / `run(session, message, runContext)` 的参数使用。

## `ModelConfig`/`AgentConfig`

```java
package jp.co.intra_mart.foundation.copilot.agent;

public class ModelConfig implements java.io.Serializable {
    private Double temperature;      // 未设置时：模型默认值
    private Integer maxTokens;
    private String reasoningEffort;  // 可指定的值因模型而异
    private List<String> stops;
    private String verbosity;        // low/medium/high。仅 OpenAI/AzureOpenAI 支持

    public static ModelConfig.ModelConfigBuilder builder();
    // 通过 Lombok @Data 为所有字段生成 getter/setter
}
```

`AgentConfig` 是通过 `Agent#getConfig()` 获取的、已构建智能体配置的快照（持有 `model`/`modelConfig`/`driver`/`timeoutMs`/`agentDefinitionId`/`agentType`/`additionalParams`/`autoCompactionTriggerRatio`/`contextWindow` 等）。

## 异常

`jp.co.intra_mart.foundation.copilot.agent.exception.AgentException`（受检异常）。`Agent` 接口的所有执行系方法均声明此异常。
