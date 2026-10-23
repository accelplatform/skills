---
paths:
  - "src/main/jssp/**/*.html"
---

# TextboxControl

## Overview

TextboxControl is a component used to place an icon inside a textbox.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textboxcontrol--documentation
- Base class: imds-textbox-control

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-textbox-control | div element | Textbox control container | Required |
| is-left | imds-textbox-control | Place icon on the left | Optional |
| is-right | imds-textbox-control | Place icon on the right (default) | Optional |
| is-static | input.imds-textbox (inner) | Read-only static display state (used with `readonly`; a Textbox class) | Optional |
| is-x-small | input.imds-textbox (inner) | Extra small size | Optional |
| is-small | input.imds-textbox (inner) | Small size | Optional |
| is-normal | input.imds-textbox (inner) | Normal size | Optional |
| is-medium | input.imds-textbox (inner) | Medium size | Optional |
| is-large | input.imds-textbox (inner) | Large size | Optional |

## HTML Snippets

### Basic Textbox Control

```html
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

The following sections show only the differences from the basic textbox control.

## Variations

### iconPosition (Icon Position)

Add a position class to `div.imds-textbox-control`.

```html
<div class="imds-textbox-control is-left">   <!-- Icon left -->
<div class="imds-textbox-control is-right">  <!-- Icon right -->
```

### is-static (Read-Only Static Display, on the Inner input)

A read-only state where the value cannot be edited but can be selected and copied. Add the `is-static` class and the `readonly` attribute to `input.imds-textbox` (not to the `imds-textbox-control` container itself).

```html
<div class="imds-textbox-control">
  <input
    type="text"
    class="imds-textbox is-static"
    readonly
    value="text" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

### size (Size, on the Inner input)

Add a size class to `input.imds-textbox`. For a balanced look, give the icon a class one step smaller than the input (e.g. an `is-medium` icon for an `is-large` input).

```html
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox is-x-small" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox is-large" value="" />
  <span class="imds-icon is-medium"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

## Combination Examples

### Simple Search Field

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

### Search Icon + Clear Button

Place the textbox control and a clear button inside a Field.

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Category</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" placeholder="Select a category" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### Combobox (Free Input + Choice Display)

Combine with Popover to implement dropdown selection.

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Category</label></div>
  <div class="imds-field-control">
    <div class="imds-popover">
      <div class="imds-textbox-control">
        <input type="text" placeholder="Select a category" class="imds-textbox" readonly value="" />
        <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
      </div>
      <div id="todo-replace-popover" role="menu" class="imds-popover-menu">
        <div class="imds-popover-content">contents</div>
      </div>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### Validation Error

Add `imds-validation-error` to `div.imds-field` and append an error message at the end.
Applicable to both the search icon type and the combobox type.

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
  <span class="imds-error-text">Error message is displayed here.</span>
</div>
```

## Accessibility

- Use the icon for decorative purposes, and convey the meaning of the operation through the label or placeholder

## Implementation Notes

- Describe textbox control with the structure `div.imds-textbox-control > input.imds-textbox + span.imds-icon`
- The default icon position is on the right (`is-right` can be omitted)
- Add `is-static` / size classes (`is-x-small` to `is-large`) to the inner `input.imds-textbox`, not to `imds-textbox-control`
- Place the clear button in parallel with `imds-textbox-control` inside `imds-field-control`
- Wrap `imds-textbox-control` with Popover (`imds-popover`) for a combobox
- On validation error, add `imds-validation-error` to `imds-field` and display the message with `imds-error-text`
