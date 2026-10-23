# FieldGroup

## Overview

FieldGroup is a component for grouping multiple Fields together.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-field-fieldgroup--documentation
- Base class: imds-field-group
- For details on individual fields, see [imds-html-field.md](imds-html-field.md)

## Overall Structure

```
imds-field-group                          # Whole group (apply is-vertical / is-horizontal + label-width class)
├── imds-field-group-label                # Group label area
│   └── span                              # Label text (may carry required/optional marker class)
├── imds-field-group-control              # Field placement area within the group (is-vertical / is-horizontal)
│   ├── imds-field                        # Individual Field (apply imds-validation-error on error)
│   │   ├── imds-field-label
│   │   └── imds-field-control
│   ├── imds-field                        # Repeat as needed (ids must be unique)
│   └── ...
├── imds-help-text                        # Help text (optional, placed at the end)
└── imds-error-text                       # Error message (optional, placed at the end)
```

Place `imds-help-text` / `imds-error-text` **after `imds-field-group-control`** (at the end of the group). Apply `imds-validation-error` to the individual `imds-field`, not to the group.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-field-group | Outer div | Field group container | Required |
| imds-field-group-label | div element | Group label area | Required |
| imds-field-group-control | div element | Group control area (where Fields are placed) | Required |
| is-vertical | imds-field-group | Vertical layout (label on top) | Optional |
| is-horizontal | imds-field-group | Horizontal layout (label on left) | Optional |
| is-vertical | imds-field-group-control | Vertical layout of Fields within the group | Optional |
| is-horizontal | imds-field-group-control | Horizontal layout of Fields within the group | Optional |
| imds-w-15 | imds-field-group | Label width 15% | Optional |
| imds-w-25 | imds-field-group | Label width 25% | Optional |
| imds-w-30 | imds-field-group | Label width 30% | Optional |
| imds-w-150px | imds-field-group | Label width 150px | Optional |
| imds-w-250px | imds-field-group | Label width 250px | Optional |
| imds-required-label-required-asterisk | span element | Asterisk (*) required mark | Optional |
| imds-required-label-required | span element | "Required" text mark | Optional |
| imds-required-label-optional | span element | "Optional" text mark | Optional |
| imds-help-text | span element | Help text | Optional |
| imds-error-text | span element | Error message | Optional |
| imds-validation-error | imds-field | Validation error state (applied to individual Field) | Optional |
| imds-field-container | Outer div | Container that stacks FieldGroups vertically (required at the first level) | Required (when placed at the first level) |

## HTML Snippets

### Basic Field Group

```html
<div class="imds-field-group">
  <div class="imds-field-group-label"><span>Group Label</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field">
      <div class="imds-field-label"><label for=":r1:">Label</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r1:" class="imds-textbox" value="" />
      </div>
    </div>
    <!-- Repeat imds-field as needed (id must be unique) -->
  </div>
</div>
```

All subsequent snippets show only the differences from the basic field group.

## Variations

### alignment (Overall Group Layout Direction)

Add a class to `div.imds-field-group`.

```html
<div class="imds-field-group is-vertical">    <!-- Vertical (label on top) -->
<div class="imds-field-group is-horizontal">  <!-- Horizontal (label on left) -->
```

### groupControlAlignment (Field Layout Direction within Group)

Add a class to `div.imds-field-group-control`.

```html
<div class="imds-field-group-control is-vertical">    <!-- Fields arranged vertically -->
<div class="imds-field-group-control is-horizontal">  <!-- Fields arranged horizontally -->
```

### labelWidth (Label Width)

Add a class to `div.imds-field-group`.
Effective for horizontal layout.

```html
<div class="imds-field-group imds-w-15">     <!-- 15% -->
<div class="imds-field-group imds-w-25">     <!-- 25% -->
<div class="imds-field-group imds-w-30">     <!-- 30% -->
<div class="imds-field-group imds-w-150px">  <!-- 150px -->
<div class="imds-field-group imds-w-250px">  <!-- 250px -->
```

### required (Required/Optional Mark)

Add a class and `data-required-label` attribute to the `span` element inside `imds-field-group-label`.

```html
<!-- Asterisk (*) -->
<span class="imds-required-label-required-asterisk">Group Label</span>

<!-- "Required" mark -->
<span class="imds-required-label-required" data-required-label="Required">Group Label</span>

<!-- "Optional" mark -->
<span class="imds-required-label-optional" data-required-label="Optional">Group Label</span>
```

## Combination Examples

### Help Text

Add `imds-help-text` at the end of `imds-field-group` (after `imds-field-group-control`).

```html
<div class="imds-field-group">
  <!-- imds-field-group-label, imds-field-group-control are omitted -->
  <span class="imds-help-text">Up to 50 alphanumeric characters.</span>
</div>
```

### Validation Error

Add `imds-validation-error` to individual `div.imds-field` and add `imds-error-text` at the end of `imds-field-group`.

```html
<div class="imds-field-group">
  <!-- imds-field-group-label is omitted -->
  <div class="imds-field-group-control">
    <div class="imds-field imds-validation-error">
      <!-- Field content -->
    </div>
  </div>
  <span class="imds-error-text">Error message is displayed here.</span>
</div>
```

### Width of Horizontally Arranged Fields and Error Display

As a rule, specify the width of an input directly on the `input` / `select` with `style="max-width: …"`. Only when arranging Fields horizontally with `imds-field-group-control is-horizontal`, specify the width on each `div.imds-field` instead (specifying it on the input elements creates unnatural gaps between the inputs).

If the width of `div.imds-field` is less than 10em, display the error message (`imds-error-text`) after `imds-field-group-control` (at the end of the group) rather than per field (with a narrow width, the message wraps many times and becomes hard to read). Even at 10em or more, it may be displayed at the end of the group if the message is long and hard to read. When listing errors for multiple fields, place one `imds-error-text` per field. Apply `imds-validation-error` to the individual `imds-field` as usual.

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Quantity</span></div>
  <div class="imds-field-group-control is-horizontal">
    <div class="imds-field" style="max-width: 8em;">
      <div class="imds-field-label"><label for=":r10:">Unit Price</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r10:" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field imds-validation-error" style="max-width: 8em;">
      <div class="imds-field-label"><label for=":r11:">Stock Quantity</label></div>
      <div class="imds-field-control">
        <input type="text" id=":r11:" class="imds-textbox" value="" />
      </div>
    </div>
  </div>
  <span class="imds-error-text">Enter a number of 0 or more for Stock Quantity.</span>
</div>
```

### Wrapping with field-container

When placing a FieldGroup at the first level of a form, wrap it with `imds-field-container`, as with Field. For details on `imds-field-container` (`has-divider` / `has-accent-color` / automatic vertical stacking below 768px), see the "Field Container" section of [imds-html-field.md](imds-html-field.md).

```html
<form class="imds-form">
  <div class="imds-field-container">
    <div class="imds-field-group is-horizontal imds-w-15">
      <div class="imds-field-group-label"><span>Address</span></div>
      <div class="imds-field-group-control">
        <div class="imds-field">
          <div class="imds-field-label">
            <label class="imds-required-label-required-asterisk" for=":r8:">Prefecture</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":r8:" class="imds-textbox" value="" />
          </div>
        </div>
        <div class="imds-field">
          <div class="imds-field-label">
            <label class="imds-required-label-required-asterisk" for=":r9:">City</label>
          </div>
          <div class="imds-field-control">
            <input type="text" id=":r9:" class="imds-textbox" value="" />
          </div>
        </div>
      </div>
    </div>
  </div>
</form>
```

## Implementation Notes

- Assign unique values to each Field's `id` within the group (`:r1:` etc. are placeholders)
- Place `imds-help-text` and `imds-error-text` after `imds-field-group-control`
- Apply `imds-validation-error` to individual `imds-field`, not to the group
- Only when arranging Fields horizontally with `imds-field-group-control is-horizontal`, specify the width on `div.imds-field` rather than on the input elements (see "Width of Horizontally Arranged Fields and Error Display")
- When placing multiple `imds-field` inside `imds-field-group-control is-horizontal`, keep the presence/absence of `imds-field-label` consistent within the group. Mixing labeled and non-labeled fields will break the layout
  - If all fields have labels, set the group heading in `imds-field-group-label`
  - If unified without labels, set a representative item name in `imds-field-group-label`
- **One input component principle**: A FieldGroup consists of Fields (each Field holds only a single input component). Do not nest FieldGroups
- **field-container required principle**: When placing a FieldGroup at the first level of a form, always wrap it with `imds-field-container`, as with Field
- A FieldGroup directly under `imds-field-container` automatically stacks its label and control vertically at a viewport width of 768px or less, even if `is-horizontal` is specified. This does not apply at the second level or below, or when used standalone
- For detailed usage of Field, see [imds-html-field.md](imds-html-field.md)
