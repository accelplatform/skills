# IM-Copilot Agent Framework Implementation Patterns (Java)

A collection of implementation patterns using `Agent`/`AgentBuilder`. Refer to `reference/agent-core-api-reference.md`/`reference/tool-knowledge-skill-api-reference.md`/`reference/assistant-integration-api-reference.md` for exact method signatures.

## Pattern 1: Building a Minimal Agent and Calling It Directly

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;
import jp.co.intra_mart.foundation.copilot.agent.Message;
import jp.co.intra_mart.foundation.copilot.agent.exception.AgentException;

public class SimpleAgentService {

    public String ask(final String userMessage) throws AgentException {
        final Agent<?> agent = Agent.builder()
                .model("gpt-4")
                .instruction("You are a helpful assistant.")
                .build();

        final AgentResponse<?> response = agent.run(userMessage);
        final Message message = response.getMessage();
        return message == null ? "" : message.getContent();
    }
}
```

- `Agent`/`AgentBuilder` are Java objects that don't depend on the Assistant framework, and can be called directly from any Java code, such as a Web API Maker endpoint or a job
- `run(String)` is stateless execution. Each call internally creates a temporary session, and conversation history is not retained
- Write only business logic (role, response style) into `instruction`. Tool-usage instructions do not need to be written, since they are automatically injected into the system prompt

## Pattern 2: Stateful Conversation (History Retained)

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

- Create a `Session` via `Agent.createSession()`, and reuse the same instance so that conversation history accumulates in `SessionContext`
- Recreating the `Session` on every call results in the same behavior as the stateless execution in Pattern 1 (history is not retained)

## Pattern 3: A Custom Tool (`UserDefinedTool`)

```java
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties;

public class WeatherLookupInput {

    @SchemaProperties.StringProperty(description = "Name of the city to check the weather for (e.g. Tokyo)", required = true)
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
        final String weather = input.getCity() + " weather: sunny, 22℃";
        return ToolResult.<String>builder().content(weather).build();
    }

    @Override
    public ToolDefinition getDefinition() {
        return EnabledToolDefinition.of(
                "weather_lookup",
                "Gets the current weather for the specified city.",
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
     * Generates the JSON Schema from the SchemaProperties annotations of the input parameter DTO.
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
     * Since {@link AbstractToolDefinition} does not implement isEnabled(), prepare a thin subclass that always returns true.
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
        .instruction("You are a weather assistant.")
        .userDefinedTool(new WeatherLookupTool())
        .build();
```

- Annotate the input parameter DTO's fields with `SchemaProperties` (the same annotation used by MCP tools in `java-im-mcp-generator`)
- Generate the JSON Schema with the public API `jp.co.intra_mart.foundation.copilot.action.chat.ToolDefinition.builder().parametersFromClass(DTOClass.class).build().getParameters()` and pass it to `ToolDefinition.getParametersSchema()` (do not use `jp.co.intra_mart.system.copilot.tool.JsonSchemaGenerator`; it is an internal class)
- **If you put even one `SchemaProperties` annotation on the DTO, put one on every field.** Fields without an annotation are discarded even if the LLM passes values for them, and no error is raised (setters are not used either; see `reference/tool-knowledge-skill-api-reference.md` for details)
- To call a tool directly without going through the LLM (e.g. for a unit test), a minimal `ToolExecutionContext` implementation (only `getToolCallId`/`getMetadata`/`setMetadata`) is sufficient

## Pattern 4: Structured Output (Typed Output)

```java
import jp.co.intra_mart.foundation.copilot.agent.structured.Property;

public class WeatherReport {

    @Property(description = "City name", required = true)
    private String city;

    @Property(description = "Weather summary (sunny, rainy, etc.)", required = true)
    private String condition;

    @Property(description = "Temperature (Celsius)", required = true)
    private int temperatureCelsius;

    // getters/setters omitted
}
```

```java
import jp.co.intra_mart.foundation.copilot.agent.Agent;
import jp.co.intra_mart.foundation.copilot.agent.AgentResponse;

final Agent<WeatherReport> agent = Agent.<WeatherReport>builder()
        .model("gpt-4")
        .instruction("Report the weather in Tokyo.")
        .structuredOutput(WeatherReport.class)
        .build();

final AgentResponse<WeatherReport> response = agent.run("What's the weather in Tokyo?");
final WeatherReport report = response.getParsedData();
```

- Declaring the type parameter up front with `Agent.<OutputType>builder()` before calling `structuredOutput(...)` keeps the type consistent throughout the rest of the method chain
- Retrieve the result from `AgentResponse.getParsedData()`

## Pattern 5: Intervening in the Execution Flow (Middleware)

Execution recording (execution time, number of LLM calls, etc.) is added automatically by the platform even to agents built with `Agent.builder()`, and executions appear in the trace list. Do not write a middleware just to record them. Write your own middleware only when you have a purpose the trace does not cover, such as showing the execution progress on your own screen.

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

    /** Sends progress to the screen (the destination is provided by the application) */
    private final Consumer<AgentPhase> listener;

    public ProgressMiddleware(final Consumer<AgentPhase> listener) {
        this.listener = listener;
    }

    @Override
    public Object intercept(final InvocationContext ctx, final Chain chain) throws AgentException {
        notifyProgress(ctx.getPhase());
        // Return the main result or exception as-is
        return chain.proceed(ctx);
    }

    // Do not let a notification failure fail the main execution (fail-open)
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
            // e.g. for TOOL_CALL, send "Running a tool" to the screen
        }))
        .build();
```

- An observation middleware that notifies progress returns the result or exception of `chain.proceed(ctx)` as-is. An exception thrown by the notification code also fails the main execution, so catch exceptions from the notification code yourself (fail-open)
- If you need to halt processing itself (input validation, guardrails, etc.), inside `intercept(ctx, chain)` either return your own result without calling `chain.proceed(ctx)`, or let the exception propagate as-is (fail-closed)
- Do not extend `jp.co.intra_mart.system.copilot.agent.middleware.ObservabilityMiddleware`; it is a non-public API

## Pattern 6: Referencing a Registered Knowledge Base

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
 * A {@link Knowledge} that references, by ID, a knowledge base registered in knowledge management.
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
                throw new KnowledgeException("Knowledge base not found. knowledgeId=" + knowledgeId);
            }
            // Search with the embedding model configured for the knowledge base
            return KnowledgeSearchRepositoryFactory.getInstance().getKnowledgeSearchRepository()
                    .search(knowledgeId, info.getAiModelId(), query, params, metadataFilter);
        } catch (final CopilotKnowledgeException e) {
            throw new KnowledgeException("Failed to search the knowledge base. knowledgeId=" + knowledgeId + " cause: " + e.getMessage(), e);
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
        .instruction("Answer based on the provided information.")
        .knowledge(new ManagedKnowledge("knowledge-00123", KnowledgeSearchParams.defaults()))
        .build();
```

- References, by ID, a knowledge base already registered in knowledge management (e.g. Agent Designer). The knowledge base's name/description are retrieved from knowledge management each time they're referenced (`KnowledgeInfo.getKnowledgeName()`/`getDescription()`)
- Search with `KnowledgeSearchRepository.search(knowledge ID, embedding model ID, query, search parameters, metadata filter)`. Pass `KnowledgeInfo.getAiModelId()`, the model configured for the knowledge base, as the embedding model ID
- Once registered, the framework automatically generates a search tool at execution time, and the LLM searches via the tool whenever it judges this necessary (you don't need to describe the search method in `instruction`)
- If the referenced target does not exist, no exception occurs at creation time — it only throws when a search is actually attempted
- Do not use `jp.co.intra_mart.system.copilot.agent.knowledge.RegisteredKnowledge`; it is a non-public API

## Pattern 7: Having an Agent Use Registered Skills

There is no public API to retrieve skills registered in skill management from Java. To have an agent use skills, give the skills to the agent on the Accel Agent agent management screen, then load and run that agent as in Pattern 11. The loaded agent reads and uses the skill body at run time.

- `jp.co.intra_mart.foundation.copilot.agent.skill.endpoint.SkillEndpointFactory` is for Web API Maker REST endpoints and is not published as an API for Java, so do not use it. `jp.co.intra_mart.system.copilot.agent.skill.service.SkillCatalogService` is a non-public API, so do not use it either
- Even if you implement `SkillEntry` yourself, the tools that read skills load the body directly from storage by skill ID, so a skill that is not registered cannot be used
- A skill is a knowledge asset describing how to use tools, decision criteria, and procedures; concrete operations are performed by tools (Pattern 3)

## Pattern 8: Integrating with the IM-Copilot Chat UI (Assistant Framework)

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
                    .instruction("You are a weather assistant.")
                    .userDefinedTool(new WeatherLookupTool())
                    .build();

            // validate() has confirmed that it is a string
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

- An `AbstractCopilotAssistant<T>` subclass annotated with `@Assistant` becomes the entry point for calls from the IM-Copilot chat UI
- `getMessage().getContents()` is of type `Object` and may hold something other than a string (such as a Collection of `ToolContent`). Converting it with `String.valueOf(...)` passes a string like `[...]` to the AI as-is when it is a Collection, so confirm it is a string before taking it out
- Simply call `Agent.builder()...build()` and `run(...)` inside `doExecute`. For an agent with a fixed configuration assembled in code, an implementation this simple is sufficient. To run an agent defined on the screen, load the `Agent` as in Pattern 11 instead of using `Agent.builder()`
- **The parameter class `T` must be `AssistantParameter` itself, or a subclass of it.** Using an incompatible POJO with only custom fields means `AssistantParameterParser.get(parameter)` (called first inside `preprocessing()`) cannot find a matching parser and fails at runtime, and the chat UI also cannot build an input box for the outgoing message from the parameter class's schema, so the user cannot enter a prompt. Read the user's utterance from the inherited `getMessage().getContents()` (`AssistantParameter` itself may be used as-is with no added fields). If additional parameters (such as `dbSource`) are needed, subclass `AssistantParameter` and add only fields annotated with `@Property`; do not redeclare `message`/`threadId`
- For more advanced integration (streaming responses, using `getMessageHistory()`), see `reference/assistant-integration-api-reference.md`

## Pattern 9: Registering the Assistant with the Platform (Required Alongside Pattern 8)

**An `@Assistant` class is recognized through an index generated automatically at build time, but showing it in the assistant list requires an IM-Authz permit policy.**

### Step 1: Check the Index

The fully qualified name of an `@Assistant` class is listed in the index (`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.assistant.annotation.Assistant`) that the annotation processor generates automatically at build time, and the platform loads `@Assistant` classes from this index. You do not need to implement `AssistantScanPackageFactory` or register anything in `META-INF/services`. After the build, check that this file exists in `target/classes` (or the jar) and lists the fully qualified name of the `@Assistant` class, as follows.

```
jp.co.intra_mart.sample.copilotagent.WeatherAssistant
```

### Step 2: Grant an IM-Authz Permission

An `@Assistant` class recognized through the index is **automatically imported** as an IM-Authz authorization resource at server startup (resource URI: `im-copilot-assistant://assistant/<assistant ID>`, resource type: `im-copilot-assistant`, action: `execute`). **However, the permit policy for that resource (who is allowed to execute it) is not granted automatically.** You must explicitly configure a permit policy for the target users/roles in the IM-Authz administration screen (or via `PolicyManager`, covered by the `java-im-authz-usage` skill, etc.). Without this configuration, even though the assistant itself is correctly recognized, it is excluded by the permission check in the list-retrieval API (`getMetadatas(true)`) and does not appear on screen.

- Without a permit policy, the assistant does not appear in the list even though it is recognized through the index (it is rejected by the authorization check)

## Pattern 10: Registering a Custom Tool as a Built-in Tool (Selectable in the Admin Screen)

If you put `@Tool` (`jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`, which is different from the MCP `@Tool`) on the tool class from Pattern 3, the tool is registered as a built-in tool and shown by category on the built-in tab of the Accel Agent tool management screen, and can be selected on the agent edit screen. There is no per-tool authorization; unlike the Assistant in Pattern 9, there is no IM-Authz setting for it.

- Because tools have no authorization, anyone who can run an agent that has the tool can make the tool run through the LLM
- A tool runs in the access context of the user who ran the agent (the logged-in user). Build the tool's processing with APIs that check the logged-in user's permissions. The product's built-in tools (workflow, etc.) are also implemented with APIs that check the logged-in user's permissions
- Do not build it in a way that bypasses permission checks (for example, reading or writing data directly with SQL)

```java
import jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool;

@Tool(name = "weather_lookup", title = "Weather Lookup", summary = "Gets the current weather for the specified city.",
        description = "Gets the current weather for the specified city.", category = WeatherToolCategory.class)
public class WeatherLookupTool implements UserDefinedTool<WeatherLookupInput, String> {
    // Same implementation as in Pattern 3
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
        return "Weather";
    }

    @Override
    public int getSortOrder() {
        return 100;
    }
}
```

You do not need to implement `BuiltinToolScanPackageFactory` or register anything in `META-INF/services`. The fully qualified name of a class with `@Tool` is listed in the index (`META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.agent.tool.annotation.Tool`) that the annotation processor generates automatically at build time, and the platform loads built-in tools from this index. After the build, check that this file exists in `target/classes` (or the jar) and lists the fully qualified name of the `@Tool` class, as follows.

```
jp.co.example.foo.agent.tool.WeatherLookupTool
```

- `@Tool`'s `name`, `description`, and `category` are required. `name` and the category's `getCategoryId()` must match `^[A-Za-z0-9_-]+$` and be at most 64 characters (otherwise the tool is not registered, and a warning is logged)
- A class with `@Tool` must implement `BuiltinTool` (`UserDefinedTool` extends `BuiltinTool`, so it can be used as-is). Make the tool class and the category class public, with a public no-argument constructor
- `title`, `summary`, the category name, and the input parameters' `summary` are shown as the message for the locale if you specify a message key (otherwise the string is shown as written)
- The input parameter table in the admin screen is built from the input type's fields and their `SchemaProperties` annotations (`summary`, `required`). `parametersSchema` of `getDefinition()` is not used, and fields without an annotation are not shown in the table (see "Registering Built-in Tools" in `reference/tool-knowledge-skill-api-reference.md` for details)
- To show descriptions in the admin screen table, also specify `summary` on each field of the input parameter DTO (e.g. `@SchemaProperties.StringProperty(description = "Name of the city to check the weather for (e.g. Tokyo)", summary = "City name", required = true)`). `description` is for the LLM and is not used in the table
- The tool name and description passed to the LLM are the values of `getDefinition()`; `@Tool`'s `name` and `description` are not used. `@Tool`'s `name` is the built-in tool's identifier, so make it the same value as `getDefinition().getName()`
- When using message keys, define the keys in the message properties (if you forget, the key string itself is shown). See `java-im-message-usage` for where and how to write them
- When building an agent in code, you can pass the tool with `userDefinedTool(...)` as in Pattern 3 (passing it with `builtinTool(...)` is treated the same way)

## Pattern 11: Loading and Running an Agent Defined on the Screen

An agent defined on the Accel Agent agent management screen can be loaded as an `Agent` with `AgentManagementService` (`jp.co.intra_mart.foundation.copilot.agent.definition`) and run with `run(...)`, just like an agent assembled in code. The same code works not only in an Assistant's `doExecute` (Pattern 8) but also from a Web API Maker endpoint or a job.

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

        // Resolve the latest published version (AgentVersionNotPublishedException if none is published)
        final int version = service.resolvePublishedVersion(agentId, null);
        final Agent<?> agent = service.getAgent(agentId, version);

        final AgentResponse<?> response = agent.run(prompt);
        final Message message = response.getMessage();
        return message == null ? "" : message.getContent();
    }
}
```

- `resolvePublishedVersion(agentId, null)` returns the number of the latest published version. If no version is published, it throws `AgentVersionNotPublishedException` (a subclass of `AgentDefinitionPersistenceException`, which extends `AgentException`)
- The loaded `Agent` runs with that version's definition from the screen (model, instruction, etc.)
- **Do not use `getAgent(agentId)` without a version for production calls.** It loads the latest version regardless of its status. New versions are created in the suspended state, so the version being edited on the screen (unpublished) runs as-is
- `AgentManagementService` does not check whether the agent may be run (no authorization). Check that with the authorization of the calling screen or API

For an agent whose screen definition has input parameters, build the values with `RunContext.builder().inputParameters(...)` and pass them with `run(Message, RunContext)`. The `${...}` placeholders in the instruction are replaced with the input parameters of the `RunContext` at run time. If you do not pass them, `${...}` is sent to the LLM without being replaced. For an object input parameter, you can refer to a value inside it, as in `${user.name}`.

```java
final Map<String, Object> inputParameters = new HashMap<>();
inputParameters.put("topic", "transportation expenses");                                   // ${topic} in the instruction
inputParameters.put("user", Collections.singletonMap("name", "Yamada"));    // ${user.name} in the instruction
final RunContext runContext = RunContext.builder().inputParameters(inputParameters).build();

final AgentResponse<?> response = agent.run(Message.user(prompt), runContext);
```

## Notes

- **`Agent`/`AgentBuilder` is an independent Java API that does not depend on the Assistant framework.** If you don't need to integrate with the IM-Copilot chat UI, skip Pattern 8 (Assistant) and call Patterns 1–7 directly from a Web API Maker endpoint or a job
- **`AbstractToolDefinition` does not implement `isEnabled()`.** In your `UserDefinedTool.getDefinition()` implementation, prepare a thin subclass that implements `isEnabled()`
- **`structuredOutput(...)` returns a new builder with a changed type parameter.** Declare the type explicitly from the start, e.g. `Agent.<OutputType>builder()`
- **Implement observation (fail-open) and control (fail-closed) Middleware separately.** Don't put a check that should halt processing inside the `try`/`catch` that catches exceptions from the observation code (the exception is caught, so it won't halt as intended)
- **Merely adding `@Assistant` does not make it appear in the assistant list.** Always complete Pattern 9 (checking the index + granting an IM-Authz permission). You do not need to implement `AssistantScanPackageFactory`
- **`T` in `AbstractCopilotAssistant<T>` must be `AssistantParameter` itself, or a subclass of it.** Using an incompatible POJO causes the parameter parser to fail resolving the parameter type, and also leaves the chat UI unable to build an input box for the outgoing message, so the user cannot enter a prompt (the assistant still appears in the list, but is unusable once selected). See Pattern 8 for details
- The internal implementation of Knowledge's content-source ingestion, vectorization, and search, as well as the OAuth integration of MCP tools, are platform-internal implementation details that application developers do not implement directly
- **`AgentBuilder<T>` cannot be subclassed** (its constructor is package-private). To switch settings conditionally, hold the builder in an `AgentBuilder<?>`-typed variable and call further methods on it before `build()`
  ```java
  final AgentBuilder<?> builder = Agent.builder().instruction("You are a weather assistant.");
  if (withTool) {
      builder.userDefinedTool(new WeatherLookupTool());
  }
  final Agent<?> agent = builder.build();
  ```
- **`model(String)` is optional.** If omitted, `ChatOption.model` stays `null` and falls back to the default model configured in the tenant's driver settings. Explicitly specifying a model ID that doesn't exist fails at runtime with an error such as `invalid model ID`
- **When an AI service call fails, the exception message is sometimes collapsed into a generic wording regardless of the actual cause.** The real failure reason (HTTP response, etc.) lives deeper in the exception's cause chain, so when troubleshooting, follow `getCause()` (see `reference/agent-core-api-reference.md` for details)
