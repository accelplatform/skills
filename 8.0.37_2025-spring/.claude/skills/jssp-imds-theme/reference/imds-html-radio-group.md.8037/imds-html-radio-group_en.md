---
paths:
  - "src/main/jssp/**/*.html"
---

# RadioGroup

## Overview

RadioGroup is a component that controls the layout direction of Radio buttons.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-radiogroup--documentation
- Base class: imds-radio-group

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-radio-group | div element | Radio button group container | Required |
| is-vertical | imds-radio-group | Vertical layout | Optional |
| is-horizontal | imds-radio-group | Horizontal layout | Optional |

## HTML Snippets

### Basic radio button group

```html
<div class="imds-radio-group">
  <label class="imds-radio">
    <input type="radio" name="todo-replace-:r1:" value="" />
    <span>Label-1</span>
  </label>
  <label class="imds-radio">
    <input type="radio" name="todo-replace-:r1:" value="" />
    <span>Label-2</span>
  </label>
  <!-- Repeat the same label structure as needed -->
</div>
```

The following sections show only the differences from the basic radio button group.

## Variations

### alignment (layout direction)

Add a layout class to `div.imds-radio-group`.

```html
<div class="imds-radio-group is-vertical">    <!-- Vertical -->
<div class="imds-radio-group is-horizontal">  <!-- Horizontal -->
```

## Combination Examples

### Combined with Label

When placing in an input form, wrap with Field.

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-vertical">
      <label class="imds-radio">
        <input type="radio" name="todo-replace-:r1:" value="" />
        <span>Label-1</span>
      </label>
      <!-- Repeat the same label structure as needed -->
    </div>
  </div>
</div>
```

### Validation error

Add `imds-validation-error` to `div.imds-field` and append an error message at the end.

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-radio-group is-vertical">
      <label class="imds-radio">
        <input type="radio" name="todo-replace-:r1:" value="" />
        <span>Label-1</span>
      </label>
      <!-- Repeat the same label structure as needed -->
    </div>
  </div>
  <span class="imds-error-text">Error message is displayed here.</span>
</div>
```

## Accessibility

- Add the same `name` attribute to all radio buttons in the same group to implement exclusive selection
- When there are many items spanning multiple rows, arrange them at equal intervals to improve visibility

## Implementation Notes

- Describe radio button groups with the structure `div.imds-radio-group > label.imds-radio`
- The structure of each radio button follows the Radio component
- Set the same `name` attribute for all `input` elements within the group
- When used in an input form, wrap with Field (`imds-field`)
- On validation error, add `imds-validation-error` to `imds-field` and display the message with `imds-error-text`
