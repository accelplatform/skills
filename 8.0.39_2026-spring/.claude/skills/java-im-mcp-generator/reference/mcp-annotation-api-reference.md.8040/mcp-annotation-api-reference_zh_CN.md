# MCP 服务器实现 API 参考（Java 版）

基于 `im_copilot_mcp` 模块（`jp.co.intra_mart.foundation.copilot.mcp.*` / `jp.co.intra_mart.system.copilot.mcp.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

`im_copilot_mcp` 是 `im_copilot`（IM-Copilot）模块的子模块，提供仅通过注解即可实现 Model Context Protocol（MCP）Streamable HTTP 服务器的功能。

## 依赖关系

```xml
<dependency>
  <groupId>jp.co.intra_mart</groupId>
  <artifactId>im_copilot_mcp</artifactId>
  <version>8.0.5</version>
</dependency>
```

- `im_copilot_mcp` 依赖于 `im_copilot_core` / `im_copilot_base`（Maven 会自动解析）
- 根据项目父 POM（`jp.co.intra_mart:parent`）的版本不同，`im_copilot_mcp` 有可能未包含在依赖管理（`dependencyManagement`）中。此时须显式指定 `<version>`（省略会导致版本解析失败）
- 将 `im_copilot`（汇总构件，包含 `im_copilot_core`/`im_copilot_mcp`/`im_copilot_agent`/`im_copilot_ui`）添加为依赖时，是否能获得 `im_copilot_mcp` 取决于该版本的子模块构成。若用途仅限于实现 MCP 服务器，直接依赖 `im_copilot_mcp` 更为可靠

## URL 映射

标注了 `@MCPServer` 的类可通过以下 URL 访问（Streamable HTTP 传输）。

```
<CONTEXT_PATH>/copilot/mcp<path>
```

`<path>` 即为 `@MCPServer.path()` 的值本身。例如 `path = "/development/im_logic"` 时，访问地址为 `http://<HOST>:<PORT>/<CONTEXT_PATH>/copilot/mcp/development/im_logic`。

## `@MCPServer`（类注解）

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

标注于作为 MCP 服务器入口点的类。实际平台代码（`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`）均仅指定了 `name`/`path`/`scope` 三个属性。

- `name`：MCP 服务器的标识名（如 `"im-logic-mcp-server"`）
- `path`：用于 URL 映射的路径（`/development/...` 形式，参见上文「URL 映射」）
- `scope`：实际平台代码的所有示例均指定为 `"development"`
- `description`/`title`/`instructions`/`version`/`websiteUrl`/`icons`：MCP 服务器的元数据（推测用于客户端显示、向 LLM 提供系统指示等，但实际平台代码中没有使用示例）

**若存在多个具有相同 `path` 的 `@MCPServer` 类，后加载的一方会在注册时输出警告日志并覆盖先前的。** 设计时应确保项目内 `path` 不重复。

## `@Tool`（方法注解）

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

标注于 `@MCPServer` 类的 `public` 方法。1 个方法 = 1 个 MCP 工具。

- `name`：工具名（MCP 客户端・LLM 可见的工具标识符。实际平台代码使用 `snake_case`：如 `get_mapping_function`）
- `title`：面向人类的显示名
- `description`：工具的说明（供 LLM 判断是否选择该工具使用。应详细具体地编写。实际平台代码中以英语书写）
- `outputSchema`/`_meta`/`taskSupport`/`icons`：实际平台代码中没有使用示例

### 方法签名

```java
@Tool(name = "...", title = "...", description = "...")
public <返回类型> <方法名>(final <参数DTO类型> parameter) {
    ...
}
```

- 参数为 1 个：表示请求参数的 DTO 类（在字段上标注 `SchemaProperties` 各注解的类，详见下文）
- 实际平台代码的所有示例均返回 `String` 类型。既有返回 JSON 字符串（通过 Jackson `ObjectMapper` 手动序列化）的实现，也有直接原样返回纯文本的实现（参见 `assets/mcp-server-basic-usage.md`）

## 参数 DTO 与属性注解

请求参数 DTO 类通过在字段上标注 `jp.co.intra_mart.foundation.copilot.tool.annotation.SchemaProperties` 下的各注解来定义。DTO 类本身需要 getter/setter（或 Lombok `@Data`）。

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
    }

    public @interface BooleanProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
    }

    public @interface EnumProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
    }

    public @interface ObjectProperty {
        String description() default "";
        String name() default "";
        boolean required() default false;
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
    }
}
```

- `name`：希望 JSON/MCP 上的属性名与字段名不同时指定（省略时直接使用字段名）
- `required`：是否在 MCP 工具的输入模式中公开为必填项
- `description`：供 LLM 理解参数用途。应具体编写
- 数值类型（`IntegerProperty`/`NumberProperty`）同时具有 `minimum`/`maximum`（含边界值）与 `exclusiveMinimum`/`exclusiveMaximum`（不含边界值）
- `ArrayProperty` 通过 `stringItems`/`integerItems`/`numberItems`/`arrayItems`（二维数组）按数组元素类型指定约束。各 `Item*Property` 位于 `SchemaArrayItemProperties` 下（不含 `name`/`description`/`required`，因为元素本身没有名称或必填标志的概念）

### `SchemaArrayItemProperties`（数组元素的约束）

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

**注意（引用自 `SchemaProperties` 的 javadoc）**：「虽然注解可以指定约束，但约束是否实际生效取决于所连接的 AI 服务・模型。」— `minLength`/`pattern`/`enumValues` 等约束会作为 JSON Schema 公开给 MCP 客户端，但是否真正被强制执行取决于所连接的 AI 服务・模型的具体实现。

## MCP 服务器的注册（使平台识别）

仅标注 `@MCPServer`/`@Tool` 并不会被平台识别。**必须通过以下任一方式明确注册。**

### 方式 A：通过 `McpScanPackageFactory` 进行包扫描（推荐）

```java
package jp.co.intra_mart.system.copilot.mcp.annotation;

public interface McpScanPackageFactory {
    Collection<String> getTargetPackages();
}
```

创建实现该接口的类，并按照 `java.util.ServiceLoader` 的标准规约进行注册（在 `META-INF/services/jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory` 中以一行记载实现类的完全限定名）。平台启动时，会自动扫描 `getTargetPackages()` 返回的包下标注了 `@MCPServer` 的类。

- 与 IM-LogicDesigner 的 `ElementScanPackageFactory`（参见 `java-im-logic-generator` 技能）采用相同的设计思路。新增 `@MCPServer` 类时无需再次进行此注册（只需放置在目标包下即可）
- 项目中拥有一个即可（可覆盖多个 `@MCPServer` 类）

### 方式 B：通过 `META-INF/im_services/annotation_classes` 进行显式注册

在名为 `META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer` 的文件（文件名本身即为该注解的完全限定名）中，逐行记载标注了 `@MCPServer` 的类的完全限定名。

```
jp.co.intra_mart.sample.example.mcp.SampleMcpServer
```

- 与方式 A 扫描整个类路径不同，此方式仅以列出的类为对象。**每次新增 `@MCPServer` 类时都必须追加到该文件中**
- 读取此文件的平台内部实现（`WebAppClassScanner#findClassesWithAnnotation`）是跨注解扫描通用的机制，并非 `@MCPServer` 专用
- 若编译时类路径中存在 `jp.co.intra_mart.tools:im_service_annotation_processor`，javac 的注解处理（`javax.annotation.processing.Processor` SPI）会生效，针对标注了 `@MCPServer` 的类**在构建时自动生成此文件**（无需手动编写）。但 `im_service_annotation_processor` 本身并非 `im_copilot_mcp` 的依赖项，只有在同时使用 `im_workflow` 等其他模块时，才可能作为偶然的传递依赖存在。在仅依赖 `im_copilot_mcp` 的最小化项目中，该文件可能不会被自动生成。**不要假定其必然存在，需要时应通过方式 A 或手动编写该文件进行明确注册**

**两种方式并非互斥，可以并用**（同一个类同时出现在两处也不会造成重复注册）。新项目中，建议**以方式 A（`McpScanPackageFactory`）为基本方案**，因其不受依赖构成影响，遗漏注册的风险更低。

## `@Resource` / `@Prompt` / `@Completion`（Tool 以外的 MCP 原语）

除 `@Tool` 之外，`@MCPServer` 类的方法上还可以标注 `@Resource`（资源定义）・`@Prompt`（提示词模板定义）；`@MCPServer` 的初始化处理会按 `@Prompt` → `@Resource` 的顺序对每个方法进行判定，并注册为对应的 MCP 原语（`@Completion` 用于为 `@Resource`/`@Prompt` 提供补全候选）。其属性如下。

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

实际平台代码（`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`）均仅使用 `@Tool`，未能确认 `@Resource`/`@Prompt`/`@Completion` 的实现示例。上述属性签名是基于实际类定义（字节码）得出的确切信息，但具体的实现模式不在 `assets/mcp-server-basic-usage.md` 的覆盖范围内。
