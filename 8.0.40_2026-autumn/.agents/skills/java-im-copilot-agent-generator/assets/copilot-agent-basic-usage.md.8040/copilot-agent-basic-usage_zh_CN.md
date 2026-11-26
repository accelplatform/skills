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
                .instruction("你是一个热心的助手。")
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

    @SchemaProperties.StringProperty(description = "要查询天气的城市名（例: 东京）", required = true)
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
import jp.co.intra_mart.foundation.copilot.exception.CopilotServiceException;

public class WeatherLookupTool implements UserDefinedTool<WeatherLookupInput, String> {

    @Override
    public ToolResult<String> execute(final WeatherLookupInput input, final ToolExecutionContext context) throws ToolExecutionException {
        if (input == null || input.getCity() == null || input.getCity().trim().isEmpty()) {
            throw new ToolExecutionException("city is required");
        }
        final String weather = input.getCity() + "的天气: 晴，气温 22℃";
        return ToolResult.<String>builder().content(weather).build();
    }

    @Override
    public ToolDefinition getDefinition() {
        return EnabledToolDefinition.of(
                "weather_lookup",
                "获取指定城市的当前天气。",
                createParametersSchema(),
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
     * 根据输入参数 DTO 的 SchemaProperties 注解生成 JSON Schema。
     */
    private static Map<String, Object> createParametersSchema() {
        try {
            return jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder()
                    .parametersFromClass(WeatherLookupInput.class)
                    .build()
                    .getParameters();
        } catch (final CopilotServiceException e) {
            throw new IllegalStateException("Failed to generate the parameters schema of weather_lookup.", e);
        }
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
        .instruction("你是一个天气助手。")
        .userDefinedTool(new WeatherLookupTool())
        .build();
```

- 输入参数 DTO 的字段上标注 `SchemaProperties`（与 `java-im-mcp-generator` 的 MCP 工具共用的注解）
- 使用公开 API `jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder().parametersFromClass(DTO类.class).build().getParameters()` 生成 JSON Schema，传给 `ToolDefinition.getParametersSchema()`（`jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator` 是内部类，不要使用）
- **只要在 DTO 上标注了一个 `SchemaProperties` 注解，就要为所有字段都标注。** 未标注注解的字段即使 LLM 传入了值也会被丢弃，并且不会报错（也不会使用 setter。详情见 `reference/tool-knowledge-skill-api-reference.md`）
- 若需不经过 LLM 直接调用工具本体（如单元测试），只需传入 `ToolExecutionContext` 的最小实现（仅 `getToolCallId`/`getMetadata`/`setMetadata`）即可

## 模式 4：Structured Output（类型化输出）

```java
import jp.co.intra_mart.foundation.copilot.agent.structured.Property;

public class WeatherReport {

    @Property(description = "城市名", required = true)
    private String city;

    @Property(description = "天气概况（晴、雨等）", required = true)
    private String condition;

    @Property(description = "气温（摄氏）", required = true)
    private int temperatureCelsius;

    // getter/setter 省略
}
```

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;

final Agent<WeatherReport> agent = Agent.<WeatherReport>builder()
        .model("gpt-4")
        .instruction("请报告东京的天气。")
        .structuredOutput(WeatherReport.class)
        .build();

final AgentResponse<WeatherReport> response = agent.run("告诉我东京的天气");
final WeatherReport report = response.getParsedData();
```

- 像 `Agent.<输出类型>builder()` 这样先显式指定类型参数，再调用 `structuredOutput(...)`，可使后续方法链的类型保持一致
- 执行结果通过 `AgentResponse.getParsedData()` 获取

## 模式 5：介入执行流程（Middleware）

即使是通过 `Agent.builder()` 构建的智能体，平台也会自动加入执行记录（执行时间、LLM 调用次数等），执行会显示在追踪列表中。不要为记录而编写 middleware。仅在有追踪无法满足的目的（如在自己的画面上显示执行进度）时，才自行编写 middleware。

```java
import java.util.function.Consumer;

import jp.co.intra_mart.common.platform.log.Logger;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;
import jp.co.intra_mart.foundation.copilot.agent.middleware.AgentExecutionMiddleware;
import jp.co.intra_mart.foundation.copilot.agent.middleware.AgentPhase;
import jp.co.intra_mart.foundation.copilot.agent.middleware.Chain;
import jp.co.intra_mart.foundation.copilot.agent.middleware.InvocationContext;

public class ProgressMiddleware implements AgentExecutionMiddleware {

    private static final Logger LOGGER = Logger.getLogger(ProgressMiddleware.class);

    /** 将进度发送到画面的处理（发送目标由应用侧准备） */
    private final Consumer<AgentPhase> listener;

    public ProgressMiddleware(final Consumer<AgentPhase> listener) {
        this.listener = listener;
    }

    @Override
    public Object intercept(final InvocationContext ctx, final Chain chain) throws AgentException {
        notifyProgress(ctx.getPhase());
        // 原样返回主体的结果・异常
        return chain.proceed(ctx);
    }

    // 不因通知失败而使主体执行失败（fail-open）
    private void notifyProgress(final AgentPhase phase) {
        try {
            listener.accept(phase);
        } catch (final RuntimeException e) {
            LOGGER.warn("Failed to notify progress: " + phase, e);
        }
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .middleware(new ProgressMiddleware(phase -> {
            // 例：若为 TOOL_CALL，则向画面发送「正在执行工具」
        }))
        .build();
```

- 通知进度的观测系应原样返回 `chain.proceed(ctx)` 的结果・异常。通知处理抛出异常会导致主体执行也失败，因此应自行捕获通知处理的异常（fail-open）
- 若需在输入校验・护栏等场景下中止处理本身，应在 `intercept(ctx, chain)` 内不调用 `chain.proceed(ctx)` 而返回自定义结果，或让异常原样传播（fail-closed）
- `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware` 是非公开 API，不要继承

## 模式 6：引用已注册的知识库

```java
import java.util.List;

import jp.co.intra_mart.foundation.copilot.agent.exception.KnowledgeException;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.Knowledge;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.KnowledgeEntry;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.exception.CopilotKnowledgeException;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.KnowledgeInfo;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.KnowledgeSearchParams;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.model.MetadataFilterGroups;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.repository.KnowledgeSearchRepositoryFactory;
import jp.co.intra_mart.foundation.copilot.agent.knowledge.service.KnowledgeServiceFactory;

/**
 * 通过 ID 引用知识管理中已注册知识的 {@link Knowledge}。
 */
public class ManagedKnowledge implements Knowledge {

    private final String knowledgeId;

    private final KnowledgeSearchParams searchParams;

    public ManagedKnowledge(final String knowledgeId, final KnowledgeSearchParams searchParams) {
        this.knowledgeId = knowledgeId;
        this.searchParams = searchParams == null ? KnowledgeSearchParams.defaults() : searchParams;
    }

    @Override
    public String getId() {
        return knowledgeId;
    }

    @Override
    public String getName() {
        final KnowledgeInfo info = findKnowledgeInfo();
        return info == null || isBlank(info.getKnowledgeName()) ? knowledgeId : info.getKnowledgeName();
    }

    @Override
    public String getDescription() {
        final KnowledgeInfo info = findKnowledgeInfo();
        return info == null || isBlank(info.getDescription()) ? Knowledge.super.getDescription() : info.getDescription();
    }

    @Override
    public KnowledgeSearchParams getSearchParams() {
        return searchParams;
    }

    @Override
    public List<KnowledgeEntry> retrieve(final String query, final int topK, final MetadataFilterGroups metadataFilter)
            throws KnowledgeException {
        final KnowledgeSearchParams params = topK == searchParams.getTopK()
                ? searchParams
                : new KnowledgeSearchParams(topK, searchParams.getSimilarityThreshold(), searchParams.getMetadataFilter());
        try {
            final KnowledgeInfo info = KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(knowledgeId);
            if (info == null) {
                throw new KnowledgeException("找不到知识库。knowledgeId=" + knowledgeId);
            }
            // 使用知识库所设置的嵌入模型进行检索
            return KnowledgeSearchRepositoryFactory.getInstance().getKnowledgeSearchRepository()
                    .search(knowledgeId, info.getAiModelId(), query, params, metadataFilter);
        } catch (final CopilotKnowledgeException e) {
            throw new KnowledgeException("知识库检索失败。knowledgeId=" + knowledgeId + " 原因: " + e.getMessage(), e);
        }
    }

    private KnowledgeInfo findKnowledgeInfo() {
        try {
            return KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(knowledgeId);
        } catch (final CopilotKnowledgeException e) {
            return null;
        }
    }

    private static boolean isBlank(final String value) {
        return value == null || value.trim().isEmpty();
    }
}
```

```java
final Agent<?> agent = Agent.builder()
        .model("gpt-4")
        .instruction("请根据提供的信息回答。")
        .knowledge(new ManagedKnowledge("knowledge-00123", KnowledgeSearchParams.defaults()))
        .build();
```

- 通过 ID 引用知识管理（Agent Designer 等）中已注册的知识。知识名称・描述会在每次引用时从知识管理中获取（`KnowledgeInfo.getKnowledgeName()`/`getDescription()`）
- 检索使用 `KnowledgeSearchRepository.search(知识ID, 嵌入模型ID, 检索字符串, 检索参数, 元数据筛选)`。嵌入模型 ID 传入知识库所设置的 `KnowledgeInfo.getAiModelId()`
- 注册后，框架会在执行时自动生成检索工具，当 LLM 判断需要时便会通过工具进行检索（无需在 `instruction` 中记述检索方法）
- 若引用对象不存在，生成时不会抛出异常，仅在实际执行检索时才会抛出异常
- `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge` 是非公开 API，不要使用

## 模式 7：让智能体使用已注册的技能

没有从 Java 获取技能管理中已注册技能的公开 API。要让智能体使用技能时，在 Accel Agent 的智能体管理画面中为智能体设置技能，再按模式 11 的方法读取并运行该智能体。读取的智能体会在运行时读取并使用技能正文。

- `jp.co.intra_mart.foundation.copilot.agent.skill.endpoint.SkillEndpointFactory` 用于 Web API Maker 的 REST 端点，未作为 Java 使用的 API 公开，因此不要使用。`jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` 是非公开 API，也不要使用
- 即使自行实现 `SkillEntry`，读取技能的工具也会按技能 ID 直接从存储中读取正文，因此未注册的技能无法使用
- 技能是记述工具的使用方法・判断标准・步骤的知识资产，具体操作由工具（模式 3）执行

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
            throw new CopilotAssistantException("text message is required");
        }

        try {
            final Agent<?> agent = Agent.builder()
                    .model("gpt-4")
                    .instruction("你是一个天气助手。")
                    .userDefinedTool(new WeatherLookupTool())
                    .build();

            // validate() 已确认其为字符串
            final String userMessage = (String) parameter.getMessage().getContents();
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
        if (getMessage() == null || !(getMessage().getContents() instanceof String)) {
            return false;
        }
        return !((String) getMessage().getContents()).trim().isEmpty();
    }
}
```

- 标注了 `@Assistant` 的 `AbstractCopilotAssistant<T>` 子类，是来自 IM-Copilot 聊天界面调用的入口点
- `getMessage().getContents()` 为 `Object` 类型，可能包含字符串以外的内容（`ToolContent` 的 Collection 等）。若用 `String.valueOf(...)` 转为字符串，在 Collection 的情况下会将 `[...]` 这样的字符串原样传给 AI，因此应先确认其为字符串再取出
- 只需在 `doExecute` 内调用 `Agent.builder()...build()` 并执行 `run(...)` 即可。若是代码侧固定组装的智能体，实现到这种程度即已足够。要运行在画面中定义的智能体时，请用模式 11 的方法读取 `Agent`，代替 `Agent.builder()`
- **参数类 `T` 必须是 `AssistantParameter` 本身，或其子类。** 若使用仅含自定义字段的不兼容 POJO，`AssistantParameterParser.get(parameter)`（在 `preprocessing()` 内部首先被调用）将无法找到匹配的解析器，同时聊天界面也无法根据参数类的模式组装发送消息的输入框，导致用户无法输入提示词。用户发言应通过继承而来的 `getMessage().getContents()` 获取（若无需额外参数，可直接使用 `AssistantParameter` 本身，无需添加字段）。若需要额外参数（如 `dbSource`），应继承 `AssistantParameter` 并仅添加标注了 `@Property` 的字段，不要重新定义 `message`/`threadId`
- 更高级的对接（流式响应・利用 `getMessageHistory()`）请参照 `reference/assistant-integration-api-reference.md`

## 模式 9：Assistant 的平台注册（与模式 8 成对，为必需项）

**`@Assistant` 类通过构建时自动生成的索引被识别，但要显示在助手一览中，需要 IM-Authz 的许可策略。**

### 步骤 1：确认索引

`@Assistant` 类的完全限定名会记载在构建时由注解处理器自动生成的索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`）中，平台从该索引读取 `@Assistant` 类。无需实现 `AssistantScanPackageFactory`，也无需在 `META-INF/services` 中注册。构建后，确认 `target/classes`（或 jar）中存在该文件，并且如下记载了 `@Assistant` 类的完全限定名。

```
jp.co.intra_mart.sample.copilotagent.WeatherAssistant
```

### 步骤 2：在 IM-Authz 中授予权限

通过索引识别的 `@Assistant` 类会在服务器启动时**自动导入**为 IM-Authz 的授权资源（资源 URI：`im-copilot-assistant://assistant/<助手ID>`，资源类型：`im-copilot-assistant`，操作：`execute`）。**但该资源的许可策略（允许谁执行）不会被自动授予。** 需要在 IM-Authz 管理界面（或 `java-im-authz-usage` 技能所涉及的 `PolicyManager` 等）中，为目标用户・角色明确设置许可策略。若缺少该设置，即使助手本身已被正确识别，也会在一览获取 API（`getMetadatas(true)`）的权限检查中被排除，不会显示在界面上。

- 没有许可策略时，即使已通过索引识别，也不会出现在一览中（会被授权检查拦截）

## 模式 10：将自定义工具注册为内置工具（可在管理画面中选择）

在模式 3 的工具类上标注 `@Tool`（`jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`，与 MCP 的 `@Tool` 不同）后，该工具会被注册为内置工具，并按类别显示在 Accel Agent 工具管理画面的内置标签页中，并可在智能体编辑画面中选择。工具没有以工具为单位的授权，与模式 9 的 Assistant 不同，没有 IM-Authz 的设置。

- 由于工具没有授权，只要能执行持有该工具的智能体，任何人都可以通过 LLM 让工具运行
- 工具在执行智能体的用户的访问上下文（登录用户）中运行。工具的处理应使用确认登录用户权限的 API 来实现。产品的内置工具（工作流等）也是使用确认登录用户权限的 API 实现的
- 不要采用绕过权限确认的实现（如直接用 SQL 读写数据等）

```java
import jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool;

@Tool(name = "weather_lookup", title = "天气查询", summary = "获取指定城市的当前天气。",
        description = "获取指定城市的当前天气。", category = WeatherToolCategory.class)
public class WeatherLookupTool implements UserDefinedTool<WeatherLookupInput, String> {
    // 实现与模式 3 相同
}
```

```java
import jp.co.intra_mart.foundation.copilot.agent.tool.ToolCategory;

public class WeatherToolCategory implements ToolCategory {

    @Override
    public String getCategoryId() {
        return "example_weather";
    }

    @Override
    public String getCategoryName() {
        return "天气";
    }

    @Override
    public int getSortOrder() {
        return 100;
    }
}
```

无需实现 `BuiltinToolScanPackageFactory`，也无需在 `META-INF/services` 中注册。标注了 `@Tool` 的类的完全限定名会记载在构建时由注解处理器自动生成的索引（`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`）中，平台从该索引读取内置工具。构建后，确认 `target/classes`（或 jar）中存在该文件，并且如下记载了 `@Tool` 类的完全限定名。

```
jp.co.example.foo.agent.tool.WeatherLookupTool
```

- `@Tool` 的 `name`・`description`・`category` 为必需项。`name` 和类别的 `getCategoryId()` 必须匹配 `^[A-Za-z0-9_-]+$` 且不超过 64 个字符（否则会输出警告且不会被注册）
- 标注了 `@Tool` 的类必须实现 `BuiltinTool`（`UserDefinedTool` 继承自 `BuiltinTool`，因此可以直接使用）。工具类和类别类要声明为 public，并具有 public 的无参构造函数
- `title`、`summary`、类别名以及输入参数的 `summary`，指定消息键时按区域设置显示对应的消息（不是消息键时按原样显示所写的字符串）
- 管理画面的输入参数表由输入类型的字段及其 `SchemaProperties` 注解（`summary`・`required`）生成。不会使用 `getDefinition()` 的 `parametersSchema`，未标注注解的字段不会显示在表中（详情见 `reference/tool-knowledge-skill-api-reference.md`「内置工具的注册」）
- 要在管理画面的表中显示说明，还需在输入参数 DTO 的各字段上指定 `summary`（例：`@SchemaProperties.StringProperty(description = "要查询天气的城市名（例: 东京）", summary = "城市名", required = true)`）。`description` 面向 LLM，不用于该表
- 传给 LLM 的工具名・说明是 `getDefinition()` 的值，不会使用 `@Tool` 的 `name`・`description`。`@Tool` 的 `name` 是内置工具的标识符，因此请与 `getDefinition().getName()` 设为相同的值
- 使用消息键时，请在消息属性中定义键（忘记定义时会直接显示键字符串）。放置位置・写法请参见 `java-im-message-usage`
- 用代码构建代理时，可以与模式 3 一样通过 `userDefinedTool(...)` 传入（通过 `builtinTool(...)` 传入也会被同样处理）

## 模式 11：读取并运行在画面中定义的智能体

在 Accel Agent 的智能体管理画面中定义的智能体，可通过 `AgentManagementService`（`jp.co.intra_mart.foundation.copilot.agent.definition`）作为 `Agent` 读取，并与代码中组装的智能体一样通过 `run(...)` 运行。除 Assistant（模式 8）的 `doExecute` 外，也可用同样的写法从 Web API Maker 端点或作业中调用。

```java
package jp.co.intra_mart.sample.copilotagent;

import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.definition.AgentManagementService;
import jp.co.intra_mart.foundation.copilot.agent.definition.AgentManagementServiceFactory;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class DefinedAgentRunner {

    public String run(final String agentId, final String prompt) throws AgentException {
        final AgentManagementService service = AgentManagementServiceFactory.getInstance().getService();

        // 确定公开中的最新版本（没有公开中的版本时抛出 AgentVersionNotPublishedException）
        final int version = service.resolvePublishedVersion(agentId, null);
        final Agent<?> agent = service.getAgent(agentId, version);

        final AgentResponse<?> response = agent.run(prompt);
        final Message message = response.getMessage();
        return message == null ? "" : message.getContent();
    }
}
```

- `resolvePublishedVersion(agentId, null)` 返回公开中版本里最新版本的编号。没有公开中的版本时，抛出 `AgentVersionNotPublishedException`（`AgentDefinitionPersistenceException` 的子类，继承 `AgentException`）
- 读取的 `Agent` 按该版本在画面中的定义（模型・指令等）运行
- **正式调用中不要使用不指定版本的 `getAgent(agentId)`。** 它不论公开状态都会读取最新版本。新版本以停止状态创建，因此画面中正在编辑（未公开）的版本会直接运行
- `AgentManagementService` 不确认是否允许执行智能体（不进行授权）。是否允许执行，需通过调用方画面・API 的授权确认

画面定义中持有输入参数的智能体，需通过 `RunContext.builder().inputParameters(...)` 生成值，并通过 `run(Message, RunContext)` 传入。指令中的 `${...}` 会被运行时 `RunContext` 的输入参数替换。不传入时，`${...}` 会未经替换直接传给 LLM。对象类型的输入参数，可像 `${user.name}` 这样引用其中的值。

```java
final Map<String, Object> inputParameters = new HashMap<>();
inputParameters.put("topic", "交通费");                                   // 指令中的 ${topic}
inputParameters.put("user", Collections.singletonMap("name", "山田"));    // 指令中的 ${user.name}
final RunContext runContext = RunContext.builder().inputParameters(inputParameters).build();

final AgentResponse<?> response = agent.run(Message.user(prompt), runContext);
```

## 注意事项

- **`Agent`/`AgentBuilder` 是不依赖 Assistant 框架的独立 Java API。** 若无需与 IM-Copilot 聊天界面对接，无需使用模式 8（Assistant），可直接从 Web API Maker 端点或作业调用模式 1〜7
- **`AbstractToolDefinition` 未实现 `isEnabled()`。** 在 `UserDefinedTool.getDefinition()` 的实现中，应准备一个实现了 `isEnabled()` 的薄子类
- **`structuredOutput(...)` 会返回类型参数已变更的新构建器。** 应从一开始就显式指定类型，如 `Agent.<输出类型>builder()`
- **观测系（fail-open）与控制系（fail-closed）的 Middleware 应分开实现。** 不要把需要中止处理的检查写在捕获观测处理异常的 `try`/`catch` 中（异常会被捕获，无法按预期中止）
- **仅添加 `@Assistant` 不会出现在助手一览中。** 务必完成模式 9（确认索引 + 授予 IM-Authz 权限）。无需实现 `AssistantScanPackageFactory`
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
