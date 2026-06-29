# AccordionGroup

## Overview

AccordionGroup is a component for grouping multiple Accordions together.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-accordion-accordiongroup--documentation
- Base class: imds-accordion-group
- For details on individual accordions, see [accordion](accordion.md)

## Overall Structure

```
imds-accordion-group                      # Group container (applies border / position / size to all children)
└── imds-accordion                        # Each accordion (repeated as needed)
    ├── input[type=checkbox]              # Holds open/close state (unique id; no JS required)
    ├── label.imds-accordion-title (for=input id)
    │   ├── imds-accordion-title-inner
    │   │   ├── span                      # Title
    │   │   └── imds-accordion-caption    # Caption (optional)
    │   └── imds-icon.imds-accordion-chevron # Chevron (▼)
    └── imds-accordion-content            # Collapsible content
        └── imds-px-4 imds-py-3           # Inner padding wrapper
            └── (arbitrary content / nav.imds-menu, etc.)
```

Border, chevron position, and size set on `imds-accordion-group` are applied to all accordions below it at once.

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-accordion-group | Container div | Accordion group container | Required |
| imds-accordion | Each item div | Container for each accordion | Required |
| is-outlined | imds-accordion-group | Border on all four sides | Optional |
| is-borderless | imds-accordion-group | No border | Optional |
| is-left | imds-accordion-group | Chevron icon aligned left | Optional |
| is-right | imds-accordion-group | Chevron icon aligned right | Optional |
| is-x-small | imds-accordion-group | Extra small size | Optional |
| is-small | imds-accordion-group | Small size | Optional |
| is-normal | imds-accordion-group | Normal size | Optional |
| is-medium | imds-accordion-group | Medium size | Optional |
| is-large | imds-accordion-group | Large size | Optional |

* For classes inside each accordion (imds-accordion-title, imds-accordion-content, etc.), see [accordion](accordion.md).

## HTML Snippets

### Basic Accordion Group

```html
<div class="imds-accordion-group">
  <div class="imds-accordion">
    <input type="checkbox" id="todo-replace-:r1:" />
    <label for="todo-replace-:r1:" class="imds-accordion-title">
      <span class="imds-accordion-title-inner">
        <span>Accordion Title</span>
        <span class="imds-accordion-caption">caption</span>
      </span>
      <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
    </label>
    <div class="imds-accordion-content"><div class="imds-px-4 imds-py-3">Content</div></div>
  </div>
  <!-- Repeat imds-accordion as needed (id must be unique) -->
</div>
```

All subsequent snippets show only the differences from the basic accordion group.

## Variations

Borders, chevron position, and size are all applied to `div.imds-accordion-group` and affect all accordions in the group at once.

### accordionStyle (Border)

```html
<!-- Border on all sides -->
<div class="imds-accordion-group is-outlined">

<!-- No border -->
<div class="imds-accordion-group is-borderless">
```

### chevronIconPosition (Chevron Icon Position)

Default is right-aligned.

```html
<!-- Chevron aligned left -->
<div class="imds-accordion-group is-left">
```

### size (Size)

```html
<div class="imds-accordion-group is-x-small">  <!-- Extra small -->
<div class="imds-accordion-group is-small">    <!-- Small -->
<div class="imds-accordion-group is-normal">   <!-- Normal -->
<div class="imds-accordion-group is-medium">   <!-- Medium -->
<div class="imds-accordion-group is-large">    <!-- Large -->
```

## Combination Examples

### Combination with Menu

Pattern for placing `nav.imds-menu` inside `imds-accordion-content`.
Adding `is-last-child-borderless` hides the border at the end of the menu.

```html
<div class="imds-accordion-content">
  <nav class="imds-menu is-last-child-borderless">
    <ul class="imds-menu-list">
      <li><a><span>Menu 1</span></a></li>
      <li><a><span>Menu 2</span></a></li>
      <li><a><span>Menu 3</span></a></li>
    </ul>
  </nav>
</div>
```

## Implementation Notes

- Always replace the `id` attribute with a unique value (`todo-replace-:r1:` etc. are placeholders)
- Ensure `id` values do not overlap across accordions within the group
- Since open/close is controlled by checkbox, JavaScript is not required; however, manipulate the `checked` attribute to programmatically control open/close state
- Padding inside `imds-accordion-content` is adjusted with `imds-px-4 imds-py-3`. Can be changed to fit the content
