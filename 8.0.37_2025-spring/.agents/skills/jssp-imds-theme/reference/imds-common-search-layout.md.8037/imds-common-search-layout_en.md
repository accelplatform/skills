# Search Layout (common-parts)

## Overview

A collection of established patterns for search parts / search areas that accompany list and confirmation tables.
Choose the search UX based on whether it is "server-side search" or "client filter (real-time narrowing)", and on the complexity and placement (top / right side) of the search conditions.

- Source: `uiux-share/common-parts/検索レイアウト.md`
- **(1) Top: search part (keyword + advanced search Popover)**: Based on keyword search, with compound conditions specified in a Popover. Runs on the search button or Enter (for server-side search).
- **(2) Right side: search area**: The search pane is always displayed, and compound conditions are specified while viewing results. For when there are few columns and room to the right of the table.
- **(3) Top: filter (real-time narrowing)**: Filters on the client immediately in response to input. No search button. Uses the clear button of `input[type=search]`. Best for narrowing import confirmation tables and small lists.
- Use it for list search ((1) advanced search / (2) right-side area / (3) filter narrowing), narrowing import confirmation tables ((3) filter), and cases such as application + table that have a list search.

## Components Used

| Base component used | Corresponding reference |
|---|---|
| TextboxControl (`imds-textbox-control`) | [imds-html-textbox-control.md](imds-html-textbox-control.md) |
| Textbox (`imds-textbox`) | [imds-html-textbox.md](imds-html-textbox.md) |
| InputGroup (`imds-input-group`) | [imds-html-input-group.md](imds-html-input-group.md) |
| Popover (`imds-popover`) | [imds-html-popover.md](imds-html-popover.md) |
| Button (`imds-button`) | [imds-html-button.md](imds-html-button.md) |
| Field / FieldContainer (`imds-field` / `imds-field-container`) | [imds-html-field.md](imds-html-field.md) |
| Checkbox (`imds-checkbox`) | [imds-html-checkbox.md](imds-html-checkbox.md) |

## Important Note (Search Button Color)

Do **not use a filled `is-primary`** on search buttons placed directly on the page. Many list screens already have a primary action such as "Create New" with `is-primary`, and a second one violates the DESIGN.md principle "one primary action per screen".
Choose the search button style according to where it is placed:

- A colorless `imds-button` (when it has no decoration, like the magnifier button outside the Popover in (1))
- `imds-button is-outlined is-primary` (a secondary expression when you want to show search as the main action on the page, like the submit button in the search area of (2))
- `imds-button is-primary` (filled; the search button inside the advanced search Popover of (1). Following the imds Storybook (Popover "Search filter and display item settings in a list"), place exactly one as the main action inside the Popover)

## Important Note (`aria-label` on Search Inputs)

Always give `aria-label` to search inputs that have no visible label (inputs with only a `placeholder`). `placeholder` is not a substitute for a label. The following snippets give `aria-label` in both (1) and (3).

## HTML Snippets

### (3) Top: Filter (Real-Time Narrowing) - Most Common, Minimal Configuration

Place the magnifying glass icon inside the input on the left (`imds-textbox-control is-left`). Do not use a fictitious `imds-search` class.

```html
<div class="imds-textbox-control is-left">
  <input type="search" class="imds-textbox" placeholder="Filter by [REPLACE: field name]" aria-label="Filter by [REPLACE: field name]" id="[REPLACE: filter-keyword]" />
  <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
</div>
```

- When there is no visible label, always add `aria-label` (placeholder alone is not enough).
- Word `placeholder` / `aria-label` as "Filter by <target field name>" (for (1), which runs on the search button, use "Search by <target field name>").
- Use `type="search"` so the input value can be cleared (x button).
- Narrow in real time in response to input (fire when input pauses). Do not place a search button.
- To limit the search target, a category selector (`imds-select`, etc.) may be placed on the left.

### (1) Top: Search Part (Keyword + Advanced Search Popover + Search Button)

Use `imds-input-group` to place the keyword input, the advanced search Popover trigger, and the search button side by side. The Popover content follows the structure of the imds Storybook (Popover "Search filter and display item settings in a list").

```html
<div class="imds-input-group">
  <input id=":searchKeywords:" type="search" class="imds-textbox" style="width: 20rem; max-width: 100%;" placeholder="Search by [REPLACE: field name]" aria-label="Search by [REPLACE: field name]" />
  <div class="imds-popover is-left">
    <button
      type="button"
      aria-haspopup="true"
      aria-controls="search-popover"
      aria-label="Advanced search"
      class="imds-button is-outlined">
      <span class="imds-icon is-small"><i class="fa-solid fa-sliders"></i></span>
      <span></span>
      <span class="imds-icon is-x-small"><i class="fa-solid fa-chevron-down"></i></span>
    </button>
    <div
      id="search-popover"
      role="menu"
      class="imds-popover-menu">
      <div class="imds-popover-content">
        <div style="display: grid; grid-template-rows: 1fr auto; width: max-content;">
          <div
            class="imds-py-3 imds-px-4 imds-scrollbar"
            style="grid-row: 1 / 2; overflow: auto;">
            <form id="search-condition-form" class="imds-form">
              <div class="imds-field-container">
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":matterNumber:">Matter Number</label></div>
                  <div class="imds-field-control">
                    <input type="text" id=":matterNumber:" class="imds-textbox" value="" />
                  </div>
                </div>
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":matterName:">Matter Name</label></div>
                  <div class="imds-field-control">
                    <input type="text" id=":matterName:" class="imds-textbox" value="" />
                  </div>
                </div>
                <div class="imds-field imds-w-15">
                  <div class="imds-field-label"><label for=":status:">Status</label></div>
                  <div class="imds-field-control">
                    <select id=":status:" class="imds-select">
                      <option>All</option>
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div
            class="imds-py-2 imds-px-4 imds-border-t-1"
            style="grid-row: 2 / 3;">
            <div style="display: flex; justify-content: flex-end; gap: 1em;">
              <button type="button" style="min-width: 8em;" class="imds-button is-normal">Clear</button>
              <button type="submit" form="search-condition-form" style="min-width: 8em;" class="imds-button is-normal is-primary">Search</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <button type="button" class="imds-button" aria-label="Search">
    <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
  </button>
</div>
```

```javascript
// Run the advanced search (Enter / Search button in the Popover)
document.getElementById('search-condition-form').addEventListener('submit', function (event) {
  event.preventDefault();   // Required. Missing it reloads the page
  searchList();             // Search by keyword + advanced conditions (implemented on the screen side)
  document.getElementById('search-popover').closest('.imds-popover').classList.remove('is-active');
});
```

- **Wrap the Popover content in a grid with `width: max-content`**. Without a width, the panel shrinks to the trigger button, and the width collapses so much that labels and button text wrap one character at a time
- Separate the condition input area (with `imds-scrollbar` and `overflow: auto`) from the button row (separated by `imds-border-t-1`), so the button row stays visible even with many conditions
- Align label widths by adding `imds-w-15` to `imds-field`. Replace the condition fields to fit the screen
- The button row is right-aligned: Clear (standard) on the left and Search (filled `is-primary`) on the right. Use `gap: 1em` for spacing and add `style="min-width: 8em;"` to each button (do not define custom classes)
- Keep the Search button in the button row (outside `<form>`), associate it with the form through the `form` attribute, and make it `type="submit"`. Without an associated submit button, pressing Enter does not submit a form that has two or more input fields
- Always call `event.preventDefault()` in the `submit` event handler to prevent the page from reloading. Make the Clear and trigger buttons `type="button"` (a `<button>` without `type` becomes a submit button inside a form)
- Because the Popover contains a `<form>`, do not wrap the whole `imds-input-group` in another `<form>` (nested `<form>` is invalid in HTML). Implement Enter search in the keyword field with `keydown` (see "Implementing Enter Key Events" in `.agents/requirements/jssp-presentation-page/AGENTS.md`) and call the same search process as the magnifier button's `click`
- Make the trigger button icon-only (`fa-sliders` + `fa-chevron-down`) and leave the `<span></span>` between the icons empty (do not put visible text such as "Advanced search" in it, to match the look of the imds Storybook). Because it has no visible text, add `aria-label` (e.g. `aria-label="Advanced search"`)
- Match the trigger button's `aria-controls` with the `id` of `imds-popover-menu` (see [imds-html-popover.md](imds-html-popover.md)). Give the id a unique name that fits the feature (no colons, since it is not an input element)
- Keep the advanced search conditions even after the Popover is closed. Clear resets all conditions; the Search button runs the search and closes the Popover
- Indicate that advanced search conditions are applied by adding `is-applied` to the trigger button (see JS Control below)
- The icon-only magnifier search button outside the Popover has no visible text, so add `aria-label`

### (2) Right Side: Search Area (Always Displayed, Compound Conditions)

Always display a search form to the right of the table. Specify the column width with an inline `style` (`width: 18rem; flex: 0 0 18rem;`).

```html
<form class="imds-form imds-p-4" style="width: 18rem; flex: 0 0 18rem;">
  <div class="imds-field-container">
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rc]">[REPLACE: Condition name 1]</label></div>
      <div class="imds-field-control">
        <input type="text" id="[REPLACE: rc]" class="imds-textbox" value="" />
      </div>
    </div>
    <div class="imds-field">
      <div class="imds-field-label"><label for="[REPLACE: rd]">[REPLACE: Condition name 2]</label></div>
      <div class="imds-field-control">
        <div class="imds-checkbox-group">
          <label class="imds-checkbox">
            <input type="checkbox" id="[REPLACE: rd]" />
            <span>[REPLACE: Filter option]</span>
          </label>
        </div>
      </div>
    </div>
    <div class="imds-mt-4" style="display: flex; justify-content: flex-end; gap: 1em;">
      <button type="button" class="imds-button" style="min-width: 8em;">Clear</button>
      <button type="submit" class="imds-button is-outlined is-primary" style="min-width: 8em;">Search</button>
    </div>
  </div>
</form>
```

- Button layout: Clear (standard) on the left, Search (`is-outlined is-primary`) on the right. The right side takes priority.
- For a client filter, place only the Clear button.
- Enter triggers search via `form` submit (always call `event.preventDefault()` in the `submit` event handler). Clear resets all conditions; the Search button runs the search (no re-search until clicked).

## JS Control

In the advanced search ((1)), indicate that conditions are applied with `is-applied` on the trigger button.

```javascript
// Reflect is-applied on the advanced search Popover trigger button
const updateAppliedState = (trigger, form) => {
  const hasValue = Array.from(form.querySelectorAll('input, select, textarea'))
    .some((element) => {
      if (element.type === 'checkbox' || element.type === 'radio') return element.checked;
      return element.value.trim() !== '';
    });
  trigger.classList.toggle('is-applied', hasValue);
};
```

For the real-time filter ((3)), narrow the target table rows on the `input` event (debounce recommended). Put the concrete narrowing logic on each screen's implementation side.

## CSS Intent

This pattern does not use custom classes (formerly `gx-search-*`). Specify widths and spacing with inline `style`, and margins with imds helper classes (such as `imds-mt-4`). Custom classes can have the same specificity as imds default styles and fail to override them, and if their definition is missing from `<style>`, the layout breaks (for example, the gap between buttons disappears) (see "Anti-pattern: Do Not Define Custom `.max-width-NNem` / `.min-width-NNem` Classes" in `.agents/requirements/jssp-presentation-page/AGENTS.md`).

## Implementation Notes

- Do not use a filled `is-primary` on search buttons placed on the page (to avoid duplicating primary actions such as "Create New"). Only the search button inside the advanced search Popover uses a filled `is-primary` (see "Important Note (Search Button Color)").
- Always add `aria-label` to search inputs without a visible label (see "Important Note (`aria-label` on Search Inputs)").
- Pattern (3) is for client filtering only (no search button); (1) and (2) assume server-side search.
