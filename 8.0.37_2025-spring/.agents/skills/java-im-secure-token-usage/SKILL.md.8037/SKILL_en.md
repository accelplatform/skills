---
name: java-im-secure-token-usage
description: A skill set for using intra-mart's secure token API (`jp.co.intra_mart.foundation.secure_token.SecureTokenManager`, `im_core_base` module) in Java (JavaEE development model). Provides token issuance (`createToken`) and verification (`verify`) for CSRF protection, choosing between one-time and reusable tokens, tamper detection via parameter-bound tokens, and how to obtain an `HttpServletRequest` via `HTTPContextManager`. Use this when the user mentions issuing/verifying a SecureToken in Java, implementing CSRF protection in Java, using `SecureTokenManager`, or handling secure tokens without relying on Web API Maker's `@Secured`. For declarative secure token verification on a Web API Maker endpoint, use `java-im-web-api-maker-usage` (`@Secured`) instead.
---

# intra-mart SecureToken API (Java) Support Skill

## Purpose

A skill set that supports implementing CSRF (Cross-Site Request Forgery) protection — token issuance and verification — in Java code, using the secure token API provided by intra-mart Accel Platform for the **JavaEE development model** (`jp.co.intra_mart.foundation.secure_token.SecureTokenManager`).

This is a mechanism for blocking requests that don't go through the legitimate flow (displaying a screen → submitting a form, etc.); Web API Maker's `@Secured` annotation also uses this API internally. **This skill targets implementations that call `SecureTokenManager` directly without relying on `@Secured`** (Servlets, custom tags, Java endpoints other than Web API Maker, etc.).

## Token Lifecycle (Important)

`SecureTokenManager` provides different method groups for "issuance" and "verification." **Decide which to use, and which token type, based on the intended use.**

| Phase | Method | Decision point |
|------|---------|-------------|
| Issuance | `createToken(boolean useOneTimeToken)` / `createToken(boolean, Map<String, List<String>>)` | One-time (`true`) or reusable (`false`). **Default to one-time for state-changing operations** |
| Verification | `verify()` / `verify(String)` / `verify(String, Map<String, List<String>>)` | Take the token from the request parameter automatically, or pass the token string explicitly |

Decision criteria:
- **For a one-off state-changing operation (registration, update, deletion, login processing, etc.) → default to `createToken(true)` (a one-time token)**
- **For an operation where the same screen may submit multiple times (a paginated search form, etc.) → consider `createToken(false)` (a reusable token)**
- **When you also need to confirm that important parameters (an amount, a permission level, etc.) were not tampered with during the screen transition → use a parameter-bound token** (the variant that takes `Map<String, List<String>>`; see Pattern 3 in `assets/secure-token-basic-usage.md`)

**This skill only handles Java source files (`.java`).** For CSRF protection in JSSP (`.html`/`.js`), use the `<imart type="imSecureToken" />` tag (see `.agents/requirements/jssp-security/AGENTS.md`) or the JSSP version of token verification.

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.agents/requirements/java-naming/AGENTS.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.agents/requirements/java-code-style/AGENTS.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.agents/requirements/java-javadoc/AGENTS.md` | 🟢 **Required reading** — class/method Javadoc |

There is no dedicated Java convention under `.agents/requirements` for SecureToken implementation. Follow the patterns in `assets/secure-token-basic-usage.md` for exception handling and how to respond when token verification fails.

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

`SecureTokenManager` belongs to the `jp.co.intra_mart.foundation.secure_token` package, and its constructor requires a `ServletRequest`. In contexts where an `HttpServletRequest` isn't passed as an argument, obtain one via `HTTPContextManager`. Always consult `reference/secure-token-api-reference.md` for the detailed signatures (do not rely on memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|--------------------|----------|---------|
| Token issuance/verification in a Servlet (basic form) | `assets/secure-token-basic-usage.md` Pattern 1 | `createToken`/`verify` call examples in `doGet`/`doPost` |
| Implementation in a context where `HttpServletRequest` isn't passed as an argument | `assets/secure-token-basic-usage.md` Pattern 2 | Obtaining the request via `HTTPContextManager` |
| Parameter-bound tokens (tamper detection) | `assets/secure-token-basic-usage.md` Pattern 3 | Passing the same parameters at issuance and verification time |
| Choosing between one-time and reusable tokens | `assets/secure-token-basic-usage.md` Pattern 4 | `createToken` call examples by use case |
| Exception handling and the response on verification failure | `assets/secure-token-basic-usage.md` Pattern 5 | Distinguishing `SecureTokenException` from a `false` result from `verify()` |

### Reference

- `reference/secure-token-api-reference.md` — All methods and signatures for `SecureTokenManager`/`SecureToken`/`SecureTokenException`/`HTTPContextManager` (based on the actual platform API class definitions; do not write from memory).

## When to Use

Use this skill when the user makes a request such as:
- "Create Java code that issues and verifies a SecureToken"
- "I want to implement CSRF protection in Java"
- "I want to use `SecureTokenManager`"
- "I want to verify a secure token without using Web API Maker"

If it's not explicitly stated whether this is for Java or the JavaEE development model, confirm with the user which development model the existing project uses. For CSRF protection on JSSP (script development model) screens, use the `<imart type="imSecureToken" />` tag (`.agents/requirements/jssp-security/AGENTS.md`). For a Web API Maker endpoint, use `@Secured` from `java-im-web-api-maker-usage`.

## Implementation Steps

1. Gather requirements from the user (where issuance and verification happen, whether it's a state-changing operation, whether tamper detection on parameters is needed, whether the context has direct access to `HttpServletRequest`)
2. Decide whether to use a one-time or reusable token (see the decision criteria table above. **Prioritize the user's instruction if given**; one-time is the default for state-changing operations)
3. Implement by consulting `assets/secure-token-basic-usage.md` (always consult `reference/secure-token-api-reference.md` for method signatures; do not write from memory or guesswork)
4. Decide how to obtain the `HttpServletRequest` (use Pattern 1 or Pattern 2 in `assets/secure-token-basic-usage.md` depending on whether it's passed as an argument)
5. Implement the response when `verify()` returns `false` (e.g., `403`) separately from handling a `SecureTokenException` (`assets/secure-token-basic-usage.md` Pattern 5)
6. Verify compliance with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Do not confuse `verify()` returning `false` with a `SecureTokenException` being thrown.** The former is a normal judgment result indicating "an access that didn't go through the legitimate flow" (reject with `403`, etc.); the latter is an abnormality in the token processing itself (a session inconsistency, etc. — treat as a system error)
- **`createToken()` stores the token in the session tied to the `HttpServletRequest` passed to the constructor.** It does not work correctly if called when no session has been established
- **Do not enable the development-only system property that skips verification (`jp.co.intra_mart.foundation.secure_token.SecureTokenManager.ignore_token_check`) in a production environment.** It disables CSRF protection
- **A one-time token is invalidated after verification.** Calling `getString()`, etc. on an invalidated `SecureToken` again throws a `SecureTokenException`
- If you want secure token verification on a Web API Maker endpoint, don't call this API directly — use `@Secured` from `java-im-web-api-maker-usage` instead (avoid duplicating the verification logic)

## Post-Generation Verification

Rather than an automated validation script, verify the following items manually.

1. Whether a one-time token is used for state-changing operations, and a reusable token for operations that may be submitted multiple times
2. Whether a `false` result from `verify()` (access denial) is handled separately from a `SecureTokenException` (system error)
3. Whether the method of obtaining `HttpServletRequest` (direct argument / `HTTPContextManager`) matches the implementation context
4. When using parameter-bound tokens, whether the same parameter format is passed at both issuance and verification time
5. Whether the code complies with `.agents/requirements/java-naming/AGENTS.md` / `java-code-style.md` / `java-javadoc.md`
6. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|-----------------|------------------|
| CSRF protection on JSSP (script development model) screens | The `<imart type="imSecureToken" />` tag (`.agents/requirements/jssp-security/AGENTS.md`) |
| Declarative secure token verification on a Web API Maker endpoint (`@Secured`) | `java-im-web-api-maker-usage` |
| **Direct use of `SecureTokenManager` in Java (JavaEE development model) (Servlets, custom tags, etc.)** | **This skill** |
