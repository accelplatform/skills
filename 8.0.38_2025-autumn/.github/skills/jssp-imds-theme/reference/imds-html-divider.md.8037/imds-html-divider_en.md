---
paths:
  - "src/main/jssp/**/*.html"
---

# Divider

## Overview

Divider is a component for visually grouping content by separating it horizontally or vertically.
Use it when layout adjustments and spacing alone are insufficient to distinguish groups.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-divider--documentation
- Base class: imds-divider

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-divider | hr element (horizontal) / div element (vertical) | Separator line | Required |
| is-horizontal | imds-divider | Horizontal separator line | Optional |
| is-vertical | imds-divider | Vertical separator line | Optional |
| is-small | imds-divider | Small size (less spacing) | Optional |
| is-normal | imds-divider | Normal size | Optional |
| is-large | imds-divider | Large size (more spacing) | Optional |

## HTML Snippets

### Basic Separator Line (Horizontal)

```html
<div style="height: 4em; display: grid;"><hr class="imds-divider" /></div>
```

All subsequent snippets show only the differences from the basic separator line.

## Variations

### alignment (Direction)

```html
<hr class="imds-divider is-horizontal">                                          <!-- Horizontal: hr element -->
<div style="display: flex; height: 3rem"><div class="imds-divider is-vertical"></div></div>  <!-- Vertical: div element -->
```

### size (Size)

```html
<hr class="imds-divider is-small">    <!-- Small -->
<hr class="imds-divider is-normal">   <!-- Normal -->
<hr class="imds-divider is-large">    <!-- Large -->
```

### Grouping in a Navigation Area (Vertical Separator Example)

Use this to group items in a navigation area such as a header.

```html
<div class="imds-header-actions">
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-bell"></i></span>
  </button>
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-comment"></i></span>
  </button>
  <div class="imds-divider is-vertical"></div>
  <button type="button" class="imds-button is-ghost is-normal">
    <span class="imds-icon"><i class="fa-solid fa-question-circle"></i></span>
  </button>
</div>
```

### Separator in a Menu (Horizontal, Small)

Use `hr.imds-divider.is-small` to separate list items in a popover menu or similar.

```html
<ul style="white-space: nowrap">
  <li><span>User Settings</span></li>
  <li><span>Application Settings</span></li>
  <hr class="imds-divider is-small" />
  <li><span>Log Out</span></li>
</ul>
```

## Implementation Notes

- **Use the `hr` element for horizontal direction (`is-horizontal` / the default when unspecified)**. `hr.imds-divider` is the standard pattern in the actual DOM.
- **Use the `div` element for vertical direction (`is-vertical`)**. `hr` carries no vertical meaning, so always use `div` for vertical separators.
- For vertical direction, the parent element must have a height and `display: grid` or `display: flex` specified
