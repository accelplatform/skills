# Button

## Overview

Button is a component that users click to execute processes such as registration, search, or navigation to another screen.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-button-button--documentation
- Base class: imds-button

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-button | button element | Button element | Required |
| imds-button-text | span element | Button text (when used with icon) | Conditionally required |
| is-outlined | imds-button | Light display style with border only | Optional |
| is-ghost | imds-button | Transparent style with no border | Optional |
| is-primary | imds-button | Primary color for main actions | Optional |
| is-danger | imds-button | For dangerous actions such as deletion/warning | Optional |
| is-dark | imds-button | Dark color | Optional |
| is-x-small | imds-button | Extra small size | Optional |
| is-small | imds-button | Small size | Optional |
| is-normal | imds-button | Normal size | Optional |
| is-medium | imds-button | Medium size | Optional |
| is-large | imds-button | Large size | Optional |

## HTML Snippets

### Basic Button

```html
<button
  type="button"
  class="imds-button">
  Button
</button>
```

All subsequent snippets show only the differences from the basic button. All add a class or attribute to `button.imds-button`.

## Variations

### borderStyle (Border)

```html
<button type="button" class="imds-button is-outlined">Button</button>  <!-- Border only -->
<button type="button" class="imds-button is-ghost">Button</button>     <!-- No border -->
```

### color (Color)

Can be combined with `is-outlined` or `is-ghost`.

```html
<button type="button" class="imds-button is-primary">Button</button>  <!-- Primary -->
<button type="button" class="imds-button is-danger">Button</button>   <!-- Danger -->
<button type="button" class="imds-button is-dark">Button</button>     <!-- Dark -->
```

### size (Size)

```html
<button type="button" class="imds-button is-x-small">Button</button>  <!-- Extra small -->
<button type="button" class="imds-button is-small">Button</button>    <!-- Small -->
<button type="button" class="imds-button is-normal">Button</button>   <!-- Normal -->
<button type="button" class="imds-button is-medium">Button</button>   <!-- Medium -->
<button type="button" class="imds-button is-large">Button</button>    <!-- Large -->
```

### disabled (Disabled State)

Add the `disabled` attribute to the `button` element. Not clickable; visually grayed out.

```html
<button type="button" class="imds-button" disabled>Button</button>
```

## Combination Examples

### Combination with Icon

For details on buttons with icons, see [icon-button.md](icon-button.md).
When using both icon and text, always wrap the text with `imds-button-text`.

```html
<button type="button" class="imds-button is-primary">
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  <span class="imds-button-text">Search</span>
</button>
```

## Implementation Notes

- When using both icon and text, always wrap the text in `<span class="imds-button-text">`. Do not place text nodes directly. See [icon-button.md](icon-button.md) for details
- `is-outlined` and `is-ghost` are used exclusively (do not apply both simultaneously)
- Color classes and style classes can be combined (e.g., `is-outlined is-primary`, `is-ghost is-danger`)
