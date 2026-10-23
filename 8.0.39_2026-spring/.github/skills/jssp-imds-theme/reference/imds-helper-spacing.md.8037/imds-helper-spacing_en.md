---
paths:
  - "src/main/jssp/**/*.html"
---

# Spacing (Spacing Utility)

## Overview

Spacing is a set of imds helper classes for specifying margin / padding. These are imds utility classes used in combination with component-specific classes (such as `imds-field` or `imds-button`). They are not used as standalone components.

- Source: `uiux-share/helper/Spacing.md`
- Naming convention: `imds-{shortcut}-{value}` (e.g. `imds-p-2`, `imds-mt-4`, `imds-mx-auto`)

## CSS Classes Reference

| Property | Shortcut | `0` | `0.4rem (4px)` | `0.8rem (8px)` | `1.2rem (12px)` | `1.6rem (16px)` | `2rem (20px)` | `2.4rem (24px)` | `2.8rem (28px)` | `3.2rem (32px)` | `auto` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `margin` | `m` | `imds-m-0` | `imds-m-1` | `imds-m-2` | `imds-m-3` | `imds-m-4` | `imds-m-5` | `imds-m-6` | `imds-m-7` | `imds-m-8` | `imds-m-auto` |
| `margin-top` | `mt` | `imds-mt-0` | `imds-mt-1` | `imds-mt-2` | `imds-mt-3` | `imds-mt-4` | `imds-mt-5` | `imds-mt-6` | `imds-mt-7` | `imds-mt-8` | `imds-mt-auto` |
| `margin-right` | `mr` | `imds-mr-0` | `imds-mr-1` | `imds-mr-2` | `imds-mr-3` | `imds-mr-4` | `imds-mr-5` | `imds-mr-6` | `imds-mr-7` | `imds-mr-8` | `imds-mr-auto` |
| `margin-bottom` | `mb` | `imds-mb-0` | `imds-mb-1` | `imds-mb-2` | `imds-mb-3` | `imds-mb-4` | `imds-mb-5` | `imds-mb-6` | `imds-mb-7` | `imds-mb-8` | `imds-mb-auto` |
| `margin-left` | `ml` | `imds-ml-0` | `imds-ml-1` | `imds-ml-2` | `imds-ml-3` | `imds-ml-4` | `imds-ml-5` | `imds-ml-6` | `imds-ml-7` | `imds-ml-8` | `imds-ml-auto` |
| margin-left and margin-right | `mx` | `imds-mx-0` | `imds-mx-1` | `imds-mx-2` | `imds-mx-3` | `imds-mx-4` | `imds-mx-5` | `imds-mx-6` | `imds-mx-7` | `imds-mx-8` | `imds-mx-auto` |
| margin-top and margin-bottom | `my` | `imds-my-0` | `imds-my-1` | `imds-my-2` | `imds-my-3` | `imds-my-4` | `imds-my-5` | `imds-my-6` | `imds-my-7` | `imds-my-8` | `imds-my-auto` |
| `padding` | `p` | `imds-p-0` | `imds-p-1` | `imds-p-2` | `imds-p-3` | `imds-p-4` | `imds-p-5` | `imds-p-6` | `imds-p-7` | `imds-p-8` | `imds-p-auto` |
| `padding-top` | `pt` | `imds-pt-0` | `imds-pt-1` | `imds-pt-2` | `imds-pt-3` | `imds-pt-4` | `imds-pt-5` | `imds-pt-6` | `imds-pt-7` | `imds-pt-8` | `imds-pt-auto` |
| `padding-right` | `pr` | `imds-pr-0` | `imds-pr-1` | `imds-pr-2` | `imds-pr-3` | `imds-pr-4` | `imds-pr-5` | `imds-pr-6` | `imds-pr-7` | `imds-pr-8` | `imds-pr-auto` |
| `padding-bottom` | `pb` | `imds-pb-0` | `imds-pb-1` | `imds-pb-2` | `imds-pb-3` | `imds-pb-4` | `imds-pb-5` | `imds-pb-6` | `imds-pb-7` | `imds-pb-8` | `imds-pb-auto` |
| `padding-left` | `pl` | `imds-pl-0` | `imds-pl-1` | `imds-pl-2` | `imds-pl-3` | `imds-pl-4` | `imds-pl-5` | `imds-pl-6` | `imds-pl-7` | `imds-pl-8` | `imds-pl-auto` |
| padding-left and padding-right | `px` | `imds-px-0` | `imds-px-1` | `imds-px-2` | `imds-px-3` | `imds-px-4` | `imds-px-5` | `imds-px-6` | `imds-px-7` | `imds-px-8` | `imds-px-auto` |
| padding-top and padding-bottom | `py` | `imds-py-0` | `imds-py-1` | `imds-py-2` | `imds-py-3` | `imds-py-4` | `imds-py-5` | `imds-py-6` | `imds-py-7` | `imds-py-8` | `imds-py-auto` |

## Usage Examples

### Padding on a generic container

```html
<div class="imds-p-4">
  <p>Content</p>
</div>
```

### Vertical spacing with margin-top and margin-bottom (my)

```html
<div class="imds-my-3">
  <p>Content</p>
</div>
```

### Centering with auto

```html
<div class="imds-mx-auto imds-content-normal-width">
  <p>Centered content</p>
</div>
```

## Implementation Notes

- Only integer values `0` to `8` (in 0.4rem steps, `0`=0, `1`=4px to `8`=32px) and `auto` are defined. No class specifies an arbitrary px value, so use inline styles or similar when other spacing is needed.
- `auto` (`imds-p-auto` / `imds-m-auto`, etc.) is mainly used for centering with margin (`imds-mx-auto`). Note that specifying `auto` for padding is rarely useful.
- Applying an individual class (e.g. `imds-mt-2`) and a combined class (e.g. `imds-my-2`) to the same property at the same time can cause unintended overrides depending on CSS specificity and order, so use only one of them.
