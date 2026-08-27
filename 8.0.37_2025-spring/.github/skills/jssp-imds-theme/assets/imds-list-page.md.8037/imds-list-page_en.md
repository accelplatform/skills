# List Screen Implementation Example

An implementation example of a business list screen combining imds theme components.
Using the "Inventory Management" screen as a subject, this shows the composition pattern of header, search area, table, and pagination.

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

```
imds-container
├── header.imds-header              ... Page header (icon + title)
└── main
    └── section.imds-section
        ├── div.button-area         ... Operation area (search field + Create New button)
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
`button-area` is a custom class that controls the side-by-side layout of the search field and button.

```html
<div class="button-area imds-mb-3">
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
- Add `imds-mb-3` to provide a margin between the table

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
<div class="imds-table" id="stock-table">
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
- You can optionally add `is-hoverable`, `is-stripe`, `is-sticky`, etc. to `imds-table`

## 4. Pagination

An area for placing a page navigation below the table.
Specify `id="pagination"` and dynamically generate `imds-pagination` with JavaScript.

```html
<div class="imds-py-3" id="pagination"></div>
```

**Key points:**
- Add `imds-py-3` to provide top and bottom padding between the table
- Generate the pagination HTML dynamically with JavaScript (since the number of pages varies depending on the number of search results)

## Full Code

```html
<div id="container">
  <div class="imds-container">
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
    <main>
      <div class="imds-py-3">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4">
          <div class="button-area imds-mb-3">
            <div class="imds-input-group">
              <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search keywords">
              <button type="button" title="Search" class="imds-button">
                <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
              </button>
            </div>
            <button type="button" id="create-button" class="imds-button is-primary">Create New</button>
          </div>
          <div class="imds-table" id="stock-table">
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
          <div class="imds-py-3" id="pagination"></div>
        </section>
      </div>
    </main>
  </div>
</div>
```

## Implementation Notes

- `button-area` is not a standard imds theme class; it is a custom class for the side-by-side layout of the search field and Create New button
- `col-edit` is also a custom class used for adjusting the width of the edit column
- `:searchKeywords:` is a placeholder; replace it with a unique ID during implementation
- Table row data and pagination are dynamically generated and controlled with JavaScript
- For numeric columns such as unit price and stock quantity, it is recommended to add `has-text-right` to `td` to right-align them
