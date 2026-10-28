---
paths:
  - "src/main/jssp/**/*.html"
---

# BackgroundColor (Background Color Utility)

## Overview

BackgroundColor is a set of imds helper classes for specifying the background color of an element. These are imds utility classes used in combination with component-specific classes such as `imds-section`. They are not used as standalone components. Combining `has-background-color-gray` with Section and similar components provides visually clear sectioning.

- Source: `uiux-share/helper/BackgroundColor.md`

## CSS Classes Reference

| Class name | Purpose | Value |
|----------|------|----|
| `has-background-color-gray` | Makes the element background gray | Background color: gray |
| `has-background-color-white` | Makes the element background white | Background color: white |

## Usage Examples

### Visual separation of sections

```html
<div>
  <section>
    <h2 class="imds-heading is-size-4">.has-background-color-gray</h2>
    <div class="imds-py-2 imds-px-4"><div class="has-background-color-gray"></div></div>
  </section>
  <section>
    <h2 class="imds-heading is-size-4">.has-background-color-white</h2>
    <div class="imds-py-2 imds-px-4"><div class="has-background-color-white"></div></div>
  </section>
</div>
```

## Implementation Notes

- Without sufficient spacing (`imds-p-*` / `imds-py-*` / `imds-px-*`, etc.) on an element with a background color, the background loses visibility.
- Choose text colors carefully so that the contrast ratio between content and background does not drop.
