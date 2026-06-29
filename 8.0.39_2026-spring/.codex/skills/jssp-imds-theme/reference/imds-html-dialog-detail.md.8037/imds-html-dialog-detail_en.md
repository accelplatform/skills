# Dialog + Detail (Information-Display Dialog)

## Overview

A composite pattern that places **read-only information** inside a Dialog (popup window) using a vertical-style table.
Used for detail views, browse mode, and confirmation screens (when no input is involved).

- For details on individual components, see:
  - Dialog body: [imds-html-dialog.md](imds-html-dialog.md)
  - Table: [imds-html-table.md](imds-html-table.md)
  - Button: [imds-html-button.md](imds-html-button.md)
- Base classes: `imds-dialog` + `imds-table` (vertical th/td layout)

For dialogs that involve input (create / edit), use [imds-html-dialog-form.md](imds-html-dialog-form.md) instead.

## Overall Structure

```
imds-dialog-wrapper                      # Size-control wrapper
└── imds-dialog                          # Dialog body
    ├── imds-dialog-header               # Header (title + close button)
    ├── imds-dialog-content (+ scrollbar)# Content area
    │   └── imds-px-4 imds-py-3          # Inner padding wrapper
    │       └── imds-table is-area-bordered is-bordered
    │           └── imds-table-inner
    │               └── table > tbody
    │                   └── tr per row: "th: label / td: value"
    └── imds-dialog-footer               # Footer (close button only)
        └── imds-p-4
            └── button (Close)
```

## CSS Classes Reference (Specific to This Pattern)

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-dialog-footer | div element (at the end of `imds-dialog`) | Footer area (for the close button) | Required |
| imds-table | div element | Outer wrapper of the value-display table | Required |
| is-area-bordered | Combined with imds-table | Outer table border | Recommended |
| is-bordered | Combined with imds-table | All-cell borders (separator between items) | Recommended |
| imds-table-inner | div element | Inner wrapper of the table (required two-layer structure) | Required |
| imds-px-4 imds-py-3 | Inner content wrapper div | Horizontal/vertical inner padding | Effectively required (`imds-p-4` is also acceptable) |

See the individual reference files for other classes (`imds-dialog-*` / `imds-button` etc.).

## HTML Snippets

### Basic: Detail Dialog (`<dialog>` Root / Recommended)

```html
<dialog
  id="category-detail-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="category-detail-dialog-title"
  style="height: 430px; width: 600px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="category-detail-dialog-title" title="Category Details">Category Details</h1>
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
        <div class="imds-table is-area-bordered is-bordered">
          <div class="imds-table-inner">
            <table>
              <tbody>
                <tr>
                  <th style="width:30%"><span>Parent Category</span></th>
                  <td><span>Public Documents</span></td>
                </tr>
                <tr>
                  <th><span class="imds-required-label-required-asterisk">Category ID</span></th>
                  <td><span>public_documents_1</span></td>
                </tr>
                <tr>
                  <th><span>Category Name</span></th>
                  <td><span>Internal Public Documents</span></td>
                </tr>
                <tr>
                  <th><span class="imds-required-label-required-asterisk">Sort Number</span></th>
                  <td><span>10</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="imds-dialog-footer">
      <div
        class="imds-p-4"
        style="display:flex; gap:0 1em; justify-content: flex-end">
        <button type="button" class="imds-button" style="width: 8em">Close</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// Open (modal)
document.getElementById('category-detail-dialog').showModal();

// Close
document.getElementById('category-detail-dialog').close();
```

The sections below show only the differences from the basic pattern.

## Row Variations

Patterns for the rows placed inside `tbody`.

### 1. Standard Item

```html
<tr>
  <th><span>Category Name</span></th>
  <td><span>Internal Public Documents</span></td>
</tr>
```

### 2. Required Marker

In a detail view, no input occurs, but if you want to indicate that the item is "required when registering", add `imds-required-label-required-asterisk` to the `<span>` inside `th` (attach it to the span, not to a label).

```html
<tr>
  <th><span class="imds-required-label-required-asterisk">Category ID</span></th>
  <td><span>public_documents_1</span></td>
</tr>
```

### 3. Long / Multi-Line Text

Allow line breaks within `<td>` for long values. To preserve plain-text line breaks, use the CSS `white-space: pre-wrap`.

```html
<tr>
  <th><span>Description</span></th>
  <td><span style="white-space: pre-wrap">Multi-line\ndescription text</span></td>
</tr>
```

### 4. Items With No Value

Indicate empty values with fixed text such as "(Not set)" or a placeholder like `&mdash;` (an empty `<td>` does not convey meaning when read aloud).

```html
<tr>
  <th><span>Notes</span></th>
  <td><span class="has-text-grey">(Not set)</span></td>
</tr>
```

### 5. Rich Values Such as Links / Tags

Any imds component can be placed inside `<td>`.

```html
<tr>
  <th><span>Status</span></th>
  <td><span class="imds-tag is-success">Published</span></td>
</tr>
```

## Variations

### Combined Edit Button (Detail → Edit Path)

When placing an "Edit" button alongside "Close", put the primary action (Edit) at the right end.

```html
<div class="imds-dialog-footer">
  <div
    class="imds-p-4"
    style="display:flex; gap:0 1em; justify-content: flex-end">
    <button type="button" class="imds-button" style="width: 8em">Close</button>
    <button type="button" class="imds-button is-primary" style="width: 8em">Edit</button>
  </div>
</div>
```

### Back + Close (When Navigating From a List)

Use a two-button layout only when a "back" path exists; with "Close" alone, leave a single action.

```html
<div class="imds-dialog-footer">
  <div
    class="imds-p-4"
    style="display:flex; gap:0 1em; justify-content: space-between">
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
      <span class="imds-button-text">Back</span>
    </button>
    <button type="button" class="imds-button" style="width: 8em">Close</button>
  </div>
</div>
```

### `<div>` Root (Non-Modal / Special Use Only)

Use a `<div>` root only when modal behavior is not needed. As a rule, use a `<dialog>` root. See [imds-html-dialog.md](imds-html-dialog.md) for details.

```html
<div
  class="imds-dialog-wrapper"
  style="height: 430px; width: 600px;">
  <div class="imds-dialog">
    <!-- header / content / footer is identical -->
  </div>
</div>
```

### Size Adjustment

Change the dialog size via the `style` of `imds-dialog-wrapper`. Adjust the height based on the number of items, and let `imds-dialog-content imds-scrollbar` scroll vertically for overflow.

```html
<!-- Small (few items) -->
<dialog class="imds-dialog-wrapper" style="height: 320px; width: 480px;">

<!-- Large (many items / long values) -->
<dialog class="imds-dialog-wrapper" style="height: 600px; width: 720px;">
```

## Implementation Notes

- **This pattern is read-only**. Do not place input elements (`<input>` / `<select>` / `<textarea>`). If input is needed, switch to the pattern in [imds-html-dialog-form.md](imds-html-dialog-form.md)
- **The table requires a two-layer structure**. Put `<div class="imds-table-inner">` directly inside `<div class="imds-table">`, and put `<table>` inside that ([imds-html-table.md](imds-html-table.md)). Without this, border styles break
- **Specify th width on the first row's `<th>`** with `style="width:30%"` or similar. You do not need to repeat it on every row; the column width is determined by the first cell, acting as a `<colgroup>` substitute
- **Wrap values in `<span>`** by default. Bare text nodes directly under `<td>` make styling and script references awkward
- **Use a placeholder for empty values**. An empty `<td>` is read as just "empty" by screen readers, so add "(Not set)", "&mdash;", etc
- **`imds-required-label-required-asterisk` can be attached to either a label or a span**, but for detail views these are item names rather than form labels, so attach it to `<span>` (do not use `<label for=...>`)
- **Footer button arrangement**: Close only → right-aligned; Close + Edit → right-aligned with the primary at the right; Back + Close → `justify-content: space-between` to split left/right. The general rule is to place the primary action at the right end
- **Always specify `type="button"`**. For Close, Edit, etc., use `type="button"` (this pattern has no `<form>`, but some browsers treat the first button as submit and cause unintended behavior)
- **Behavior when Edit is pressed**: Usually `close()` the detail dialog and open the edit dialog ([imds-html-dialog-form.md](imds-html-dialog-form.md)) with `showModal()`. Make sure the same id is not used by two dialogs
- **The `title` attribute on the `<h1>` title**: To handle truncated display of long titles, add `<h1 title="...">` (a common dialog rule)
- **Avoid id collisions**: When listing "Create / Edit / Detail" dialogs on the same screen, split identifiers with prefixes such as `id="category-create-dialog"` / `id="category-edit-dialog"` / `id="category-detail-dialog"`
