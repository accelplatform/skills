# Popover

## Overview

Popover is a component used to display supplementary (non-primary) information or actions on a panel within a page.
The panel appears on click or hover, and is displayed in front of all other elements on the page.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-popover--documentation
- Base class: imds-popover

## Overall Structure

```
imds-popover                              # Container (apply is-right / is-left / is-top / is-hoverable / is-active)
├── button.imds-button                    # Trigger button (is-outlined / is-ghost, etc.; several valid variations)
│   │                                     #   Attributes: aria-haspopup="true" / aria-controls="<panel-id>"
│   ├── span                              # Label (may be omitted for an icon-only trigger)
│   └── imds-icon (fa-chevron-down, etc.) # Open/close indicator icon (optional)
└── imds-popover-menu (id=<panel-id>, role="menu") # Panel itself
    └── imds-popover-content              # Content area
        └── (arbitrary content / menu items / actions, etc.)
```

The `aria-controls` on the `button` **must match** the `id` of `imds-popover-menu`. Open/close is driven by JavaScript (with `is-hoverable`, CSS alone handles it). The open state is represented by adding the `is-active` class to `div.imds-popover` (calling `classList.toggle('is-active')` in JavaScript is the standard pattern in the actual DOM).

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
| is-active | imds-popover | Represents the open state | Optional (added/removed by JS on open/close) |
| is-applied | Trigger button | Applied style | Optional |
| is-ghost | Trigger button (`imds-button`) | Borderless trigger (icon only, etc.) | Optional |
| role="menu" | imds-popover-menu | Panel role | Required |

## HTML Snippets

### Basic Popover

```html
<div class="imds-popover">
  <button
    aria-haspopup="true"
    aria-controls="sample-popover-1"
    class="imds-button is-outlined">
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  <div
    id="sample-popover-1"
    role="menu"
    class="imds-popover-menu">
    <div class="imds-popover-content"><div>Contents</div></div>
  </div>
</div>
```

The following sections show only the differences from the basic popover.

## Variations

### isApplied (Applied State)

Add `is-applied` to the trigger button.

```html
<button ... class="imds-button is-outlined is-applied">
```

### disabled (Disabled State)

Add `aria-disabled="true"` to the container and `disabled` to the button.

```html
<div class="imds-popover" aria-disabled="true">
  <button ... class="imds-button is-outlined" disabled>
```

### position (Content Display Position)

Add a position class to `div.imds-popover`. Combinations are also possible.

```html
<div class="imds-popover is-right">       <!-- Right-aligned -->
<div class="imds-popover is-left">        <!-- Left-aligned -->
<div class="imds-popover is-top">         <!-- Above -->
<div class="imds-popover is-top is-left"> <!-- Above + Left-aligned -->
```

### hoverable (Auto-Display Content on Hover)

Adding `is-hoverable` to `div.imds-popover` shows the content on hover.

```html
<div class="imds-popover is-hoverable">
```

### Trigger Button Variations

The trigger button is not fixed to `imds-button is-outlined` + `fa-chevron-down`. There are several valid patterns depending on the use case.

```html
<!-- Label + chevron (standard) -->
<button aria-haspopup="true" aria-controls="sample-popover-1" class="imds-button is-outlined">
  <span>Popover</span>
  <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
</button>

<!-- Icon only, is-ghost (common in header navigation, etc.) -->
<button type="button" class="imds-button is-ghost is-large" aria-haspopup="true" aria-controls="sample-popover-6">
  <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
  <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
</button>

<!-- Overflow menu (ellipsis): icon only, no open/close indicator -->
<button class="imds-button is-ghost" title="More actions" aria-haspopup="true" aria-controls="sample-popover-8">
  <span class="imds-icon is-small is-gray"><i class="fa-solid fa-ellipsis"></i></span>
</button>

<!-- Applied: icon + label + is-applied; is-active while open -->
<div class="imds-popover is-active">
  <button aria-haspopup="true" aria-controls="sample-popover-0" class="imds-button is-outlined is-applied">
    <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
    <span>Popover</span>
    <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
  </button>
  ...
</div>
```

- Labeled triggers use either `fa-chevron-down` or `fa-caret-down`
- Icon-only triggers (`is-ghost`) may omit the open/close indicator icon. In that case, convey the button's meaning with the `title` attribute

### Nested Menu (Child Levels)

Place `nav.imds-menu` inside the Popover and nest `ul.imds-menu-list` within `li` to create a hierarchical menu. Deeper hierarchies reduce usability, so use this only when necessary.

```html
<div class="imds-popover-content">
  <nav class="imds-menu is-borderless">
    <div class="imds-menu-title">Menu Title</div>
    <ul class="imds-menu-list">
      <li>
        <a><span>Menu 1</span></a>
        <ul class="imds-menu-list">
          <li>
            <a><span>Menu 1-1</span></a>
            <ul class="imds-menu-list"></ul>
          </li>
        </ul>
      </li>
      <li>
        <a><span>Menu 2</span></a>
        <ul class="imds-menu-list"></ul>
      </li>
    </ul>
  </nav>
</div>
```

## Implementation Notes

- Match the trigger button `aria-controls` with the panel `id` (`sample-popover-N` is a placeholder; use a unique name that fits the feature, without colons since it is not an input element)
- Panel open/close control must be implemented with JavaScript (for `is-hoverable`, CSS alone works). The standard implementation expresses open/close by adding/removing the `is-active` class on `div.imds-popover`, and removes `is-active` on a click elsewhere in the document
- Always add `aria-haspopup="true"` to the trigger button. Always add `role="menu"` to the panel itself
- The trigger button's appearance is not limited to `imds-button is-outlined` + `fa-chevron-down`. Using `is-ghost` (icon only) or `fa-caret-down` are valid variations that exist in the actual DOM. Choose according to the use case (with or without a label, placement)
- When disabled, add both `disabled` to the button and `aria-disabled="true"` to the container
- When there are many menu items, use `nav.imds-menu` + `ul.imds-menu-list`; if needed, nest `ul.imds-menu-list` within `li` to build a hierarchical menu
