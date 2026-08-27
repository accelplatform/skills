---
name: java-im-identifier-usage
description: A skillset for using the intra-mart-specific unique ID generation API (`jp.co.intra_mart.foundation.service.client.information.Identifier`) in Java (JavaEE development model). Provides guidance on choosing between system-wide unique ID acquisition across a distributed environment (`get()`) and application-server-local unique ID acquisition (`make()`), along with exception handling patterns. Use when the user mentions wanting to generate a unique ID in Java, use the Identifier API in Java, implement unique numbering in the JavaEE development model, or auto-number order numbers or record keys. When building equivalent processing in JSSP (script development model), use the SSJS version of the Identifier API instead, if one is defined under `d.ts/platform/`.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart Identifier API (Java Version) Support Skill

## Purpose

A skillset for implementing the generation of unique identifiers — order numbers, numbering keys, trace IDs, and the like — in Java code, using the unique ID generation API provided for the **JavaEE development model** by intra-mart Accel Platform (`jp.co.intra_mart.foundation.service.client.information.Identifier`).

## Choosing Between the Two Retrieval Methods (Most Important)

The `Identifier` class provides two ways to obtain an ID, each guaranteeing uniqueness over a different scope. **Decide first which one fits the use case.**

| Method | Signature | Uniqueness Scope | Generated String Length | Exception |
|---------|-----------|-----------------|------------------|------|
| `get()` (instance method) | `public String get() throws IOException` | **System-wide** (uniqueness is guaranteed via the shared Server Manager even in a distributed environment / multi-application-server configuration) | 15 bytes | `IOException` (communication error with the Server Manager) |
| `make()` (static method) | `public static String make()` | **Within a single application server only** (unique within the process; uniqueness across other servers is not guaranteed) | 13 bytes | None (no checked exception) |

Decision criteria:
- **Uniqueness is required across a distributed environment (multiple application servers, a cluster configuration) → use `get()`.** Business data (order numbers, application numbers, table primary keys, or anything that must not collide with an ID generated on another server) should generally use this.
- **A temporary identifier that only needs to be closed within a single process is sufficient (a log trace ID, a correlation ID within a request scope, numbering for processing that only ever runs in a unit test or a single-process context, etc.) → use `make()`.** The code becomes simpler since no `IOException` handling is required.
- In actual platform code (`EngineNumberingUtil#createNewNumber()`), the pattern is to normally use `get()` and fall back to `make()` only in execution environments that cannot reach the Server Manager, such as a unit test mode. **Unless the user explicitly specifies otherwise, default to `get()` for numbering business data.**

**This skill covers Java source files (`.java`) only.** For implementation in JSSP (`.js`), use the corresponding SSJS version of the API if one is defined under `d.ts/platform/`.

## Conventions to Reference

| Convention | Handling |
|------|---------|
| `.claude/rules/java-naming.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.claude/rules/java-code-style.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.claude/rules/java-javadoc.md` | 🟢 **Required reading** — class/method JavaDoc |

No dedicated Java convention defining an `IOException` wrapping policy exists under `.claude/rules` (as of 2026). For exception handling when using `get()`, follow the pattern in `assets/identifier-basic-usage.md`.

`jssp-*` conventions are out of scope for this skill (they do not apply to Java files).

## API Overview

The `Identifier` class belongs to the `jp.co.intra_mart.foundation.service.client.information` package and is a `final` class (cannot be extended). Its only constructor is `public Identifier()`, and it holds no state (safe to call from multiple threads). For detailed signatures, internal structure, and related classes, refer to `reference/identifier-api-reference.md` (do not write these from memory or guesswork).

## What to Generate and Which Templates to Use

| What to generate | Template | Content |
|---------|------------|------|
| Processing that numbers a distributed-environment-unique ID (`get()`, including `IOException` handling) | `assets/identifier-basic-usage.md` | Field/method call examples, wrapping into a business exception |
| Processing that numbers a lightweight application-server-local ID (`make()`) | `assets/identifier-basic-usage.md` | Call examples for log trace IDs, correlation IDs, etc. |

### Reference

- `reference/identifier-api-reference.md` — All methods and signatures of `Identifier` / `IdentifierSpi` / `SystemIdProvider`, the format of the generated ID, and how to customize via `identifier-config.xml` (based on the actual platform API class definitions — do not write from memory)

## When to Use This Skill

Use this skill when the user makes a request such as:
- "Create processing in Java that generates a unique ID"
- "I want to auto-number order numbers in the JavaEE development model"
- "I want to use the Identifier API in Java to number a table's primary key"
- "Issue an ID in Java that doesn't collide even across a distributed environment"
- "Number a log trace ID in Java"

If there is no explicit mention of "in Java" / "in the JavaEE development model," confirm with the user which development model the existing project implementation uses. If the numbering is inside a JSSP (pro-code) screen or function container, use the SSJS version of the API instead, if one exists.

## Implementation Steps

1. Gather the user's requirements (the purpose of the numbered ID, whether uniqueness across a distributed environment is required, whether business-level error handling is needed on numbering failure)
2. Decide whether to use `get()` or `make()` (see the decision criteria table above. **Prioritize the user's explicit specification if given**; default to `get()` for numbering business data)
3. Implement by referring to `assets/identifier-basic-usage.md` (always refer to `reference/identifier-api-reference.md` for method signatures — do not write from memory or guesswork)
4. When using `get()`, decide whether to wrap `IOException` into a business exception or propagate it via `throws`, following the pattern in `assets/identifier-basic-usage.md` (prefer a dedicated Java error-handling convention instead, if the project later adds one)
5. Confirm compliance with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`

## Notes

- **Do not use `Identifier` to generate security tokens.** The generated ID is a predictable value composed of timestamp information and an internal sequence number (plus a system ID in the case of `get()`) — it is not a cryptographically secure random value. For use cases requiring unguessability, such as password reset tokens, CSRF tokens, or session IDs, use a different API such as `java.security.SecureRandom` (out of scope for this skill)
- **`get()` throws `IOException`.** Since a communication error with the Server Manager can occur, the caller must always either `try-catch` it or declare `throws` and propagate it to the caller. Never swallow it
- **`make()` is only unique within the process.** Using `make()` for processing that could be numbered simultaneously on multiple application servers (e.g., issuing order numbers in a cluster configuration) can produce duplicate IDs. Always use `get()` when uniqueness across a distributed environment is a requirement
- **`Identifier` is a stateless class.** Instantiation (`new Identifier()`) is only needed when calling `get()`. `make()` is a static method, so no instantiation is needed
- The generated ID is an alphanumeric string (base-36 representation). When storing it in a DB column, design the column length taking the digit count into account (15 bytes for `get()`, 13 bytes for `make()`)
- Customizing the generation algorithm via `identifier-config.xml` (swapping in a custom `IdentifierSpi` implementation) is a platform-wide configuration change and is normally unnecessary for individual application development. Only handle it, referring to the corresponding section of `reference/identifier-api-reference.md`, when the user explicitly requests it

## Post-Generation Checks

A dedicated verification script equivalent to the JSSP version (`validate-jssp-code.js`) is not yet in place. Confirm the following manually.

1. Whether the choice between `get()` / `make()` matches the required uniqueness scope (distributed environment or single process)
2. Whether `IOException` is being swallowed anywhere `get()` is used
3. Whether the API has been misused for a purpose requiring unguessability, such as a security token
4. Whether the code complies with `.claude/rules/java-naming.md` / `java-code-style.md` / `java-javadoc.md`
5. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has a separate Java-specific code review / security check skill, use that instead

## Boundaries with Other Skills

| Responsibility | Owning Skill |
|------|-----------|
| Unique ID generation in SSJS (JSSP) | Use the corresponding SSJS version of the API if one is defined (out of scope for this skill) |
| **Unique ID generation in Java (JavaEE development model)** | **This skill** |
| File operations in Java (`PublicStorage`, etc.) | `java-im-storage-usage` |
| Workflow integration processing in Java | `java-im-workflow-usage` |
| Generating unguessable tokens for security purposes | Out of scope for this skill (implement individually with `java.security.SecureRandom`, etc.) |
