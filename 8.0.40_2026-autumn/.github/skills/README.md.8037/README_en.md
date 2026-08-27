# JSSP / Java / Low-code Asset Skill Set

## Overview

This repository holds skill sets for creating the following assets on intra-mart Accel Platform.
* Source code for screens and various plugins using JSSP (script development model)
* Source code for various plugins (excluding screens) using Java (JavaEE development model)
* IM-LogicDesigner / IM-Workflow assets

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

### I want to localize

- I want to localize hard-coded strings in JSSP business screens
  - ⇒ `jssp-localize-support` (+ `jssp-page-generator`)
    - Creates message property files (properties)
    - Rewrites to `<imart type="message">` tags / MessageManager API
    - Supports Japanese (ja) / English (en) / Simplified Chinese (zh_CN)

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
- I want to build DB access processing in Java (JavaEE development model) using im_mirage
  - ⇒ `java-im-mirage-usage`
    - Provides implementation patterns for entity classes (`@Table`/`@Column`/`@PrimaryKey`), DAO classes (extending `AbstractDAO`, obtained via `DAOFactory`), 2WaySQL SQL files, and transaction management via `SessionTemplate`
    - For DB access in JSSP, use `jssp-page-generator` (`TenantDatabase`/`SharedDatabase` API); the development models differ and the implementations are completely independent

### I want to implement Java (JavaEE development model) following the design conventions

- I want to check the layer structure, dependencies, naming, exception hierarchy, and factory pattern for Java implementation
  - ⇒ `java-im-architecture`
    - Provides the responsibilities and dependency rules of the layer structure (presentation/application/domain/infrastructure) based on Clean Architecture/DDD
    - Includes a catalog of common anti-patterns and a full-stack implementation example spanning from DDL to the Endpoint
    - The essential points of the convention are summarized in `.github/instructions/java-architecture.instructions.md` for constant reference; this skill is the detailed version (full code templates)
- I want to know the implementation patterns for the service layer (business logic / transaction control)
  - ⇒ `java-im-service-layer`
    - Provides the service interface, factory pattern, transaction boundaries via `SessionTemplate`, and exception conversion rules
    - Includes templates for handling a single repository / multiple repositories within a single transaction
    - The essential points of the convention are summarized in `.github/instructions/java-service-layer.instructions.md` for constant reference

> For general Java conventions (naming, coding style, JavaDoc, logging, entities), refer to the relevant file listed in `.github/instructions/README.md`. The two skills above only need to be invoked when the full code templates and anti-pattern catalog that accompany the conventions are required.

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
