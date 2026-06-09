---
paths:
  - "src/main/jssp/**/*.html"
---

# InlineMessage

## Overview

InlineMessage is a component for presenting information you want users to read inline.
For common usage and notes about Message components, refer to the Documentation.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-message-inlinemessage--documentation
- Base class: imds-inline-message

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-inline-message | div element | Inline message container | Required |
| is-outlined | imds-inline-message | Outline style | Optional |
| is-borderless | imds-inline-message | No border style | Optional |
| is-info | imds-inline-message | Information (blue) | Optional |
| is-warning | imds-inline-message | Warning (yellow) | Optional |
| is-danger | imds-inline-message | Danger (red) | Optional |
| is-success | imds-inline-message | Success (green) | Optional |
| is-error | imds-inline-message | Error (red) | Optional |
| is-x-small | imds-inline-message | Extra small size | Optional |
| is-small | imds-inline-message | Small size | Optional |
| is-normal | imds-inline-message | Normal size | Optional |
| is-medium | imds-inline-message | Medium size | Optional |
| is-large | imds-inline-message | Large size | Optional |

## HTML Snippets

### Basic Inline Message

```html
<div class="imds-inline-message">
  <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
  <p>Drag and drop to reorder the schedule display sets.</p>
</div>
```

All subsequent snippets show only the differences from the basic inline message.

## Variations

### color (Color)

Add a color class to `div.imds-inline-message`.
Change the icon to match the color.

```html
<div class="imds-inline-message is-info">     <!-- Information: fa-circle-info -->
<div class="imds-inline-message is-warning">  <!-- Warning: fa-triangle-exclamation -->
<div class="imds-inline-message is-danger">   <!-- Danger: fa-triangle-exclamation -->
<div class="imds-inline-message is-success">  <!-- Success: fa-circle-check -->
<div class="imds-inline-message is-error">    <!-- Error: fa-circle-xmark -->
```

### messageStyle (Style)

Add a style class to `div.imds-inline-message`.

```html
<div class="imds-inline-message is-outlined">    <!-- Outline -->
<div class="imds-inline-message is-borderless">  <!-- No border -->
```

### size (Size)

Add a size class to `div.imds-inline-message`.

```html
<div class="imds-inline-message is-x-small">  <!-- Extra small -->
<div class="imds-inline-message is-small">    <!-- Small -->
<div class="imds-inline-message is-normal">   <!-- Normal -->
<div class="imds-inline-message is-medium">   <!-- Medium -->
<div class="imds-inline-message is-large">    <!-- Large -->
```

## Implementation Notes

- InlineMessage has a simple structure where icons and text are placed directly without using `imds-message-title` / `imds-message-content`
- Use the appropriate icon for each color class (see the color section above)
- `is-outlined` and `is-borderless` are used exclusively (do not apply both simultaneously)
- Suitable for compact use cases such as displaying validation messages directly below form input fields
