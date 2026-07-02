# ProgressCircular

## Overview

ProgressCircular visually and intuitively displays the progress of an ongoing process as a circle.
Using appropriate colors and icons to represent status makes it easier to understand the processing state intuitively.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-progress-progresscircular--documentation
- Base class: imds-progress-circular

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-progress-circular | div element | Circular progress container | Required |
| imds-progress-circular-track | circle element | Track (background circle) | Required |
| imds-progress-circular-fill | circle element | Fill (progress indicator) | Required |
| imds-progress-circular-text | div element | Center text area | Optional |
| is-primary | imds-progress-circular | Primary color | Optional |
| is-warning | imds-progress-circular | Warning (yellow) | Optional |
| is-danger | imds-progress-circular | Danger (red) | Optional |
| is-success | imds-progress-circular | Success (green) | Optional |
| is-info | imds-progress-circular | Info (blue) | Optional |
| is-error | imds-progress-circular | Error (red) | Optional |
| is-blue | imds-progress-circular | Blue | Optional |
| is-green | imds-progress-circular | Green | Optional |
| is-red | imds-progress-circular | Red | Optional |
| is-yellow | imds-progress-circular | Yellow | Optional |
| is-orange | imds-progress-circular | Orange | Optional |
| is-cyan | imds-progress-circular | Cyan | Optional |
| is-gray | imds-progress-circular | Gray | Optional |
| is-white | imds-progress-circular | White | Optional |

## HTML Snippets

### Basic circular progress

```html
<div
  class="imds-progress-circular"
  style="width: 16rem; height: 16rem; font-size: 4rem;">
  <svg width="160" height="160" viewBox="0 0 160 160">
    <circle
      class="imds-progress-circular-track"
      r="74" cx="80" cy="80"
      fill="transparent" stroke-width="12"></circle>
    <circle
      class="imds-progress-circular-fill"
      r="74" cx="80" cy="80"
      fill="transparent" stroke-linecap="round" stroke-width="12"
      stroke-dasharray="464.96"
      stroke-dashoffset="185.98"></circle>
  </svg>
  <div class="imds-progress-circular-text"><span>60%</span></div>
</div>
```

The following sections show only the differences from the basic circular progress.

## Variations

### color

Add a color class to `div.imds-progress-circular`.

```html
<div class="imds-progress-circular is-primary">  <!-- Primary -->
<div class="imds-progress-circular is-warning">  <!-- Warning -->
<div class="imds-progress-circular is-danger">   <!-- Danger -->
<div class="imds-progress-circular is-success">  <!-- Success -->
<div class="imds-progress-circular is-info">     <!-- Info -->
<div class="imds-progress-circular is-error">    <!-- Error -->
<div class="imds-progress-circular is-blue">     <!-- Blue -->
<div class="imds-progress-circular is-green">    <!-- Green -->
<div class="imds-progress-circular is-red">      <!-- Red -->
<div class="imds-progress-circular is-yellow">   <!-- Yellow -->
<div class="imds-progress-circular is-orange">   <!-- Orange -->
<div class="imds-progress-circular is-cyan">     <!-- Cyan -->
<div class="imds-progress-circular is-gray">     <!-- Gray -->
<div class="imds-progress-circular is-white">    <!-- White -->
```

### showProgressWithIcon (display progress with icon)

Display the progress state with an icon instead of text. Replace the `<span>` inside `imds-progress-circular-text` with `imds-icon`.

```html
<div class="imds-progress-circular-text">
  <span
    class="imds-icon is-medium is-success"
    title="Enter what the icon represents in the title attribute">
    <i class="fa-solid fa-check"></i>
  </span>
</div>
```

## Implementation Notes

- Control size via the `style` attribute of `imds-progress-circular` (`width`, `height`, `font-size`)
- Control progress percentage via `stroke-dashoffset`. Formula: `circumference × (1 - progress rate)` (circumference = `2 × π × r`)
- Set `stroke-dasharray` to the circumference value (when `r="74"`: `2 × π × 74 ≈ 464.96`)
- Progress text and icon are mutually exclusive (do not place both simultaneously)
- When using an icon, explain its meaning using the `title` attribute for accessibility
- Apply the icon color class (such as `is-success`) to both the container and the icon
- Adjust SVG `width` / `height` / `viewBox` and container `style` size according to usage
