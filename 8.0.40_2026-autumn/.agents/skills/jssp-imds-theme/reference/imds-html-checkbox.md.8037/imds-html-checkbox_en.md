# Checkbox

## Overview

Checkbox is a component used to select items from a list of options.
Unlike Radio, selection is not mandatory.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-checkbox--documentation
- Base class: imds-checkbox

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-checkbox | label element | Checkbox container | Required |
| is-x-small | imds-checkbox | Extra small size | Optional |
| is-small | imds-checkbox | Small size | Optional |
| is-normal | imds-checkbox | Normal size | Optional |
| is-medium | imds-checkbox | Medium size | Optional |
| is-large | imds-checkbox | Large size | Optional |

## HTML Snippets

### Basic Checkbox

```html
<label class="imds-checkbox">
  <input type="checkbox" />
  <span>Label</span>
</label>
```

All subsequent snippets show only the differences from the basic checkbox.

## Variations

### disabled

Add the `disabled` attribute to `input`.

```html
<input type="checkbox" disabled />
```

### checked (Checked State)

Add the `checked` attribute to `input`.

```html
<input type="checkbox" checked />
```

### size (Size)

Add a size class to `label.imds-checkbox`.

```html
<label class="imds-checkbox is-x-small">  <!-- Extra small -->
<label class="imds-checkbox is-small">    <!-- Small -->
<label class="imds-checkbox is-normal">   <!-- Normal -->
<label class="imds-checkbox is-medium">   <!-- Medium -->
<label class="imds-checkbox is-large">    <!-- Large -->
```

## Accessibility

- Associate the label by wrapping `input` with the `label` element
- Make the label text clearly convey the content of the option

## Implementation Notes

- Write checkboxes in the structure `label.imds-checkbox > input[type="checkbox"] + span`
- `disabled` and `checked` can be combined (e.g., checked and disabled)
- When grouping multiple checkboxes, use `fieldset` and `legend`
- Control checked state changes with JavaScript
