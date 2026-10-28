---
paths:
  - "src/main/jssp/**/*.html"
---

# Indeterminate Checkbox (common-parts)

## Overview

A composite pattern used to represent a state where only some of multiple options are selected (indeterminate state).
It is needed when combining a "Select all / Deselect all" checkbox with individual options. It applies both to selecting all rows of a table and to selecting all items of a checkbox list.

- Source: `uiux-share/common-parts/不確定状態のチェックボックス.md`
- All child checkboxes selected → parent is `checked`
- All child checkboxes unselected → parent is `unchecked`
- Some child checkboxes selected → parent is `indeterminate` (tri-state)

## Components Used

| Base component used | Reference |
|---|---|
| Checkbox (`imds-checkbox`) | [imds-html-checkbox.md](imds-html-checkbox.md) |
| Divider (`imds-divider`) | [imds-html-divider.md](imds-html-divider.md) |

## HTML Snippets

`data-type="overall"` represents the parent (select all), and `data-type="ingredient"` represents the children (individual options).
`imds-divider` visually separates the parent from the children.

```html
<label class="imds-checkbox">
  <input type="checkbox" data-type="overall" />
  <span>All</span>
</label>
<hr class="imds-divider" />
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: Option 1]</span>
</label>
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: Option 2]</span>
</label>
<label class="imds-checkbox">
  <input type="checkbox" data-type="ingredient" />
  <span>[REPLACE: Option 3]</span>
</label>
```

## JS Control

The `indeterminate` property cannot be set via an HTML attribute, so control it with JavaScript.
When multiple groups exist on the same screen, narrow the scope by limiting the `data-type` lookup to the appropriate container (parent element).

```javascript
const initialize = () => {
  const overall = document.querySelector('input[data-type="overall"]');
  const ingredients = document.querySelectorAll('input[data-type="ingredient"]');

  const handleOverallClick = () => {
    const isChecked = overall.checked;
    ingredients.forEach((ingredient) => {
      ingredient.checked = isChecked;
    });
  };

  const handleIngredientClick = () => {
    const checkedCount = Array.from(ingredients).filter(
      (ingredient) => ingredient.checked
    ).length;
    overall.checked = checkedCount === ingredients.length;
    overall.indeterminate =
      checkedCount !== 0 && checkedCount !== ingredients.length;
  };

  if (overall && ingredients.length > 0) {
    overall.addEventListener('click', handleOverallClick);
    ingredients.forEach((ingredient) => {
      ingredient.addEventListener('click', handleIngredientClick);
    });
  }
};

document.addEventListener('DOMContentLoaded', initialize);
```

## Implementation Notes

- When applying this to a table header checkbox (select all rows), do not add an unnecessary `<span></span>` inside `label.imds-checkbox` (in a table context, use only the `input` without a `span`; see [imds-html-table.md](imds-html-table.md) for details). The `<label class="imds-checkbox"><input/><span>...</span></label>` form in this pattern is the standard form outside tables (checkbox lists, etc.).
- Do not use `fieldset`/`legend` to group checkboxes. The actual imds pattern consists only of a sequence of `label.imds-checkbox` elements.
- `indeterminate` is a property that can be set only via JavaScript; writing `<input indeterminate>` as an HTML attribute has no effect.
