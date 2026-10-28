---
name: java-im-message-usage
description: A skill set for using intra-mart's message retrieval API (`jp.co.intra_mart.foundation.security.message.MessageManager`, `im_core_base` module) in Java (JavaEE development model). Provides the user/tenant/system locale resolution order, placeholder substitution, message existence checks (`hasMessage`), and message properties file placement/key naming conventions. Use this when the user mentions handling message properties in Java, localizing/internationalizing (i18n) in Java, using MessageManager in Java, or externalizing messages in the JavaEE development model. For the equivalent implementation in JSSP (script development model), use `jssp-localize-support` instead.
allowed-tools: Bash, Read, Write, Glob
---

# intra-mart MessageManager API (Java) Support Skill

## Purpose

A skill set that supports implementing Java code that retrieves labels and error messages from message properties files, using the message retrieval API provided by intra-mart Accel Platform for the **JavaEE development model** (`jp.co.intra_mart.foundation.security.message.MessageManager`).

**This skill only handles Java source files (`.java`) and message properties files (`.properties`).** For localization of JSSP (`.js` / `.html`), use `jssp-localize-support`.

## Choosing a Message Retrieval Method (Important)

`MessageManager` provides several method groups whose locale resolution scope differs. **Decide which one to use first, based on the intended use.**

| Method group | Locale resolution order | Primary use |
|---------------|--------------------------|-------------|
| `getMessage(String key, ...)` | User → Tenant → System → No locale specified | Labels/messages for screen display (**default for application development**) |
| `getMessage(Locale locale, String key, ...)` | Specified locale → No locale specified | When the message must not depend on the user's locale, e.g. logging |
| `getTenantMessage(String key, String...)` | Tenant → System → No locale specified | **For platform-internal use.** Not normally used in application development |
| `hasMessage(...)` / `hasTenantMessage(...)` | (Same resolution order as the corresponding `getMessage` group, existence check only) | When the presence of a key itself needs to drive business logic branching |

Decision criteria:
- For labels/error messages on screens that should vary with **the logged-in user's language setting → use `getMessage(String key, ...)`. Use this as the default unless the user specifies otherwise.**
- For log output/audit trails and other text where **the language should be fixed system-wide → use `getMessage(Locale, String key, ...)`** (explicitly specify `Locale.JAPANESE`, etc.)
- `getTenantMessage` is explicitly documented in the Javadoc as "a method for retrieving messages used in intra-mart Accel Platform's internal logs and exceptions," and is not normally used in application development

Always consult `reference/message-manager-api-reference.md` for the detailed method list, resolution order, and exception specification (do not rely on memory or guesswork).

## Conventions to Consult

| Convention | Handling |
|------------|----------|
| `.github/instructions/java-naming.instructions.md` | 🟢 **Required reading** — package/class/method/variable naming |
| `.github/instructions/java-code-style.instructions.md` | 🟢 **Required reading** — `final` local variables, string literals, etc. |
| `.github/instructions/java-javadoc.instructions.md` | 🟢 **Required reading** — class/method Javadoc |

There is no dedicated Java convention under `.github/instructions` that defines message properties file placement or key naming. This skill adopts the same key naming convention as the JSSP-side `jssp-localize-support` skill (see "Message Key Naming Convention" in `assets/message-manager-usage.md`). If the project already has existing message properties files, follow that existing key scheme instead.

`jssp-*` conventions are out of scope for this skill (do not apply them to Java files).

## API Overview

`MessageManager` is a `final` class in the `jp.co.intra_mart.foundation.security.message` package, with a `private` constructor. Obtain an instance via `getInstance()` (singleton). Always consult `reference/message-manager-api-reference.md` for the detailed signatures, resolution order, and exception specification (do not rely on memory or guesswork).

## Generation Targets and Templates

| Generation target | Template | Content |
|--------------------|----------|---------|
| Message retrieval in the user's locale (basic / placeholder substitution) | `assets/message-manager-usage.md` | Call patterns for `getMessage(key, args...)` |
| Message retrieval with an explicit locale (logging, etc.) | `assets/message-manager-usage.md` | Call patterns for `getMessage(Locale, key, args...)` |
| Embedding messages into business exceptions | `assets/message-manager-usage.md` | Implementation example including how `AccessSecurityException` is handled |
| Message existence checks | `assets/message-manager-usage.md` | Branching pattern using `hasMessage` |
| The message properties file (`.properties`) itself | `assets/message-manager-usage.md` | Key naming convention, native2ascii escaping, placement |

### Reference

- `reference/message-manager-api-reference.md` — All methods, signatures, locale resolution order, and properties file placement for `MessageManager` / `AccessSecurityException` / `IllegalArgumentException` (based on the actual platform API class definitions; do not write from memory).

## When to Use

Use this skill when the user makes a request such as:
- "Create Java code that handles message properties"
- "I want to localize screen labels in the JavaEE development model"
- "I want to use MessageManager in Java to retrieve error messages"
- "I want to externalize Java-side log messages into a properties file"

If it's not explicitly stated whether the target is JSSP or Java, confirm with the user which development model the existing project uses. If localization is for JSSP (script development model) screens or function containers, use `jssp-localize-support` instead.

## Implementation Steps

1. Gather requirements from the user (whether the target string should depend on the user's locale or be fixed system-wide, and whether an existing message key scheme exists)
2. Decide whether to use `getMessage(String key, ...)` or `getMessage(Locale, String key, ...)` (see the decision criteria table above. **Prioritize the user's instruction if given**; `getMessage(String key, ...)` is the default for screen display)
3. Decide the message key, and create or append to the properties files (`.properties`, one for each of `ja`/`en`/`zh_CN`/default) following "Message Key Naming Convention" in `assets/message-manager-usage.md`
4. Implement the Java code by consulting `assets/message-manager-usage.md` (always consult `reference/message-manager-api-reference.md` for method signatures; do not write from memory or guesswork)
5. Decide how to handle `AccessSecurityException` (follow the patterns in `assets/message-manager-usage.md`. In principle, propagate it upward or treat it as an internal error)
6. Verify compliance with `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md`

## Notes

- **`getMessage` / `getTenantMessage` do not throw an exception even when the message key is undefined.** When undefined, they fall back to `"undefined"` (or a message representing "undefined"). Use `hasMessage` / `hasTenantMessage` when an existence check is needed
- **`AccessSecurityException` is thrown only when `null` is passed for `key` / `locale` / `args`.** It indicates a caller-side implementation mistake, and is not normally something to catch and recover from at the business level
- **`jp.co.intra_mart.foundation.security.exception.IllegalArgumentException` is a different class from `java.lang.IllegalArgumentException`.** Be careful not to mix them up via the IDE's auto-import completion (see `reference/message-manager-api-reference.md` for details)
- **`getTenantMessage` is for platform-internal use.** Application development should use `getMessage` (user locale) or `getMessage(Locale, ...)` (explicit locale)
- Escape non-ASCII characters in message properties files using `\uXXXX` format (native2ascii). Use LF line endings
- Placeholder substitution follows `MessageFormat#format`. In the message body, escape `'` as `''` and `{` as `'{`

## Post-Generation Verification

Rather than an automated validation script (such as the JSSP version's `validate-i18n.js`), verify the following items manually.

1. Whether the choice among `getMessage(String key, ...)` / `getMessage(Locale, ...)` / `getTenantMessage` matches the required locale resolution scope (user-dependent or system-fixed)
2. Whether message keys comply with the naming convention in `assets/message-manager-usage.md` (dot-separated, no underscores or hyphens)
3. Whether the properties files exist for all of ja / en / zh_CN / default, and whether the key sets match across them
4. Whether `AccessSecurityException` is being swallowed anywhere
5. Whether the code complies with `.github/instructions/java-naming.instructions.md` / `.github/instructions/java-code-style.instructions.md` / `.github/instructions/java-javadoc.instructions.md`
6. `jssp-code-review` / `jssp-security-check` are JSSP-specific and do not apply to this skill's output. If the project has separate Java-specific code review/security check skills, use those instead

## Boundaries with Other Skills

| Responsibility | Skill in charge |
|-----------------|------------------|
| Message localization in SSJS (JSSP) (`<imart type="message">` tag, SSJS-version `MessageManager`) | `jssp-localize-support` |
| **Message properties / `MessageManager` implementation in Java (JavaEE development model)** | **This skill** |
| General Java architecture / layer structure | `java-im-architecture` |
