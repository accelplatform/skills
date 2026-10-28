# List Screen Implementation Example

An implementation example of a business list screen combining imds theme components.
Using the "Inventory Management" screen as a subject, this shows the composition pattern of header, search area, table, and pagination.

This page uses a fixed-header layout with the fixed class names `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` (`height: 100%`-based, so loading `theme-conditional-layout.css` in `<imart type="head">` is mandatory — see "Implementation Notes"). The legacy pattern that uses a per-feature placeholder prefix is documented in [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md). The search field follows the server-side search pattern (`<form>` + `type="submit"` + `preventDefault()`) in [imds-common-search-layout.md](../reference/imds-common-search-layout.md).

## Components Used

| Component | reference | Usage in this example |
|---------------|-----------|-------------|
| Header | [imds-html-header.md](../reference/imds-html-header.md) | Page header with icon |
| InputGroup | [imds-html-input-group.md](../reference/imds-html-input-group.md) | Search keyword input field |
| Textbox | [imds-html-textbox.md](../reference/imds-html-textbox.md) | Search text input |
| Button | [imds-html-button.md](../reference/imds-html-button.md) | Search button / Create New button |
| Table | [imds-html-table.md](../reference/imds-html-table.md) | Data list table |
| Pagination | [imds-html-pagination.md](../reference/imds-html-pagination.md) | Page navigation |
| IconFont | [imds-html-icon-font.md](../reference/imds-html-icon-font.md) | Search icon |

## Overall Structure

Attach `pgstyle-layout-container` (2-row grid) to `imds-container`, `pgstyle-layout-main` (vertical flex) to `<main>`, and `pgstyle-layout-content` (`flex:1 0 0; overflow:auto`) to the scrollable content area. Do not add an intermediate `<section>` wrapper — group the table-related elements inside a single div directly under `<main>`.

```
div.imds-container.pgstyle-layout-container    ... Root div (do not give it an id — it sits inside the theme's own imui-container, and no intermediate wrapper is added)
├── header.imds-header                        ... Page header (icon + title; fixed)
└── main.pgstyle-layout-main (vertical flex container)
    └── div.pgstyle-table-wrapper.pgstyle-layout-content (imds-scrollbar attached. flex:1 0 0; overflow:auto)
        ├── form                    ... Search form (server-side search. type="submit" + preventDefault())
        │   └── div.pgstyle-toolbar ... Operation area (search field + Create New button)
        │       ├── imds-input-group ... Search keyword input group
        │       └── button           ... Create New button
        ├── div.imds-table          ... Data list table
        └── div#pagination          ... Pagination
```

## 1. Page Header

Basic configuration of icon + title (with subtitle).
Subtitle and title are dynamically output from the server side using `<imart>` tags.

```html
<header class="imds-header">
  <div class="imds-header-icon">
    <span class="imds-icon-wrapper is-large">
      <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
    </span>
  </div>
  <div class="imds-header-title">
    <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
    <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
  </div>
</header>
```

**Key points:**
- Use `<imart type="string">` to output values passed from the function container
- Use `escapeXml="true"` for XSS protection

## 2. Operation Area (Search Field + Create New Button)

**Data-action buttons such as "Create New" or "Add" must be placed directly above the list table, not in the header (`imds-header-actions`)** (UI team design rule). What may be placed in the header is limited to page-level meta operations such as "Settings" or "Export".

### 2-A. With Search Field

Place a search field using `imds-input-group` and a Create New button (`imds-button is-primary`) side by side.
`pgstyle-toolbar` is a custom class that controls the side-by-side layout of the search field and button.

**The search on this list screen is a server-side search** (the keyword is sent to the server to search again). Following the canonical pattern in [imds-common-search-layout.md](../reference/imds-common-search-layout.md), wrap the search field in a `<form>` and unify the implicit Enter submit and the search button (`type="submit"`) into a single path (running the search from a click handler on a `type="button"` is a misuse).

```html
<form id="search-form" class="imds-form">
  <div class="pgstyle-toolbar imds-mb-2">
    <div class="imds-input-group">
      <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search by product code or product name" aria-label="Search by product code or product name">
      <button type="submit" title="Search" class="imds-button is-outlined">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
    <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">Create New</button>
  </div>
</form>
```

```javascript
document.getElementById('search-form').addEventListener('submit', function (event) {
  event.preventDefault();   // Required. Omitting it causes an unintended page reload
  searchStockList();
});
```

**Key points:**
- Combine `imds-textbox` (`type="search"`) and search icon button inside `imds-input-group`
- Wrap the search field and search button in a `<form>`, and make the search button `type="submit"` (the Enter key runs the search through the same path)
- Always call `event.preventDefault()` in the `submit` event handler to prevent a page reload
- The "Create New" button is unrelated to search, so keep it `type="button"` so that it is not caught up in the `<form>` submit
- Add `title="Search"` to the search button to ensure accessibility
- Add `imds-mb-2` to provide a margin between the table
- Specify the search field width by defining `.pgstyle-toolbar > .imds-input-group { max-width: 30em; flex: 1 0 20em; }` in `<style>` (see the CSS in "Implementation Notes"). The values may be adjusted per screen to fit the placeholder and the expected search keyword length. Do not create a new class; use a descendant selector (to avoid having the same specificity as the imds default `.imds-input-group`, where the definition order could prevent overriding)
- The Create New button is without an icon by default (an icon may be added if needed), and its minimum width is specified with `style="min-width: 8em;"`

**Do not make the search button `is-primary` (important):**
For the search button, **use colorless (plain `imds-button`) or `is-outlined`, and do not add `is-primary`**.
There are two reasons:
- DESIGN.md has the principle "one primary action per screen", and on this list screen the "Create New" button takes the primary role. Making the search button `is-primary` as well puts two primaries on one screen, which violates the principle.
- Search is an auxiliary action that is used less often and is less important than "Create New", so its visual priority should be lower.

**`aria-label` on the search input is required (important):**
The search textbox has a `placeholder` but no visible `<label>`, so screen reader users cannot tell what the input is for.
**Always add `aria-label` (e.g. `aria-label="Search by product code or product name"`) to a search input without a visible label.** `placeholder` is not a substitute for `aria-label` (it disappears on focus and is handled inconsistently by assistive technologies).

**Wording of `placeholder` / `aria-label` for search inputs:**
Use "Search by <name of the searched field(s)>" (e.g. "Search by item name", "Search by product code or product name"). Do not use a generic word such as "Search keywords" or only a field name such as "Item name" (to show users what they can search by and to keep the wording consistent across screens). Use the same text for `placeholder` and `aria-label`.

### 2-B. Without Search Field (Create New Button Only)

When placing only the Create New button, align it **to the right** directly above the table.

```html
<div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
  <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">Create New</button>
</div>
```

## 3. Data List Table

Compose the list table in a 3-layer structure of `imds-table` > `imds-table-inner` > `table`.
Define column headers with `thead` and dynamically generate rows with JavaScript in `tbody`.

```html
<div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>Product Name</span></th>
          <th><span>Product Code</span></th>
          <th><span>Unit Price</span></th>
          <th><span>Stock Quantity</span></th>
          <th><span>Warehouse Number</span></th>
          <th><span>Remarks</span></th>
        </tr>
      </thead>
      <tbody id="stock-table-body"></tbody>
    </table>
  </div>
</div>
```

**Key points:**
- Define `tbody` as empty with `id="stock-table-body"` specified, and insert rows dynamically from JavaScript
- Do not provide a dedicated operation column such as "Edit"; place the main item that identifies the row (Product Name in this example) in the first column, and navigate to the edit/detail screen with an in-cell link (`<td><span><a href="...">Product Name</a></span></td>`)
- Set the link text with `textContent` and `href` with `setAttribute` (building attribute values by concatenating strings for `innerHTML` leaves room for XSS by breaking out of the attribute value)

```javascript
const link = document.createElement('a');
link.textContent = item.productName;
link.setAttribute('href', 'sample/stock/edit?productCode=' + encodeURIComponent(item.productCode));
const span = document.createElement('span');
span.appendChild(link);
const cell = document.createElement('td');
cell.appendChild(span);
```
- Add `is-area-bordered is-sticky is-narrow is-hoverable` and `style="height: 100%"` so the table fills the entire `pgstyle-layout-content` scroll area (`is-sticky` also enables a fixed header with vertical scrolling)
- `is-narrow` is not mandatory, but list tables apply it by default (to show more rows at once and increase information density)
- If any column uses `has-text-right` for right-aligned numbers, also add `is-bordered` to `imds-table`
- You can optionally add `is-stripe`, etc. to `imds-table`

## 4. Pagination

An area for placing a page navigation below the table.
Specify `id="pagination"` and dynamically generate `imds-pagination` with JavaScript. Add `imds-pagination is-small` to the generated `nav` to display it in small size.

```html
<div class="imds-mt-2" id="pagination"></div>
```

**Key points:**
- Add `imds-mt-2` to provide a top margin between the table
- Generate the pagination HTML dynamically with JavaScript (since the number of pages varies depending on the number of search results)
- When there are 0 search results, hide `#pagination` itself with `style.display = 'none'`, and restore it with `style.display = ''` when there is 1 or more (just emptying its content leaves the `imds-mt-2` margin)

## Full Code

Do not put an `id` on the root `<div>` — attach only `class="imds-container ..."`, with no intermediate wrapper. Attach `pgstyle-layout-container` (2-row grid) to `imds-container`, `pgstyle-layout-main` (vertical flex) to `<main>`, and `pgstyle-table-wrapper pgstyle-layout-content` (`flex: 1 0 0; overflow: auto;`) to the scrollable content area (with `imds-scrollbar` attached). Do not add an intermediate `<section>` wrapper — group the operation area, table, and pagination inside a single div directly under `<main>`.

```html
<div class="imds-container pgstyle-layout-container">
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="imds-iconfont imds-application"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <form id="search-form" class="imds-form">
        <div class="pgstyle-toolbar imds-mb-2">
          <div class="imds-input-group">
            <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search by product code or product name" aria-label="Search by product code or product name">
            <button type="submit" title="Search" class="imds-button is-outlined">
              <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">Create New</button>
        </div>
      </form>
      <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>Product Name</span></th>
                <th><span>Product Code</span></th>
                <th><span>Unit Price</span></th>
                <th><span>Stock Quantity</span></th>
                <th><span>Warehouse Number</span></th>
                <th><span>Remarks</span></th>
              </tr>
            </thead>
            <tbody id="stock-table-body"></tbody>
          </table>
        </div>
      </div>
      <div class="imds-mt-2" id="pagination"></div>
    </div>
  </main>
</div>
```

## Implementation Notes

- `pgstyle-toolbar` is not a standard imds theme class; it is a custom class for the side-by-side layout of the search field and Create New button
- `:searchKeywords:` is a placeholder; replace it with a unique ID during implementation
- Table row data and pagination are dynamically generated and controlled with JavaScript
- For numeric columns such as unit price and stock quantity, it is recommended to add `has-text-right` to `td` to right-align them
- `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` / `pgstyle-table-wrapper` / `pgstyle-toolbar` are **fixed** class names, not per-feature placeholders — do not rename them when generating a page
- This template only covers the HTML portion, so define the following layout-control styles in the `<style>` inside `<imart type="head">` (only the classes actually used in this file are listed; there is no footer here, so `pgstyle-layout-footer` is not included)

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
  /* Search field width (values may be adjusted per screen) */
  .pgstyle-toolbar > .imds-input-group {
    max-width: 30em;
    flex: 1 0 20em;
  }
  ```

- `<imart type="head">` must also load `im_design_system/theme/css/theme-conditional-layout.css` (CSS that controls the height/width of the content area, which differs per theme). Without it, `.imds-container` has no fixed height, so `pgstyle-layout-content`'s `flex: 1 0 0` has nothing to grow into and the content area collapses to zero height.

  ```html
  <!-- CSS that controls the height/width of the content area, which differs per theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```

## 5. Two-Column Layout (List with Navigation)

List screens come in two patterns: a "one-column layout" (search field + table only, as in this example) and a "two-column layout" (navigation placed on the left).

- **One column**: A simple list with no categories that needs no navigation (e.g. the "Inventory Management" screen above)
- **Two columns**: When the list data has a hierarchy or categories and you want to filter by category in the left column (use tree- or list-style navigation)

Choose the two-column layout based on whether users need to be offered categorization/filtering of the list data. A simple CRUD master with no categories can stay one-column.

### Overall Structure (Two Columns)

The page-wide fixed header and scrolling (`pgstyle-layout-container` on `imds-container`, `pgstyle-layout-main` on `<main>`, and `pgstyle-layout-content` on the `flex:1 0 0; overflow:auto` scroll area) are the same as in the "Full Code" section. The `<div>` below **replaces the entire contents** of the scroll area (`pgstyle-layout-content`) inside that `<main>`, and the `overflow-y:auto` inside `nav` below is a further **component-level scroll** inside it (only the navigation tree/list), separate from the page-level fixed header layout.

```
div.imds-container.pgstyle-layout-container (fixed header layout; no id. See "Implementation Notes" for details)
├── header.imds-header
└── main.pgstyle-layout-main
    └── div.pgstyle-layout-content.imds-scrollbar (flex:1 0 0; overflow:auto. display:flex; left/right split)
        ├── nav (left column / fixed width 250px)
        │   ├── div.nav-search             ... Category search field
        │   └── div.nav-scroll-area         ... Tree or list (component-level scroll; this area only)
        └── div (right column / main content)
            ├── form                        ... Search form (server-side search)
            │   └── div.pgstyle-toolbar     ... Search field + Create New button
            ├── div.imds-table               ... Data list table
            └── div#pagination                ... Pagination
```

### Implementation Example

```html
<div class="imds-px-3 imds-py-2 pgstyle-layout-content imds-scrollbar" style="display:flex; gap:1.5em; align-items:flex-start;">
  <!-- Left column: navigation (fixed width 250px) -->
  <nav style="width:250px; flex:0 0 250px; display:flex; flex-direction:column;">
    <div class="imds-input-group imds-mb-2">
      <input type="search" class="imds-textbox" placeholder="Search by category name" aria-label="Search by category name">
      <button type="button" title="Search" class="imds-button is-outlined is-small">
        <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
      </button>
    </div>
    <!--
      Scroll only the navigation part (the search field and action buttons do not scroll).
      If the parent elements (nav / section / main) have no explicit height, setting flex-basis to 0 (flex: 1 0 0)
      leaves no space to grow into, so the area collapses to zero height and disappears (a defect that actually occurred during implementation).
      Use flex-basis auto, and set the scroll limit with max-height based on the natural height of the content.
    -->
    <div class="imds-scrollbar" style="overflow-y:auto; flex:0 1 auto; max-height: 480px;">
      <nav class="imds-menu">
        <ul class="imds-menu-list">
          <li><a href="#"><span>All</span></a></li>
          <li><a href="#"><span>Category A</span></a></li>
          <li><a href="#"><span>Category B</span></a></li>
        </ul>
      </nav>
    </div>
  </nav>
  <!-- Right column: main content -->
  <div style="flex:1 1 auto; min-width:0;">
    <form id="search-form" class="imds-form">
      <div class="pgstyle-toolbar imds-mb-2">
        <div class="imds-input-group">
          <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search by product code or product name" aria-label="Search by product code or product name">
          <button type="submit" title="Search" class="imds-button is-outlined">
            <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
          </button>
        </div>
        <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">Create New</button>
      </div>
    </form>
    <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
      <div class="imds-table-inner">
        <table>
          <thead>
            <tr>
              <th><span>Product Name</span></th>
              <th><span>Product Code</span></th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    </div>
    <div class="imds-mt-2" id="pagination"></div>
  </div>
</div>
```

**Key points:**
- The navigation width is **fixed at 250px**
- Scroll only the navigation (tree/list part) with `overflow-y:auto` (together with `imds-scrollbar`), keeping the search field and action buttons always visible
- Use the tree style for categories with a hierarchy and the list style for flat categories. Provide an "All" node for showing all items
- **Anti-pattern: do not use `flex: 1 0 0` (flex-basis: 0) on the scroll area**. In environments where `nav` / `section` / `main` have no explicit height (this actually occurred during implementation), there is no space to grow into, so the area collapses to zero height and is not displayed. Use `flex: 0 1 auto` (flex-basis: auto) and set the scroll limit with `max-height` based on the natural height of the content

## 6. `isSticky` (Fixed Table Header)

When the list has many rows and the table becomes long vertically, fix the table header (`thead`) and scroll only the data part (`tbody`) vertically, so that the column headings are always visible while scrolling.

```html
<div class="imds-table is-sticky" style="max-height: 480px;">
  <div class="imds-table-inner">
    <table>
      <thead>
        <tr>
          <th><span>Product Name</span></th>
          <th><span>Product Code</span></th>
        </tr>
      </thead>
      <tbody id="stock-table-body"></tbody>
    </table>
  </div>
</div>
```

**Key points (real DOM behavior):**
- Add `is-sticky` to `imds-table` to fix `thead`. Specify `max-height` on `div.imds-table` to create the vertical scroll area
- Only the data area (`tbody`) actually scrolls, but due to the CSS specification a scrollbar is also shown in the header part (a visual constraint with no practical impact)
- To fix specific columns (the column that identifies the row, the main link column) during horizontal scrolling as well, add **`is-sticky`** to the `th`/`td` of the columns to fix (do not add a column-fixing modifier to `imds-table`; specify it per `th`/`td`). As a rule, fix columns **on the left side only**, targeting items that identify the row and the mainly used link/button columns
- When columns are fixed, a scrollbar is also shown under the fixed columns, but the actual horizontal scroll area is the part other than the fixed columns

## 7. Pagination Defaults and Records-per-Page Selection

- When the list is a "table", place pagination as a rule. If the data volume over the expected operating period is small and retrieval does not take long, it may be omitted (when omitted, do not place search conditions either)
- Always show the "records per page" selector. **The default value is 100**, and provide **5 options** in steps of 25 or 50
  - Example: `100, 125, 150, 175, 200` (initial display 100)
  - Example: `50, 100, 150, 200, 250` (initial display 100)
  - For cards (multiple cards per row), provide options in multiples of the number of cards per row (e.g. for 4 cards per row: `40, 80, 120, 160, 200`, initial display 80)
- When the screen width is tablet or smaller (769px to under 1023px), switch from `imds-pagination` to PaginationCompact in `imds-html-pagination-compact.md`

```html
<div class="imds-pagination-options">
  <div class="imds-pagination-records-per-page">
    <label for="records-per-page">Records per page</label>
    <select id="records-per-page" class="imds-select">
      <option value="100" selected>100</option>
      <option value="125">125</option>
      <option value="150">150</option>
      <option value="175">175</option>
      <option value="200">200</option>
    </select>
  </div>
  <span>1 - 100 / 320</span>
</div>
```

## 8. Empty State UI (0 Records)

When there is no data to show in the list, display an empty state UI instead of the table and pagination. Use the EmptyState component in `reference/imds-html-empty-state.md`.

There are two empty-state patterns that can occur on a list screen, and their content differs.

| Pattern | Condition | Content |
|---|---|---|
| **No data registered** | No search conditions are specified, and no data has been registered at all | A message such as "No data has been registered yet" + a "Create New" button (presenting the next action to take) |
| **0 search results** | No data matches the search conditions or navigation filter | A message such as "No matching data was found" (prompting the user to revise the search conditions; the Create New button is optional) |

**Key points:**
- For "0 search results", on screens with a table, keep showing the table header (`thead`) and display the empty-state message in the `tbody` part (do not remove the column headings)
- Do not show pagination in either pattern
- For "No data registered", hide the operation area including the search field and Create New button, the table, and the pagination, and show only the EmptyState (the search field is unnecessary and showing an empty table has little value). Make the list area and the empty-state area separate blocks and switch their display depending on whether data exists
- For "No data registered", use the EmptyState in its default size without a size class (equivalent to `is-large`), and place the Create New button inside `imds-empty-state-content` (action buttons cannot be used with `is-small` / `is-x-small`)
- For the concrete HTML structure and variations of `imds-empty-state`, see `reference/imds-html-empty-state.md` (this file covers only the overview)

## 9. Search Condition Retention Rules (Screen Transitions and State Management)

Retain and reset the search conditions and page state of a list screen according to the following rules.

| Operation | Search conditions | Page number | Sort key / order | Navigation selection | Records per page |
|---|---|---|---|---|---|
| Change records per page | Retained | - | Retained | Retained | Retain the new value **until the page is reloaded** |
| Select a category in the navigation | Retained | **Reset to 1** | Retained | Retain the selection **until the page is reloaded** | Retained |
| Run a sort | Retained | **Reset to 1** | Retain the new value | Retained | Retained |
| Change search conditions and run a search | Retain the new value | **Reset to 1** | Retained | Retained | Retained |
| Return with "Back" after moving to another screen | Retained | Retained | Retained | Retained | Retained |

**Key points:**
- "Change search conditions and run a search" and "Run a sort" both reset the page number to 1, but retain the other state (search conditions or sort) (the two are managed independently)
- When returning with "Back" after moving to another screen, **retain everything**: navigation selection, search conditions, page number, records per page, and sort key and order
- In implementation, keep the search conditions, page number, and sort information in URL query parameters or `SessionScopeStorage`, and restore them on the initial display of the screen
