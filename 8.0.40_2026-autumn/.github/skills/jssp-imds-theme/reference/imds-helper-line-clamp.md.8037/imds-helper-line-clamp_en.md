---
paths:
  - "src/main/jssp/**/*.html"
---

# LineClamp (Line Clamp Utility)

## Overview

LineClamp is a set of imds helper classes for truncating text with an ellipsis after a specified number of lines. These are imds utility classes used in combination with any element containing text, such as a `p` element. They are not used as standalone components.

- Source: `uiux-share/helper/LineClamp.md`
- Naming convention: `imds-line-clamp-{lines}` (1 to 5 are defined)

## CSS Classes Reference

| Class name | Purpose | Value |
|----------|------|----|
| `imds-line-clamp-1` | Truncates after 1 line | Visible lines: 1 |
| `imds-line-clamp-2` | Truncates after 2 lines | Visible lines: 2 |
| `imds-line-clamp-3` | Truncates after 3 lines | Visible lines: 3 |
| `imds-line-clamp-4` | Truncates after 4 lines | Visible lines: 4 |
| `imds-line-clamp-5` | Truncates after 5 lines | Visible lines: 5 |

## Usage Examples

### Long text truncated after 2 lines

```html
<div class="sample-box-container imds-border-1">
  <p class="imds-line-clamp-2">
    The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
  </p>
</div>
```

## Implementation Notes

- Use when you want to truncate long text in a limited area, such as cell text on list screens or summary displays.
- Provide a `title` attribute, tooltip, or link to a detail view so users can see the full truncated text.
- Its purpose differs from `imds-scrollbar` (`imds-helper-scrollbar.md`). LineClamp cuts text off at a number of lines and shows an ellipsis, whereas Scrollbar adjusts the appearance of scrollable areas.
