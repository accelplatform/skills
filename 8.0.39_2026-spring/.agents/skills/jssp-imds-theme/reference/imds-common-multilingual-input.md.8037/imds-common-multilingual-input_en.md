# Multilingual Input Field (common-parts)

## Overview

A composite pattern used when registering input values in multiple languages with the multilingual feature of intra-mart Accel Platform.
A globe button is placed next to the standard language (Japanese) field, and clicking it expands/collapses the additional language fields.

- Source: `uiux-share/common-parts/多言語の入力欄.md`
- Fields for languages other than the standard one are generated dynamically (they depend on the platform's language settings).
- Apply this when the requirements include "multilingual", "localization", "language switching", or "per-language input".
- Use it for multilingual fields such as names and descriptions, and in forms on settings screens, master management screens, and import screens.

## Components Used

| Base component used | Reference |
|---|---|
| FieldGroup (`imds-field-group`) | [imds-html-field-group.md](imds-html-field-group.md) |
| Field (`imds-field`) | [imds-html-field.md](imds-html-field.md) |
| Textbox (`imds-textbox`) | [imds-html-textbox.md](imds-html-textbox.md) |
| Button (`imds-button`) | [imds-html-button.md](imds-html-button.md) |
| Divider (`imds-divider`) | [imds-html-divider.md](imds-html-divider.md) |

## HTML Snippets

### Vertical (Default)

`imds-w-15` is the width class for the whole FieldGroup, and `imds-w-25` is the width class for the inner fields (for the list of width classes, see [imds-html-field.md](imds-html-field.md)).

> **Width class**: Always explicitly apply the same width class (e.g. `imds-w-25`) to every `imds-field`, for both the standard field and the additional language fields. If omitted, the input lengths will not line up across fields in the generated output.

```html
<div class="imds-field-group imds-w-15">
  <div class="imds-field-group-label"><span>Multilingual</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field imds-w-25">
      <div class="imds-field-label">
        <label for="[REPLACE: std-input-id]">Standard</label>
      </div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: std-input-id]" class="imds-textbox" value="" />
        <button id="[REPLACE: toggle-btn-id]" type="button" class="imds-button">
          <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
        </button>
      </div>
    </div>
    <!-- Additional language fields (hidden initially, toggled by JS). The actual language set depends on platform settings and is generated dynamically. The following is a representative example (Japanese, English, Chinese) -->
    <hr id="[REPLACE: divider-id]" class="imds-divider" style="display: none;" />
    <div id="[REPLACE: localized-group-id]" style="display: none;">
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-ja]">Japanese</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-ja]" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-en]">English</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-en]" class="imds-textbox" value="" />
        </div>
      </div>
      <div class="imds-field imds-w-25">
        <div class="imds-field-label">
          <label for="[REPLACE: lang-input-id-zh]">Chinese (People's Republic of China)</label>
        </div>
        <div class="imds-field-control">
          <input type="text" id="[REPLACE: lang-input-id-zh]" class="imds-textbox" value="" />
        </div>
      </div>
      <!-- Add or remove this imds-field as languages are added or removed -->
    </div>
  </div>
</div>
```

### Horizontal (`is-horizontal`)

Use this to place the label and control side by side.

> **Width class**: As with the vertical layout, explicitly apply the same `imds-w-25` to every `imds-field`, for both the standard field and the additional language fields.
> **Accessibility note**: This horizontal pattern assigns the `id` to the outer width-adjusting `<div>` rather than to `<input>`, which breaks the association between `<label for="...">` and `<input>`. Always add `aria-label="[language name]"` (the same text as the label) to each `<input>` (omitting it violates the lint rule `input-no-label`).

```html
<div class="imds-field-group is-horizontal imds-w-15">
  <div class="imds-field-group-label"><span>Multilingual</span></div>
  <div class="imds-field-group-control">
    <div class="imds-field imds-w-25">
      <div class="imds-field-label">
        <label for="[REPLACE: std-input-id]">Standard</label>
      </div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: std-input-id]" class="imds-textbox" value="" />
        <button id="[REPLACE: toggle-btn-id]" type="button" class="imds-button">
          <span class="imds-icon"><i class="fa-solid fa-globe"></i></span>
        </button>
      </div>
    </div>
    <!-- The actual language set depends on platform settings and is generated dynamically. The following is a representative example (Japanese, English, Chinese) -->
    <hr id="[REPLACE: divider-id]" class="imds-divider" style="display: none;" />
    <div id="[REPLACE: localized-group-id]" class="imds-field-group" style="display: none;">
      <div class="imds-field-group-control">
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-ja]">Japanese</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-ja]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="Japanese">
            </div>
          </div>
        </div>
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-en]">English</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-en]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="English">
            </div>
          </div>
        </div>
        <div class="imds-field imds-w-25">
          <div class="imds-field-label">
            <label for="[REPLACE: lang-input-id-zh]">Chinese (People's Republic of China)</label>
          </div>
          <div class="imds-field-control">
            <div id="[REPLACE: lang-input-id-zh]" style="width: 100%; padding-right: calc(1em + 3.2rem);">
              <input type="text" class="imds-textbox" value="" aria-label="Chinese (People's Republic of China)">
            </div>
          </div>
        </div>
        <!-- Add or remove this imds-field as languages are added or removed -->
      </div>
    </div>
  </div>
</div>
```

## JS Control

Clicking the globe button toggles the visibility of the divider and the additional language group.
Replace `[REPLACE: toggle-btn-id]` / `[REPLACE: divider-id]` / `[REPLACE: localized-group-id]` with the actual ids.

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('[REPLACE: toggle-btn-id]');
  const divider = document.getElementById('[REPLACE: divider-id]');
  const localizedGroup = document.getElementById('[REPLACE: localized-group-id]');

  toggleButton.addEventListener('click', () => {
    const isHidden = divider.style.display === 'none';
    divider.style.display = isHidden ? '' : 'none';
    localizedGroup.style.display = isHidden ? '' : 'none';
  });
});
```

## Implementation Notes

- Always explicitly apply the same width class (e.g. `imds-w-25`) to the standard field and the additional language fields.
- In the horizontal layout, the `id` is assigned to the outer `div` instead of `<input>`, so the association with `label` is lost. Always add `aria-label` to each `<input>`.
- The number of additional language fields increases or decreases dynamically depending on the platform's language settings. Japanese, English, and Chinese are representative examples; implement dynamic generation.
