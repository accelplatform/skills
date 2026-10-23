# Export Screen Implementation Example

An implementation example of a business export screen that combines imds theme components.
Using the "Assistant Definition" screen as the subject, this shows the composition pattern for the header, stepper, export method selection, target selection (list), and execution confirmation.

This page keeps the header fixed and scrolls only the content of each stepper step vertically. It uses the layout control pattern based on the fixed class names `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` (because it is based on `height: 100%`, loading `theme-conditional-layout.css` in `<imart type="head">` is mandatory; see "Implementation Notes" for details). For an explanation of the older approach that uses a different placeholder prefix for each feature, see [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md).

## Components Used

| Component | reference | Usage in this example |
|---------------|-----------|-------------|
| Header | [imds-html-header.md](../reference/imds-html-header.md) | Page header with related-screen menu |
| Stepper | [imds-html-stepper.md](../reference/imds-html-stepper.md) | Progress display for the export process |
| Message | [imds-html-message.md](../reference/imds-html-message.md) | Supplementary explanation of the export |
| Radio | [imds-html-radio.md](../reference/imds-html-radio.md) | Export method selection |
| Button | [imds-html-button.md](../reference/imds-html-button.md) | Export execute button / Next button |
| EmptyState | [imds-html-empty-state.md](../reference/imds-html-empty-state.md) | Display when the target selection area is empty |
| Table | [imds-html-table.md](../reference/imds-html-table.md) | Export target list table |
| Confirm | [imds-csjs-confirm.md](../reference/imds-csjs-confirm.md) | Confirmation dialog before executing the export |

## Overall Structure

Add `pgstyle-layout-container` (2-row grid) to `imds-container`, `pgstyle-layout-main` (vertical flex) to `<main>`, `pgstyle-layout-content` (`flex:1 0 0; overflow:auto`) to the scroll area of the step content, and `pgstyle-layout-footer` (`flex:0 0 auto`) to the fixed footer.

```
div.imds-container.pgstyle-layout-container    ... root div (placed inside the intra-mart theme's imui-container, so no id is assigned and no intermediate wrapper is inserted)
├── header.imds-header               ... page header (related-screen menu, title; fixed)
└── main.pgstyle-layout-main (vertical flex container)
    ├── div.imds-stepper              ... progress stepper (2 steps; fixed, flex:0 0 auto)
    └── section.pgstyle-layout-content (switched per step; has imds-scrollbar, flex:1 0 0; overflow:auto)
        ├── Step 1: Select Export Method
        │   ├── imds-message         ... supplementary message (optional)
        │   ├── imds-radio × 2        ... "All" / "Select" choices
        │   └── button                ... execute export or Next
        └── Step 2: Select Export Targets (follows the list screen; the section also has pgstyle-table-wrapper)
            ├── form > div.pgstyle-toolbar ... search field (server-side search; type="submit" + preventDefault())
            ├── imds-table            ... target list (with checkbox column)
            └── div.pgstyle-layout-footer (directly under main, outside the scroll area; flex:0 0 auto) ... Back / Export buttons
```

## 1. Page Header

Export screens often have a menu for switching to related screens (import screen, list screen, etc.), so use the `imds-header-nav` (with Popover) pattern. For a standalone screen that does not need a related-screen menu, the `imds-header-icon` pattern, as on the list screen, is also acceptable.

```html
<header class="imds-header">
  <div class="imds-popover is-left imds-header-nav">
    <button
      type="button"
      class="imds-button is-ghost is-large"
      aria-haspopup="true"
      aria-controls="imds-popover-nav">
      <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
      <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
    </button>
    <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
      <div class="imds-popover-content">
        <nav class="imds-menu">
          <ul class="imds-menu-list">
            <li><a href="#"><span>Assistant Definition List</span></a></li>
            <li><a href="#"><span>Assistant Definition Import</span></a></li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**Points:**
- Always place exactly one of `imds-header-icon` / `imds-header-back-button` / `imds-header-nav` in the header (per the mandatory rule in SKILL.md). Choose `imds-header-nav` when navigation to related screens is needed
- Do not place the export execute button in `imds-header-actions` (the principle of not placing business operation buttons in the header also applies to export screens)

## 2. Stepper

The export screen consists of 2 steps: "Select Export Method" → "Select Export Targets".

```html
<div class="imds-stepper">
  <ul>
    <li class="imds-stepper-step is-active">
      <button disabled><span>1.Select Export Method</span></button>
    </li>
    <li class="imds-stepper-step">
      <button disabled><span>2.Select Export Targets</span></button>
    </li>
  </ul>
</div>
```

**Points:**
- Move the `is-active` class with JavaScript to indicate the current step
- Keep each `<button>` `disabled` (the stepper is for progress display only and does not provide jumping between steps by clicking)

## 3. Step 1: Select Export Method

Consists of a supplementary message (optional) + radio buttons (All / Select) + an action button.

```html
<section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar" data-mode="new">
  <div class="imds-message is-outlined is-info imds-mb-4">
    <div class="imds-message-title">
      <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
      <p>Export Assistant Definitions</p>
    </div>
    <div class="imds-message-content">
      <p>Exports assistant definitions.</p>
      <p>Select an export method and click the Export button.</p>
    </div>
  </div>
  <h2 class="imds-heading is-size-4 has-text-weight-bold">Export Method</h2>
  <div>
    <div>
      <label class="imds-radio is-medium has-text-weight-bold">
        <input type="radio" name="export-method" value="all" checked="">
        <span>Export All</span>
      </label>
      <span class="imds-help-text imds-ml-7">Exports all assistant definitions.</span>
    </div>
    <div>
      <label class="imds-radio is-medium has-text-weight-bold">
        <input type="radio" name="export-method" value="select">
        <span>Select Assistant Definitions to Export</span>
      </label>
      <span class="imds-help-text imds-ml-7">Exports the assistant definitions selected from the list.</span>
    </div>
  </div>
  <button type="button" id="export-action-button" class="imds-button is-normal is-primary imds-mt-7" style="min-width: 8em;">
    Export
  </button>
</section>
```

**Points:**
- Select "Export All" on initial display
- Switch the caption and behavior of the bottom button according to the radio button selection
  - When "Export All" is selected: the button caption is "Export", and clicking it executes the export directly
  - When "Select to Export" is selected: the button caption is "Next", and clicking it moves to Step 2 (target selection)
- Displaying the message (`imds-message`) is not required; place it only when supplementary information is needed
- Because Step 1 has little content, place the button directly below the content instead of in a fixed footer (this falls under the exception in "Implementation Notes" of [imds-html-stepper.md](../reference/imds-html-stepper.md)). In Step 2, which has more content, place the Back and execute buttons in the fixed footer (`pgstyle-layout-footer`)

## 4. Step 2: Select Export Targets

**The layout follows the list screen (`imds-list-page.md`).** It consists of a search field, a table with a checkbox column, and a "Show selected only" checkbox.

```html
<section class="imds-py-4 imds-px-6 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
  <form id="search-form" class="imds-form">
    <div class="pgstyle-toolbar imds-mb-2">
      <div class="imds-input-group">
        <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search by assistant definition name" aria-label="Search by assistant definition name">
        <button type="submit" title="Search" class="imds-button is-outlined">
          <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
        </button>
      </div>
    </div>
  </form>
  <label class="imds-checkbox imds-mb-2">
    <input type="checkbox" id="show-selected-only">
    <span>Show selected only</span>
  </label>
  <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" style="height: 100%">
    <div class="imds-table-inner">
      <table>
        <thead>
          <tr>
            <th class="has-content-only"><label class="imds-checkbox"><input type="checkbox" id="select-all"></label></th>
            <th><span>Assistant Definition Name</span></th>
            <th><span>Updated By</span></th>
            <th>
              <div class="imds-table-column-actions">
                <button type="button" class="imds-table-sorter" title="Sort by updated date/time">
                  <span class="imds-table-sort-label">Updated Date/Time</span>
                  <span class="imds-icon"><i class="fa-solid fa-sort-up"></i><i class="fa-solid fa-sort-down"></i></span>
                </button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody id="export-target-table-body"></tbody>
      </table>
    </div>
  </div>
</section>
<!-- Place the footer directly under main, outside the scroll area (section), and fix it with pgstyle-layout-footer (flex:0 0 auto) -->
<div class="pgstyle-layout-footer imds-py-2 imds-px-6 imds-border-t-1">
  <button type="button" id="back-button" class="imds-button is-outlined" style="min-width: 8em;">Back</button>
  <button type="button" id="export-execute-button" class="imds-button is-primary" style="min-width: 8em;" disabled>Export</button>
</div>
```

**Points:**
- As on the list screen, compose the search field and table with `pgstyle-toolbar` / `is-area-bordered is-sticky is-narrow is-hoverable` + `style="height: 100%"`, and add `pgstyle-table-wrapper` to the section so the table fills the scroll area. Execute the search via `<form>` submit, and always call `event.preventDefault()` in the `submit` event handler
- Add `has-content-only` to the `th` / `td` of the checkbox column (not `has-text-centered`, because it has no header text)
- Match the footer's horizontal padding (`imds-px-6`) to the section's horizontal padding
- When search components are placed on both the tree/list side and the detail list side, keep the entered value when moving between categories
- When the keyword search target is linked to advanced search items, add the `is-applied` class to the advanced search Popover when the search is executed
- Always include the "Updated By" and "Updated Date/Time" columns, and make the updated date/time column sortable (the actual DOM structure is `th > div.imds-table-column-actions > button.imds-table-sorter[title] > span.imds-table-sort-label + span.imds-icon`; place both the `fa-sort-up` and `fa-sort-down` icons)
- Place a "Select all" checkbox in the header of the checkbox column. Checkboxes in the table consist only of `label.imds-checkbox > input`, with no extra `<span>`
- When data retrieval is expensive, show no tree selection and an empty list on initial display, and fetch the list only after a category is selected. While the list is empty, display the EmptyState from `reference/imds-html-empty-state.md` (e.g., "Select a category from the tree.")
- Keep the footer "Export" button `disabled` while no target is selected
- Clicking the "Back" button returns to Step 1

## 5. Export Execution Confirmation Dialog

Before executing the export, display a confirmation dialog that states the number of targets. Display the confirmation dialog with the `imdsConfirm` function (the following is the generated HTML structure).

```html
<dialog class="imds-confirm-wrapper">
  <div class="imds-confirm is-info">
    <div class="imds-confirm-content-wrapper">
      <button type="button" class="imds-confirm-close imds-button is-ghost">
        <span class="imds-icon"><i class="fa-solid fa-xmark"></i></span>
      </button>
      <div class="imds-confirm-content">
        <div class="imds-confirm-message-wrapper">
          <div class="imds-confirm-icon">
            <span class="imds-icon is-x-small is-info"><i class="fa-solid fa-circle-question"></i></span>
          </div>
          <div class="imds-confirm-message">
            <p class="imds-confirm-message-title">Export the assistant definitions?</p>
            <div class="imds-confirm-message-content">Export targets: 10</div>
          </div>
        </div>
      </div>
    </div>
    <div class="imds-confirm-footer">
      <div class="imds-confirm-footer-content">
        <button type="button" class="imds-button">Cancel</button>
        <button type="button" class="imds-button is-primary">Export</button>
      </div>
    </div>
  </div>
</dialog>
```

**Points:**
- Always display the number of selected items (e.g., "Export targets: 10") so users can confirm beforehand that they selected the intended targets
- The root element of the confirmation dialog is `<dialog class="imds-confirm-wrapper">` (generated by the `imdsConfirm` function; see `reference/imds-csjs-confirm.md`). It differs from `imds-dialog-wrapper` of the generic dialog

## Full Code (Step 1)

Do not assign an id to the root `<div>`; assign only `class="imds-container ..."` and do not create an intermediate wrapper. Apply `pgstyle-layout-container` (2-row grid) to `imds-container`, `pgstyle-layout-main` (vertical flex) to `<main>`, and `pgstyle-layout-content` (`flex: 1 0 0; overflow: auto;`) to the step content (with `imds-scrollbar`) (see "Implementation Notes" for the CSS definitions).

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">
    <div class="imds-popover is-left imds-header-nav">
      <button
        type="button"
        class="imds-button is-ghost is-large"
        aria-haspopup="true"
        aria-controls="imds-popover-nav">
        <span class="imds-icon is-medium is-primary"><i class="imds-iconfont imds-application"></i></span>
        <span class="imds-icon is-x-small is-primary"><i class="fa-solid fa-caret-down"></i></span>
      </button>
      <div id="imds-popover-nav" role="menu" class="imds-popover-menu">
        <div class="imds-popover-content">
          <nav class="imds-menu">
            <ul class="imds-menu-list">
              <li><a href="#"><span>Assistant Definition List</span></a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>
  <main class="pgstyle-layout-main">
    <div class="imds-stepper">
      <ul>
        <li class="imds-stepper-step is-active">
          <button disabled><span>1.Select Export Method</span></button>
        </li>
        <li class="imds-stepper-step">
          <button disabled><span>2.Select Export Targets</span></button>
        </li>
      </ul>
    </div>
    <section class="imds-py-4 imds-px-6 pgstyle-layout-content imds-scrollbar" data-mode="new">
      <div class="imds-message is-outlined is-info imds-mb-4">
        <div class="imds-message-title">
          <span class="imds-icon is-medium"><i class="fa-solid fa-circle-info"></i></span>
          <p>Export Assistant Definitions</p>
        </div>
        <div class="imds-message-content">
          <p>Exports assistant definitions.</p>
          <p>Select an export method and click the Export button.</p>
        </div>
      </div>
      <h2 class="imds-heading is-size-4 has-text-weight-bold">Export Method</h2>
      <div>
        <div>
          <label class="imds-radio is-medium has-text-weight-bold">
            <input type="radio" name="export-method" value="all" checked="">
            <span>Export All</span>
          </label>
          <span class="imds-help-text imds-ml-7">Exports all assistant definitions.</span>
        </div>
        <div>
          <label class="imds-radio is-medium has-text-weight-bold">
            <input type="radio" name="export-method" value="select">
            <span>Select Assistant Definitions to Export</span>
          </label>
          <span class="imds-help-text imds-ml-7">Exports the assistant definitions selected from the list.</span>
        </div>
      </div>
      <button type="button" id="export-action-button" class="imds-button is-normal is-primary imds-mt-7" style="min-width: 8em;">
        Export
      </button>
    </section>
  </main>
</div>
```

## Implementation Notes

- Control step switching (moving `is-active` and switching the displayed section) with JavaScript
- Replace the parts corresponding to `${sample}` (data type name) with the data type name being implemented
- The Step 2 table, search, and pagination follow the list screen pattern in `imds-list-page.md` as is (to avoid duplication, see the list screen template for details)
- When data retrieval is inexpensive, also place the export target checkbox column on the tree side and link them. When it is expensive, place it only on the table side
- Because this screen pairs with the import screen, the header's `imds-header-nav` menu often includes links to the import screen and list screen
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-layout-footer` / `pgstyle-table-wrapper` / `pgstyle-toolbar` are fixed class names, **not** placeholders to be replaced per feature. Do not change these class names when generating (likewise, do not change standard classes starting with `imds-`)
- Because this template covers only the HTML part, define the following layout control styles in the `<style>` of `<imart type="head">` (only the classes used in this file are listed)

  ```css
  /* Layout control styles */
  .pgstyle-layout-container {
    grid-template-rows: 5rem minmax(0, 1fr);
    grid-template-columns: 100%;
    height: 100%;
    display: grid;
  }
  .pgstyle-layout-container > .imds-header {
    grid-row: 1 / 2;
  }
  .pgstyle-layout-main {
    flex-direction: column;
    grid-row: 2 / 3;
    height: 100%;
    display: flex;
  }
  .pgstyle-layout-content {
    flex: 1 0 0;
    overflow: auto;
  }
  .pgstyle-table-wrapper {
    display: flex;
    flex-direction: column;
  }
  .pgstyle-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    justify-content: space-between;
    gap: 0.5em 1em;
  }
  .pgstyle-toolbar > .imds-input-group {
    max-width: 30em;
    flex: 1 0 20em;
  }
  .pgstyle-layout-footer {
    flex: 0 0 auto;
    display: flex;
    justify-content: left;
    gap: 2em;
  }
  ```

- In addition, `<imart type="head">` must load `im_design_system/theme/css/theme-conditional-layout.css` (CSS that controls the height and width of the content display area, which differ by theme). Without it, the height of `.imds-container` is not determined, `flex: 1 0 0` of `pgstyle-layout-content` has nothing to grow into, and the content area collapses to a height of 0.

  ```html
  <!-- CSS that controls the height and width of the content display area, which differ by theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```
