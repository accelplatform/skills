---
paths:
  - "src/main/jssp/**/*.html"
---

# Toggle

## Overview

Toggle is a component used to switch between on/off states.
Use it only when changes are reflected immediately.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-toggle--documentation
- Base class: imds-toggle-switch

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-toggle-switch | label element | Toggle switch container | Required |
| imds-toggle-switch-appearance | span element | Switch appearance | Required |
| imds-toggle-switch-text | span element | Label text | Required |
| is-x-small | imds-toggle-switch | Extra small size | Optional |
| is-small | imds-toggle-switch | Small size | Optional |
| is-normal | imds-toggle-switch | Normal size | Optional |
| is-medium | imds-toggle-switch | Medium size | Optional |
| is-large | imds-toggle-switch | Large size | Optional |

## HTML Snippets

### Basic toggle

```html
<label class="imds-toggle-switch">
  <input type="checkbox" />
  <span class="imds-toggle-switch-appearance">
    <span class="imds-icon"><i class="fa-solid fa-check"></i></span>
  </span>
  <span class="imds-toggle-switch-text">Label</span>
</label>
```

The following sections show only the differences from the basic toggle.

## Variations

### size

Add a size class to `label.imds-toggle-switch`.

```html
<label class="imds-toggle-switch is-x-small">  <!-- Extra small -->
<label class="imds-toggle-switch is-small">    <!-- Small -->
<label class="imds-toggle-switch is-normal">   <!-- Normal -->
<label class="imds-toggle-switch is-medium">   <!-- Medium -->
<label class="imds-toggle-switch is-large">    <!-- Large -->
```

### disabled

Add the `disabled` attribute to `input`.

```html
<input type="checkbox" disabled />
```

### checked (on state)

Add the `checked` attribute to `input`.

```html
<input type="checkbox" checked />
```

## Accessibility

### Label

- The toggle switch label should make it clear "what" "happens" when the switch is turned on

  **Good pattern**: Enable two-factor authentication
  **Bad pattern**: Two-factor authentication

- Do not change the label based on the switch state; always display the same label. Changing the label makes it difficult to tell whether it represents a state or an action

  **Good pattern**: Enable two-factor authentication
  **Bad pattern**: Disable two-factor authentication

## Implementation Notes

- Describe toggle switch with the structure `label > input[type="checkbox"] + span.imds-toggle-switch-appearance + span.imds-toggle-switch-text`
- Include a check icon (`fa-solid fa-check`) inside `imds-toggle-switch-appearance`
- Control the on/off state with the `checked` attribute of `input`
- `disabled` and `checked` can be combined (e.g. on state and disabled)
- Do not change the label text based on the switch state
