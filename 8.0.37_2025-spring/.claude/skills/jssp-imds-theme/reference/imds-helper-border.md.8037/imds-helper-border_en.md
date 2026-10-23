---
paths:
  - "src/main/jssp/**/*.html"
---

# Border (Border Utility)

## Overview

Border is a set of imds helper classes for adding or removing borders on an element. The border width can also be adjusted. These are imds utility classes used in combination with any component-specific class. They are not used as standalone components.

- Source: `uiux-share/helper/Border.md`
- Naming convention: `imds-border{-direction}-{width}` (all sides when the direction is omitted; `0` means no border, `1`/`2` are width levels)

## CSS Classes Reference

| Class name | Sides applied | Width |
|----------|-----------|------|
| `imds-border-0` | All sides | None (0) |
| `imds-border-1` | All sides | Thin (level 1) |
| `imds-border-2` | All sides | Thick (level 2) |
| `imds-border-t-0` | Top | None (0) |
| `imds-border-t-1` | Top | Thin (level 1) |
| `imds-border-t-2` | Top | Thick (level 2) |
| `imds-border-r-0` | Right | None (0) |
| `imds-border-r-1` | Right | Thin (level 1) |
| `imds-border-r-2` | Right | Thick (level 2) |
| `imds-border-b-0` | Bottom | None (0) |
| `imds-border-b-1` | Bottom | Thin (level 1) |
| `imds-border-b-2` | Bottom | Thick (level 2) |
| `imds-border-l-0` | Left | None (0) |
| `imds-border-l-1` | Left | Thin (level 1) |
| `imds-border-l-2` | Left | Thick (level 2) |
| `imds-border-x-0` | Left and right | None (0) |
| `imds-border-x-1` | Left and right | Thin (level 1) |
| `imds-border-x-2` | Left and right | Thick (level 2) |
| `imds-border-y-0` | Top and bottom | None (0) |
| `imds-border-y-1` | Top and bottom | Thin (level 1) |
| `imds-border-y-2` | Top and bottom | Thick (level 2) |

## Usage Examples

### Border on all sides

```html
<div class="sample-box-container imds-border-1"></div>
```

### Thick border on the top side only

```html
<div class="sample-box-container imds-border-t-2"></div>
```

### Border on the left and right sides only

```html
<div class="sample-box-container imds-border-x-1"></div>
```

## Implementation Notes

- When the non-directional classes (`imds-border-*`) and directional classes (`imds-border-t-*`, etc.) are used together, unintended overrides can occur depending on CSS order and specificity, so use one of them as the basis.
- Often used together with `imds-line-clamp-*` or `imds-scrollbar` to improve the visibility of content areas (see `imds-helper-line-clamp.md` / `imds-helper-scrollbar.md`).
