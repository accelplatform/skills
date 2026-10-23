---
paths:
  - "src/main/jssp/**/*.html"
---

# Select

## Overview

Select is a component used to select one item from a list of choices.
When choices are few or sufficient space is available, use Radio, which allows all items to be viewed at once.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-select--documentation
- Base class: imds-select

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-select | select element | Select box | Required |
| is-x-small | imds-select | Extra small size | Optional |
| is-small | imds-select | Small size | Optional |
| is-normal | imds-select | Normal size | Optional |
| is-medium | imds-select | Medium size | Optional |
| is-large | imds-select | Large size | Optional |
| is-static | imds-select | Read-only static display state (used with `disabled`) | Optional |

## HTML Snippets

### Basic Select Box

```html
<select class="imds-select">
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>
```

The following sections show only the differences from the basic select box.

## Variations

### disabled

Add the `disabled` attribute to `select`.

```html
<select class="imds-select" disabled>
```

### size (Size)

Add a size class to `select.imds-select`.

```html
<select class="imds-select is-x-small">  <!-- Extra small -->
<select class="imds-select is-small">    <!-- Small -->
<select class="imds-select is-normal">   <!-- Normal -->
<select class="imds-select is-medium">   <!-- Medium -->
<select class="imds-select is-large">    <!-- Large -->
```

### multiple (Multiple Selection)

Add the `multiple` attribute to `select`.

```html
<select class="imds-select" multiple>
```

### is-static (Read-Only Static Display)

A state where the value cannot be edited but is displayed for reference only. The HTML specification defines no `readonly` attribute for `<select>`, so combine the `is-static` class with the `disabled` attribute to achieve the read-only appearance (note that this differs from Textbox / Textarea, which use `readonly`).

```html
<!-- Single selection -->
<select class="imds-select is-static" disabled>
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>

<!-- Multiple selection -->
<select multiple class="imds-select is-static" disabled>
  <option>Select-1</option>
  <option>Select-2</option>
  <option>Select-3</option>
</select>
```

## Accessibility

- The default value is used when the user has not made a change, so specify the most commonly selected item or the recommended item

## Implementation Notes

- Describe select boxes with the structure `select.imds-select > option`
- Add `disabled` to the `select` element (can also be applied to individual `option` elements)
- When using `multiple`, it shows a list display and allows selecting multiple items
- When used in an input form, wrap with Field (`imds-field`)
- Use the read-only display (`is-static`) together with the `disabled` attribute. `readonly` cannot be specified on `<select>`
