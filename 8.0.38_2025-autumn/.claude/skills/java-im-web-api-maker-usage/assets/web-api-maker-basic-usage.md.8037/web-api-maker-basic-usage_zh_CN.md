# Web API Maker 基本使用模式（Java 版）

各注解的属性・签名请参考 `reference/web-api-maker-api-reference.md`。此处展示典型的实现模式。

## 类命名与架构（最重要）

拥有 Web API Maker 所要求的 `@Path`/HTTP 方法注解的类，在官方文档・javadoc 中被称为「服务类（Service class）」，但**本项目的命名规约（`.claude/rules/java-naming.md`）为承担该角色的类添加 `Endpoint` 后缀。** 以下模式在注意与该 Web API Maker 术语差异的同时，统一采用 `Xxx` + `Endpoint` / `Xxx` + `EndpointFactory` 的命名。

Endpoint 类仅负责 HTTP 请求的接收・参数转换・响应转换，不直接持有业务逻辑或 DB 访问。它持有 `Xxx` + `Service`（业务逻辑）字段，并将处理委托给它。DB 访问（Repository/DAO）的实现属于 `java-im-mirage-usage` 技能的范畴。

**Service 与 Repository 相同，采用「接口 + Standard 实现类 + 工厂类」的三点构成。** Endpoint 类仅依赖 `Xxx` + `Service`（接口），不会像 `new StandardXxxService()` 那样直接生成具体类，而是通过 `XxxServiceFactory.getInstance()` 获取（基于 `ServiceLoaderUtil.loadTopPriority` 的可替换获取方式。详情请参考 `java-im-mirage-usage` 技能的「Repository/Service 的工厂类」）。

**Endpoint 本身也可以基于同样的思路拆分为「接口 + Standard 实现类」，实现基于 `ServiceLoaderUtil.loadTopPriority` 的可替换获取。** 这基于 Web API Maker 实现上的特性：`@ProvideService` 方法会将其**声明上的返回值类型**识别为「API 类」，并扫描该类的 `Method`（`api.getMethods()`）读取 `@Path` 等注解，在运行时通过反射调用（`Method#invoke(instance, args)`）。因此，只要将返回值类型设为 `Xxx` + `Endpoint`（接口），并在该接口上声明 `@IMAuthentication`/`@Path`/`@GET`/`@Parameter` 等注解，即便对实现类（`StandardXxxEndpoint` 或通过 `META-INF/services` 替换的其他实现）的实例，也能正确工作。

```
Endpoint（@Path/@GET 等。仅负责接收 HTTP 请求・调用 Service）
    ↓
Service（业务逻辑本体）
    ↓
Repository（DB 访问的抽象化。参见 java-im-mirage-usage）
    ↓
DAO（参见 java-im-mirage-usage）
```

## 模式1：最小构成（工厂类 + Endpoint 接口 + Standard 实现类 + Service 类，`@IMAuthentication`）

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ProvideFactory;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ProvideService;
import jp.co.intra_mart.foundation.web_api_maker.annotation.WebAPIMaker;

/**
 * 订单信息 Web API 的工厂类（Web API Maker 规约上必须的 {@code @WebAPIMaker} 类）。<br>
 * 本类自身是 Web API Maker 框架所要求的固定入口，与 {@code ServiceLoaderUtil} 的
 * 工厂类（{@code OrderServiceFactory} 等）是完全不同的机制（名称相似，需注意区分）。<br>
 * {@link #getService()} 的返回值类型为 {@link OrderEndpoint}（接口），
 * 若在 {@code META-INF/services/jp.co.example.foo.webapi.OrderEndpoint} 中注册了实现类，
 * 则会通过 {@link ServiceLoaderUtil#loadTopPriority(Class)} 替换为优先级更高的实现。
 * 若未注册，则使用 {@link StandardOrderEndpoint} 作为默认实现。
 */
@WebAPIMaker
public class OrderEndpointFactory {

    private static final class LazyHolder {

        private static final OrderEndpoint INSTANCE = createInstance();

        private static OrderEndpoint createInstance() {
            final OrderEndpoint topPriority = ServiceLoaderUtil.loadTopPriority(OrderEndpoint.class);
            return topPriority != null ? topPriority : new StandardOrderEndpoint();
        }
    }

    /**
     * 获取工厂的实例。
     * @return 工厂实例
     */
    @ProvideFactory
    public static OrderEndpointFactory getFactory() {
        return new OrderEndpointFactory();
    }

    /**
     * 获取 Endpoint 的实例。
     * @return Endpoint 实例
     */
    @ProvideService
    public OrderEndpoint getService() {
        return LazyHolder.INSTANCE;
    }
}
```

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

/**
 * 提供订单信息的 Web API 的 Endpoint 接口。<br>
 * 通过与 Cookie 关联的会话认证（浏览器的登录状态）进行访问。<br>
 * `@IMAuthentication` 等类注解・`@Path`/`@GET`/参数注解，应声明在
 * 本接口一侧，而非实现类（因为 Web API Maker 读取 `Method` 的来源
 * 正是本接口的类对象）。
 */
@IMAuthentication
public interface OrderEndpoint {

    /**
     * 指定订单ID获取订单信息。
     * @param orderId 订单ID
     * @return 订单信息
     */
    @Path("/foo/orders/{orderId}")
    @GET
    OrderEntity get(@Required @Variable(name = "orderId") String orderId);
}
```

```java
package jp.co.example.foo.webapi;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * {@link OrderEndpoint} 的标准实现类。<br>
 * 仅负责 HTTP 请求的接收・参数转换，业务逻辑委托给 {@link OrderService}。<br>
 * `@Path` 等注解已在接口一侧（{@link OrderEndpoint}）声明，因此本类不再附加。
 */
public class StandardOrderEndpoint implements OrderEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Override
    public OrderEntity get(final String orderId) {
        return orderService.findById(orderId);
    }
}
```

`OrderService` 接口・`StandardOrderService` 标准实现类・`OrderServiceFactory` 工厂类（基于 `ServiceLoaderUtil.loadTopPriority` 的可替换获取方式）的实现模式请参考 `java-im-mirage-usage` 技能的 `assets/mirage-basic-usage.md` 的「模式7：Service 层」。Endpoint 类仅依赖 `OrderService` 接口，不会像 `new StandardOrderService()` 那样直接生成具体类。

- 工厂类必须具备 `@WebAPIMaker`/`@ProvideFactory`/`@ProvideService` 三件套。不要在 Endpoint 接口・Standard 实现类一侧附加这些注解
- **Endpoint 的接口化并非必须。** 与 Repository/Service 不同，Endpoint 实际需要替换实现的场景相对有限（插入测试用 mock、按环境切换行为等）。对于没有替换计划的简单 Endpoint，可以像模式2以后那样用 `public class OrderXxxEndpoint` 单一类完成。仅在存在替换可能性时，才采用本模式的三类构成
- `OrderEntity` 是模型类。需要具备 `public`・无参构造函数・getter/setter（参见 `reference/web-api-maker-api-reference.md` 的「参数・返回值可指定的类型」）。Mirage 实体（public 字段方式）与 Web API Maker 的响应模型（必须具备 getter/setter）要求不同，因此若直接返回从 DB 获取的实体，需确认是否需要转换
- `OrderRepository`/`StandardOrderRepository`/`OrderRepositoryFactory`（包含通过 DAOFactory・SessionTemplate 进行的事务管理、基于 `ServiceLoaderUtil` 的工厂）的实现请参考 `java-im-mirage-usage` 技能的 `assets/mirage-basic-usage.md`
- 仅靠此模式无法正常工作。**务必同时进行「模式8：包的注册」**

## 模式2：参数绑定（`@Variable`/`@Parameter`/`@Body`/`@Bean`）

Endpoint 类仅负责委托给 Service，以下模式主要展示委托给 `orderService` 字段（与模式1同样生成）的部分。为节省篇幅，模式2以后假设为无需替换实现的简单 Endpoint，简化为 `public class` 单一类进行展示（参见模式1末尾的注记。若存在替换可能性，则与模式1相同拆分为接口 + Standard 实现类）。

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Body;
import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Parameter;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.PUT;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

import java.util.List;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

@IMAuthentication
public class OrderSearchEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    /**
     * 按状态检索订单列表（查询参数示例）。
     * @param status 检索对象的状态（可选指定）
     * @param limit 获取件数上限（未指定时依赖调用方的类型转换，因此默认值的处理需在实现中明确）
     * @return 订单列表
     */
    @Path("/foo/orders")
    @GET
    public List<OrderEntity> search(@Parameter(name = "status") final String status,
                               @Parameter(name = "limit") final int limit) {
        return orderService.search(status, limit);
    }

    /**
     * 更新订单信息（路径参数 + 请求体示例）。
     * @param orderId 订单ID
     * @param order 从请求体转换而来的订单信息
     */
    @Path("/foo/orders/{orderId}")
    @PUT
    public void update(@Required @Variable(name = "orderId") final String orderId, @Body final OrderEntity order) {
        orderService.update(orderId, order);
    }
}
```

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Bean;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Body;
import jp.co.intra_mart.foundation.web_api_maker.annotation.PUT;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 将多个参数来源汇总到一个 Bean 的示例。
 * 防止在参数较多的方法中参数列表膨胀。
 */
public class OrderUpdateEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    public static class UpdateRequest {
        private String orderId;
        private OrderEntity order;

        @Required
        @Variable(name = "orderId")
        public void setOrderId(final String orderId) {
            this.orderId = orderId;
        }

        public String getOrderId() {
            return orderId;
        }

        @Required
        @Body
        public void setOrder(final OrderEntity order) {
            this.order = order;
        }

        public OrderEntity getOrder() {
            return order;
        }
    }

    @Path("/foo/orders/{orderId}")
    @PUT
    public void update(@Bean final UpdateRequest request) {
        orderService.update(request.getOrderId(), request.getOrder());
    }
}
```

- `@Variable` 用于路径参数（需与 `@Path` 中的 `{xxx}` 和 `name` 一致），`@Parameter` 用于查询/表单参数，`@Body` 将整个请求体绑定到一个模型
- 附加了 `@Required` 的参数若未指定，将作为请求格式不正确返回错误响应（参见 `reference/web-api-maker-api-reference.md` 的 HTTP 状态码对照表）
- 使用 `@Bean` 时，需在汇总目标类的 setter 上附加取得来源注解（`@Variable`/`@Parameter`/`@Body`/`@Header` 等）。与模型类相同，需具备 getter/setter

## 模式3：Basic 认证 API

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.BasicAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 通过 Basic 认证访问的 Web API 的 Endpoint 类。
 * 端点为 "/basic" + {@code @Path} 的值（例如：/basic/foo/orders/summary）。
 */
@BasicAuthentication
public class OrderSummaryEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders/summary")
    @GET
    public OrderSummary summary() {
        return orderService.summarize();
    }
}
```

- 类上只能附加一个认证注解。不要同时使用 `@IMAuthentication`/`@BasicAuthentication`/`@OAuth`

## 模式4：OAuth 认证 API（以其他模块为前提）

`@OAuth` 若未额外导入 Web API Maker OAuth认证模块则无法工作。以已导入为前提，需同时实现 Endpoint 类侧和配置文件侧。

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.OAuth;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 通过 OAuth2 认证访问的 Web API 的 Endpoint 类。
 * 端点为 pathPrefix（默认 "/oauth"）+ {@code @Path} 的值。
 */
@OAuth(scope = "order-read")
public class OrderExternalEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders/{orderId}")
    @GET
    public OrderEntity get(final String orderId) {
        return orderService.findById(orderId);
    }
}
```

配置文件需要在 `WEB-INF/conf/` 下配置 3 种（均作为租户环境搭建资材进行管理）。

`oauth-client-scopes-config/order-scopes.xml`（作用域定义）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<oauth-client-scopes-config
    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/scope/config/oauth-client-scopes-config">
  <scopes>
    <scope id="order-read">
      <default-subject>order-read scope</default-subject>
      <localizations>
        <localize locale="ja">
          <subject>発注情報の参照</subject>
          <text>発注情報を参照する権限を許可します。</text>
        </localize>
      </localizations>
    </scope>
  </scopes>
</oauth-client-scopes-config>
```

`oauth-client-resources-config/order-resources.xml`（资源注册。使用 `type="java"` 指定 Web API Maker 的 Endpoint 类）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<oauth-client-resources-config
    xmlns="http://intra-mart.co.jp/system/oauth/provider/client/resource/config/oauth-client-resources-config">
  <client-resources>
    <client-resource id="order-external-resource" path="/oauth/foo/orders" type="java"
                      target="jp.co.example.foo.webapi.OrderExternalEndpoint">
      <authz uri="service://foo/orders" action="execute"/>
      <scope id="order-read"/>
    </client-resource>
  </client-resources>
</oauth-client-resources-config>
```

- `oauth-client-details-config`（OAuth 客户端应用本身的注册）因环境・客户端而异，本模式中省略。请遵循现有租户环境搭建资材的构成
- `authz` 元素中指定的 `uri`/`action`，需要事先在 IM-Authz 侧完成资源注册・策略配置（参见「模式5：IM-Authz 联动」）

## 模式5：IM-Authz 联动（授权检查）

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.authz.annotation.Authz;
import jp.co.intra_mart.foundation.web_api_maker.annotation.DELETE;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Variable;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 在删除操作之前进行 IM-Authz 授权检查的示例。
 * uri="service://foo/orders" 需要事先在 java-im-authz-usage 一侧
 * 通过 ResourceManager#registerAsResource 等方式注册完成。
 */
@IMAuthentication
@Authz(uri = "service://foo/orders", action = "delete")
public class OrderDeletionEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders/{orderId}")
    @DELETE
    public void delete(@Required @Variable(name = "orderId") final String orderId) {
        orderService.delete(orderId);
    }
}
```

- `@Authz` 既可附加于类，也可附加于方法。附加于类时会一并应用于其下的所有方法
- 未认证时返回 `401`，已认证但无权限时返回 `403`（Web API Maker 一侧无需自行实现该分支处理）
- **仅附加 `@Authz` 并不能生效。** 若 `uri` 指定的资源在 IM-Authz 侧未注册，将始终授权失败（`403` 等）。资源注册・策略配置请使用 `java-im-authz-usage` 的实现模式
- 若希望动态决定资源，可使用 `mapperClass`/`mapperParams` 属性（`AuthzMapper` 的实现类）。详细签名请参考 `reference/web-api-maker-api-reference.md`

## 模式6：安全令牌验证（`@Secured`）

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Body;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.POST;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Required;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Secured;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * 为从浏览器调用的状态变更类 API 添加 CSRF 对策的安全令牌验证的示例。
 */
@IMAuthentication
public class OrderRegistrationEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Path("/foo/orders")
    @POST
    @Secured
    public void register(@Required @Body final OrderEntity order) {
        orderService.register(order);
    }
}
```

- `@Secured` 是 CSRF 对策的安全令牌验证。与决定「以谁的身份访问」的认证注解（`@IMAuthentication` 等）作用不同，在两者都需要的场景（从浏览器调用的状态变更类 API）中需要并用
- 在 `@BasicAuthentication`/`@OAuth`（主要用于外部系统・服务器间联动）的场合，通常不附加 `@Secured`（因为 CSRF 对策的前提是经由浏览器的会话被窃取）

## 模式7：响应控制

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Response;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ReturnValue;

/**
 * 找不到订单信息时的异常。
 * Web API Maker 捕获此异常时，将以 HTTP 404 响应。
 */
@Response(code = 404)
public class OrderNotFoundException extends Exception {

    private final String orderId;

    public OrderNotFoundException(final String orderId) {
        super("発注情報が見つかりません: orderId=" + orderId);
        this.orderId = orderId;
    }

    /**
     * 需包含在响应体中的补充信息。
     * @return 对象的订单ID
     */
    @ReturnValue
    public String getOrderId() {
        return orderId;
    }
}
```

```java
package jp.co.example.foo.webapi;

import java.io.IOException;

import javax.servlet.http.HttpServletResponse;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.IMAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;
import jp.co.intra_mart.foundation.web_api_maker.annotation.PreventWritingResponse;

/**
 * 抑制 Web API Maker 的自动响应写入，手动进行重定向的示例。
 */
@IMAuthentication
public class OrderRedirectEndpoint {

    @Path("/foo/orders/legacy")
    @GET
    @PreventWritingResponse
    public void redirect(final HttpServletResponse response) throws IOException {
        response.sendRedirect("/foo/orders");
    }
}
```

- 为异常类附加 `@Response(code=...)`，可以在该异常被抛出时控制状态码。附加了 `@ReturnValue` 的方法的返回值会被包含在响应体中
- 附加了 `@PreventWritingResponse` 的方法不会执行 Web API Maker 一侧的自动响应写入，因此需要通过参数接收 `HttpServletResponse` 并自行响应

## 模式8：包的注册（最容易遗漏的实现）

在 `META-INF/im_web_api_maker/packages` 中，逐行记载 Endpoint 类（而非工厂类，是实现所在的包）的包名。

```
jp.co.example.foo.webapi
```

- 若没有此注册，即使正确附加了注解，也不会被识别为服务，访问端点会变成 `404`
- 若 Endpoint 类跨多个包配置，需将各目标包逐行追加

## 模式9：反模式集（应避免）

```java
// NG: 附加多个认证注解（互斥选择，行为不确定）
@IMAuthentication
@BasicAuthentication
public class BadEndpoint { }

// NG: 模型类没有无参构造函数
public class OrderEntity {
    public OrderEntity(final String id) { this.id = id; } // 只有此构造函数 → 转换会失败
    private String id;
}

// NG: @Variable 的 name 与 @Path 的 {xxx} 不一致
@Path("/foo/orders/{orderId}")
@GET
public OrderEntity get(@Variable(name = "id") final String orderId) { // "orderId" ≠ "id"
    return orderService.findById(orderId);
}

// NG: 只附加 @Authz，却未在 IM-Authz 一侧进行资源注册
// → 因 uri="service://foo/orders" 未注册，将始终授权失败（403）
@Authz(uri = "service://foo/orders", action = "execute")
public class UnregisteredResourceEndpoint { }

// NG: 使用了 @OAuth，却未导入 Web API Maker OAuth认证模块
// → 注解本身可以附加，但运行时不会按预期工作
@OAuth(scope = "order-read")
public class MissingModuleEndpoint { }

// NG: 忘记在 META-INF/im_web_api_maker/packages 中注册
// → 即使正确实现了以上全部内容，端点也会变成 404

// NG: 从 Endpoint 类直接调用 DAOFactory/SqlManager
// → Service/Repository 层形同虚设，业务逻辑的可复用性・可测试性会丧失
@IMAuthentication
public class BadDirectAccessEndpoint {
    @Path("/foo/orders/{orderId}")
    @GET
    public OrderEntity get(@Variable(name = "orderId") final String orderId) {
        final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class); // 不要从 Endpoint 直接调用 DAO
        return dao.find(orderId);
    }
}

// NG: 将 Endpoint 接口化后，却将 @ProvideService 的返回值类型保留为实现类
// → 因为 Web API Maker 会将 @ProvideService 的「声明上的返回值类型」识别为 API 类，
//    若将返回值类型设为实现类（StandardOrderEndpoint），@Path 等注解
//    仅存在于接口一侧而无法被识别，端点将不会被注册
@WebAPIMaker
public class BadEndpointFactory {
    @ProvideFactory
    public static BadEndpointFactory getFactory() {
        return new BadEndpointFactory();
    }

    @ProvideService
    public StandardOrderEndpoint getService() { // NG: 应设为 OrderEndpoint（接口）
        return new StandardOrderEndpoint();
    }
}
```
