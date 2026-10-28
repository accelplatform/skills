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
| is-static | imds-textarea | Read-only static display state (used with `readonly`) | Optional |
| is-x-small | imds-textarea | Extra small size | Optional |
| is-small | imds-textarea | Small size | Optional |
| is-normal | imds-textarea | Normal size | Optional |
| is-medium | imds-textarea | Medium size | Optional |
| is-large | imds-textarea | Large size | Optional |

## HTML Snippets

### Basic Textarea

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

### is-static (Read-Only Static Display)

A read-only state where the value cannot be edited but can be selected and copied. Use with the `readonly` attribute. Its appearance differs from plain `readonly` (see Variations) and emphasizes that the field is read-only.

```html
<textarea class="imds-textarea is-static" readonly>text</textarea>
```

### size (Size)

Add a size class to `textarea.imds-textarea`.

```html
<textarea class="imds-textarea is-x-small">text</textarea>  <!-- Extra small -->
<textarea class="imds-textarea is-small">text</textarea>    <!-- Small -->
<textarea class="imds-textarea is-normal">text</textarea>   <!-- Normal -->
<textarea class="imds-textarea is-medium">text</textarea>   <!-- Medium -->
<textarea class="imds-textarea is-large">text</textarea>    <!-- Large -->
```

## Accessibility

- When using `placeholder` to show an example, do not use it as a substitute for a label; set a label separately

## Implementation Notes

- Describe textarea with `textarea.imds-textarea`
- `readonly` and `disabled` are mutually exclusive (do not apply both simultaneously)
- Use `is-static` together with `readonly` (the display differs from `readonly` alone)
- When used in an input form, wrap with Field (`imds-field`)
- Control the number of displayed rows with the `rows` attribute as needed
