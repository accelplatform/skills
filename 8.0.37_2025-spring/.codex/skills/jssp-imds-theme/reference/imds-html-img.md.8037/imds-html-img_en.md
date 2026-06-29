# Img

## Overview

Img displays icons using the `<img>` tag.
Use it when you need to use custom icons such as SVG images.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-icon-img--documentation
- Base class: imds-icon

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-icon | span element | Icon wrapper | Required |
| is-x-small | imds-icon | Extra small size | Optional |
| is-small | imds-icon | Small size | Optional |
| is-normal | imds-icon | Normal size | Optional |
| is-medium | imds-icon | Medium size | Optional |
| is-large | imds-icon | Large size | Optional |

## HTML Snippets

### Basic Image Icon

```html
<span class="imds-icon">
  <img src="img/information.svg" alt="Information icon" />
</span>
```

All subsequent snippets show only the differences from the basic image icon.

## Variations

### size (Size)

Add a size class to `span.imds-icon`.

```html
<span class="imds-icon is-x-small">  <!-- Extra small -->
<span class="imds-icon is-small">    <!-- Small -->
<span class="imds-icon is-normal">   <!-- Normal -->
<span class="imds-icon is-medium">   <!-- Medium -->
<span class="imds-icon is-large">    <!-- Large -->
```

## Combination Examples

### Combination with Button

```html
<!-- Button with text -->
<button type="button" class="imds-button is-outlined">
  <span class="imds-icon"><img src="img/screen_existing_additions.svg" /></span>
  <span class="imds-button-text">Add Existing Resources</span>
</button>

<!-- Icon-only button -->
<button type="button" class="imds-button is-ghost">
  <span class="imds-icon"><img src="img/addition.svg" /></span>
</button>
```

### Combination with Tag

```html
<span class="imds-tag is-light is-blue">
  <span class="imds-icon is-small"><img src="img/category.svg" /></span>
  <span>Category</span>
</span>
```

## Implementation Notes

- For meaningful icons, add the `alt` attribute to the `img` element to ensure accessibility
- For decorative icons, specify `alt=""` to hide from screen readers
- For icon-only buttons, add `aria-label` to the `button` element
- Change the SVG file path to match the project structure
