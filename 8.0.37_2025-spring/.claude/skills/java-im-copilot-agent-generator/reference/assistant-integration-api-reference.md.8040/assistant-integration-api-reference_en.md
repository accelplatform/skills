# Assistant Framework Integration API Reference (Java)

Based on the actual class definitions in the `im_copilot_core` module (`jp.co.intra_mart.foundation.copilot.assistant.*`). Do not supplement methods/attributes from memory or guesswork.

`Agent`/`AgentBuilder` are plain Java APIs and can be used directly from a Web API Maker endpoint or a job on their own (see `reference/agent-core-api-reference.md`). **Wrap them with the Assistant framework covered in this reference only when you need to integrate with the IM-Copilot chat UI** (thread management, message-history persistence, streaming responses).

## The `@Assistant` Annotation

```java
package jp.co.intra_mart.foundation.copilot.assistant.annotation;

public @interface Assistant {
    String id();     // Required (no default)
    String name();   // Required (no default)
    String description() default "";
    AssistantType type() default AssistantType.STANDARD;
    boolean listEnable() default false;
    boolean storeMessage() default false;
    Class<? extends MetadataFactory> metadataFactory() default StandardMetadataFactory.class;
}
```

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public enum AssistantType { STANDARD, USER_DEFINITION }
```

- `id`/`name`: required (no default). `id` is the assistant's unique identifier
- `type`: `STANDARD` (a platform standard assistant) / `USER_DEFINITION` (user-defined). Defaults to `STANDARD` if omitted
- `listEnable`: whether the assistant is shown in the assistant list UI. Defaults to `false` if omitted
- `storeMessage`: whether to persist message history. Defaults to `false` if omitted
- `metadataFactory`: optional (defaults to `StandardMetadataFactory`)

## Registering with the Platform (Merely Adding `@Assistant` Does Not Make It Recognized)

Merely adding `@Assistant` does not make the platform recognize the class, and it does not appear in the assistant list. Both of the following are required.

### 1. `AssistantScanPackageFactory` (Registering the Classpath Scan Target)

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public interface AssistantScanPackageFactory {
    Collection<String> getTargetPackages();
}
```

The platform-internal `AssistantAnnotationLoader` (`jp.co.intra_mart.system.copilot.assistant.impl`) aggregates the target packages from every registered implementation via `ServiceLoaderUtil.loadPriority(AssistantScanPackageFactory.class)`, then searches for `@Assistant` classes with `WebAppClassScanner.findClassesWithAnnotation(Assistant.class, scanPackages)` (the exact same design as the MCP server's `McpScanPackageFactory`). Create an implementation class whose `getTargetPackages()` returns the package containing your `@Assistant` class, and register its fully qualified name (one line) under `META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory`.

**This scan result is cached once, into a `static` field on `StandardAssistantMetadataRepository` (`jp.co.intra_mart.system.copilot.assistant.metadata`), the first time the class loads (effectively, at server startup).** If the assistant still does not appear after registering the factory, a platform server restart may be required, not just an application redeploy.

### 2. Granting an IM-Authz Permission (Only the Resource Is Auto-Imported)

Once an `@Assistant` class is scanned, `CopilotAssistantResourceInitializer` (`jp.co.intra_mart.system.copilot.assistant.auth.importer`, an `ApplicationInitializer`) runs per tenant at server startup and **automatically imports** an authorization resource for each assistant. The resource URI takes the following form (`CopilotAssistantResourceType`):

```
im-copilot-assistant://assistant/<assistant ID>
```

Resource type ID: `im-copilot-assistant`, action: `execute`.

**Importing the resource and granting a permit policy for that resource are separate concerns, and the latter is not automated.** Retrieving the assistant list (`CopilotAssistantService#getMetadatas(true)`) returns only assistants whose `listEnable() == true` AND for which `AuthorizationClient.authorize(resourceUri, "execute")` returns a permit. **Unless you explicitly configure a permit policy for the target users/roles in the IM-Authz administration screen (or via `PolicyManager`, covered by the `java-im-authz-usage` skill), the assistant will not appear in the list even though it has been scanned.**

## `AbstractCopilotAssistant<T>`

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public abstract class AbstractCopilotAssistant<T> implements CopilotAssistant<T> {
    public AssistantResult execute(T parameter) throws CopilotAssistantException; // Eventually calls doExecute
    protected abstract AssistantResult doExecute(T parameter) throws CopilotAssistantException; // Implemented by the subclass

    public AssistantContext getAssistantContext();
    public void setAssistantContext(AssistantContext context);
    public boolean isAvailable(DriverInfo driverInfo);

    protected Collection<AssistantMessage> getMessageHistory() throws CopilotAssistantException;
    protected Collection<AssistantMessage> getMessageHistory(int limit) throws CopilotAssistantException;
    protected void preprocessing(T parameter) throws CopilotAssistantException; // Default does nothing
    protected void postprocessing(T parameter, AssistantResult result); // Default does nothing
}
```

Implement `doExecute(T parameter)` in a subclass annotated with `@Assistant`. `T` must be `AssistantParameter` itself, or a subclass of it (see the next section for details).

## `AssistantParameter` (the Required Contract for the Parameter Class `T`)

```java
package jp.co.intra_mart.foundation.copilot.assistant.model;

public class AssistantParameter {
    private AssistantMessage message; // required = true
    private String threadId;          // required = false
    // Getters/setters are generated automatically by Lombok's @Data
}
```

`AbstractCopilotAssistant<T>.preprocessing()` first calls `AssistantParameterParser.get(parameter)`, which checks whether either of the two registered parsers can handle it — `StandardAssistantParameterParser` (`parameter instanceof AssistantParameter`) or `MapAssistantParameterParser` (`parameter instanceof Map`). **If you specify an incompatible POJO for `T` (one that neither extends `AssistantParameter` nor is a `Map`), neither parser matches, and it fails at runtime with `IllegalStateException`.**

Additionally, the chat UI's input box is built from a schema (`AssistantMetadata.getParameter()`) that `StandardMetadataFactory` constructs by reflecting over `T`'s bean properties. The property name and structure `message` (of type `AssistantMessage` — the user's utterance lives in `message.contents`), which `AssistantParameter` (or its subclass) exposes, is a fixed platform-side contract that the chat UI relies on to bind its outgoing-message input box. **A parameter class that does not follow this contract still appears in the assistant list, but the user cannot enter a prompt.**

- If no additional parameters are needed, use `AssistantParameter` itself as `T`
- If additional parameters are needed, **subclass** `AssistantParameter` and add only extra fields annotated with `@Property` (`jp.co.intra_mart.foundation.copilot.assistant.annotation.Property`). Do not redeclare the inherited `message`/`threadId`
- Read the user's utterance string from `parameter.getMessage().getContents()` (the chat UI never writes into a custom field such as `userMessage`, even if you add one)

## `AssistantMessage`/`AssistantResult`

```java
package jp.co.intra_mart.foundation.copilot.assistant.message;

public class AssistantMessage implements java.io.Serializable {
    public AssistantMessage(String role, Object contents);
    public AssistantMessage(String role, Object contents, List<ToolCall> toolCalls, List<? extends Serializable> additional);
    public String getRole();
    public Object getContents();
    // Other getters/setters
}
```

```java
package jp.co.intra_mart.foundation.copilot.assistant.model;

public class AssistantResult {
    public AssistantResult(String id, String finishReason, AssistantMessage message);
    public static AssistantResult.AssistantResultBuilder builder();
    public String getId();
    public String getFinishReason();
    public AssistantMessage getMessage();
}
```

`AssistantResult.builder().message(new AssistantMessage("assistant", content)).finishReason(finishReason).build()` is the basic form. The builder's `message(String)` overload is a shortcut that builds an `AssistantMessage` with `role` set to `"assistant"`.

## `AssistantResponseWriter` (Streaming Responses)

```java
package jp.co.intra_mart.foundation.copilot.assistant.response;

public interface AssistantResponseWriter extends AutoCloseable {
    <T extends java.io.Serializable> void writeObject(T object) throws CopilotAssistantException;
    void writeResponse(AssistantResult result) throws CopilotAssistantException;
    void close() throws java.io.IOException;
}
```

When returning a streaming response, obtain the `AssistantResponseWriter` via `getAssistantContext().getResponseWriter()`, pass it to a `StreamingResponseHandler` implementation used with `Agent.runStreaming(...)`, and write each chunk via `writeObject`/`writeResponse`. In this case `doExecute` returns `null`, and the actual result is sent to the client via the `AssistantResponseWriter`.

## Choosing an Implementation Pattern

| Requirement | Implementation approach |
|---|---|
| An agent assembled with a fixed configuration in code (model, instruction, and tools are all known at implementation time) | Inside `doExecute`, call `Agent.builder()...build()` each time and call `run(...)` (synchronous). See `assets/copilot-agent-basic-usage.md` Pattern 8 |
| Dynamically loading an agent definition (JSON) that a user defined via Agent Designer, etc. | Build an `Agent` from the agent definition data using the platform-standard `AgentDefinitionConverter.fromDefinitionData(...)` (`jp.co.intra_mart.system.copilot.agent.definition.converter`). This path is the special-purpose one used by Agent Designer's "trial run" feature (`AgentTrialRunAssistant`); the former (fixed configuration) is often sufficient for regular application development |
| Streaming responses are required | Use `getAssistantContext().getResponseWriter()` and call `agent.runStreaming(session, message, runContext, handler)`. `handler` is a `StreamingResponseHandler` implementation that writes chunks to the `AssistantResponseWriter` |
