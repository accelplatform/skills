---
paths:
  - "src/main/jssp/**/*.html"
---

# Tag

## Overview

Tag is a component for concisely and visually representing meta information and status of screens and processes.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-tag--documentation
- Base class: imds-tag

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-tag | span element | Tag container | Required |
| is-rounded | imds-tag | Rounded style | Optional |
| is-blue | imds-tag | Blue | Optional |
| is-green | imds-tag | Green | Optional |
| is-red | imds-tag | Red | Optional |
| is-yellow | imds-tag | Yellow | Optional |
| is-orange | imds-tag | Orange | Optional |
| is-cyan | imds-tag | Cyan | Optional |
| is-gray | imds-tag | Gray | Optional |
| is-gray-light | imds-tag | Light gray | Optional |
| is-light | imds-tag | Light tone | Optional |
| is-dark | imds-tag | Dark tone | Optional |
| is-x-small | imds-tag | Extra small size | Optional |
| is-small | imds-tag | Small size | Optional |
| is-normal | imds-tag | Normal size | Optional |
| is-medium | imds-tag | Medium size | Optional |
| is-large | imds-tag | Large size | Optional |

## HTML Snippets

### Basic tag

```html
<span class="imds-tag"><span>text</span></span>
```

The following sections show only the differences from the basic tag.

## Variations

### tagStyle (style)

Add `is-rounded` to `span.imds-tag`.

```html
<span class="imds-tag is-rounded"><span>text</span></span>
```

### color

Add a color class to `span.imds-tag`.

```html
<span class="imds-tag is-blue">        <!-- Blue -->
<span class="imds-tag is-green">       <!-- Green -->
<span class="imds-tag is-red">         <!-- Red -->
<span class="imds-tag is-yellow">      <!-- Yellow -->
<span class="imds-tag is-orange">      <!-- Orange -->
<span class="imds-tag is-cyan">        <!-- Cyan -->
<span class="imds-tag is-gray">        <!-- Gray -->
<span class="imds-tag is-gray-light">  <!-- Light gray -->
```

### tone

Add a tone class to `span.imds-tag`. Used in combination with a color class.

```html
<span class="imds-tag is-blue is-light">  <!-- Light tone -->
<span class="imds-tag is-blue is-dark">   <!-- Dark tone -->
```

### size

Add a size class to `span.imds-tag`.

```html
<span class="imds-tag is-x-small">  <!-- Extra small -->
<span class="imds-tag is-small">    <!-- Small -->
<span class="imds-tag is-normal">   <!-- Normal -->
<span class="imds-tag is-medium">   <!-- Medium -->
<span class="imds-tag is-large">    <!-- Large -->
```

### closeIconExists (with delete button)

Add a delete button after the text.

```html
<span class="imds-tag">
  <span>text</span>
  <button title="Delete">
    <span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>
  </button>
</span>
```

## Combination Examples

### Combined with Icon

Add `imds-icon` before the text.

```html
<span class="imds-tag">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span>text</span>
</span>
```

## Implementation Notes

- Describe tags with the nested structure `span.imds-tag > span`
- Color, tone, and size can be combined (e.g. `is-blue is-light is-small`)
- `is-light` and `is-dark` are mutually exclusive (do not apply both simultaneously)
- Control delete button click events with JavaScript
- Icon and text can be used together; place the icon before the text
