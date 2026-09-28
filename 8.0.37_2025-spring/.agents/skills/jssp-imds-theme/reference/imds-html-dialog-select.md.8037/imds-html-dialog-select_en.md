# Dialog + Select (Data Selection Dialog)

## Overview

A composite pattern that combines a **search box + list table** inside a Dialog (popup window) to let the user pick one (or several) entries from a list and return the value to the parent screen.
Used for lookups, master selection, reference selection, etc.

- For details on individual components, see:
  - Dialog body: [imds-html-dialog.md](imds-html-dialog.md)
  - Table: [imds-html-table.md](imds-html-table.md) (`is-sticky` / `is-hoverable` / `is-sortable`)
  - Search box: [imds-html-textbox-control.md](imds-html-textbox-control.md) (use `is-left` for left-aligned icon)
  - Button: [imds-html-button.md](imds-html-button.md)
- Base classes: `imds-dialog` + `imds-table is-sticky is-hoverable`

When you need to open an IM-Common Master search dialog (user / organization / company / role, etc.), use the `jssp-im-master-usage` skill (`imACMSearch`) instead of building this from scratch. This pattern is only for **selecting from a custom table**.

## Overall Structure

```
imds-dialog-wrapper                      # Size-control wrapper (landscape by default)
└── imds-dialog                          # Dialog body
    ├── imds-dialog-header               # Header (title + close button)
    ├── imds-dialog-content (+ scrollbar)# Content area
    │   └── imds-px-4 imds-py-3          # Inner padding wrapper
    │       ├── imds-textbox-control is-left   # Search box (icon on the left)
    │       └── imds-table is-area-bordered is-sticky is-hoverable imds-mt-4
    │           └── imds-table-inner
    │               └── table
    │                   ├── thead > tr > th (sortable with is-sortable)
    │                   └── tbody > tr > td  (click a row to select)
    └── imds-dialog-footer               # Footer (Cancel / Select)
        └── imds-p-4
            ├── button (Cancel)
            └── button.is-primary (Select)
```

## CSS Classes Reference (Specific to This Pattern)

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-dialog-footer | div element (at the end of `imds-dialog`) | Footer area | Required |
| imds-textbox-control + is-left | Outer wrapper of the search box | Search field with the icon placed on the left | Recommended |
| imds-table + is-sticky | Outer wrapper of the table | Fixed header row (visible while scrolling vertically) | Recommended |
| imds-table + is-hoverable | Outer wrapper of the table | Row hover highlight (visual hint that rows are clickable) | Recommended |
| imds-table + is-area-bordered | Outer wrapper of the table | Outer table border | Recommended |
| th.is-sortable | th element | Marker for a sortable column | Optional |
| imds-mt-4 | Outer wrapper of the table | Vertical spacing between the search box and the table | Recommended |

See the individual reference files for other classes (`imds-dialog-*` / `imds-button` etc.).

## HTML Snippets

### Basic: Data Selection Dialog (`<dialog>` Root / Recommended)

```html
<dialog
  id="route-select-dialog"
  class="imds-dialog-wrapper"
  aria-labelledby="route-select-dialog-title"
  style="width: 800px;">
  <div class="imds-dialog">
    <div class="imds-dialog-header">
      <div class="imds-dialog-title-wrapper">
        <div class="imds-dialog-title">
          <h1 id="route-select-dialog-title" title="Select Route">Select Route</h1>
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
        <div
          class="imds-textbox-control is-left"
          style="width:200px">
          <input
            type="search"
            class="imds-textbox"
            aria-label="Filter"
            value="" />
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </div>
        <div
          class="imds-table is-area-bordered is-sticky is-hoverable imds-mt-4"
          style="height: 100%; width: 100%; max-height: 220px;">
          <div class="imds-table-inner">
            <table>
              <thead>
                <tr>
                  <th>Header1</th>
                  <th class="is-sortable">
                    <span>Header2</span>
                    <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
                  </th>
                  <th class="is-sortable">
                    <span>Header3</span>
                    <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span>Value-1-1</span></td>
                  <td><span>Value-1-2</span></td>
                  <td><span>Value-1-3</span></td>
                </tr>
                <!-- Remaining rows omitted -->
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
        <button type="button" class="imds-button" style="width: 8em">Cancel</button>
        <button type="button" class="imds-button is-primary" style="width: 8em">Select</button>
      </div>
    </div>
  </div>
</dialog>
```

```javascript
// Open (modal)
document.getElementById('route-select-dialog').showModal();

// Close
document.getElementById('route-select-dialog').close();
```

The sections below show only the differences from the basic pattern.

## Row-Selection Implementation Patterns

`is-hoverable` provides hover highlight, but **the selection state must be implemented yourself** (CSS alone cannot distinguish the selected row).

### 1. Single Selection (Click to Highlight)

Add the standard imds class `is-active` (see isActive in [imds-html-table.md](imds-html-table.md)) to the selected row.
Do not use a custom class such as `is-selected` with a `tr` `background-color`. imds applies its background color at the `td` level, so a custom background on `tr` gets overridden by the `td` background and never actually shows (the class is applied but the appearance does not change). `is-active` also applies styling at the `td` level, so it does not have this override problem.

```html
<tbody>
  <tr data-value="route-1"><td><span>Value-1-1</span></td>...</tr>
  <tr class="is-active" data-value="route-2"><td><span>Value-2-1</span></td>...</tr>
  <tr data-value="route-3"><td><span>Value-3-1</span></td>...</tr>
</tbody>
```

```javascript
// Toggle the selected row on click (is-active is a standard imds class, so no custom CSS is needed)
document.querySelectorAll('#route-select-dialog tbody tr').forEach(function (tr) {
  tr.addEventListener('click', function () {
    document.querySelectorAll('#route-select-dialog tbody tr.is-active')
      .forEach(function (e) { e.classList.remove('is-active'); });
    tr.classList.add('is-active');
  });
});
// If you want a "double click to confirm immediately" UX, listen for dblclick as well
```

**Accessibility note**: Conveying selection state through row background color alone is not enough for users who have difficulty perceiving color, or who operate the screen with a keyboard only — row clicking is a mouse-only interaction. On screens that require keyboard operation or screen-reader support, combine this with the radio-button pattern below and call the same selection logic from both the row's `click` and the radio's `change` so the state stays in sync.

### 2. Single Selection With a Radio Button (Explicit)

When you want the selection UI to be visually explicit, or when keyboard operation / screen-reader support is required, place a radio in the first column. A radio button lets the selection state reach assistive technology (it becomes something a screen reader announces) and lets the user focus it with `Tab` and move between rows with the arrow keys.

```html
<thead>
  <tr>
    <th style="width: 3em"></th>
    <th>ID</th>
    <th>Name</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="has-content-only"><label class="imds-radio"><input type="radio" name="route" value="route-1" aria-label="route-1 Application Route A" /></label></td>
    <td><span>route-1</span></td>
    <td><span>Application Route A</span></td>
  </tr>
</tbody>
```

If you also want row-click selection to keep working, combine the `is-active` toggle from pattern 1 and the radio's `checked` assignment into a single function (e.g. `selectRow()`) and call it from both the row's `click` and the input's `change`. Assign `radio.checked = true` explicitly (clicking the radio or its label also bubbles up to the `tr`, so the function can be called twice, but this is safe as long as the logic is idempotent). Give a radio that has no visible label text an `aria-label` (e.g. "ID + name") so the row can be identified. Set data-derived attribute values such as the value or `aria-label` with `setAttribute` rather than string-concatenated `innerHTML` (XSS prevention).

For radio details, see [imds-html-radio.md](imds-html-radio.md).

### 3. Multiple Selection With Checkboxes

When multiple rows can be selected, place a checkbox in the first column. Ideally, also place a "select all" checkbox in `thead`.

```html
<thead>
  <tr>
    <th style="width: 3em">
      <label class="imds-checkbox"><input type="checkbox" aria-label="Select all" /></label>
    </th>
    <th>ID</th>
    <th>Name</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td><label class="imds-checkbox"><input type="checkbox" value="route-1" /></label></td>
    <td><span>route-1</span></td>
    <td><span>Application Route A</span></td>
  </tr>
</tbody>
```

For checkbox details, see [imds-html-checkbox.md](imds-html-checkbox.md).

## Variations

### Sort-Column State Display

Indicate the current sort state with the icon inside `th` that has `is-sortable`.

| State | Icon |
|------|----------|
| Not the sort target | `fa-sort` |
| Ascending | `fa-sort-up` |
| Descending | `fa-sort-down` |

```html
<th class="is-sortable">
  <span>Registration Date</span>
  <span class="imds-icon"><i class="fa-solid fa-sort"></i></span>
</th>
```

Implement the sort logic in JS (switch `data-order` etc. on click and re-render).

### Search Box Behavior

With `type="search"`, some browsers automatically show a "×" clear button at the right edge. The search trigger options are:

- **Incremental search**: Debounce the `input` event and run filtering
- **Explicit search**: Run when the search icon is clicked or Enter is pressed

```javascript
// Incremental example (filter <tr> elements inside <tbody> on the client side)
var input = document.querySelector('#route-select-dialog input[type=search]');
input.addEventListener('input', function () {
  var q = input.value.toLowerCase();
  document.querySelectorAll('#route-select-dialog tbody tr').forEach(function (tr) {
    tr.style.display = tr.textContent.toLowerCase().indexOf(q) >= 0 ? '' : 'none';
  });
});
```

### Empty Result Display

When the search result is 0 hits, show a "No data" row inside `<tbody>`. Do not leave `<tbody>` empty.

```html
<tbody>
  <tr>
    <td colspan="3" class="has-text-centered has-text-grey">No matching data</td>
  </tr>
</tbody>
```

### Combined Pagination

If there is a large number of rows, add pagination below the table.

```html
<div class="imds-table is-area-bordered is-sticky is-hoverable imds-mt-4" ...>
  <!-- ... -->
</div>
<nav class="imds-pagination imds-mt-4">
  <!-- See imds-html-pagination.md for details -->
</nav>
```

For details, see [imds-html-pagination.md](imds-html-pagination.md).

### `<div>` Root (Non-Modal / Special Use Only)

Use a `<div>` root only when modal behavior is not needed. As a rule, use a `<dialog>` root. See [imds-html-dialog.md](imds-html-dialog.md) for details.

```html
<div
  class="imds-dialog-wrapper"
  style="width: 800px;">
  <div class="imds-dialog">
    <!-- header / content / footer is identical -->
  </div>
</div>
```

### Size Adjustment

For `imds-dialog-wrapper`, **width takes priority** (around 800px by default). Control the inner scroll area with the `max-height` of `imds-table` (the dialog's vertical size adapts to the content).

```html
<!-- Landscape; scroll inside a 220px table area -->
<dialog class="imds-dialog-wrapper" style="width: 800px;">
  ...
  <div class="imds-table ..." style="height:100%; width:100%; max-height: 220px;">
```

If you want to fix the dialog height, choose a height that fits the search box + table + footer.

## Implementation Notes

- **The table requires a two-layer structure**. Put `<div class="imds-table-inner">` directly inside `<div class="imds-table">`, and put `<table>` inside that ([imds-html-table.md](imds-html-table.md))
- **`is-sticky` applied to the table wrapper fixes the header row; applied to `th` / `td` it fixes columns**. **These are different concepts** — do not confuse them ([imds-html-table.md](imds-html-table.md) Reference, lines 37 / 43)
- **Apply `max-height` to the `imds-table` wrapper** to establish the inner scroll area. Without this, `is-sticky` is less effective
- **`aria-label` on the search input**: For a search box without a visible `<label>`, always add `aria-label="Filter"` or similar (screen-reader support)
- **Always specify `type="button"`**. Use `type="button"` for both Cancel and Select. This pattern has no `<form>`, but without it the button is treated as submit
- **Behavior when Select is pressed**: Take the value from the selected row, return it to the parent screen, then `close()`. Disabling the button while no row is selected stabilizes UX

  ```javascript
  var primary = document.querySelector('#route-select-dialog .imds-button.is-primary');
  primary.disabled = !document.querySelector('#route-select-dialog tbody tr.is-active');
  ```

- **Use the standard imds class `is-active` to highlight the selected row**. Do not use a custom class such as `is-selected` with a `tr` `background-color` (it gets overridden by the `td` background and never actually shows — see "1. Single Selection" for details). If you combine a checkbox / radio, you can also highlight using `:checked` + the `:has()` selector
- **Double-click to confirm immediately** is a strong UX but risks accidental operation. Adopt it only when "the row should be selectable at a glance" (e.g., master selection); for confirmation-needed selections (e.g., permission change), keep the two-step flow of click to select + Select button to confirm
- **Handling large data**: Stacking thousands of rows in `<tbody>` on the client side makes rendering slow. Switch to server-side filtering + pagination ([imds-html-pagination.md](imds-html-pagination.md))
- **IM-Common Master selection** should not be built from scratch using this pattern; use the `imACMSearch` tag from the `jssp-im-master-usage` skill (see that skill's reference for parameter and callback details)
- **Avoid id collisions**: When laying out multiple selection dialogs on the same screen, separate them with identifiers like `id="route-select-dialog"` / `id="user-select-dialog"`
