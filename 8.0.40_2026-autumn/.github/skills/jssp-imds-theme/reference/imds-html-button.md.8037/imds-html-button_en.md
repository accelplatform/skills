---
paths:
  - "src/main/jssp/**/*.html"
---

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
| is-applied | imds-button | Shows an "applied" badge (available only when an icon is present) | Optional |

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

### applied (Applied Badge)

A badge indicating that search conditions or similar are applied in an area whose visibility is toggled by a button click, such as an advanced search area. Available only when an icon is present.

```html
<button type="button" class="imds-button is-applied" title="">
  <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
  <span class="imds-button-text">Button</span>
</button>
```

## Combination Examples

### Combination with Icon

For details on buttons with icons, see [imds-html-icon-button.md](imds-html-icon-button.md).
When using both icon and text, always wrap the text with `imds-button-text`.

```html
<button type="button" class="imds-button is-primary">
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  <span class="imds-button-text">Search</span>
</button>
```

### Minimum Width (min-width)

When the button label is short, such as "Register/Update", specify the minimum width with an inline `style="min-width: 8em;"` to make the button easier to press and more visible (do not define custom classes such as `min-width-8em`; see "Anti-pattern: Do Not Define Custom `.max-width-NNem` / `.min-width-NNem` Classes" in `.github/instructions/jssp-presentation-page.instructions.md`).

```html
<button type="button" class="imds-button is-primary" style="min-width: 8em;">Register</button>
```

### Page-Level Actions (Fixed Footer)

Group page-level action buttons such as "Register", "Update" and "Delete" at the bottom of the page in a fixed footer outside the scroll area (`pgstyle-layout-footer`; see "Implementation Notes" in `assets/imds-form-page.md` for the CSS definition). `pgstyle-layout-footer` leaves 2em between buttons. For auxiliary actions (such as "Copy as New"), widen the gap from the main buttons with `style="margin-left: 3em;"` to reduce complexity.

```html
<div class="pgstyle-layout-footer imds-py-2 imds-px-8 imds-border-t-1">
  <button type="button" class="imds-button is-primary" style="min-width: 8em;">Update</button>
  <button type="button" class="imds-button is-outlined is-danger" style="min-width: 8em;">Delete</button>
  <button type="button" class="imds-button is-outlined is-primary" style="min-width: 8em; margin-left: 3em;">Copy as New</button>
</div>
```

### Toolbar

When lining up buttons in a toolbar, leave 1em between them (e.g. `style="display: flex; gap: 1em;"` on the parent element). For the action area of a list screen that lines up a search field and a "Create New" button, use `pgstyle-toolbar` from `assets/imds-list-page.md`.

```html
<div style="display: flex; gap: 1em;">
  <button type="button" class="imds-button is-primary" style="min-width: 8em;">Create New</button>
  <button type="button" class="imds-button is-outlined" style="min-width: 8em;">Export</button>
</div>
```

## Implementation Notes

- When using both icon and text, always wrap the text in `<span class="imds-button-text">`. Do not place text nodes directly. See [imds-html-icon-button.md](imds-html-icon-button.md) for details
- `is-outlined` and `is-ghost` are used exclusively (do not apply both simultaneously)
- Color classes and style classes can be combined (e.g., `is-outlined is-primary`, `is-ghost is-danger`)
- **One primary-colored button per screen**: Apply a colored standard button (solid `is-primary` / `is-danger` button) only to the single most important button in a screen or dialog. Do not place multiple colored standard buttons in the same screen or dialog (when there are multiple independent content areas, as in a portal, one per area is allowed). Use `is-outlined is-primary` (outlined) for auxiliary actions such as "Save Draft", and do not mix them with a solid `is-primary`
  - ✅ OK: `is-primary` (Register) + `is-outlined is-primary` (Save Draft)
  - ❌ NG: `is-primary` (Register) + `is-primary` (Save Draft) — results in two primary buttons
- When placing buttons side by side, use the same size (do not mix `is-large` etc. with other sizes)
