---
paths:
  - "src/main/jssp/**/*.html"
---

# PaginationCompact

## Overview

PaginationCompact is a component that shortens the page number part of Pagination.
It differs from Pagination (imds-html-pagination.md) in that the current page is selected with a select box instead of a row of page number buttons. Basically use Pagination, and switch to PaginationCompact only when the screen width is narrow.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-pagination-paginationcompact--documentation
- Base class: imds-pagination (shared with Pagination; the compact structure is expressed by the contents of the inner `imds-pagination-page-number`)

## Criteria for Choosing Between Pagination and PaginationCompact (When to Switch)

- **Basic policy**: Basically use Pagination. PaginationCompact is an alternative (compact display) to Pagination, positioned as a reduced version for narrow areas.
- **Switching criteria (based on the notes in Pagination.md)**: When the screen size is tablet width (769px to less than 1023px), use PaginationCompact instead of Pagination. For screen size boundaries, refer to the Breakpoint page.
- The live DOM documentation assumes Pagination at desktop width (1024px and above) and PaginationCompact at tablet width (769px to 1023px). Handling at mobile width (768px and below) follows each screen's layout specification.
- Responsive switching is not done by CSS alone, so JavaScript must switch the rendered HTML structure itself (Pagination or PaginationCompact) according to the breakpoint.

## Overall Structure

```
nav.imds-pagination                       # Whole pagination (apply size class)
├── imds-pagination-controls              # Control area
│   ├── button (First)                    # imds-button is-ghost + fa-angles-left
│   ├── button (Previous)                 # imds-button is-ghost + fa-angle-left
│   ├── imds-pagination-page-number       # select + "/" + total pages instead of page numbers
│   │   ├── select.imds-select            # Select the current page
│   │   ├── span "/"
│   │   └── span (total pages)
│   ├── button (Next)                     # imds-button is-ghost + fa-angle-right
│   └── button (Last)                     # imds-button is-ghost + fa-angles-right
└── imds-pagination-options               # Options area (optional)
    ├── imds-pagination-records-per-page  # Per-page select (label + select.imds-select)
    └── span                              # Count display (e.g. "76 - 90 / 260")
```

The "First/Last" buttons are always displayed in compact (not present in the basic Pagination; same structure as the compact variation of Pagination).

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-pagination | nav element | Pagination container | Required |
| imds-pagination-controls | div element | Page control area (prev/next and first/last buttons + page select) | Required |
| imds-pagination-page-number | div element | Current page select (select) + total pages display | Required |
| imds-pagination-options | div element | Options area (records per page + count display) | Optional |
| imds-pagination-records-per-page | div element | Records per page select area | Optional |
| is-x-small | imds-pagination | Extra-small size | Optional |
| is-small | imds-pagination | Small size | Optional |
| is-normal | imds-pagination | Normal size (default) | Optional |
| is-medium | imds-pagination | Medium size | Optional |
| is-large | imds-pagination | Large size | Optional |

## HTML Snippets

### Basic Form

```html
<nav class="imds-pagination">
  <div class="imds-pagination-controls">
    <button type="button" class="imds-button is-ghost" title="First">
      <span class="imds-icon"><i class="fa-solid fa-angles-left"></i></span>
    </button>
    <button type="button" class="imds-button is-ghost" title="Previous">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
    </button>
    <div class="imds-pagination-page-number">
      <select class="imds-select">
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <!-- Generate one option per page -->
      </select>
      <span>/</span>
      <span>18</span>
    </div>
    <button type="button" class="imds-button is-ghost" title="Next">
      <span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>
    </button>
    <button type="button" class="imds-button is-ghost" title="Last">
      <span class="imds-icon"><i class="fa-solid fa-angles-right"></i></span>
    </button>
  </div>
  <div class="imds-pagination-options">
    <div class="imds-pagination-records-per-page">
      <label for="todo-replace-:r0:">Records per page</label>
      <select id="todo-replace-:r0:" class="imds-select">
        <option>15</option>
        <option>30</option>
        <option>50</option>
        <option>100</option>
      </select>
    </div>
    <span>76 - 90 / 260</span>
  </div>
</nav>
```

The following sections show only the differences from the basic form.

## Variations

### size (Size)

Apply a size class to `nav.imds-pagination`. Normally use `is-normal` (default).

```html
<nav class="imds-pagination is-x-small">  <!-- Extra-small -->
<nav class="imds-pagination is-small">    <!-- Small -->
<nav class="imds-pagination is-normal">   <!-- Normal -->
<nav class="imds-pagination is-medium">   <!-- Medium -->
<nav class="imds-pagination is-large">    <!-- Large -->
```

### hideRecordsPerPage (Hide Records Per Page Select)

Omit `imds-pagination-records-per-page`.

```html
<div class="imds-pagination-options"><span>76 - 90 / 260</span></div>
```

## Implementation Notes

- Select the current page with `select.imds-select` (do not use a group of page number buttons as in Pagination).
- Always include the "First" and "Last" buttons in the PaginationCompact structure (`fa-angles-left` / `fa-angles-right`).
- Add a `title` attribute to the prev/next and first/last buttons to ensure accessibility.
- On the first/last page, add the `disabled` attribute to the prev/next buttons (same as Pagination).
- Replace the `select` `id` and the `label` `for` with unique values (`todo-replace-:r0:` is a placeholder).
- Page switching and records-per-page changes must be controlled with JavaScript.
- **Criteria for switching from Pagination**: Switch to PaginationCompact when the screen width becomes tablet width (769px to less than 1023px). Basically use Pagination, and use PaginationCompact as an alternative for narrow screen widths (for details, see "Criteria for Choosing Between Pagination and PaginationCompact" at the top of this file).
