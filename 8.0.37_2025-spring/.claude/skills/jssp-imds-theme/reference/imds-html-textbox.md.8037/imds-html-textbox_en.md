---
paths:
  - "src/main/jssp/**/*.html"
---

# Textbox

## Overview

Textbox is a component used when users enter short text or single-line information.
When multi-line input is needed, use Textarea.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textbox--documentation
- Base class: imds-textbox

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-textbox | input element | Textbox | Required |
| is-static | imds-textbox | Static display (no border) | Optional |
| is-x-small | imds-textbox | Extra small size | Optional |
| is-small | imds-textbox | Small size | Optional |
| is-normal | imds-textbox | Normal size | Optional |
| is-medium | imds-textbox | Medium size | Optional |
| is-large | imds-textbox | Large size | Optional |

## HTML Snippets

### Basic textbox

```html
<input type="text" placeholder="" class="imds-textbox" value="text" />
```

The following sections show only the differences from the basic textbox.

## Variations

### readonly

Add the `readonly` attribute to `input`.

```html
<input type="text" placeholder="" class="imds-textbox" value="text" readonly />
```

### disabled

Add the `disabled` attribute to `input`.

```html
<input type="text" placeholder="" class="imds-textbox" value="text" disabled />
```

### static (static display)

Add the `is-static` class and `readonly` attribute to `input`. The border is hidden.

```html
<input type="text" placeholder="" class="imds-textbox is-static" value="text" readonly />
```

### size

Add a size class to `input.imds-textbox`.

```html
<input type="text" class="imds-textbox is-x-small" />  <!-- Extra small -->
<input type="text" class="imds-textbox is-small" />    <!-- Small -->
<input type="text" class="imds-textbox is-normal" />   <!-- Normal -->
<input type="text" class="imds-textbox is-medium" />   <!-- Medium -->
<input type="text" class="imds-textbox is-large" />    <!-- Large -->
```

## Accessibility

### Usage of placeholder

- Placeholder is effective as a hint to help users imagine what to input
- However, incorrect usage can confuse users
- When using placeholder, pay attention to the following points

  **Placeholder should not replace a label**
  - Since placeholder disappears when the user starts typing, they can no longer check what the field was for
  - Therefore, appropriately use a label to clarify the meaning of the input field and a placeholder to provide a hint

  **Limit use to concise hints**
  - Use placeholder concisely to show input format or examples
  - Provide detailed explanations and input notes in the Field's help text, not in the placeholder

  **Do not use for information that requires memorization**
  - Placeholder becomes invisible when the user starts entering input
  - Therefore, do not use it for important information or information the user needs to remember

## Implementation Notes

- Describe textbox with `input[type="text"].imds-textbox`
- Use `is-static` in combination with `readonly` (read-only static display)
- `readonly` and `disabled` are mutually exclusive (do not apply both simultaneously)
- When used in an input form, wrap with Field (`imds-field`)
