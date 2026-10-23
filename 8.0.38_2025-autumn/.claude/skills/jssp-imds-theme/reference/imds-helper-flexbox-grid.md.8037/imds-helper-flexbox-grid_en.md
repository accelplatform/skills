---
paths:
  - "src/main/jssp/**/*.html"
---

# Flexbox & Grid (Alignment and Grid Utility)

## Overview

Flexbox & Grid is a set of imds helper classes that provide alignment of elements inside Flex / Grid containers (Align self) and row/column layouts using CSS Grid (Grid). These are imds utility classes used in combination with component-specific classes such as `imds-field` / `imds-field-group`. They are not used as standalone components.

- Source: `uiux-share/helper/Flexbox & Grid.md` (Align self) and `uiux-share/layout/Grid.md` (Grid)
- Note: `uiux-share/helper/Flexbox & Grid.md` itself does not describe Grid (`imds-grid`, etc.); the Grid class definitions exist only in `uiux-share/layout/Grid.md`. This file merges both.

## CSS Classes Reference

### Align self

| Class name | Applied to | Purpose | Value (Property: Value) |
|----------|--------|------|----------------------|
| `is-align-self-start` | Child element of a Flex/Grid container | Top alignment | `align-self: start;` |
| `is-align-self-center` | Child element of a Flex/Grid container | Center alignment | `align-self: center;` |
| `is-align-self-end` | Child element of a Flex/Grid container | Bottom alignment | `align-self: end;` |

### Grid (Basic Structure)

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| `imds-grid` | Element serving as the grid container | Enables a CSS Grid container | Required |
| `imds-grid-cell` | Direct child of `imds-grid` | Treated as a grid cell | Required |

### Grid (Common Column Count — All Screen Sizes)

| Class name | Purpose | Value |
|----------|------|----|
| `has-cols-1` to `has-cols-12` | Displays the specified number of columns at all screen sizes | Columns: 1 to 12 (default is 2 columns) |

### Grid (Column Count per Breakpoint)

| Class name | Purpose | Value |
|----------|------|----|
| `has-small-mobile-cols-N` | N columns at the Small Mobile breakpoint and above (N=1 to 12) | Columns: N |
| `has-mobile-cols-N` | N columns at the Mobile breakpoint and above (N=1 to 12) | Columns: N |
| `has-tablet-cols-N` | N columns at the Tablet breakpoint and above (N=1 to 12) | Columns: N |

### Grid (Fixed Column Span — All Screen Sizes)

| Class name | Applied to | Purpose | Value |
|----------|--------|------|----|
| `is-col-span-N` (N=1 to 12) | `imds-grid-cell` | Makes the element span N columns at all screen sizes | Spanned columns: N |

### Grid (Column Span per Breakpoint)

| Class name | Applied to | Purpose | Value |
|----------|--------|------|----|
| `is-small-mobile-col-span-N` | `imds-grid-cell` | Spans N columns at the Small Mobile breakpoint and above | Spanned columns: N |
| `is-mobile-col-span-N` | `imds-grid-cell` | Spans N columns at the Mobile breakpoint and above | Spanned columns: N |
| `is-tablet-col-span-N` | `imds-grid-cell` | Spans N columns at the Tablet breakpoint and above | Spanned columns: N |

## Usage Examples

### Align self: Aligning the vertical position of Fields

Before (remains top-aligned)

```html
<div class="imds-field-group">
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r0:">Memory Capacity</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r0:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-control">
        <select id=":r1:" class="imds-select">
          <option>GB</option>
          <option>TB</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

After (add `is-align-self-end` to vertically align the field without a label with the input of the other field)

```html
<div class="imds-field-group">
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r3:">Memory Capacity</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r3:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field is-align-self-end">
      <div class="imds-field-control">
        <select id=":r4:" class="imds-select">
          <option>GB</option>
          <option>TB</option>
        </select>
      </div>
    </div>
  </div>
</div>
```

### Grid: Basic structure (default 2 columns)

```html
<div class="imds-grid">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <div class="imds-grid-cell">cell 3</div>
  <div class="imds-grid-cell">cell 4</div>
</div>
```

### Grid: Common column count (12 columns)

```html
<div class="imds-grid has-cols-12">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <!-- ... continues up to cell 12 ... -->
</div>
```

### Grid: Column count per breakpoint (3 columns by default, 6 columns at tablet and above)

```html
<div class="imds-grid has-cols-3 has-tablet-cols-6">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell">cell 2</div>
  <!-- ... -->
</div>
```

### Grid: Fixed column span (the 2nd cell spans 3 columns in a 12-column grid)

```html
<div class="imds-grid has-cols-12">
  <div class="imds-grid-cell">cell 1</div>
  <div class="imds-grid-cell is-col-span-3">cell 2</div>
  <div class="imds-grid-cell">cell 3</div>
</div>
```

### Grid: Column span per breakpoint

```html
<div class="imds-grid has-cols-4">
  <div class="imds-grid-cell is-small-mobile-col-span-3 is-mobile-col-span-2 is-tablet-col-span-1">cell 1</div>
  <div class="imds-grid-cell is-small-mobile-col-span-3 is-mobile-col-span-2 is-tablet-col-span-1">cell 2</div>
</div>
```

### Grid: Applying to FieldGroup (important caveat)

When using Grid with FieldGroup, it can be applied only to `.imds-field-group-control`. Specify the `.imds-grid` class on `.imds-field-group-control` and treat its direct children as `.imds-grid-cell`.

**✅ OK example (`imds-grid` on `.imds-field-group-control`)**

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field-group is-horizontal">
    <div class="imds-field-group-label"><span>Purchase Information</span></div>
    <div class="imds-field-group-control is-horizontal imds-grid has-cols-3">
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rb:">Purchase Date</label></div>
        <div class="imds-field-control">
          <input type="date" id=":rb:" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rc:">Purchase Amount</label></div>
        <div class="imds-field-control">
          <input type="text" id=":rc:" class="imds-textbox has-text-end" value="" />
        </div>
      </div>
      <div class="imds-field imds-grid-cell">
        <div class="imds-field-label"><label for=":rd:">Approval Information</label></div>
        <div class="imds-field-control">
          <input type="text" placeholder="Select an approval number" class="imds-textbox" readonly value="" />
        </div>
      </div>
    </div>
  </div>
</div>
```

**❌ NG example (`imds-grid` on `.imds-field-group` itself, turning `imds-field-group-label` / `imds-field-group-control` into cells)**

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field-group is-horizontal imds-grid has-cols-3">
    <div class="imds-field-group-label imds-grid-cell"><span>Purchase Information</span></div>
    <div class="imds-field-group-control is-horizontal imds-grid-cell is-col-span-2">
      <div class="imds-field">
        <div class="imds-field-label"><label for=":re:">Purchase Date</label></div>
        <div class="imds-field-control">
          <input type="date" id=":re:" class="imds-textbox" value="" />
        </div>
      </div>
    </div>
  </div>
</div>
```

## Implementation Notes

- **Apply `is-col-span-N` only to `imds-field-group-control` (or other elements with `imds-grid-cell`, such as `imds-field`), never to `imds-field-group` itself.** `imds-field-group` has an internal mechanism that controls the layout of Label and Control; turning `imds-field-group` itself into a grid container and treating `imds-field-group-label` / `imds-field-group-control` as grid cells breaks the layout. When applying Grid to a FieldGroup, specify `imds-grid` only on `.imds-field-group-control`.
- `is-align-self-*` is effective only on child elements of a Flex or Grid container; it has no expected effect on normal block elements. Align everything with the parent's `align-items` as the default, and use it only when an individual element's position needs adjustment.
- When specifying a column span (`is-col-span-N`, etc.) on a cell, make sure the number of columns it spans does not exceed the column count defined on the parent grid (`has-cols-N`). Exceeding it can cause the cell to wrap to the next row unintentionally or break the layout.
- To change the vertical alignment of elements within a column, add `is-align-self-start` / `is-align-self-center` / `is-align-self-end` to `imds-grid-cell`.
