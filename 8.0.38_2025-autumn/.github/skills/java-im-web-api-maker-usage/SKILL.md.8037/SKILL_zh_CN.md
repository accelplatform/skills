---
name: java-im-web-api-maker-usage
description: intra-mart 固有の Web API Maker（`jp.co.intra_mart.foundation.web_api_maker.*`、`im_web_api_maker` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。アノテーション（`@WebAPIMaker`/`@ProvideFactory`/`@ProvideService`）によるファクトリ・サービスクラスの実装、`@Path` + HTTPメソッドアノテーションによるルーティング、`@Parameter`/`@Header`/`@Variable`/`@Body`/`@Bean` によるパラメータバインド、`@IMAuthentication`/`@BasicAuthentication`/`@OAuth` による認証方式の切替、`@Secured` によるセキュアトークン検証、`@Authz` による IM-Authz 連携、`@Response`/`@PreventWritingResponse`/`@ReturnValue` によるレスポンス制御の実装パターンを提供する。Java で Web API Maker を使いたい、Java で REST API を自動生成したい、JavaEE 開発モデルで @WebAPIMaker / @Path / @GET / @POST を使いたい、Web API Maker で OAuth 認証付き API を作りたい、と言及されたときに使用。認可リソース自体の登録・ポリシー設定は `java-im-authz-usage`、OAuth クライアントアプリケーション自体の登録・スコープの意味づけ設計は対象外（設定ファイルへの記述方法のみ扱う）。JSSP（スクリプト開発モデル）で REST API を作る場合は `jssp-page-generator`（通常 API）または `jssp-im-oauth-generator`（OAuth 付き API）を使うこと。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Web API Maker 使用支援技能（Java 版）

## 目的

使用 intra-mart Accel Platform 提供的、面向 **JavaEE 开发模型**的 Web API Maker（`jp.co.intra_mart.foundation.web_api_maker.*`），仅通过为 Java 类添加注解即可实现 REST API（Web 服务）的技能集。

## Web API Maker 的基本概念（最重要）

Web API Maker 是一种机制，仅通过「为 Java 类・方法添加注解」，即可使该类作为 Web 服务的提供者发挥作用。实现时需要 **2 个类**。

| 类 | 角色 | 必需注解 |
|------|------|------|
| 工厂类 | 生成 Endpoint 实例的窗口 | `@WebAPIMaker`（类）/ `@ProvideFactory`（获取工厂的方法）/ `@ProvideService`（生成实例的方法） |
| **本文档中的「Endpoint 类」**（在 Web API Maker 官方文档・javadoc 中称为「服务类」） | 持有 `@Path`/HTTP 方法注解，作为 HTTP 请求的窗口。仅负责参数绑定与向 Service 层的委托（不承载业务逻辑本体） | 为各方法添加 `@Path` + HTTP 方法注解（`@GET`/`@POST`/`@PUT`/`@DELETE`）。为类添加认证方式注解 |

- 端点将直接映射到 `@Path` 指定的 URL（+ 各认证方式对应的前缀）。无需路由配置文件（`routing-jssp-config` 等）
- **认证方式共 3 种**（`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`），以类为单位互斥选择。详情参见「认证方式的选择」
- **若忘记向 `META-INF/im_web_api_maker/packages` 注册包，即便添加了注解也不会被识别为服务。** 这是最常见的实现遗漏，务必在实现步骤的最后进行确认

## 架构与类命名（重要）

Web API Maker 的官方文档・javadoc 习惯上将持有 `@Path`/HTTP 方法注解的类称为「服务类」，但这是 Web API Maker 自身的术语。**依照本项目的命名规则（`.github/instructions/java-naming.instructions.md` 中「REST API 端点 → `Endpoint` 后缀」），承担此角色的 Java 类应添加 `Endpoint` 后缀**（应为 `OrderEndpoint` 而非 `OrderService`）。

不要在 Endpoint 类中直接编写业务逻辑或 DB 访问，应委托给以下分层结构。

```
Endpoint（@Path/@GET 等。仅负责 HTTP 请求的接收・参数转换・Service 调用）
    ↓
Service（业务逻辑本体。`Xxx` + `Service` 后缀）
    ↓
Repository（DB 访问的抽象化。`Xxx` + `Repository`/`StandardXxxRepository`）
    ↓
DAO（`Xxx` + `DAO`）
```

- Repository・DAO 层的实现属于 `java-im-mirage-usage` 技能的范畴（本技能仅处理到 Endpoint → Service 的委托为止）
- Endpoint 类将 Service 的实例作为字段持有，并将方法调用委托给它（参见 `assets/web-api-maker-basic-usage.md` 模式1）
- Web API Maker 的工厂类名也应与角色相符（应为 `OrderEndpointFactory` 而非 `OrderServiceFactory`）。但 `@ProvideService` 注解本身的名称是 Web API Maker 一侧的固定规格，不作变更
- **注意名称相似但完全不同的类。** `OrderEndpointFactory`（位于 `webapi` 包，添加了 `@WebAPIMaker`、专用于生成 Endpoint 实例的 Web API Maker 专属工厂）与 `OrderServiceFactory`（位于 `service` 包，通过 `ServiceLoaderUtil.loadTopPriority` 解析 `OrderService` 实现的通用工厂。参见 `java-im-mirage-usage` 技能中的「Repository/Service 的工厂类」）二者名称相似，但分属完全不同的机制与包
- **Endpoint 类不直接调用 `SessionTemplate`/`DAOFactory`（`java-im-mirage-usage` 所处理的 API）。** 事务边界应由 Service・Repository 一侧自行设立，Endpoint 无需关注该边界（详情参见 `java-im-mirage-usage` 的 SKILL.md「Repository / Service / Endpoint 的职责划分」）
- **Endpoint 本身也可以拆分为「接口 + Standard 实现类」，并通过 `ServiceLoaderUtil.loadTopPriority` 实现可替换获取（可选）。** Web API Maker 会将 `@ProvideService` 方法**声明上的返回值类型**识别为 API 类，并扫描该类的 `Method` 来读取 `@Path` 等注解，在运行时通过反射调用。因此即使将返回值类型设为 `Xxx` + `Endpoint`（接口）也能正常工作（参见 `assets/web-api-maker-basic-usage.md` 模式1）。但与 Repository/Service 不同，Endpoint 实际需要替换实现的场景有限，**对于没有替换计划的简单 Endpoint，沿用单一 `public class` 即可**（接口化并非必须）

## 与其他技能的边界（重要）

**本技能所处理的仅为「Web API Maker（基于 Java 注解的 REST API）」的实现。** 类似的 REST API 实现根据开发模型・认证方式的不同，由不同的技能负责。

| 想要创建的内容 | 负责技能 |
|------|-----------|
| 在 Java（JavaEE 开发模型）中通过 Web API Maker 实现 REST API | **本技能** |
| 在 JSSP（脚本开发模型）中实现 CSRF 安全令牌认证的普通 REST API | `jssp-page-generator` |
| 在 JSSP（脚本开发模型）中实现带 OAuth 认证的 REST API（im_oauth 提供者功能） | `jssp-im-oauth-generator` |
| 认可（IM-Authz）资源・主体・策略本身的 CRUD | `java-im-authz-usage`（不属于本技能范畴。`@Authz` 的 `uri` 中指定的资源需事先在该技能中注册） |
| OAuth 客户端应用程序本身的注册・作用域的业务含义设计 | 不属于本技能范畴。虽处理 `oauth-client-details-config`/`oauth-client-scopes-config` 的记述方法，但注册内容本身的设计需遵循用户・相关文档的指示 |

若未明确提及「使用 Web API Maker」「以 Java 注解实现 REST API」，而只是笼统地被要求「想要创建 REST API」时，需向用户确认是 JSSP 还是 Java 开发模型、以及认证方式（会话/Basic/OAuth）为何。

## 应参照的规约

| 规约 | 处理方式 |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **必读** — 包・类・方法・变量命名 |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **必读** — `final` 局部变量、字符串字面量等 |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **必读** — 类/方法 JavaDoc |

`jssp-*` 的规约不属于本技能范畴（不适用于 Java 文件）。

## API 概要

`jp.co.intra_mart.foundation.web_api_maker.annotation` 包下的注解一览・属性・签名请参照 `reference/web-api-maker-api-reference.md`（不要凭记忆或推测书写）。

主要要点：
- **类・接口・模型均须为 `public`，模型必须具有无参构造函数。** 只有 getter/setter 齐备的成员才会成为输入输出对象
- **返回值・参数可使用基本类型、数组、`List`/`Set`、`byte[]`（二进制）、`InputStream` 等。** 响应格式将根据 `Accept` 头的 MIME 类型（JSON/XML）自动转换。`null` 属性不会被输出
- **错误时的响应格式不作保证。** 仅在成功时按照 `Accept` 头指定的格式返回
- 已创建 API 的规格可通过 `http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}` 以 JSON 格式（兼容 Swagger）查看

## 认证方式的选择

| 注解 | 用途 | 端点前缀 | 额外需要的内容 |
|------|------|------|------|
| `@IMAuthentication` | 与 Cookie 关联的会话认证（利用浏览器的登录状态） | 无（`@Path` 的值原样使用） | 无 |
| `@BasicAuthentication` | Basic 认证 | `/basic`（可通过属性变更） | 无 |
| `@OAuth` | OAuth2 认证 | `/oauth`（可通过属性 `pathPrefix` 变更，默认为 `/oauth`） | **需追加导入 Web API Maker OAuth 认证模块**、指定 `scope` 属性、OAuth 一侧的 3 种配置文件（`oauth-client-scopes-config`/`oauth-client-resources-config`/`oauth-client-details-config`） |

会话管理（`keep`/`once`/`never`）的行为因认证方式而异。详情参见 `reference/web-api-maker-api-reference.md`。

## 生成对象与模板

| 生成对象 | 模板 | 内容 |
|---------|------------|------|
| 工厂・Endpoint 类的基本实现 | `assets/web-api-maker-basic-usage.md` | 使用 `@IMAuthentication` 的最小构成、向 Service 层的委托、包注册 |
| 参数绑定 | `assets/web-api-maker-basic-usage.md` | `@Variable`（路径）/`@Parameter`（查询）/`@Body`（实体）/`@Bean`（聚合） |
| Basic 认证 API | `assets/web-api-maker-basic-usage.md` | `@BasicAuthentication` 的实现模式 |
| OAuth 认证 API | `assets/web-api-maker-basic-usage.md` | `@OAuth(scope=...)` 的实现、3 种配置文件全套 |
| IM-Authz 联动（认可检查） | `assets/web-api-maker-basic-usage.md` | `@Authz(uri=..., action=...)` 的实现、与 `java-im-authz-usage` 的联动要点 |
| 安全令牌验证 | `assets/web-api-maker-basic-usage.md` | `@Secured` 的实现模式 |
| 响应控制 | `assets/web-api-maker-basic-usage.md` | 异常 → 状态码（`@Response`）、手动响应（`@PreventWritingResponse`）、异常侧的附加信息（`@ReturnValue`） |

### 参考资料

- `reference/web-api-maker-api-reference.md` — `jp.co.intra_mart.foundation.web_api_maker.annotation` 下全部注解的属性・签名、参数・返回值可指定的类型、会话管理行为对比表、HTTP 状态码对应表（基于官方文档・javadoc 的记述。不要凭记忆书写）

## 使用时机

当用户提出以下请求时：
- 「想在 Java 中使用 Web API Maker 创建 REST API」
- 「想在 JavaEE 开发模型中使用 `@WebAPIMaker`/`@Path`/`@GET`」
- 「想用 Web API Maker 创建带 OAuth 认证的 API」
- 「只想通过 Java 注解实现 Web 服务」

若未明确提及「使用 Web API Maker」「以 Java 注解」等，需确认项目的开发模型（JSSP/Java）。

对于「想在 REST API 中新注册认可（Authz）的资源・策略」的请求，其中资源・主体・策略的 CRUD 本身应引导至 `java-im-authz-usage`（本技能仅处理到 `@Authz` 注解的添加为止）。

## 实现步骤

1. 听取用户需求（端点的 URL・HTTP 方法・认证方式・是否需要认可・输入输出数据结构）
2. 设计包・工厂类名・Endpoint 类名（遵循 `.github/instructions/java-naming.instructions.md`。Endpoint 类为 `Xxx` + `Endpoint`，工厂类为 `Xxx` + `EndpointFactory`）
3. 参照 `assets/web-api-maker-basic-usage.md` 实现工厂类・Endpoint 类（方法的签名・属性务必参照 `reference/web-api-maker-api-reference.md`，不要凭记忆或推测书写）。Endpoint 类中不编写业务逻辑，通过 `XxxServiceFactory.getInstance()` 获取 Service（接口）实例并作为字段持有，再委托给它（不要以 `new StandardXxxService()` 的方式直接生成。参见调用 `java-im-mirage-usage` 的 Repository/DAO 的 Service 实现模式）。仅当 Endpoint 本身确实需要替换实现时，才将 Endpoint 也拆分为「接口 + Standard 实现类」，并在工厂类的 `@ProvideService` 方法内通过 `ServiceLoaderUtil.loadTopPriority` 解析（参见模式1；不需要时保持单一 `public class` 即可）
4. 在 `META-INF/im_web_api_maker/packages` 中注册 Endpoint 类的包名（**最常见的实现遗漏之处**）
5. 若需要认可检查，添加 `@Authz(uri=..., action=...)`，并确认对应的认可资源是否已在 IM-Authz 一侧注册（若未注册，向用户确认是否需要用 `java-im-authz-usage` 实现注册处理）
6. 若需要 OAuth 认证，在确认已导入 Web API Maker OAuth 认证模块的前提下添加 `@OAuth(scope=...)`，并完善 `oauth-client-scopes-config`/`oauth-client-resources-config`/`oauth-client-details-config` 这 3 项
7. 确认是否遵循 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## 注意事项

- **若忘记在 `META-INF/im_web_api_maker/packages` 中注册，即便正确添加了注解也不会被识别为服务。** 生成后的确认中务必检查此项
- **类・接口・模型均须为 `public`，模型类必须具有无参构造函数。** 二者中任一缺失都会导致转换失败
- **不要在 Endpoint 类中直接编写 DB 访问（`DAOFactory`/`SqlManager` 等）代码。** 务必通过 Service 类间接调用 Repository/DAO（`java-im-mirage-usage` 的职责）。若从 Endpoint 直接调用 Repository/DAO，Service 层将形同虚设，业务逻辑的可复用性・可测试性也会随之丧失
- **`@OAuth` 仅靠基本模块无法运行。** 需向用户说明，追加导入 Web API Maker OAuth 认证模块是前提条件
- **`@Authz` 的 `uri` 中指定的认可资源，需事先在 IM-Authz 一侧完成注册。** 仅在 Web API Maker 一侧添加 `@Authz` 并不会生效，必须与通过 `java-im-authz-usage` 在 `ResourceManager`/`PolicyManager` 一侧的注册（或租户环境搭建的导入资材）配套才能成立
- **`@Secured` 带来的安全令牌验证，与认证注解（`@IMAuthentication` 等）是不同的关注点。** 安全令牌用于应对 CSRF，认证注解用于判断「以谁的身份访问」，在两者都需要的场景（例如：从浏览器调用的状态变更类 API）中不要混淆
- **错误时的响应格式（JSON/XML）不作保证。** 客户端一侧的实现，应设计为将成功时与失败时的响应解析处理区分开
- **`Effect`（IM-Authz）或认可判断的详细 CRUD API 不属于本技能范畴。** 本技能的范围仅到 `@Authz` 的使用方法为止，不编写资源注册・策略设置的实现代码（引导至 `java-im-authz-usage`）

## 生成后的确认

如 JSSP 版那样的专用验证脚本（相当于 `validate-jssp-code.js`）目前尚未配备。以下项目需手动确认。

1. Endpoint 类的包名是否已在 `META-INF/im_web_api_maker/packages` 中注册
2. Endpoint 类・模型类・相关接口是否均为 `public`，模型类是否具有无参构造函数
3. 为类添加的认证注解（`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`）是否与需求一致，是否存在重复添加
4. 若使用 `@OAuth`，是否存在 Web API Maker OAuth 认证模块导入前提及 `scope` 属性指定遗漏
5. 若使用 `@Authz`，`uri`/`action` 是否与 IM-Authz 一侧的注册内容一致（与 `java-im-authz-usage` 一侧的实现进行比对）
6. `@Path` 的值・HTTP 方法注解是否与需求听取内容一致，路径参数（`{xxx}`）与 `@Variable(name=...)` 是否一致
7. 是否针对状态变更类（POST/PUT/DELETE）端点考虑了 `@Secured` 的必要性
8. **类名是否符合 `Endpoint`（Web API Maker 的类）/`EndpointFactory`（工厂）/`Service`（业务逻辑）/`Repository`（DB 访问抽象化）的命名规则・分层结构。** Endpoint 类中是否未直接编写 DB 访问或业务逻辑（是否按 `Endpoint → Service → Repository → DAO` 的顺序进行委托）
9. Endpoint 类是否未像 `new StandardXxxService()` 那样直接生成 Service 的具体类，而是通过 `XxxServiceFactory.getInstance()`（基于 `ServiceLoaderUtil.loadTopPriority` 的工厂）获取
10. 若将 Endpoint 接口化，`@IMAuthentication` 等类注解、`@Path`/`@GET`/参数注解是否声明在接口一侧而非实现类，工厂类 `@ProvideService` 方法的**返回值类型是否为接口**（若仍为实现类类型，注解将不被识别，导致端点无法注册）
11. 是否遵循 `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
12. `jssp-code-review` / `jssp-security-check` 为 JSSP 专用，不适用于本技能的生成物。若项目中另有面向 Java 的代码评审・安全检查技能，请使用该技能

## 与其他技能的边界

| 职责 | 负责技能 |
|------|-----------|
| **在 Java（JavaEE 开发模型）中通过 Web API Maker 实现 REST API** | **本技能** |
| 在 JSSP（脚本开发模型）中实现普通 REST API（CSRF 安全令牌认证） | `jssp-page-generator` |
| 在 JSSP（脚本开发模型）中实现带 OAuth 认证的 REST API（im_oauth 提供者功能） | `jssp-im-oauth-generator` |
| 在 Java 中进行认可（IM-Authz）资源・主体・策略的 CRUD、权限确认 | `java-im-authz-usage` |
| 在 Java 中进行角色定义・向用户分配角色 | `java-im-role-usage` / `java-im-account-usage` |
| 在 Java 中进行文件操作（`PublicStorage` 等） | `java-im-storage-usage` |
