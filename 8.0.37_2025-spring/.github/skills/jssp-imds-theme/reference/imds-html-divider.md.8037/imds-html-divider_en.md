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
| imds-divider | div element | Separator line | Required |
| is-horizontal | imds-divider | Horizontal separator line | Optional |
| is-vertical | imds-divider | Vertical separator line | Optional |
| is-small | imds-divider | Small size (less spacing) | Optional |
| is-normal | imds-divider | Normal size | Optional |
| is-large | imds-divider | Large size (more spacing) | Optional |

## HTML Snippets

### Basic Separator Line

```html
<div style="height: 4em; display: grid;"><div class="imds-divider is-vertical is-small"></div></div>
```

All subsequent snippets show only the differences from the basic separator line.

## Variations

### alignment (Direction)

```html
<div class="imds-divider is-horizontal">   <!-- Horizontal -->
<div class="imds-divider is-vertical">     <!-- Vertical -->
```

### size (Size)

```html
<div class="imds-divider is-small">   <!-- Small -->
<div class="imds-divider is-normal">  <!-- Normal -->
<div class="imds-divider is-large">   <!-- Large -->
```

## Implementation Notes

- Use a `div` element (do not use `hr`)
- For vertical direction, the parent element must have a height and `display: grid` or `display: flex` specified
