# Coding Conventions

This directory holds the coding conventions for intra-mart Accel Platform script development (JSSP) projects.

## Convention Application Priority (Most Important)

1. **Specification First**: The deliverable's content follows the specification documents (`spec/*.md`, etc.). What the specification states overrides the conventions here.
2. **Conventions Are a Fallback**: Apply these conventions as defaults **only** for matters the specification does not address.
3. **Avoid Over-Application**: The conventions are a "minimum guardrail," not an "achievement target." Do not infer extra requirements from the conventions for items the specification is silent about.
   - In particular, **business-requirement-dependent conventions** (accessibility strictness, character limits, elaborate error code schemes, etc.) should be applied minimally unless the specification gives explicit instructions.
   - "Just in case" thickening of every convention makes it hard for maintainers to tell why a given piece of code looks the way it does.

## How to Reference the Conventions

Each convention file states its **application scope** at the top. Use the **scope tags** in the table below to decide whether to `Read` a given convention for the current task. Conventions that are unrelated to the task (e.g. `.github/instructions/jssp-2way-sql.instructions.md` for a screen with no DB access) do not need to be read.

### Scope Tag Legend

| Tag | Meaning | Handling |
|-----|---------|----------|
| 🟢 **Always** | Applies to every JSSP implementation | Always consult |
| 🟡 **Contextual** | Applies only when the relevant feature is used | Skip if the feature is not involved |
| 🟠 **Business-requirement-dependent** | Apply thickly only when the specification gives explicit instructions; otherwise stay minimal | Check the spec first, then decide whether to read |

## Convention File List (One-Line Summary + Scope Tag)

### For JSSP (Script Development Model)

| File | One-line summary | Scope |
|------|------------------|-------|
| `.github/instructions/jssp-overview.instructions.md` | Project overview and tech stack | 🟢 Always |
| `.github/instructions/jssp-file-structure.instructions.md` | Directory layout and file naming | 🟢 Always |
| `.github/instructions/jssp-code-style.instructions.md` | `let` / string literals / operators | 🟢 Always (when generating `.js`) |
| `.github/instructions/jssp-naming.instructions.md` | File / function / variable names | 🟢 Always |
| `.github/instructions/jssp-function-container.instructions.md` | `init()` structure / validation / IM Common Master API | 🟢 When generating function containers (`.js`) |
| `.github/instructions/jssp-presentation-page.instructions.md` | Presentation page (`.html`) structure / validation / `id` naming rules | 🟢 When generating presentation pages (`.html`) |
| `.github/instructions/jssp-error-handling.instructions.md` | try-catch / response shape / error codes | 🟢 Always |
| `.github/instructions/jssp-security.instructions.md` | XSS / CSRF / input validation | 🟢 Always (whenever user input is handled) |
| `.github/instructions/jssp-logging.instructions.md` | Log levels / masking secrets / placeholders | 🟡 When implementing logging |
| `.github/instructions/jssp-2way-sql.instructions.md` | 2WaySQL / `DbParameter` / transactions | 🟡 **Only for DB operations** (when using `db.executeByTemplate` / `db.execute`) |
| `.github/instructions/jssp-testing.instructions.md` | Unit testing (jest-on-rhino) | 🟡 When writing tests |
| `.github/instructions/jssp-performance.instructions.md` | Compiler settings / session.js | 🟡 When tuning performance |
| `.github/instructions/jssp-accessibility.instructions.md` | ARIA / WCAG 2.1 AA / screen readers | 🟠 **Business-requirement-dependent** — apply thickly only when the spec explicitly requires it; otherwise keep to the basics (`imdsConfirm`, basic `aria-label`, etc.) |

### Common (JSSP / Java)

| File | One-line summary | Scope |
|------|------------------|-------|
| `.github/instructions/database-ddl.instructions.md` | Table/column naming conventions / type mapping / audit trail columns / primary key & index design / syntax allowed in DDL | 🟢 Always (when creating DDL for a new table, regardless of whether the table is used from JSSP or Java) |

### For Java (JavaEE Development Model)

| File | One-line summary | Scope |
|------|------------------|-------|
| `.github/instructions/java-architecture.instructions.md` | Layer structure / dependency rules / exception hierarchy / factory pattern | 🟢 Always (when implementing Java) |
| `.github/instructions/java-service-layer.instructions.md` | Service layer implementation rules / transaction boundaries / exception conversion | 🟢 Always (when implementing the `service` package) |
| `.github/instructions/java-entity.instructions.md` | Entity class (Mirage ORM) design conventions / audit trail fields | 🟡 When generating Entity classes (`entity` package) |
| `.github/instructions/java-code-style.instructions.md` | `final` / string literals / `equals()` / raw type prohibition | 🟢 Always (when generating `.java`) |
| `.github/instructions/java-naming.instructions.md` | Package / class / method / variable naming conventions | 🟢 Always |
| `.github/instructions/java-javadoc.instructions.md` | JavaDoc conventions for classes and methods | 🟢 Always |
| `.github/instructions/java-logging.instructions.md` | Log levels / masking secrets / log-level decisions by exception type | 🟡 When implementing logging |

## Localization

Each convention file has localized variants (`*_en.md`, `*_zh_CN.md`) under `*.md.<version>/`.
These switch automatically based on the project's locale setting.
