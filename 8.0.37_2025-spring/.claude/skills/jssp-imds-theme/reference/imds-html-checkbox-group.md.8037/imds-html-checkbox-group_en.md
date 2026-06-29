---
paths:
  - "src/main/jssp/**/*.html"
---

# CheckboxGroup

## Overview

CheckboxGroup is a component that controls the layout direction of Checkboxes.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-checkboxgroup--documentation
- Base class: imds-checkbox-group

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-checkbox-group | div element | Checkbox group container | Required |
| is-vertical | imds-checkbox-group | Vertical layout | Optional |
| is-horizontal | imds-checkbox-group | Horizontal layout | Optional |

## HTML Snippets

### Basic Checkbox Group

```html
<div class="imds-checkbox-group">
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span>Label-1</span>
  </label>
  <label class="imds-checkbox">
    <input type="checkbox" />
    <span>Label-2</span>
  </label>
  <!-- Repeat label structure as many times as needed -->
</div>
```

All subsequent snippets show only the differences from the basic checkbox group.

## Variations

### alignment (Layout Direction)

Add a layout class to `div.imds-checkbox-group`.

```html
<div class="imds-checkbox-group is-vertical">    <!-- Vertical -->
<div class="imds-checkbox-group is-horizontal">  <!-- Horizontal -->
```

## Combination Examples

### Combination with Label

When placing in an input form, wrap with Field.

```html
<div class="imds-field">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-checkbox-group is-vertical">
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>Label-1</span>
      </label>
      <!-- Repeat label structure as many times as needed -->
    </div>
  </div>
</div>
```

### Validation Error

Add `imds-validation-error` to `div.imds-field` and append an error message at the end.

```html
<div class="imds-field imds-validation-error">
  <div class="imds-field-label"><label for="todo-replace-:r1:">Label</label></div>
  <div class="imds-field-control">
    <div class="imds-checkbox-group is-vertical">
      <label class="imds-checkbox">
        <input type="checkbox" />
        <span>Label-1</span>
      </label>
      <!-- Repeat label structure as many times as needed -->
    </div>
  </div>
  <span class="imds-error-text">Error message is displayed here.</span>
</div>
```

## Accessibility

- When there are many items spanning multiple lines, arrange them at equal intervals to improve visibility

## Implementation Notes

- Write checkbox groups in the structure `div.imds-checkbox-group > label.imds-checkbox`
- The structure of each checkbox conforms to the Checkbox component
- Wrap with Field (`imds-field`) when used in an input form
- On validation error, add `imds-validation-error` to `imds-field` and display the message with `imds-error-text`
