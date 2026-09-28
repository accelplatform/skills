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
                .instruction("あなたは親切なアシスタントです。")
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
     * Since {@link AbstractToolDefinition} does not implement isEnabled(), prepare a thin subclass
     * that always returns true.
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

- Annotate the input parameter DTO's fields with `SchemaProperties` (the same annotation used by MCP tools in `java-im-mcp-generator`)
- Automatically generate the JSON Schema with `JsonSchemaGenerator.generateSchema(DTOClass.class)`, and pass it to `ToolDefinition.getParametersSchema()`
- To call a tool directly without going through the LLM (e.g. for a unit test), a minimal `ToolExecutionContext` implementation (only `getToolCallId`/`getMetadata`/`setMetadata`) is sufficient

## Pattern 4: Structured Output (Typed Output)

```java
import jp.co.intra_mart.foundation.copilot.agent.structured.Property;

public class WeatherReport {

    @Property(description = "都市名", required = true)
    private String city;

    @Property(description = "天気の概況（晴れ・雨等）", required = true)
    private String condition;

    @Property(description = "気温（摂氏）", required = true)
    private int temperatureCelsius;

    // getters/setters omitted
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

- Declaring the type parameter up front with `Agent.<OutputType>builder()` before calling `structuredOutput(...)` keeps the type consistent throughout the rest of the method chain
- Retrieve the result from `AgentResponse.getParsedData()`

## Pattern 5: Intervening in the Execution Flow (Middleware)

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

- For logging/monitoring only, extend `ObservabilityMiddleware` (exceptions from `before`/`after`/`onError` are automatically swallowed and do not affect the main execution — i.e. fail-open)
- If you need to halt processing itself (input validation, guardrails, etc.), implement `AgentExecutionMiddleware` directly, and inside `intercept(ctx, chain)` either return your own result without calling `chain.proceed(ctx)`, or let the exception propagate as-is (fail-closed)

## Pattern 6: Referencing a Registered Knowledge Base

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

- `RegisteredKnowledge` references, by ID, a knowledge base already registered in knowledge management (e.g. Agent Designer). The knowledge base's name/description are resolved from knowledge management each time they're referenced
- Once registered, the framework automatically generates a search tool at execution time, and the LLM searches via the tool whenever it judges this necessary (you don't need to describe the search method in `instruction`)
- If the referenced target does not exist, no exception occurs at creation time — it only throws when a search is actually attempted

## Pattern 7: Referencing a Markdown Skill

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

- Skills are managed as Markdown files placed at `im_copilot/agent/skills/<skillId>/SKILL.md` on `PublicStorage`
- `entriesForRegistry` does not throw an exception for nonexistent IDs — they are simply excluded from the result (you can check the resolved count via the size of the returned `Map`)
- A skill is a knowledge asset describing how to use tools, decision criteria, and procedures; the actual execution of an operation is handled by a tool (Pattern 3)

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

- An `AbstractCopilotAssistant<T>` subclass annotated with `@Assistant` becomes the entry point for calls from the IM-Copilot chat UI
- Simply call `Agent.builder()...build()` and `run(...)` inside `doExecute`. If the agent does not need to load a dynamic agent definition (JSON) managed by Agent Designer — i.e. it's a fixed configuration assembled in code — an implementation this simple is sufficient
- **The parameter class `T` must be `AssistantParameter` itself, or a subclass of it.** Using an incompatible POJO with only custom fields means `AssistantParameterParser.get(parameter)` (called first inside `preprocessing()`) cannot find a matching parser and fails at runtime, and the chat UI also cannot build an input box for the outgoing message from the parameter class's schema, so the user cannot enter a prompt. Read the user's utterance from the inherited `getMessage().getContents()` (`AssistantParameter` itself may be used as-is with no added fields). If additional parameters (such as `dbSource`) are needed, subclass `AssistantParameter` and add only fields annotated with `@Property`; do not redeclare `message`/`threadId`
- For more advanced integration (streaming responses, using `getMessageHistory()`), see `reference/assistant-integration-api-reference.md`

## Pattern 9: Registering the Assistant with the Platform (Required Alongside Pattern 8)

**Merely adding `@Assistant` does not make the platform recognize it, and it does not appear in the assistant list.** Both of the following are required.

### Step 1: Implement and Register `AssistantScanPackageFactory`

To add the package containing the `@Assistant` class to the scan target, implement `AssistantScanPackageFactory` and register it via `ServiceLoader`.

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

Create a file named `src/main/resources/META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory` containing the implementation class's fully qualified name, one line.

```
jp.co.intra_mart.sample.copilotagent.WeatherAssistantScanPackageFactory
```

### Step 2: Grant an IM-Authz Permission

The scan result of an `@Assistant` class is **automatically imported** as an IM-Authz authorization resource at server startup (resource URI: `im-copilot-assistant://assistant/<assistant ID>`, resource type: `im-copilot-assistant`, action: `execute`). **However, the permit policy for that resource (who is allowed to execute it) is not granted automatically.** You must explicitly configure a permit policy for the target users/roles in the IM-Authz administration screen (or via `PolicyManager`, covered by the `java-im-authz-usage` skill, etc.). Without this configuration, even though the assistant itself is correctly scanned, it is excluded by the permission check in the list-retrieval API (`getMetadatas(true)`) and does not appear on screen.

- Step 1 alone does not make it appear in the list (it is rejected by the authorization check)
- Step 2 alone leaves nothing to target (the class is never scanned, so the resource never exists)
- **Only doing both makes the assistant appear in the assistant list**

## Notes

- **`Agent`/`AgentBuilder` is an independent Java API that does not depend on the Assistant framework.** If you don't need to integrate with the IM-Copilot chat UI, skip Pattern 8 (Assistant) and call Patterns 1–7 directly from a Web API Maker endpoint or a job
- **`AbstractToolDefinition` does not implement `isEnabled()`.** In your `UserDefinedTool.getDefinition()` implementation, prepare a thin subclass that implements `isEnabled()`
- **`structuredOutput(...)` returns a new builder with a changed type parameter.** Declare the type explicitly from the start, e.g. `Agent.<OutputType>builder()`
- **`ObservabilityMiddleware` (observation-only, fail-open) and directly implementing `AgentExecutionMiddleware` (control-oriented, fail-closed) serve different purposes.** Don't write an implementation that may need to halt processing using `ObservabilityMiddleware` (its exceptions are swallowed, so it won't halt as intended)
- **Merely adding `@Assistant` does not make it appear in the assistant list.** Always complete Pattern 9 (registering `AssistantScanPackageFactory` + granting an IM-Authz permission). Doing only one of the two does not make it appear
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
