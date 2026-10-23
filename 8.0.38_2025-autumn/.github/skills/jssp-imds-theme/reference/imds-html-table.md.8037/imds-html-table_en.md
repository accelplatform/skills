---
paths:
  - "src/main/jssp/**/*.html"
---

# Table

## Overview

A component for displaying data in tabular form.

- Source URL: https://document.intra-mart.jp/design/?path=/story/components-table--default
- Base class: imds-table

## Overall Structure

```
imds-table                                # Table container (size and scroll control)
└── imds-table-inner                      # Inner wrapper
    └── table                             # Plain <table> element
        ├── thead
        │   └── tr
        │       └── th                    # Header cell (apply is-sticky / is-sortable etc.)
        └── tbody
            └── tr                        # Each row (apply is-active / is-danger etc.)
                └── td                    # Each cell (apply is-sticky / has-content-only / has-text-right etc.)
```

The three-layer structure `div.imds-table > div.imds-table-inner > table` is **required**. Do not write `table` directly.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-table | div element | Table container | Required |
| imds-table-inner | div element | Inner table wrapper | Required |
| is-sticky | imds-table | Fix header row (on vertical scroll) | Optional |
| is-hoverable | imds-table | Row hover highlight | Optional |
| is-bordered | imds-table | Border on all cells | Optional |
| is-area-bordered | imds-table | Table outer border | Optional |
| is-narrow | imds-table / tr element | Reduce cell padding | Optional |
| is-stripe | imds-table | Alternate background color for even rows | Optional |
| is-sticky | th / td element | Fix column (on horizontal scroll) | Optional |
| is-border-right | th / td element | Show border on right side of fixed column | Optional |
| is-sortable | th element | Sortable column | Optional |
| is-max-content | imds-table | Recommended for horizontal scroll (column width based on content width) | Optional |
| is-active | tr / td element | Active (selected) highlight | Optional |
| has-content-only | th / td element | Remove cell padding (for buttons/checkboxes) | Optional |
| has-text-right | td element | Right-align text (for numeric columns) | Optional |
| is-danger | tr / td element | Delete/expired (red) | Optional |
| is-error | tr / td element | Process failure/error (red) | Optional |
| is-success | tr / td element | Process success/normal (green) | Optional |
| is-add | tr / td element | New addition (green) | Optional |
| is-warning | tr / td element | Caution/warning (yellow) | Optional |
| is-disabled | tr / td element | Inactive state (gray) | Optional |
| is-white | tr / td element | Decorative color (white) | Optional |
| is-green | tr / td element | Decorative color (green) | Optional |
| is-red | tr / td element | Decorative color (red) | Optional |
| is-yellow | tr / td element | Decorative color (yellow) | Optional |
| is-cyan | tr / td element | Decorative color (cyan) | Optional |
| is-gray | tr / td element | Decorative color (gray) | Optional |

## HTML Snippets

### Basic table

```html
<div
  class="imds-table"
  style="width: 100%; height: 100%; max-height: 250px;">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th>Header 1</th>
          <th><span>Header 2</span></th>
          <th><span>Header 3</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span>Value-1-1</span></td>
          <td><span>Value-1-2</span></td>
          <td><span>Value-1-3</span></td>
        </tr>
        <!-- Repeat the same tr structure as needed -->
      </tbody>
    </table>
  </div>
</div>
```

The following sections show only the differences from the basic table.

## Variations

### isSticky (fixed header)

Add `is-sticky` to `div.imds-table`.
The header row is fixed during vertical scroll.

```html
<div class="imds-table is-sticky" ...>
```

### isHoverable (row hover)

Add `is-hoverable` to `div.imds-table`.

```html
<div class="imds-table is-hoverable" ...>
```

### isBordered (all cell borders)

Add `is-bordered` to `div.imds-table`.

```html
<div class="imds-table is-bordered" ...>
```

### isAreaBordered (outer border)

Add `is-area-bordered` to `div.imds-table`.

```html
<div class="imds-table is-area-bordered" ...>
```

### isStripe (stripe)

Add `is-stripe` to `div.imds-table`. The background color of even rows changes.

```html
<div class="imds-table is-stripe" ...>
```

### isMaxContent (recommended for horizontal scroll)

For tables likely to scroll horizontally, such as those with many columns or long text in each cell, add `is-max-content` to `div.imds-table`.
Column widths are based on content width, which avoids wrapping within cells.

```html
<div class="imds-table is-hoverable is-sticky is-area-bordered is-max-content" ...>
```

Conversely, if there are few columns and you want to display all columns without horizontal scrolling, do not add `is-max-content`. In this case, long strings are wrapped.

```html
<!-- Without horizontal scrolling (no is-max-content) -->
<div class="imds-table is-hoverable is-sticky is-area-bordered" ...>
```

### isNarrow (compact)

Add `is-narrow` to `div.imds-table` to apply to the entire table, or to `tr` to apply to specific rows only. For list tables with many rows, applying it to the entire table is recommended (see "Implementation Notes" for the criteria).

```html
<!-- Entire table -->
<div class="imds-table is-narrow" ...>

<!-- Specific rows only -->
<tr class="is-narrow">
  <td colspan="3"><span>Sample narrow row</span></td>
</tr>
```

### isVerticalSticky (fixed columns)

Fix specific columns during horizontal scroll.
Add `is-sticky` to `th` / `td`, and specify the `left` position for the 2nd column onwards.
Add `is-border-right` to the last fixed column to show a boundary line.

```html
<thead>
  <tr>
    <th class="is-sticky"><span>Fixed col 1</span></th>
    <th class="is-sticky" style="left: 70px;"><span>Fixed col 2</span></th>
    <th class="is-sticky is-border-right" style="left: 140px;"><span>Details</span></th>
    <th>Header 1</th>
    <!-- Normal columns -->
  </tr>
</thead>
<tbody>
  <tr>
    <td class="is-sticky is-cyan"><span>Fixed col 1</span></td>
    <td class="is-sticky is-cyan" style="left: 70px;"><span>Fixed col 2</span></td>
    <td class="is-sticky has-content-only is-border-right is-cyan" style="left: 140px;">
      <button type="button" class="imds-button is-ghost is-small">
        <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
      </button>
    </td>
    <td><span>Value-1-1</span></td>
    <!-- Normal columns -->
  </tr>
</tbody>
```

### isSelectable (row selection)

Add a checkbox column.
Add `has-content-only` to `th` / `td` to remove cell padding.
In a table context, place only `input` inside `label.imds-checkbox` and do not add `span` (note that this differs from a standalone form checkbox).

```html
<th class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" id="checkbox-all-xxxxx" />
  </label>
</th>
<!-- Add the same td structure to each row in tbody -->
<td class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" id="checkbox-child-0-xxxxx" />
  </label>
</td>
```

### isDetailsButton (details button column)

Add a details button column.
The `th` contains only header text, so add `has-text-centered` to center it. The `td` contains only a button, so add `has-content-only`.

```html
<th class="has-text-centered"><span>Details</span></th>
<!-- Each row in tbody -->
<td class="has-content-only">
  <button type="button" class="imds-button is-ghost is-small">
    <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
  </button>
</td>
```

### isSortable (sortable)

Add `is-sortable` to the target `th`, and add a sort button with the structure `imds-table-column-actions > button.imds-table-sorter > span.imds-table-sort-label + span.imds-icon`.
Inside `span.imds-icon`, always write both `<i>` elements, `fa-sort-up` (ascending icon) and `fa-sort-down` (descending icon); CSS switches their display according to the sort state (the implementation does not dynamically swap a single icon).
Add a `title` attribute describing the current action to `button.imds-table-sorter` (e.g. `"Sort ascending"` / `"Sort descending"` / `"Clear sorting"`).

```html
<th class="is-sortable">
  <div class="imds-table-column-actions">
    <button class="imds-table-sorter" title="Sort ascending">
      <span class="imds-table-sort-label">Header 2</span>
      <span class="imds-icon">
        <i class="fa-solid fa-sort-up"></i>
        <i class="fa-solid fa-sort-down"></i>
      </span>
    </button>
  </div>
</th>
```

The sort state cycles in the order "ascending -> descending -> not applied". The `title` text describes the action that occurs on the next click at that point.

### hasTextRight (right-align text)

Add `has-text-right` to `td` elements that should be right-aligned, such as numeric columns.

```html
<td class="has-text-right"><span>1,000</span></td>
```

### isActive (active row / cell)

Add `is-active` to `tr` to highlight the entire row, or to `td` for cell-level highlighting.

```html
<!-- Entire row -->
<tr class="is-active">

<!-- Cell level -->
<td class="is-active"><span>Value</span></td>
```

### color (cell background color)

Add a color class to `tr` or `td`. Can be combined with `is-active`.

| Class | Purpose |
|--------|------|
| (none) | Normal color |
| is-danger | Delete/expired |
| is-error | Process failure/error |
| is-success | Process success/normal |
| is-add | New addition |
| is-warning | Caution/warning |
| is-disabled | Inactive state |
| is-white / is-green / is-red / is-yellow / is-cyan / is-gray | Decorative colors |

```html
<tr class="is-danger">            <!-- Apply color to entire row -->
<td class="is-success">           <!-- Apply color to individual cell -->
<td class="is-warning is-active"> <!-- Color + active combination -->
```

### Vertical layout (item names and values side by side)

A table that shows item names and values side by side, used to display summary information on detail/reference screens and dialogs.
When placing headings in table rows, use `th` (do not use `thead`; alternate `th`/`td` inside `tbody`).

```html
<div class="imds-table is-bordered is-area-bordered">
  <div class="imds-table-inner">
    <table>
      <tbody>
        <tr>
          <th><span>Application Name</span></th>
          <td><span>Application 1</span></td>
          <th><span>Application ID</span></th>
          <td><span>sample_app_1</span></td>
        </tr>
        <tr>
          <th><span>Category Name</span></th>
          <td><span>Category 1</span></td>
          <th><span>Category ID</span></th>
          <td><span>ct_1</span></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

## Accessibility

### Header labels

- Labels should basically be left-aligned
- However, the following cases use center alignment

  **Center align**: Specify `has-text-centered` class on `th`
  - When displaying action buttons for the table
  - When displaying status icons
  - When displaying header text only, such as "Edit" or "Details" (do not use `has-content-only` here; `has-content-only` is only for a `th` that has no header text and contains only a component such as a checkbox)

### tbody

- Data items should basically be left-aligned, similar to column headers
- However, the following cases use center or right alignment

  **Center align**: Specify `has-text-centered` class on `td`
  - When displaying action buttons for the table
  - When displaying status icons

  **Right align**: Specify `has-text-right` class on `td`
  - When displaying data such as amounts and numbers where digit alignment matters

  **Component only**: Specify `has-content-only` class on `td`
  - When displaying only components such as checkboxes, buttons, icons, or tags

## Implementation Notes

- Describe tables with the 3-layer structure `div.imds-table > div.imds-table-inner > table`
- Control size via `style` on `imds-table` (set scroll area with `max-height`)
- `is-sticky` (whole table) and `is-sticky` (th/td) serve different purposes: the former fixes the header row, the latter fixes columns
- Manually calculate the `left` value for fixed columns based on the width of the preceding fixed columns
- Apply a background color class (such as `is-cyan`) to fixed column `td` elements to prevent the background from becoming transparent on scroll
- Implement sorting with JavaScript (toggling the `is-sortable` state class and reordering data). Always write both sort icons, `fa-sort-up` / `fa-sort-down`, in the header, and switch their display with state classes on the CSS side
- Add `is-max-content` to tables likely to scroll horizontally (many columns or long text). Do not add it if there are few columns and you do not want horizontal scrolling
- Use `has-content-only` when cell padding is not needed for buttons, checkboxes, etc.
- Do not add `has-content-only` to a `th` that has header text (e.g. `<span>Edit</span>`). Use `has-text-centered` if center alignment is desired. `has-content-only` is only for a `th` that itself contains just a component such as a checkbox, with no header text
- Multiple variations can be combined (e.g. `is-sticky is-hoverable is-stripe`)
- Criteria for applying variation classes:
  - As a rule, apply `is-area-bordered` (to make the table area clear) and `is-hoverable` (to make rows easy to follow; especially recommended for wide tables)
  - Apply `is-sticky` to tables that may scroll vertically (to keep each column's label always visible)
  - If there are right-aligned columns with `has-text-right` on `td`, applying `is-bordered` is recommended to make column boundaries clear (its role differs from `is-area-bordered`, and both can be used together)
  - For list tables with many rows, `is-narrow` is recommended to show more rows at once and increase information density (list screens apply it by default). Tables with input components such as text boxes inside `td` also get `is-narrow` to keep row height low
- For tables with few columns and little text that are hard to read when stretched to 100% width across the screen, consider specifying `width: fit-content;` in the `style` of `div.imds-table` (optional). To right-align a total or similar value with the right edge of the table, wrap the table and the target element together in `<div style="width: fit-content;">` (`has-text-end` right-aligns based on the element's own width)
- **Do not use a custom class for row/cell background colors**. imds applies its background color at the `td` level, so setting a custom `background-color` on `tr` gets overridden by the `td` background and never actually shows (the class is applied but the appearance does not change — an easy-to-miss defect). Use `is-active` ([isActive (Active Row / Cell)](#isactive-active-row--cell)) for highlighting a selected row, and status color classes such as `is-danger` / `is-warning` / `is-success` ([color (Cell Background Color)](#color-cell-background-color)) for status-based coloring. `is-active` can be combined with a color class
