# Web API Maker API Reference (Java Edition)

Based on the intra-mart Accel Platform official documentation (Web API Maker Programming Guide) and the javadoc (`jp.co.intra_mart.foundation.web_api_maker.annotation` package). Do not supplement methods/attributes from memory or guesswork.

## Package Structure

```
jp.co.intra_mart.foundation.web_api_maker.annotation
├── WebAPIMaker            … Base annotation applied to factory classes
├── ProvideFactory          … Applied to a factory's instance-retrieval method
├── ProvideService           … Applied to a service's instance-retrieval method
├── IMAuthentication         … Supports session authentication (Cookie)
├── BasicAuthentication      … Supports Basic authentication
├── OAuth                    … Supports OAuth2 authentication (requires a separate module)
├── Path                     … Represents the HTTP path
├── GET / POST / PUT / DELETE … Represent the HTTP method (each annotation extends HttpMethod)
├── Parameter                … Retrieves a value from a query/form parameter
├── Header                   … Retrieves a value from a request header
├── Variable                 … Retrieves a value from a path parameter (PathVariables)
├── Body                     … Retrieves a value from the request body
├── Bean                     … Aggregates multiple parameter sources into a single object
├── Required                 … Indicates that an argument is required
├── ArgumentSource            … A base-level designation representing the source from which a parameter is retrieved
├── Secured                  … Performs a secure token check
├── Administrator            … Supports session authentication by a system administrator
├── Response                 … Specifies the HTTP response status code when an exception occurs
├── ReturnValue               … Allows exception information to be returned as response data
├── PreventWritingResponse    … Suppresses response writing by Web API Maker (manual control)
├── Category                  … Represents the Java-API category in the API specification
└── Tag                       … Represents the Java-API tag in the API specification
```

```
jp.co.intra_mart.foundation.authz.annotation
└── Authz                    … Authorization annotation for IM-Authz integration (not exclusive to Web API Maker; belongs to IM-Authz itself)
```

## Class Registration Annotations

### `@WebAPIMaker` / `@ProvideFactory` / `@ProvideService`

A set of three annotations applied to the factory class. Class names follow this project's naming conventions (`.github/instructions/java-naming.instructions.md`): `Xxx` + `EndpointFactory` / `Xxx` + `Endpoint` (the annotation name `@ProvideService` itself is a fixed specification on the Web API Maker side and must not be changed. See "Architecture and Class Naming" in `SKILL.md` for details).

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

- The method annotated with `@ProvideFactory` must be `static` and return an instance of the factory class itself
- The method annotated with `@ProvideService` returns an instance of the Endpoint class (the "service class" in the Web API Maker official documentation) (an instance method)
- Do not apply these annotations to the Endpoint class itself

## Authentication Annotations (applied to the class, mutually exclusive)

| Annotation | Purpose | Endpoint | Notes |
|------|------|------|------|
| `@IMAuthentication` | Access based on the authentication state of the session tied to the Cookie | Same as the `@Path` value | Performs no special authentication processing |
| `@BasicAuthentication` | Basic authentication | `/basic` + the `@Path` value (the prefix can be changed via an attribute) | |
| `@OAuth` | OAuth2 authentication | `pathPrefix` (default `/oauth`) + the `@Path` value + `pathSuffix` (default empty string) | Requires separately introducing the Web API Maker OAuth authentication module and specifying the `scope` attribute |
| `@Administrator` | Session authentication by a system administrator | — | Dedicated to APIs for system administrators |

### `@OAuth` Attributes

| Attribute | Meaning | Default value | Required |
|------|------|------|------|
| `scope` | The scope ID this API requires (corresponds to the `id` defined in `oauth-client-scopes-config`) | none | Yes |
| `pathPrefix` | The endpoint prefix | `"/oauth"` | - |
| `pathSuffix` | The endpoint suffix | `""` | - |

## Routing Annotations (applied to methods)

- `@Path("/foo/orders/{orderId}")` — Specifies the URL path. Can be turned into a path variable using the `{xxx}` format
- `@GET` / `@POST` / `@PUT` / `@DELETE` — Specifies the HTTP method. Only one per method

## Parameter Annotations (applied to an argument or a Bean's setter)

| Annotation | Source | Main attributes |
|------|------|------|
| `@Parameter` | Query/form parameter | `name` (parameter name) |
| `@Header` | Request header | `name` (header name) |
| `@Variable` | Path parameter (corresponds to `{xxx}` in `@Path`) | `name` (must match the variable name inside `@Path`) |
| `@Body` | The entire request body | — |
| `@Bean` | Any class that aggregates the above | — |
| `@Required` | Indicates that an argument is required (used together with other annotations) | — |

- When using `@Bean`, apply the individual source annotations (`@Variable`/`@Parameter`/`@Body`/`@Header`) to the setters of the aggregation target class. The aggregation target class must also have a complete set of getters/setters
- If an argument annotated with `@Required` is not specified, the request is treated as malformed and an error response is returned (see the HTTP status code correspondence table)

## Security Annotations

- `@Secured` — Applied to a method. Performs a secure token check (CSRF countermeasure). Intended for use with state-changing APIs called from a browser
- `@Authz` (`jp.co.intra_mart.foundation.authz.annotation.Authz`; not exclusive to Web API Maker, but an annotation belonging to IM-Authz itself) — Applied to a class or method. Performs an authorization decision via IM-Authz before executing the Web API

### `@Authz` Attributes

| Attribute | Meaning | Default value |
|------|------|------|
| `uri` | The URI of the resource subject to authorization | `""` (empty string) |
| `action` | The action name | `"execute"` |
| `mapperClass` | The authorization mapper class (for dynamically determining the resource) | `EmptyResourceMapper.class` |
| `mapperParams` | Parameters passed to the mapper class (`AuthzMapperParam[]`) | `{}` (empty array) |

- Can be applied to either a class or a method. Applying it to a class applies it collectively to all methods within it
- Behavior on failure: unauthenticated → `401`, authenticated but lacking permission → `403`. **However, when combined with `@IMAuthentication` (session authentication), an unauthenticated request is stopped as `404` before it ever reaches this check, so `401` effectively never occurs.** A `403` for an authenticated user comes back wrapped (see "Request/Response Format")
- The resource specified in `uri` must be pre-registered on the IM-Authz side (see `ResourceManager` in `java-im-authz-usage`). Simply attaching this annotation alone has no effect

## Response Control Annotations

| Annotation | Applied to | Purpose |
|------|------|------|
| `@Response(code=...)` | Exception class | Specifies the HTTP status code to use when that exception is thrown |
| `@ReturnValue` | A method (getter) of the exception class | Includes the exception's supplementary information in the response body |
| `@PreventWritingResponse` | Method | Suppresses automatic response writing by Web API Maker, allowing manual control by receiving `HttpServletResponse` as an argument. **The method's return value is always ignored** |

## Types Allowed for Arguments and Return Values

- Primitive types (`int`/`String`/`boolean`, etc.)
- Arrays
- `List`/`Set`
- `byte[]` (binary data)
- `InputStream`
- Model classes combining the above (must be `public`, must have a no-argument constructor, and only members with a matching getter/setter pair are subject to input/output)

To support exchange in XML format, apply `@XmlRootElement` to the model class.

## Session Management Behavior (by Authentication Method)

Behavior for the three-level setting `keep`/`once`/`never`.

| Setting value | `@IMAuthentication` | `@BasicAuthentication` / `@OAuth` |
|------|------|------|
| `keep` | No session management is performed | If unauthenticated, logs in, and remains logged in after execution |
| `once` | No session management is performed | If unauthenticated before execution, logs out after execution |
| `never` | Logs out after execution if in a logged-in state | Logs out after execution if in a logged-in state (`OAuth` differs from `BasicAuthentication` in that its `keep` behavior is not limited to transitions from an unauthenticated state) |

## HTTP Status Code Correspondence Table

| Code | Meaning |
|------|------|
| `200` | Success |
| `400` | Malformed request (e.g., a `@Required` argument was not specified) |
| `401` | Unauthenticated |
| `403` | Authenticated but lacking permission (e.g., `@Authz` check failed) |
| `404` | URL mismatch (package not registered, incorrect `@Path`, etc.), or an exception annotated with `@Response(code=404)` |
| `405` | HTTP method mismatch |
| `406` | Mismatch between the `Accept` header and the output formats available |
| `415` | Invalid `Content-Type` |
| `500` | Server error |

Whether the response body for a given code takes the wrapper structure (`error`/`data`) is not determined by the code value alone. See "When the Wrapper Is Applied and When It Isn't" under "Request/Response Format".

## Referencing the API Specification

The specification of a created API can be retrieved in JSON format (Swagger-compatible) at the following URL.

```
http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}
```

`${api-category}` corresponds to `@Category` (or its default classification when unspecified). It can also be visually confirmed and executed from the Swagger UI.

## Request/Response Format

- The request format is specified via the `Content-Type` header (`application/json` or `application/xml`)
- The response is returned in the MIME type specified by the `Accept` header (`application/json` or `application/xml`)
- `null` properties in the response are not output

### Response Body Wrapper Structure

**The Endpoint method's return value does not become the response body as-is; it is always wrapped in an object that has `error` / `data`.** If the client (screen or external system) reads properties directly without unwrapping this envelope, it ends up "unable to receive data" even though the API itself works correctly.

On success (`Accept: application/json`):

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

On exception (when Web API Maker catches an exception thrown by the Endpoint method):

```json
{
  "error": true,
  "errorMessage": "[E.IWP.WEBAPIMAKER.CONVERTER.10001] Failed to convert from the JSON string. json:434343"
}
```

When `@ReturnValue` is placed on getters of the exception class, those return values are stored under `data`:

```json
{
  "error": true,
  "errorMessage": "An exception occurred.",
  "data": {
    "optionalMessage": "No information exists for the id that was entered.",
    "parameterValue": 111111
  }
}
```

| Property | Type | Content |
|------|------|------|
| `error` | boolean | Whether an exception occurred. `false` on success, `true` on exception |
| `data` | object | On success, the Endpoint method's return value. On exception, the values of getters annotated with `@ReturnValue` (not output when there is no `@ReturnValue`) |
| `errorMessage` | string | The exception message, output only on exception. Not output on success |

- When the return value is a `List`/array, `data` becomes a JSON array. The outer wrapper structure is the same regardless of the return type
- **A method annotated with `@PreventWritingResponse` does not get this wrapper.** The method's return value is always ignored, and the implementer writes the body themselves onto the `HttpServletResponse` received as an argument (`sendRedirect()` / `getWriter()` / `getOutputStream()`, etc.)
- A business exception annotated with `@Response(code=...)` is still returned in this wrapper structure even with an HTTP status code other than `200`
- After implementing, check the actual response with the Swagger UI (`/api-docs/${api-category}`) or `curl` and reconcile it with the client-side parsing logic

### When the Wrapper Is Applied and When It Isn't

Whether the wrapper structure (`error`/`data`) is applied is determined neither by the HTTP status code value nor by whether `@Response` is present. It is determined by **whether the request reached the Endpoint method — i.e., went through reflection's `Method#invoke`**. `Method#invoke` always wraps any exception thrown by the invoked method in an `InvocationTargetException`, and Web API Maker always converts that into a wrapped response. Conversely, a response or exception that occurs before the Endpoint method is reached (authentication checks, various `ActionFilter`s, etc.) is not wrapped unless that specific code explicitly invokes the wrapping logic.

**Wrapped** (JSON/XML with `error`/`data`):

| Case | Notes |
|------|------|
| On success (`200`) | |
| An exception thrown by the Endpoint method itself (`@Response` or not) | Not only a business exception annotated with `@Response(code=...)`, but also **a plain exception with no `@Response` annotation is always wrapped** (without `@Response` the status is simply `500`). Example: `{"error":true,"errorMessage":"..."}` |
| `@Required` not specified (`400`) | Example: `{"error":true,"errorMessage":"Parameter 'name' is required."}` |
| `@Secured` token not specified (`403`) | Example: `{"error":true,"errorMessage":"[E.IWP.WEBAPIMAKER.CORE.10011] ..."}` |
| `@Authz` authorization denied for an authenticated user (`403`) | Example: `{"error":true,"errorMessage":"[E.IWP.WEBAPIMAKER.CORE.10002] ..."}` |
| `405` (method mismatch) / `415` (invalid `Content-Type`) | Same `ClientErrorException` hierarchy and code path as `400` |

**Not wrapped** (HTML or plain text):

| Case | Notes |
|------|------|
| Unauthenticated access (`@IMAuthentication` only, no `@Authz`) | `404`, `Content-Type: text/html`, intra-mart's standard generic error page. Note: **this comes back as `404`, not `401`.** The authentication check itself happens upstream of Web API Maker's action/filter layer, and the request never reaches the Endpoint method |
| Unauthenticated access to an endpoint with `@Authz` | Also `404`. The "unauthenticated → 401" branch documented for `@Authz` effectively never fires with `@IMAuthentication` (session authentication), because the request is already stopped as `404` before reaching the `@Authz` check |
| An exception that occurs inside an `ActionFilter` and is not explicitly caught by that filter (e.g. a `ResourceNotFoundException` thrown by IM-Authz during the `@Authz` authorization decision — `WebApiAuthzActionFilter` only catches `AnnotationValueException`, so this one passes through) | `500`, `Content-Type: text/html`, intra-mart's standard generic error page, "HTTP 500: Servlet Exception". An exception that occurs outside the Endpoint method (i.e., not via `Method#invoke`) is not wrapped unless that specific code path explicitly wraps it |
| The URL itself is not registered (package not registered, wrong `@Path`, etc.) | `404`, `Content-Type: text/html`. This action is never reached at all |
| An invalid/unresolvable `Accept` header (`406`) | `RestResponseUtil.setErrorResponseByPlainText` explicitly fixes the format to plain text |

**Out of scope**: the response format when authentication fails under `@BasicAuthentication`/`@OAuth`. These use a different authentication mechanism and code path than `@IMAuthentication` (session authentication), so the above does not necessarily apply

### Client-Side Evaluation Order

1. Check the HTTP status code
2. Try to parse the body (a business exception annotated with `@Response(code=...)` is returned in the wrapper structure even with a status other than `200`, so do not stop at the status code alone)
3. Only when the body parses and `error` is `false`, use `data` as business data
4. When `error` is `true`, treat `errorMessage` (and the `@ReturnValue` values inside `data`) as the error information
5. When parsing fails, or the `error` property is absent (including the "cases where the wrapper is not guaranteed" in the table above), treat it as an unexpected error

For a client-side implementation example, see "Pattern 7: Response Control" in `assets/web-api-maker-basic-usage.md`.
