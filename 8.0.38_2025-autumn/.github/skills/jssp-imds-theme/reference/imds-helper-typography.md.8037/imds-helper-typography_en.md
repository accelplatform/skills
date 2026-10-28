---
paths:
  - "src/main/jssp/**/*.html"
---

# Typography (Text Styling Utility)

## Overview

Typography is a set of imds helper classes that control the appearance and alignment of text through properties such as font size, weight, and style, as well as `text-align` and `text-transform`. These are imds utility classes used in combination with component-specific classes such as `imds-textbox` or `imds-heading`. They are not used as standalone components.

- Source: `uiux-share/helper/Typography.md`

## CSS Classes Reference

| Class name | Purpose | Value (Property: Value) |
|----------|------|----------------------|
| `is-capitalized` | Capitalizes only the first letter | `text-transform: capitalize;` |
| `is-lowercase` | Converts to lowercase | `text-transform: lowercase;` |
| `is-uppercase` | Converts to uppercase | `text-transform: uppercase;` |
| `is-italic` | Makes text italic | `font-style: italic;` |
| `is-underlined` | Adds an underline | `text-decoration: underline;` |
| `has-text-weight-normal` | Normal weight | `font-weight: 400;` |
| `has-text-weight-bold` | Bold | `font-weight: 700;` |
| `has-text-centered` | Center alignment | `text-align: center;` |
| `has-text-justified` | Justified alignment | `text-align: justify;` |
| `has-text-start` | Start alignment | `text-align: start;` |
| `has-text-end` | End alignment | `text-align: end;` |

## Usage Examples

### Purchase amount input (right-aligned)

Add `has-text-end` to the Textbox to right-align the input value.

```html
<div class="imds-field">
  <div class="imds-field-label"><label for=":r0:">Purchase Amount</label></div>
  <div class="imds-field-control">
    <input
      type="text"
      id=":r0:"
      placeholder="0"
      class="imds-textbox has-text-end"
      value="" />
  </div>
</div>
```

### Emphasis with bold text

```html
<span class="has-text-weight-bold">Important Notice</span>
```

### Centered heading

```html
<h2 class="imds-heading is-size-4 has-text-centered">Section Heading</h2>
```

## Implementation Notes

- Applying multiple Typography classes to the same element can cause conflicts or unexpected rendering, so keep them to the minimum necessary.
- The appearance of `has-text-weight-*` varies by font, so check the rendering with the main fonts.
- `is-capitalized` / `is-lowercase` / `is-uppercase` are effective only for alphabetic characters; avoid using them on Japanese text.
- `is-italic` may have no effect depending on the font; it has no effect on fonts without italic glyphs (such as Meiryo), so check the rendering with the main fonts. It reduces readability for long text and Japanese text, so keep its use to a minimum.
