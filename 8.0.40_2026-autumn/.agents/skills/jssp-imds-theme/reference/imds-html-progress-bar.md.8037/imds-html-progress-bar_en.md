# ProgressBar

## Overview

ProgressBar is a component that visually and intuitively displays the progress of an ongoing process as a bar.

- Source URL: https://document.intra-mart.jp/design/?path=/docs/components-progress-progressbar--documentation
- Base class: imds-progress-bar

## CSS Classes Reference

| Class name | Applied to | Purpose | Required/Optional |
|----------|--------|------|----------------|
| imds-progress-bar | div element | Progress bar container | Required |
| imds-progress-bar-track | div element | Track (background bar) | Required |
| imds-progress-bar-fill | div element | Fill (progress indicator) | Required |
| imds-progress-bar-text | span element | Progress text (percentage display) | Optional |
| is-primary | imds-progress-bar | Primary color | Optional |
| is-warning | imds-progress-bar | Warning (yellow) | Optional |
| is-danger | imds-progress-bar | Danger (red) | Optional |
| is-success | imds-progress-bar | Success (green) | Optional |
| is-info | imds-progress-bar | Info (blue) | Optional |
| is-error | imds-progress-bar | Error (red) | Optional |
| is-blue | imds-progress-bar | Blue | Optional |
| is-green | imds-progress-bar | Green | Optional |
| is-red | imds-progress-bar | Red | Optional |
| is-yellow | imds-progress-bar | Yellow | Optional |
| is-orange | imds-progress-bar | Orange | Optional |
| is-cyan | imds-progress-bar | Cyan | Optional |
| is-gray | imds-progress-bar | Gray | Optional |
| is-white | imds-progress-bar | White | Optional |
| is-x-small | imds-progress-bar | Extra small size | Optional |
| is-small | imds-progress-bar | Small size | Optional |
| is-normal | imds-progress-bar | Normal size | Optional |
| is-medium | imds-progress-bar | Medium size | Optional |
| is-large | imds-progress-bar | Large size | Optional |

## HTML Snippets

### Basic progress bar

```html
<div class="imds-progress-bar">
  <div class="imds-progress-bar-track">
    <div class="imds-progress-bar-fill" style="width: 60%;"></div>
  </div>
  <span class="imds-progress-bar-text">60%</span>
</div>
```

The following sections show only the differences from the basic progress bar.

## Variations

### color

Add a color class to `div.imds-progress-bar`.

```html
<div class="imds-progress-bar is-primary">  <!-- Primary -->
<div class="imds-progress-bar is-warning">  <!-- Warning -->
<div class="imds-progress-bar is-danger">   <!-- Danger -->
<div class="imds-progress-bar is-success">  <!-- Success -->
<div class="imds-progress-bar is-info">     <!-- Info -->
<div class="imds-progress-bar is-error">    <!-- Error -->
<div class="imds-progress-bar is-blue">     <!-- Blue -->
<div class="imds-progress-bar is-green">    <!-- Green -->
<div class="imds-progress-bar is-red">      <!-- Red -->
<div class="imds-progress-bar is-yellow">   <!-- Yellow -->
<div class="imds-progress-bar is-orange">   <!-- Orange -->
<div class="imds-progress-bar is-cyan">     <!-- Cyan -->
<div class="imds-progress-bar is-gray">     <!-- Gray -->
<div class="imds-progress-bar is-white">    <!-- White -->
```

### size

Add a size class to `div.imds-progress-bar`.

```html
<div class="imds-progress-bar is-x-small">  <!-- Extra small -->
<div class="imds-progress-bar is-small">    <!-- Small -->
<div class="imds-progress-bar is-normal">   <!-- Normal -->
<div class="imds-progress-bar is-medium">   <!-- Medium -->
<div class="imds-progress-bar is-large">    <!-- Large -->
```

### showProgressWithIcon (display progress with icon)

Display the progress state with an icon instead of text.
Replace `imds-progress-bar-text` with `imds-icon`.

```html
<div class="imds-progress-bar is-success is-x-small">
  <div class="imds-progress-bar-track">
    <div class="imds-progress-bar-fill" style="width: 60%;"></div>
  </div>
  <span
    class="imds-icon is-success"
    title="Enter what the icon represents in the title attribute">
    <i class="fa-solid fa-circle-check"></i>
  </span>
</div>
```

## Implementation Notes

- Control progress percentage via `style="width: XX%;"` on `imds-progress-bar-fill` (0–100%)
- Progress text and icon are mutually exclusive (do not place both simultaneously)
- When using an icon, explain its meaning using the `title` attribute for accessibility
- Apply the icon color class (such as `is-success`) to both the container and the icon
- Update progress by synchronizing the `width` of `imds-progress-bar-fill` and the displayed text with JavaScript
