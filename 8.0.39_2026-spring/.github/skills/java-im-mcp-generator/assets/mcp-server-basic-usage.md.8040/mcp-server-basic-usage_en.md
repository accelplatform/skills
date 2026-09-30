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

- `.github/instructions/java-naming.instructions.md` has no MCP-specific naming rule. This skill follows the naming used in the actual platform classes: `Xxx` + `McpServer` for the entry-point class, `Xxx` + `McpTool` + `{ToolName (PascalCase)}` for the tool implementation class, and the same name + `Parameter` for the parameter DTO
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

## Pattern 4: Package Registration (`McpScanPackageFactory`, Recommended)

Create a single package-designating class for the project (it can cover multiple `@MCPServer` classes at once).

```java
package jp.co.example.foo.mcp;

import java.util.Collection;
import java.util.Collections;

import jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory;

public class FooMcpScanPackageFactory implements McpScanPackageFactory {

    @Override
    public Collection<String> getTargetPackages() {
        return Collections.singletonList("jp.co.example.foo.mcp");
    }
}
```

In `src/main/resources/META-INF/services/jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory`, write the fully-qualified name of the class above on a single line.

```
jp.co.example.foo.mcp.FooMcpScanPackageFactory
```

From then on, simply adding `@MCPServer` classes under the `jp.co.example.foo.mcp` package automatically makes them a scan target — no need to edit the configuration file for each addition.

## Pattern 5: Explicit Registration (`META-INF/im_services/annotation_classes`, Alternative)

If you don't want to scan an entire package, or prefer not to use `McpScanPackageFactory`, list the `@MCPServer` classes' fully-qualified names directly.

`src/main/resources/META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` (the filename itself is the annotation's fully-qualified name):

```
jp.co.example.foo.mcp.FooMcpServer
```

**With this method, remember to update this file every time a new `@MCPServer` class is added.** Forgetting to do so means it never gets registered, and the endpoint returns 404 (the same kind of failure as forgetting to update Web API Maker's `META-INF/im_web_api_maker/packages`).

## Notes

- **Simply adding `@MCPServer`/`@Tool` does not make it work.** Register it using either Pattern 4 or Pattern 5
- **Do not create multiple `@MCPServer` classes with the same `path`.** The one loaded later logs a warning and overwrites the earlier one
- **A `@Tool` method takes exactly one argument.** If multiple parameters are needed, combine them into a single DTO class (with `SchemaProperties` annotations on its fields) taken as the one argument
- **A DTO field without a `SchemaProperties` annotation is not exposed in the MCP tool's input schema.** Having a getter/setter is not enough — the corresponding annotation must be present
- The return type of a `@Tool` method is `String` (following the actual platform classes' implementation pattern). To return JSON, explicitly serialize it (e.g., with Jackson `ObjectMapper`) — there is no automatic wrapping like Web API Maker's
- Explicitly pin the version for the `im_copilot_mcp` Maven dependency (see "Dependency" in `reference/mcp-annotation-api-reference.md`)
