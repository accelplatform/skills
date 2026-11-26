# Tool / Knowledge / Skill / Middleware API 参考手册（Java 版）

基于 `im_copilot_agent`/`im_copilot_base` 模块的实际类定义。不要凭记忆或推测补充方法・属性。

## 工具（`Tool`/`UserDefinedTool`）

类型层次：`UserDefinedTool<I,O> extends BuiltinTool<I,O> extends Tool<I,O>`。应用开发中实现 `UserDefinedTool`。

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface Tool<I, O> {
    ToolResult<O> execute(I input, ToolExecutionContext context) throws ToolExecutionException;
    ToolDefinition getDefinition();
}

public interface BuiltinTool<I, O> extends Tool<I, O> {
    ToolType getToolType();
    List<PropertyDefinition> getPropertyDefinitions();
}

public interface UserDefinedTool<I, O> extends BuiltinTool<I, O> {
    ToolType getToolType(); // 返回 ToolType.USER_DEFINED
}
```

```java
public enum ToolType { BUILTIN, USER_DEFINED, LOGIC_FLOW, MCP }
```

### `ToolDefinition`/`AbstractToolDefinition`

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface ToolDefinition extends java.io.Serializable {
    String getName();
    String getDescription();
    Map<String, Object> getParametersSchema(); // JSON Schema
    Class<?> getInputType();
    Class<?> getOutputType();
    ToolType getToolType();
    boolean isEnabled();
}

public abstract class AbstractToolDefinition implements ToolDefinition {
    protected AbstractToolDefinition(AbstractToolDefinitionBuilder<?, ?> builder);
    public AbstractToolDefinition(); // 无参构造
    public AbstractToolDefinition(String name, String description, Map<String, Object> parametersSchema,
            Class<?> inputType, Class<?> outputType, ToolType toolType);
    // 实现了 getName/getDescription/getParametersSchema/getInputType/getOutputType/getToolType
    // 未实现 isEnabled()（子类必须实现）
}
```

**由于 `AbstractToolDefinition` 未实现 `isEnabled()`，`UserDefinedTool.getDefinition()` 的返回值需要自行准备一个实现了 `isEnabled()` 的薄子类**（若为始终有效的工具，`return true;` 即可）。构造函数应使用 6 参数版本 `(name, description, parametersSchema, inputType, outputType, toolType)`。

### 工具输入参数 DTO 与 `SchemaProperties`

输入类型 `I` 应定义为一个普通 DTO 类，其字段上标注 `jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties` 下的注解（`StringProperty`/`IntegerProperty`/`NumberProperty`/`BooleanProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`）。**此注解与 MCP 工具（`java-im-mcp-generator`）共用，属性详情可参照该技能的 `reference/mcp-annotation-api-reference.md`。**

要从输入类型生成 JSON Schema（`Map<String, Object>`），请使用公开 API `jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition`（`im_copilot_core`）。将其返回值直接传给 `ToolDefinition.getParametersSchema()`。

```java
final Map<String, Object> schema = jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder()
        .parametersFromClass(WeatherLookupInput.class) // 会抛出 CopilotServiceException（受检异常）
        .build()
        .getParameters();
```

- `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator` 是平台内部的类，不要使用。`parametersFromClass(Class)` 在内部调用相同的处理，生成的模式完全相同
- 它与代理侧的 `ToolDefinition`（`jp.co.intra_mart.foundation.copilot.agent.tool`）简单名称相同，因此其中一方要用完全限定名书写

**只要在输入类型上标注了一个 `SchemaProperties` 注解，就要为所有字段都标注。** 代理通过 `ToolJsonHelper.deserialize(json, 输入类型)` 将从 LLM 收到的参数转换为输入类型。对于至少有一个注解的类型，只会通过反射直接为标注了注解的字段设置值（不会使用 setter 以及 `@JsonIgnoreProperties` 等 Jackson 注解）。未标注注解的字段即使 LLM 传入了值也会被丢弃，并且不会报错。

### `ToolExecutionContext`/`ToolResult`

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface ToolExecutionContext {
    String getToolCallId();
    Map<String, Object> getMetadata();
    void setMetadata(String key, Object value);
}

public class ToolResult<O> {
    public static <O> ToolResult.ToolResultBuilder<O> builder();
    public boolean isError();
    public String getMessage();
    public O getContent();
    public Object getStructuredContent();
    public Map<String, Object> get_meta();
    public Throwable getCause();
}
```

`ToolResult.<O>builder().content(value).build()` 是成功时的基本写法。若要表示错误，可组装为 `builder().isError(true).message("...").cause(e).build()`（作为抛出 `ToolExecutionException` 的替代方案，也可以将错误内容表示为 `ToolResult`）。

## 内置工具的注册（`@Tool`）

在工具类上标注 `@Tool`（`jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`，与 MCP 的 `@Tool` 不同）后，该工具会被注册为内置工具，并按类别显示在 Accel Agent 工具管理画面的内置标签页中，并可在智能体编辑画面中选择。工具没有以工具为单位的授权，与 Assistant（`assets/copilot-agent-basic-usage.md` 模式 9）不同，没有 IM-Authz 的设置。实现示例见 `assets/copilot-agent-basic-usage.md` 模式 10。

- 由于工具没有授权，只要能执行持有该工具的智能体，任何人都可以通过 LLM 让工具运行
- 工具在执行智能体的用户的访问上下文（登录用户）中运行。工具的处理应使用确认登录用户权限的 API 来实现。产品的内置工具（工作流等）也是使用确认登录用户权限的 API 实现的
- 不要采用绕过权限确认的实现（如直接用 SQL 读写数据等）

```java
package jp.co.intra_mart.foundation.copilot.agent.tool.annotation;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface Tool {
    String name();
    String title() default "";
    String summary() default "";
    String description();
    Class<? extends ToolCategory> category();
    Class<? extends ToolCategory> subCategory() default ToolCategory.class; // 省略时无子类别
}
```

```java
package jp.co.intra_mart.foundation.copilot.agent.tool;

public interface ToolCategory {
    String getCategoryId();
    String getCategoryName();
    int getSortOrder();
}
```

- 标注了 `@Tool` 的类的完全限定名会记载在构建时自动生成的索引 `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`（文件名即注解的完全限定名）中，平台从该索引读取内置工具。机制与 `@MCPServer` 相同，索引由注解处理器 `jp.co.intra_mart.tools:im_service_annotation_processor` 生成（`im_copilot_base` 已将 `@Tool` 注册为索引对象）
- 无需实现 `BuiltinToolScanPackageFactory`，也无需在 `META-INF/services` 中注册
- 标注了 `@Tool` 的类必须实现 `BuiltinTool`（`UserDefinedTool` 继承自 `BuiltinTool`，因此可以直接使用）。未实现的类会输出警告且不会被注册
- `@Tool` 的 `name` 和类别的 `getCategoryId()` 必须匹配 `^[A-Za-z0-9_-]+$` 且不超过 64 个字符。否则会输出警告且不会被注册
- 工具类和类别类要声明为 public，并具有 public 的无参构造函数（平台通过无参构造函数创建实例）
- `title`、`summary`、类别名（`getCategoryName()`）以及输入参数的 `summary`，指定消息键时按区域设置显示对应的消息（不是消息键时按原样显示所写的字符串）
- 是否为消息键通过 `MessageManager.hasMessage(值)` 判定。若在消息属性中定义了，则显示该消息；若未定义，则按原样显示所写的字符串（写了键却忘记在属性中定义时，会直接显示键字符串）。消息属性的放置位置・写法请参见 `java-im-message-usage`
- 传给 LLM 的工具名・说明・输入模式是 `getDefinition()` 的 `getName()`・`getDescription()`・`getParametersSchema()` 的值，不会使用 `@Tool` 的 `name`・`description`。`@Tool` 的 `name` 是内置工具的标识符，若相同的 `name` 已被注册，会输出警告且不会被注册。为避免混淆，请将 `@Tool` 的 `name` 与 `getDefinition().getName()` 设为相同的值
- `@Tool` 的 `description` 不会作为消息键解析（在管理画面中翻译显示的是 `title`・`summary`・类别名・输入参数的 `summary`）
- `getToolType()` 的值不影响作为内置工具的注册（保持 `UserDefinedTool` 的 `ToolType.USER_DEFINED` 即可）
- 用代码构建代理时，注册为内置工具的工具也可以通过 `AgentBuilder.userDefinedTool(...)`・`builtinTool(...)` 中的任意一个传入。无论哪种方式，都会与逻辑流・MCP 的工具一起合并到一个列表中，并以相同的方式注册

### 管理画面的输入参数表

管理画面的输入参数表由输入类型（`Tool<I, O>` 的 `I`）的字段生成。每一行由字段的名称・类型，以及 `SchemaProperties` 注解的 `summary`（说明）・`required`（必需）组成。

- `getDefinition()` 的 `parametersSchema` 不用于该表。即使手写了 `parametersSchema`，要显示该表也需要在输入类型的字段上标注注解
- 未标注注解的字段不会显示在表中
- 对于标注了 `ObjectProperty` 的自定义类类型的字段，该类的字段会作为子行展开
- `SchemaProperties` 的 `description` 面向 LLM（成为 JSON Schema 的 `description`），`summary` 面向管理画面（不包含在 JSON Schema 中）。要在表中显示说明，请指定 `summary`

## 知识（`Knowledge`）

```java
package jp.co.intra_mart.foundation.copilot.agent.knowledge;

public interface Knowledge {
    String getId();
    String getName();
    default String getDescription() { return getName() + "のナレッジベース"; }
    default KnowledgeSearchParams getSearchParams() { return KnowledgeSearchParams.defaults(); }
    default List<KnowledgeEntry> retrieve(String query) throws KnowledgeException;
    default List<KnowledgeEntry> retrieve(String query, int topK) throws KnowledgeException;
    List<KnowledgeEntry> retrieve(String query, int topK, MetadataFilterGroups metadataFilter) throws KnowledgeException;
}
```

通过 ID 引用知识管理（Agent Designer 等）中已注册的知识时，同样应实现 `Knowledge`（实现示例见 `assets/copilot-agent-basic-usage.md` 模式 6）。获取知识信息与检索时使用以下公开 API。不要使用非公开 API `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge`。

```java
// 知识信息（名称・描述・嵌入模型 ID）。不存在时为 null
KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(String knowledgeId); // throws CopilotKnowledgeException

// 检索。aiModelId 传入 KnowledgeInfo.getAiModelId()
KnowledgeSearchRepositoryFactory.getInstance().getKnowledgeSearchRepository()
    .search(String knowledgeId, String aiModelId, String query,
            KnowledgeSearchParams params, MetadataFilterGroups metadataFilter); // throws CopilotKnowledgeException
```

通过 `AgentBuilder.knowledge(knowledge)` 注册后，框架会在执行时自动生成 `KnowledgeSearchTool`，当 LLM 判断需要时便可通过工具检索知识。

```java
package jp.co.intra_mart.foundation.copilot.agent.knowledge.model;

public final class KnowledgeSearchParams implements java.io.Serializable {
    public static final int DEFAULT_TOP_K = 5;
    public KnowledgeSearchParams(int topK, Double similarityThreshold);
    public KnowledgeSearchParams(int topK, Double similarityThreshold, MetadataFilterGroups metadataFilter);
    public static KnowledgeSearchParams defaults();
    public int getTopK();
    public Double getSimilarityThreshold();
    public MetadataFilterGroups getMetadataFilter();
}
```

## 技能（`SkillEntry`）

技能是以 Markdown 形式定义的知识资产（工具的使用方法・判断标准・步骤）。工具执行具体操作，而技能向 LLM 传达其使用方法。

```java
package jp.co.intra_mart.foundation.copilot.agent.skill;

public interface SkillEntry {
    String getSkillId();
    String getName();        // SKILL.md front matter 中的 name
    String getDescription();  // SKILL.md front matter 中的 description（LLM 选择的依据）
    Map<String, Object> getMetadata();
    String getBody();         // SKILL.md 正文
}
```

没有从 Java 获取技能管理中已注册技能的公开 API。要让智能体使用技能时，在画面的智能体定义中设置技能，再通过 `AgentManagementService` 读取并运行该智能体（`assets/copilot-agent-basic-usage.md` 模式 7・模式 11）。

- `jp.co.intra_mart.foundation.copilot.agent.skill.endpoint.SkillEndpointFactory` 用于 Web API Maker 的 REST 端点，未作为 Java 使用的 API 公开，因此不要使用。`jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` 是非公开 API，也不要使用
- 框架从 `SkillEntry` 使用的是用于生成传给 LLM 的技能目录的 `getSkillId()`・`getDescription()`（不使用 `getName()`）。读取技能的工具会按技能 ID 直接从存储中读取正文，因此即使自行实现 `SkillEntry`，未注册的技能也无法使用

## 介入执行流程（`AgentExecutionMiddleware`）

责任链（Chain of Responsibility）模式。通过 `InvocationContext#getPhase()`（`AgentPhase` 枚举：`EXECUTION`/`ITERATION`/`LLM_CALL`/`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`/`QUERY_REWRITE`/`STRUCTURED_OUTPUT`/`COMPACTION`/`GUARDRAIL`）识别阶段。

```java
package jp.co.intra_mart.foundation.copilot.agent.middleware;

public interface AgentExecutionMiddleware {
    default Object intercept(InvocationContext ctx, Chain chain) throws AgentException {
        return chain.proceed(ctx); // 默认为直接透传
    }
}

@FunctionalInterface
public interface Chain {
    Object proceed(InvocationContext ctx) throws AgentException;
}
```

- **执行记录**：即使是通过 `Agent.builder()` 构建的智能体，平台也会在已注册的 middleware 外侧自动加入记录执行的 middleware。执行（执行时间、LLM 调用次数等）会显示在追踪列表中，因此不要为记录而编写 middleware
- **观测系（fail-open）**：在有追踪无法满足的目的（如在自己的画面上显示执行进度）时，实现 `AgentExecutionMiddleware`，并原样返回 `chain.proceed(ctx)` 的结果・异常。观测处理的异常应自行捕获（否则主体执行也会失败）。`jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware` 是非公开 API，不要继承（实现示例见 `assets/copilot-agent-basic-usage.md` 模式 5）
- **可能中止处理的校验・护栏等控制系（fail-closed）**：直接实现 `AgentExecutionMiddleware`，在 `intercept` 内让异常原样传播
- `InvocationContext` 可通过 `withLLMMessages(List<Message>)`（仅限 `LLM_CALL` 阶段）或 `withToolArguments(String)`（仅限 `TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`）生成仅变更了允许轴的新上下文。变更后的上下文应传给 `chain.proceed(modifiedCtx)`
- 通过 `AgentBuilder.middleware(...)`/`middlewares(...)` 注册

## Structured Output（类型化输出）

```java
package jp.co.intra_mart.foundation.copilot.agent.structured;

public interface Property extends java.lang.annotation.Annotation {
    String description();
    boolean required();
    String name();
}
```

为输出类型的字段标注 `@Property(description=..., required=...)`，并通过 `AgentBuilder.<输出类型>structuredOutput(输出类型.class)`（或 `Agent.<输出类型>builder()...structuredOutput(...)`）启用。执行结果通过 `AgentResponse.getParsedData()` 获取（未设置 Structured Output 时为 `null`）。
