---
paths:
  - "src/main/jssp/**/*.html"
---

# Data List Combined with Input Element (common-parts)

## Overview

A composite pattern used when you want to show a list of suggestions in an input field and allow both selecting a suggestion and entering free text.
It combines `<input list="...">` with `<datalist>` and uses the browser's native autocomplete UI.

- Suited to cases with few options (up to about 20) where free text input is also allowed.
- When there are many options, or when free text is not allowed and a selection is mandatory, use `<select>` + `imds-select` ([imds-html-select.md](imds-html-select.md)). Do not use this pattern.
- Source: `uiux-share/common-parts/データリストと入力要素の組み合わせ.md`

## Components Used

| Base component used | Reference |
|---|---|
| Textbox (`imds-textbox`) | [imds-html-textbox.md](imds-html-textbox.md) |
| Field (`imds-field`) | [imds-html-field.md](imds-html-field.md) |

`<datalist>` itself is a standard HTML element with no imds-specific class, and it is not part of the imds component system.

## HTML Snippets

### Standalone (Without Field)

```html
<div>
  <input
    type="text"
    id="[REPLACE: input-id]"
    placeholder="Enter or select a value"
    class="imds-textbox"
    list="[REPLACE: datalist-id]"
    value="" />
  <datalist id="[REPLACE: datalist-id]">
    <option value="[REPLACE: Option 1]"></option>
    <option value="[REPLACE: Option 2]"></option>
    <option value="[REPLACE: Option 3]"></option>
  </datalist>
</div>
```

### Combined with Field

Place `<input>` and `<datalist>` inside `imds-field-control`. For the structure of Field itself, see [imds-html-field.md](imds-html-field.md).

```html
<div class="imds-field">
  <div class="imds-field-label">
    <label for="[REPLACE: input-id]">[REPLACE: Label]</label>
  </div>
  <div class="imds-field-control">
    <input
      type="text"
      id="[REPLACE: input-id]"
      placeholder="Enter or select a value"
      class="imds-textbox"
      list="[REPLACE: datalist-id]" />
    <datalist id="[REPLACE: datalist-id]">
      <option value="[REPLACE: Option 1]"></option>
      <option value="[REPLACE: Option 2]"></option>
    </datalist>
  </div>
</div>
```

## Implementation Notes

- The `list` attribute of `<input>` must always match the `id` of `<datalist>`.
- Replace the `id`s (`input-id` / `datalist-id`) so that they are unique within the screen.
- The class of `<input>` is the same as the regular `imds-textbox`; there is no class dedicated to data lists.
- Because the browser's native autocomplete UI is used, the appearance of the suggestions (font, colors) cannot be customized with imds.
