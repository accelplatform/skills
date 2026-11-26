# MCP Server Implementation API Reference (Java)

Based on the actual class definitions of the `im_copilot_mcp` module (`jp.co.intra_mart.foundation.copilot.mcp.*`). Do not supplement methods/attributes from memory or guesswork.

`im_copilot_mcp` is a submodule of the `im_copilot` (IM-Copilot) module, providing functionality to implement a Model Context Protocol (MCP) Streamable HTTP server purely through annotations.

## Dependency

```xml
<dependency>
  <groupId>jp.co.intra_mart</groupId>
  <artifactId>im_copilot_mcp</artifactId>
  <version>8.0.5</version>
</dependency>
```

- `im_copilot_mcp` depends on `im_copilot_core` / `im_copilot_base` (Maven resolves these automatically)
- Depending on the version of the project's parent POM (`jp.co.intra_mart:parent`), `im_copilot_mcp` may not be included in dependency management (`dependencyManagement`). In that case, explicitly specify `<version>` (omitting it causes version resolution to fail)
- Adding `im_copilot` (the aggregate artifact bundling `im_copilot_core`/`im_copilot_mcp`/`im_copilot_agent`/`im_copilot_ui`) as a dependency may or may not pull in `im_copilot_mcp`, depending on the version's submodule structure. If your use case is limited to implementing an MCP server, adding `im_copilot_mcp` directly as a dependency is more reliable

## URL Mapping

A class annotated with `@MCPServer` becomes accessible at the following URL (Streamable HTTP transport).

```
<CONTEXT_PATH>/copilot/mcp<path>
```

`<path>` is exactly the value of `@MCPServer.path()`. For example, with `path = "/development/im_logic"`, it is accessed at `http://<HOST>:<PORT>/<CONTEXT_PATH>/copilot/mcp/development/im_logic`.

## `@MCPServer` (class annotation)

```java
package jp.co.intra_mart.foundation.copilot.mcp.annotation;

public @interface MCPServer {
    String description() default ...;
    Icon[] icons() default ...;
    String instructions() default ...;
    String name();
    String path();
    String scope();
    String title() default ...;
    String version() default ...;
    String websiteUrl() default ...;
}
```

Apply this to the class that serves as the MCP server's entry point. The actual platform code (`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`) specifies only the three attributes `name`/`path`/`scope`.

- `name`: The identifying name of the MCP server (e.g., `"im-logic-mcp-server"`)
- `path`: The path used for URL mapping (in `/development/...` form; see "URL Mapping" above)
- `scope`: All actual platform code examples specify `"development"`
- `description`/`title`/`instructions`/`version`/`websiteUrl`/`icons`: Metadata for the MCP server (presumably used for client-side display and/or system instructions to the LLM, but no usage examples exist in the actual platform code)

**If multiple `@MCPServer` classes share the same `path`, the one loaded later logs a warning at registration time and overwrites the earlier one.** Design `path` values so they do not collide within the project.

## `@Tool` (method annotation)

```java
package jp.co.intra_mart.foundation.copilot.mcp.annotation;

public @interface Tool {
    ToolMetadata[] _meta() default ...;
    String description() default ...;
    Icon[] icons() default ...;
    String name();
    Class<?> outputSchema() default ...;
    jp.co.intra_mart.foundation.copilot.mcp.model.task.TaskSupportMode taskSupport() default ...;
    String title() default ...;
}
```

Apply this to `public` methods of an `@MCPServer` class. One method = one MCP tool.

- `name`: The tool name (the tool identifier visible to the MCP client/LLM. The actual platform code uses `snake_case`: `get_mapping_function`, etc.)
- `title`: A human-facing display name
- `description`: The tool's description (used by the LLM to decide whether to select the tool. Write it in detail and concretely. The actual platform code writes these in English)
- `outputSchema`/`_meta`/`taskSupport`/`icons`: No usage examples exist in the actual platform code

### Method Signature

```java
@Tool(name = "...", title = "...", description = "...")
public <return type> <method name>(final <parameter DTO type> parameter) {
    ...
}
```

- Takes exactly one argument: a DTO class representing the request parameters (a class with `SchemaProperties` annotations on its fields; described below)
- All actual platform code examples return `String` as the return type. Both a JSON string (manually serialized via Jackson `ObjectMapper`) and plain text returned as-is exist as implementation patterns (see `assets/mcp-server-basic-usage.md`)

## Parameter DTOs and Property Annotations

Define the request parameter DTO class by annotating its fields with annotations under `jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties`. The DTO class itself needs getters/setters (or Lombok `@Data`).

```java
package jp.co.intra_mart.foundation.copilot.tool.annotation;

public final class SchemaProperties {
    public @interface StringProperty {
        String description() default "";
        String[] enumValues() default {};
        String format() default "";
        int maxLength() default -1;
        int minLength() default -1;
        String name() default "";
        String pattern() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface IntegerProperty {
        String description() default "";
        int[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface NumberProperty {
        String description() default "";
        double[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface BooleanProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface EnumProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface ObjectProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
        String summary() default "";
    }

    public @interface ArrayProperty {
        SchemaArrayItemProperties.ItemArrayProperty arrayItems() default ...;
        String description() default "";
        SchemaArrayItemProperties.ItemIntegerProperty integerItems() default ...;
        int maxItems() default -1;
        int minItems() default -1;
        String name() default "";
        SchemaArrayItemProperties.ItemNumberProperty numberItems() default ...;
        boolean required() default false;
        SchemaArrayItemProperties.ItemStringProperty stringItems() default ...;
        String summary() default "";
    }
}
```

- `name`: Specify this if you want the JSON/MCP property name to differ from the field name (the field name is used as-is if omitted)
- `required`: Whether to expose this as a required field in the MCP tool's input schema
- `description`: Used by the LLM to understand what the parameter is for. Write it concretely
- `summary`: Shown as the input parameter's description in the admin screen for built-in tools of Copilot agents (it is not included in the MCP tool's input schema). If you specify a message key, the message for the locale is shown (otherwise the string is shown as written)
- The numeric types (`IntegerProperty`/`NumberProperty`) have both `minimum`/`maximum` (inclusive bounds) and `exclusiveMinimum`/`exclusiveMaximum` (exclusive bounds)
- `ArrayProperty` specifies constraints per array element type via `stringItems`/`integerItems`/`numberItems`/`arrayItems` (2D arrays). Each `Item*Property` is under `SchemaArrayItemProperties` (it has no `name`/`description`/`required`, since an element itself has no notion of a name or a required flag)

### `SchemaArrayItemProperties` (array element constraints)

```java
package jp.co.intra_mart.foundation.copilot.tool.annotation;

public final class SchemaArrayItemProperties {
    public @interface ItemStringProperty {
        String[] enumValues() default {};
        String format() default "";
        int maxLength() default -1;
        int minLength() default -1;
        String pattern() default "";
    }

    public @interface ItemIntegerProperty {
        int[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
    }

    public @interface ItemNumberProperty {
        double[] enumValues() default {};
        double exclusiveMaximum() default Double.POSITIVE_INFINITY;
        double exclusiveMinimum() default Double.NEGATIVE_INFINITY;
        double maximum() default Double.POSITIVE_INFINITY;
        double minimum() default Double.NEGATIVE_INFINITY;
    }

    public @interface ItemArrayProperty {
        ItemIntegerProperty integerItems() default ...;
        int maxItems() default -1;
        int minItems() default -1;
        ItemNumberProperty numberItems() default ...;
        ItemStringProperty stringItems() default ...;
    }
}
```

**Note (from the `SchemaProperties` javadoc)**: "The annotations let you specify constraints, but whether a given constraint is actually enforced depends on the AI service/model." — Constraints such as `minLength`/`pattern`/`enumValues` are exposed to the MCP client as a JSON schema, but whether they are actually enforced depends on the implementation of the connected AI service/model.

## Registering the MCP Server (Making the Platform Recognize It)

An `@MCPServer` class is registered with the platform when its fully-qualified name is listed in `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` (the file name itself is the fully-qualified name of the annotation). Requests to a `path` that is not listed return 404.

```
jp.co.intra_mart.sample.example.mcp.SampleMcpServer
```

- This file is generated automatically at build time by the annotation processor `jp.co.intra_mart.tools:im_service_annotation_processor` (`javax.annotation.processing.Processor` SPI). Because `im_copilot_mcp` registers `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` in `META-INF/im_services/annotations`, classes annotated with `@MCPServer` are listed in the index
- The processor is included in the dependencies of `im_core_base` (compile scope), so it is transitively on the compile-time classpath even in a project that depends only on `im_copilot_mcp` (`im_copilot_mcp` → `im_copilot_core` → `im_master` → … → `im_core_base`)
- If it is not generated, for example because the annotation processor is disabled (`<proc>none</proc>` in `maven-compiler-plugin`, etc.), create the same file manually under `src/main/resources` and write the fully-qualified names one per line. In that case you must add a line each time you add an `@MCPServer` class
- The mechanism that reads the index (`WebAppClassScanner#findClassesWithAnnotation`) is not specific to `@MCPServer`; it is shared by scans for other annotations as well
- Do not use `jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory` (package specification registered via `META-INF/services`); it is a non-public API

## `@Resource` / `@Prompt` / `@Completion` (MCP Primitives Other Than Tool)

Besides `@Tool`, methods of an `@MCPServer` class can also be annotated with `@Resource` (a resource definition) or `@Prompt` (a prompt template definition); the `@MCPServer` initialization process checks each method in the order `@Prompt` → `@Resource` and registers it as the corresponding MCP primitive (`@Completion` is used to provide completion candidates for `@Resource`/`@Prompt`). Their attributes are as follows.

```java
package jp.co.intra_mart.foundation.copilot.mcp.annotation;

public @interface Resource {
    Annotations[] annotations() default ...;
    String description() default "";
    Icon[] icons() default ...;
    String mimeType() default "";
    String name();
    long size() default ...;
    String title() default "";
    String uri();
}

public @interface Prompt {
    PromptArgument[] arguments() default ...;
    String description() default "";
    Icon[] icons() default ...;
    String name();
    String title() default "";
}

public @interface PromptArgument {
    String description() default "";
    String name();
    boolean required() default false;
    String title() default "";
}

public @interface Completion {
    String prompt() default "";
    String resource() default "";
}

public @interface Annotations {
    jp.co.intra_mart.foundation.copilot.mcp.model.Role[] audience() default ...;
    String lastModified() default "";
    double priority() default ...;
}

public @interface Icon {
    String mimeType() default "";
    String[] sizes() default {};
    String src();
}
```

All of the actual platform code (`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`) uses `@Tool` only; no implementation examples of `@Resource`/`@Prompt`/`@Completion` have been found. The attribute signatures above are solid facts based on the actual class definitions (bytecode), but concrete implementation patterns are out of scope for `assets/mcp-server-basic-usage.md`.
