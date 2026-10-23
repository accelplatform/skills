# Truncated Display of Long Text (common-parts)

## Overview

A composite pattern used when long text in table cells, detail forms, cards, etc. is initially truncated to one line and expanded/collapsed by clicking.
It includes consideration so as not to interfere with text range selection (copy) operations.

- Source: `uiux-share/common-parts/長いテキストの省略表示.md`
- Use it when expand/collapse is needed in a table's remarks or description column, when truncating long text in a field on a detail view, or when collapsing long descriptions in cards, panels, etc.

**Choosing between this and the existing pattern "Long text truncation in table cells (LineClamp alone)"**:
- LineClamp alone: static truncation by just adding an `imds-line-clamp-*` class. No interaction.
- This pattern: with interaction that toggles expand/collapse on click. A caret icon visualizes the state.

## Components Used

| Base component used | Corresponding reference |
|---|---|
| IconFont (`imds-icon`) | [imds-html-icon-font.md](imds-html-icon-font.md) |

`imds-line-clamp-*` is a helper utility class (LineClamp) (see [imds-helper-line-clamp.md](imds-helper-line-clamp.md) for details). This pattern uses it by adding `imds-line-clamp-1` (one-line truncation) to the `<p>` inside the trigger element.

## HTML Snippets

Lay out the caret icon and text horizontally with flex, and make the whole container the click area.
Give `[REPLACE: unique-id]` an ID that is unique within the page and bind it in JS.

```html
<div class="imds-line-clamp-trigger" id="[REPLACE: unique-id]" title="[REPLACE: Open text]"
     style="display: flex; align-items: flex-start; cursor: pointer; max-width: 100%;">
  <span class="imds-icon imds-mr-2">
    <i class="fa-solid fa-caret-right"></i>
  </span>
  <p class="imds-line-clamp-1">
    [REPLACE: Long text to truncate]
  </p>
</div>
```

## JS Control

When there are multiple expand blocks on the same screen, get the target elements together by the `.imds-line-clamp-trigger` class, and locate the `p` / `i` within each container by descendant search.

```javascript
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".imds-line-clamp-trigger").forEach((container) => {
    const pElement = container.querySelector("p");
    const iconElement = container.querySelector("i");

    container.addEventListener("click", (event) => {
      event.stopPropagation();

      if (window.getSelection()?.toString()) {
        // Do not toggle while text is selected (copy operation)
        return;
      }

      pElement.classList.toggle("imds-line-clamp-1");

      if (iconElement.classList.contains("fa-caret-right")) {
        iconElement.classList.remove("fa-caret-right");
        iconElement.classList.add("fa-caret-down");
        container.setAttribute("title", "Close");
      } else {
        iconElement.classList.remove("fa-caret-down");
        iconElement.classList.add("fa-caret-right");
        container.setAttribute("title", "Open");
      }
    });
  });
});
```

## CSS Intent

Layout intent of the trigger container (explanatory classes equivalent to `sample-explanation` are not included in generated output; use inline `style` instead):

- `display: flex; align-items: flex-start` → icon and text laid out horizontally, aligned at the top
- `cursor: pointer` → indicates it is clickable
- `max-width: 100%` → fits within the parent container width

## Implementation Notes

- Do not toggle when `window.getSelection().toString()` is not empty (text is selected). This is a required consideration so as not to interfere with copy operations.
- On each click, keep adding/removing `imds-line-clamp-1`, switching `fa-caret-right` / `fa-caret-down`, and updating the `title` attribute ("Open" ⇔ "Close") in sync.
- Do not include explanatory `sample-*` classes in generated output. Use inline `style` for layout instead.
