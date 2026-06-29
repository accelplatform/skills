---
paths:
  - "src/main/jssp/**/*.html"
---

# Dialog + Form (Input Form Inside a Dialog)

## Overview

A composite pattern that combines a Form (input form) inside a Dialog (popup window).
Used for modal input such as creating new entries, editing, or duplicating.

- For details on individual components, see:
  - Dialog body: [imds-html-dialog.md](imds-html-dialog.md)
  - Form elements: [imds-html-field.md](imds-html-field.md) / [imds-html-field-group.md](imds-html-field-group.md)
  - Input parts: [imds-html-textbox.md](imds-html-textbox.md) / [imds-html-textbox-control.md](imds-html-textbox-control.md) / [imds-html-button.md](imds-html-button.md)
- Base classes: `imds-dialog` + `imds-form`

## Overall Structure

```
imds-dialog-wrapper                      # Size-control wrapper
└── imds-dialog                          # Dialog body
    ├── imds-dialog-header               # Header (title + close button)
    ├── imds-dialog-content (+ scrollbar)# Content area (scrolls on vertical overflow)
    │   └── imds-px-4 imds-py-3          # Inner padding wrapper (keeps form away from edges)
    │       └── form.imds-form
    │           └── imds-field-container # Wraps all fields together
    │               ├── imds-field        # Each input item
    │               ├── imds-field-group  # Composite input (e.g., multilingual input)
    │               └── ...
    └── imds-dialog-footer               # Footer (action buttons)
        └── imds-p-4                     # Inner padding wrapper
            ├── button (Cancel)
            └── button.is-primary (Register / Update etc.)
```

## CSS Classes Reference (Specific to This Pattern)

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-dialog-footer | div element (at the end of `imds-dialog`) | Footer area (for action buttons) | Required (recommended for form use) |
| imds-form | form element | Apply form styling | Required |
| imds-field-container | div element | Groups multiple fields | Required |
| imds-px-4 imds-py-3 | Inner content wrapper div | Horizontal/vertical inner padding | Effectively required (`imds-p-4` is also acceptable) |

See the individual reference files for other classes.

## HTML Snippets

### Basic: Create Dialog (`<dialog>` Root / Recommended)

```html
<dialog
  id="category-create-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="category-create-dialog-title"
  style="height: 450px; width: 600px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="category-create-dialog-title" title="Create New Category">Create New Category</h1>
        </div>
      </div>
      <button
        type="button"
        class="imds-button is-ghost is-small imds-dialog-header-close"
        aria-label="Close">
        <span class="imds-icon"><i class="fa-solid fa-times"></i></span>
      </button>
    </div>
    <div class="imds-dialog-content imds-scrollbar">
      <div class="imds-px-4 imds-py-3">
        <form class="imds-form">
          <div class="imds-field-container">
            <!-- Place each imds-field / imds-field-group here -->
          </div>
        </form>
      </div>
    </div>
    <div class="imds-dialog-footer">
      <div
        class="imds-p-4"
        style="display:flex; gap:0 1em; justify-content: flex-end">
        <button type="button" class="imds-button" style="width: 8em">Cancel</button>
        <button type="submit" class="imds-button is-primary" style="width: 8em">Register</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// Open
document.getElementById('category-create-dialog').showModal();

// Close
document.getElementById('category-create-dialog').close();
```

The sections below show only the differences (field variations / variants) from the basic pattern.

## Field Placement Patterns

Variations of input items placed inside `imds-field-container`.

### 1. Required Text Input (Asterisk Display)

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      for="categoryId"
      class="imds-required-label-required-asterisk has-text-weight-bold">
      Category ID
    </label>
  </div>
  <div class="imds-field-control">
    <input type="text" id="categoryId" class="imds-textbox" />
  </div>
</div>
```

### 2. Multilingual Input (field-group + Language Switch Button)

A composite input of "standard-language input field + globe icon button that opens an other-languages dialog".
Wrap the outside with a decorative `<div>` that has a border, and put `imds-field-group` inside.

```html
<div class="imds-field-group">
  <div class="imds-field-group-label">
    <label for="categoryNameStd" class="has-text-weight-bold">Category Name</label>
  </div>
  <div style="border:1px solid #d6d6d6; border-radius:4px; padding: 1em;">
    <div class="imds-field-group">
      <div class="imds-field-group-control">
        <div class="imds-field">
          <div class="imds-field-label">
            <label for="categoryNameStd" class="imds-required-label-required-asterisk">Standard</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id="categoryNameStd" class="imds-textbox" value="" />
            <button type="button" class="imds-button" aria-label="Open multilingual input">
              <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### 3. Numeric Input (min/max + Width Limit)

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      for="sortNumber"
      class="imds-required-label-required-asterisk has-text-weight-bold">
      Sort Number
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="number"
      id="sortNumber"
      min="0"
      max="99999"
      class="imds-textbox"
      style="max-width: 10em" />
  </div>
</div>
```

### 4. Popup Selection (readonly Text + Search Icon + Clear Button)

An item whose value is set from another selection dialog. Make the `input` `readonly` to prevent direct editing, invoke the popup with the search icon, and clear the selection with the `×` button.

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label class="has-text-weight-bold">Parent Category</label>
  </div>
  <div class="imds-field-control">
    <div class="imds-field">
      <div class="imds-field-control">
        <div class="imds-textbox-control">
          <input
            type="text"
            id="parentCategoryName"
            readonly="readonly"
            placeholder="Select a category"
            class="imds-textbox" />
          <span class="imds-icon is-small">
            <i class="fa-solid fa-magnifying-glass"></i>
          </span>
        </div>
        <button
          type="button"
          title="Clear"
          class="imds-button is-ghost"
          aria-label="Clear parent category">
          <span class="imds-icon">
            <i class="fa-regular fa-xmark-circle"></i>
          </span>
        </button>
      </div>
    </div>
  </div>
</div>
```

## Variations

### Edit Dialog

Only the title and button label change; the structure is the same as the create dialog.

```html
<div class="imds-dialog-title">
  <h1 title="Edit Category">Edit Category</h1>
</div>
<!-- ... -->
<button type="submit" class="imds-button is-primary" style="width: 8em">Update</button>
```

### Distinguishing from a Delete-Confirmation Dialog

- **Involves input** (create / edit / duplicate, etc.) → This pattern (dialog + form)
- **Confirmation only** (delete / discard) → Use `imdsConfirm` in [imds-csjs-confirm.md](imds-csjs-confirm.md)

### Size Adjustment

Change the dialog size via the `style` of `imds-dialog-wrapper`.

```html
<!-- Smaller -->
<dialog class="imds-dialog-wrapper" style="height: 320px; width: 480px;">

<!-- Larger (many input items stacked vertically) -->
<dialog class="imds-dialog-wrapper" style="height: 600px; width: 720px;">
```

Even as input items grow, keep the dialog itself at a fixed size and let `imds-dialog-content imds-scrollbar` scroll vertically.

## Implementation Notes

- **Use `<dialog>` as the root element by default**. With a `<div>` root, you have to implement modal behavior, ESC close, and focus trap yourself, and missing pieces become bug sources (see [imds-html-dialog.md](imds-html-dialog.md) for details)
- **Inner padding in the content area is required**. `imds-dialog-content` itself has no padding, so always wrap the inside with `imds-px-4 imds-py-3` (horizontal: 1rem / vertical: 0.75rem) or `imds-p-4` (1rem all around). Without this, the form's edge sticks to the dialog edge
- **`imds-dialog-footer` is fixed in place**. Even when `imds-dialog-content` scrolls, the footer button group stays visible. Always place action buttons in the footer; do not put them inside content
- **Buttons are right-aligned by default**. Use `display:flex; gap:0 1em; justify-content: flex-end` to lay out "Cancel → primary action" from left to right
- **`<form>` submit handling**: Mark the register button as `type="submit"`, and Cancel/Close buttons as `type="button"` explicitly. Without `type`, the browser may treat the button as submit and send the form unintentionally, so always specify it
- **Input ids must be unique**. When defining multiple dialogs on the same screen, generic ids like `id="categoryId"` collide. Prefix them with a dialog identifier (e.g., `id="create-categoryId"` / `id="edit-categoryId"`)
- **Validation**: For per-`imds-field` error display, see the "Validation Error" section in [imds-html-field.md](imds-html-field.md) (`imds-validation-error` class + `imds-error-text` element). Validate values with JS before submit and add/remove the marks on the relevant field
- **The multilingual input button (globe icon)** is for opening a separate dialog to input values in other languages. Remove it and use a plain textbox on screens that do not require multilingual support
- **Popup selection fields** that open an IM-Common Master search dialog should follow the reference of the `jssp-im-master-usage` skill (do not write `imACMSearch` tag parameters from memory)
