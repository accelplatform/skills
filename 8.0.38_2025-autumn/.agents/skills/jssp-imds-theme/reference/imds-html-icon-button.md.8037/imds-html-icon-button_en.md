# IconButton

## Overview

IconButton is a button component with an icon.
Use it in places where you want more visual emphasis than text-only buttons, as icons help direct the user's gaze.
For common usage and notes about Button, refer to Button.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-button-iconbutton--documentation
- Base class: imds-button
- For details on the basic button, see [button](button.md)

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-button | button element | Button element | Required |
| imds-button-text | span element | Wrapper for button text | Required |
| imds-icon | span element | Wrapper for icon | Required |
| is-x-small | imds-icon | Extra small size for icon (for right chevron) | Optional |
| is-outlined | imds-button | Light display style with border only | Optional |
| is-ghost | imds-button | Transparent style with no border | Optional |
| is-primary | imds-button | Primary color | Optional |
| is-danger | imds-button | Color for dangerous actions | Optional |
| is-dark | imds-button | Dark color | Optional |
| is-x-small | imds-button | Extra small size | Optional |
| is-small | imds-button | Small size | Optional |
| is-normal | imds-button | Normal size | Optional |
| is-medium | imds-button | Medium size | Optional |
| is-large | imds-button | Large size | Optional |
| is-applied | imds-button | Style for applied state | Optional |

## HTML Snippets

### Basic Icon Button

```html
<button
  type="button"
  class="imds-button">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span class="imds-button-text">Button</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>
```

Left icon and right icon can each be omitted. All subsequent snippets show only the differences from the basic icon button.

## Variations

### title (Tooltip)

Add the `title` attribute to the `button` element.

```html
<button type="button" class="imds-button" title="description">
```

### buttonStyle (Border)

```html
<button type="button" class="imds-button is-outlined">  <!-- Border only -->
<button type="button" class="imds-button is-ghost">     <!-- No border -->
```

### color (Color)

Can be combined with `is-outlined` or `is-ghost`.

```html
<button type="button" class="imds-button is-primary">  <!-- Primary -->
<button type="button" class="imds-button is-danger">   <!-- Danger -->
<button type="button" class="imds-button is-dark">     <!-- Dark -->
```

### size (Size)

```html
<button type="button" class="imds-button is-x-small">  <!-- Extra small -->
<button type="button" class="imds-button is-small">    <!-- Small -->
<button type="button" class="imds-button is-normal">   <!-- Normal -->
<button type="button" class="imds-button is-medium">   <!-- Medium -->
<button type="button" class="imds-button is-large">    <!-- Large -->
```

### isApplied (Applied State)

Style indicating that a filter or similar setting has been applied.
A small badge is displayed at the upper right of the left icon.

```html
<button type="button" class="imds-button is-applied">
```

### disabled (Disabled State)

Add the `disabled` attribute to the `button` element. Not clickable; visually grayed out.

```html
<button type="button" class="imds-button" disabled>
```
