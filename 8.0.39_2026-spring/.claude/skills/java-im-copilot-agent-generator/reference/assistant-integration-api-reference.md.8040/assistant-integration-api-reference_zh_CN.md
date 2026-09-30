# Assistant 框架对接 API 参考手册（Java 版）

基于 `im_copilot_core` 模块（`jp.co.intra_mart.foundation.copilot.assistant.*`）的实际类定义。不要凭记忆或推测补充方法・属性。

`Agent`/`AgentBuilder` 是不依赖 Assistant 框架的普通 Java API，单独也可从 Web API Maker 端点或作业中直接使用（参照 `reference/agent-core-api-reference.md`）。**仅当需要与 IM-Copilot 的聊天界面（会话线程管理・消息历史持久化・流式响应）对接时**，才需要用本参考手册所述的 Assistant 框架进行包装。

## `@Assistant` 注解

```java
package jp.co.intra_mart.foundation.copilot.assistant.annotation;

public @interface Assistant {
    String id();     // 必需（无默认值）
    String name();   // 必需（无默认值）
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

- `id`/`name`：必需（无默认值）。`id` 为助手的唯一标识符
- `type`：`STANDARD`（平台标准助手）/`USER_DEFINITION`（用户定义）。省略时默认为 `STANDARD`
- `listEnable`：是否在助手列表界面中显示。省略时默认为 `false`
- `storeMessage`：是否持久化消息历史。省略时默认为 `false`
- `metadataFactory`：可省略（默认为 `StandardMetadataFactory`）

## 向平台注册（仅添加 `@Assistant` 不会被识别）

仅添加 `@Assistant` 不会被平台识别，也不会出现在助手一览中。以下两者均为必需。

### 1. `AssistantScanPackageFactory`（注册类路径扫描对象）

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public interface AssistantScanPackageFactory {
    Collection<String> getTargetPackages();
}
```

平台内部的 `AssistantAnnotationLoader`（`jp.co.intra_mart.system.copilot.assistant.impl`）会通过 `ServiceLoaderUtil.loadPriority(AssistantScanPackageFactory.class)` 汇总所有已注册实现返回的目标包，再通过 `WebAppClassScanner.findClassesWithAnnotation(Assistant.class, scanPackages)` 搜索 `@Assistant` 类（与 MCP 服务器的 `McpScanPackageFactory` 设计完全相同）。应创建一个实现类，使其 `getTargetPackages()` 返回包含 `@Assistant` 类的包名，并在 `META-INF/services/jp.co.intra_mart.foundation.copilot.assistant.AssistantScanPackageFactory` 中登记该实现类的完全限定名（一行）。

**该扫描结果会在类首次加载时（实质上即服务器启动时）被缓存到 `StandardAssistantMetadataRepository`（`jp.co.intra_mart.system.copilot.assistant.metadata`）的 `static` 字段中，且仅缓存一次。** 注册后若助手仍未反映，可能不仅需要重新部署应用，还需要重启平台服务器。

### 2. 在 IM-Authz 中授予权限（仅资源会被自动导入）

`@Assistant` 类被扫描到后，`CopilotAssistantResourceInitializer`（`jp.co.intra_mart.system.copilot.assistant.auth.importer`，属于 `ApplicationInitializer`）会在服务器启动时按租户执行，**自动导入**各助手的授权资源。资源 URI 的格式如下（`CopilotAssistantResourceType`）。

```
im-copilot-assistant://assistant/<助手ID>
```

资源类型 ID：`im-copilot-assistant`，操作：`execute`。

**资源的导入与该资源许可策略的授予是两回事，后者不会被自动化。** 获取助手一览（`CopilotAssistantService#getMetadatas(true)`）时，仅会返回 `listEnable() == true` 且 `AuthorizationClient.authorize(resourceUri, "execute")` 返回许可（`Permit`）的助手。**除非在 IM-Authz 管理界面（或 `java-im-authz-usage` 技能所涉及的 `PolicyManager`）中为目标用户・角色明确设置许可策略，否则即使助手已被扫描到，也不会出现在一览中。**

## `AbstractCopilotAssistant<T>`

```java
package jp.co.intra_mart.foundation.copilot.assistant;

public abstract class AbstractCopilotAssistant<T> implements CopilotAssistant<T> {
    public AssistantResult execute(T parameter) throws CopilotAssistantException; // 最终会调用 doExecute
    protected abstract AssistantResult doExecute(T parameter) throws CopilotAssistantException; // 由子类实现

    public AssistantContext getAssistantContext();
    public void setAssistantContext(AssistantContext context);
    public boolean isAvailable(DriverInfo driverInfo);

    protected Collection<AssistantMessage> getMessageHistory() throws CopilotAssistantException;
    protected Collection<AssistantMessage> getMessageHistory(int limit) throws CopilotAssistantException;
    protected void preprocessing(T parameter) throws CopilotAssistantException; // 默认不做任何操作
    protected void postprocessing(T parameter, AssistantResult result); // 默认不做任何操作
}
```

在标注了 `@Assistant` 的子类中实现 `doExecute(T parameter)`。`T` 必须是 `AssistantParameter` 本身，或其子类（详见下一节）。

## `AssistantParameter`（参数类 `T` 的必需契约）

```java
package jp.co.intra_mart.foundation.copilot.assistant.model;

public class AssistantParameter {
    private AssistantMessage message; // required = true
    private String threadId;          // required = false
    // getter/setter 由 Lombok 的 @Data 自动生成
}
```

`AbstractCopilotAssistant<T>.preprocessing()` 首先会调用 `AssistantParameterParser.get(parameter)`，判断已注册的两种解析器——`StandardAssistantParameterParser`（`parameter instanceof AssistantParameter`）与 `MapAssistantParameterParser`（`parameter instanceof Map`）——是否有一个能够处理该参数。**若将 `T` 指定为仅含自定义字段、既不继承 `AssistantParameter` 也非 `Map` 的不兼容 POJO，则两种解析器均无法匹配，运行时会抛出 `IllegalStateException`。**

此外，聊天界面的输入框是基于 `StandardMetadataFactory` 通过反射遍历 `T` 的 Bean 属性所构建的模式（`AssistantMetadata.getParameter()`）来组装的。`AssistantParameter`（或其子类）所具有的 `message` 属性（类型为 `AssistantMessage`，用户发言存放于 `message.contents`）的属性名与结构，是聊天界面用于绑定发送消息输入框所依赖的、平台侧固定的契约。**不遵循该契约的参数类，虽然仍会出现在助手一览中，但用户将无法输入提示词。**

- 若无需额外参数，可直接将 `AssistantParameter` 本身作为 `T` 使用
- 若需要额外参数，应**继承** `AssistantParameter`，仅添加标注了 `@Property`（`jp.co.intra_mart.foundation.copilot.assistant.annotation.Property`）的额外字段，不要重新定义继承而来的 `message`/`threadId`
- 用户发言字符串应通过 `parameter.getMessage().getContents()` 获取（即使添加了自定义的 `userMessage` 等字段，聊天界面也不会向其写入内容）

## `AssistantMessage`/`AssistantResult`

```java
package jp.co.intra_mart.foundation.copilot.assistant.message;

public class AssistantMessage implements java.io.Serializable {
    public AssistantMessage(String role, Object contents);
    public AssistantMessage(String role, Object contents, List<ToolCall> toolCalls, List<? extends Serializable> additional);
    public String getRole();
    public Object getContents();
    // 其他 getter/setter
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

`AssistantResult.builder().message(new AssistantMessage("assistant", content)).finishReason(finishReason).build()` 是基本写法。构建器的 `message(String)` 重载是将 `role` 固定为 `"assistant"` 来组装 `AssistantMessage` 的简化版本。

## `AssistantResponseWriter`（流式响应）

```java
package jp.co.intra_mart.foundation.copilot.assistant.response;

public interface AssistantResponseWriter extends AutoCloseable {
    <T extends java.io.Serializable> void writeObject(T object) throws CopilotAssistantException;
    void writeResponse(AssistantResult result) throws CopilotAssistantException;
    void close() throws java.io.IOException;
}
```

返回流式响应时，通过 `getAssistantContext().getResponseWriter()` 获取 `AssistantResponseWriter`，将其传给 `Agent.runStreaming(...)` 所用的 `StreamingResponseHandler` 实现，并按块通过 `writeObject`/`writeResponse` 写入。此时 `doExecute` 应返回 `null`，实际结果通过 `AssistantResponseWriter` 发送给客户端。

## 实现模式的选择

| 需求 | 实现方针 |
|---|---|
| 代码侧固定组装的智能体（模型・指令・工具在实现时即已确定） | 在 `doExecute` 内每次调用 `Agent.builder()...build()`，并调用 `run(...)`（同步）。参照 `assets/copilot-agent-basic-usage.md` 模式 8 |
| 动态加载用户通过 Agent Designer 等定义的智能体定义（JSON） | 使用平台标准的 `AgentDefinitionConverter.fromDefinitionData(...)`（`jp.co.intra_mart.system.copilot.agent.definition.converter`）从智能体定义数据构建 `Agent`。此路径是 Agent Designer「试运行」功能（`AgentTrialRunAssistant`）所使用的特殊模式，通常的应用开发中前者（固定配置）往往已经足够 |
| 需要流式响应 | 使用 `getAssistantContext().getResponseWriter()`，调用 `agent.runStreaming(session, message, runContext, handler)`。`handler` 为 `StreamingResponseHandler` 的实现，负责将数据块写入 `AssistantResponseWriter` |
