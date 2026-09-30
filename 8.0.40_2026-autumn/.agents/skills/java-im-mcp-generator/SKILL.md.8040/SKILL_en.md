---
name: java-im-mcp-generator
description: Implements a new MCP (Model Context Protocol) server running on intra-mart Accel Platform in Java (JavaEE development model). Provides implementation patterns for a Streamable HTTP MCP server using the `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`/`Tool` annotations from the `im_copilot_mcp` module, tool parameter definitions via `SchemaProperties`, and registration with the platform via `McpScanPackageFactory`/`META-INF/im_services/annotation_classes`. Use this when the user mentions building an MCP server in Java, implementing an MCP server on intra-mart, using `@MCPServer`/`@Tool`, or exposing tools for AI agents in the JavaEE development model.
---

# intra-mart MCP Server Implementation Support Skill (Java)

## Purpose

A skill set that supports implementing MCP (Model Context Protocol) servers (Streamable HTTP transport) purely through annotations (`@MCPServer`/`@Tool`) provided by intra-mart Accel Platform's `im_copilot_mcp` module.

**This skill only handles Java source files (`.java`) and the registration configuration files (`META-INF/services/*` or `META-INF/im_services/annotation_classes/*`).**

## Basic Concept of an MCP Server (Important)

A Java class annotated with `@MCPServer` functions as a single MCP server. Any `public` method inside that class annotated with `@Tool` is exposed as an MCP tool.

```
@MCPServer class (1 class = 1 MCP server = 1 URL)
├── @Tool method 1 (1 method = 1 MCP tool)
├── @Tool method 2
└── ...
```

- The URL maps to `<CONTEXT_PATH>/copilot/mcp<path>` (`path` is the value of `@MCPServer.path()`)
- A tool's input parameters are represented by a single DTO class whose fields carry `SchemaProperties` annotations (`StringProperty`/`IntegerProperty`/`BooleanProperty`/`NumberProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`)
- **Simply adding the annotations does not make the platform recognize them.** You must explicitly register the class via either `McpScanPackageFactory` (recommended) or `META-INF/im_services/annotation_classes` (see "Registering the MCP Server")

Always consult `reference/mcp-annotation-api-reference.md` for the detailed attribute signatures and registration methods (do not rely on memory or guesswork).

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method Javadoc |

There is no dedicated convention under `.agents/requirements` for MCP server implementation. Follow the naming convention observed in the platform's own implementations, documented in "Class Structure" in `assets/mcp-server-basic-usage.md` (`Xxx` + `McpServer`, `Xxx` + `McpTool` + `{ToolName}`).

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

`@MCPServer`/`@Tool` belong to the `jp.co.intra_mart.foundation.copilot.mcp.annotation` package (`im_copilot_mcp` module). `SchemaProperties`/`SchemaArrayItemProperties`, used to define parameters, belong to the `jp.co.intra_mart.foundation.copilot.tool.annotation` package. Always consult `reference/mcp-annotation-api-reference.md` for the detailed attribute signatures (do not rely on memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|--------------------|----------|---------|
| The MCP server entry-point class (`@MCPServer`) | `assets/mcp-server-basic-usage.md` Pattern 1 | Minimal implementation example |
| Tool parameter DTOs (various `SchemaProperties`) | `assets/mcp-server-basic-usage.md` Pattern 2 | Usage examples for the String/Integer/Boolean/Array property types |
| Tool implementations using platform context | `assets/mcp-server-basic-usage.md` Pattern 3 | Integration with `Contexts`/`MessageManager` |
| Package registration (`McpScanPackageFactory`) | `assets/mcp-server-basic-usage.md` Pattern 4 | The recommended registration method |
| Explicit registration (`META-INF/im_services/annotation_classes`) | `assets/mcp-server-basic-usage.md` Pattern 5 | The alternative registration method |

### Reference

- `reference/mcp-annotation-api-reference.md` — All attributes and signatures for `@MCPServer`/`@Tool`/`SchemaProperties`/`SchemaArrayItemProperties`/`McpScanPackageFactory`, the dependency declaration, the URL mapping, and the registration methods (based on the actual class definitions/bytecode of the `im_copilot_mcp` module; do not write from memory).

## When to Use

Use this skill when the user makes a request such as:
- "I want to build an MCP server in Java"
- "I want to implement an MCP server running on intra-mart"
- "I want to use `@MCPServer`/`@Tool`"
- "I want to expose tools for AI agents in the JavaEE development model"

If it's not explicitly stated that this is for an MCP server or Java annotations, and the user simply says "I want to build a REST API," confirm with the user whether this is for exposing tools to an MCP client (an AI agent) or a regular REST API. For a regular REST API (Web API Maker), use `java-im-web-api-maker-usage` instead.

## Implementation Steps

1. Gather requirements from the user (the MCP server's `path` (part of the URL), the list of tools to expose, each tool's input parameters and processing)
2. Design the package and class names (following `.agents/requirements/java-naming/AGENTS.md`. The entry-point class is `Xxx` + `McpServer`; tool implementation classes are `Xxx` + `McpTool` + `{ToolName}`, plus `Parameter` where needed)
3. Add a dependency on `im_copilot_mcp` to `pom.xml` (with an explicit version — see "Dependency" in `reference/mcp-annotation-api-reference.md`). If the project already has this dependency, reuse it rather than adding a duplicate
4. Implement the `@MCPServer` class, the tool implementation classes, and the parameter DTOs by consulting `assets/mcp-server-basic-usage.md` (always consult `reference/mcp-annotation-api-reference.md` for the attribute signatures; do not write from memory or guesswork)
5. **Register the MCP server (never skip this).** If the project already has a `McpScanPackageFactory` implementation, simply place the new class under its target package. Otherwise, create one following Pattern 4 in `assets/mcp-server-basic-usage.md`
6. Verify compliance with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## Notes

- **Simply adding `@MCPServer`/`@Tool` does not make it work.** Always perform "Registering the MCP Server" (`McpScanPackageFactory` or `META-INF/im_services/annotation_classes`). Always check this during post-generation verification
- **Do not create multiple `@MCPServer` classes with the same `path`.** Design `path` values so they don't collide within the project
- **A `@Tool` method takes exactly one argument (the parameter DTO).** Combine multiple input values into fields of that DTO
- **If a DTO field is missing its `SchemaProperties` annotation, it will not be exposed in the MCP tool's input schema.** Having a getter/setter alone is not enough
- The return type of a `@Tool` method is `String`. If you want to return JSON, serialize it explicitly (e.g., with Jackson) — there is no automatic response wrapping like Web API Maker's
- Explicitly pin the version for the `im_copilot_mcp` Maven dependency (it may not be included in the parent POM's dependency management)

## Post-Generation Verification

Rather than an automated validation script, verify the following items manually.

1. Whether the `@MCPServer` class is under the target package of a `McpScanPackageFactory`, or its fully-qualified name is listed in `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`
2. Whether `path` does not collide with another `@MCPServer` class in the project
3. Whether every field of the parameter DTO carries the `SchemaProperties` annotation appropriate to its purpose (`StringProperty`/`IntegerProperty`/`BooleanProperty`/`NumberProperty`/`EnumProperty`/`ObjectProperty`/`ArrayProperty`)
4. Whether `required` is set on parameters that should be mandatory
5. Whether the `@Tool`'s `description` is specific enough for an LLM to judge the tool's purpose and when to use it
6. Whether the code complies with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
7. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|-----------------|------------------|
| **MCP server implementation in Java (JavaEE development model) (`@MCPServer`/`@Tool`)** | **This skill** |
| Regular REST APIs in Java (JavaEE development model) (Web API Maker) | `java-im-web-api-maker-usage` |
| IM-LogicDesigner extension task implementation in Java (JavaEE development model) (a registration pattern similar to `ElementScanPackageFactory`) | `java-im-logic-generator` |
