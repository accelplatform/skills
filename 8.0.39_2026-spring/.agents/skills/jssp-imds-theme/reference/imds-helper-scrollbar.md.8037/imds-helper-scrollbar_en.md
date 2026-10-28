# Scrollbar (Scrollbar Utility)

## Overview

Scrollbar is an imds helper class that makes scrollbars less prominent and keeps content areas easy to read. It is an imds utility class used in combination with block elements that have `overflow: auto` / `overflow: scroll` or similar (such as overflow areas of Flexbox or Grid). It is not used as a standalone component.

- Source: `uiux-share/helper/Scrollbar.md`

## CSS Classes Reference

| Class name | Purpose | Value (Property: Value) |
|----------|------|----------------------|
| `imds-scrollbar` | Gives the scrollbar a thin, highly visible design | `scrollbar-color: hsl(0deg, 0%, 69%) hsl(0deg, 0%, 100%); scrollbar-width: thin;` |

## Usage Examples

### Scroll area containing text

Before (standard scrollbar)

```html
<div class="sample-box">
  <div
    class="sample-box-container imds-border-1"
    style="overflow: scroll">
    <p>
      The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
    </p>
  </div>
</div>
```

After (`imds-scrollbar` added)

```html
<div class="sample-box">
  <div
    class="sample-box-container imds-border-1 imds-scrollbar"
    style="overflow: scroll">
    <p>
      The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps. Bawds jog, flick quartz, vex nymphs.
    </p>
  </div>
</div>
```

## Implementation Notes

- When applying `imds-scrollbar`, the target container needs an overflow setting such as `overflow: auto` or `overflow: scroll` for the scrollbar to appear. Specify it with an inline `style` or layout-side styles as needed.
- `imds-scrollbar` changes only the appearance of the scrollbar and does not control the overflow behavior itself.
