---
paths:
  - "src/main/jssp/**/*.html"
---

# Message

## Overview

Message is a component for presenting information that you want users to read.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-message-message--documentation
- Base class: imds-message

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-message | div element | Message container | Required |
| imds-message-title | div element | Title area (icon + text) | Required |
| imds-message-content | div element | Message body | Optional |
| is-outlined | imds-message | Outline style | Optional |
| is-borderless | imds-message | Borderless style | Optional |
| is-info | imds-message | Info (blue) | Optional |
| is-warning | imds-message | Warning (yellow) | Optional |
| is-danger | imds-message | Danger (red) | Optional |
| is-success | imds-message | Success (green) | Optional |
| is-error | imds-message | Error (red) | Optional |

## HTML Snippets

### Basic message

```html
<div class="imds-message">
  <div class="imds-message-title">
    <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
    <p>About Cache</p>
  </div>
  <div class="imds-message-content">
    <p>Caches enumeration types, dictionary items, entities, and other information used in IM-Repository.</p>
  </div>
</div>
```

The following sections show only the differences from the basic message.

## Variations

### style

Add a style class to `div.imds-message`.

```html
<div class="imds-message is-outlined">    <!-- Outline -->
<div class="imds-message is-borderless">  <!-- Borderless -->
```

### color

Add a color class to `div.imds-message`.
Change the icon according to the color.

```html
<div class="imds-message is-info">     <!-- Info: fa-circle-info -->
<div class="imds-message is-warning">  <!-- Warning: fa-triangle-exclamation -->
<div class="imds-message is-danger">   <!-- Danger: fa-triangle-exclamation -->
<div class="imds-message is-success">  <!-- Success: fa-circle-check -->
<div class="imds-message is-error">    <!-- Error: fa-circle-xmark -->
```

### Title only (no body)

Omit `imds-message-content`.

```html
<div class="imds-message is-success">
  <div class="imds-message-title">
    <span class="imds-icon is-medium"><i class="fa-solid fa-circle-check"></i></span>
    <p>Entity and table information are consistent.</p>
  </div>
</div>
```

### Using a list in the body

Place a `<ul>` inside `imds-message-content`.

```html
<div class="imds-message-content">
  <ul>
    <li>Note 1</li>
    <li>Note 2</li>
  </ul>
</div>
```

## Implementation Notes

- Use the appropriate icon for each color class (see the color section above)
- `imds-message-content` is optional. Omit the body if the title alone is sufficient
- `is-outlined` and `is-borderless` are mutually exclusive (do not apply both simultaneously)
- The body can freely combine `<p>` and `<ul>`
