# Coding Conventions

This directory holds the coding conventions for intra-mart Accel Platform script development (JSSP) projects.

## Convention Application Priority (Most Important)

1. **Specification First**: The deliverable's content follows the specification documents (`spec/*.md`, etc.). What the specification states overrides the conventions here.
2. **Conventions Are a Fallback**: Apply these conventions as defaults **only** for matters the specification does not address.
3. **Avoid Over-Application**: The conventions are a "minimum guardrail," not an "achievement target." Do not infer extra requirements from the conventions for items the specification is silent about.
   - In particular, **business-requirement-dependent conventions** (accessibility strictness, character limits, elaborate error code schemes, etc.) should be applied minimally unless the specification gives explicit instructions.
   - "Just in case" thickening of every convention makes it hard for maintainers to tell why a given piece of code looks the way it does.

## How to Reference the Conventions

Each convention file states its **application scope** at the top. Use the **scope tags** in the table below to decide whether to `Read` a given convention for the current task. Conventions that are unrelated to the task (e.g. `.agents/requirements/jssp-2way-sql/AGENTS.md` for a screen with no DB access) do not need to be read.

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
| `.agents/requirements/jssp-overview/AGENTS.md` | Project overview and tech stack | 🟢 Always |
| `.agents/requirements/jssp-file-structure/AGENTS.md` | Directory layout and file naming | 🟢 Always |
| `.agents/requirements/jssp-code-style/AGENTS.md` | `let` / string literals / operators | 🟢 Always (when generating `.js`) |
| `.agents/requirements/jssp-naming/AGENTS.md` | File / function / variable names | 🟢 Always |
| `.agents/requirements/jssp-function-container/AGENTS.md` | `init()` structure / validation / IM Common Master API | 🟢 When generating function containers (`.js`) |
| `.agents/requirements/jssp-presentation-page/AGENTS.md` | Presentation page (`.html`) structure / validation / `id` naming rules | 🟢 When generating presentation pages (`.html`) |
| `.agents/requirements/jssp-error-handling/AGENTS.md` | try-catch / response shape / error codes | 🟢 Always |
| `.agents/requirements/jssp-security/AGENTS.md` | XSS / CSRF / input validation | 🟢 Always (whenever user input is handled) |
| `.agents/requirements/jssp-logging/AGENTS.md` | Log levels / masking secrets / placeholders | 🟡 When implementing logging |
| `.agents/requirements/jssp-2way-sql/AGENTS.md` | 2WaySQL / `DbParameter` / transactions | 🟡 **Only for DB operations** (when using `db.executeByTemplate` / `db.execute`) |
| `.agents/requirements/jssp-testing/AGENTS.md` | Unit testing (jest-on-rhino) | 🟡 When writing tests |
| `.agents/requirements/jssp-performance/AGENTS.md` | Compiler settings / session.js | 🟡 When tuning performance |
| `.agents/requirements/jssp-accessibility/AGENTS.md` | ARIA / WCAG 2.1 AA / screen readers | 🟠 **Business-requirement-dependent** — apply thickly only when the spec explicitly requires it; otherwise keep to the basics (`imdsConfirm`, basic `aria-label`, etc.) |

### Common (JSSP / Java)

| File | One-line summary | Scope |
|------|------------------|-------|
| `.agents/requirements/database-ddl/AGENTS.md` | Table/column naming conventions / type mapping / audit trail columns / primary key & index design / syntax allowed in DDL | 🟢 Always (when creating DDL for a new table, regardless of whether the table is used from JSSP or Java) |

### For Java (JavaEE Development Model)

| File | One-line summary | Scope |
|------|------------------|-------|
| `.agents/requirements/java-architecture/AGENTS.md` | Layer structure / dependency rules / exception hierarchy / factory pattern | 🟢 Always (when implementing Java) |
| `.agents/requirements/java-service-layer/AGENTS.md` | Service layer implementation rules / transaction boundaries / exception conversion | 🟢 Always (when implementing the `service` package) |
| `.agents/requirements/java-entity/AGENTS.md` | Entity class (Mirage ORM) design conventions / audit trail fields | 🟡 When generating Entity classes (`entity` package) |
| `.agents/requirements/java-code-style/AGENTS.md` | `final` / string literals / `equals()` / raw type prohibition | 🟢 Always (when generating `.java`) |
| `.agents/requirements/java-naming/AGENTS.md` | Package / class / method / variable naming conventions | 🟢 Always |
| `.agents/requirements/java-javadoc/AGENTS.md` | JavaDoc conventions for classes and methods | 🟢 Always |
| `.agents/requirements/java-logging/AGENTS.md` | Log levels / masking secrets / log-level decisions by exception type | 🟡 When implementing logging |

## Localization

Each convention file has localized variants (`*_en.md`, `*_zh_CN.md`) under `*.md.<version>/`.
These switch automatically based on the project's locale setting.
