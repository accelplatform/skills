# MCP 服务器实现模式（Java 版）

使用 `jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`/`Tool` 的实现模式集合。提炼自实际正在运行的平台类（`LogicMcpServer`/`WorkflowMcpServer`/`FrontendFixMcpServer`/`StagedLogsMcpServer`）的实现。属性的准确签名请参照 `reference/mcp-annotation-api-reference.md`。

## 类结构（推荐的分层结构）

所有实际平台类均将 MCP 服务器的入口类（`@MCPServer`）本身仅用于接收请求、转换参数、转换为 JSON，而将业务逻辑拆分到单独的类中。

```
XxxMcpServer（@MCPServer。@Tool 方法的入口——仅将参数委托给实现类，并转换返回值）
    ↓
XxxMcpTool{ToolName}（每个工具一个类，run(parameter) 承载业务逻辑本身）
    ↓
（平台 API、或自身项目的 Service/Repository 等）
```

- `.github/instructions/java-naming.instructions.md` 中没有 MCP 专用的命名规约。本技能遵循实际平台类中所使用的命名方式：入口类为 `Xxx` + `McpServer`，工具实现类为 `Xxx` + `McpTool` + `{ToolName（帕斯卡命名法）}`，参数 DTO 为同名 + `Parameter`
- 对于逻辑简单（几行即可完成）的工具，可以直接在 `XxxMcpServer` 的 `@Tool` 方法内实现（`StagedLogsMcpServer`/`FrontendFixMcpServer` 的模式）。逻辑复杂时应拆分到实现类中（`LogicMcpServer`/`WorkflowMcpServer` 的模式）

## 模式 1：最小构成（1 个工具，1 个参数）

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
        // 业务逻辑本体（调用平台 API 等）
        final Foo foo = FooRepository.findById(parameter.getId());
        try {
            return JSON.writeValueAsString(foo);
        } catch (final Exception e) {
            throw new RuntimeException("Failed to serialize response to JSON", e);
        }
    }
}
```

**`SchemaProperties` 的注解在使用 Lombok `@Data` 和显式编写 getter/setter 两种情况下均可正常工作。** 若项目未使用 Lombok（intra-mart 项目中没有 Lombok 依赖），则如上所示显式编写 getter/setter。

## 模式 2：多种属性类型（String / Integer / Boolean / Array）

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

    // getter/setter 省略
}
```

- 指定 `enumValues` 后，MCP 工具的输入模式中会限制可选项（是否实际生效取决于所连接的 AI 服务・模型）
- 对 `int`/`long` 等基本类型字段使用 `@IntegerProperty`，对 `boolean` 使用 `@BooleanProperty`
- 对数组（`String[]`/`List<String>` 等）使用 `@ArrayProperty`。若需要按元素类型指定约束（字符串长度、正则表达式等），可指定 `stringItems`/`integerItems`/`numberItems`（参见 `reference/mcp-annotation-api-reference.md`）

## 模式 3：使用平台上下文（区域设置・用户信息）

在 MCP 工具的实现中，也可以像普通 Java 实现一样调用平台 API（`Contexts`/`MessageManager` 等）。

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
            // 获取与用户区域设置对应的消息（参见 java-im-message-usage 技能）
            final String label = MessageManager.getInstance().getMessage("CAP.Z.APP.FOO.LABEL");
            return label + ": " + userCd;
        } catch (final AccessSecurityException e) {
            throw new IllegalStateException("Failed to resolve message.", e);
        }
    }
}
```

## 模式 4：包注册（`McpScanPackageFactory`，推荐）

为项目创建一个包指定类（可覆盖多个 `@MCPServer` 类）。

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

在 `src/main/resources/META-INF/services/jp.co.intra_mart.system.copilot.mcp.annotation.McpScanPackageFactory` 中，以一行记载上述类的完全限定名。

```
jp.co.example.foo.mcp.FooMcpScanPackageFactory
```

此后，只需在 `jp.co.example.foo.mcp` 包下添加 `@MCPServer` 类，即可自动成为扫描对象，无需每次都修改配置文件。

## 模式 5：显式注册（`META-INF/im_services/annotation_classes`，备选方案）

若不希望将整个包设为扫描对象，或方针上不使用 `McpScanPackageFactory`，可直接列出 `@MCPServer` 类的完全限定名。

`src/main/resources/META-INF/im_services/annotation_classes/jp.co.intra_mart.foundation.copilot.mcp.annotation.MCPServer`（文件名本身即为该注解的完全限定名）：

```
jp.co.example.foo.mcp.FooMcpServer
```

**采用此方式时，每次新增 `@MCPServer` 类都不要忘记追加到该文件中。** 遗漏追加即意味着未注册成功，端点会返回 404（与遗漏更新 Web API Maker 的 `META-INF/im_web_api_maker/packages` 属于同类失败模式）。

## 注意事项

- **仅添加 `@MCPServer`/`@Tool` 并不会生效。** 须通过模式 4 或模式 5 之一进行注册
- **不要创建多个具有相同 `path` 的 `@MCPServer` 类。** 后加载的一方会输出警告日志并覆盖先前的
- **`@Tool` 方法只能接受一个参数。** 若需要多个输入值，应将其汇总到一个 DTO 类（在字段上标注 `SchemaProperties`）中，作为唯一参数传入
- **DTO 字段若未标注 `SchemaProperties`，则不会在 MCP 工具的输入模式中公开。** 仅有 getter/setter 是不够的，必须存在对应的注解
- `@Tool` 方法的返回值类型为 `String`（遵循实际平台类的实现模式）。若要返回 JSON，需显式序列化（如使用 Jackson `ObjectMapper`）——不存在类似 Web API Maker 那样的自动包装
- `im_copilot_mcp` 的 Maven 依赖须显式指定版本（参见 `reference/mcp-annotation-api-reference.md` 中的「依赖关系」）
