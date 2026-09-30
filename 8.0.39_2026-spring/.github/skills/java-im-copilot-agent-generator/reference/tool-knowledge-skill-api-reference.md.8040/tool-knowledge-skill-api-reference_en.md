# Tool / Knowledge / Skill / Middleware API Reference (Java)

Based on the actual class definitions in the `im_copilot_agent`/`im_copilot_base` modules. Do not supplement methods/attributes from memory or guesswork.

## Tools (`Tool`/`UserDefinedTool`)

Type hierarchy: `UserDefinedTool<I,O> extends BuiltinTool<I,O> extends Tool<I,O>`. Application development implements `UserDefinedTool`.

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
    ToolType getToolType(); // Returns ToolType.USER_DEFINED
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
    public AbstractToolDefinition(); // No-arg
    public AbstractToolDefinition(String name, String description, Map<String, Object> parametersSchema,
            Class<?> inputType, Class<?> outputType, ToolType toolType);
    // Implements getName/getDescription/getParametersSchema/getInputType/getOutputType/getToolType
    // Does not implement isEnabled() (subclasses must implement it)
}
```

**Since `AbstractToolDefinition` does not implement `isEnabled()`, the value returned from `UserDefinedTool.getDefinition()` needs a thin subclass of your own that implements `isEnabled()`** (returning `true` is fine for a tool that is always enabled). Use the 6-argument constructor `(name, description, parametersSchema, inputType, outputType, toolType)`.

### Tool Input Parameter DTOs and `SchemaProperties`

Define the input type `I` as a plain DTO class whose fields are annotated with annotations from `jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties` (`StringProperty`/`IntegerProperty`/`NumberProperty`/`BooleanProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`). **This annotation is shared with MCP tools (`java-im-mcp-generator`) — see that skill's `reference/mcp-annotation-api-reference.md` for the full attribute details.**

```java
package jp.co.intra_mart.system.copilot.tool;

public final class JsonSchemaGenerator {
    public static Map<String, Object> generateSchema(Class<?> dtoClass);
}
```

Calling `JsonSchemaGenerator.generateSchema(WeatherLookupInput.class)` generates a JSON Schema (`Map<String, Object>`) from the fields annotated with `SchemaProperties`. Pass this return value directly to `ToolDefinition.getParametersSchema()`.

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

`ToolResult.<O>builder().content(value).build()` is the basic form for success. To express an error, assemble it with `builder().isError(true).message("...").cause(e).build()` (as an alternative to throwing `ToolExecutionException`, you can also represent the error as a `ToolResult`).

## Knowledge (`Knowledge`)

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

The basic usage is `RegisteredKnowledge`, which references, by ID, a knowledge base already registered in knowledge management (e.g. Agent Designer).

```java
package jp.co.intra_mart.system.copilot.agent.knowledge;

public class RegisteredKnowledge implements Knowledge {
    public RegisteredKnowledge(String knowledgeId, KnowledgeSearchParams searchParams);
    // Implements getId/getName/getDescription/getSearchParams/retrieve
    // Does not validate the referenced target's existence at creation time. If it doesn't exist, the
    // name/description become fallback values built from the ID, and retrieve() throws KnowledgeException
}
```

Registering with `AgentBuilder.knowledge(knowledge)` makes the framework automatically generate a `KnowledgeSearchTool` at execution time, letting the LLM search the knowledge base via the tool whenever it judges this necessary. **Only implement the `Knowledge` interface yourself if you need custom search logic (search that bypasses knowledge management).**

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

## Skills (`SkillEntry`/`SkillCatalogService`)

A skill is a Markdown-defined knowledge asset (how to use tools, decision criteria, procedures). Whereas a tool performs a concrete operation, a skill communicates how to use it to the LLM.

```java
package jp.co.intra_mart.foundation.copilot.agent.skill;

public interface SkillEntry {
    String getSkillId();
    String getName();        // The name from the SKILL.md front matter
    String getDescription();  // The description from the SKILL.md front matter (used by the LLM to select skills)
    Map<String, Object> getMetadata();
    String getBody();         // The SKILL.md body text (may be lazily loaded)
}
```

```java
package jp.co.intra_mart.system.copilot.agent.skill.service;

public final class SkillCatalogService {
    public static final String SKILLS_ROOT = "im_copilot/agent/skills"; // The location on PublicStorage
    public Map<String, SkillEntry> entriesForRegistry(List<String> selectedIds);
}
```

Skills are stored at `im_copilot/agent/skills/<skillId>/SKILL.md` on `PublicStorage`. Call `new SkillCatalogService().entriesForRegistry(skillIds)` to resolve the specified IDs into `SkillEntry` objects (nonexistent IDs are simply excluded from the result rather than throwing an exception), then register them with `AgentBuilder.skills(entries.values())`.

## Intervening in the Execution Flow (`AgentExecutionMiddleware`)

A Chain of Responsibility pattern. The phase is identified via `InvocationContext#getPhase()` (the `AgentPhase` enum: `EXECUTION`/`ITERATION`/`LLM_CALL`/`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`/`QUERY_REWRITE`/`STRUCTURED_OUTPUT`/`COMPACTION`).

```java
package jp.co.intra_mart.foundation.copilot.agent.middleware;

public interface AgentExecutionMiddleware {
    default Object intercept(InvocationContext ctx, Chain chain) throws AgentException {
        return chain.proceed(ctx); // Default is a pass-through
    }
}

@FunctionalInterface
public interface Chain {
    Object proceed(InvocationContext ctx) throws AgentException;
}
```

- **Observation only (logging, metrics; fail-open)**: extend `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware` and override `before(ctx)`/`after(ctx, scope, result)`/`onError(ctx, scope, error)`. Exceptions during observation are caught internally and only logged; exceptions from the main execution (`chain.proceed`) are rethrown as-is
- **Control-oriented behavior that may halt processing (validation, guardrails, etc.; fail-closed)**: implement `AgentExecutionMiddleware` directly, and let exceptions propagate as-is inside `intercept`
- `InvocationContext` lets you produce a new context with only an allowed axis changed, via `withLLMMessages(List<Message>)` (`LLM_CALL` phase only) or `withToolArguments(String)` (`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS` only). Pass the modified context to `chain.proceed(modifiedCtx)`
- Register via `AgentBuilder.middleware(...)`/`middlewares(...)`

## Structured Output (Typed Output)

```java
package jp.co.intra_mart.foundation.copilot.agent.structured;

public interface Property extends java.lang.annotation.Annotation {
    String description();
    boolean required();
    String name();
}
```

Annotate the output type's fields with `@Property(description=..., required=...)`, and enable it with `AgentBuilder.<OutputType>structuredOutput(OutputType.class)` (or `Agent.<OutputType>builder()...structuredOutput(...)`). Retrieve the execution result from `AgentResponse.getParsedData()` (`null` when Structured Output is not configured).
