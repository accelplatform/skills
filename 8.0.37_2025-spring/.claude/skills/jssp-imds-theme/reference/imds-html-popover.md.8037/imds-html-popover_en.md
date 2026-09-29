---
paths:
  - "src/main/jssp/**/*.html"
---

# Popover

## Overview

Popover is a component used to display supplementary (non-primary) information or actions on a panel within a page.
The panel appears on click or hover, and is displayed in front of all other elements on the page.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-popover--documentation
- Base class: imds-popover

## Overall Structure

```
imds-popover                              # Container (apply is-right / is-left / is-top / is-hoverable)
├── button.imds-button                    # Trigger button (is-outlined)
│   │                                     #   Attributes: aria-haspopup="true" / aria-controls="<panel-id>"
│   ├── span                              # Label
│   └── imds-icon (fa-chevron-down)       # Chevron icon
└── imds-popover-menu (id=<panel-id>, role="menu") # Panel itself
    └── imds-popover-content              # Content area
        └── (arbitrary content / menu items / actions, etc.)
```

The `aria-controls` on the trigger `button` **must match** the `id` of `imds-popover-menu`. Open/close is driven by JavaScript (with `is-hoverable`, CSS alone handles it).

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-popover | div element | Popover container | Required |
| imds-popover-menu | div element | Popover menu (panel) | Required |
| imds-popover-content | div element | Content area inside the panel | Required |
| is-right | imds-popover | Right-aligned display | Optional |
| is-left | imds-popover | Left-aligned display | Optional |
| is-top | imds-popover | Display above | Optional |
| is-hoverable | imds-popover | Open/close on hover | Optional |
| is-applied | Trigger button | Applied style | Optional |

## HTML Snippets

### Basic popover

```html
<div class="imds-popover">
  <button
    aria-haspopup="true"
    aria-controls="imds-popover-:r1:"
    class="imds-button is-outlined">
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  <div
    id="imds-popover-:r1:"
    role="menu"
    class="imds-popover-menu">
    <div class="imds-popover-content"><div>Contents</div></div>
  </div>
</div>
```

The following sections show only the differences from the basic popover.

## Variations

### isApplied (applied state)

Add `is-applied` to the trigger button.

```html
<button ... class="imds-button is-outlined is-applied">
```

### disabled

Add `aria-disabled="true"` to the container and `disabled` to the button.

```html
<div class="imds-popover" aria-disabled="true">
  <button ... class="imds-button is-outlined" disabled>
```

### position (content display position)

Add a position class to `div.imds-popover`. Combinations are also possible.

```html
<div class="imds-popover is-right">       <!-- Right-aligned -->
<div class="imds-popover is-left">        <!-- Left-aligned -->
<div class="imds-popover is-top">         <!-- Above -->
<div class="imds-popover is-top is-left"> <!-- Above + Left-aligned -->
```

### hoverable (auto-display content on hover)

Adding `is-hoverable` to `div.imds-popover` shows the content on hover.

```html
<div class="imds-popover is-hoverable">
```

## Implementation Notes

- Match the trigger button `aria-controls` with the panel `id` (replace `:r1:` with a unique value)
- Panel open/close control must be implemented with JavaScript (for `is-hoverable`, CSS alone works)
- Always add `aria-haspopup="true"` to the trigger button
- Use `imds-button is-outlined` for the trigger button and include a chevron icon (`fa-chevron-down`)
- When disabled, add both `disabled` to the button and `aria-disabled="true"` to the container
