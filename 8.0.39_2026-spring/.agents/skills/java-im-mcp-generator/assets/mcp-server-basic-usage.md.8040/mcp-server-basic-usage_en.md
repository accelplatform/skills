# MCP Server Implementation Patterns (Java)

A collection of implementation patterns using `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`/`Tool`. Extracted from the actual, currently-running platform classes (`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`). Refer to `reference/mcp-annotation-api-reference.md` for the exact attribute signatures.

## Class Structure (Recommended Layering)

In every actual platform class, the MCP server's entry-point class (`@MCPServer`) itself only handles receiving requests, converting parameters, and converting to JSON; the business logic is factored out into a separate class.

```
XxxMcpServer (@MCPServer. The @Tool method's front door — only delegates the parameter to the implementation class and converts the return value)
    ↓
XxxMcpTool{ToolName} (one class per tool; run(parameter) holds the business logic itself)
    ↓
(Platform APIs, or your own project's Service/Repository, etc.)
```

- `.agents/requirements/java-naming/AGENTS.md` has no MCP-specific naming rule. This skill follows the naming used in the actual platform classes: `Xxx` + `McpServer` for the entry-point class, `Xxx` + `McpTool` + `{ToolName (PascalCase)}` for the tool implementation class, and the same name + `Parameter` for the parameter DTO
- For a simple tool (whose logic fits in a few lines), it is fine to implement it directly inside the `@Tool` method of `XxxMcpServer` (the `StagedLogsMcpServer`/`FrontendFixMcpServer` pattern). For more complex logic, separate it into an implementation class (the `LogicMcpServer`/`WorkflowMcpServer` pattern)

## Pattern 1: Minimal Configuration (One Tool, One Parameter)

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer;
import jp.co.intra_mart.foundation.copilot.mcp.annotation.Tool;

@MCPServer(name = "foo-mcp-server", path = "/development/foo", scope = "development")
public class FooMcpServer {

    @Tool(name = "get_foo", title = "Foo Detail", description = "Returns the detailed information of the foo matching the specified id.")
    public String getFoo(final GetFooParameter parameter) {
        return new FooMcpToolGetFoo().run(parameter);
    }
}
```

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.StringProperty;

public class GetFooParameter {

    @StringProperty(description = "Foo ID.", required = true)
    private String id;

    public GetFooParameter() {
        super();
    }

    public String getId() {
        return id;
    }

    public void setId(final String id) {
        this.id = id;
    }
}
```

```java
package jp.co.example.foo.mcp;

import com.fasterxml.jackson.databind.ObjectMapper;

public class FooMcpToolGetFoo {

    private static final ObjectMapper JSON = new ObjectMapper();

    public String run(final GetFooParameter parameter) {
        // The business logic itself (platform API calls, etc.)
        final Foo foo = FooRepository.findById(parameter.getId());
        try {
            return JSON.writeValueAsString(foo);
        } catch (final Exception e) {
            throw new RuntimeException("Failed to serialize response to JSON", e);
        }
    }
}
```

**`SchemaProperties` annotations work both with Lombok `@Data` and with explicitly written getters/setters.** If you don't use Lombok (i.e., the intra-mart project has no Lombok dependency), write the getters/setters explicitly as shown above.

## Pattern 2: Multiple Property Types (String / Integer / Boolean / Array)

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.ArrayProperty;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.BooleanProperty;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.IntegerProperty;
import jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties.StringProperty;

public class SearchFooParameter {

    @StringProperty(description = "Search keyword.", required = true, enumValues = { "draft", "published" })
    private String status;

    @IntegerProperty(description = "Maximum number of results.", minimum = 1, maximum = 100)
    private int limit;

    @BooleanProperty(description = "Whether to include archived items.")
    private boolean includeArchived;

    @ArrayProperty(description = "Tags to exclude from the search.")
    private String[] excludeTags;

    // getters/setters omitted
}
```

- Specifying `enumValues` restricts the choices in the MCP tool's input schema (whether it is actually enforced depends on the connected AI service/model)
- Use `@IntegerProperty` for primitive `int`/`long` fields, and `@BooleanProperty` for `boolean`
- Use `@ArrayProperty` for arrays (`String[]`, `List<String>`, etc.). If per-element constraints (string length, pattern, etc.) are needed, specify `stringItems`/`integerItems`/`numberItems` (see `reference/mcp-annotation-api-reference.md`)

## Pattern 3: Using Platform Context (Locale, User Information)

MCP tool implementations can call platform APIs (`Contexts`/`MessageManager`, etc.) just like regular Java code.

```java
package jp.co.example.foo.mcp;

import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;
import jp.co.intra_mart.foundation.security.exception.AccessSecurityException;
import jp.co.intra_mart.foundation.security.message.MessageManager;

public class FooMcpToolGetFoo {

    public String run(final GetFooParameter parameter) {
        final AccountContext accountContext = Contexts.get(AccountContext.class);
        final String userCd = accountContext.getUserCd();

        try {
            // Retrieve a message according to the user's locale (see the java-im-message-usage skill)
            final String label = MessageManager.getInstance().getMessage("CAP.Z.APP.FOO.LABEL");
            return label + ": " + userCd;
        } catch (final AccessSecurityException e) {
            throw new IllegalStateException("Failed to resolve message.", e);
        }
    }
}
```

## Pattern 4: Registration with the Platform (`META-INF/im_services/annotation_classes`)

An `@MCPServer` class is registered with the platform when its fully-qualified name is listed in `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` (the file name is the fully-qualified name of the annotation itself).

This file is generated automatically at build time by the annotation processor (`jp.co.intra_mart.tools:im_service_annotation_processor`), so you do not need to write it. The processor is put on the compile-time classpath by the dependencies of `im_copilot_mcp` (via `im_core_base`). After building, confirm that the file has been generated in `target/classes` (or the jar) and lists the fully-qualified name of the `@MCPServer` class, as follows.

```
jp.co.example.foo.mcp.FooMcpServer
```

Only when it is not generated, for example because the annotation processor is disabled (`<proc>none</proc>` in `maven-compiler-plugin`, etc.), create `src/main/resources/META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` manually and write the fully-qualified names of the `@MCPServer` classes one per line. In that case you must add a line each time you add an `@MCPServer` class; a missing entry makes the endpoint return 404.

Do not use `jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory`; it is a non-public API.

## Notes

- **Registration is done through the `META-INF/im_services/annotation_classes` index (Pattern 4).** Confirm that the index has been generated after building
- **Do not create multiple `@MCPServer` classes with the same `path`.** The one loaded later logs a warning and overwrites the earlier one
- **A `@Tool` method takes exactly one argument.** If multiple parameters are needed, combine them into a single DTO class (with `SchemaProperties` annotations on its fields) taken as the one argument
- **A DTO field without a `SchemaProperties` annotation is not exposed in the MCP tool's input schema.** Having a getter/setter is not enough — the corresponding annotation must be present
- The return type of a `@Tool` method is `String` (following the actual platform classes' implementation pattern). To return JSON, explicitly serialize it (e.g., with Jackson `ObjectMapper`) — there is no automatic wrapping like Web API Maker's
- Explicitly pin the version for the `im_copilot_mcp` Maven dependency (see "Dependency" in `reference/mcp-annotation-api-reference.md`)
