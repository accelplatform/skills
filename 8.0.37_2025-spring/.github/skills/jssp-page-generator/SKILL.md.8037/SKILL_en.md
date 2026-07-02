---
name: jssp-page-generator
description: Generates new screens, function containers, common processing, and routing configurations for intra-mart JSSP. Use when asked to create a screen, add a new page, create a JSSP file, implement a form, create a list screen, add an input screen, or build CRUD screens. Server-side processing including the init function is also within scope of this skill. Use jssp-im-job-generator for job scheduler batch processing, and jssp-im-workflow-usage for workflow-related tasks.
allowed-tools: Bash, Read, Write, Glob
---

# JSSP Code Generation Skill

## Purpose

A skill set for generating new intra-mart Accel Platform JSSP code.
Describes the steps for creating and structuring new files according to templates and conventions.

## Generation Targets

- **Function Container** (.js) — Server-side logic (init function is the entry point)
- **Presentation Page** (.html) — Screen display
- **Common Processing** (.js) — Shared server-side processing
- **Routing Configuration** (.xml) — URL settings

※ Use `jssp-im-job-generator` for job programs, and `jssp-im-workflow-usage` for workflow-related items.

## Conventions to Reference

This skill generates both `.js` (function containers) and `.html` (presentation pages), so many conventions apply. See the "Convention File List (One-Line Summary + Scope Tag)" in `.github/instructions/README.md` for the full picture. Convention-specific priorities for this skill:

| Convention | Handling |
|------------|----------|
| `jssp-presentation-page.md` | 🟢 **Required** — HTML structure, validation, id naming for `.html` |
| `jssp-function-container.md` | 🟢 **Required** — `init()` structure, validateRequest |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 Required |
| `jssp-error-handling.md` / `jssp-security.md` | 🟢 Required — both apply since forms + APIs are involved |
| `jssp-2way-sql.md` | 🟡 **Only when the implementation includes DB operations**. Skip for read-only UIs etc. that do not touch the DB |
| `jssp-logging.md` | 🟡 Only when implementing logging |
| `jssp-accessibility.md` | 🟠 **Business-requirement-dependent** — apply thickly only when explicitly required by the spec; otherwise stay minimal (`imdsConfirm`, `aria-label`, `aria-hidden` on decorative icons, etc.) |

## When to Use

When the user makes requests such as:
- "Create a ○○ screen"
- "Add a new JSSP file"
- "Build a list screen"
- "Implement an input form"
- "Create a CRUD screen"

---

## Integrated Workflow

**Execute this workflow from top to bottom in order. Skipping or reordering steps is prohibited.**
Complete each step before proceeding to the next. Report to the user only after Step 11 is complete.

---

### Step 1: Requirements Gathering

Confirm the following from the user:

- Screen name and feature overview
- Placement path (where under `src/main/jssp/src/`)
- Whether a new table is needed
- **Whether the screen includes any field that asks the user to select an IM common master value (user / department / company / group / role)** → if so, combine with the `jssp-im-master-usage` skill to implement it as a master search dialog (manual code entry via a plain `<input>` is prohibited)

---

### Step 2: Load Asset Samples

Based on the screen type, **open and load the corresponding asset file using the Read tool.**
This step must not be skipped. Assets contain usage examples of imds-compliant structure and class names.

| Screen Type | File to Load |
|-------------|--------------|
| Input Form  | `assets/simple-form.md` |
| List Screen | `assets/simple-list.md` |
| Wizard      | `assets/simple-wizard.md` |
| Calendar Screen | `assets/sample-calendar.md` |
| File Upload/Download REST-API | `assets/file-upload-download-api.md` (Also load `reference/api-binary-stream.md` for binary transfer details) |
| Raw JSON receiver REST-API (POST `application/json`) | `assets/post-json-api.md` |

---

### Step 3: Load imds Component References

Refer to the `jssp-imds-theme` skill and **open and load the corresponding reference file for each UI component using the Read tool.**
Do not write imds class names or tag structures from memory or guesswork.

| Component | Reference File |
|-----------|----------------|
| Textbox | `.github/skills/jssp-imds-theme/reference/imds-html-textbox.md` |
| Textarea | `.github/skills/jssp-imds-theme/reference/imds-html-textarea.md` |
| Select | `.github/skills/jssp-imds-theme/reference/imds-html-select.md` |
| Checkbox | `.github/skills/jssp-imds-theme/reference/imds-html-checkbox.md` |
| Radio Button | `.github/skills/jssp-imds-theme/reference/imds-html-radio.md` |
| Button | `.github/skills/jssp-imds-theme/reference/imds-html-button.md` |
| Table | `.github/skills/jssp-imds-theme/reference/imds-html-table.md` |
| Dialog | `.github/skills/jssp-imds-theme/reference/imds-html-dialog.md` |
| Dialog + Form (new / edit, etc.) | `.github/skills/jssp-imds-theme/reference/imds-html-dialog-form.md` |
| Pagination | `.github/skills/jssp-imds-theme/reference/imds-html-pagination.md` |
| Field (with label) | `.github/skills/jssp-imds-theme/reference/imds-html-field.md` |
| Field Group | `.github/skills/jssp-imds-theme/reference/imds-html-field-group.md` |
| Tab | `.github/skills/jssp-imds-theme/reference/imds-html-tabs.md` |
| Accordion | `.github/skills/jssp-imds-theme/reference/imds-html-accordion.md` |
| Calendar Input | `.github/skills/jssp-imds-theme/reference/imui-html-calendar.md` |
| Banner Message | `.github/skills/jssp-imds-theme/reference/imds-html-banner-message.md` |
| Inline Message | `.github/skills/jssp-imds-theme/reference/imds-html-inline-message.md` |

Other components are stored under `.github/skills/jssp-imds-theme/reference/`.

---

### Step 4: Generate Function Container and Routing

Refer to `.github/instructions/jssp-function-container.instructions.md` and `.github/instructions/jssp-presentation-page.instructions.md` to generate code.

- Generate the function container (.js) under `src/main/jssp/src/{feature-name}/`
- Generate routing configuration (.xml) as needed
  - Each `file-mapping` **must explicitly specify** `<authz uri="service://{feature-name}/{action}" action="execute" />`. Skipping authorization via `welcome-all` / `<authz-default>` is **prohibited in principle**
  - The authorization resource (`service://...`) referenced here **must be defined with `jssp-tenant-setup-generator`** (policy / resource / resource-group / subject-group). If deployed without it, access to the target URL is always rejected with **403**
- Use secure tokens (refer to `reference/secure_token_check.md`)
- If `TODO` is written in the referenced files, implement according to those instructions

---

### Step 5: Generate Presentation Page (HTML)

Generate `.html` based on the assets and reference HTML snippets loaded in Steps 2 and 3.

**Prohibited:**
- Writing imds class names or structures from memory or guesswork without reading assets or references
- Using class names that do not exist in `jssp-imds-theme` references (e.g., `imds-selectbox` does not exist; correct is `imds-select`)
- Defining custom HTML/CSS structures instead of using imds components
- **Arbitrarily modifying the HTML structure of assets** (top-level form structure, nesting of `imds-field-container` / `imds-field-group` / `imds-field`, layout classes like `is-horizontal` / `imds-w-15`). Reuse the asset structure as-is; only replace label text, `id`, input type, and validation content
- **Layout changes based on personal design judgments** such as "vertical layout looks better" or "I want to simplify because there are many items" (e.g., changing `is-horizontal` to `is-vertical`, omitting `imds-field-container` / `imds-field-group`). If a structure different from the asset is required, **confirm with the user before generating**
- **Omitting JSDoc comments (`/** ... */`) or section delimiter comments (`// ===...===`) included in the asset.** Even if they appear verbose, the convention (`.github/instructions/jssp-function-container.instructions.md`) treats them as required. Keeping them clarifies the intent of each function inline, which makes subsequent reviews and modifications easier. Comments in assets must be copied as-is in principle. If changes are needed, only rewrite the content for the relevant feature; do not delete them.

**Required Rules:**
- Form elements with labels must use the `imds-field` + `imds-field-label` + `imds-field-control` structure
- Tables must use the double-wrapper structure: `imds-table` > `imds-table-inner` > `table`
- Button states (primary/outlined etc.) must use state classes from the reference; do not apply color via CSS
- The form body structure is assumed to **copy the asset snippet line by line**; do not simplify to a structure using `imds-field` alone. The standard pattern is to place `imds-field-group` directly under `imds-field-container has-accent-color`

---

### Step 6: Generate DDL (Only If a New Table Is Required)

Skip if the specification document states DDL is not needed. Otherwise, output the following under `src/main/storage/system/products/import/basic/{feature-name}/{version}/`.

**Why this location is fixed**: DDL and sample DML are designed to be **bulk-loaded by the tenant environment setup (Importer)**. Place them under this `storage/system` path regardless of whether you invoke `jssp-tenant-setup-generator` directly — they cannot be imported individually from the import screen. See the "Why DDL and Sample DML Belong Here" section in `jssp-tenant-setup-generator/SKILL.md` for the full rationale.

`{version}` is determined in the following order of priority:
1. Version explicitly specified by the user or in the specification document
2. The `<version>` tag in `module.xml` at the project root (or `src/main/jssp/module.xml`)
3. The `<version>` tag in `pom.xml` at the project root (excluding the version inside `<parent>`)
4. `1.0.0` if none of the above is found

| File | Content |
|------|---------|
| `src/main/storage/system/products/import/basic/{feature-name}/{version}/{feature-name}-ddl_postgre.sql` | CREATE TABLE statement (for PostgreSQL) |
| `src/main/storage/system/products/import/basic/{feature-name}/{version}/{feature-name}-ddl_oracle.sql` | CREATE TABLE statement (for Oracle) |
| `src/main/storage/system/products/import/basic/{feature-name}/{version}/{feature-name}-ddl_sqlserver.sql` | CREATE TABLE statement (for SQLServer) |
| `src/main/storage/system/products/import/basic/{feature-name}/{version}/{feature-name}_sample-dml.sql` | Sample record INSERT statements (shared across all DBs, **recommended**) |

In `import-<key>-config-1.xml`, the `<create-file>` / `<insert-file>` references are written **without the suffix** (e.g., `{feature-name}-ddl.sql` / `{feature-name}_sample-dml.sql`). The intra-mart Importer auto-appends `_postgre` / `_oracle` / `_sqlserver` to match the connected DB, and falls back to the suffix-less file if no dialect-specific file exists.

- **DDL: place 3 dialect-specific files** (type names and constraint syntax differ across DBs)
- **DML: consolidate into 1 file** (INSERT statements can usually be written in standard SQL and shared)

Split DML into `{feature-name}_sample-dml_postgre.sql` etc. only when dialect-specific syntax is required (e.g., PostgreSQL `ON CONFLICT`, Oracle `MERGE`).

For detailed DDL generation rules, refer to the "DDL Generation Rules Detail" section at the end of this file.

---

### Steps 7–10: Post-Generation Verification (Delegated to Sub-Agent)

Use the **Agent tool** to launch a sub-agent and delegate all verification and fixes to it.
To protect the main conversation context, let the sub-agent complete all verification work.

Content to include in the sub-agent prompt:
- Run the `jssp-page-verifier` skill
- Target path: `src/main/jssp/src/{feature-name}/`
- DDL path (only if DDL was generated): `src/main/storage/system/products/import/basic/{feature-name}/{version}/`
- Repeat fixes until error count reaches 0
- Return a result summary of each step upon completion

After the sub-agent completes, review the result summary and proceed to Step 11 if there are no issues.

---

### Step 11: Code Review and Security Check

After Steps 7–10 are complete, execute the following 2 skills **only if available**, in order.
Skip if a skill does not exist. Complete before reporting to the user.

1. Run `jssp-code-review` skill if available
2. Run `jssp-security-check` skill if available

**Report to the user after all of the above is complete.**

---

## DDL Generation Rules Detail

Follow these rules when generating DDL in Step 6:

- Table names and column names must match the SQL in the generated function container
- **Column types must follow the type mapping table in `reference/ddl-type-mapping.md`** (do not write type names from memory or guesswork)
- Separate DDL into files per database product (because type names and default value syntax differ)
- Sample DML must be written in standard SQL INSERT statements, usable across all 3 products
- Insert 3–5 sample records into master tables
