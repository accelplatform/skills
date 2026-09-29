---
name: java-im-contexts-usage
description: >
  A skill set for using the intra-mart execution context API (`jp.co.intra_mart.foundation.context.Contexts`,
  modules `im_core_base` / `im_user_context` / `im_job_scheduler_base`) in Java (JavaEE development model).
  Provides retrieval patterns for AccountContext (user code, tenant ID, locale, time zone, role IDs,
  authentication state), UserContext (user profile, department, company, post, public group, user category),
  ClientContext (client type), ExternalUserContext (external-user detection), and JobSchedulerContext
  (job execution parameters), plus authentication/administrator checks via ContextStatus.
  Use this when the user mentions: getting the logged-in user's information in Java, how to use
  Contexts.get(), checking AccountContext or UserContext methods, implementing authentication checks
  (isAuthenticated) or administrator checks (isAdministrator), getting the user's locale/time zone,
  getting the list of role IDs, getting the user's department (Department) or company (Company),
  getting job execution parameters inside a job, getting public group or user category information,
  or determining whether a user is an external user.
  For the equivalent implementation in JSSP (script development model), use the SSJS Context objects
  (`d.ts/platform/object/im-ssjs-*-context.d.ts`, `d.ts/platform/job-scheduler/im-ssjs-job-scheduler-context.d.ts`) instead.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Contexts API (Java) Support Skill

## Purpose

A skill set for using intra-mart Accel Platform's execution context API for the **JavaEE development model** (`jp.co.intra_mart.foundation.context.Contexts`) to retrieve account, organization, client, and job execution information for the logged-in user in Java code.

**This skill covers Java source files (`.java`) only.** For JSSP (`.js`) implementations, use the SSJS Context objects under `d.ts/platform/object/` and `d.ts/platform/job-scheduler/` (out of scope here).

## Entry Point

`jp.co.intra_mart.foundation.context.Contexts.get()` is the sole entry point.

```java
import jp.co.intra_mart.foundation.context.Contexts;
import jp.co.intra_mart.foundation.context.model.AccountContext;

AccountContext accountContext = Contexts.get(AccountContext.class);
```

```java
public static <T extends Context> T get(final Class<T> type)
```

If the requested context type is not found in the store, `ContextNotFoundException` (an **unchecked** exception — a `RuntimeException` subclass) is thrown. No `throws` declaration is required. Even so, calling this for a context that is unavailable in the current execution environment (see "Context availability" below) will throw at runtime, so account for that.

## Available Context Types

| Context type | Package | Module | Purpose |
|---|---|---|---|
| `AccountContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | Account, authentication, locale, role IDs |
| `UserContext` | `jp.co.intra_mart.foundation.user_context.model` | `im_user_context` | User profile and organization info (from IM Common Master) |
| `ClientContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | Client type ID |
| `ExternalUserContext` | `jp.co.intra_mart.foundation.context.model` | `im_core_base` | External-user detection |
| `JobSchedulerContext` | `jp.co.intra_mart.foundation.job_scheduler` | `im_job_scheduler_base` | Job execution parameters and jobnet info |

For full method signatures and JavaDoc, always consult `reference/contexts-api-reference.md` (never rely on memory or guesswork).

## `ContextStatus` Utility

`jp.co.intra_mart.foundation.context.ContextStatus` provides shortcuts for common checks (internally it just calls `Contexts.get(AccountContext.class)`, so prefer it for simple checks).

```java
import jp.co.intra_mart.foundation.context.ContextStatus;

if (ContextStatus.isAuthenticated()) { /* authenticated */ }
if (ContextStatus.isAdministrator()) { /* system administrator */ }
```

| Method | Return | Description |
|---|---|---|
| `isAdministrator()` | `boolean` | Whether `AccountContext.getUserType()` is `ADMINISTRATOR` |
| `isAuthenticated()` | `boolean` | Result of `AccountContext.isAuthenticated()` |
| `validate()` | `boolean` | Checks login signature integrity (always `false` for unauthenticated users) |

## Which Context to Use (Decision Table)

| Information needed | How to get it |
|---|---|
| User code | `AccountContext.getUserCd()` |
| Tenant ID | `AccountContext.getTenantId()` |
| Locale | `AccountContext.getLocale()` |
| Time zone | `AccountContext.getTimeZone()` |
| Authenticated? | `ContextStatus.isAuthenticated()` |
| Administrator? | `ContextStatus.isAdministrator()` |
| User type | `AccountContext.getUserType()` |
| Role IDs (including sub-roles) | `AccountContext.getRoleIds()` |
| Login time | `AccountContext.getLoginTime()` |
| Display name, email, etc. | Methods on `UserContext.getUserProfile()` |
| Main department | `UserContext.getMainDepartment()` |
| All departments | `UserContext.getAllDepartments()` |
| Companies | `UserContext.getCompanyList()` |
| Post/title | `UserContext.getMainPostList()` / `getAllPosts()` |
| Public groups | `UserContext.getPublicGroupList()` |
| User categories | `UserContext.getUserCategoryList()` |
| Client type | `ClientContext.getClientTypeId()` |
| External user? | `ExternalUserContext.isExternalUser()` |
| Job execution parameters | `JobSchedulerContext.getParameter(key)`, or `BaseJob.getParameter(key)` inside a job |

## Conventions to Consult

| Convention | Handling |
|---|---|
| `.claude/rules/java-naming.md` | 🟢 **Required** — package/class/method/variable naming |
| `.claude/rules/java-code-style.md` | 🟢 **Required** — `final` locals, string literals, etc. |
| `.claude/rules/java-javadoc.md` | 🟢 **Required** — class/method JavaDoc |
| `.claude/rules/java-logging.md` | 🟡 When implementing logging — never log personal information beyond the user code |

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

For the full method list, JavaDoc, and related model classes (`UserProfile` / `Department` / `Company` / `DepartmentPost` / `PublicGroup` / `PublicGroupRole` / `UserCategory`), consult `reference/contexts-api-reference.md` (based on the platform's actual class definitions — never rely on memory or guesswork).

## Generation Targets and Templates

| Target | Template | Content |
|---|---|---|
| Getting user info / auth checks in the service layer | `assets/contexts-basic-usage.md` | Retrieval and auth-check patterns for `AccountContext` |
| Internationalization using locale/time zone | `assets/contexts-basic-usage.md` | Date/time formatting examples using `Locale`/`TimeZone` |
| Getting the user's organization info | `assets/contexts-basic-usage.md` | Example of getting department/company from `UserContext` |
| Getting parameters inside a job | `assets/contexts-basic-usage.md` | Example of using `getParameter()` in a job extending `BaseJob` |

### Reference

- `reference/contexts-api-reference.md` — full method lists for `Contexts` / `ContextStatus` / each Context interface, the `UserType` enum, and context availability by environment

## When to Use

When the user makes requests such as:
- "I want to get the logged-in user's info in Java"
- "I want to use Contexts.get() in the JavaEE development model"
- "I want to get the user code or tenant ID in the service layer"
- "I want to get the user's department/company"
- "I want to get execution parameters inside a job"
- "I want to check whether a user is authenticated / an administrator"

If it is not explicit whether Java or JSSP is intended, confirm with the user which development model the project uses. For context retrieval inside a JSSP (pro-code) screen or function container, use the corresponding SSJS Context object (`d.ts/platform/object/`, `d.ts/platform/job-scheduler/`) instead.

## Implementation Steps

1. Identify which context type is needed from the decision table above
2. Retrieve it with `Contexts.get(XxxContext.class)`. **No null check is needed on the return value** (`Contexts.get()` never returns null — when the context is unavailable it always throws `ContextNotFoundException` instead). Some contexts can throw that exception depending on the execution environment, so account for it where relevant (see "Notes" below)
3. For processing that assumes authentication, check `ContextStatus.isAuthenticated()` or `AccountContext.isAuthenticated()`
4. Implement using `assets/contexts-basic-usage.md` as a reference (always consult `reference/contexts-api-reference.md` for exact method signatures — never rely on memory or guesswork)
5. Respect the recommended usage location per layer (see "Notes" below)
6. Verify compliance with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Required: do not null-check the return value of `Contexts.get()` (the check would be dead code).** `Contexts.get()` never returns null — when the requested context is not found it always throws `ContextNotFoundException` (unchecked) instead (confirmed both from the actual source and from a live environment). So a branch like `if (account == null)` can never be true. Some contexts are unavailable in certain execution environments (see "Context availability" below); where retrieval failure needs to be handled, catch `ContextNotFoundException` instead of null-checking (though `AccountContext` is a required context, so this exception normally does not occur for it)
- **Required: authentication checks.** Even when `AccountContext` is successfully retrieved, `isAuthenticated()` may return `false` (unauthenticated user, system startup, etc.). Always check this for processing that assumes authentication
- **Forbidden: holding or caching a context.** Contexts are bound to the request (or thread). Never store them in instance fields or `static` fields
  ```java
  // NG: held in a field (the context from initialization time gets fixed)
  private AccountContext account = Contexts.get(AccountContext.class);

  // OK: retrieved fresh whenever needed
  public void process() {
      AccountContext account = Contexts.get(AccountContext.class);
  }
  ```
- **Forbidden: logging personal information.** The user code (`getUserCd()`) and tenant ID may be logged, but personal information from `UserProfile` — name (`getUserName()`), email, phone number, address, etc. — must never be logged
- **Note: `AccountContext.getUserCd()` returns a value even for the system administrator or an unauthenticated user.** Never branch business logic on this code alone — always combine it with `getUserType()` and/or `isAuthenticated()`
- **Note: `getLoginGroupId()` is deprecated (`@Deprecated`).** It is a compatibility property that returns the same value as the tenant ID; use `getTenantId()` in new code
- **Recommended: usage location by layer**
  - Presentation/controller layer: authentication checks, locale retrieval
  - Application/service layer: user code retrieval, audit-trail field population, organization-based business logic
  - Infrastructure layer (DAO/Repository): never call the `Contexts` API directly — receive values as arguments from the layer above

## Post-Generation Checks

Rather than an automated validation script (such as the JSSP version's `validate-jssp-code.js`), check the following manually.

1. Every `Contexts.get()` call site accounts for execution environments where the context may be unavailable (see "Context availability" below)
2. No missing `isAuthenticated()` checks in processing that assumes authentication
3. No context is held in an instance field or `static` field
4. No personal information from `UserProfile` (name, email, etc.) is logged
5. The infrastructure layer (DAO/Repository) never calls the `Contexts` API directly
6. Compliance with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
7. `jssp-code-review` / `jssp-security-check` are JSSP-only and do not apply to this skill's output. If the project has separate Java code-review/security-check skills, use those instead

## Context Availability

Each context implementation is stored via `ContextProducer` (a per-environment plugin mechanism). The table below covers an HTTP request environment (authenticated, via the Web API) and a job scheduler execution environment (via `BaseJob`). Results may depend on the tenant/user configuration, so for an execution environment not listed below (e.g. an unauthenticated HTTP request), check it individually via the result of `Contexts.get()` (successful retrieval vs. `ContextNotFoundException`).

| Execution environment | AccountContext | UserContext | ClientContext | JobSchedulerContext |
|---|---|---|---|---|
| HTTP request (authenticated) | ○ | ○ | ○ | × (`ContextNotFoundException`) |
| Job scheduler | ○ (the context of the job's execution user is set; `userCd` is a technical account used for job execution) | ○ (though `getUserContext().getUserProfile()` may return `null` for an execution user with no matching IM Common Master record) | ○ (`clientTypeId` is retrievable) | ○ (recommended via `BaseJob.getJobContext()`) |

## Using `JobSchedulerContext` Inside a Job

For job implementations extending `jp.co.intra_mart.foundation.job_scheduler.BaseJob`, prefer the `protected` utility methods `BaseJob` provides (`getJobContext()` / `getParameter()` / `getParameterAsInteger()`, etc.) over calling `Contexts.get(JobSchedulerContext.class)` directly. See `reference/contexts-api-reference.md` for details.

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|---|---|
| Context retrieval in SSJS (JSSP) | Use the corresponding SSJS Context object (`d.ts/platform/object/`, `d.ts/platform/job-scheduler/`) — out of scope here |
| **Context retrieval in Java (JavaEE development model)** | **This skill** |
| Updating account info / assigning roles in Java (`AccountInfoManager`) | `java-im-account-usage` |
| CRUD on role definitions themselves in Java (`RoleInfoManager`) | `java-im-role-usage` |
| Authorization checks in Java (`AuthorizationClient`) | `java-im-authz-usage` |
| The job implementation itself (`execute()` body, etc.) in Java | Out of scope here (use a dedicated job-implementation skill if the project has one) |
