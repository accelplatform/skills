# CollapseMessage

## Overview

CollapseMessage is a component that keeps the title of information you want users to read always visible while keeping the detailed information collapsed.
For common usage and notes about Message components, refer to the Documentation.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-message-collapsemessage--documentation
- Base class: imds-collapse-message

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-collapse-message | div element | Collapsible message container | Required |
| imds-message-title | div element | Title area (icon + text) | Required |
| imds-message-content | div element | Collapsible content | Required |
| imds-collapse-message-chevron | span element | Open/close chevron icon | Required |
| is-outlined | imds-collapse-message | Outline style | Optional |
| is-borderless | imds-collapse-message | No border style | Optional |
| is-info | imds-collapse-message | Information (blue) | Optional |
| is-warning | imds-collapse-message | Warning (yellow) | Optional |
| is-danger | imds-collapse-message | Danger (red) | Optional |
| is-success | imds-collapse-message | Success (green) | Optional |
| is-error | imds-collapse-message | Error (red) | Optional |
| is-x-small | imds-collapse-message | Extra small size | Optional |
| is-small | imds-collapse-message | Small size | Optional |
| is-normal | imds-collapse-message | Normal size | Optional |
| is-medium | imds-collapse-message | Medium size | Optional |
| is-large | imds-collapse-message | Large size | Optional |

## HTML Snippets

### Basic Collapsible Message

```html
<div class="imds-collapse-message">
  <input
    type="checkbox"
    id="todo-replace-:r1:" />
  <label for="todo-replace-:r1:">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>Configure notification features and methods.</p>
    </div>
    <span class="imds-icon imds-collapse-message-chevron"><i class="fa-solid fa-chevron-down"></i></span>
  </label>
  <div class="imds-message-content">
    <ul>
      <li>In message notification settings, configure the media for receiving notifications for each feature.</li>
      <li>In general notification settings, configure the email address for receiving general notifications.</li>
    </ul>
  </div>
</div>
```

All subsequent snippets show only the differences from the basic collapsible message.

## Variations

### color (Color)

Add a color class to `div.imds-collapse-message`.
Change the icon to match the color.

```html
<div class="imds-collapse-message is-info">     <!-- Information: fa-circle-info -->
<div class="imds-collapse-message is-warning">  <!-- Warning: fa-triangle-exclamation -->
<div class="imds-collapse-message is-danger">   <!-- Danger: fa-triangle-exclamation -->
<div class="imds-collapse-message is-success">  <!-- Success: fa-circle-check -->
<div class="imds-collapse-message is-error">    <!-- Error: fa-circle-xmark -->
```

### messageStyle (Style)

Add a style class to `div.imds-collapse-message`.

```html
<div class="imds-collapse-message is-outlined">    <!-- Outline -->
<div class="imds-collapse-message is-borderless">  <!-- No border -->
```

### size (Size)

Add a size class to `div.imds-collapse-message`.

```html
<div class="imds-collapse-message is-x-small">  <!-- Extra small -->
<div class="imds-collapse-message is-small">    <!-- Small -->
<div class="imds-collapse-message is-normal">   <!-- Normal -->
<div class="imds-collapse-message is-medium">   <!-- Medium -->
<div class="imds-collapse-message is-large">    <!-- Large -->
```

## Implementation Notes

- Open/close is controlled by CSS only through the `input[type="checkbox"]` and `label` combination (no JavaScript required)
- Replace the `id` of `input` and `for` of `label` with unique values (`todo-replace-:r1:` is a placeholder)
- Use the appropriate icon for each color class (see the color section above)
- `is-outlined` and `is-borderless` are used exclusively (do not apply both simultaneously)
- The class names `imds-message-title` and `imds-message-content` are shared with the Message / BannerMessage components
