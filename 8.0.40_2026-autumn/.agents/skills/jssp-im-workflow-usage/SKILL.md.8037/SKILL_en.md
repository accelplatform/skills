---
name: jssp-im-workflow-usage
description: Generates new IM-Workflow integration programs. Provides implementation patterns for action processing (apply/approve/deny/return), case start/end processing, branching condition processing, application screens, approval screens, and confirmation screens. Use when mentioning workflow, application screen, approval screen, confirmation screen, action processing, case processing, branching conditions, approval flow. For job scheduler batch processing, use jssp-im-job-generator.
---

■■ Required Rules Checklist (Mandatory) ■■

Confirm the following before starting implementation. Do not proceed if any item is unchecked.

- [ ] [jssp-accessibility](../../../requirements/jssp-accessibility/AGENTS.md) has been read and understood
- [ ] [jssp-code-style](../../../requirements/jssp-code-style/AGENTS.md) has been read and understood
- [ ] [jssp-error-handling](../../../requirements/jssp-error-handling/AGENTS.md) has been read and understood
- [ ] [jssp-file-structure](../../../requirements/jssp-file-structure/AGENTS.md) has been read and understood
- [ ] [jssp-function-container](../../../requirements/jssp-function-container/AGENTS.md) has been read and understood
- [ ] [jssp-logging](../../../requirements/jssp-logging/AGENTS.md) has been read and understood
- [ ] [jssp-naming](../../../requirements/jssp-naming/AGENTS.md) has been read and understood
- [ ] [jssp-overview](../../../requirements/jssp-overview/AGENTS.md) has been read and understood
- [ ] [jssp-presentation-page](../../../requirements/jssp-presentation-page/AGENTS.md) has been read and understood
- [ ] [jssp-security](../../../requirements/jssp-security/AGENTS.md) has been read and understood


# IM-Workflow Program Generation Skill

## Purpose

A skill set for generating new IM-Workflow integration programs for intra-mart Accel Platform.
Explains the procedure for creating and organizing various workflow processing programs following templates and conventions.

## Conventions to Reference

This skill generates application/approval screens (`.html` + `.js`) and action processing (`.js`). See the "Convention File List (One-Line Summary + Scope Tag)" in `.agents/requirements/README.md` for the full picture. Convention-specific priorities for this skill:

| Convention | Handling |
|------------|----------|
| `jssp-presentation-page.md` | 🟢 **Required** — HTML structure, validation, id naming for the application/approval screens |
| `jssp-function-container.md` | 🟢 **Required** — `init()` structure, receiving workflowOpenPage parameters |
| `jssp-naming.md` / `jssp-code-style.md` / `jssp-file-structure.md` | 🟢 Required |
| `jssp-error-handling.md` / `jssp-security.md` | 🟢 Required |
| `jssp-2way-sql.md` | 🔴 **Not needed on the screen side** (the application / approval screens only submit via `workflowOpenPage` and have no DB access). Reference only when the action processing side uses `db.executeByTemplate` |
| `jssp-logging.md` | 🟡 Only when implementing logging in action processing |
| `jssp-accessibility.md` | 🟠 **Business-requirement-dependent** — apply thickly only when explicitly required by the spec; otherwise stay minimal (`imdsConfirm`, `aria-label`, `aria-hidden` on decorative icons, etc.) |

## Generation Targets and Templates

### Screens

| Generation Target | Template | Placement |
|------------------|----------|-----------|
| Application screen (apply + temporary save) — workflowOpenPage method (.html / .js) | `assets/simple-apply-screen.md` | `{feature}/workflow/apply/` |
| Application screen (apply + temporary save) — processing modal method ★recommended (.html / .js) | `assets/modal-apply-screen.md` | `{feature}/workflow/apply/` |
| Approval screen (processing screen) — workflowOpenPage method (.html / .js) | `assets/simple-approve-screen.md` | `{feature}/workflow/approve/` |
| Approval screen (processing screen) — processing modal method ★recommended (.html / .js) | `assets/modal-approve-screen.md` | `{feature}/workflow/approve/` |
| Confirmation screen — workflowOpenPage method (.html / .js) | `assets/simple-confirm-screen.md` | `{feature}/workflow/confirm/` |
| Confirmation screen — processing modal method ★recommended (.html / .js) | `assets/modal-confirm-screen.md` | `{feature}/workflow/confirm/` |

### Batch Processing

| Generation Target | Template | Placement |
|------------------|----------|-----------|
| Action processing (.js) | `assets/simple-action-process.md` | `{feature}/workflow/action/` |
| Arrival processing (.js) | `assets/simple-arrive-process.md` | `{feature}/workflow/arrive/` |
| Branching condition/merge processing (.js) | `assets/simple-rule-condition.md` | `{feature}/workflow/rule/` |
| Case start processing (.js) | `assets/simple-matter-start-process.md` | `{feature}/workflow/` |
| Case end processing (.js) | `assets/simple-matter-end-process.md` | `{feature}/workflow/` |

### Listeners / Plugins

| Generation Target | Template | Placement |
|------------------|----------|-----------|
| Processing target person plugin (.js) | `assets/simple-authority-exec-event-listener.md` | `{feature}/workflow/plugin/` |
| Incomplete case deletion listener (.js) | `assets/simple-actv-matter-delete-listener.md` | `{feature}/workflow/` |
| Completed case deletion listener (.js) | `assets/simple-cpl-matter-delete-listener.md` | `{feature}/workflow/` |
| Past case deletion listener (.js) | `assets/simple-arc-matter-delete-listener.md` | `{feature}/workflow/` |
| Case archiving listener (.js) | `assets/simple-matter-archive-listener.md` | `{feature}/workflow/` |

### References

- `reference/imart-tag-workflow-open-page.md` — workflowOpenPage tag reference
- `reference/api-im-workflow-modal.md` — Processing modal API (`imWorkflow.modal.showApply()`) reference
- `reference/api-im-workflow-modal-tempsave.md` — Processing modal API (`imWorkflow.modal.showTemporarySave()`) reference
- `reference/api-im-workflow-modal-process.md` — Processing modal API (`imWorkflow.modal.showProcess()`) reference
- `reference/api-im-workflow-modal-confirm.md` — Processing modal API (`imWorkflow.modal.showConfirm()`) reference
- `reference/api-user-actv-matter-property-value.md` — Case property value API reference
- `reference/screen-generation-checklist.md` — Self-check checklist for screen generation
- `.agents/skills/jssp-im-workflow-generator/reference/node-types.md` — Node types and authority plugin list (related skill)

## Choosing the Application Screen Method

When generating an application screen, **have the user choose the method first**. If you cannot decide between the two, recommend the "processing modal method".

### Comparison Table

| Aspect | workflowOpenPage method | Processing modal method (★recommended) |
|--------|-------------------------|----------------------------------------|
| Implementation simplicity | Somewhat complex (requires 11 `$imw*` variables) | Simple (no bind variables) |
| Routing XML | **Not needed** (called directly from the content definition) | **Needed** (create `routing-jssp-config/*.xml`) |
| Temporary save button | Placed on the same screen as apply (`workflowOpenPage('1')`) | Placed on the same screen as apply (`showTemporarySave()`) |
| Back button | Needed (works with the `imw-back-form` form) | Needed (use `imWorkflow.transition.returnTo()`) |
| Apply button handler | `workflowOpenPage('0')` call (synchronous) | `async/await imWorkflow.modal.showApply(...)` |
| Temporary save button handler | `workflowOpenPage('1')` call (synchronous) | `async/await imWorkflow.modal.showTemporarySave(...)` |
| Template | `assets/simple-apply-screen.md` | `assets/modal-apply-screen.md` |
| Reference | `reference/imart-tag-workflow-open-page.md` | `reference/api-im-workflow-modal.md` / `reference/api-im-workflow-modal-tempsave.md` |

### Why It Is Recommended

The processing modal method does not require bind variables (the 11 `$imw*` variables), so the code is simpler. The temporary save and back buttons are placed in both methods, but in the modal method temporary save can be implemented concisely with `showTemporarySave()` (which auto-numbers the userDataId internally) and back with `imWorkflow.transition.returnTo()`, making it easier to maintain (no need to write an `imw-back-form` form or manually number the userDataId as in the workflowOpenPage method). Because it becomes a standalone screen directly accessible from a URL, it also handles invocation from portals and links more easily.

### Example Confirmation Wording for the User

> Please choose the implementation method for the application screen.
>
> 1. **Processing modal method** (recommended) — Uses `imWorkflow.modal.showApply()`. No bind variables needed, so the code is simple. Temporary save and back can also be implemented concisely with `showTemporarySave()` / `transition.returnTo()`. Routing XML is needed.
> 2. **workflowOpenPage method** — Uses `<imart type="workflowOpenPage">`. A form called directly from the content definition. No routing XML needed.
>
> If you are unsure, the **processing modal method** is recommended.

### Choosing the Approval Screen / Confirmation Screen Method

Like the application screen, the approval screen (processing screen) and confirmation screen also have 2 methods: the **workflowOpenPage method (legacy)** and the **processing modal method (new, ★recommended)**. The reasoning for choosing a method is the same as for the application screen (the modal method needs no bind variables and the code is concise; routing XML is needed). Refer to the templates below.

| Screen | workflowOpenPage method (legacy) | Processing modal method (new, ★recommended) |
|--------|----------------------------------|---------------------------------------------|
| Approval screen (processing screen) | `assets/simple-approve-screen.md` (`workflowOpenPage('4')`) | `assets/modal-approve-screen.md` (`showProcess()`) |
| Confirmation screen | `assets/simple-confirm-screen.md` (`workflowOpenPage('5')`) | `assets/modal-confirm-screen.md` (`showConfirm()`) |

- **The confirmation screen and the detail screens (process detail / reference detail) are different things**: A detail screen is a read-only screen that ends with viewing information, whereas the confirmation screen performs a "confirm" operation (`workflowOpenPage('5')` / `showConfirm()`) just like a processing screen. Place a submit button for the confirm operation on the confirmation screen.
- **Restoring the application content**: The approval and confirmation screens target incomplete cases and do not receive `imwUserDataId`, so use `ActvMatter(systemMatterId).getMatterPropertyList()` (do not use `UserActvMatterPropertyValue(userDataId)`).

## When to Use

When the user makes requests such as:
- "Create workflow action processing"
- "Create an application screen"
- "Implement an approval screen"
- "Add case start processing"
- "Implement branching conditions"
- "Create arrival processing"
- "Implement a processing target person plugin"
- "Add a case deletion listener"

## Implementation Steps

1. Gather requirements from the user (processing type, feature name, business logic content)
   - **If an application screen is included**: Present the confirmation wording from the "Choosing the Application Screen Method" section above to the user, decide the method, then proceed with implementation
2. Reference the corresponding assets template and generate
3. Confirm file placement location (under `src/main/jssp/src/{feature}/workflow/`)

**Note (Routing XML):**
- **workflowOpenPage method**: Because the content definition specifies the JSSP path directly, a routing table (XML) is **not needed**.
- **Processing modal method**: Because it is a standalone screen accessed directly from a URL, a routing table (XML) is **needed**. Create the XML under `routing-jssp-config/` (a sample is provided in `assets/modal-apply-screen.md`).

### DDL Generation

When generating a workflow that requires new tables, output the following under `src/main/storage/system/products/import/basic/{feature}/{version}/` unless the spec says DDL is not needed.

**Why this location is fixed**: DDL and sample DML are designed to be **bulk-loaded by the tenant environment setup (Importer)**. Place them under this `storage/system` path regardless of whether you invoke `jssp-tenant-setup-generator` directly — they cannot be imported individually from the import screen. See the "Why DDL and Sample DML Belong Here" section in `jssp-tenant-setup-generator/SKILL.md` for the full rationale.

`{version}` is determined in the following order of priority:
1. Version explicitly specified by the user or in the specification document
2. The `<version>` tag in `module.xml` at the project root (or `src/main/jssp/module.xml`)
3. The `<version>` tag in `pom.xml` at the project root (excluding the version inside `<parent>`)
4. `1.0.0` if none of the above is found

| File | Content |
|------|---------|
| `src/main/storage/system/products/import/basic/{feature}/{version}/{feature}-ddl_postgre.sql` | CREATE TABLE statements (for PostgreSQL) |
| `src/main/storage/system/products/import/basic/{feature}/{version}/{feature}-ddl_oracle.sql` | CREATE TABLE statements (for Oracle) |
| `src/main/storage/system/products/import/basic/{feature}/{version}/{feature}-ddl_sqlserver.sql` | CREATE TABLE statements (for SQL Server) |
| `src/main/storage/system/products/import/basic/{feature}/{version}/{feature}_sample-dml.sql` | Sample INSERT statements (shared across all DBs, **recommended**) |

In `import-<key>-config-1.xml`, the `<create-file>` / `<insert-file>` references are written **without the suffix** (e.g., `{feature}-ddl.sql` / `{feature}_sample-dml.sql`). The intra-mart Importer auto-appends `_postgre` / `_oracle` / `_sqlserver` to match the connected DB, and falls back to the suffix-less file if no dialect-specific file exists.

- **DDL: place 3 dialect-specific files** (type names and constraint syntax differ across DBs)
- **DML: consolidate into 1 file** (INSERT statements can usually be written in standard SQL and shared)

Split DML into `{feature}_sample-dml_postgre.sql` etc. only when dialect-specific syntax is required (e.g., PostgreSQL `ON CONFLICT`, Oracle `MERGE`).

- Match table/column names with the SQL in action processing
- **Follow the type mapping table in `.agents/skills/jssp-page-generator/reference/ddl-type-mapping.md` for column types** (never write type names from memory or guesswork)
- Separate DDL files by DB product (type names and default value syntax differ)
- Write sample DML as standard SQL INSERT statements usable across all 3 products
- Insert 3–5 sample records for master tables (supplier masters, etc.)

### File Path Construction Rules

> **Note**: IM-Workflow screens are invoked directly by the workflow engine via the `scriptPath` in the XML, so they do not go through the routing table. This means they follow **a separate set of rules from `.agents/requirements/jssp-file-structure/AGENTS.md`'s `view/{view}.js` (snake_case file name unique per screen) convention** — the difference comes from a different invocation source. Follow the rules of this section (the exception is also documented on the `.agents/requirements/jssp-file-structure/AGENTS.md` side as "Exception Rules for Screens Not Called Through the Routing Table").

Always construct file placement paths according to the following rules:

- **Base path**: `src/main/jssp/src/`
- **Feature path**: `{feature}/workflow/` — derive feature name from user instruction or content definition screen path
- **Complete path**: `src/main/jssp/src/{feature}/workflow/{subdirectory}/`

Example: When feature name is `sample/wf_housing_assistance`
- Correct: `src/main/jssp/src/sample/wf_housing_assistance/workflow/apply/index.html`

### Screen File Naming Conventions

IM-Workflow screen files distinguish screen type by directory, with file names unified as **`index.js` / `index.html`**.
Avoid redundant naming like `apply/apply.js`.

```
# OK: Unified as {feature}/workflow/{screen-type}/index
leave/workflow/apply/index.js      + index.html
leave/workflow/approve/index.js    + index.html
leave/workflow/detail/index.js     + index.html

# NG: Omitting /workflow
leave/apply/index.js               + index.html

# NG: Redundant file name
leave/workflow/apply/apply.js      + apply.html
```

Specify the path up to the directory name in the content definition's scriptPath (e.g., `leave/workflow/apply/index`).

**Path priority:**
When the user explicitly specifies a placement path in the prompt, that instruction takes highest priority.
The skill's default convention (`{feature}/workflow/{screen-type}/index`) is only applied when no explicit instruction is given.

## Notes

- **Do not open DB transactions** in action processing, case start/end processing, or branching condition processing
- Since action processing, case processing, and branching condition processing are all function containers, follow coding conventions (`let` usage, naming rules, etc.). Refer to the reference under jssp-page-generator for details
- Customize templates as needed
- When `TODO` appears in a reference, implement according to its instructions
- **Do not place a "Back" button on detail screens (confirmation, processing detail, reference detail)**. Detail screens are displayed within an IM-Workflow engine iframe, and the previous page path does not exist, causing navigation to an empty page. Omit all back button HTML, JS event listeners, and back forms (`imw-back-form`).
- **Presentation pages (.html) must follow the coding conventions in `.agents/requirements/jssp-presentation-page/AGENTS.md`**. Validation implementation compliance is especially mandatory. After generation, perform a self-check using `reference/screen-generation-checklist.md`.
- **When a screen needs to let the user input an IM common master value (user / department / company / group / role), do not build a custom UI; combine with the `jssp-im-master-usage` skill to embed a master search dialog** (e.g., "Applicant's Manager", "Target Department", "Handler" fields). Manual code entry is prohibited.

## Post-Generation Mandatory Verification (Auto-Execute)

**After code generation is complete, execute the following verifications in order BEFORE reporting to the user.**
Perform this verification automatically without asking the user, and fix any issues before reporting.

### Step 1: Auto Validation Script

Run `validate-workflow-code.js` against the generated files. **Repeat corrections until there are 0 errors.**

```bash
node .agents/skills/jssp-im-workflow-usage/scripts/validate-workflow-code.js src/main/jssp/src/{feature}/
```

Common patterns detected:
- `db.select()` / `db.execute()` parameters not wrapped in `DbParameter`
- String passed to `DbParameter.number()` (missing `Number()` conversion)
- Invalid pageType in `workflowOpenPage` (other than `'0'`–`'5'`)
- `imds-selectbox` (non-existent class name; correct: `imds-select`)
- `imuiCalendar` altField referencing a hidden input
- Separate approve/return/deny buttons on approval screen
- imart tag value attribute enclosed in quotes

### Step 2: DDL Type Validation (When DDL Was Generated)

If DDL files were generated, run `validate-ddl.js`. **Repeat corrections until there are 0 errors.**

```bash
node .agents/skills/jssp-page-generator/scripts/validate-ddl.js src/main/storage/system/products/import/basic/{feature}/{version}/
```

### Step 3: Manual Check (`post-generation-verification.md`)

Execute all steps in `.agents/skills/jssp-page-generator/reference/post-generation-verification.md`.
Pay special attention to the following items where bugs have occurred in the past:
1. Are SQL files using `/*$param*/` (direct embedding)? → Use `/*param*/` (bind) instead
2. Are `executeByTemplate` parameters wrapped in `DbParameter.xxx()`?
3. Do API calls match the d.ts definitions (static vs instance, method names, arguments)?
4. Are intra-mart internal tables (tables starting with `im`) directly referenced in SQL? (Only permitted with explicit user instruction)
5. Are appropriate `max-width` values specified for select boxes and date inputs on screens?

### Step 4: Re-Check Screen HTML for imds Compliance (Only When HTML Was Generated)

**Always execute this step when `.html` files were generated** (apply / approve / detail / confirm screens, etc.). While `validate-workflow-code.js` detects known invalid class names like `imds-selectbox`, **it does not cover a complete cross-check against the reference**. Open `.agents/skills/jssp-imds-theme/reference/` and visually re-verify.

#### Procedure

1. Scan each generated `.html` and enumerate the imds components in use (textbox, textarea, select, checkbox, radio, button, table, dialog, field, tab, calendar input, banner / inline message, etc.)
2. For each component, **open `.agents/skills/jssp-imds-theme/reference/imds-html-{component}.md` with the Read tool** to re-verify (do not rely on memory)
3. Cross-check the reference's class names, tag structure, and attributes against the generated HTML

#### Key Check Items

| Aspect | Verification Point | Action on Mismatch |
|--------|--------------------|--------------------|
| Class name existence | Are non-existent classes like `imds-selectbox` / `imds-input` used? | Replace with the correct names from the reference (`imds-select` / `imds-textbox`, etc.) |
| Field hierarchy | Is the nesting `imds-field-container has-accent-color` > `imds-field-group is-horizontal imds-w-15` > `imds-field-group-label` / `imds-field-group-control` > `imds-field` preserved (matching the assets `simple-apply-screen.md` / `simple-approve-screen.md` line-for-line)? | Re-copy the structure from the asset line by line. Do not simplify to standalone `imds-field` |
| Required labels | Do required fields have `<span class="imds-required-label-required" data-required-label="必須">`? | Add it. Both the `imds-required-label-required` class **and** the `data-required-label` attribute are required |
| Error display | Does `imds-field` have the `for=":fieldName:"` attribute, and is `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>` placed immediately inside? | Place per the convention. Do not forget the initial `display:none` |
| Tables | Is the double wrapper `imds-table` > `imds-table-inner` > `table` used? | Add the missing wrappers |
| Button state | Are state classes like `is-primary` / `is-outlined` / `is-ghost` / `is-danger` / `is-small` / `is-large` used (no custom CSS for color)? | Replace with the state classes |
| Dialog | Is `<dialog class="imds-dialog">` + `imds-dialog-header` / `imds-dialog-body` / `imds-dialog-footer` structure used, opened/closed with `showModal()` / `close()`? | Fix per reference `imds-html-dialog.md` / `imds-html-dialog-form.md` |
| Icon buttons | Is text wrapped in `<span class="imds-button-text">` for buttons with both text and icon, and are icon-only buttons in normal size? | Follow `imds-html-icon-button.md` |
| imuiCalendar | Is `floatable="true"` specified, and does `altField` reference a non-hidden input? | Fix per `imui-html-calendar.md` |
| Banner / inline | Is custom CSS used for warning colors? (Should use `imds-banner-message` / `imds-inline-message`) | Replace with the corresponding state class (`is-warning`, etc.) |
| Asset alterations | Has the HTML structure from the assets (`simple-apply-screen.md` / `simple-approve-screen.md`) been **altered by independent judgment** (`is-horizontal` → `is-vertical`, etc.)? | Revert to the asset structure. If a change is needed, confirm with the user beforehand |

#### Additional Checks Related to `<imart type="workflowOpenPage">` (workflowOpenPage Method Only)

> **You may skip this section for the processing modal method.**

- The `<imart type="workflowOpenPage">` tag must **not** have an `id` attribute (only `name`)
- Input fields inside the form must **not** have a `name` attribute (only hidden fields have `name`)
- Radio buttons must use different `name` values for the input group and the hidden field

#### Checks Specific to the Processing Modal Method (Processing Modal Method Only)

> **You may skip this section for the workflowOpenPage method.**

- Is `<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>` written in `<head>`? (the `name="im_secure_token"` form does not work)
- Is `<script src="im_workflow/js/api_base.js" defer></script>` written in `<head>`? (`defer` is required)
- Is the apply button's event listener an `async` function? (required for `await imWorkflow.modal.showApply(...)`)
- Are there no leftover pageType calls such as `workflowOpenPage('0')`? (not used in the processing modal method)
- Are there no leftover `$imw*` bind variables such as `$imwFlowId` / `$imwMatterName`? (not needed in the processing modal method)
- Have the temporary save button and back button been removed? (not needed in the processing modal method)
- Has the routing XML (`routing-jssp-config/*.xml`) been created?
- Is the actual flow ID set in `flowId`, or is a TODO comment left? (confirm it is the correct value, not a placeholder)
- For the temporary save / processing (approve/deny) / confirmation screens, is `imWorkflow.transition.afterProcess()` called after `then()` or `await`? (it must be called on both completion and cancellation)

#### When a Mismatch Is Found

Treat the reference as authoritative and **modify the generated HTML**. After fixing, restart from Step 1 (`validate-workflow-code.js`) and proceed to the next step only after everything PASSes.

### Step 5: Code Review and Security Check (Auto-Execute)

After Steps 1–4 are complete, execute the following 2 skills **only if available**, in order.
Skip if a skill does not exist. Complete before reporting to the user.

1. Run `jssp-code-review` skill if available
2. Run `jssp-security-check` skill if available

#### Handling JSSP-JS-022 Warnings

If the auto validation script (Step 1) produces a warning like:

```
WARN [JSSP-JS-022] xxx.js:NN  possibility of passing null
```

**Open the corresponding SQL file and confirm whether the parameter is wrapped in `/*IF param != null*/.../*END*/`.**

- Wrapped → No problem (false positive). Note "SQL-side /*IF*/ guard confirmed" in the review report.
- Not wrapped → Fix to an empty string fallback such as `DbParameter.string(x || '')`.

## Boundary and Consistency Responsibilities With Other Skills

The file placement produced by this skill must **exactly match** the `<scriptPath>` values (or the `screens` in spec.json) produced by `jssp-im-workflow-generator`. Responsibility split:

| Responsibility | Owning Skill |
|---|---|
| Decide screen paths via `screens` in spec.json | `jssp-im-workflow-generator` |
| Output `<scriptPath>` inside the XML | `jssp-im-workflow-generator` |
| Place the actual `.js` / `.html` files | **This skill (usage)** |
| Verify path consistency | `WF-XML-001` in `scripts/validate-workflow-code.js` |

### pageType ↔ this skill's convention directory mapping

The defaults of `jssp-im-workflow-generator` are aligned with the convention directories used by this skill, so **for new projects, `screens` may be omitted in spec.json**.

| pageType | Key | Placement in this skill | Purpose |
|---|---|---|---|
| 0 | `apply` | `{feature}/workflow/apply/` | Application screen |
| 1 | `tempSave` | **`{feature}/workflow/apply/` (shares the apply screen)** | Temporary save screen (the apply screen also serves temp save) |
| 2 | `applyTask` | `{feature}/workflow/apply_task/` (or shares apply) | Application (issued case) screen |
| 3 | `reapply` | `{feature}/workflow/reapply/` (or shared with apply) | Re-application screen |
| 4 | `process` | **`{feature}/workflow/approve/`** | **Processing screen (approve / send back / reject)** |
| 5 | `confirm` | `{feature}/workflow/confirm/` | Confirmation screen |
| 6 | `processDetail` | `{feature}/workflow/process_detail/` (or `detail`) | Process detail screen |
| 7 | `referDetail` | `{feature}/workflow/refer_detail/` (or shared with detail) | Reference detail screen |

**Note on `pageType=4`:** The generator default suffix is `approve/index` (aligned with this project's business convention "approval screen", not the official IM-Workflow term "process"). This skill's template [`assets/simple-approve-screen.md`](assets/simple-approve-screen.md) also follows this convention.

### Recommended Generation Order

1. Create spec.json with `jssp-im-workflow-generator` and generate the XML (screen paths are decided first).
2. Use this skill to generate each screen file referenced by the XML.
3. Run `validate-workflow-code.js` and confirm no `WF-XML-001` warnings (if any appear, distinguish intentional omission from forgotten generation).

For the detailed mapping table and screen-sharing patterns, see the "Boundary and Consistency Responsibilities With Other Skills" section in the `jssp-im-workflow-generator` skill's SKILL.md.
