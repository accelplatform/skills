---
paths:
  - "src/main/jssp/**/*.html"
---

# IconFont

## Overview

IconFont displays icons using the `<i>` tag.
When using the theme, Font Awesome and `imds-iconfont` icons are available.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-iconfont--documentation
- Base class: imds-icon

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-icon | span element | Icon wrapper | Required |
| is-primary | imds-icon | Primary color | Optional |
| is-warning | imds-icon | Warning color | Optional |
| is-danger | imds-icon | Danger color | Optional |
| is-success | imds-icon | Success color | Optional |
| is-info | imds-icon | Info color | Optional |
| is-error | imds-icon | Error color | Optional |
| is-blue | imds-icon | Blue | Optional |
| is-green | imds-icon | Green | Optional |
| is-red | imds-icon | Red | Optional |
| is-yellow | imds-icon | Yellow | Optional |
| is-orange | imds-icon | Orange | Optional |
| is-cyan | imds-icon | Cyan | Optional |
| is-gray | imds-icon | Gray | Optional |
| is-gray-light | imds-icon | Light gray | Optional |
| is-white | imds-icon | White | Optional |
| is-x-small | imds-icon | Extra small size | Optional |
| is-small | imds-icon | Small size | Optional |
| is-normal | imds-icon | Normal size | Optional |
| is-medium | imds-icon | Medium size | Optional |
| is-large | imds-icon | Large size | Optional |

## HTML Snippets

### Basic Icon

```html
<span class="imds-icon" title="Information icon">
  <i class="fa-solid fa-circle-info"></i>
</span>
```

All subsequent snippets show only the differences from the basic icon.

## Variations

### iconName (Icon Type)

Change the class of the `<i>` element. Font Awesome 6 and `imds-iconfont` are available.

```html
<i class="fa-solid fa-circle-check"></i>
<i class="fa-solid fa-triangle-exclamation"></i>
<i class="fa-solid fa-circle-info"></i>
```

### color (Color)

Add a color class to `span.imds-icon`.

```html
<span class="imds-icon is-primary">   <!-- Primary -->
<span class="imds-icon is-success">   <!-- Success -->
<span class="imds-icon is-warning">   <!-- Warning -->
<span class="imds-icon is-danger">    <!-- Danger -->
<span class="imds-icon is-info">      <!-- Info -->
<span class="imds-icon is-error">     <!-- Error -->
```

Others: `is-blue`, `is-green`, `is-red`, `is-yellow`, `is-orange`, `is-cyan`, `is-gray`, `is-gray-light`, `is-white`

### size (Size)

Add a size class to `span.imds-icon`.

```html
<span class="imds-icon is-x-small">  <!-- Extra small -->
<span class="imds-icon is-small">    <!-- Small -->
<span class="imds-icon is-normal">   <!-- Normal -->
<span class="imds-icon is-medium">   <!-- Medium -->
<span class="imds-icon is-large">    <!-- Large -->
```

## Combination Examples

### Combination with Button

```html
<!-- Button with text -->
<button type="button" class="imds-button is-primary">
  <span class="imds-icon"><i class="fa-solid fa-add"></i></span>
  <span class="imds-button-text">Create New</span>
</button>

<!-- Icon-only button -->
<button type="button" class="imds-button is-outlined is-primary" aria-label="Add">
  <span class="imds-icon is-primary"><i class="fa-solid fa-add"></i></span>
</button>
```

### Combination with Tag

```html
<span class="imds-tag is-green is-light">
  <span class="imds-icon is-success"><i class="fa-solid fa-circle-check"></i></span>
  <span>Success</span>
</span>
```

## Implementation Notes

- When conveying meaning with an icon alone, add the `title` attribute or `aria-label` to ensure accessibility
- Add `aria-hidden="true"` to decorative icons to hide them from screen readers
- For icon-only buttons, add `aria-label` to the `button` element
