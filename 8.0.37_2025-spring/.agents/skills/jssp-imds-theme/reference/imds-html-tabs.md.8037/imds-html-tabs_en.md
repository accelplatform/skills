# Tabs

## Overview

Tabs is a component for switching between and displaying multiple pieces of information or content.

- Source URL: https://document.intra-mart.jp/design/?path=/story/components-tabs--default
- Base class: imds-tabs

## Overall Structure

```
imds-tabs                                 # Tabs container (apply size / alignment / style classes)
├── ul                                    # Tab list
│   └── li.imds-tabs-tab                  # Each tab (apply is-active / has-tab-close etc.)
│       ├── button                        # Tab body (label + optional imds-icon)
│       └── button.is-tab-close-button    # Close button (only when has-tab-close)
└── imds-tabs-actions                     # Right-side actions area (optional)
    ├── label.imds-checkbox / button, etc. # Place checkboxes, buttons, etc.
    └── ...
```

The content panels switched by the tabs are placed outside `imds-tabs` and controlled via JavaScript.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-tabs | div element | Tab container | Required |
| imds-tabs-tab | li element | Each tab item | Required |
| imds-tabs-actions | div element | Action area on the right side of tabs | Optional |
| is-active | imds-tabs-tab | Active (selected) tab | Optional |
| is-bordered | imds-tabs | Bordered style | Optional |
| is-right | imds-tabs | Right-aligned | Optional |
| is-centered | imds-tabs | Center-aligned | Optional |
| is-left | imds-tabs | Left-aligned (default) | Optional |
| is-full-width | imds-tabs | Display tabs at equal width across full width | Optional |
| is-x-small | imds-tabs | Extra small size | Optional |
| is-small | imds-tabs | Small size | Optional |
| is-normal | imds-tabs | Normal size | Optional |
| is-medium | imds-tabs | Medium size | Optional |
| is-large | imds-tabs | Large size | Optional |
| has-tab-close | imds-tabs-tab | Tab with close button | Optional |
| is-tab-close-button | button element | Tab close button | Optional |
| imds-line-clamp-1 | span element | Truncate text to 1 line | Optional |
| imds-line-clamp-2 | span element | Truncate text to 2 lines | Optional |

## HTML Snippets

### Basic tabs

```html
<div class="imds-tabs">
  <ul>
    <li class="imds-tabs-tab is-active">
      <button><span>Tab1</span></button>
    </li>
    <li class="imds-tabs-tab">
      <button><span>Tab2</span></button>
    </li>
    <li class="imds-tabs-tab">
      <button><span>Tab3</span></button>
    </li>
  </ul>
</div>
```

The following sections show only the differences from the basic tabs.

## Variations

### tabsStyle (style)

Add a style class to `div.imds-tabs`.

```html
<div class="imds-tabs is-bordered">  <!-- Bordered -->
```

### position (alignment)

Add an alignment class to `div.imds-tabs`.

```html
<div class="imds-tabs is-right">     <!-- Right-aligned -->
<div class="imds-tabs is-centered">  <!-- Center-aligned -->
<div class="imds-tabs is-left">      <!-- Left-aligned -->
```

### fullWidth (equal width)

Add `is-full-width` to `div.imds-tabs`.
Tabs expand to equal width across the full width.

```html
<div class="imds-tabs is-full-width">
```

### size

Add a size class to `div.imds-tabs`.

```html
<div class="imds-tabs is-x-small">  <!-- Extra small -->
<div class="imds-tabs is-small">    <!-- Small -->
<div class="imds-tabs is-normal">   <!-- Normal -->
<div class="imds-tabs is-medium">   <!-- Medium -->
<div class="imds-tabs is-large">    <!-- Large -->
```

### disabled

Add the `disabled` attribute to the tab `button`.

```html
<button disabled><span>disabled</span></button>
```

### lineClamp (text truncation)

Truncate long labels.
Add `imds-line-clamp-1` (1 line) or `imds-line-clamp-2` (2 lines) to `span`, set the full text in `button`'s `title`, and limit width via `span`'s `style`.

```html
<button title="Enter the full tab name here">
  <span class="imds-line-clamp-1" style="width: 100px;">Enter the full tab name here</span>
</button>
```

### closeButton (close button)

Add `has-tab-close` to `li` and add a close button after the tab button.

```html
<li class="imds-tabs-tab is-active has-tab-close">
  <button><span>Tab1</span></button>
  <button
    title="Close"
    class="imds-button is-ghost is-tab-close-button">
    <span class="imds-icon is-x-small"><i class="fa-solid fa-xmark"></i></span>
  </button>
</li>
```

## Combination Examples

### Combined with Button

Add `imds-tabs-actions` after `ul`.
Checkboxes, buttons, etc. can be placed there.

```html
<div class="imds-tabs">
  <ul>
    <!-- Tab items -->
  </ul>
  <div class="imds-tabs-actions">
    <label class="imds-checkbox">
      <input id="todo-replace-:r1:" type="checkbox" />
      <span>Checkbox</span>
    </label>
    <button type="button" class="imds-button is-primary">Button</button>
  </div>
</div>
```

### Combined with Icon

Add `imds-icon` inside `button`.
Can be placed before or after the label.

```html
<!-- Icon left -->
<button>
  <span class="imds-icon is-small"><i class="fa-solid fa-home"></i></span>
  <span>Tab1</span>
</button>

<!-- Icon right -->
<button>
  <span>Tab1</span>
  <span class="imds-icon is-small"><i class="fa-solid fa-home"></i></span>
</button>
```

## Implementation Notes

- Describe tabs with the list structure `ul > li`
- Apply `is-active` to only one tab at a time
- Implement content display control on tab switch with JavaScript
- Control the close button click event with JavaScript (tab removal processing)
- When using `imds-line-clamp-*`, set the full text in the `button`'s `title` attribute so it can be checked on hover
- Place `imds-tabs-actions` at the same level as the tab list (`ul`)
