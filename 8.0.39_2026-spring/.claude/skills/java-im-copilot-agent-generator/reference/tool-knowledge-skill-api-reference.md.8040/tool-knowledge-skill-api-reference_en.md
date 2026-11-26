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

To generate a JSON Schema (`Map<String, Object>`) from the input type, use the public API `jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition` (`im_copilot_core`). Pass its return value as-is to `ToolDefinition.getParametersSchema()`.

```java
final Map<String, Object> schema = jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder()
        .parametersFromClass(WeatherLookupInput.class) // Throws CopilotServiceException (a checked exception)
        .build()
        .getParameters();
```

- Do not use `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator`; it is an internal platform class. `parametersFromClass(Class)` calls the same processing internally, and the generated schema is identical
- It has the same simple name as the agent-side `ToolDefinition` (`jp.co.intra_mart.foundation.copilot.agent.tool`), so write one of them with its fully qualified name

**If you put even one `SchemaProperties` annotation on the input type, put one on every field.** The agent converts the arguments received from the LLM into the input type with `ToolJsonHelper.deserialize(json, inputType)`. For a type that has at least one annotation, values are set directly via reflection only on annotated fields (setters and Jackson annotations such as `@JsonIgnoreProperties` are not used). Fields without an annotation are discarded even if the LLM passes values for them, and no error is raised.

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

## Registering Built-in Tools (`@Tool`)

If you put `@Tool` (`jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`, which is different from the MCP `@Tool`) on a tool class, the tool is registered as a built-in tool and shown by category on the built-in tab of the Accel Agent tool management screen, and can be selected on the agent edit screen. There is no per-tool authorization; unlike an Assistant (Pattern 9 in `assets/copilot-agent-basic-usage.md`), there is no IM-Authz setting for it. See Pattern 10 in `assets/copilot-agent-basic-usage.md` for an implementation example.

- Because tools have no authorization, anyone who can run an agent that has the tool can make the tool run through the LLM
- A tool runs in the access context of the user who ran the agent (the logged-in user). Build the tool's processing with APIs that check the logged-in user's permissions. The product's built-in tools (workflow, etc.) are also implemented with APIs that check the logged-in user's permissions
- Do not build it in a way that bypasses permission checks (for example, reading or writing data directly with SQL)

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
    Class<? extends ToolCategory> subCategory() default ToolCategory.class; // No subcategory when omitted
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

- The fully qualified name of a class with `@Tool` is listed in the index `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool` (the file name is the fully qualified name of the annotation), which is generated automatically at build time, and the platform loads built-in tools from this index. This is the same mechanism as `@MCPServer`: the index is generated by the annotation processor `jp.co.intra_mart.tools:im_service_annotation_processor` (`im_copilot_base` registers `@Tool` as an indexed annotation)
- You do not need to implement `BuiltinToolScanPackageFactory` or register anything in `META-INF/services`
- A class with `@Tool` must implement `BuiltinTool` (`UserDefinedTool` extends `BuiltinTool`, so it can be used as-is). A class that does not implement it is not registered, and a warning is logged
- `@Tool`'s `name` and the category's `getCategoryId()` must match `^[A-Za-z0-9_-]+$` and be at most 64 characters. Otherwise the tool is not registered, and a warning is logged
- Make the tool class and the category class public, with a public no-argument constructor (the platform creates instances with the no-argument constructor)
- `title`, `summary`, the category name (`getCategoryName()`), and the input parameters' `summary` are shown as the message for the locale if you specify a message key (otherwise the string is shown as written)
- Whether a value is a message key is determined by `MessageManager.hasMessage(value)`. If it is defined in the message properties, that message is shown; otherwise the string is shown as written (if you write a key but forget to define it in the properties, the key string itself is shown). See `java-im-message-usage` for where and how to write message properties
- The tool name, description, and input schema passed to the LLM are the values of `getName()`, `getDescription()`, and `getParametersSchema()` of `getDefinition()`; `@Tool`'s `name` and `description` are not used. `@Tool`'s `name` is the built-in tool's identifier; if the same `name` is already registered, the tool is not registered, and a warning is logged. To avoid confusion, make `@Tool`'s `name` and `getDefinition().getName()` the same value
- `@Tool`'s `description` is not resolved as a message key (what is translated and shown in the admin screen is `title`, `summary`, the category name, and the input parameters' `summary`)
- The value of `getToolType()` does not affect registration as a built-in tool (`UserDefinedTool`'s `ToolType.USER_DEFINED` can be left as-is)
- When building an agent in code, a tool registered as a built-in tool can be passed with either `AgentBuilder.userDefinedTool(...)` or `builtinTool(...)`. Either way, it is combined into a single list together with logic flow and MCP tools and registered the same way

### Input Parameter Table in the Admin Screen

The input parameter table in the admin screen is built from the fields of the input type (`I` of `Tool<I, O>`). Each row consists of the field's name and type, and the `summary` (description) and `required` (required) of its `SchemaProperties` annotation.

- `parametersSchema` of `getDefinition()` is not used for the table. Even if you write `parametersSchema` by hand, the input type's fields need annotations for the table to be shown
- Fields without an annotation are not shown in the table
- For a field of a custom class type with `ObjectProperty`, the fields of that class are expanded as child rows
- `SchemaProperties`'s `description` is for the LLM (it becomes the JSON Schema's `description`), and `summary` is for the admin screen (it is not included in the JSON Schema). To show a description in the table, specify `summary`

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

To reference, by ID, a knowledge base already registered in knowledge management (e.g. Agent Designer), also implement `Knowledge` (see Pattern 6 in `assets/copilot-agent-basic-usage.md` for an implementation example). Use the following public APIs to retrieve knowledge base information and to search. Do not use the non-public `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge`.

```java
// Knowledge base information (name, description, embedding model ID). null if it does not exist
KnowledgeServiceFactory.getInstance().getKnowledgeService().getKnowledge(String knowledgeId); // throws CopilotKnowledgeException

// Search. Pass KnowledgeInfo.getAiModelId() as aiModelId
KnowledgeSearchRepositoryFactory.getInstance().getKnowledgeSearchRepository()
    .search(String knowledgeId, String aiModelId, String query,
            KnowledgeSearchParams params, MetadataFilterGroups metadataFilter); // throws CopilotKnowledgeException
```

Registering with `AgentBuilder.knowledge(knowledge)` makes the framework automatically generate a `KnowledgeSearchTool` at execution time, letting the LLM search the knowledge base via the tool whenever it judges this necessary.

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

## Skills (`SkillEntry`)

A skill is a knowledge asset defined in Markdown (how to use tools, decision criteria, procedures). Whereas a tool performs a concrete operation, a skill conveys how to use it to the LLM.

```java
package jp.co.intra_mart.foundation.copilot.agent.skill;

public interface SkillEntry {
    String getSkillId();
    String getName();        // name in the SKILL.md front matter
    String getDescription();  // description in the SKILL.md front matter (used by the LLM to choose)
    Map<String, Object> getMetadata();
    String getBody();         // SKILL.md body
}
```

There is no public API to retrieve skills registered in skill management from Java. To have an agent use skills, give them to the agent in its screen definition, then load and run that agent with `AgentManagementService` (Patterns 7 and 11 in `assets/copilot-agent-basic-usage.md`).

- `jp.co.intra_mart.foundation.copilot.agent.skill.endpoint.SkillEndpointFactory` is for Web API Maker REST endpoints and is not published as an API for Java, so do not use it. `jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` is a non-public API, so do not use it either
- What the framework uses from `SkillEntry` is `getSkillId()`/`getDescription()`, which build the skill catalog passed to the LLM (`getName()` is not used). The tools that read skills load the body directly from storage by skill ID, so even if you implement `SkillEntry` yourself, a skill that is not registered cannot be used

## Intervening in the Execution Flow (`AgentExecutionMiddleware`)

A Chain of Responsibility pattern. The phase is identified via `InvocationContext#getPhase()` (the `AgentPhase` enum: `EXECUTION`/`ITERATION`/`LLM_CALL`/`TOOL_CALL`/`KNOWLEDGE_SEARCH`/`SKILL_ACCESS`/`QUERY_REWRITE`/`STRUCTURED_OUTPUT`/`COMPACTION`/`GUARDRAIL`).

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

- **Execution recording**: the platform automatically adds a middleware that records the execution, outside the middlewares you register, even to agents built with `Agent.builder()`. Executions (execution time, number of LLM calls, etc.) appear in the trace list, so do not write a middleware just to record them
- **Observation (fail-open)**: when you have a purpose the trace does not cover, such as showing the execution progress on your own screen, implement `AgentExecutionMiddleware` and return the result or exception of `chain.proceed(ctx)` as-is. Catch exceptions from the observation code yourself (otherwise the main execution also fails). Do not extend `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware`; it is a non-public API (see Pattern 5 in `assets/copilot-agent-basic-usage.md` for an implementation example)
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
