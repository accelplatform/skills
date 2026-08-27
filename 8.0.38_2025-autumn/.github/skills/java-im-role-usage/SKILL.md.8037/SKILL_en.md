---
name: java-im-role-usage
description: A skillset for using the intra-mart-specific role management API (`jp.co.intra_mart.foundation.admin.role.RoleInfoManager`) in Java (JavaEE development model). Provides implementation patterns for creating/updating/deleting roles, sub-role hierarchies (add/delete/get all parent or sub roles), category management (list/move/delete), and searching by role ID/role name/category with pagination. Use when the user mentions wanting to create a role in Java, wanting to use the RoleInfoManager API in Java, or wanting to manage role hierarchies or categories in the JavaEE development model. Assigning a role to a specific user (`addAccountRoleInfo`, etc.) is out of scope — use `java-im-account-usage` for that. When building equivalent processing in JSSP (script development model), use the SSJS version of the RoleInfoManager API (`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`) instead.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Role Management API (Java Version) Support Skill

## Purpose

A skillset for implementing role-definition creation, update, deletion, sub-role hierarchy management, category management, and search in Java code, using the role management API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.admin.role.RoleInfoManager`).

## Boundary Between Roles and Accounts (Most Important)

**This skill covers only the CRUD, hierarchy, and category management of role definitions themselves.** Assigning a role to a specific user (e.g., `AccountInfoManager#addAccountRoleInfo`) is out of scope.

| Operation | Target API | Owning Skill |
|------|---------|-----------|
| Create/update/delete a role | `RoleInfoManager#addRoleInfo` / `updateRoleInfo` / `deleteRoleInfo` | **This skill** |
| Add/delete/reference sub-role hierarchy | `RoleInfoManager#addSubRoleInfo` / `deleteSubRoleInfo(s)` / `get(All)SubRoleIds` / `get(All)ParentRoleIds` | **This skill** |
| List/move/delete categories | `RoleInfoManager#getCategories` / `moveCategory` / `deleteCategory(ies)` | **This skill** |
| Search/paginate roles | `RoleInfoManager#searchRoleInfosBy*` | **This skill** |
| **Assign/revoke a role for a specific user** | `AccountInfoManager#addAccountRoleInfo`, etc. | **`java-im-account-usage` (out of scope for this skill)** |

If the request is "assign a role to a user" or "change the roles an account holds," that is not an operation on the role definition itself, so direct it to `java-im-account-usage`.

**This skill covers Java source files (`.java`) only.** For implementation in JSSP (`.js`), use the corresponding SSJS version of the API (`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`).

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method JavaDoc |

No dedicated Java convention defining exception-handling policy exists under `.github/instructions` (as of 2026). Every `RoleInfoManager` method is designed to throw `AdminException` (a checked exception); follow the business-exception-wrapping pattern in `assets/role-basic-usage.md`.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

The `RoleInfoManager` class belongs to the `jp.co.intra_mart.foundation.admin.role` package and is a regular, non-`final` class. It provides role creation/update/deletion, sub-role hierarchy management, category management, and search/pagination. For detailed signatures and related classes, refer to `reference/role-api-reference.md` (do not write these from memory or guesswork).

Key points:
- **`RoleInfo` has three constructors.** `RoleInfo()` (auto-numbers the role ID via `Identifier`; **throws `IOException`**), `RoleInfo(roleId)` (role ID specified explicitly; the role name defaults to the same value as the role ID), and `RoleInfo(roleId, roleName)` (both specified explicitly). Choose the one that fits the use case
- **`RoleInfo`'s `displayName` is a `Map<Locale, String>`,** not a single `String` — it can hold a different display name per locale
- **`getRoleInfo(roleId)` returns `null`, not an exception, when the role does not exist.** The caller must perform a null check (see "Notes" for details)

## What to Generate and Which Templates to Use

| What to generate | Template | Content |
|---------|------------|------|
| Creating/getting/updating a role | `assets/role-basic-usage.md` | How to choose among `RoleInfo` constructors; call examples for `addRoleInfo`/`getRoleInfo` (with null check)/`updateRoleInfo` |
| Building and querying a sub-role hierarchy | `assets/role-basic-usage.md` | `addSubRoleInfo`; choosing between `getAllSubRoleIds`/`getSubRoleIds` |
| Role-containment check | `assets/role-basic-usage.md` | A business-logic example using `certify` |
| Category-based search and pagination | `assets/role-basic-usage.md` | A listing-screen implementation using `searchRoleInfosByCategoryAndRoleName` |
| Optimizing bulk sub-role registration | `assets/role-basic-usage.md` | The combination of `WithoutCreatingSummary` methods plus `regenerateRoleSummary()` |

### Reference

- `reference/role-api-reference.md` — All methods and signatures of `RoleInfoManager` / `RoleInfo` / `RoleInfoListItem` / `AdminException` (based on the actual platform API class definitions — do not write from memory)

## When to Use This Skill

Use this skill when the user makes a request such as:
- "I want to create a role in Java"
- "I want to use the RoleInfoManager API in the JavaEE development model to manage a role hierarchy"
- "I want to add or remove sub-roles for a role"
- "I want to list and move role categories"
- "I want to build a paginated listing that searches by role ID or role name"

If there is no explicit mention of "in Java" / "in the JavaEE development model," confirm with the user which development model the existing project implementation uses. If it is inside a JSSP (pro-code) screen or function container, use the SSJS version of the API (`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`).

Requests such as "I want to assign a role to a user" or "I want to change the roles a specific account holds" are out of scope for this skill; direct them to `java-im-account-usage`.

## Implementation Steps

1. Gather the user's requirements (role-definition CRUD, sub-role hierarchy operations, category management, or a search/listing screen — if the goal is assigning roles to users, direct them to `java-im-account-usage`)
2. Decide which `RoleInfo` constructor to use (auto-numbered role ID vs. explicitly specified) and whether role name/category/locale-specific display names need to be set
3. Implement by referring to `assets/role-basic-usage.md` (always refer to `reference/role-api-reference.md` for method signatures — do not write from memory or guesswork)
4. When working with a sub-role hierarchy, default to `addSubRoleInfo`/`deleteSubRoleInfo(s)` (the summary-auto-updating versions); use the `WithoutCreatingSummary` methods plus a single trailing call to `regenerateRoleSummary()` only when performance becomes an issue for large-scale bulk updates
5. Confirm compliance with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **`getRoleInfo(roleId)` returns `null`, not an exception, when the role does not exist.** Using the return value without a null check invites a `NullPointerException`. Always perform a null check
- **`RoleInfo()` (the no-argument constructor) throws `IOException`** (if auto-numbering via `Identifier` fails). The other two constructors (`RoleInfo(roleId)` / `RoleInfo(roleId, roleName)`) do not throw. Keep this asymmetry in mind when choosing a constructor
- **`certify`'s first argument (`nestRoleIds`) and second argument (`roleIds`) are asymmetric in whether nesting is expanded.** The first argument is checked including nested roles, while the second is checked by direct match only. Swapping the argument order can cause missed matches
- **Choose between `getAllParentRoleIds`/`getAllSubRoleIds` (recursive, all levels) and `getParentRoleIds`/`getSubRoleIds` (one level only)** based on whether you need only the immediate parent/child or the entire hierarchy — clarify this before implementing
- **When using the `WithoutCreatingSummary` methods (8.0.37 and later), you must separately call `regenerateRoleSummary()`.** Failing to do so leaves the role summary inconsistent, producing inaccurate results from summary-dependent search methods such as `getAllSubRoleIds`/`getAllParentRoleIds`/`certify`. Default to `addSubRoleInfo`/`deleteSubRoleInfo(s)` (the summary-auto-updating versions); only use the `WithoutCreatingSummary` methods plus a single trailing `regenerateRoleSummary()` call when performance is an issue for large-scale bulk updates
- **`getCategoryCount` is `@Deprecated`.** Use `getRoleInfoCountByCategory` in new implementations
- **`moveCategory` is a destructive operation that bulk-updates the category name of every role belonging to that category.** Confirm the target scope and impact before calling it

## Post-Generation Checks

A dedicated verification script equivalent to the JSSP version (`validate-jssp-code.js`) is not yet in place. Confirm the following manually.

1. Whether every place that uses `getRoleInfo()`'s return value performs a null check
2. Whether every place using `RoleInfo()` (the no-argument constructor) properly handles the `IOException`
3. Whether `certify()`'s first and second arguments (nesting vs. direct match) are passed in the intended order
4. Whether every place using a `WithoutCreatingSummary` method is followed, without omission, by a call to `regenerateRoleSummary()`
5. Whether the `@Deprecated` methods `getCategoryCount` and `isUpdate` are avoided in new implementations
6. Whether destructive operations such as `moveCategory`, `deleteRoleInfo(s)`, and `deleteCategory(ies)` execute only within the scope the requirements call for
7. Whether `AdminException` (a checked exception) is being swallowed anywhere
8. Whether the code complies with `.github/instructions/java-naming.instructions.md` / `java-code-style.md` / `java-javadoc.md`
9. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| Role-definition operations in SSJS (JSSP) | Use the corresponding SSJS version of the API (`d.ts/tenant/standard/im-ssjs-role-info-manager.d.ts`) (out of scope for this skill) |
| **Role definitions (CRUD/hierarchy/category/search) in Java (JavaEE development model)** | **This skill** |
| Assigning/revoking roles for a specific user in Java | `java-im-account-usage` |
| File operations in Java (`PublicStorage`, etc.) | `java-im-storage-usage` |
| Unique ID generation in Java (`Identifier`) | `java-im-identifier-usage` |
| Mutual exclusion in Java (`NewLock`) | `java-im-lock-usage` |
| Workflow integration processing in Java | `java-im-workflow-usage` |
