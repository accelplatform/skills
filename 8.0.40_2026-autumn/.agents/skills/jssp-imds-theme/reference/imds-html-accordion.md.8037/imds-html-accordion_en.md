# Accordion

## Overview

Accordion is a component used to keep areas that do not need to be always visible in a collapsed state.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-accordion-accordion--documentation
- Base class: imds-accordion

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-accordion | Container div | Accordion container | Required |
| imds-accordion-title | label element | Title section | Required |
| imds-accordion-title-inner | span element | Wrapper for title text and caption | Required |
| imds-accordion-caption | span element | Supplementary text below the title | Optional |
| imds-accordion-chevron | span element | Chevron icon for open/close | Required |
| imds-accordion-content | div element | Content panel | Required |
| imds-icon | span element | Common icon class (used for chevron) | Required |
| is-small | imds-icon | Small size for icon | Optional |
| is-outlined | imds-accordion | Border on all four sides | Optional |
| is-borderless | imds-accordion | No border | Optional |
| is-left | imds-accordion | Chevron icon aligned left | Optional |
| is-right | imds-accordion | Chevron icon aligned right | Optional |
| is-primary | imds-icon | Change chevron icon to primary color | Optional |
| is-x-small | imds-accordion | Extra small size | Optional |
| is-small | imds-accordion | Small size | Optional |
| is-normal | imds-accordion | Normal size | Optional |
| is-medium | imds-accordion | Medium size | Optional |
| is-large | imds-accordion | Large size | Optional |
| is-gray | imds-accordion-title | Change title background color to gray | Optional |
| is-light | imds-accordion-title | Light gray (used with is-gray) | Optional |
| has-text-weight-bold | imds-accordion-title | Make title bold | Optional |
| has-text-weight-normal | imds-accordion-title | Make title normal weight | Optional |
| imds-tag | span element | Tag element (placed inside imds-accordion-title) | Optional |

## HTML Snippets

### Basic Accordion

```html
<div class="imds-accordion">
  <input
    type="checkbox"
    id="todo-replace-:r1:" />
  <label
    for="todo-replace-:r1:"
    class="imds-accordion-title">
    <span class="imds-accordion-title-inner">
      <span>Accordion Title</span>
      <span class="imds-accordion-caption">Caption (Sub Title)</span>
    </span>
    <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  </label>
  <div class="imds-accordion-content"><div class="imds-px-4 imds-py-3">Content</div></div>
</div>
```

All subsequent snippets show only the differences from the basic accordion.

## Variations

### accordionStyle (Border)

Add a class to `div.imds-accordion`. Default is a simple border in the top and bottom directions only.

```html
<!-- Border on all sides -->
<div class="imds-accordion is-outlined">

<!-- No border -->
<div class="imds-accordion is-borderless">
```

### titleBackgroundColor (Title Background Color)

Add a class to `label.imds-accordion-title`.

```html
<!-- Gray background -->
<label class="imds-accordion-title is-gray">

<!-- Light gray background -->
<label class="imds-accordion-title is-gray is-light">
```

### titleFontWeight (Title Font Weight)

Add a class to `label.imds-accordion-title`.

```html
<!-- Bold -->
<label class="imds-accordion-title has-text-weight-bold">

<!-- Normal weight -->
<label class="imds-accordion-title has-text-weight-normal">
```

### isOpen (Initially Open State)

Add the `checked` attribute to `input[type="checkbox"]`.

```html
<input type="checkbox" id="todo-replace-:r1:" checked />
```

### disabled (Disabled State)

Add the `disabled` attribute to `input[type="checkbox"]`.

```html
<input type="checkbox" id="todo-replace-:r1:" disabled />
```

### chevronIconPosition (Chevron Icon Position)

Add a class to `div.imds-accordion`. Default is right-aligned.

```html
<!-- Chevron aligned left -->
<div class="imds-accordion is-left">
```

### chevronIconColor (Chevron Icon Color)

Add `is-primary` to `span.imds-icon`.

```html
<span class="imds-icon is-small is-primary imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
```

### size (Size)

Add a size class to `div.imds-accordion`.

```html
<div class="imds-accordion is-x-small">  <!-- Extra small -->
<div class="imds-accordion is-small">    <!-- Small -->
<div class="imds-accordion is-normal">   <!-- Normal -->
<div class="imds-accordion is-medium">   <!-- Medium -->
<div class="imds-accordion is-large">    <!-- Large -->
```

### titleOnly (Title Only)

Omit the caption and place text directly inside `imds-accordion-title-inner`.

```html
<span class="imds-accordion-title-inner">Accordion Title</span>
```

## Combination Examples

### Combination with Tag

Place an `imds-tag` element after the chevron icon inside `label.imds-accordion-title`.

```html
<label
  for="todo-replace-:r1:"
  class="imds-accordion-title">
  <span class="imds-accordion-title-inner">
    <span>Accordion Title</span>
    <span class="imds-accordion-caption">caption</span>
  </span>
  <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
  <span class="imds-tag is-yellow is-small"><span>warning</span></span>
</label>
```

### Combination with Icon

Place an `imds-icon` element before `imds-accordion-title-inner` (at the beginning of the title).

```html
<label
  for="todo-replace-:r1:"
  class="imds-accordion-title">
  <span class="imds-icon"><i class="fa-solid fa-circle-check"></i></span>
  <span class="imds-accordion-title-inner">
    <span>Accordion Title</span>
    <span class="imds-accordion-caption">caption</span>
  </span>
  <span class="imds-icon is-small imds-accordion-chevron"><i class="fa-solid fa-angle-down"></i></span>
</label>
```

Available icon examples:
- `fa-solid fa-circle-check` - Complete / Success
- `fa-solid fa-triangle-exclamation` - Warning
- `fa-solid fa-circle-info` - Information / Supplementary

## Accessibility

- Match the `id` / `for` attributes of `input[type="checkbox"]` and `label` so clicking opens/closes the accordion
- Ensure `id` values are not duplicated within the same page (assign unique `id` when placing multiple accordions)
- When the `disabled` attribute is added, screen readers will also convey that the element is non-interactive
- Note that text and elements within the content area (`imds-accordion-content`) exist in the DOM even when the accordion is closed, so screen readers may read them

## Implementation Notes

- Always replace the `id` attribute with a unique value (`todo-replace-:r1:` is a placeholder)
- Since open/close is controlled by checkbox, JavaScript is not required; however, manipulate the `checked` attribute to programmatically control open/close state
- Padding inside `imds-accordion-content` is adjusted with `imds-px-4 imds-py-3`. Can be changed to fit the content
- To group multiple accordions, use [accordion-group](accordion-group.md)
