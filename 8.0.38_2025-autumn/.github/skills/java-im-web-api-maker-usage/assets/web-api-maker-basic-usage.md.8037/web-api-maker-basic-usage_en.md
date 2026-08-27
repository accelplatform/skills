# Web API Maker Basic Usage Patterns (Java Edition)

For the attributes and signatures of each annotation, see `reference/web-api-maker-api-reference.md`. This document shows typical implementation patterns.

## Class Naming and Architecture (Most Important)

Classes that carry the `@Path`/HTTP method annotations required by Web API Maker are called "service classes" in the official documentation and javadoc, but **this project's naming convention (`.github/instructions/java-naming.instructions.md`) gives classes in this role the `Endpoint` suffix.** In the patterns below, all such classes are consistently named `Xxx` + `Endpoint` / `Xxx` + `EndpointFactory`, so be aware of this difference from the Web API Maker terminology.

An Endpoint class is responsible only for accepting HTTP requests, converting parameters, and converting responses — it must not hold business logic or direct DB access. It holds an `Xxx` + `Service` (business logic) field and delegates processing to it. Implementing DB access (Repository/DAO) is covered by the `java-im-mirage-usage` skill.

**A Service is structured the same way as a Repository, as three parts: an interface + a Standard implementation class + a factory class.** An Endpoint class depends only on the `Xxx` + `Service` interface, and must not directly instantiate the concrete class like `new StandardXxxService()` — it obtains the instance via `XxxServiceFactory.getInstance()` (a swappable lookup based on `ServiceLoaderUtil.loadTopPriority`; for details, see "Factory Classes for Repository/Service" in the `java-im-mirage-usage` skill).

**The Endpoint itself can be split the same way, into an interface + a Standard implementation class, with a swappable lookup based on `ServiceLoaderUtil.loadTopPriority`.** This is grounded in how Web API Maker is implemented internally: the `@ProvideService` method has its **declared return type** recognized as the "API class" — Web API Maker walks that class's `Method`s (`api.getMethods()`) to read annotations such as `@Path`, then invokes them at runtime via reflection (`Method#invoke(instance, args)`). Because of this, if the return type is set to `Xxx` + `Endpoint` (an interface) with `@IMAuthentication`/`@Path`/`@GET`/`@Parameter` and the like declared on it, the mechanism works correctly even against an instance of an implementation class (`StandardXxxEndpoint`, or an alternate implementation swapped in via `META-INF/services`).

```
Endpoint (@Path/@GET etc. Only accepts HTTP requests and calls the Service)
    ↓
Service (the business logic itself)
    ↓
Repository (abstraction of DB access. See java-im-mirage-usage)
    ↓
DAO (see java-im-mirage-usage)
```

## Pattern 1: Minimal Configuration (Factory class + Endpoint interface + Standard implementation class + Service class, `@IMAuthentication`)

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.common.aid.jdk.java.util.ServiceLoaderUtil;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ProvideFactory;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ProvideService;
import jp.co.intra_mart.foundation.web_api_maker.annotation.WebAPIMaker;

/**
 * Factory class for the order information Web API (the {@code @WebAPIMaker} class required by the Web API Maker convention).<br>
 * This class itself is the fixed entry point required by the Web API Maker framework, and is a separate
 * mechanism unrelated to the {@code ServiceLoaderUtil}-based factory classes (e.g. {@code OrderServiceFactory}) —
 * note the similarity of names despite being unrelated.<br>
 * The return type of {@link #getService()} is {@link OrderEndpoint} (an interface). Registering an implementation
 * class under {@code META-INF/services/jp.co.example.foo.webapi.OrderEndpoint} lets
 * {@link ServiceLoaderUtil#loadTopPriority(Class)} swap in the higher-priority implementation.
 * If nothing is registered, {@link StandardOrderEndpoint} is used as the default implementation.
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
     * Gets an instance of the factory.
     * @return the factory instance
     */
    @ProvideFactory
    public static OrderEndpointFactory getFactory() {
        return new OrderEndpointFactory();
    }

    /**
     * Gets an instance of the Endpoint.
     * @return the Endpoint instance
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
 * Endpoint interface for the Web API that provides order information.<br>
 * Accessed via cookie-based session authentication (the browser's login state).<br>
 * Declare class-level annotations such as `@IMAuthentication`, and `@Path`/`@GET`/argument annotations,
 * on this interface rather than on the implementation class (Web API Maker reads the `Method`s from
 * this interface's class object).
 */
@IMAuthentication
public interface OrderEndpoint {

    /**
     * Gets order information for the specified order ID.
     * @param orderId the order ID
     * @return the order information
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
 * Standard implementation class for {@link OrderEndpoint}.<br>
 * It only accepts the HTTP request and converts parameters, delegating business logic to {@link OrderService}.<br>
 * The `@Path` and other annotations are already declared on the interface side ({@link OrderEndpoint}), so they
 * are not attached to this class.
 */
public class StandardOrderEndpoint implements OrderEndpoint {

    private final OrderService orderService = OrderServiceFactory.getInstance();

    @Override
    public OrderEntity get(final String orderId) {
        return orderService.findById(orderId);
    }
}
```

For the implementation pattern of the `OrderService` interface, the `StandardOrderService` standard implementation class, and the `OrderServiceFactory` factory class (a swappable lookup based on `ServiceLoaderUtil.loadTopPriority`), see "Pattern 7: Service Layer" in `assets/mirage-basic-usage.md` of the `java-im-mirage-usage` skill. The Endpoint class depends only on the `OrderService` interface and never directly instantiates the concrete class like `new StandardOrderService()`.

- The factory class requires the trio `@WebAPIMaker`/`@ProvideFactory`/`@ProvideService`. Do not add these to the Endpoint interface or the Standard implementation class
- **Making the Endpoint an interface is not mandatory.** Unlike Repository/Service, the situations where you actually need to swap an Endpoint implementation are limited (injecting a test mock, switching behavior per environment, etc.). For a simple Endpoint with no planned swapping, it is fine to keep it as a single `public class OrderXxxEndpoint`, as shown from Pattern 2 onward. Adopt this pattern's three-class structure only when swappability is actually needed
- `OrderEntity` is a model class. It must be `public`, have a no-argument constructor, and have complete getters/setters (see "Types Allowed for Arguments and Return Values" in `reference/web-api-maker-api-reference.md`). Mirage entities (public field style) and Web API Maker response models (getter/setter required) have different requirements, so when returning an entity obtained from the DB as-is, check whether conversion is needed
- For the implementation of `OrderRepository`/`StandardOrderRepository`/`OrderRepositoryFactory` (including transaction management via DAOFactory and SessionTemplate, and the factory based on `ServiceLoaderUtil`), see `assets/mirage-basic-usage.md` in the `java-im-mirage-usage` skill
- This pattern alone will not work. **Be sure to also perform "Pattern 8: Package Registration"**

## Pattern 2: Parameter Binding (`@Variable`/`@Parameter`/`@Body`/`@Bean`)

The Endpoint class only delegates to the Service; the following patterns focus mainly on the delegation part to the `orderService` field (generated the same way as in Pattern 1). For brevity, from Pattern 2 onward each example assumes a simple Endpoint that does not need to be swappable, and is shown simplified as a single `public class` (see the note at the end of Pattern 1 — if swappability is needed, split it into an interface + a Standard implementation class as in Pattern 1).

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
     * Searches the order list by status (example of query parameters).
     * @param status the status to search for (optional)
     * @param limit the maximum number of results to return (when unspecified, behavior depends on the caller's type conversion, so make default-value handling explicit in the implementation)
     * @return the list of orders
     */
    @Path("/foo/orders")
    @GET
    public List<OrderEntity> search(@Parameter(name = "status") final String status,
                               @Parameter(name = "limit") final int limit) {
        return orderService.search(status, limit);
    }

    /**
     * Updates order information (example of a path parameter + request body).
     * @param orderId the order ID
     * @param order order information converted from the request body
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
 * Example of aggregating multiple parameter sources into a single Bean.
 * Prevents the argument list from becoming bloated in methods with many parameters.
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

- `@Variable` is a path parameter (its `name` must match the `{xxx}` in `@Path`); `@Parameter` is a query/form parameter; `@Body` binds the entire request body to a single model
- If an argument annotated with `@Required` is not supplied, the request is treated as malformed and an error response is returned (see the HTTP status code table in `reference/web-api-maker-api-reference.md`)
- When using `@Bean`, attach the source annotations (`@Variable`/`@Parameter`/`@Body`/`@Header`, etc.) to the setters of the aggregating class. As with model classes, both getters and setters must be present

## Pattern 3: Basic Authentication API

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.BasicAuthentication;
import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * Endpoint class for a Web API accessed via Basic authentication.
 * The endpoint becomes "/basic" + the value of {@code @Path} (e.g. /basic/foo/orders/summary).
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

- Only one authentication annotation can be attached to a class. Do not combine `@IMAuthentication`/`@BasicAuthentication`/`@OAuth`

## Pattern 4: OAuth Authentication API (Requires an Additional Module)

`@OAuth` only works if the Web API Maker OAuth authentication module has been additionally installed. Assuming it is already installed, implement both the Endpoint class side and the configuration file side.

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.GET;
import jp.co.intra_mart.foundation.web_api_maker.annotation.OAuth;
import jp.co.intra_mart.foundation.web_api_maker.annotation.Path;

import jp.co.example.foo.service.OrderService;
import jp.co.example.foo.service.OrderServiceFactory;

/**
 * Endpoint class for a Web API accessed via OAuth2 authentication.
 * The endpoint becomes the pathPrefix (default "/oauth") + the value of {@code @Path}.
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

Three types of configuration files are needed under `WEB-INF/conf/` (all managed as tenant environment setup assets).

`oauth-client-scopes-config/order-scopes.xml` (scope definition):

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

`oauth-client-resources-config/order-resources.xml` (resource registration; use `type="java"` to specify the Web API Maker Endpoint class):

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

- `oauth-client-details-config` (registration of the OAuth client application itself) varies by environment and client, so it is omitted from this pattern. Follow the structure of your existing tenant environment setup assets
- The `uri`/`action` specified in the `authz` element requires prior resource registration and policy configuration on the IM-Authz side (see "Pattern 5: IM-Authz Integration")

## Pattern 5: IM-Authz Integration (Authorization Check)

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
 * Example of performing an IM-Authz authorization check before a delete operation.
 * uri="service://foo/orders" must already be registered on the java-im-authz-usage side
 * via ResourceManager#registerAsResource or similar beforehand.
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

- `@Authz` can be attached to either a class or a method. Attaching it to a class applies it to all methods within
- When unauthenticated, `401` is returned; when authenticated but lacking permission, `403` is returned (no branching logic is needed on the Web API Maker side)
- **Attaching `@Authz` alone does not make it work.** If the resource specified in `uri` is not registered on the IM-Authz side, authorization always fails (`403`, etc.). Use the implementation patterns in `java-im-authz-usage` for resource registration and policy configuration
- To determine the resource dynamically, use the `mapperClass`/`mapperParams` attributes (an implementation class of `AuthzMapper`). See `reference/web-api-maker-api-reference.md` for the detailed signature

## Pattern 6: Secure Token Verification (`@Secured`)

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
 * Example of adding secure token verification for CSRF protection to a state-changing API called from a browser.
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

- `@Secured` performs secure token verification for CSRF protection. It plays a different role from authentication annotations (such as `@IMAuthentication`) that determine "who is accessing", so both are used together where needed (state-changing APIs called from a browser)
- With `@BasicAuthentication`/`@OAuth` (mainly intended for external systems and server-to-server integration), it is common not to attach `@Secured` (since CSRF protection assumes session hijacking via the browser)

## Pattern 7: Response Control

```java
package jp.co.example.foo.webapi;

import jp.co.intra_mart.foundation.web_api_maker.annotation.Response;
import jp.co.intra_mart.foundation.web_api_maker.annotation.ReturnValue;

/**
 * Exception thrown when order information cannot be found.
 * When Web API Maker catches this exception, it responds with HTTP 404.
 */
@Response(code = 404)
public class OrderNotFoundException extends Exception {

    private final String orderId;

    public OrderNotFoundException(final String orderId) {
        super("発注情報が見つかりません: orderId=" + orderId);
        this.orderId = orderId;
    }

    /**
     * Supplementary information to include in the response body.
     * @return the target order ID
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
 * Example of suppressing the automatic response write by Web API Maker and redirecting manually.
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

- Attaching `@Response(code=...)` to an exception class controls the status code returned when that exception is thrown. The return value of a method annotated with `@ReturnValue` is included in the response body
- A method annotated with `@PreventWritingResponse` does not have Web API Maker's automatic response write applied, so it must receive `HttpServletResponse` as an argument and respond manually

## Pattern 8: Package Registration (the Most Commonly Missed Step)

List the package names of the Endpoint classes (the implementation package, not the factory class) one per line in `META-INF/im_web_api_maker/packages`.

```
jp.co.example.foo.webapi
```

- Without this registration, even if the annotations are correctly applied, the class is not recognized as a service and access to the endpoint results in `404`
- If Endpoint classes are spread across multiple packages, add each target package on its own line

## Pattern 9: Anti-pattern Collection (Things to Avoid)

```java
// NG: attaching multiple authentication annotations (mutually exclusive, so behavior is undefined)
@IMAuthentication
@BasicAuthentication
public class BadEndpoint { }

// NG: the model class has no no-argument constructor
public class OrderEntity {
    public OrderEntity(final String id) { this.id = id; } // only this constructor exists → conversion fails
    private String id;
}

// NG: the name in @Variable does not match the {xxx} in @Path
@Path("/foo/orders/{orderId}")
@GET
public OrderEntity get(@Variable(name = "id") final String orderId) { // "orderId" != "id"
    return orderService.findById(orderId);
}

// NG: attaching only @Authz without registering the resource on the IM-Authz side
// → since uri="service://foo/orders" is unregistered, authorization always fails (403)
@Authz(uri = "service://foo/orders", action = "execute")
public class UnregisteredResourceEndpoint { }

// NG: using @OAuth while the Web API Maker OAuth authentication module is not installed
// → the annotation itself can be attached, but it does not work as expected at runtime
@OAuth(scope = "order-read")
public class MissingModuleEndpoint { }

// NG: forgetting to register in META-INF/im_web_api_maker/packages
// → even if everything above is implemented correctly, the endpoint results in 404

// NG: calling DAOFactory/SqlManager directly from the Endpoint class
// → the Service/Repository layers become nominal, losing reusability and testability of the business logic
@IMAuthentication
public class BadDirectAccessEndpoint {
    @Path("/foo/orders/{orderId}")
    @GET
    public OrderEntity get(@Variable(name = "orderId") final String orderId) {
        final OrderDAO dao = DAOFactory.getTenantDatabaseDAO(OrderDAO.class); // do not call DAO directly from the Endpoint
        return dao.find(orderId);
    }
}

// NG: making the Endpoint an interface, but leaving @ProvideService's return type as the implementation class
// → Web API Maker recognizes @ProvideService's "declared return type" as the API class, so if the return type
//    is the implementation class (StandardOrderEndpoint), the @Path and other annotations — present only on
//    the interface — go unrecognized, and the endpoint is never registered
@WebAPIMaker
public class BadEndpointFactory {
    @ProvideFactory
    public static BadEndpointFactory getFactory() {
        return new BadEndpointFactory();
    }

    @ProvideService
    public StandardOrderEndpoint getService() { // NG: should be OrderEndpoint (the interface)
        return new StandardOrderEndpoint();
    }
}
```
