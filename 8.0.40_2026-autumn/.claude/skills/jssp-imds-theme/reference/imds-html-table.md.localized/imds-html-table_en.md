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

### isNarrow (compact)

Add `is-narrow` to `div.imds-table` to apply to the entire table, or to `tr` to apply to specific rows only.

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

```html
<th class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span></span>
  </label>
</th>
<!-- Add the same td structure to each row in tbody -->
<td class="has-content-only">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span></span>
  </label>
</td>
```

### isDetailsButton (details button column)

Add a details button column.
Add `has-content-only` to `th` / `td`.

```html
<th class="has-content-only"><span>Details</span></th>
<!-- Each row in tbody -->
<td class="has-content-only">
  <button type="button" class="imds-button is-ghost is-small">
    <span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span>
  </button>
</td>
```

### isSortable (sortable)

Add `is-sortable` to the target `th` and add a sort icon.

```html
<th class="is-sortable">
  <span>Header 2</span>
  <span class="imds-icon"><i class="fa-solid fa-sort-up"></i></span>
</th>
```

Switch the icon according to sort direction: `fa-sort-up` (ascending) / `fa-sort-down` (descending) / `fa-sort` (unsorted).

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

## Accessibility

### Header labels

- Labels should basically be left-aligned
- However, the following cases use center alignment

  **Center align**: Specify `has-text-right` class on `th`
  - When displaying action buttons for the table
  - When displaying status icons

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
- Implement sorting with JavaScript (icon switching and data reordering)
- Use `has-content-only` when cell padding is not needed for buttons, checkboxes, etc.
- Multiple variations can be combined (e.g. `is-sticky is-hoverable is-stripe`)
