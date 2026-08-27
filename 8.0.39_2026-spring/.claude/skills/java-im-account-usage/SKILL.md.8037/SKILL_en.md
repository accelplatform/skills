---
name: java-im-account-usage
description: A skillset for using the intra-mart-specific account information management API (`jp.co.intra_mart.foundation.admin.account.AccountInfoManager`) in Java (JavaEE development model). Provides implementation patterns for login settings (locale, time zone, calendar, theme, first day of week, date/time formats), account lock and login failure counts, account attributes (`getAttribute`/`setAttribute`), password verification (`AccountPasswordAdapter`), and assigning roles to users (`addAccountRoleInfo`, etc.). Use when the user mentions wanting to get/update account information in Java, wanting to use AccountInfoManager in Java, wanting to handle login settings or account locking in the JavaEE development model, or wanting to build processing in Java that assigns roles to users. For operating on role definitions themselves (registering new roles, hierarchy, categories), use `java-im-role-usage` instead. When building equivalent processing in JSSP (script development model), use the SSJS version of the AccountInfoManager API (`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`) instead.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Account Info Manager API (Java Version) Support Skill

## Purpose

A skillset for implementing account login settings, locking, attributes, password verification, and role assignment in Java code, using the account information management API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.admin.account.AccountInfoManager`).

## The Boundary Between Accounts and Roles (Most Important)

Methods that link a user to a role (`addAccountRoleInfo`, `deleteAccountRoleInfo`, `getAccountRoleIds`, etc.) are defined on the `AccountInfoManager` side, but **semantically they are about "roles."** This skill includes these as implementation patterns, but the responsibilities are split as follows.

| Responsibility | Owning Skill |
|------|-----------|
| **Assigning, unassigning, and setting the valid period of** roles for a user (`addAccountRoleInfo`, etc. — does not change fields other than the assignment itself) | **This skill** |
| Operating on role **definitions** themselves — new registration, hierarchy structure, categories | `java-im-role-usage` |

If you are about to implement role assignment while the role definition itself does not yet exist, confirm with the user whether a role definition needs to be created first via `java-im-role-usage`.

**This skill covers Java source files (`.java`) only.** For implementation in JSSP (`.js`), use the SSJS version of the AccountInfoManager API (`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`).

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.claude/rules/java-code-style.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.claude/rules/java-javadoc.md` | 🟢 **Required reading** — class/method JavaDoc |

No dedicated Java convention defining exception-handling policy exists under `.claude/rules` (as of 2026). All of `AccountInfoManager`'s and `AccountPasswordAdapter`'s exceptions are checked exceptions (described below); follow the business-exception-wrapping pattern in `assets/account-basic-usage.md`.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

The `AccountInfoManager` class belongs to the `jp.co.intra_mart.foundation.admin.account` package and is a **`final class`** — it cannot be subclassed. The `AccountInfo` model requires `userCd` as a constructor argument; instantiate it with `new AccountInfo(userCd)` (there is no default constructor). Note that the `AccountInfo#locale` field is of type **`java.util.Locale`**, not `String`. For detailed signatures, internal structure, and related classes, refer to `reference/account-api-reference.md` (do not write these from memory or guesswork).

## What to Generate and Which Templates to Use

| What to generate | Template | Content |
|---------|------------|------|
| Registering/updating account information (including login settings) | `assets/account-basic-usage.md` | Call examples for `addAccountInfo()` / `getAccountInfo()` → `updateAccountInfo()` |
| Password verification | `assets/account-basic-usage.md` | Login-confirmation processing using `AccountPasswordAdapter#collate()` |
| Account locking / unlocking | `assets/account-basic-usage.md` | Call examples for `AccountInfo#setLockDate()` |
| Getting/setting account attributes | `assets/account-basic-usage.md` | Call examples for `getAttribute()` / `setAttribute()` |
| Assigning roles to a user and retrieving the list of valid roles | `assets/account-basic-usage.md` | `addAccountRoleInfo()`, and choosing between `getAccountRoleIds()` and the recursive `getAccountRoleIdsRecursively()` |

### Reference

- `reference/account-api-reference.md` — All methods and signatures of `AccountInfoManager` / `AccountInfo` / `AccountRoleInfo` / `AccountPasswordAdapter`, and how the exceptions (`AdminException` / `PasswordException`) are handled (based on the actual platform API class definitions — do not write from memory)

## When to Use This Skill

Use this skill when the user makes a request such as:
- "I want to get/update account information in Java"
- "I want to use AccountInfoManager in Java"
- "I want to handle login settings (locale, time zone, calendar) in the JavaEE development model"
- "I want to implement account locking / login failure counts in Java"
- "I want to build processing in Java that assigns a role to a user"
- "I want to build processing in Java that verifies a password at login time"

If there is no explicit mention of "in Java" / "in the JavaEE development model," confirm with the user which development model the existing project implementation uses. If the implementation is inside a JSSP (pro-code) screen or function container, use the SSJS version of the AccountInfoManager API (`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`) instead.

Also, if the request concerns role **definitions** themselves (new registration, hierarchy, categories), direct the user to `java-im-role-usage` instead of this skill.

## Implementation Steps

1. Gather the user's requirements (which aspect of the account is involved: login settings / locking / attributes / password verification / role assignment, or several of these)
2. If the request is to operate on role **definitions** themselves, redirect to `java-im-role-usage` (out of scope for this skill)
3. Implement by referring to `assets/account-basic-usage.md` (always refer to `reference/account-api-reference.md` for method signatures — do not write from memory or guesswork)
4. When handling passwords, always design under the assumption that the `password` field is `null` when the storage method is hashing (never compare plaintext directly; use `AccountPasswordAdapter#collate()`)
5. When updating account information, never instantiate a fresh `new AccountInfo(userCd)` each time — always fetch the existing values with `getAccountInfo()` first and change only the needed fields
6. Confirm compliance with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **When passwords are stored hashed, `password` comes back `null` from `getAccountInfo()`/`getAccountInfos()`/`searchAccountInfos()`.** Always use `AccountPasswordAdapter#collate()` for password verification (never compare `AccountInfo.password` directly)
- **`updateAccountInfo()` updates only the non-password fields when `AccountInfo.password` is `null`.** If you want to update other fields while preserving the password, leave the `password` field of the fetched `AccountInfo` untouched and pass it through as-is. Conversely, accidentally setting a non-null value such as an empty string will unintentionally overwrite the password
- **`AccountRoleInfo`'s valid period is evaluated as "start date &lt;= evaluation date &lt; end date."** Setting the end date to `null` resets it to the system's maximum date (note this is not the same as "unlimited" — the system maximum date is treated as the de facto unlimited value)
- **`getUserCdsByAccountRoleId()` (direct-match only) and `getUserCdsByRoleId()` (accounts for hierarchy and valid period) behave differently.** Use the latter when you want to also find holders of sub-roles beneath a parent role. Likewise, choose between `getAccountRoleIds()` (direct assignment only) and `getAccountRoleIdsRecursively()` (includes sub-roles) as appropriate
- **`isUpdate(Date)` is `@Deprecated`** (returns `true` unconditionally as of 8.0.4 and later). Do not use it to determine whether an update occurred
- **`AccountPasswordAdapter#decrypt()` returns `null` when `canDecrypt()` is `false`** (irreversible, i.e., hashed). If your implementation assumes decryption is possible, check `canDecrypt()` first
- All of `AccountInfoManager`'s methods throw `AdminException` (checked), and all of `AccountPasswordAdapter`'s methods throw `PasswordException` (checked). **These are separate exception class hierarchies**, so when a single method uses both APIs, either catch them separately or catch them together via a common superclass

## Post-Generation Checks

A dedicated verification script equivalent to the JSSP version (`validate-jssp-code.js`) is not yet in place. Confirm the following manually.

1. Whether password verification uses `AccountPasswordAdapter#collate()` rather than directly comparing `AccountInfo.password`
2. Whether every call to `updateAccountInfo()` is based on values fetched beforehand via `getAccountInfo()`, rather than instantiating a fresh `new AccountInfo(userCd)` each time and dragging in unset fields
3. Whether, in places meant to exclude the password from the update, a non-null value such as an empty string has been mistakenly set on `password`
4. Whether role-assignment lookups use direct-match (`getAccountRoleIds()` / `getUserCdsByAccountRoleId()`) versus hierarchy-aware (`getAccountRoleIdsRecursively()` / `getUserCdsByRoleId()`) methods consistently with the requirements
5. Whether `AdminException` / `PasswordException` are being swallowed silently
6. Whether operations on role definitions themselves have crept in (if so, carve them out into the scope of `java-im-role-usage`)
7. Whether the code complies with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
8. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| Account information operations in SSJS (JSSP) | Use the SSJS version of the AccountInfoManager API (`d.ts/tenant/standard/im-ssjs-account-info-manager.d.ts`) instead (out of scope for this skill) |
| **Account settings, locking, attributes, password verification, and role assignment in Java (JavaEE development model)** | **This skill** |
| Operating on role **definitions** themselves (new registration, hierarchy, categories) | `java-im-role-usage` |
| File operations in Java (`PublicStorage`, etc.) | `java-im-storage-usage` |
| Unique ID generation in Java (`Identifier`) | `java-im-identifier-usage` |
| Mutual exclusion in Java (`NewLock`) | `java-im-lock-usage` |
| Workflow integration processing in Java | `java-im-workflow-usage` |
