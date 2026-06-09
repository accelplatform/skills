---
paths:
  - "src/main/jssp/**/*.html"
---

# BannerMessage

## Overview

BannerMessage is a component for presenting information about the page's content at the top of a screen or specific area.
For common usage and notes about Message components, refer to the Documentation.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-message-bannermessage--documentation
- Base class: imds-banner-message

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-banner-message | div element | Banner message container | Required |
| imds-message-title | div element | Title area (icon + text) | Optional |
| imds-message-content | div element | Message body | Optional |
| imds-message-content-only | imds-banner-message | Display content only (no title) | Optional |
| is-info | imds-banner-message | Information (blue) | Optional |
| is-warning | imds-banner-message | Warning (yellow) | Optional |
| is-danger | imds-banner-message | Danger (red) | Optional |
| is-success | imds-banner-message | Success (green) | Optional |
| is-error | imds-banner-message | Error (red) | Optional |

## HTML Snippets

### Basic Banner Message

```html
<div class="imds-banner-message">
  <div class="imds-message-title">
    <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
    <p>Create New Application</p>
  </div>
  <div class="imds-message-content">
    <p>Register multiple resources together as a single application.</p>
    <p>Please enter the application information to create.</p>
  </div>
</div>
```

The following shows only the differences from the basic banner message.

## Variations

### color (Color)

Add a color class to `div.imds-banner-message`.
Change the icon to match the color.

```html
<div class="imds-banner-message is-info">     <!-- Information: fa-circle-info -->
<div class="imds-banner-message is-warning">  <!-- Warning: fa-triangle-exclamation -->
<div class="imds-banner-message is-danger">   <!-- Danger: fa-triangle-exclamation -->
<div class="imds-banner-message is-success">  <!-- Success: fa-circle-check -->
<div class="imds-banner-message is-error">    <!-- Error: fa-circle-xmark -->
```

### pattern (Display Pattern)

#### title-only (Title Only)

Omit `imds-message-content`.

```html
<div class="imds-banner-message">
  <div class="imds-message-title">
    <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
    <p>Create New Application</p>
  </div>
</div>
```

#### content-only (Content Only)

Add `imds-message-content-only` and omit `imds-message-title`. Place the icon directly before `imds-message-content`.

```html
<div class="imds-banner-message imds-message-content-only">
  <span class="imds-icon"><i class="fa-solid fa-circle-info"></i></span>
  <div class="imds-message-content">
    <p>Register multiple resources together as a single application.</p>
  </div>
</div>
```

## Implementation Notes

- Use the appropriate icon for each color class (see the color section above)
- The class names `imds-message-title` and `imds-message-content` are shared with the Message component
- The `content-only` pattern has a different structure (use icon directly without `imds-message-title`)
- BannerMessage is intended for fixed placement at the top of the screen. Use Message for normal inline display
