---
name: java-im-authz-usage
description: intra-mart 固有の認可（Authorization）API（`jp.co.intra_mart.foundation.authz.*`、`im_authz_base` モジュール）を Java（JavaEE 開発モデル）で使用するためのスキルセット。認可リソース・リソースグループ、サブジェクト・サブジェクトグループ（Expression による条件式構成）、ポリシーの新規登録・更新・削除、AuthorizationClient による権限確認（authorize）の実装パターンを提供する。Java で認可機構を使いたい、Java で AuthorizationClient / ResourceManager / SubjectManager / PolicyManager を使いたい、JavaEE 開発モデルでリソース・サブジェクト・ポリシーを登録したい、権限チェック（authorize）をJavaで実装したい、と言及されたときに使用。ロール定義自体のCRUD（RoleInfoManager）は `java-im-role-usage`、特定ユーザへのロール割当は `java-im-account-usage` を使うこと。JSSP（スクリプト開発モデル）向けの同等API（d.ts）は2026年時点で提供されていない。
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Authorization API (Java) Support Skill

## Purpose

A skill set for implementing new registration/update/deletion of authorization resources, subjects, and policies, and permission checks (`authorize`) via `AuthorizationClient`, in Java code using intra-mart Accel Platform's Authorization API (`jp.co.intra_mart.foundation.authz.*`) for the **JavaEE development model**.

## Core Concepts of Authorization (Most Important)

An authorization decision is made from four elements: "who" (Subject), "what" (Resource), "what action" (Action), and "allow/deny" (Effect).

| Concept | Role |
|------|------|
| Resource (`Resource`) / Resource group (`ResourceGroup`) | The target of authorization. Keyed by a resource URI (`RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` format). The paired `ResourceGroup` holds the name/description |
| Subject (`Subject`) / Subject group (`SubjectGroup`) | The "who" condition. A `Subject` cannot be registered on its own — it must be combined into an `Expression` (AND/OR/NOT) and registered as a `SubjectGroup` |
| Policy (`Policy`) | A tuple of (resource group, subject group, resource type, action) → effect (`PERMIT`/`DENY`) |
| `AuthorizationClient` | The **recommended entry point** for developers performing permission checks (`authorize(...)` returns an `AuthorizeResult`) |

`ResourceManager` / `SubjectManager` / `PolicyManager` handle CRUD for resources/subjects/policies, and `AuthorizationClient` handles permission checks. All of these are **published as interfaces only** — never reference an implementation class directly; always obtain instances through the corresponding `*Factory` class.

## Boundary with Role/Account Management (Important)

**This skill covers only "authorization" (CRUD for resources/subjects/policies and permission checks).** intra-mart has a separate concept of role management, with different APIs and skills.

| Operation | Target API | Owning skill |
|------|---------|-----------|
| CRUD for authorization resources/subjects/policies, permission checks (`authorize`) | `jp.co.intra_mart.foundation.authz.*` (`ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient`) | **This skill** |
| New registration/update/deletion/hierarchy/category of role definitions themselves | `RoleInfoManager` | `java-im-role-usage` (out of scope for this skill) |
| Assigning/removing roles for a specific user | `AccountInfoManager#addAccountRoleInfo`, etc. | `java-im-account-usage` (out of scope for this skill) |

If a request is about "creating a new role" or "assigning a role to a user," that is role management, not authorization (Authz) — redirect to `java-im-role-usage` / `java-im-account-usage` respectively. Note that using "users belonging to a role" as an authorization **subject** condition is a legitimate use case; the concrete `Subject` implementation for that comes from an extension module such as `im_master_subjecttypes`, which is out of scope for this skill.

**This skill covers Java source files (`.java`) only.** As of 2026, there is no equivalent API (d.ts) under `d.ts/` for JSSP (`.js`). If asked to use authorization from JSSP, communicate this and confirm how to proceed.

## Conventions to Consult

| Convention | Handling |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method Javadoc |

There is no Java-specific convention (as of 2026) under `.github/instructions` for exception handling. `SubjectManager#removeSubject`/`removeSubjectGroup` throw `SubjectManagingException` (a checked exception), while the main CRUD/permission-check methods of `ResourceManager`/`PolicyManager`/`AuthorizationClient` are mostly unchecked (with some exceptions such as `InvalidResourceUriException`). Follow the method definitions in `reference/authz-api-reference.md` and the patterns in `assets/authz-basic-usage.md` for exception handling.

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

The APIs under `jp.co.intra_mart.foundation.authz` belong to the `im_authz_base` module (published interfaces). See `reference/authz-api-reference.md` for detailed signatures and package structure (do not write from memory or guesswork).

Key points:
- **Both CRUD and permission checks use the Factory pattern.** Obtain instances via the corresponding `*Factory.getInstance().getXxx()`, e.g. `ResourceManagerFactory.getInstance().getResourceManager()`
- **Manager/Client instances must not be reused across multiple tenants.** When switching tenants on the same thread, do not cache the instance — re-obtain it from the Factory each time (a constraint explicitly documented in `ResourceManager`'s Javadoc)
- **A subject cannot be registered on its own.** Convert it with `SubjectExpression.S(subject)` into an `Expression`, combine with `Expression.AND`/`OR`/`NOT` as needed, then pass it to `SubjectManager#registerSubjectGroup(...)`
- **`getDeclaredPolicy` (explicit registration only, returns `null` when unset) and `getActualPolicy` (the effective policy with inheritance resolved) serve different purposes.** Use `getActualPolicy`/`getActualPolicies` when you need to know the permission that is actually in effect

## Generation Targets and Templates

| Generation target | Template | Content |
|---------|------------|------|
| Resource registration | `assets/authz-basic-usage.md` | Registering a resource URI via `ResourceManager#registerAsResource`, how to use `I18nValue` |
| Subject group registration | `assets/authz-basic-usage.md` | Building a subject expression with `SubjectExpression.S(...)` and `Expression.AND`/`OR`/`NOT`, `SubjectManager#registerSubjectGroup` |
| Policy configuration | `assets/authz-basic-usage.md` | Registering allow/deny via `PolicyManager#setPolicy`, using built-in subject groups (`getAuthenticatedUsers`/`getGuestSubjectGroup`) |
| Permission checks (authorization checks in screens/APIs) | `assets/authz-basic-usage.md` | Calling patterns for `AuthorizationClient#authorize`, how to evaluate `AuthorizeResult` |
| Reading/clearing policies | `assets/authz-basic-usage.md` | Choosing between `getDeclaredPolicy`/`getActualPolicy`, falling back via `removePolicy` |

### Reference

- `reference/authz-api-reference.md` — Core methods/signatures of `ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient`/`PolicyDecisionService`/`PolicyInformationService`/model interfaces (`Resource`/`Subject`/`Policy`/`Effect`/`AuthorizeResult`), based on the actual platform API class definitions (do not write from memory)

## When to Use

Use this skill when the user makes requests such as:
- "I want to use the authorization mechanism (Authz) in Java"
- "I want to implement a permission check with AuthorizationClient in the JavaEE development model"
- "I want to register a new authorization resource/subject/policy"
- "I want to set permissions for a group of users matching a certain condition (organization, public group, etc.)"
- "I want to check whether this user is allowed to perform this operation on this resource"

If it is not explicit whether "Java" / "JavaEE development model" is intended, confirm with the user which model the existing project implementation uses.

Requests such as "I want to create a new role" or "I want to assign a role to a user" are out of scope for this skill — redirect to `java-im-role-usage` / `java-im-account-usage`.

## Implementation Steps

1. Gather requirements from the user (CRUD for resources/subjects/policies, or implementing a permission check (`authorize`)? If the goal is role definitions or role assignment, redirect to `java-im-role-usage`/`java-im-account-usage`)
2. Design the resource URI (`RESOURCE-TYPE-ID:IDENTIFIER-COMPONENT` format; segment it by application name/component name so it does not collide with other applications)
3. Organize the subject condition (a single `Subject`, or a composite condition built with `Expression.AND`/`OR`/`NOT`? Also check whether a built-in group — `getAuthenticatedUsers`/`getGuestSubjectGroup` — is sufficient)
4. Implement by referring to `assets/authz-basic-usage.md` (always consult `reference/authz-api-reference.md` for method signatures — do not write from memory or guesswork)
5. When implementing a permission check, share the resource URI construction logic between the registration code and the check code (to avoid mismatches causing incorrect decisions)
6. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Do not cache Manager/Client instances in a field across tenants.** This is a constraint explicitly documented in `ResourceManager`'s Javadoc — reusing an instance can cause some APIs to fail. Obtain a fresh instance from `*Factory.getInstance().getXxx()` on every call
- **There is no API to register a subject on its own.** Always follow the order `SubjectExpression.S(subject)` → `Expression.AND`/`OR`/`NOT` → `SubjectManager#registerSubjectGroup(Expression, ...)` to register it as a `SubjectGroup`
- **`Effect.BLOCK` cannot be registered directly as a policy.** It is a value that only appears as the result of an authorization decision; passing it to `setPolicy` raises `IllegalSerializationException`. Use only `PERMIT`/`DENY` for policy registration
- **Evaluate `AuthorizeResult` with `AuthorizeResult.Permit.equals(result)`.** Using `result == AuthorizeResult.Permit` risks missed cases if new enum constants are added in the future (an explicit recommendation in the Javadoc)
- **Do not confuse `getDeclaredPolicy` with `getActualPolicy`.** `getDeclaredPolicy` returns `null` when nothing is explicitly registered (a null check on the caller side is mandatory). Use `getActualPolicy`/`getActualPolicies`, which resolve inheritance, when you need to know the permission that actually applies
- **`removePolicy`/`removeResourceGroup`/`removeSubjectGroup`/`removePoliciesForResourceGroup`/`removePoliciesForSubjectGroup`/`removeAllPolicies` are destructive operations.** `removeAllPolicies` (deletes all policies) and `removeResourceGroup` (deletes the resources and policies underneath it as well) in particular have a wide blast radius — confirm the scope before calling them
- **There is usually no need to call `PolicyDecisionService`/`PolicyInformationService` directly.** The Javadoc explicitly states "you normally do not need to handle this class directly" — use `AuthorizationClient` for permission checks
- **`PolicyInformationServicetFactory` (note the extra `t` right after `Service`) is the class name as written in the original source.** Do not "fix" it as a typo and rename it

## Post-Generation Checks

A dedicated verification script equivalent to the JSSP one (`validate-jssp-code.js`) is not yet in place. Confirm the following manually.

1. Is `AuthorizeResult` evaluated with `.equals()` (not `==`)?
2. Is a null check performed everywhere the return value of `getDeclaredPolicy()` is used?
3. Is the effect passed to `setPolicy(...)` always `PERMIT` or `DENY`, never `BLOCK` directly?
4. Are `ResourceManager`/`SubjectManager`/`PolicyManager`/`AuthorizationClient` instances free of tenant-spanning caching (e.g. in `static` fields)?
5. Is the resource URI construction logic shared between the registration code and the check code (no notation drift)?
6. Are destructive operations such as `removeAllPolicies`, `removeResourceGroup`, `removePoliciesForResourceGroup`, `removePoliciesForSubjectGroup` executed only within the intended scope?
7. Is `SubjectManagingException` (a checked exception) never silently swallowed?
8. Does the code comply with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`?
9. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-oriented code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Owning skill |
|------|-----------|
| **CRUD for authorization resources/subjects/policies and permission checks, in Java (JavaEE development model)** | **This skill** |
| Role definitions in Java (CRUD, hierarchy, category, search) | `java-im-role-usage` |
| Assigning/removing roles for a specific user in Java | `java-im-account-usage` |
| File operations in Java (`PublicStorage`, etc.) | `java-im-storage-usage` |
| Unique ID generation in Java (`Identifier`) | `java-im-identifier-usage` |
| Exclusive locking in Java (`NewLock`) | `java-im-lock-usage` |
| Workflow integration processing in Java | `java-im-workflow-usage` |
| Using authorization from JSSP (script development model) | As of 2026, no corresponding d.ts / skill is provided (out of scope for this skill) |
