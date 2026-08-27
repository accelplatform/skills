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

附加于工厂类的三件套。类名遵循本项目的命名规则（`.agents/requirements/java-naming/AGENTS.md`），采用 `Xxx` + `EndpointFactory` / `Xxx` + `Endpoint`（`@ProvideService` 这一注解名本身是 Web API Maker 一侧的固定规格，不可更改。详情参见 `SKILL.md` 中的「架构与类命名」）。

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
- 失败时的行为：未认证 → `401`，已认证但无权限 → `403`
- 在 `uri` 中指定的资源需事先在 IM-Authz 一侧完成注册（参见 `java-im-authz-usage` 的 `ResourceManager`）。仅附加本注解并不会生效

## 响应控制系注解

| 注解 | 附加对象 | 用途 |
|------|------|------|
| `@Response(code=...)` | 异常类 | 指定该异常被抛出时的 HTTP 状态码 |
| `@ReturnValue` | 异常类的方法（getter） | 将异常的附加信息包含到响应体中 |
| `@PreventWritingResponse` | 方法 | 抑制 Web API Maker 的自动响应写入，通过参数接收 `HttpServletResponse` 进行手动控制 |

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

## API 规格的参照

所创建 API 的规格可通过以下 URL 以 JSON 格式（Swagger 兼容）获取。

```
http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}
```

`${api-category}` 对应 `@Category`（未指定时的默认分类）。也可通过 Swagger UI 直观地进行确认与执行。

## 请求/响应的格式

- 请求通过 `Content-Type` 头（`application/json` 或 `application/xml`）指定格式
- 响应以 `Accept` 头所指定的 MIME 类型返回。仅在成功时保证格式，出错时的格式不作保证
- 响应中值为 `null` 的属性不会被输出
