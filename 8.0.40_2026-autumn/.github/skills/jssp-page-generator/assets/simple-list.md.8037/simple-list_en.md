# Simple List Screen Template

## Overview

A basic screen template with a simple table list and pagination.
On initial display, values retrieved from the server are shown in the presentation page; table rendering, filtering by search keyword and pagination are handled by client-side JavaScript.
The first column (product name) of the list links to the edit screen. When there is no data, an empty state UI is shown.

### Correspondence with imds Templates

- The screen structure conforms to the list page template `assets/imds-list-page.md` in the `jssp-imds-theme` skill

## File Structure

```
src/main/jssp/src/sample/simple_list/view/
  ├── index.js              # Function container
  └── index.html            # Presentation page

src/main/conf/routing-jssp-config/
  └── simple_list.xml       # Routing configuration
```

---

## Function Container (sample/simple_list/view/index.js)

```javascript
/**
 * Simple list screen
 *
 * @file index.js
 * @description Constructs a screen that provides list display of data and pagination.
 */

// ========================================
// Bind variables (for presentation page integration)
// ========================================
let $title = 'List';
let $subTitle = 'Sample Management';
let $data = '{}';

// ========================================
// Entry point
// ========================================
/**
 * Entry point for screen display.
 * Executed first when the screen URL is accessed.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  // Execute main processing
  let response = main(request);

  // Store in $data as JSON format
  // If </script> is included in the JSON, the script would terminate,
  // so replace all '/' in the response with '\/'
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// Main processing
// ========================================
/**
 * Executes the main processing.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function main(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',                 // Error code
      message: ''               // Error message
    }
  };

  try {
    // Execute main business logic processing
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred during screen display. {}', e.message);
    transferErrorPage('E001', 'An unexpected error occurred.');
    return response;
  }

  return response;
}

// ========================================
// Business logic
// ========================================
/**
 * Executes the main business logic processing.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  // TODO: Perform list data retrieval from the database here
  return {
    list: [
      { productCode: 'PRD001', productName: 'Ballpoint pen (black)', unitPrice: 150, stockQuantity: 500, warehouseNumber: 'WH01', remarks: 'Standard item' },
      { productCode: 'PRD002', productName: 'Ballpoint pen (red)', unitPrice: 150, stockQuantity: 300, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD003', productName: 'Ballpoint pen (blue)', unitPrice: 150, stockQuantity: 250, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD004', productName: 'Mechanical pencil 0.5mm', unitPrice: 280, stockQuantity: 180, warehouseNumber: 'WH01', remarks: '' },
      { productCode: 'PRD005', productName: 'Mechanical pencil 0.3mm', unitPrice: 350, stockQuantity: 120, warehouseNumber: 'WH01', remarks: 'Low stock' },
      { productCode: 'PRD006', productName: 'Eraser', unitPrice: 80, stockQuantity: 600, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD007', productName: 'Correction tape', unitPrice: 230, stockQuantity: 150, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD008', productName: 'Highlighter (yellow)', unitPrice: 120, stockQuantity: 400, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD009', productName: 'Highlighter (pink)', unitPrice: 120, stockQuantity: 350, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD010', productName: 'Highlighter (green)', unitPrice: 120, stockQuantity: 200, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD011', productName: 'Notebook A4 lined', unitPrice: 180, stockQuantity: 800, warehouseNumber: 'WH03', remarks: 'Large stock' },
      { productCode: 'PRD012', productName: 'Notebook B5 lined', unitPrice: 150, stockQuantity: 700, warehouseNumber: 'WH03', remarks: '' },
      { productCode: 'PRD013', productName: 'Notebook A5 grid', unitPrice: 200, stockQuantity: 300, warehouseNumber: 'WH03', remarks: '' },
      { productCode: 'PRD014', productName: 'Clear file A4', unitPrice: 50, stockQuantity: 999, warehouseNumber: 'WH03', remarks: 'Stock limit' },
      { productCode: 'PRD015', productName: 'Sticky notes 75x75mm', unitPrice: 160, stockQuantity: 450, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD016', productName: 'Sticky notes 75x25mm', unitPrice: 120, stockQuantity: 500, warehouseNumber: 'WH02', remarks: '' },
      { productCode: 'PRD017', productName: 'Stapler', unitPrice: 480, stockQuantity: 90, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD018', productName: 'Stapler needles No.10', unitPrice: 150, stockQuantity: 400, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD019', productName: 'Cellophane tape', unitPrice: 100, stockQuantity: 350, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD020', productName: 'Double-sided tape', unitPrice: 180, stockQuantity: 200, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD021', productName: 'Scissors', unitPrice: 350, stockQuantity: 100, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD022', productName: 'Utility knife', unitPrice: 280, stockQuantity: 80, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD023', productName: 'Ruler 30cm', unitPrice: 200, stockQuantity: 150, warehouseNumber: 'WH04', remarks: '' },
      { productCode: 'PRD024', productName: 'Magnet (white)', unitPrice: 90, stockQuantity: 600, warehouseNumber: 'WH05', remarks: '' },
      { productCode: 'PRD025', productName: 'Whiteboard marker', unitPrice: 180, stockQuantity: 250, warehouseNumber: 'WH05', remarks: 'Red/blue/black set' }
    ]
  };
}

// ========================================
// Error page transition
// ========================================
/**
 * Displays an error message in full screen when an error occurs.
 *
 * @param {String} code - Error code
 * @param {String} message - Error message
 */
function transferErrorPage(code, message) {
  let parameter = {
    title: 'A system error has occurred',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

---

## Presentation Page (sample/simple_list/view/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- CSS that controls the height/width of the content area, which differs per theme -->
  <link rel="stylesheet" type="text/css" href="im_design_system/theme/css/theme-conditional-layout.css" />
  <!-- Presentation page custom styles -->
  <style>
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
    /* Search field width (adjust the values per screen as needed) */
    .pgstyle-toolbar > .imds-input-group {
      max-width: 30em;
      flex: 1 0 20em;
    }
  </style>
  <!-- Presentation page scripts (scope $data via an IIFE instead of leaving it in the global scope) -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const STORAGE_KEY = 'product_stock_data';
    const COLUMN_COUNT = 6;
    const RANGE_LENGTH = 3;
    const RECORDS_PER_PAGE_OPTIONS = [100, 125, 150, 175, 200];

    // Records per page (default: 100)
    let pageSize = 100;
    // Current page
    let currentPage = 1;
    // Search keyword
    let keyword = '';

    // Initialize dummy data in session storage
    function initializeData() {
      if (!sessionStorage.getItem(STORAGE_KEY)) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify($data.result.list));
      }
    }

    // Get all data
    function getAllData() {
      let data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    // Get data filtered by the search keyword (partial match on product name, product code, warehouse number and remarks)
    function getFilteredData(allData) {
      if (!keyword) {
        return allData;
      }
      let lowerKeyword = keyword.toLowerCase();
      return allData.filter((item) => {
        return [item.productName, item.productCode, item.warehouseNumber, item.remarks].some((value) => {
          return String(value || '').toLowerCase().indexOf(lowerKeyword) !== -1;
        });
      });
    }

    // Create a cell that contains text only
    function createTextCell(text, className) {
      let td = document.createElement('td');
      if (className) {
        td.className = className;
      }
      let span = document.createElement('span');
      span.textContent = text;
      td.appendChild(span);
      return td;
    }

    // Create a data row (the product name in the first column links to the edit screen)
    function createRow(item) {
      let tr = document.createElement('tr');

      // TODO: Implement the edit screen (sample/simple_list/edit). Treat it as edit when the productCode parameter is present, and as new registration when it is absent
      let link = document.createElement('a');
      link.textContent = item.productName;
      link.setAttribute('href', 'sample/simple_list/edit?productCode=' + encodeURIComponent(item.productCode));
      let linkSpan = document.createElement('span');
      linkSpan.appendChild(link);
      let linkCell = document.createElement('td');
      linkCell.appendChild(linkSpan);
      tr.appendChild(linkCell);

      tr.appendChild(createTextCell(item.productCode));
      tr.appendChild(createTextCell(Number(item.unitPrice).toLocaleString(), 'has-text-right'));
      tr.appendChild(createTextCell(String(item.stockQuantity), 'has-text-right'));
      tr.appendChild(createTextCell(item.warehouseNumber || ''));

      // Truncate remarks to one line; the full text is available via title
      let remarksCell = createTextCell(item.remarks || '');
      let remarksSpan = remarksCell.firstChild;
      remarksSpan.className = 'imds-line-clamp-1';
      remarksSpan.setAttribute('title', item.remarks || '');
      tr.appendChild(remarksCell);

      return tr;
    }

    // Create the row for zero search results (empty state UI placed inside the table: is-small)
    function createEmptyRow() {
      let tr = document.createElement('tr');
      let td = document.createElement('td');
      td.setAttribute('colspan', String(COLUMN_COUNT));
      td.innerHTML =
        '<div class="imds-empty-state-container">' +
          '<div class="imds-empty-state is-small">' +
            '<div class="imds-empty-state-message-wrapper">' +
              '<span class="imds-empty-state-icon">' +
                '<span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>' +
              '</span>' +
              '<div class="imds-empty-state-message"><p class="imds-empty-state-message-title">No matching data was found. Please review the search keyword.</p></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      tr.appendChild(td);
      return tr;
    }

    // When no data is registered, hide the operation area, table and pagination, and show only the empty state UI
    function toggleNoDataState(hasData) {
      document.getElementById('search-form').style.display = hasData ? '' : 'none';
      document.getElementById('stock-table').style.display = hasData ? '' : 'none';
      document.getElementById('no-data-state').style.display = hasData ? 'none' : '';
    }

    // Render table
    function renderTable() {
      let allData = getAllData();
      let pagination = document.getElementById('pagination');

      if (allData.length === 0) {
        toggleNoDataState(false);
        pagination.style.display = 'none';
        return;
      }
      toggleNoDataState(true);

      let filteredData = getFilteredData(allData);
      let totalItems = filteredData.length;
      let totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      let startIndex = (currentPage - 1) * pageSize;
      let endIndex = Math.min(startIndex + pageSize, totalItems);
      let pageData = filteredData.slice(startIndex, endIndex);

      let tbody = document.getElementById('stock-table-body');
      tbody.textContent = '';

      if (pageData.length === 0) {
        tbody.appendChild(createEmptyRow());
        pagination.style.display = 'none';
        return;
      }

      pageData.forEach((item) => {
        tbody.appendChild(createRow(item));
      });

      pagination.style.display = '';
      renderPagination(totalPages, totalItems, startIndex + 1, endIndex);
    }

    // Calculate page number list for pagination
    // Show RANGE_LENGTH pages before and after the current page; never collapse just a single page
    function getPageNumbers(current, total) {
      let pages = [];

      if (total <= RANGE_LENGTH * 2 + 5) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
        return pages;
      }

      let start = Math.max(Math.min(current - RANGE_LENGTH, total - RANGE_LENGTH * 2 - 2), 3);
      let end = Math.min(Math.max(current + RANGE_LENGTH, RANGE_LENGTH * 2 + 3), total - 2);

      pages.push(1);
      pages.push(start > 3 ? '...' : 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      pages.push(end < total - 2 ? '...' : total - 1);
      pages.push(total);

      return pages;
    }

    // Create the previous/next button
    function createMoveButton(title, iconClass, disabled, targetPage) {
      let button = document.createElement('button');
      button.type = 'button';
      button.className = 'imds-button is-ghost';
      button.title = title;
      button.disabled = disabled;
      button.innerHTML = '<span class="imds-icon"><i class="fa-solid ' + iconClass + '"></i></span>';
      button.addEventListener('click', () => {
        currentPage = targetPage;
        renderTable();
      });
      return button;
    }

    // Create a page number button (or an ellipsis)
    function createPageNumberItem(page) {
      if (page === '...') {
        let ellipsis = document.createElement('div');
        ellipsis.className = 'imds-pagination-page-ellipsis';
        ellipsis.innerHTML = '<span>…</span>';
        return ellipsis;
      }
      let pageButton = document.createElement('button');
      pageButton.type = 'button';
      pageButton.className = 'imds-button ' + (page === currentPage ? 'is-primary' : 'is-ghost');
      pageButton.textContent = String(page);
      pageButton.addEventListener('click', () => {
        if (page !== currentPage) {
          currentPage = page;
          renderTable();
        }
      });
      return pageButton;
    }

    // Create the page navigation button group
    function createPaginationControls(totalPages) {
      let controls = document.createElement('div');
      controls.className = 'imds-pagination-controls';

      // Previous button
      controls.appendChild(createMoveButton('Previous', 'fa-angle-left', currentPage <= 1, currentPage - 1));

      // Page numbers
      let pageNumberContainer = document.createElement('div');
      pageNumberContainer.className = 'imds-pagination-page-number';
      getPageNumbers(currentPage, totalPages).forEach((page) => {
        pageNumberContainer.appendChild(createPageNumberItem(page));
      });
      controls.appendChild(pageNumberContainer);

      // Next button
      controls.appendChild(createMoveButton('Next', 'fa-angle-right', currentPage >= totalPages, currentPage + 1));

      return controls;
    }

    // Create the options area (records per page + count information)
    function createPaginationOptions(totalItems, startNum, endNum) {
      let options = document.createElement('div');
      options.className = 'imds-pagination-options';

      // Records per page
      let recordsPerPage = document.createElement('div');
      recordsPerPage.className = 'imds-pagination-records-per-page';
      let label = document.createElement('label');
      label.setAttribute('for', 'records-per-page');
      label.textContent = 'Records per page';
      recordsPerPage.appendChild(label);
      let select = document.createElement('select');
      select.id = 'records-per-page';
      select.className = 'imds-select';
      RECORDS_PER_PAGE_OPTIONS.forEach((value) => {
        let option = document.createElement('option');
        option.value = String(value);
        option.textContent = String(value);
        option.selected = (value === pageSize);
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        pageSize = Number(select.value);
        currentPage = 1;
        renderTable();
      });
      recordsPerPage.appendChild(select);
      options.appendChild(recordsPerPage);

      // Count information
      let info = document.createElement('span');
      info.textContent = startNum + ' - ' + endNum + ' / ' + totalItems;
      options.appendChild(info);

      return options;
    }

    // Render pagination
    function renderPagination(totalPages, totalItems, startNum, endNum) {
      let container = document.getElementById('pagination');
      container.textContent = '';

      let nav = document.createElement('nav');
      nav.className = 'imds-pagination is-small';
      nav.appendChild(createPaginationControls(totalPages));
      nav.appendChild(createPaginationOptions(totalItems, startNum, endNum));

      container.appendChild(nav);
    }

    // Navigate to the create screen
    function moveToCreate() {
      location.href = 'sample/simple_list/edit';
    }

    // Search form submit event (Enter key and search button share a single path)
    document.getElementById('search-form').addEventListener('submit', (event) => {
      event.preventDefault();
      keyword = document.getElementById(':searchKeywords:').value.trim();
      currentPage = 1;
      renderTable();
    });

    // New create button click event
    document.getElementById('create-button').addEventListener('click', moveToCreate);
    document.getElementById('no-data-create-button').addEventListener('click', moveToCreate);

    // Entry point
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      initializeData();
      renderTable();
    }
  });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Page container (no id here — it sits inside the theme's own <div id="imui-container">) -->
<div class="imds-container pgstyle-layout-container">
  <!-- Header -->
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

  <!-- Main content -->
  <main class="pgstyle-layout-main">
    <div class="imds-px-3 imds-py-2 pgstyle-table-wrapper pgstyle-layout-content imds-scrollbar">
      <!-- Operation area (search field + new create button) -->
      <form id="search-form" class="imds-form">
        <div class="pgstyle-toolbar imds-mb-2">
          <div class="imds-input-group">
            <input id=":searchKeywords:" type="search" class="imds-textbox" placeholder="Search keywords" aria-label="Search keywords">
            <button type="submit" title="Search" class="imds-button is-outlined">
              <span class="imds-icon is-small"><i class="fa-solid fa-magnifying-glass"></i></span>
            </button>
          </div>
          <button type="button" id="create-button" class="imds-button is-primary" style="min-width: 8em;">New</button>
        </div>
      </form>
      <!-- List table -->
      <div class="imds-table is-area-bordered is-bordered is-sticky is-narrow is-hoverable" id="stock-table" style="height: 100%">
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
      <!-- Pagination -->
      <div class="imds-mt-2" id="pagination"></div>
      <!-- Empty state UI for no registered data (shown only when there is no data at all) -->
      <div class="imds-empty-state-container" id="no-data-state" style="display: none;">
        <div class="imds-empty-state">
          <div class="imds-empty-state-message-wrapper">
            <span class="imds-empty-state-icon">
              <span class="imds-icon is-gray-light"><i class="fa-solid fa-circle-info"></i></span>
            </span>
            <div class="imds-empty-state-message">
              <p class="imds-empty-state-message-title">No data has been registered yet</p>
              <p class="imds-empty-state-message-content">Register data using the New button.</p>
            </div>
          </div>
          <div class="imds-empty-state-content imds-mt-7">
            <button type="button" id="no-data-create-button" class="imds-button is-large is-primary">New</button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
```

---

## Routing Configuration (simple_list.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- List screen -->
  <file-mapping path="/sample/simple_list" page="sample/simple_list/view/index">
    <authz uri="service://sample/simple_list" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## Available Templates

- **Simple List**: [assets/simple-list.md](assets/simple-list.md)
  - Screen with intra-mart Design System (imds) theme applied
  - Table list display and pagination (with records-per-page selector)
  - Search keyword and new create button (search runs on `<form>` submit and filters the list already retrieved at initial display on the client side)
  - Link to the edit screen placed in the first column (product name)
  - Empty state UI for no registered data and for zero search results
  - If the data volume is too large to hold all records on the client side, replace search and paging with server-side processing (re-fetching via an API)

### Example Instructions for Generation

When the user requests "create a list screen", use this asset's code as a reference and generate an appropriately customized version.
