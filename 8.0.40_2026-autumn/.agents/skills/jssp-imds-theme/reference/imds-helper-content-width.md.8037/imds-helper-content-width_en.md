# ContentWidth (Content Width Utility)

## Overview

ContentWidth is a set of imds helper classes for specifying the width of a container element. These are imds utility classes used in combination with component-specific classes such as `imds-section`. They are not used as standalone components.

- Source: `uiux-share/helper/ContentWidth.md`

## CSS Classes Reference

| Class name | Purpose | Value |
|----------|------|----|
| `imds-content-normal-width` | Specifies a container width with a maximum width | Max width 1200px. Below the maximum, it stretches and shrinks with the screen width |
| `imds-content-full-width` | Specifies a container width that fills the screen width | Width 100%. Stretches and shrinks with the screen width |

## Usage Examples

### Container with a max width of 1200px

```html
<section class="imds-section">
  <h2 class="imds-heading is-size-4">.imds-content-normal-width</h2>
  <p class="imds-help-text">The width has a maximum of 1200px. Below the maximum, the width stretches and shrinks with the screen width.</p>
  <div class="imds-content-normal-width imds-border-2"></div>
</section>
```

### Container that fills the screen width

```html
<section class="imds-section">
  <h2 class="imds-heading is-size-4">.imds-content-full-width</h2>
  <p class="imds-help-text">The width is set to 100% and stretches and shrinks with the screen width.</p>
  <div class="imds-content-full-width imds-border-2"></div>
</section>
```

## Implementation Notes

- Use `imds-content-normal-width` for the main content area of typical business screens, and avoid excessively wide layouts to keep content readable.
- Consider `imds-content-full-width` only when you want to make full use of the screen width, such as on dashboards or list screens.
