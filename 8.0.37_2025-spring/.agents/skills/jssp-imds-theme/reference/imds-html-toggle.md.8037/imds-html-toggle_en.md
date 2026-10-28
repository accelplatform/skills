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
| imds-toggle-switch-text | span element | Label text | Optional (omit when the label is omitted) |
| is-x-small | imds-toggle-switch | Extra small size | Optional |
| is-small | imds-toggle-switch | Small size | Optional |
| is-normal | imds-toggle-switch | Normal size | Optional |
| is-medium | imds-toggle-switch | Medium size | Optional |
| is-large | imds-toggle-switch | Large size | Optional |

## HTML Snippets

### Basic Toggle

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

### size (Size)

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

### checked (On State)

Add the `checked` attribute to `input`.

```html
<input type="checkbox" checked />
```

### Label Not Exists

When the label is omitted, for example because the meaning is obvious from nearby UI, do not add `imds-toggle-switch-text`. This is a valid variation in the actual DOM as well; the label is not always required.

```html
<label class="imds-toggle-switch">
  <input type="checkbox" />
  <span class="imds-toggle-switch-appearance">
    <span class="imds-icon"><i class="fa-solid fa-check"></i></span>
  </span>
</label>
```

Even when the label is omitted, consider supplementing it with `aria-label` or similar so that screen reader users can identify the toggle's meaning.

## Accessibility

### Label

- The toggle switch label should make it clear "what" "happens" when the switch is turned on

  **Good pattern**: Enable two-factor authentication
  **Bad pattern**: Two-factor authentication

- Do not change the label based on the switch state; always display the same label. Changing the label makes it difficult to tell whether it represents a state or an action

  **Good pattern**: Enable two-factor authentication
  **Bad pattern**: Disable two-factor authentication

## Implementation Notes

- Describe toggle switch with the structure `label > input[type="checkbox"] + span.imds-toggle-switch-appearance (+ span.imds-toggle-switch-text)`. Add `imds-toggle-switch-text` only when displaying a label; it is not required
- Include a check icon (`fa-solid fa-check`) inside `imds-toggle-switch-appearance`
- Control the on/off state with the `checked` attribute of `input`
- `disabled` and `checked` can be combined (e.g. on state and disabled)
- When displaying label text, do not change it based on the switch state
