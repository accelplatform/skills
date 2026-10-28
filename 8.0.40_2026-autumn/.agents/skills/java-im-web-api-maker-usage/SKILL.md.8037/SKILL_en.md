---
name: java-im-web-api-maker-usage
description: intra-mart 固有の Web API Maker（`jp.co.intra_mart.foundation.web_api_maker.*`、`im_web_api_maker` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。アノテーション（`@WebAPIMaker`/`@ProvideFactory`/`@ProvideService`）によるファクトリ・サービスクラスの実装、`@Path` + HTTPメソッドアノテーションによるルーティング、`@Parameter`/`@Header`/`@Variable`/`@Body`/`@Bean` によるパラメータバインド、`@IMAuthentication`/`@BasicAuthentication`/`@OAuth` による認証方式の切替、`@Secured` によるセキュアトークン検証、`@Authz` による IM-Authz 連携、`@Response`/`@PreventWritingResponse`/`@ReturnValue` によるレスポンス制御の実装パターンを提供する。Java で Web API Maker を使いたい、Java で REST API を自動生成したい、JavaEE 開発モデルで @WebAPIMaker / @Path / @GET / @POST を使いたい、Web API Maker で OAuth 認証付き API を作りたい、と言及されたときに使用。認可リソース自体の登録・ポリシー設定は `java-im-authz-usage`、OAuth クライアントアプリケーション自体の登録・スコープの意味づけ設計は対象外（設定ファイルへの記述方法のみ扱う）。JSSP（スクリプト開発モデル）で REST API を作る場合は `jssp-page-generator`（通常 API）または `jssp-im-oauth-generator`（OAuth 付き API）を使うこと。
---

# intra-mart Web API Maker Usage Support Skill (Java Edition)

## Purpose

A skill set for implementing REST APIs (web services) using only annotations on Java classes, using Web API Maker (`jp.co.intra_mart.foundation.web_api_maker.*`) provided by intra-mart Accel Platform for the **JavaEE development model**.

## Basic Concepts of Web API Maker (Most Important)

Web API Maker is a mechanism that makes a class function as a web service provider simply by "attaching annotations to Java classes/methods." The implementation requires **two classes**.

| Class | Role | Required Annotations |
|------|------|------|
| Factory class | The gateway that generates Endpoint instances | `@WebAPIMaker` (class) / `@ProvideFactory` (factory retrieval method) / `@ProvideService` (instance generation method) |
| **"Endpoint class" in this document** (called a "service class" in the official Web API Maker documentation/javadoc) | The gateway for HTTP requests, having `@Path`/HTTP method annotations. Handles only parameter binding and delegation to the Service layer (does not hold the business logic itself) | Attach `@Path` + an HTTP method annotation (`@GET`/`@POST`/`@PUT`/`@DELETE`) to each method. Attach an authentication method annotation to the class |

- The endpoint is mapped directly to the URL specified by `@Path` (plus a prefix per authentication method). No routing configuration file (`routing-jssp-config`, etc.) is needed
- **There are 3 authentication methods** (`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`), mutually exclusive per class. See "Choosing an Authentication Method" for details
- **Forgetting to register the package under `META-INF/im_web_api_maker/packages` means the class will not be recognized as a service even if annotated.** This is the most common implementation oversight, so always verify it at the end of the implementation procedure

## Architecture and Class Naming (Important)

The official Web API Maker documentation/javadoc conventionally calls classes with `@Path`/HTTP method annotations "service classes," but this is terminology specific to Web API Maker itself. **Following this project's naming convention (`.agents/requirements/java-naming/AGENTS.md`'s "REST API endpoint → `Endpoint` suffix"), attach the `Endpoint` suffix to Java classes fulfilling this role** (`OrderEndpoint`, not `OrderService`).

Do not write business logic or DB access directly in the Endpoint class; delegate to the following layer structure instead.

```
Endpoint（@Path/@GET 等。HTTP リクエストの受付・パラメータ変換・Service 呼び出しのみ）
    ↓
Service（ビジネスロジック本体。`Xxx` + `Service` サフィックス）
    ↓
Repository（DB アクセスの抽象化。`Xxx` + `Repository`/`StandardXxxRepository`）
    ↓
DAO（`Xxx` + `DAO`）
```

- Implementation of the Repository/DAO layers is covered by the `java-im-mirage-usage` skill (this skill covers only up to the delegation from Endpoint to Service)
- The Endpoint class holds an instance of the Service as a field and delegates method calls to it (see pattern 1 in `assets/web-api-maker-basic-usage.md`)
- Also align the factory class name with its role (`OrderEndpointFactory`, not `OrderServiceFactory`). However, the name of the `@ProvideService` annotation itself is a fixed specification of Web API Maker and must not be changed
- **Watch out for confusingly similar-named but unrelated classes.** `OrderEndpointFactory` (in the `webapi` package; a Web API Maker-specific factory carrying `@WebAPIMaker` that generates Endpoint instances) and `OrderServiceFactory` (in the `service` package; a general-purpose factory that resolves the `OrderService` implementation via `ServiceLoaderUtil.loadTopPriority`; see "Factory classes for Repository/Service" in the `java-im-mirage-usage` skill) have similar names but are classes belonging to entirely separate mechanisms and packages
- **The Endpoint class must not directly call `SessionTemplate`/`DAOFactory` (APIs covered by `java-im-mirage-usage`).** Transaction boundaries should be established by the Service/Repository side themselves; the Endpoint has no need to be aware of these boundaries (see "Division of Responsibilities among Repository / Service / Endpoint" in the SKILL.md of `java-im-mirage-usage` for details)
- **The Endpoint itself can also be split into "interface + Standard implementation class" and made swappable via `ServiceLoaderUtil.loadTopPriority` (optional).** Web API Maker recognizes the **declared return type** of the `@ProvideService` method as the API class, scans that class's `Method`s to read annotations such as `@Path`, and invokes them via reflection at runtime. This means it works correctly even if the return type is `Xxx` + `Endpoint` (an interface) (see pattern 1 in `assets/web-api-maker-basic-usage.md`). However, unlike Repository/Service, the need for implementation swapping is limited, so **a simple Endpoint with no planned swap-out can remain a single `public class` as before** (splitting into an interface is not mandatory)

## Boundaries with Other Skills (Important)

**This skill covers only the implementation of "Web API Maker (Java annotation-based REST API)."** Similar REST API implementations are handled by different skills depending on the development model and authentication method.

| What you want to build | Responsible skill |
|------|-----------|
| A REST API via Web API Maker in Java (JavaEE development model) | **This skill** |
| A regular REST API with CSRF secure token authentication in JSSP (script development model) | `jssp-page-generator` |
| A REST API with OAuth authentication (im_oauth provider feature) in JSSP (script development model) | `jssp-im-oauth-generator` |
| CRUD of the authorization (IM-Authz) resources, subjects, and policies themselves | `java-im-authz-usage` (out of scope for this skill; the resource specified in `@Authz`'s `uri` must be registered there in advance) |
| Registration of the OAuth client application itself, and business-level design of the meaning of scopes | Out of scope for this skill. How to write entries in `oauth-client-details-config`/`oauth-client-scopes-config` is covered, but the design of the registered content itself follows instructions from the user/related documentation |

If it is not explicitly stated as "with Web API Maker" or "REST API with Java annotations," and the user simply says "I want to build a REST API," confirm with the user which development model (JSSP/Java) and which authentication method (session/Basic/OAuth) is intended.

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package, class, method, and variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method JavaDoc |

The `jssp-*` conventions are out of scope for this skill (not applied to Java files).

## API Overview

For the list of annotations, attributes, and signatures under the `jp.co.intra_mart.foundation.web_api_maker.annotation` package, see `reference/web-api-maker-api-reference.md` (do not write from memory or guesswork).

Key points:
- **All classes, interfaces, and models must be `public`, and models must have a no-argument constructor.** Only members with both a getter and setter become subject to input/output
- **Return values and arguments can use basic types, arrays, `List`/`Set`, `byte[]` (binary), `InputStream`, etc.** The response format is automatically converted according to the MIME type in the `Accept` header (JSON/XML). `null` properties are not output
- **The response body is not the Endpoint method's return value itself; it is wrapped in an object that has `error` / `data`.** On success it is `{"error": false, "data": <return value>}`, and on exception `{"error": true, "errorMessage": "...", "data": <@ReturnValue values>}`. **If the client reads it without unwrapping this envelope, the screen cannot receive the data even though the API itself is correct** (for details and an implementation example, see "Response Body Wrapper Structure" in `reference/web-api-maker-api-reference.md` and Pattern 7 in `assets/web-api-maker-basic-usage.md`)
- **Whether the wrapper is applied depends on whether the request reached the Endpoint method (i.e., went through reflection's `Method#invoke`) — not on the status code value or whether `@Response` is present.** Any exception thrown by the Endpoint method itself is always wrapped, `@Response` or not (without it, the status is simply `500`). `400` (`@Required`), `403` (`@Authz`/`@Secured`), `405`, and `415` are also wrapped. On the other hand, **an unauthenticated request (with `@IMAuthentication`) comes back as `404`, not `401`, and is not wrapped** (it never reaches the Endpoint method). `406` (invalid `Accept`) and a `500` from an exception that occurs outside the Endpoint method (e.g., in an `ActionFilter`) and is not explicitly handled there are likewise not wrapped (for details, see "When the Wrapper Is Applied and When It Isn't" in `reference/web-api-maker-api-reference.md`)
- The spec of a created API can be viewed in JSON format (Swagger compatible) at `http://<HOST>:<PORT>/<CONTEXT_PATH>/api-docs/${api-category}`

## Choosing an Authentication Method

| Annotation | Purpose | Endpoint Prefix | Additional Requirements |
|------|------|------|------|
| `@IMAuthentication` | Session authentication tied to a cookie (uses the browser's login state) | None (the `@Path` value as-is) | None |
| `@BasicAuthentication` | Basic authentication | `/basic` (changeable via an attribute) | None |
| `@OAuth` | OAuth2 authentication | `/oauth` (changeable via the `pathPrefix` attribute, default `/oauth`) | **Additional installation of the Web API Maker OAuth Authentication Module**, specifying the `scope` attribute, and the 3 OAuth-side configuration files (`oauth-client-scopes-config`/`oauth-client-resources-config`/`oauth-client-details-config`) |

The behavior of session management (`keep`/`once`/`never`) differs by authentication method. See `reference/web-api-maker-api-reference.md` for details.

## Generation Targets and Templates

| Generation Target | Template | Content |
|---------|------------|------|
| Basic implementation of factory and Endpoint classes | `assets/web-api-maker-basic-usage.md` | Minimal configuration using `@IMAuthentication`, delegation to the Service layer, package registration |
| Parameter binding | `assets/web-api-maker-basic-usage.md` | `@Variable` (path) / `@Parameter` (query) / `@Body` (entity) / `@Bean` (aggregate) |
| Basic authentication API | `assets/web-api-maker-basic-usage.md` | Implementation pattern for `@BasicAuthentication` |
| OAuth authentication API | `assets/web-api-maker-basic-usage.md` | Implementation of `@OAuth(scope=...)`, the full set of 3 configuration files |
| IM-Authz integration (authorization check) | `assets/web-api-maker-basic-usage.md` | Implementation of `@Authz(uri=..., action=...)`, integration points with `java-im-authz-usage` |
| Secure token verification | `assets/web-api-maker-basic-usage.md` | Implementation pattern for `@Secured` |
| Response control | `assets/web-api-maker-basic-usage.md` | Response body wrapper structure (`error`/`data`), exception → status code (`@Response`), manual response (`@PreventWritingResponse`), supplementary info on the exception side (`@ReturnValue`) |
| Receiving the response on the client (screen) side | `assets/web-api-maker-basic-usage.md` | A `fetch` implementation that unwraps the envelope and extracts `data`, specifying the `Accept` header, attaching the `X-Intramart-Secure-Token` header, the order of error checks |

### Reference

- `reference/web-api-maker-api-reference.md` — Attributes and signatures of all annotations under `jp.co.intra_mart.foundation.web_api_maker.annotation`, the types that can be specified for arguments/return values, a comparison of session management behavior, and an HTTP status code mapping table (based on the official documentation/javadoc content. Do not write from memory)

## When to Use

When the user makes a request such as the following:
- "I want to build a REST API in Java using Web API Maker"
- "I want to use `@WebAPIMaker`/`@Path`/`@GET` in the JavaEE development model"
- "I want to build an API with OAuth authentication using Web API Maker"
- "I want to implement a web service using only Java annotations"

If it is not explicitly stated as "with Web API Maker" or "with Java annotations," confirm the project's development model (JSSP/Java).

For requests to "newly register an authorization (Authz) resource/policy for a REST API," direct the CRUD of the resource, subject, and policy itself to `java-im-authz-usage` (this skill covers only up to attaching the `@Authz` annotation).

## Implementation Procedure

1. Gather the user's requirements (endpoint URL, HTTP method, authentication method, whether authorization is needed, input/output data structure)
2. Design the package, factory class name, and Endpoint class name (following `.agents/requirements/java-naming/AGENTS.md`. The Endpoint class is `Xxx` + `Endpoint`, and the factory class is `Xxx` + `EndpointFactory`)
3. Implement the factory class and Endpoint class referring to `assets/web-api-maker-basic-usage.md` (always refer to `reference/web-api-maker-api-reference.md` for method signatures/attributes; do not write from memory or guesswork). Do not write business logic in the Endpoint class; obtain the Service (interface) via `XxxServiceFactory.getInstance()`, hold it as a field, and delegate to it (do not instantiate it directly with `new StandardXxxService()`; see the implementation pattern for a Service that calls the Repository/DAO from `java-im-mirage-usage`). Only when the Endpoint's own implementation needs to be swappable, also split the Endpoint into "interface + Standard implementation class" and resolve it via `ServiceLoaderUtil.loadTopPriority` inside the factory class's `@ProvideService` method (see pattern 1; when not needed, the Endpoint may remain a single `public class`)
4. Register the Endpoint class's package name under `META-INF/im_web_api_maker/packages` (**the most common implementation oversight**)
5. If an authorization check is needed, attach `@Authz(uri=..., action=...)` and confirm whether the corresponding authorization resource is already registered on the IM-Authz side (if not registered, confirm with the user whether to implement the registration process using `java-im-authz-usage`)
6. If OAuth authentication is needed, confirm whether the Web API Maker OAuth Authentication Module is installed, then attach `@OAuth(scope=...)` and prepare all 3 of `oauth-client-scopes-config`/`oauth-client-resources-config`/`oauth-client-details-config`
7. **When you also implement the client that calls the API (a JSSP presentation page, an external system, etc.), always include logic that unwraps the response's `error` / `data` envelope** (`assets/web-api-maker-basic-usage.md`, Pattern 7-4). When the client is implemented by someone else or by another skill, explicitly hand over the response structure (JSON samples for success and for exceptions) to the user
8. Verify compliance with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`

## Notes

- **Forgetting to register under `META-INF/im_web_api_maker/packages` means the class will not be recognized as a service even with correct annotations.** Always check this after generation
- **All classes, interfaces, and models must be `public`, and model classes must have a no-argument constructor.** Missing either one causes conversion failure
- **Do not write DB access (`DAOFactory`/`SqlManager`, etc.) directly in the Endpoint class.** Always call the Repository/DAO (the responsibility of `java-im-mirage-usage`) via a Service class. Calling the Repository/DAO directly from the Endpoint causes the Service layer to become a mere formality, losing the reusability and testability of the business logic
- **`@OAuth` does not function with only the base module.** Inform the user that the additional installation of the Web API Maker OAuth Authentication Module is a prerequisite
- **The authorization resource specified in `@Authz`'s `uri` must be registered in advance on the IM-Authz side.** Simply attaching `@Authz` on the Web API Maker side does not make it functional; it only works together with registration on the `ResourceManager`/`PolicyManager` side via `java-im-authz-usage` (or via tenant setup import materials)
- **Secure token verification via `@Secured` and the authentication annotations (`@IMAuthentication`, etc.) are separate concerns.** The secure token is a CSRF countermeasure, while the authentication annotation determines "who is accessing"; do not conflate them in scenarios where both are needed (e.g., a state-changing API called from a browser). **The request header name is fixed as `X-Intramart-Secure-Token`** (per the `Secured` annotation's javadoc and the `WebApiSecureTokenActionFilter` implementation). When calling from a JSSP screen, the token obtained via the existing `<meta name="im_secure_token">` pattern (`.agents/requirements/jssp-presentation-page/AGENTS.md`) can be reused as-is; there is no need to invent a new way to obtain it
- **The response body is always wrapped in the `error` / `data` envelope.** The Endpoint method's return value goes under `data`. Reading it on the client without unwrapping yields `undefined`, producing the bug "the API is fine but no data shows on the screen" (the most frequent client-side oversight)
- **Any exception thrown by the Endpoint method itself is always wrapped, `@Response` or not.** `400` (`@Required`), `403` (`@Authz`/`@Secured`), `405`, and `415` are also wrapped. An unauthenticated request, however, comes back as `404` rather than `401` under `@IMAuthentication`, and is not wrapped. `406` (invalid `Accept`) and a `500` from an exception that occurs outside the Endpoint method (e.g., in an `ActionFilter`) and is not explicitly handled there are also not wrapped. A business exception annotated with `@Response(code=...)` is wrapped even with a status other than `200`, so the client should follow an evaluation order that "tries to parse the body even when the status code is not `200`" (for details, see "When the Wrapper Is Applied and When It Isn't" in `reference/web-api-maker-api-reference.md`)
- **Detailed CRUD APIs for `Effect` (IM-Authz) or authorization decisions are out of scope for this skill.** This skill covers only up to the usage of `@Authz`; do not write implementation code for resource registration or policy configuration (direct the user to `java-im-authz-usage`)

## Post-Generation Verification

Rather than an automated validation script (such as the JSSP version's `validate-jssp-code.js`), verify the following manually.

1. Whether the Endpoint class's package name is registered under `META-INF/im_web_api_maker/packages`
2. Whether the Endpoint class, model classes, and related interfaces are all `public`, and whether model classes have a no-argument constructor
3. Whether the authentication annotation attached to the class (`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`) matches the requirements, and whether multiple ones are not attached
4. If `@OAuth` is used, whether the prerequisite installation of the Web API Maker OAuth Authentication Module is satisfied and whether the `scope` attribute is specified
5. If `@Authz` is used, whether `uri`/`action` matches the registered content on the IM-Authz side (cross-check with the implementation on the `java-im-authz-usage` side)
6. Whether the `@Path` value and HTTP method annotation match the requirements gathered, and whether the path parameter (`{xxx}`) matches `@Variable(name=...)`
7. Whether the necessity of `@Secured` has been considered for state-changing endpoints (POST/PUT/DELETE), and if attached, whether the client sends the token in the `X-Intramart-Secure-Token` header
8. **Whether the class names follow the naming convention/layer structure of `Endpoint` (Web API Maker class) / `EndpointFactory` (factory) / `Service` (business logic) / `Repository` (DB access abstraction).** Whether DB access or business logic is not written directly in the Endpoint class (whether delegation flows in the order `Endpoint → Service → Repository → DAO`)
9. Whether the Endpoint class avoids directly instantiating a concrete Service class (such as `new StandardXxxService()`) and instead obtains it via `XxxServiceFactory.getInstance()` (a factory based on `ServiceLoaderUtil.loadTopPriority`)
10. If the Endpoint has been split into an interface, whether the class-level annotations (such as `@IMAuthentication`), `@Path`/`@GET`, and argument annotations are declared on the interface rather than the implementation class, and whether the **return type** of the factory class's `@ProvideService` method **is the interface** (if it remains the implementation class type, the annotations are not recognized and the endpoint is not registered)
11. **Whether the client-side (screen / external system) implementation unwraps the response's `error` / `data` envelope before using the business data.** Whether it reads the response without unwrapping, as in `fetch(url).then(function (res) { return res.json(); }).then(function (order) { order.xxx; })` (the correct form is `body.data.xxx`). Whether `Accept: application/json` is specified. Whether cases where the wrapper is not applied (unauthenticated `404`, `406`, an unrecognized `500`, etc.) are handled as unexpected errors when the body cannot be parsed. When the client is not implemented by this skill, whether the response structure for success and for exceptions was handed over to the user
12. Whether it complies with `.agents/requirements/java-naming/AGENTS.md` / `.agents/requirements/java-code-style/AGENTS.md` / `.agents/requirements/java-javadoc/AGENTS.md`
13. `jssp-code-review` / `jssp-security-check` are JSSP-specific and are not applied to the output of this skill. If a separate code review/security check skill for Java exists in the project, use that instead

## Boundaries with Other Skills

| Responsibility | Responsible skill |
|------|-----------|
| **REST API implementation via Web API Maker in Java (JavaEE development model)** | **This skill** |
| Regular REST API in JSSP (script development model) (CSRF secure token authentication) | `jssp-page-generator` |
| REST API with OAuth authentication in JSSP (script development model) (im_oauth provider feature) | `jssp-im-oauth-generator` |
| CRUD and permission verification of authorization (IM-Authz) resources, subjects, and policies in Java | `java-im-authz-usage` |
| Role definitions and role assignment to users in Java | `java-im-role-usage` / `java-im-account-usage` |
| File operations (`PublicStorage`, etc.) in Java | `java-im-storage-usage` |
