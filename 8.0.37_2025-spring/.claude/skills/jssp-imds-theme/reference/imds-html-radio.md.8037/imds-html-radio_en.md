---
paths:
  - "src/main/jssp/**/*.html"
---

# Radio

## Overview

Radio is a component used to select one item from a list of choices.
Unlike Checkbox, exactly one item must always be selected.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-radio--documentation
- Base class: imds-radio

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-radio | label element | Radio button container | Required |
| is-x-small | imds-radio | Extra small size | Optional |
| is-small | imds-radio | Small size | Optional |
| is-normal | imds-radio | Normal size | Optional |
| is-medium | imds-radio | Medium size | Optional |
| is-large | imds-radio | Large size | Optional |

## HTML Snippets

### Basic radio button

```html
<label class="imds-radio">
  <input type="radio" value="" />
  <span>Label</span>
</label>
```

The following sections show only the differences from the basic radio button.

## Variations

### disabled

Add the `disabled` attribute to `input`.

```html
<input type="radio" value="" disabled />
```

### checked (selected)

Add the `checked` attribute to `input`.

```html
<input type="radio" value="" checked />
```

### size

Add a size class to `label.imds-radio`.

```html
<label class="imds-radio is-x-small">  <!-- Extra small -->
<label class="imds-radio is-small">    <!-- Small -->
<label class="imds-radio is-normal">   <!-- Normal -->
<label class="imds-radio is-medium">   <!-- Medium -->
<label class="imds-radio is-large">    <!-- Large -->
```

## Accessibility

- Add the same `name` attribute to radio buttons in the same group to implement exclusive selection
- Make label text clearly identify the content of each choice

## Implementation Notes

- Describe radio buttons with the structure `label.imds-radio > input[type="radio"] + span`
- Set the same `name` attribute for all radio buttons in the same group
- `disabled` and `checked` can be combined (e.g. selected and disabled)
- When grouping multiple radio buttons, use RadioGroup
