---
name: jssp-imds-theme
description: Generates HTML components for presentation pages compliant with the intra-mart Design System (imds). Use whenever working with UI parts such as tables, buttons, forms, dialogs, checkboxes, radio buttons, selects, textboxes, tabs, accordions, pagination, etc. Never write imds class names from memory or guesswork — always refer to the references in this skill. Use when mentioning writing HTML, creating screen layouts, or placing UI components.
---

# imds-Compliant HTML Code Generation Skill

## Overview

A skill set for creating the HTML tag portions of presentation pages that comply with the intra-mart Design System.

## How to Use

When generating HTML, proceed with the following steps:

1. **Check the page-wide template first** (for list screens: `assets/imds-list-page.md`; for form screens: `assets/imds-form-page.md`)
   - The placement of `<header class="imds-header">` and its relationship with `<main>` is only explained here
2. Identify the UI components needed from the user's requirements
3. Load the corresponding file(s) under `reference/` for the relevant component(s)
4. Implement based on the HTML snippets in the reference
5. Add size or style classes as needed
6. Run structural validation with `validate-imds.js` on the generated file (described below)
7. Fix any errors and repeat until PASS

## Important Notes for HTML Generation

### Mandatory Reference Lookup

Before generating any HTML component, always load the corresponding reference file.
Never use class names from memory or guesswork — use the exact HTML snippets documented in the reference.

### Start from the "Page-Wide Template" (Mandatory assets Lookup)

The files under `reference/` are only HTML snippets for individual components, and **do not describe how to assemble a full page**.
In particular, mandatory information related to page structure — such as the placement of the header (`<header class="imds-header">`) — is found only in templates under `assets/`.

| Purpose | assets to refer to |
|------|------------------|
| List screen (list + action buttons) | `assets/imds-list-page.md` |
| Input form screen (CRUD) | `assets/imds-form-page.md` |

When generating a new screen, first read one of these two files, use the page skeleton as a base, and then refer to the individual component references.

### Icons in `<header class="imds-header">` Are Required

Inside `<header class="imds-header">`, placing only `imds-header-title` is **not allowed**.
**Always place at least one of the icon area (`imds-header-icon` or `imds-header-nav` — these two are mutually exclusive and must not be placed together) or `imds-header-back-button` at the beginning.**
`imds-header-back-button` **can be combined** with `imds-header-icon` / `imds-header-nav` — it is not a replacement for the icon. On screens that need "back" navigation (detail/edit screens, etc.), the default is to place the back-button **while keeping the icon area** rather than removing it (see "backItemExists" in `reference/imds-html-header.md` for details).

| Purpose | Element to place | Icon examples |
|------|------------|------------|
| General page (list, register, edit) | `imds-header-icon` + Font Awesome | Icon matching the purpose (`fa-clipboard-list` / `fa-warehouse` / `fa-box` / `fa-location-dot` / `fa-chart-column` / `fa-gear`, etc.) |
| Detail/edit screens that need a "back" navigation | `imds-header-back-button` + `imds-header-icon` (**combined**; the back-button is not a substitute for the icon) | Icon matching the purpose |
| Screens that need a related-screen-switching menu | `imds-header-nav` (combined with Popover) | (used instead, since it is exclusive with `imds-header-icon`) |

```html
<!-- Standard pattern -->
<header class="imds-header">
  <div class="imds-header-icon">                       <!-- * Required -->
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="fa-solid fa-XXX"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>     <!-- * Subtitle (required) -->
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>     <!-- * Title (required) -->
  </div>
</header>

<!-- Screens that need "back" navigation (combine back-button + icon; do not drop the icon just because a back-button is present) -->
<header class="imds-header">
  <div class="imds-header-back-button">
    <button type="button" class="imds-button is-ghost is-large">
      <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
    </button>
  </div>
  <div class="imds-header-icon">                       <!-- * Keep this even when a back-button is present -->
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="fa-solid fa-XXX"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

### The Two-Tier Title + Subtitle Structure of `imds-header-title` Is Required

The contents of `imds-header-title` must be **a two-tier structure of `<p>Subtitle</p>` + `<h1>Title</h1>`**.
Do not write the screen name directly in `<h1>` alone (it fails to meet the imds theme header design and looks elongated).

- Subtitle: A short string representing the higher-level context such as application/module name (e.g., "In-house Equipment Rental System", "Equipment Master")
- Title: The screen name (e.g., "Approval List", "Storage Location Management")
- Both should be bound via `let $title = '...'` / `let $subTitle = '...'` in the function container, and output in HTML using `<imart type="string" value=$title escapeXml="true" escapeJs="false"></imart>` (do not write them inline)
- When referencing `<h1>` via `aria-labelledby="page-title"` (e.g., on detail/edit screens), keep the id as `<h1 id="page-title">`

### Placement of `<header class="imds-header">` (Important)

`<header class="imds-header">` must be placed **outside `<main>`**, **directly under** `<div class="imds-container">`. The imds theme CSS assumes this position when applying styles, so placing it inside `<main>` breaks the layout (icons disappear, etc.).

**Consolidate the root into a single `<div>` — do not add an extra wrapper.** Per the `jssp-presentation-page.md` convention, the platform's theme feature automatically wraps the screen content in `<div id="imui-container">`, so the presentation page's root tag must carry only the `imds-container` class, with no `id`. There is no need to nest another `<div>` around the one that carries `imds-container`.

```html
<!-- OK: give the root div the imds-container class directly, with header/main as its direct children -->
<div class="imds-container">
  <header class="imds-header">...</header>   <!-- Outside main -->
  <main>
    ...
  </main>
</div>

<!-- NG: header placed inside main -->
<div class="imds-container">
  <main>
    <header class="imds-header">...</header> <!-- CSS does not apply inside main -->
    ...
  </main>
</div>

<!-- NG: the imds-container div is nested inside another div (unnecessary intermediate wrapper) -->
<div>
  <div class="imds-container">
    <header class="imds-header">...</header>
    <main>...</main>
  </div>
</div>
```

Note: The rule "do not add `<header>` to presentation pages" in `jssp-accessibility.md` is intended **to avoid duplication with the platform's global `<header>`**, and the imds `<header class="imds-header">` (in-page header) is exempt from this rule.

### Do Not Place Business Data Action Buttons in `imds-header-actions`

You **must not place data-action buttons such as "New", "Add", or "Register" on the right side of `<header class="imds-header">` (`imds-header-actions`)** (UI team design rule).
The header is primarily for showing the page title — it is not a place to line up business actions. Data-action buttons should be placed **right above the list table, right-aligned**.

```html
<!-- ❌ NG: Placing a "New" button in the header's imds-header-actions -->
<header class="imds-header">
  <div class="imds-header-icon">...</div>
  <div class="imds-header-title">...</div>
  <div class="imds-header-actions">
    <button type="button" class="imds-button is-primary" id="add-button">
      <span class="imds-button-text">New</span>
    </button>
  </div>
</header>

<!-- ✅ OK: Place it on the right side, directly above the list table -->
<section class="imds-py-3 imds-px-4" aria-label="XX list">
  <div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
    <button type="button" class="imds-button is-primary" id="add-button">
      <span class="imds-icon"><i class="fa-solid fa-plus"></i></span>
      <span class="imds-button-text">New</span>
    </button>
  </div>
  <div class="imds-table ...">...</div>
</section>
```

| OK to place on the right of the header (`imds-header-actions`) | Place above the list table (do not put in the header) |
|---|---|
| Page-wide meta operations (e.g. "Settings", "Export", "Configure logging targets" — operations that do not add/remove the list's own data) | "New", "Add", "Bulk Import" — actions that add, remove, or edit the list's business data |

When pairing with a search field, follow the "operation area" pattern in `assets/imds-list-page.md` (search field + new-creation button laid out horizontally inside `pgstyle-toolbar`).

### Do Not Use Imaginary Classes (Especially `imds-page-header` Family)

Do not write your own `imds-*` class names that are not in the reference. CSS will not apply, and the screen will break.
Common error patterns:

| Wrong (imaginary class) | Correct (in reference) |
|---|---|
| `imds-page-header` | `imds-header` |
| `imds-page-header-title` | `imds-header-title` |
| `imds-page-header-actions` | `imds-header-actions` |
| `imds-section-title` | Use a plain element such as `<h2>` instead |
| `imds-dialog-body` | `imds-dialog-content` |
| `imds-dialog-overlay` | `imds-dialog-wrapper` |
| `imds-required-mark` (span) | Apply `imds-required-label-required` class to a `<span>`/`<label>` |
| `imds-inline-message is-error` (for field error display) | `<span class="imds-error-text">` |

If unsure, run `validate-imds.js` and check whether a `IMDS-U-001` warning is raised (see below).

### Form Implementation Pattern (Mandatory Reference: `assets/simple-form.md`)

When implementing input forms, always follow the canonical pattern in `.claude/skills/jssp-page-generator/assets/simple-form.md`.
Placing individual `imds-field` items in a flat list is incorrect. The standard is the nested structure: **`imds-field-container > imds-field-group > imds-field-group-label + imds-field-group-control > imds-field`**.

```html
<div class="imds-field-container has-accent-color">
  <!-- 1 input item = 1 imds-field-group -->
  <div class="imds-field-group is-horizontal imds-w-15">
    <!-- Label section (required/optional marks are also added here) -->
    <div class="imds-field-group-label">
      <span class="imds-required-label-required" data-required-label="Required">User Code</span>
    </div>
    <!-- Input section -->
    <div class="imds-field-group-control">
      <div class="imds-field" for=":userCode:">
        <div class="imds-field-control">
          <input type="text" id=":userCode:" class="imds-textbox" name="userCode" />
        </div>
        <!-- Error message goes directly under imds-field (outside imds-field-control) -->
        <span class="imds-error-text" for=":userCode:" id="error-userCode" style="display:none;"></span>
      </div>
    </div>
  </div>
</div>
```

Key points:

| Item | Correct usage |
|------|------------|
| Label element | `imds-field-group-label > <span>` (do not use `label` element; use the inner `imds-field-label > <label>` only when grouping multiple inputs into one group) |
| Required mark | `<span class="imds-required-label-required" data-required-label="Required">Item Name</span>` |
| Optional mark | `<span class="imds-required-label-optional" data-required-label="Optional">Item Name</span>` |
| Asterisk version | `<span class="imds-required-label-required-asterisk">Item Name</span>` (shows `*` instead of text) |
| Label width | Apply `is-horizontal imds-w-15` etc. to `imds-field-group` itself (`imds-w-N` values in the reference are `15` / `25` / `30` / `150px` / `250px`) |
| Error display element | `<span class="imds-error-text" for=":xxx:" id="error-xxx" style="display:none;"></span>` directly under `imds-field` |
| Error display control | Toggle with JS via `el.style.display = ''`/`'none'`; toggle `imds-validation-error` class on `imds-field` |

⚠️ **Anti-patterns (do not do this)**:
- Applying a width class to `imds-field-label` like `<div class="imds-field-label imds-w-NN">` (width should be applied to `imds-field` or `imds-field-group`)
- Writing an asterisk in a plain span like `<span class="imds-required-mark">*</span>` (CSS will not apply)
- Repurposing `<div class="imds-inline-message is-error" hidden>` for field error display (`imds-inline-message` is for info messages)

### Do Not Delete the `imdsConfirm` Function Definition

The custom `function imdsConfirm(...) { ... }` definition inside `<script>` on each presentation page **is not provided automatically by the platform's common processing**, so it must not be deleted. If you decide during refactoring that "this looks redundant and can be removed", the confirmation dialog on that page will stop working.

- Each page must keep its own copy of this function
- The body of the function must strictly match the code in `reference/imds-csjs-confirm.md`

### Dialog Root Element Is `<dialog>`; `<div>` Is the Sub-Option

When implementing a dialog, use **HTML5 native `<dialog class="imds-dialog-wrapper">` as the base**. A `<div>` root is treated as a variation (non-modal / special use cases). Reasons:

- With `<dialog>` + `showModal()`, you automatically get: background interaction blocked, `::backdrop`, ESC close, and focus trap
- With a `<div>` root, you have to implement these yourself, and missing pieces become bug sources
- See `reference/imds-html-dialog.md` for details
- For the composite pattern that places an input form inside a dialog (new / edit dialogs, etc.), see `reference/imds-html-dialog-form.md`

### Padding Inside Dialog Content

The `imds-dialog-content` inside `<dialog class="imds-dialog-wrapper">` has **no padding by default**.
Placing content (forms, buttons, etc.) directly inside makes it stick to the edge and look bad. Always **wrap the inside with `<div class="imds-p-4">`**.

```html
<div class="imds-dialog-content imds-scrollbar">
  <div class="imds-p-4">           <!-- 1rem padding on all sides. Without this, content touches the edge -->
    <form>...</form>
    <div>... button area ...</div>
  </div>
</div>
```

Padding adjustment: `imds-p-2` (narrow) / `imds-p-4` (standard) / `imds-p-6` (wide).

### Using imds-field

When creating form elements with labels, use the `imds-field` structure.

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label for="element-id">Label Name</label>
  </div>
  <div class="imds-field-control">
    <!-- Place input elements here -->
  </div>
</div>
```

### Accurate Use of Size Classes

Each component has unified size classes. Use size classes actively when you want to specify sizes.
Custom CSS definitions should be a last resort.

### Understanding State Classes

Each component has state classes based on purpose. Use state classes based on what action is being performed, not for color purposes.
For example, do not use `is-danger` just to make something red, and do not apply color via CSS.

### Table Structure Notes

Tables must always be implemented with the double-structure of `imds-table` and `imds-table-inner`.

```html
<div class="imds-table" style="width: 100%; height: 100%; max-height: 250px;">
  <div class="imds-table-inner">
    <table>
      <!-- Table content -->
    </table>
  </div>
</div>
```

## Post-Generation Structural Validation (Required)

After generating or editing HTML, always run the imds structural validation with the following command.

```bash
node .claude/skills/jssp-imds-theme/scripts/validate-imds.js <target file or directory>
```

### Validation Rules

`validate-imds.js` validates the parent-child relationships of the following components.

| Component | Key Checks |
|---|---|
| Table | 3-layer structure: `div.imds-table > div.imds-table-inner > table` |
| Field | Direct parent-child: `div.imds-field > div.imds-field-label` / `div.imds-field-control` |
| FieldGroup | Direct parent-child: `div.imds-field-group > div.imds-field-group-label` / `div.imds-field-group-control` |
| Dialog | Nesting: `div.imds-dialog-wrapper > div.imds-dialog > div.imds-dialog-header` etc. |
| Header | Direct parent-child: `header.imds-header > div.imds-header-title` etc. |
| Button | Parent of `span.imds-button-text` must be `button.imds-button`; `imds-button` is limited to `button` elements |
| Tabs | `li.imds-tabs-tab` must be a descendant of `div.imds-tabs`; `imds-tabs-tab` is limited to `li` elements |
| Pagination | Structure: `nav.imds-pagination > div.imds-pagination-controls > div.imds-pagination-page-number` |
| Accordion | Nesting: `div.imds-accordion > label.imds-accordion-title > span.imds-accordion-title-inner` etc. |
| CheckboxGroup | Direct parent-child: `div.imds-checkbox-group > label.imds-checkbox` (only within the group) |
| RadioGroup | Direct parent-child: `div.imds-radio-group > label.imds-radio` (only within the group) |
| FileUpload | Structure: `div.imds-file-upload > div.imds-file-upload-drop-area > p.imds-file-upload-message` |
| Menu | `nav.imds-menu > ul.imds-menu-list`; `imds-menu` is limited to `nav` elements |
| Popover | 3-layer structure: `div.imds-popover > div.imds-popover-menu > div.imds-popover-content` |
| ProgressBar | 3-layer structure: `div.imds-progress-bar > div.imds-progress-bar-track > div.imds-progress-bar-fill` |
| Stepper | 3-layer structure: `div.imds-stepper > ul > li.imds-stepper-step` |
| TextboxControl | Direct parent-child: `div.imds-textbox-control > input.imds-textbox` (only within the control) |
| Tag | `imds-tag` is limited to `span` elements |
| Textarea | `imds-textarea` is limited to `textarea` elements (do not confuse with textbox) |
| Element type | `imds-select`=`select`, `imds-textbox`=`input`, `imds-textarea`=`textarea`, `imds-checkbox`/`imds-radio`=`label`, plus the element type for each component's base class |
| Undefined class detection | Classes with `imds-*` prefix that are not in `reference/` or `.claude/rules/` are reported as `IMDS-U-001` (warning). Helps catch typos or imaginary classes (e.g., `imds-page-header`) |

### Handling Validation Results

- `PASS` → Done as-is
- `ERROR` → Fix the HTML structure at the indicated line and repeat validation until PASS
- `WARN [IMDS-U-001]` → A `imds-*` class not in the reference is being used. Likely a typo or imaginary class. Check the reference and correct the class name. If you intentionally define your own, confirm the corresponding CSS is applied and consider documenting it in a rules file

## Implementation Workflow Examples

### Creating a Login Form

1. Load `textbox.md` to get the HTML for the user ID input field
2. Get the HTML for the password input field from `textbox.md` (change to `type="password"`)
3. Load `button.md` to get the login button (`is-primary`)
4. Place each element with appropriate labels using `imds-field`
5. Run `node .claude/skills/jssp-imds-theme/scripts/validate-imds.js <generated file>` and confirm PASS

### Creating a Data List Screen

1. Load `table.md` to get the basic table structure
2. Load `button.md` to place the new registration button (`is-primary`) and edit button (`is-outlined`)
3. Load `imds-html-dialog.md` as needed to implement a confirmation dialog (use `imds-html-dialog-form.md` for dialogs containing an input form)
4. Run `node .claude/skills/jssp-imds-theme/scripts/validate-imds.js <generated file>` and confirm PASS

## Troubleshooting

### If CSS Classes Are Not Working Correctly

- Recheck the CSS class table in the reference file
- Check for typos (especially the `imds-` prefix)
- Verify that combinable classes are being used correctly

### If an HTML Snippet Cannot Be Found

- Reload the reference file
- Customize appropriately from a similar snippet
- Combine multiple references to implement
