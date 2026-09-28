# IM-Copilot Agent 框架实现模式（Java 版）

使用 `Agent`/`AgentBuilder` 的实现模式集。方法的准确签名请参照 `reference/agent-core-api-reference.md`/`reference/tool-knowledge-skill-api-reference.md`/`reference/assistant-integration-api-reference.md`。

## 模式 1：构建最小配置的智能体并直接调用

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class SimpleAgentService {

    public String ask(final String userMessage) throws AgentException {
        final Agent<?> agent = Agent.builder()
                .model("gpt-4")
                .instruction("あなたは親切なアシスタントです。")
                .build();

        final AgentResponse<?> response = agent.run(userMessage);
        final Message message = response.getMessage();
        return message == null ? "" : message.getContent();
    }
}
```

- `Agent`/`AgentBuilder` 是不依赖 Assistant 框架的 Java 对象，可从 Web API Maker 端点、作业等任意 Java 代码中直接调用
- `run(String)` 为无状态执行。每次调用都会在内部生成临时会话，不会保留会话历史
- `instruction` 中只需记述业务逻辑（角色・响应风格）。由于工具使用指示会被自动注入系统提示词，因此无需编写

## 模式 2：有状态会话（保留历史）

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Session;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class StatefulAgentService {

    public String converse(final Agent<?> agent, final Session session, final String userMessage) throws AgentException {
        final AgentResponse<?> response = agent.run(session, userMessage);
        return response.getMessage() == null ? "" : response.getMessage().getContent();
    }

    public Session createSession(final Agent<?> agent) {
        return agent.createSession();
    }
}
```

- 通过 `Agent.createSession()` 创建 `Session`，复用同一实例即可使会话历史在 `SessionContext` 中累积
- 若每次调用都重新创建 `Session`，则行为与模式 1 的无状态执行相同（不保留历史）

## 模式 3：自定义工具（`UserDefinedTool`）

```java
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties;

public class WeatherLookupInput {

    @SchemaProperties.StringProperty(description = "天気を調べたい都市名（例: 東京）", required = true)
    private String city;

    public String getCity() {
        return city;
    }

    public void setCity(final String city) {
        this.city = city;
    }
}
```

```java
import java.util.List;
import java.util.Map;

import jp.co.intra_mart.foundation.copilot.agent.exception.ToolExecutionException;
import jp.co.intra_mart.foundation.copilot.agent.tool.AbstractToolDefinition;
import jp.co.intra_mart.foundation.copilot.agent.tool.PropertyDefinition;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolDefinition;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolExecutionContext;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolResult;
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolType;
import jp.co.intra_mart.foundation.copilot.agent.tool.UserDefinedTool;
import jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator;

public class WeatherLookupTool implements UserDefinedTool<WeatherLookupInput, String> {

    @Override
    public ToolResult<String> execute(final WeatherLookupInput input, final ToolExecutionContext context) throws ToolExecutionException {
        if (input == null || input.getCity() == null || input.getCity().trim().isEmpty()) {
            throw new ToolExecutionException("city is required");
        }
        final String weather = input.getCity() + "の天気: 晴れ、気温 22℃";
        return ToolResult.<String>builder().content(weather).build();
    }

    @Override
    public ToolDefinition getDefinition() {
        return EnabledToolDefinition.of(
                "weather_lookup",
                "指定した都市の現在の天気を取得する。",
                JsonSchemaGenerator.generateSchema(WeatherLookupInput.class),
                WeatherLookupInput.class,
                String.class,
                ToolType.USER_DEFINED);
    }

    @Override
    public ToolType getToolType() {
        return ToolType.USER_DEFINED;
    }

    @Override
    public List<PropertyDefinition> getPropertyDefinitions() {
        return java.util.Collections.emptyList();
    }

    /**
     * 由于 {@link AbstractToolDefinition} 未实现 isEnabled()，此处准备一个始终返回 true 的薄子类。
     */
    private static final class EnabledToolDefinition extends AbstractToolDefinition {

        private static final long serialVersionUID = 1L;

        private EnabledToolDefinition(final String name, final String description,
                final Map<String, Object> parametersSchema, final Class<?> inputType,
                final Class<?> outputType, final ToolType toolType) {
            super(name, description, parametersSchema, inputType, outputType, toolType);
        }

        static ToolDefinition of(final String name, final String description,
                final Map<String, Object> parametersSchema, final Class<?> inputType,
                final Class<?> outputType, final ToolType toolType) {
            return new EnabledToolDefinition(name, description, parametersSchema, inputType, outputType, toolType);
        }

        @Override
        public boolean isEnabled() {
            return true;
        }
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .instruction("あなたは天気案内アシスタントです。")
        .userDefinedTool(new WeatherLookupTool())
        .build();
```

- 输入参数 DTO 的字段上标注 `SchemaProperties`（与 `java-im-mcp-generator` 的 MCP 工具共用的注解）
- 通过 `JsonSchemaGenerator.generateSchema(DTO类.class)` 自动生成 JSON Schema，传给 `ToolDefinition.getParametersSchema()`
- 若需不经过 LLM 直接调用工具本体（如单元测试），只需传入 `ToolExecutionContext` 的最小实现（仅 `getToolCallId`/`getMetadata`/`setMetadata`）即可

## 模式 4：Structured Output（类型化输出）

```java
import jp.co.intra_mart.foundation.copilot.agent.structured.Property;

public class WeatherReport {

    @Property(description = "都市名", required = true)
    private String city;

    @Property(description = "天気の概況（晴れ・雨等）", required = true)
    private String condition;

    @Property(description = "気温（摂氏）", required = true)
    private int temperatureCelsius;

    // getter/setter 省略
}
```

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;

final Agent<WeatherReport> agent = Agent.<WeatherReport>builder()
        .model("gpt-4")
        .instruction("東京の天気を報告してください。")
        .structuredOutput(WeatherReport.class)
        .build();

final AgentResponse<WeatherReport> response = agent.run("東京の天気を教えて");
final WeatherReport report = response.getParsedData();
```

- 像 `Agent.<输出类型>builder()` 这样先显式指定类型参数，再调用 `structuredOutput(...)`，可使后续方法链的类型保持一致
- 执行结果通过 `AgentResponse.getParsedData()` 获取

## 模式 5：介入执行流程（Middleware）

```java
import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.copilot.agent.middleware.InvocationContext;
import jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware;

public class LoggingObservabilityMiddleware extends ObservabilityMiddleware {

    private static final Logger LOGGER = Logger.getLogger(LoggingObservabilityMiddleware.class);

    @Override
    protected Object before(final InvocationContext ctx) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("phase started: {}", ctx.getPhase());
        }
        return System.currentTimeMillis();
    }

    @Override
    protected void after(final InvocationContext ctx, final Object scope, final Object result) {
        if (LOGGER.isDebugEnabled()) {
            final long elapsedMs = System.currentTimeMillis() - (Long) scope;
            LOGGER.debug("phase completed: {} ({} ms)", ctx.getPhase(), elapsedMs);
        }
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .middleware(new LoggingObservabilityMiddleware())
        .build();
```

- 仅进行日志・监控时，应继承 `ObservabilityMiddleware`（`before`/`after`/`onError` 的异常会被自动吞掉，不影响主体执行，即 fail-open）
- 若需在输入校验・护栏等场景下中止处理本身，应直接实现 `AgentExecutionMiddleware`，在 `intercept(ctx, chain)` 内不调用 `chain.proceed(ctx)` 而返回自定义结果，或让异常原样传播（fail-closed）

## 模式 6：引用已注册的知识库

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.Knowledge;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.KnowledgeSearchParams;
import jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge;

final Knowledge knowledge = new RegisteredKnowledge("knowledge-00123", KnowledgeSearchParams.defaults());

final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .instruction("提供された情報を基に回答してください。")
        .knowledge(knowledge)
        .build();
```

- `RegisteredKnowledge` 通过 ID 引用知识管理（Agent Designer 等）中已注册的知识。知识名称・描述会在每次引用时从知识管理中解析
- 注册后，框架会在执行时自动生成检索工具，当 LLM 判断需要时便会通过工具进行检索（无需在 `instruction` 中记述检索方法）
- 若引用对象不存在，生成时不会抛出异常，仅在实际执行检索时才会抛出异常

## 模式 7：引用 Markdown 技能

```java
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.skill.SkillEntry;
import jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService;

final List<String> skillIds = Arrays.asList("expense-report-guideline");
final Map<String, SkillEntry> entries = new SkillCatalogService().entriesForRegistry(skillIds);

final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .skills(entries.values())
        .build();
```

- 技能以 Markdown 文件形式管理，存放于 `PublicStorage` 的 `im_copilot/agent/skills/<skillId>/SKILL.md`
- `entriesForRegistry` 对不存在的 ID 不会抛出异常，只是将其从结果中排除（可通过返回的 `Map` 的大小确认解析成功的件数）
- 技能是记述工具使用方法・判断标准・步骤的知识资产，具体操作的执行由工具（模式 3）承担

## 模式 8：与 IM-Copilot 聊天界面对接（Assistant 框架）

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;
import jp.co.intra_mart.foundation.copilot.assistant.AbstractCopilotAssistant;
import jp.co.intra_mart.foundation.copilot.assistant.AssistantType;
import jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant;
import jp.co.intra_mart.foundation.copilot.assistant.exception.CopilotAssistantException;
import jp.co.intra_mart.foundation.copilot.assistant.message.AssistantMessage;
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantResult;

@Assistant(id = "weather_assistant", name = "Weather Assistant",
        type = AssistantType.STANDARD, listEnable = true, storeMessage = false)
public class WeatherAssistant extends AbstractCopilotAssistant<WeatherAssistantParameter> {

    @Override
    protected AssistantResult doExecute(final WeatherAssistantParameter parameter) throws CopilotAssistantException {
        if (!parameter.validate()) {
            throw new CopilotAssistantException("message is required");
        }

        try {
            final Agent<?> agent = Agent.builder()
                    .model("gpt-4")
                    .instruction("あなたは天気案内アシスタントです。")
                    .userDefinedTool(new WeatherLookupTool())
                    .build();

            final String userMessage = String.valueOf(parameter.getMessage().getContents());
            final AgentResponse<?> response = agent.run(userMessage);
            final Message assistantMessage = response.getMessage();
            final String content = assistantMessage == null ? "" : assistantMessage.getContent();

            return AssistantResult.builder()
                    .message(new AssistantMessage("assistant", content))
                    .finishReason(response.getFinishReason())
                    .build();
        } catch (final AgentException e) {
            throw new CopilotAssistantException("Agent execution failed: " + e.getMessage(), e);
        }
    }
}
```

```java
import jp.co.intra_mart.foundation.copilot.assistant.model.AssistantParameter;

public class WeatherAssistantParameter extends AssistantParameter {

    public boolean validate() {
        return getMessage() != null
                && getMessage().getContents() != null
                && !String.valueOf(getMessage().getContents()).trim().isEmpty();
    }
}
```

- 标注了 `@Assistant` 的 `AbstractCopilotAssistant<T>` 子类，是来自 IM-Copilot 聊天界面调用的入口点
- 只需在 `doExecute` 内调用 `Agent.builder()...build()` 并执行 `run(...)` 即可。若智能体无需加载由 Agent Designer 管理的动态智能体定义（JSON），即代码侧固定组装的智能体，实现到这种程度即已足够
- **参数类 `T` 必须是 `AssistantParameter` 本身，或其子类。** 若使用仅含自定义字段的不兼容 POJO，`AssistantParameterParser.get(parameter)`（在 `preprocessing()` 内部首先被调用）将无法找到匹配的解析器，同时聊天界面也无法根据参数类的模式组装发送消息的输入框，导致用户无法输入提示词。用户发言应通过继承而来的 `getMessage().getContents()` 获取（若无需额外参数，可直接使用 `AssistantParameter` 本身，无需添加字段）。若需要额外参数（如 `dbSource`），应继承 `AssistantParameter` 并仅添加标注了 `@Property` 的字段，不要重新定义 `message`/`threadId`
- 更高级的对接（流式响应・利用 `getMessageHistory()`）请参照 `reference/assistant-integration-api-reference.md`

## 模式 9：Assistant 的平台注册（与模式 8 成对，为必需项）

**仅添加 `@Assistant` 并不会被平台识别，也不会出现在助手一览中。** 以下两者均为必需。

### 步骤 1：实现・注册 `AssistantScanPackageFactory`

为了将包含 `@Assistant` 类的包纳入扫描对象，需实现 `AssistantScanPackageFactory` 并通过 `ServiceLoader` 注册。

```java
package jp.co.intra_mart.sample.copilotagent;

import java.util.Collection;
import java.util.Collections;

import jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory;

public class WeatherAssistantScanPackageFactory implements AssistantScanPackageFactory {

    @Override
    public Collection<String> getTargetPackages() {
        return Collections.singletonList("jp.co.intra_mart.sample.copilotagent");
    }
}
```

创建名为 `src/main/resources/META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory` 的文件，其中写入实现类的完全限定名（一行）。

```
jp.co.intra_mart.sample.copilotagent.WeatherAssistantScanPackageFactory
```

### 步骤 2：在 IM-Authz 中授予权限

`@Assistant` 类的扫描结果会在服务器启动时**自动导入**为 IM-Authz 的授权资源（资源 URI：`im-copilot-assistant://assistant/<助手ID>`，资源类型：`im-copilot-assistant`，操作：`execute`）。**但该资源的许可策略（允许谁执行）不会被自动授予。** 需要在 IM-Authz 管理界面（或 `java-im-authz-usage` 技能所涉及的 `PolicyManager` 等）中，为目标用户・角色明确设置许可策略。若缺少该设置，即使助手本身已被正确扫描，也会在一览获取 API（`getMetadatas(true)`）的权限检查中被排除，不会显示在界面上。

- 仅完成步骤 1 不会出现在一览中（会被授权检查拦截）
- 仅完成步骤 2 没有对象可授权（未被扫描，资源本不存在）
- **两者都完成后，助手才会出现在助手一览中**

## 注意事项

- **`Agent`/`AgentBuilder` 是不依赖 Assistant 框架的独立 Java API。** 若无需与 IM-Copilot 聊天界面对接，无需使用模式 8（Assistant），可直接从 Web API Maker 端点或作业调用模式 1〜7
- **`AbstractToolDefinition` 未实现 `isEnabled()`。** 在 `UserDefinedTool.getDefinition()` 的实现中，应准备一个实现了 `isEnabled()` 的薄子类
- **`structuredOutput(...)` 会返回类型参数已变更的新构建器。** 应从一开始就显式指定类型，如 `Agent.<输出类型>builder()`
- **`ObservabilityMiddleware`（观测系・fail-open）与直接实现 `AgentExecutionMiddleware`（控制系・fail-closed）用途不同。** 不要用 `ObservabilityMiddleware` 编写可能需要中止处理的实现（异常会被吞掉，无法按预期中止）
- **仅添加 `@Assistant` 不会出现在助手一览中。** 务必完成模式 9（注册 `AssistantScanPackageFactory` + 授予 IM-Authz 权限）。仅完成其中一项不会出现在一览中
- **`AbstractCopilotAssistant<T>` 的 `T` 必须是 `AssistantParameter` 本身，或其子类。** 使用不兼容的 POJO 会导致参数解析器无法解析参数类型，同时聊天界面也无法为发送消息组装输入框，导致用户无法输入提示词（助手仍会出现在一览中，但选中后无法使用）。详见模式 8
- Knowledge 的内容源接入・向量化・检索的内部实现，以及 MCP 工具的 OAuth 集成部分，均为平台内部实现，并非应用开发者需要直接实现的对象
- **`AgentBuilder<T>` 无法被继承**（构造函数为包私有）。若需按条件切换设置，应将构建器保存到 `AgentBuilder<?>` 类型的变量中，按条件继续调用方法后再执行 `build()`
  ```java
  final AgentBuilder<?> builder = Agent.builder().instruction("你是一个天气助手。");
  if (withTool) {
      builder.userDefinedTool(new WeatherLookupTool());
  }
  final Agent<?> agent = builder.build();
  ```
- **`model(String)` 可以省略。** 省略时 `ChatOption.model` 将保持为 `null`，并回退到租户驱动配置中设置的默认模型。若显式指定了不存在的模型ID，会在运行时出现 `invalid model ID` 等错误而失败
- **AI 服务调用失败时，异常消息有时会被统一归纳为一种通用措辞，而不区分具体原因。** 实际的失败原因（HTTP 响应等）保存在异常的 cause 链深处，因此排查问题时应沿着 `getCause()` 追溯（详见 `reference/agent-core-api-reference.md`）
