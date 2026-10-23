# Pagination

## Overview

Pagination is a component used as navigation to display list data in page units.
When displaying large amounts of content, it allows users to find information without scrolling.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-pagination-pagination--documentation
- Base class: imds-pagination

## Overall Structure

```
nav.imds-pagination                       # Whole pagination (apply size class)
├── imds-pagination-controls              # Control area (prev/next buttons + page numbers)
│   ├── button (prev / first)             # imds-button is-ghost + arrow icon
│   ├── imds-pagination-page-number       # Page-number button group
│   │   ├── button.is-primary             # Current page (is-primary)
│   │   ├── button.is-ghost               # Other pages (is-ghost)
│   │   ├── imds-pagination-page-ellipsis # Ellipsis "…" (optional)
│   │   └── ...                           # In compact mode, replaced by a select
│   └── button (next / last)
└── imds-pagination-options               # Options area (optional)
    ├── imds-pagination-records-per-page  # Per-page select (label + select.imds-select)
    └── span                              # Count display (e.g., "501 - 600 / 2000")
```

On the first/last page, add `disabled` to the prev/next buttons. Page switching and per-page changes are controlled via JavaScript.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-pagination | nav element | Pagination container | Required |
| imds-pagination-controls | div element | Page control area (prev/next buttons + page numbers) | Required |
| imds-pagination-page-number | div element | Page number button group | Required |
| imds-pagination-page-ellipsis | div element | Ellipsis (…) | Optional |
| imds-pagination-options | div element | Options area (records per page + count display) | Optional |
| imds-pagination-records-per-page | div element | Records per page select area | Optional |
| is-x-small | imds-pagination | Extra small size | Optional |
| is-small | imds-pagination | Small size | Optional |
| is-normal | imds-pagination | Normal size | Optional |
| is-medium | imds-pagination | Medium size | Optional |
| is-large | imds-pagination | Large size | Optional |

## HTML Snippets

### Basic Pagination

```html
<nav class="imds-pagination">
  <div class="imds-pagination-controls">
    <button type="button" class="imds-button is-ghost" title="Previous">
      <span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>
    </button>
    <div class="imds-pagination-page-number">
      <button type="button" class="imds-button is-ghost">1</button>
      <button type="button" class="imds-button is-ghost">2</button>
      <button type="button" class="imds-button is-primary">3</button>
      <button type="button" class="imds-button is-ghost">4</button>
      <button type="button" class="imds-button is-ghost">5</button>
      <div class="imds-pagination-page-ellipsis"><span>…</span></div>
      <button type="button" class="imds-button is-ghost">20</button>
    </div>
    <button type="button" class="imds-button is-ghost" title="Next">
      <span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>
    </button>
  </div>
  <div class="imds-pagination-options">
    <div class="imds-pagination-records-per-page">
      <label for="todo-replace-:r1:">Records per page</label>
      <select id="todo-replace-:r1:" class="imds-select">
        <option value="100">100</option>
        <option value="200">200</option>
        <option value="300">300</option>
      </select>
    </div>
    <span>501 - 600 / 2000</span>
  </div>
</nav>
```

The following sections show only the differences from the basic pagination.

## Variations

### size (Size)

Add a size class to `nav.imds-pagination`.

```html
<nav class="imds-pagination is-x-small">  <!-- Extra small -->
<nav class="imds-pagination is-small">    <!-- Small -->
<nav class="imds-pagination is-normal">   <!-- Normal -->
<nav class="imds-pagination is-medium">   <!-- Medium -->
<nav class="imds-pagination is-large">    <!-- Large -->
```

### hideRecordsPerPage (Hide Records Per Page Select)

Omit `imds-pagination-records-per-page`.

```html
<div class="imds-pagination-options">
  <span>501 - 600 / 2000</span>
</div>
```

### compact (Compact)

Select the current page with a select box instead of page number buttons.
First/last page buttons are also added.

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
        <!-- Generate options for each page -->
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
      <label for="todo-replace-:r1:">Records per page</label>
      <select id="todo-replace-:r1:" class="imds-select">
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

### rangeLength (Pages Shown Around the Current Page) and Page Truncation Rules

The number of page number buttons shown before and after the current page is called `rangeLength`. Unless specified otherwise, `rangeLength` defaults to **3**. Set an appropriate value for the width of the area where the Pagination is placed.

- With `rangeLength=3`, truncation (`imds-pagination-page-ellipsis`) is used when **the total number of pages is 12 or more**.
- **Do not truncate just one page** (e.g. a display like "1, … , 3, 4," where a single ellipsis hides only one page is prohibited). When the total number of pages is 11 or fewer (with `rangeLength=3`), do not use an ellipsis; list all page number buttons as they are.

```html
<!-- 9, 10, or 11 pages in total: show all pages without an ellipsis -->
<div class="imds-pagination-page-number">
  <button type="button" class="imds-button is-ghost">1</button>
  <button type="button" class="imds-button is-ghost">2</button>
  <button type="button" class="imds-button is-ghost">3</button>
  <button type="button" class="imds-button is-ghost">4</button>
  <button type="button" class="imds-button is-ghost">5</button>
  <button type="button" class="imds-button is-primary">6</button>
  <button type="button" class="imds-button is-ghost">7</button>
  <button type="button" class="imds-button is-ghost">8</button>
  <button type="button" class="imds-button is-ghost">9</button>
  <!-- For 10 or 11 pages in total, buttons 10 and 11 follow here (no ellipsis) -->
</div>

<!-- 12 or more pages in total: use an ellipsis and show only the last page -->
<div class="imds-pagination-page-number">
  <button type="button" class="imds-button is-ghost">1</button>
  <button type="button" class="imds-button is-ghost">2</button>
  <button type="button" class="imds-button is-ghost">3</button>
  <button type="button" class="imds-button is-ghost">4</button>
  <button type="button" class="imds-button is-ghost">5</button>
  <button type="button" class="imds-button is-primary">6</button>
  <button type="button" class="imds-button is-ghost">7</button>
  <button type="button" class="imds-button is-ghost">8</button>
  <button type="button" class="imds-button is-ghost">9</button>
  <div class="imds-pagination-page-ellipsis"><span>…</span></div>
  <button type="button" class="imds-button is-ghost">12</button>
</div>
```

### Criteria for Switching to PaginationCompact

When the screen size is tablet width (769px to less than 1023px), use PaginationCompact (imds-html-pagination-compact.md) instead of Pagination. For screen size breakpoints, refer to the Breakpoint page. Use Pagination by default and switch to PaginationCompact only for narrow screen widths.

## Implementation Notes

- Apply `is-primary` to the current page button and `is-ghost` to all others
- Use `imds-pagination-page-ellipsis` (…) to truncate when there are many pages. However, **do not truncate just one page** (see "rangeLength (Pages Shown Around the Current Page) and Page Truncation Rules" for details)
- Add a `title` attribute to prev/next buttons for accessibility
- Add the `disabled` attribute to prev/next buttons on the first/last page
- Replace the `select` `id` and `label` `for` with unique values (`todo-replace-:r1:` is a placeholder)
- Page switching and records-per-page changes must be controlled with JavaScript
- When the screen width becomes tablet width (769px to less than 1023px), consider switching to PaginationCompact (see "Criteria for Switching to PaginationCompact" for details)
