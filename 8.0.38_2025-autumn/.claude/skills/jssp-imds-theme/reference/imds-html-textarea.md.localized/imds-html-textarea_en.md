---
paths:
  - "src/main/jssp/**/*.html"
---

# Textarea

## Overview

Textbox is a component used when users enter short text or single-line information.
When multi-line input is needed, use Textarea.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-inputs-textarea--documentation
- Base class: imds-textarea

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-textarea | textarea element | Textarea | Required |

## HTML Snippets

### Basic textarea

```html
<textarea class="imds-textarea">text</textarea>
```

The following sections show only the differences from the basic textarea.

## Variations

### readonly

Add the `readonly` attribute to `textarea`.

```html
<textarea class="imds-textarea" readonly>text</textarea>
```

### disabled

Add the `disabled` attribute to `textarea`.

```html
<textarea class="imds-textarea" disabled>text</textarea>
```

## Accessibility

- When using `placeholder` to show an example, do not use it as a substitute for a label; set a label separately

## Implementation Notes

- Describe textarea with `textarea.imds-textarea`
- `readonly` and `disabled` are mutually exclusive (do not apply both simultaneously)
- When used in an input form, wrap with Field (`imds-field`)
- Control the number of displayed rows with the `rows` attribute as needed
