# List Screen Implementation Example

An implementation example of a business list screen combining imds theme components.
Using the "Inventory Management" screen as a subject, this shows the composition pattern of header, search area, table, and pagination.

This page uses a fixed-header layout with the fixed class names `pgstyle-layout-container` / `pgstyle-layout-main` / `pgstyle-layout-content` (`height: 100%`-based, so loading `theme-conditional-layout.css` in `<imart type="head">` is mandatory — see "Implementation Notes"). The legacy pattern that uses a per-feature placeholder prefix is documented in [imds-common-fixed-header-layout.md](../reference/imds-common-fixed-header-layout.md).

## Components Used

| Component | reference | Usage in this example |
|---------------|-----------|-------------|
| Header | [header.md](../reference/header.md) | Page header with icon |
| InputGroup | [input-group.md](../reference/input-group.md) | Search keyword input field |
| Textbox | [textbox.md](../reference/textbox.md) | Search text input |
| Button | [button.md](../reference/button.md) | Search button / Create New button |
| Table | [table.md](../reference/table.md) | Data list table |
| Pagination | [pagination.md](../reference/pagination.md) | Page navigation |
| IconFont | [icon-font.md](../reference/icon-font.md) | Search icon |

## Overall Structure

Attach `pgstyle-layout-container` (2-row grid) to `imds-container`, `pgstyle-layout-main` (vertical flex) to `<main>`, and `pgstyle-layout-content` (`flex:1 0 0; overflow:auto`) to the scrollable content area. Do not add an intermediate `<section>` wrapper — group the table-related elements inside a single div directly under `<main>`.

```
div.imds-container.pgstyle-layout-container    ... Root div (do not give it an id — it sits inside the theme's own imui-container, and no intermediate wrapper is added)
├── header.imds-header                        ... Page header (icon + title)
└── main.pgstyle-layout-main
    └── div.pgstyle-table-wrapper.pgstyle-layout-content (imds-scrollbar attached. flex:1 0 0; overflow:auto)
        ├── div.pgstyle-toolbar     ... Operation area (search field + Create New button)
        │   ├── imds-input-group    ... Search keyword input group
        │   └── button              ... Create New button
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

```html
<div class="pgstyle-toolbar imds-mb-2">
  <div class="imds-input-group">
    <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search keywords">
    <button type="button" title="Search" class="imds-button">
      <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
    </button>
  </div>
  <button type="button" id="create-button" class="imds-button is-primary">Create New</button>
</div>
```

**Key points:**
- Combine `imds-textbox` (`type="search"`) and search icon button inside `imds-input-group`
- Add `title="Search"` to the search button to ensure accessibility
- Add `imds-mb-2` to provide a margin between the table

### 2-B. Without Search Field (Create New Button Only)

When placing only the Create New button, align it **to the right** directly above the table.

```html
<div style="display:flex; justify-content:flex-end; margin-bottom: 0.75em;">
  <button type="button" id="create-button" class="imds-button is-primary">
    <span class="imds-icon"><i class="fa-solid fa-plus"></i></span>
    <span class="imds-button-text">Create New</span>
  </button>
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
          <th class="col-edit has-text-centered"><span>Edit</span></th>
          <th><span>Product Code</span></th>
          <th><span>Product Name</span></th>
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
- Add the custom class `col-edit` to the "Edit" column to control column width with CSS
- Add `is-area-bordered is-sticky is-narrow is-hoverable` and `style="height: 100%"` so the table fills the entire `pgstyle-layout-content` scroll area (`is-sticky` also enables a fixed header with vertical scrolling)
- If any column uses `has-text-right` for right-aligned numbers, also add `is-bordered` to `imds-table`
- You can optionally add `is-stripe`, etc. to `imds-table`

## 4. Pagination

An area for placing a page navigation below the table.
Specify `id="pagination"` and dynamically generate `imds-pagination` with JavaScript.

```html
<div class="imds-mt-2" id="pagination"></div>
```

**Key points:**
- Add `imds-mt-2` to provide a top margin between the table
- Generate the pagination HTML dynamically with JavaScript (since the number of pages varies depending on the number of search results)

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
      <div class="pgstyle-toolbar imds-mb-2">
        <div class="imds-input-group">
          <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search keywords">
          <button type="button" title="Search" class="imds-button">
            <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
          </button>
        </div>
        <button type="button" id="create-button" class="imds-button is-primary">Create New</button>
      </div>
      <div class="imds-table is-area-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th class="col-edit has-text-centered"><span>Edit</span></th>
                <th><span>Product Code</span></th>
                <th><span>Product Name</span></th>
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
- `col-edit` is also a custom class used for adjusting the width of the edit column
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
  ```

- `<imart type="head">` must also load `im_design_system/theme/css/theme-conditional-layout.css` (CSS that controls the height/width of the content area, which differs per theme). Without it, `.imds-container` has no fixed height, so `pgstyle-layout-content`'s `flex: 1 0 0` has nothing to grow into and the content area collapses to zero height.

  ```html
  <!-- CSS that controls the height/width of the content area, which differs per theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  ```
