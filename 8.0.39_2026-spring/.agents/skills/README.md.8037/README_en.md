# JSSP / Java / Low-code Asset Skill Set

## Overview

This repository holds skill sets for creating the following assets on intra-mart Accel Platform.
* Source code for screens and various plugins using JSSP (script development model)
* Source code for various plugins (excluding screens) using Java (JavaEE development model)
* IM-LogicDesigner / IM-Workflow / IM-BPM assets

To reduce token consumption by coding agents, it is recommended to pick out only the necessary skill sets following the "Skill Reverse Lookup" below.

## Skill Reverse Lookup

### I want to build a screen

- I want to create a new business screen with JSSP (pro-code)
  - ⇒ `jssp-page-generator` + `jssp-imds-theme`
    - Generates function container (js), presentation page (html), and routing table (xml) at once
    - When database access is required, implements 2WaySQL (sql) and API calls
    - Adopts a design based on intra-mart Design System (imds)
- I want to display graphs / charts on a business screen
  - ⇒ `jssp-highcharts-usage`
    - Integrates the Highcharts library bundled with intra-mart and generates charts using it
- I want to embed an IM-CommonMaster search dialog into a business screen
  - ⇒ `jssp-im-master-usage`
    - Embeds search functions for users, companies, organizations, posts, public groups, private groups, and roles

### I want to use server-side caching

- I want to speed up processing in a JSSP (script development model) function container by caching search results or the results of computationally expensive processing
  - ⇒ `jssp-im-cache-usage`
    - Provides basic patterns for the SSJS `Cache` class (`get`/`put`/`remove`/`removeAll`), creation of cache configuration files (`WEB-INF/conf/im-ehcache-config/*.xml`), and cache key design
    - For the equivalent processing in Java (JavaEE development model), use `java-im-cache-usage`

### I want to build a REST-API for external systems

- I want to newly publish a REST-API with OAuth authentication
  - ⇒ `jssp-im-oauth-generator`
    - Bundle-generates scope definition (xml), resource URL configuration (xml), client detail configuration (xml), and JSSP resource implementation (js) using the im_oauth provider feature
    - No CSRF secure token verification; authenticate with OAuth access tokens
    - For regular REST-APIs called via the browser tenant login session, use the `jssp-page-generator` skill

### I want to build a job program

- I want to create a job scheduler batch process with JSSP (pro-code)
  - ⇒ `jssp-im-job-generator`
    - Generates a function container (js) for screen-less periodic or batch processing
- I want to create a crawler job for IM-ContentsSearch
  - ⇒ `jssp-im-contents-search-generator`
    - Generates a job program that collects data and registers full-text search data in IM-ContentsSearch

### I want to build IM-Workflow assets

- I want to create a workflow master definition file
  - ⇒ `base-im-workflow-generator`
    - Generates import XML including contents, route, flow, matter properties, and branch rules
    - Supports straight / branch / sync / horizontal / vertical route patterns
    - Supports sample-installed users, companies, organizations, posts, and public groups (extensions planned via MCP)
    - Supports Japanese (ja) / English (en) / Simplified Chinese (zh_CN)
- I want to build various screens and processes that work with workflow using JSSP (script development model)
  - ⇒ `jssp-im-workflow-usage` (+ `jssp-page-generator`)
    - Generates apply / approve / detail / confirm / reference screens (html + js)
    - Generates action processes, arrival processes, matter start / end processes, branch condition decisions, and various listeners (js)
- I want to build action processes, arrival processes, matter start / end processes, branch condition decisions, and various listeners for workflow using Java (JavaEE development model)
  - ⇒ `java-im-workflow-usage`
    - Generates Java classes that extend/implement platform abstract classes and listener interfaces such as `ActionProcessEventListener`
    - Screens (apply/approve/confirm) are out of scope. Screens currently use the JSSP implementation from `jssp-im-workflow-usage`

### I want to implement inter-module data linkage with IM-Propagation

- I want to implement data sending/receiving via `PropagationManager` in Java (JavaEE development model)
  - ⇒ `java-im-propagation-generator`
    - Provides implementation patterns for both the sender side (Data Model / `GenericModel` / `Encoder` / sender configuration file) and the receiver side (`Decoder` / `Procedure` / receiver configuration file)
    - Includes the choice between `AbstractProcedure` (riding on a DB transaction) and `AbstractSessionableProcedure` (a custom two-phase-commit-like lifecycle)
    - Also provides listener implementation patterns for receiving, in a custom module, intra-mart standard change notifications (tenants, accounts, roles, IM-Authz, menus, calendars, jobnets, Salesforce integration, Wiki, etc.), as well as patterns for sending to IM-Box (app notifications/watches)
    - No equivalent API for JSSP (script development model) is provided

### I want to build IM-LogicDesigner assets

- I want to create a logic flow (low-code) definition file
  - ⇒ `jssp-im-logic-generator`
    - Generates import ZIP including logic flow (flow_definition.json) and routing (flow_route.json)
    - Supports standard tasks provided by tenant management (authorization, repository operations, mail sending, etc.; 125 types) (extensions planned via MCP)
    - Supports standard mapping functions (numeric operations, string operations, array operations, JSON, BASE64, etc.; 52 types) (extensions planned via MCP)
    - Supports user-defined tasks (JavaScript, REST, SQL, Database Fetch, template) (extensions planned via MCP)
- I want to call an existing logic flow (already routed) from a JSSP screen
  - ⇒ `jssp-im-logic-usage` (+ `jssp-page-generator`)
    - Fetches and parses the swagger spec (`<BASE-URL>/logic/all-api-docs`) to determine the request/response structure, then generates `fetch` call code
    - Presents an authorization-setup guidance message when access is denied (401/403)
- I want to implement a custom task (flow element) in Java (JavaEE development model)
  - ⇒ `java-im-logic-generator`
    - Provides implementation patterns for the category class (`ElementCategory`), the flow element class (extends `Task` + `@LogicFlowElement`), the metadata class (`FlowElementMetadata`), and extension package registration (`ElementScanPackageFactory` + `META-INF/services`)
    - Mapping functions, EL functions, and flow triggers are out of scope

### I want to build IM-BPM assets

- I want to create a specification document from BPMN (XML)
  - ⇒ `bpm-docs-generator`
    - Extracts the process overview, flow description, task details, and branch-condition logic from a BPMN process definition and generates a Markdown specification document
    - The generated specification is also used as the input prompt when generating JSSP
- I want to convert a specification document into a format importable into intra-mart Knowledge
  - ⇒ `bpm-docs-generator`
    - Converts a specification document into a zip file importable into Knowledge
- I want to create JSSP resources to run a BPM process on IM-BPM for Accel Platform based on a specification document
  - ⇒ `bpm-scripts-generator` (+ `jssp-page-generator` / `jssp-imds-theme`)
    - Generates JSSP resources — including IM-BPM-specific elements such as scratch-screen integration — based on the specification document created by `bpm-docs-generator`
- I want to reflect the content of a specification document or generated scripts into the BPMN-XML
  - ⇒ `bpm-xml-reflector`
    - Reflects the content of the specification document from `bpm-docs-generator` and the scripts from `bpm-scripts-generator` into the BPMN-XML

### I want to localize

- I want to localize hard-coded strings in JSSP business screens
  - ⇒ `jssp-localize-support` (+ `jssp-page-generator`)
    - Creates message property files (properties)
    - Rewrites to `<imart type="message">` tags / MessageManager API
    - Supports Japanese (ja) / English (en) / Simplified Chinese (zh_CN)
- I want to build message property retrieval using MessageManager in Java (JavaEE development model)
  - ⇒ `java-im-message-usage`
    - Provides implementation patterns for `jp.co.intra_mart.foundation.security.message.MessageManager`: user/tenant/system locale resolution order, placeholder substitution, and message existence checks (`hasMessage`)
    - Includes message properties file (`.properties`) placement and key naming conventions (shared with the JSSP-side `jssp-localize-support`)
    - For the equivalent implementation in JSSP (script development model), use `jssp-localize-support`

### I want to test / check quality

- I want to run verification and fixes after JSSP screen generation (automatically delegated from `jssp-page-generator`)
  - ⇒ `jssp-page-verifier`
    - Acts as a subagent responsible for mechanical verification of generated JSSP source code
- I want a coding agent to perform code review
  - ⇒ `jssp-code-review`
    - Comprehensive review from the viewpoint of general coding conventions, bind variable usage, naming rules, error handling, etc.
- I want to detect security vulnerabilities
  - ⇒ `jssp-security-check`
    - Detects risks and vulnerabilities such as SQL injection, XSS, use of eval, hard-coded credentials, etc.
- I want to create unit tests for function containers
  - ⇒ `jssp-jest-test`
    - Generates unit tests for function containers (js) using Jest on Rhino (work in progress)
- I want to create E2E tests for business screens
  - ⇒ `jssp-playwright-test`
    - Generates E2E tests for JSSP screens (html + js pairs) using Playwright (work in progress)
- I want to create a test perspective list / test spec from a specification (Excel or HTML)
  - ⇒ `test-spec-generator`
    - Generates an xlsx (using officecli) or HTML test perspective list / test spec from the specification files

### I want to use intra-mart-specific features in the JavaEE development model

- I want to build file operation processing in Java (JavaEE development model) using PublicStorage / SessionScopeStorage / SystemStorage
  - ⇒ `java-im-storage-usage`
    - Provides guidance on choosing between persistent files (`PublicStorage`), temporary files (`SessionScopeStorage`), and internal system resources (`SystemStorage`), plus resource management patterns using `try-with-resources`
    - For the equivalent implementation in JSSP (pro-code), use `jssp-page-generator`'s `reference/api-storage.md` (SSJS Storage API)
- I want to build unique ID numbering processing in Java (JavaEE development model) using the Identifier API
  - ⇒ `java-im-identifier-usage`
    - Provides guidance on choosing between `get()`, which guarantees system-wide uniqueness across a distributed environment, and `make()`, which is unique only within the application server
    - Guides toward `get()` by default for numbering business data such as order numbers and application numbers, and `make()` for identifiers closed within a process, such as log trace IDs
- I want to build mutual exclusion processing in Java (JavaEE development model) using the NewLock API
  - ⇒ `java-im-lock-usage`
    - Provides guidance on choosing between an ordinary lock (`lock()`/`tryLock()`), released with `try`/`finally`, and a request-scope lock (`lockRequestScope()`/`tryLockRequestScope()`), automatically released when the response is returned
    - Guides toward the ordinary lock as the default for DB-based mutual exclusion across a distributed environment when the processing is self-contained within a method
- I want to build tenant-scoped caching processing in Java (JavaEE development model) using the CacheManager/Cache API
  - ⇒ `java-im-cache-usage`
    - Provides cache manager acquisition via `CacheManagerFactory.getCacheManager()`, CRUD operations on `Cache<K, V>` (`get`/`put`/`remove`/`removeAll`, etc.), and creation of cache configuration files (`WEB-INF/conf/im-ehcache-config/*.xml`)
    - Includes the `Serializable` constraint on cache keys/values and the reload pattern on a cache miss
    - For the equivalent implementation in JSSP (script development model), use `jssp-im-cache-usage`
- I want to build account information retrieval/update processing in Java (JavaEE development model) using AccountInfoManager
  - ⇒ `java-im-account-usage`
    - Provides implementation patterns for login settings (locale, time zone, calendar, theme, first day of week, date/time formats), account lock and login failure count, account attributes, and password verification (`AccountPasswordAdapter`)
    - Role assignment to a user (`addAccountRoleInfo`, etc.) is also covered by this skill. For role definitions themselves (registration, hierarchy, category), use `java-im-role-usage`
- I want to build IM Common Master profile-image operations in Java (JavaEE development model) using UserProfileImageManager
  - ⇒ `java-im-profile-usage`
    - Provides implementation patterns for retrieving profile images (stream format / URL format, single/multiple), deleting, and registering them (data-URL format / via `Storage`)
    - Operations on the user's own basic information (name, affiliation, etc.) and the IM-LogicDesigner logic-flow elements (under `jp.co.intra_mart.foundation.logic.element.profile`) are out of scope
- I want to build role definition management processing in Java (JavaEE development model) using RoleInfoManager
  - ⇒ `java-im-role-usage`
    - Provides implementation patterns for role registration/update/deletion, sub-role hierarchy (adding/removing, retrieving all parent/sub roles), category management, and search/pagination by role ID, role name, or category
    - Role assignment to a specific user is out of scope; use `java-im-account-usage`
- I want to build CRUD for authorization resources/subjects/policies and permission checks in Java (JavaEE development model)
  - ⇒ `java-im-authz-usage`
    - Provides implementation patterns for registering/updating/deleting resources, subjects (built as conditional expressions via `Expression`), and policies with `ResourceManager`/`SubjectManager`/`PolicyManager`, and for permission checks (`authorize`) via `AuthorizationClient`
    - Role definitions themselves and role assignment to users are out of scope; use `java-im-role-usage`/`java-im-account-usage` respectively
- I want to build a REST API in Java (JavaEE development model) using Web API Maker
  - ⇒ `java-im-web-api-maker-usage`
    - Provides generation patterns for factory/service classes that implement a REST API using annotations only (`@WebAPIMaker`/`@Path`/`@GET`, etc.)
    - Supports authentication methods (`@IMAuthentication`/`@BasicAuthentication`/`@OAuth`), authorization integration (`@Authz`), secure-token verification (`@Secured`), and response control
    - Registration of the authorization resource itself is handled by `java-im-authz-usage`; for REST APIs in JSSP, use `jssp-page-generator`/`jssp-im-oauth-generator`
- I want to issue/verify a SecureToken (CSRF protection) in Java (JavaEE development model) without relying on Web API Maker
  - ⇒ `java-im-secure-token-usage`
    - Provides token issuance (`createToken`) and verification (`verify`) via `SecureTokenManager`, choosing between one-time and reusable tokens, tamper detection via parameter-bound tokens, and how to obtain an `HttpServletRequest` via `HTTPContextManager`
    - For declarative verification on a Web API Maker endpoint (`@Secured`), use `java-im-web-api-maker-usage`
- I want to build an MCP (Model Context Protocol) server running on intra-mart in Java (JavaEE development model)
  - ⇒ `java-im-mcp-generator`
    - Provides implementation patterns for a Streamable HTTP MCP server using the `@MCPServer`/`@Tool` annotations from the `im_copilot_mcp` module
    - Includes tool parameter definitions via `SchemaProperties` and registration with the platform via `McpScanPackageFactory` (recommended) / `META-INF/im_services/annotation_classes`
    - For a regular REST API (not aimed at AI agents), use `java-im-web-api-maker-usage`
- I want to build an AI agent in Java (JavaEE development model) that receives a prompt, processes it, and returns a response
  - ⇒ `java-im-copilot-agent-generator`
    - Provides implementation patterns for building an agent with `Agent`/`AgentBuilder` from the `im_copilot_agent` module, implementing custom tools with `UserDefinedTool`, integrating `Knowledge` (knowledge search) and `SkillEntry` (Markdown skills), Structured Output (typed output), and intervening in the execution flow with `AgentExecutionMiddleware`
    - Includes the `AbstractCopilotAssistant`/`@Assistant` integration pattern for wiring into the IM-Copilot chat UI (`Agent`/`AgentBuilder` itself is an independent Java API that does not depend on the Assistant framework)
    - For MCP server implementation, use `java-im-mcp-generator`; for regular REST APIs, use `java-im-web-api-maker-usage`
    - For low-level RAG that uses `VectorStore`/`ActionFactory` directly, use `java-im-copilot-rag-generator`; for low-level Tool Calling that uses `ChatAction`+`ToolConfig` directly, use `java-im-copilot-toolcalling-generator`
- I want to implement RAG (Retrieval-Augmented Generation) in Java (JavaEE development model) using `VectorStore`/`ActionFactory` directly
  - ⇒ `java-im-copilot-rag-generator`
    - Provides implementation patterns for building/registering a vector store and hybrid/similarity/keyword search with `VectorStoreBuilder`/`VectorStore`, and for chat/embeddings calls with `ActionFactory`/`ChatAction`/`EmbeddingsAction`
    - Includes the standard document implementation `StandardRegistrationDocument` and chunk splitting with `TextSplitter` (the `splitText` method)
    - For high-level RAG via the Agent framework (`Knowledge`/`RegisteredKnowledge`), use `java-im-copilot-agent-generator`; for Tool Calling, use `java-im-copilot-toolcalling-generator`
- I want to implement Tool Calling (function calling) in Java (JavaEE development model) using `ChatAction`+`ToolConfig` directly
  - ⇒ `java-im-copilot-toolcalling-generator`
    - Provides provider-agnostic (works uniformly across OpenAI, Azure OpenAI Service, and Amazon Bedrock) Tool Calling implementation patterns using `ToolConfig`/`ToolDefinition`/`ToolChoice`/`ToolCall` (both non-streaming and streaming)
    - Includes tool-argument validation/deserialization with `JsonSchemaValidator`/`ToolJsonHelper`
    - For high-level Tool Calling via the Agent framework (`UserDefinedTool`), use `java-im-copilot-agent-generator`; for RAG, use `java-im-copilot-rag-generator`
- I want to build CRUD/search processing for the IM Common Master (user, company, organization, post, public/private/company/corporation group, corporation, customer, item category, item, currency) in Java (JavaEE development model) using UserManager/CompanyManager/PublicGroupManager/PrivateGroupManager/CompanyGroupManager/CorporationGroupManager/CorporationManager/CustomerManager/ItemCategoryManager/ItemManager/CurrencyManager
  - ⇒ `java-im-master-usage`
    - Provides implementation patterns for retrieving, searching, creating, updating, and deleting user information (`User`, `UserManager`), companies (`Company`), organizations/organization sets (`Department`/`DepartmentSet`), posts (`CompanyPost`), user-to-organization attachment (`UserAttach`, all via `CompanyManager`), and retrieving the organization hierarchy (tree)
    - Covers the fact that `Company` has no dedicated creation method, the `set*` methods' automatic create/update decision based on the term code (`termCd`), and the multilingual registration procedure (`setDefaultLocale`/`createLocaleElement`/`putLocaleElement`)
    - Also provides implementation patterns for retrieving, searching, creating, updating, and deleting public groups, private groups, company groups, and corporation groups, each via its own dedicated manager class, plus retrieving public group categories, roles, and the hierarchy (tree)
    - Covers the differences in API scope across the four group classes (only the public group API has category/role/tree features, the private group API is the smallest, the corporation group model additionally holds a company code, etc.)
    - Also provides implementation patterns for retrieving, searching, creating, updating, and deleting corporations (`CorporationManager`; a separate class from corporation groups), customers (`CustomerManager`), item categories (`ItemCategoryManager`; has a hierarchy tree), items (`ItemManager`), and currencies (`CurrencyManager`; `Currency`/`CurrencyConversion`/`CurrencyPrecision`/`CurrencyRate`). Covers the fact that `CustomerManager`/`ItemManager` use generic method names that don't include the entity name, with `companyCd` as the first argument
    - Also provides implementation patterns for retrieving, searching, creating, updating, and deleting user categories, public group categories, and organization categories (`UserCtg`/`PublicGroupCtg`/`DepartmentCtg`, etc., each a feature included in its corresponding manager class)
    - For user profile images, use `java-im-profile-usage`; for role definitions/assignment, use `java-im-role-usage`/`java-im-account-usage`; for authorization, use `java-im-authz-usage`
- I want to build DB access processing in Java (JavaEE development model) using im_mirage
  - ⇒ `java-im-mirage-usage`
    - Provides implementation patterns for entity classes (`@Table`/`@Column`/`@PrimaryKey`), DAO classes (extending `AbstractDAO`, obtained via `DAOFactory`), 2WaySQL SQL files, and transaction management via `SessionTemplate`
    - For DB access in JSSP, use `jssp-page-generator` (`TenantDatabase`/`SharedDatabase` API); the development models differ and the implementations are completely independent
- I want to get the logged-in user's information (account, organization, client, job execution parameters) in Java (JavaEE development model) using Contexts.get()
  - ⇒ `java-im-contexts-usage`
    - Provides retrieval patterns for `AccountContext` (user code, tenant ID, locale, time zone, role IDs, authentication state), `UserContext` (user profile, department, company, post, public group, user category), `ClientContext` (client type), `ExternalUserContext` (external-user detection), `JobSchedulerContext` (job execution parameters), plus authentication/administrator checks via `ContextStatus`
    - For the equivalent implementation in JSSP, use the SSJS Context objects (`d.ts/platform/object/`, `d.ts/platform/job-scheduler/`)
- Want to create a custom XML configuration file (a JAXB configuration class, XSD schema, and XML instance) in Java (JavaEE development model) using ConfigurationLoader — creating, loading, and saving it
  - ⇒ `java-im-configuration-generator`
    - Provides guidance on choosing between `ConfigurationLoader.load`/`loadAll`/`save`/`clearCache`, cache control via `Instance` (`SINGLETON`/`PROTOTYPE`), where configuration files are placed (SystemStorage's `conf/`, `WEB-INF/conf`, the classpath), and the class-name-to-file-name conversion rule
    - Includes the `ObjectFactory` (`factoryClass`/`factoryMethod`, must be `static`) implementation pattern required by `check-jaxb-format-plugin`
    - No SSJS-version API equivalent is provided for JSSP (script development model)

### I want to implement Java (JavaEE development model) following the design conventions

- I want to check the layer structure, dependencies, naming, exception hierarchy, and factory pattern for Java implementation
  - ⇒ `java-im-architecture`
    - Provides the responsibilities and dependency rules of the layer structure (presentation/application/domain/infrastructure) based on Clean Architecture/DDD
    - Includes a catalog of common anti-patterns and a full-stack implementation example spanning from DDL to the Endpoint
    - The essential points of the convention are summarized in `.agents/requirements/java-architecture/AGENTS.md` for constant reference; this skill is the detailed version (full code templates)
- I want to know the implementation patterns for the service layer (business logic / transaction control)
  - ⇒ `java-im-service-layer`
    - Provides the service interface, factory pattern, transaction boundaries via `SessionTemplate`, and exception conversion rules
    - Includes templates for handling a single repository / multiple repositories within a single transaction
    - The essential points of the convention are summarized in `.agents/requirements/java-service-layer/AGENTS.md` for constant reference

> For general Java conventions (naming, coding style, JavaDoc, logging, entities), refer to the relevant file listed in `.agents/requirements/README.md`. The two skills above only need to be invoked when the full code templates and anti-pattern catalog that accompany the conventions are required.

### I want to build setup assets

- I want to create tenant environment setup assets / prepare for production deployment
  - ⇒ `jssp-tenant-setup-generator`
    - Based on the deliverables, prepares the necessary roles, authorizations, menus, jobs, and the setup configuration files
    - Menu is "Sitemap (for PC)" only
- I want to create sample data setup assets
  - ⇒ `jssp-sample-setup-generator`
    - Prepares the sample data (DDL/DML) for trying out the module, the roles, authorizations, menus, and jobs required for the trial, and the setup configuration files
    - Menu is "Sitemap (for PC)" only

## Limitations

- imui theme and V72-compatible screen generation are not supported. Only imds is supported.
- Routing table: reverse lookup instructions for authorization resources are not supported.
- Authorization: `welcome-all` must not be used in principle. Authorization resources are imported as tenant environment setup assets; import assets via jobs are not generated.
- Job: Job definitions are imported as tenant environment setup assets; import assets via jobs are not generated.
- A Node.js script is executed to verify the correctness of generated artifacts. `/tmp` is used temporarily.
- IM-Workflow: master definition JSSP API is out of scope. Only matter retrieval / operation APIs are supported.
- IM-Workflow: list display patterns, flow groups, media, and messages are not generated.
- IM-LogicDesigner: calling IM-LogicDesigner from JSSP business screens is limited to via routing (the calling side is implemented by `jssp-im-logic-usage`).
- IM-LogicDesigner: routing is not generated by default. If needed, specific instructions are required.
- IM-LogicDesigner: user-defined items that are not supported even by MCP are substituted with JavaScript user-defined items.
- IM-LogicDesigner: preview image generation for triggers / logic flows is not generated.
- IM-BloomMaker / ViewCreator / Accel Studio: generation of these low-code assets is not supported.
