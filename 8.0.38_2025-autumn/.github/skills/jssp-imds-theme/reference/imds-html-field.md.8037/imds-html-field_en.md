---
paths:
  - "src/main/jssp/**/*.html"
---

# Field

## Overview

Field is a component for users to input or select data.
Used as a constituent element of forms.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-field-field--documentation
- Base class: imds-field

## What Can Be Placed in a Field

Place **exactly one "single input component"** in a Field (inside `imds-field-control`). The following are eligible.

- Textbox
- Textarea
- Select
- Checkbox
- Popover
- CheckboxGroup (containing multiple Checkboxes)
- RadioGroup (containing multiple Radios)
- InputGroup
- TextboxControl

As an exception, when an input component is placed together with components that assist its operation (clear button, search assist button, etc.), treat them together as a "single input component".

```html
<!-- TextboxControl + clear button (treated as a single input component as an exception) -->
<div class="imds-field is-horizontal">
  <div class="imds-field-label">
    <label class="imds-required-label-required-asterisk" for=":r2:">Customer Number</label>
  </div>
  <div class="imds-field-control">
    <div class="imds-textbox-control">
      <input type="text" placeholder="Select a customer number" class="imds-textbox" readonly value="" />
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </div>
    <button type="button" class="imds-button is-ghost" title="Clear">
      <span class="imds-icon"><i class="fa-regular fa-xmark-circle"></i></span>
    </button>
  </div>
</div>
```

To group multiple input components, place multiple Fields side by side or use FieldGroup (see [imds-html-field-group.md](imds-html-field-group.md)). Do not nest Fields.

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
| imds-field-container | Outer div | Container that stacks Fields / FieldGroups vertically (required at the first level) | Required (when placing multiple Fields) |
| has-divider | imds-field-container | Displays a separator line for each row | Optional |
| has-accent-color | imds-field-container | Applies an accent color to labels | Optional |

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

### Placing Multiple Fields (Wrap with imds-field-container)

When placing multiple Fields / FieldGroups, always wrap them with `imds-field-container`. Do not wrap them with a generic `<div style="display: flex; ...">` or similar.

```html
<div class="imds-field-container">
  <div class="imds-field">
    <div class="imds-field-label">
      <label class="imds-required-label-required-asterisk" for=":r9:">Label</label>
    </div>
    <div class="imds-field-control">
      <input type="text" id=":r9:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field">
    <div class="imds-field-label"><label for=":ra:">Label</label></div>
    <div class="imds-field-control">
      <input type="text" id=":ra:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

For details on `imds-field-container` (`has-divider` / `has-accent-color` variants), see the "Field Container" section below.

## Field Container (imds-field-container)

`imds-field-container` is a container element that stacks multiple Fields / FieldGroups vertically with appropriate spacing. Always wrap the Fields / FieldGroups placed at the first level of a form with `imds-field-container`.

```html
<div class="imds-field-container">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r0:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r0:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r1:">Label 2</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r1:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### has-divider (Row Separator Lines)

Displays lines separating form components by row, and separator lines between labels and form components. Use it for form screens with many input items used by administrators.

```html
<div class="imds-field-container has-divider">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r2:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r2:" class="imds-textbox" value="" />
    </div>
  </div>
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r3:">Label 2</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r3:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### has-accent-color (Accent Color)

Displays form label backgrounds and text in an accent color. Use it for form screens with many input items used by general users.

```html
<div class="imds-field-container has-accent-color">
  <div class="imds-field is-horizontal">
    <div class="imds-field-label"><label for=":r4:">Label 1</label></div>
    <div class="imds-field-control">
      <input type="text" id=":r4:" class="imds-textbox" value="" />
    </div>
  </div>
</div>
```

### Responsive Behavior (Automatic Vertical Stacking Below 768px)

For Fields placed directly under `imds-field-container`, when the browser viewport width is 768px or less, the label and form component automatically align vertically even if `is-horizontal` is specified. Note that elements at the second level and below, and Fields used standalone (outside `imds-field-container`), are not covered by this automatic responsive behavior.

```html
<div class="imds-field-container">
  <div class="imds-field is-horizontal imds-validation-error">
    <div class="imds-field-label">
      <label class="imds-required-label-required-asterisk" for=":rb:">Label</label>
    </div>
    <div class="imds-field-control">
      <input type="text" id=":rb:" class="imds-textbox" value="" />
    </div>
    <span class="imds-help-text">Up to 50 alphanumeric characters.</span>
    <span class="imds-error-text">Error message is displayed here.</span>
  </div>
</div>
```

## Implementation Notes

- Match the `for` attribute of `label` with the `id` attribute of `input` (`:r1:` is a placeholder)
- `data-required-label="default"` is the default required display (no mark)
- Place `imds-help-text` and `imds-error-text` after `imds-field-control`
- Adding `imds-validation-error` also changes the border of the input control to red
- **One input component per Field**: Place exactly one "single input component" in `imds-field-control` (see "What Can Be Placed in a Field" at the top of this file for details)
- **field-container is required**: When placing multiple Fields / FieldGroups at the first level of a form, always wrap them with `imds-field-container`. Do not substitute a generic `<div style="display: flex; ...">` or similar
- Fields / FieldGroups directly under `imds-field-container` stack vertically below 768px (see the "Field Container" section for details)
