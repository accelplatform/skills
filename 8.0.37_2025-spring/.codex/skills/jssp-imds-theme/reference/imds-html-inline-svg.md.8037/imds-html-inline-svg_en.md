# InlineSvg

## Overview

InlineSvg displays icons using inline SVG.
By embedding SVG directly into HTML, color and size can be controlled via CSS.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-inlinesvg--documentation
- Base class: imds-icon

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-icon | span element | Icon wrapper | Required |
| is-x-small | imds-icon | Extra small size | Optional |
| is-small | imds-icon | Small size | Optional |
| is-normal | imds-icon | Normal size | Optional |
| is-medium | imds-icon | Medium size | Optional |
| is-large | imds-icon | Large size | Optional |
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

## HTML Snippets

### Basic inline SVG icon

```html
<span class="imds-icon">
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 512 512">
    <path
      fill="hsl(0, 0%, 43%)"
      d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path>
  </svg>
</span>
```

The following sections show only the differences from the basic icon.

## Variations

### size

Add a size class to `span.imds-icon`.

```html
<span class="imds-icon is-x-small">  <!-- Extra small -->
<span class="imds-icon is-small">    <!-- Small -->
<span class="imds-icon is-normal">   <!-- Normal -->
<span class="imds-icon is-medium">   <!-- Medium -->
<span class="imds-icon is-large">    <!-- Large -->
```

### color

Add a color class to `span.imds-icon`. For single-color SVGs, use `fill="currentColor"` so that color classes (e.g. `is-primary`) are applied.

```html
<span class="imds-icon is-primary">   <!-- Primary -->
<span class="imds-icon is-success">   <!-- Success -->
<span class="imds-icon is-warning">   <!-- Warning -->
<span class="imds-icon is-danger">    <!-- Danger -->
```

Others: `is-blue`, `is-green`, `is-red`, `is-yellow`, `is-orange`, `is-cyan`, `is-gray`, `is-gray-light`, `is-white`

## Combination Examples

### Combined with Button

```html
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- SVG path data -->
    </svg>
  </span>
  <span class="imds-button-text">Button Text</span>
</button>
```

### Combined with Tag

```html
<span class="imds-tag is-light is-blue">
  <span class="imds-icon">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <!-- SVG path data -->
    </svg>
  </span>
  <span>Category</span>
</span>
```

## Implementation Notes

- Specifying `fill="currentColor"` on the SVG causes color classes (such as `is-primary`) to be applied
- Multi-color SVGs specify colors directly via the `fill` attribute, so color classes have no effect
- Accessibility: add `aria-label` to `span.imds-icon` for meaningful icons; add `aria-hidden="true"` for decorative icons
- The SVG `width` / `height` attributes are overridden by size classes, but `viewBox` must always be specified
