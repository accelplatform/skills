# Field

## Overview

Field is a component for users to input or select data.
Used as a constituent element of forms.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-field-field--documentation
- Base class: imds-field

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-field | Outer div | Field container | Required |
| imds-field-label | div element | Label area | Required |
| imds-field-control | div element | Control area | Required |
| is-vertical | imds-field | Vertical layout (label on top) | Optional |
| is-horizontal | imds-field | Horizontal layout (label on left) | Optional |
| imds-w-15 | imds-field | Label width 15% | Optional |
| imds-w-25 | imds-field | Label width 25% | Optional |
| imds-w-30 | imds-field | Label width 30% | Optional |
| imds-w-150px | imds-field | Label width 150px | Optional |
| imds-w-250px | imds-field | Label width 250px | Optional |
| imds-required-label-required-asterisk | label element | Asterisk (*) required mark | Optional |
| imds-required-label-required | label element | "Required" text mark | Optional |
| imds-required-label-optional | label element | "Optional" text mark | Optional |
| imds-validation-error | imds-field | Validation error state | Optional |
| imds-help-text | span element | Help text | Optional |
| imds-error-text | span element | Error message | Optional |

## HTML Snippets

### Basic Field

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label
      data-required-label="default"
      for=":r1:">
      Label
    </label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r1:"
      class="imds-textbox"
      value="" />
  </div>
</div>
```

All subsequent snippets show only the differences from the basic field.

## Variations

### alignment (Layout Direction)

Add a class to `div.imds-field`.

```html
<div class="imds-field is-vertical">    <!-- Vertical (label on top) -->
<div class="imds-field is-horizontal">  <!-- Horizontal (label on left) -->
```

### labelWidth (Label Width)

Add a class to `div.imds-field`.
Effective for horizontal layout.

```html
<div class="imds-field imds-w-15">     <!-- 15% -->
<div class="imds-field imds-w-25">     <!-- 25% -->
<div class="imds-field imds-w-30">     <!-- 30% -->
<div class="imds-field imds-w-150px">  <!-- 150px -->
<div class="imds-field imds-w-250px">  <!-- 250px -->
```

### required (Required/Optional Mark)

Add a class and `data-required-label` attribute to the `label` element.

```html
<!-- Asterisk (*) -->
<label class="imds-required-label-required-asterisk" for=":r1:">Label</label>

<!-- "Required" mark -->
<label class="imds-required-label-required" for=":r1:" data-required-label="Required">Label</label>

<!-- "Optional" mark -->
<label class="imds-required-label-optional" for=":r1:" data-required-label="Optional">Label</label>
```

## Combination Examples

### Help Text

Add `imds-help-text` at the end of `imds-field`.

```html
<div class="imds-field">
  <!-- imds-field-label, imds-field-control are omitted -->
  <span class="imds-help-text">Up to 50 alphanumeric characters.</span>
</div>
```

### Validation Error

Add `imds-validation-error` to `div.imds-field` and append `imds-error-text` at the end.

```html
<div class="imds-field imds-validation-error">
  <!-- imds-field-label, imds-field-control are omitted -->
  <span class="imds-error-text">Error message is displayed here.</span>
</div>
```

## Implementation Notes

- Match the `for` attribute of `label` with the `id` attribute of `input` (`:r1:` is a placeholder)
- `data-required-label="default"` is the default required display (no mark)
- Place `imds-help-text` and `imds-error-text` after `imds-field-control`
- Adding `imds-validation-error` also changes the border of the input control to red
