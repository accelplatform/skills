---
paths:
  - "src/main/jssp/**/*.html"
---

# Radio Button and Field Combination (common-parts)

## Overview

A composite pattern used when child fields that are always visible are controlled as `disabled`/`enabled` according to the radio button selection.
When no options exist (they cannot be retrieved dynamically), display `imds-inline-message is-warning`.

- Source: `uiux-share/common-parts/ラジオボタンとFieldの組み合わせ.md`
- Use it on settings screens and detailed settings forms when a radio selection enables child setting items.

**Choosing between this and the existing pattern "Radio conditional branch + child FieldGroup expansion"**:
- When child fields are controlled by "show/hide" (toggling `display` in JS), use the other pattern.
- This pattern controls child fields by "enabled/disabled" (the HTML `disabled` attribute). The fields are always visible and are presented in an inactive state.

## Components Used

| Base component used | Corresponding reference |
|---|---|
| Radio (`imds-radio`) | [imds-html-radio.md](imds-html-radio.md) |
| Field (`imds-field`) | [imds-html-field.md](imds-html-field.md) |
| Select (`imds-select`) | [imds-html-select.md](imds-html-select.md) |
| Checkbox (`imds-checkbox`) | [imds-html-checkbox.md](imds-html-checkbox.md) |
| InlineMessage (`imds-inline-message`) | [imds-html-inline-message.md](imds-html-inline-message.md) |

## Important Note (`name` Attribute)

For radio buttons to be mutually exclusive, always give **the same `name` attribute** to every `<input type="radio">` in the same group.
Without `name`, each one is treated as an independent option and selection is not exclusive. See [imds-html-radio-group.md](imds-html-radio-group.md) for details.
Every HTML snippet in this pattern specifies `name="[REPLACE: radio-name]"`. Do not omit this naming.

## HTML Snippets

### Pattern 1: When Options Exist ("Do not use" Selected by Default)

Child fields start as `disabled`, and JS removes `disabled` when "Use" is selected.
Child fields are indented from the parent radio (equivalent to `padding-left: var(--space-6)`) to show the subordinate relationship. Do not use `sample-*` classes; use inline styles instead.

```html
<div class="imds-section">
  <h1 class="imds-heading is-bordered">[REPLACE: Section title]</h1>
  <p class="imds-help-text">[REPLACE: Description]</p>

  <!-- Radio + child field container -->
  <div style="display: flex; flex-direction: column; gap: var(--space-3);">

    <!-- "Do not use" radio -->
    <label class="imds-radio has-text-weight-bold">
      <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: off-value]" checked />
      <span>[REPLACE: "Do not use" label]</span>
    </label>

    <!-- "Use" radio + child fields -->
    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
      <label class="imds-radio has-text-weight-bold">
        <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: on-value]" />
        <span>[REPLACE: "Use" label]</span>
      </label>

      <!-- Child fields (indent: var(--space-6)), initially disabled -->
      <div style="padding-left: var(--space-6); display: flex; flex-direction: column; gap: var(--space-2);">
        <div class="imds-field">
          <div class="imds-field-label">
            <label for="[REPLACE: select-id]">[REPLACE: Field label]</label>
          </div>
          <div class="imds-field-control">
            <select class="imds-select" id="[REPLACE: select-id]" disabled>
              <option value="">[REPLACE: Please select]</option>
              <option value="[REPLACE: value1]">[REPLACE: Option 1]</option>
            </select>
          </div>
        </div>
        <div class="imds-field">
          <div class="imds-field-control">
            <label class="imds-checkbox">
              <input type="checkbox" disabled />
              <span>[REPLACE: Checkbox label]</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

> The second `imds-field` above (for the checkbox) has no `imds-field-label`. A Field with a single control that needs no label may consist of `imds-field-control` only (see [imds-html-field.md](imds-html-field.md) for details).

### Pattern 2: When No Options Exist ("Use" Disabled)

Make the "Use" radio itself `disabled`, and display a warning message instead of the child fields.

```html
<div style="display: flex; flex-direction: column; gap: var(--space-2);">
  <label class="imds-radio has-text-weight-bold">
    <input type="radio" name="[REPLACE: radio-name]" value="[REPLACE: on-value]" disabled />
    <span>[REPLACE: "Use" label]</span>
  </label>
  <div style="padding-left: var(--space-6);">
    <div class="imds-inline-message is-warning">
      <span class="imds-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
      <p>[REPLACE: Warning text such as "There are no selectable items"]</p>
    </div>
  </div>
</div>
```

## Implementation Notes

- Always give the same `name` attribute to radios in the same group (see "Important Note" above).
- Specify the child field indent as `padding-left: var(--space-6)` with an inline style. Do not include explanatory `sample-*` classes in generated output.
- Implement JS control that removes every `disabled` attribute within the child fields when "Use" is selected, and adds `disabled` again when "Do not use" is selected.
- When options cannot be retrieved dynamically and there are 0, disable the radio and replace it with `imds-inline-message is-warning` (Pattern 2).
