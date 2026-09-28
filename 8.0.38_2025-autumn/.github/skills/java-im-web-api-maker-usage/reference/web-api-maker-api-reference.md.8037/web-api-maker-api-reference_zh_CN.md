# Web API Maker API 参考手册（Java 版）

基于 intra-mart Accel Platform 官方文档（Web API Maker 编程指南）以及 javadoc（`jp.co.intra_mart.foundation.web_api_maker.annotation` 包）的记述整理而成。请勿凭记忆或推测补充方法・属性。

## 包结构

```
jp.co.intra_mart.foundation.web_api_maker.annotation
├── WebAPIMaker            … 附加于工厂类的基础注解
├── ProvideFactory          … 附加于工厂的实例获取方法
├── ProvideService           … 附加于服务的实例获取方法
├── IMAuthentication         … 支持会话认证（Cookie）
├── BasicAuthentication      … 支持 Basic 认证
├── OAuth                    … 支持 OAuth2 认证（以其他模块为前提）
├── Path                     … 表示 HTTP 路径
├── GET / POST / PUT / DELETE … 表示 HTTP 方法（各注解均继承 HttpMethod 的形式）
├── Parameter                … 从查询参数/表单参数获取值
├── Header                   … 从请求头获取值
├── Variable                 … 从路径参数（PathVariables）获取值
├── Body                     … 从请求体获取值
├── Bean                     … 将多个参数获取来源汇总为一个对象
├── Required                 … 表示参数为必填项
├── ArgumentSource            … 表示参数获取来源的基础性定位
├── Secured                  … 执行安全令牌检查
├── Administrator            … 支持系统管理员的会话认证
├── Response                 … 指定发生异常时返回的 HTTP 响应状态码
├── ReturnValue               … 使异常信息能够作为响应数据返回
├── PreventWritingResponse    … 抑制 Web API Maker 自动写入响应（手动控制）
├── Category                  … 表示 API 规格上的 Java-API 分类
└── Tag                       … 表示 API 规格上的 Java-API 标签
```

```
jp.co.intra_mart.foundation.authz.annotation
└── Authz                    … 用于 IM-Authz 联动的认可注解（并非 Web API Maker 专用，而是 IM-Authz 本体的注解）
```

## 类注册系注解

### `@WebAPIMaker` / `@ProvideFactory` / `@ProvideService`

附加于工厂类的三件套。类名遵循本项目的命名规则（`.github/instructions/java-naming.instructions.md`），采用 `Xxx` + `EndpointFactory` / `Xxx` + `Endpoint`（`@ProvideService` 这一注解名本身是 Web API Maker 一侧的固定规格，不可更改。详情参见 `SKILL.md` 中的「架构与类命名」）。

```java
@WebAPIMaker
public class XxxEndpointFactory {

    @ProvideFactory
    public static XxxEndpointFactory getFactory() {
        return new XxxEndpointFactory();
    }

    @ProvideService
    public XxxEndpoint getService() {
        return new XxxEndpoint();
    }
}
```

- 附加 `@ProvideFactory` 的方法须为 `static`，返回工厂类自身的实例
- 附加 `@ProvideService` 的方法返回 Endpoint 类（Web API Maker 官方文档中所称的「服务类」）的实例（实例方法）
- Endpoint 类一侧不附加这些注解

## 认证系注解（附加于类，互斥选择）

| 注解 | 用途 | 端点 | 备注 |
|------|------|------|------|
| `@IMAuthentication` | 以关联于 Cookie 的会话认证状态进行访问 | `@Path` 的值原样 | 不进行特殊的认证处理 |
| `@BasicAuthentication` | Basic 认证 | `/basic` + `@Path` 的值（可通过属性变更前缀） | |
| `@OAuth` | OAuth2 认证 | `pathPrefix`（默认 `/oauth`）+ `@Path` 的值 + `pathSuffix`（默认空字符串） | 需另行导入 Web API Maker OAuth 认证模块并指定 `scope` 属性 |
| `@Administrator` | 系统管理员的会话认证 | — | 专用于系统管理员向的 API |

### `@OAuth` 的属性

| 属性 | 含义 | 默认值 | 必填 |
|------|------|------|------|
| `scope` | 该 API 要求的作用域 ID（与 `oauth-client-scopes-config` 中定义的 `id` 对应） | 无 | ○ |
| `pathPrefix` | 端点的前缀 | `"/oauth"` | - |
| `pathSuffix` | 端点的后缀 | `""` | - |

## 路由系注解（附加于方法）

- `@Path("/foo/orders/{orderId}")` — 指定 URL 路径。可通过 `{xxx}` 形式设为路径变量
- `@GET` / `@POST` / `@PUT` / `@DELETE` — 指定 HTTP 方法。每个方法只能指定一个

## 参数系注解（附加于参数或 Bean 的 setter）

| 注解 | 获取来源 | 主要属性 |
|------|------|------|
| `@Parameter` | 查询参数/表单参数 | `name`（参数名） |
| `@Header` | 请求头 | `name`（头名） |
| `@Variable` | 路径参数（对应 `@Path` 中的 `{xxx}`） | `name`（须与 `@Path` 内的变量名一致） |
| `@Body` | 请求体整体 | — |
| `@Bean` | 汇总上述内容的任意类 | — |
| `@Required` | 表示参数为必填项（与其他注解并用） | — |

- 使用 `@Bean` 时，需在汇总目标类的 setter 上附加各自的获取来源注解（`@Variable`/`@Parameter`/`@Body`/`@Header`）。汇总目标类也必须具备成对的 getter/setter
- 附加了 `@Required` 的参数若未指定，将作为请求格式不正确返回错误响应（参见 HTTP 状态码对照表）

## 安全系注解

- `@Secured` — 附加于方法。执行安全令牌检查（CSRF 对策）。预期用于从浏览器调用的状态变更类 API
- `@Authz`（`jp.co.intra_mart.foundation.authz.annotation.Authz`，并非 Web API Maker 专用，而是 IM-Authz 本体的注解） — 附加于类或方法。在执行 Web API 之前由 IM-Authz 进行认可判断

### `@Authz` 的属性

| 属性 | 含义 | 默认值 |
|------|------|------|
| `uri` | 认可对象资源的 URI | `""`（空字符串） |
| `action` | 动作名 | `"execute"` |
| `mapperClass` | 认可映射类（用于动态确定资源） | `EmptyResourceMapper.class` |
| `mapperParams` | 传递给映射类的参数（`AuthzMapperParam[]`） | `{}`（空数组） |

- 类、方法均可附加。附加于类时会一并应用于其下的所有方法
- 失败时的行为：未认证 → `401`，已认证但无权限 → `403`。**但与 `@IMAuthentication`（会话认证）组合使用时，未认证请求会在到达此判定之前就以 `404` 被拦截，因此 `401` 实际上不会发生。** 已认证用户的 `403` 会以包装后的响应返回（参见「请求/响应的格式」）
- 在 `uri` 中指定的资源需事先在 IM-Authz 一侧完成注册（参见 `java-im-authz-usage` 的 `ResourceManager`）。仅附加本注解并不会生效

## 响应控制系注解

| 注解 | 附加对象 | 用途 |
|------|------|------|
| `@Response(code=...)` | 异常类 | 指定该异常被抛出时的 HTTP 状态码 |
| `@ReturnValue` | 异常类的方法（getter） | 将异常的附加信息包含到响应体中 |
| `@PreventWritingResponse` | 方法 | 抑制 Web API Maker 的自动响应写入，通过参数接收 `HttpServletResponse` 进行手动控制。**方法的返回值总是被忽略** |

## 可指定为参数・返回值的类型

- 基本类型（`int`/`String`/`boolean` 等）
- 数组
- `List`/`Set`
- `byte[]`（二进制数据）
- `InputStream`
- 由上述类型组合而成的模型类（须为 `public`，必须具备无参构造函数，仅具备成对 getter/setter 的成员为输入输出对象）

若需支持 XML 格式的交互，需在模型类上附加 `@XmlRootElement`。

## 会话管理的行为（按认证方式）

针对 `keep`/`once`/`never` 三段式指定的行为。

| 设置值 | `@IMAuthentication` | `@BasicAuthentication` / `@OAuth` |
|------|------|------|
| `keep` | 不进行会话管理 | 未认证时登录后，执行后维持登录状态 |
| `once` | 不进行会话管理 | 执行前若处于未认证状态，则在执行后注销登录 |
| `never` | 执行后若处于登录状态则注销登录 | 执行后若处于登录状态则注销登录（`OAuth` 与 `BasicAuthentication` 的不同之处在于，其 `keep` 行为不局限于从未认证状态迁移而来的情况） |

## HTTP 状态码对照表

| 代码 | 含义 |
|------|------|
| `200` | 成功 |
| `400` | 请求格式不正确（`@Required` 参数未指定等） |
| `401` | 未认证 |
| `403` | 已认证但无权限（`@Authz` 判定失败等） |
| `404` | URL 不匹配（包未注册・`@Path` 有误等），或附加了 `@Response(code=404)` 的异常 |
| `405` | HTTP 方法不匹配 |
| `406` | `Accept` 头与可输出格式不匹配 |
| `415` | `Content-Type` 不正确 |
| `500` | 服务器错误 |

各代码的响应体是否为包装结构（`error`/`data`），并非仅凭代码值就能确定。请参照「请求/响应的格式」中的「何时会被包装、何时不会」。

## API 规格的参照

所创建 API 的规格可通过以下 URL 以 JSON 格式（Swagger 兼容）获取。

```
http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}
```

`${api-category}` 对应 `@Category`（未指定时的默认分类）。也可通过 Swagger UI 直观地进行确认与执行。

## 请求/响应的格式

- 请求通过 `Content-Type` 头（`application/json` 或 `application/xml`）指定格式
- 响应以 `Accept` 头所指定的 MIME 类型（`application/json` 或 `application/xml`）返回
- 响应中值为 `null` 的属性不会被输出

### 响应体的包装结构

**Endpoint 方法的返回值不会原样成为响应体，而是必定被包装在带有 `error` / `data` 的包装对象中返回。** 客户端（画面・外部系统）若不解开该包装而直接引用属性，即使 API 本身工作正常，也会陷入「取不到数据」的状态。

成功时（`Accept: application/json`）：

```json
{
  "error": false,
  "data": {
    "id": 1,
    "name": "Dog",
    "sold": false,
    "attribute": {
      "breed": "golden"
    }
  }
}
```

发生异常时（Web API Maker 捕获了 Endpoint 方法抛出的异常）：

```json
{
  "error": true,
  "errorMessage": "[E.IWP.WEBAPIMAKER.CONVERTER.10001] 从 JSON 字符串的转换失败。 json:434343"
}
```

在异常类的 getter 上标注 `@ReturnValue` 时，其返回值会存放在 `data` 之下：

```json
{
  "error": true,
  "errorMessage": "发生了异常。",
  "data": {
    "optionalMessage": "不存在与所输入 id 相关的信息。",
    "parameterValue": 111111
  }
}
```

| 属性 | 类型 | 内容 |
|------|------|------|
| `error` | boolean | 是否发生了异常。成功时为 `false`，发生异常时为 `true` |
| `data` | object | 成功时为 Endpoint 方法的返回值。发生异常时为标注了 `@ReturnValue` 的 getter 的值（没有 `@ReturnValue` 时不会输出） |
| `errorMessage` | string | 仅在发生异常时输出的异常消息。成功时不输出 |

- 返回值为 `List`/数组时，`data` 为 JSON 数组。无论返回值类型如何，外层的包装结构都不变
- **标注了 `@PreventWritingResponse` 的方法不会附加该包装。** 方法的返回值总是被忽略，响应体由实现者自行写入通过参数接收的 `HttpServletResponse`（`sendRedirect()`／`getWriter()`／`getOutputStream()` 等）
- 标注了 `@Response(code=...)` 的业务异常，即使 HTTP 状态码不是 `200`，也会以该包装结构返回
- 实现后请通过 Swagger UI（`/api-docs/${api-category}`）或 `curl` 确认实际响应，并与客户端的解析处理进行核对

### 何时会被包装、何时不会

响应体是否为包装结构（`error`/`data`），既不由 HTTP 状态码的值决定，也不由 `@Response` 的有无决定，而是取决于**请求是否到达了 Endpoint 方法（即是否经过反射的 `Method#invoke`）**。`Method#invoke` 会将被调用方法抛出的任何异常必定包装为 `InvocationTargetException`，Web API Maker 总是将其转换为包装后的响应。反之，在到达 Endpoint 方法之前（认证检查・各种 `ActionFilter` 等）发生的响应或异常，除非该处代码显式调用了包装处理，否则不会被包装。

**会被包装**（`error`/`data` 的 JSON/XML）：

| 情况 | 备注 |
|------|------|
| 成功时（`200`） | |
| Endpoint 方法自身抛出的异常（无论是否标注 `@Response`） | 不仅是标注了 `@Response(code=...)` 的业务异常，**未标注 `@Response` 的普通异常也必定会被包装**（未标注时状态码仅为 `500`）。示例：`{"error":true,"errorMessage":"..."}` |
| `@Required` 未指定（`400`） | 示例：`{"error":true,"errorMessage":"Parameter 'name' is required."}` |
| `@Secured` 令牌未指定（`403`） | 示例：`{"error":true,"errorMessage":"[E.IWP.WEBAPIMAKER.CORE.10011] ..."}` |
| `@Authz` 认证用户被拒绝授权（`403`） | 示例：`{"error":true,"errorMessage":"[E.IWP.WEBAPIMAKER.CORE.10002] ..."}` |
| `405`（方法不匹配）／`415`（`Content-Type` 不正确） | 与 `400` 完全相同的 `ClientErrorException` 层次结构与代码路径 |

**不会被包装**（HTML 或纯文本）：

| 情况 | 备注 |
|------|------|
| 未认证访问（仅 `@IMAuthentication`，无 `@Authz`） | `404`・`Content-Type: text/html`，intra-mart 标准通用错误页。**返回的是 `404` 而非 `401`**，需注意。认证检查本身发生在 Web API Maker 的 Action・Filter 之前，请求根本不会到达 Endpoint 方法 |
| 对带 `@Authz` 的端点进行未认证访问 | 同样是 `404`。`@Authz` 文档中「未认证 → 401」的分支，在 `@IMAuthentication`（会话认证）场景下实际上不会发生，因为请求在到达 `@Authz` 判定之前就已被 `404` 拦截 |
| 在 `ActionFilter` 内部发生、且该过滤器自身未显式捕获的异常（例如 `@Authz` 进行认可判定时 IM-Authz 一侧抛出的 `ResourceNotFoundException`。`WebApiAuthzActionFilter` 仅捕获 `AnnotationValueException`，因此该异常会直接穿透） | `500`・`Content-Type: text/html`，intra-mart 标准通用错误页「HTTP 500: Servlet Exception」。在 Endpoint 方法之外（即未经过 `Method#invoke`）发生的异常，除非该处代码显式进行包装，否则不会被包装 |
| URL 本身未注册（包未注册・`@Path` 有误等） | `404`・`Content-Type: text/html`。根本不会到达该 Action |
| `Accept` 头不正确・无法解析（`406`） | `RestResponseUtil.setErrorResponseByPlainText` 明确固定为纯文本 |

**不属于本节范围**：`@BasicAuthentication`/`@OAuth` 认证失败时的响应格式。由于认证机制与代码路径与 `@IMAuthentication`（会话认证）不同，上述结论未必适用

### 客户端的判断顺序

1. 确认 HTTP 状态码
2. 尝试解析响应体（标注了 `@Response(code=...)` 的业务异常即使状态码不是 `200` 也会以包装结构返回，因此不要仅凭状态码就中止处理）
3. 仅当能够解析且 `error` 为 `false` 时，才将 `data` 作为业务数据使用
4. `error` 为 `true` 时，将 `errorMessage`（以及 `data` 中 `@ReturnValue` 的值）作为错误信息处理
5. 解析失败，或不存在 `error` 属性时（包括上表中「不保证包装结构的情况」），按意外错误处理

客户端的实现示例请参照 `assets/web-api-maker-basic-usage.md`「模式7：响应控制」。
