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

## HTML Snippets

### Basic textbox control

```html
<div class="imds-textbox-control">
  <input type="text" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

The following sections show only the differences from the basic textbox control.

## Variations

### iconPosition (icon position)

Add a position class to `div.imds-textbox-control`.

```html
<div class="imds-textbox-control is-left">   <!-- Icon left -->
<div class="imds-textbox-control is-right">  <!-- Icon right -->
```

## Combination Examples

### Simple search field

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" value="" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

### Search icon + clear button

Place textbox control and clear button inside a Field.

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

### Combobox (free input + dropdown)

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
      <div id="imds-popover-todo-replace-:r1:" role="menu" class="imds-popover-menu">
        <div class="imds-popover-content">contents</div>
      </div>
    </div>
    <button type="button" class="imds-button is-ghost">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

### Validation error

Add `imds-validation-error` to `div.imds-field` and append an error message at the end.
Applicable to both search icon type and combobox type.

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
- Place the clear button in parallel with `imds-textbox-control` inside `imds-field-control`
- Wrap `imds-textbox-control` with Popover (`imds-popover`) for a combobox
- On validation error, add `imds-validation-error` to `imds-field` and display the message with `imds-error-text`
