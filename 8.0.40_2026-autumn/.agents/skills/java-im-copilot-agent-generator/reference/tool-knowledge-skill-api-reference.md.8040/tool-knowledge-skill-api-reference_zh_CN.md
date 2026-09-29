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

```java
package jp.co.intra_mart.system.copilot.tool;

public final class JsonSchemaGenerator {
    public static Map<String, Object> generateSchema(Class<?> dtoClass);
}
```

调用 `JsonSchemaGenerator.generateSchema(WeatherLookupInput.class)` 可根据标注了 `SchemaProperties` 的字段生成 JSON Schema（`Map<String, Object>`）。将此返回值直接传给 `ToolDefinition.getParametersSchema()`。

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

基本用法是使用 `RegisteredKnowledge`，通过 ID 引用知识管理（Agent Designer 等）中已注册的知识。

```java
package jp.co.intra_mart.system.copilot.agent.knowledge;

public class RegisteredKnowledge implements Knowledge {
    public RegisteredKnowledge(String knowledgeId, KnowledgeSearchParams searchParams);
    // 实现了 getId/getName/getDescription/getSearchParams/retrieve
    // 生成时不验证所引用对象是否存在。若不存在，名称・描述将变为根据 ID 组装的替代值，
    // retrieve() 将抛出 KnowledgeException
}
```

通过 `AgentBuilder.knowledge(knowledge)` 注册后，框架会在执行时自动生成 `KnowledgeSearchTool`，当 LLM 判断需要时便可通过工具检索知识。**仅当需要自定义检索处理（不经过知识管理的检索）时，才自行实现 `Knowledge` 接口。**

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

## 技能（`SkillEntry`/`SkillCatalogService`）

技能是以 Markdown 格式定义的知识资产（工具的使用方法・判断标准・步骤）。工具执行具体操作，而技能则向 LLM 传达该如何使用工具。

```java
package jp.co.intra_mart.foundation.copilot.agent.skill;

public interface SkillEntry {
    String getSkillId();
    String getName();        // SKILL.md 前言中的 name
    String getDescription();  // SKILL.md 前言中的 description（LLM 选定技能的依据）
    Map<String, Object> getMetadata();
    String getBody();         // SKILL.md 正文（可能为延迟获取）
}
```

```java
package jp.co.intra_mart.system.copilot.agent.skill.service;

public final class SkillCatalogService {
    public static final String SKILLS_ROOT = "im_copilot/agent/skills"; // PublicStorage 上的存放位置
    public Map<String, SkillEntry> entriesForRegistry(List<String> selectedIds);
}
```

技能存放在 `PublicStorage` 的 `im_copilot/agent/skills/<skillId>/SKILL.md`。调用 `new SkillCatalogService().entriesForRegistry(skillIds)`，将指定的 ID 解析为 `SkillEntry`（不存在的 ID 不会导致异常，只是不出现在结果中），然后通过 `AgentBuilder.skills(entries.values())` 注册。

## 介入执行流程（`AgentExecutionMiddleware`）

责任链（Chain of Responsibility）模式。通过 `InvocationContext#getPhase()`（`AgentPhase` 枚举：`EXECUTION`/`ITERATION`/`LLM_CALL`/`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`/`QUERY_REWRITE`/`STRUCTURED_OUTPUT`/`COMPACTION`）识别阶段。

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

- **仅观测（日志・监控，fail-open）**：继承 `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware`，重写 `before(ctx)`/`after(ctx, scope, result)`/`onError(ctx, scope, error)`。观测处理过程中的异常会在内部被捕获，仅输出日志；而主体执行（`chain.proceed`）的异常会原样重新抛出
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
