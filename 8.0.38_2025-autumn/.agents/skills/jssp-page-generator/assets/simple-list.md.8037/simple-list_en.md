# Simple List Screen Template

## Overview

A basic screen template with a simple table list and pagination.
On initial display, values retrieved from the server are shown in the presentation page; table rendering and pagination are handled by client-side JavaScript.
Each row in the list has an edit link allowing navigation to the edit screen.

## File Structure

```
src/main/jssp/src/simple_list/view/
  └── index.js              # Function container
  └── index.html            # Presentation page

src/main/conf/routing-jssp-config/
  └── simple_list.xml       # Routing configuration
```

---

## Function Container (simple_list/view/index.js)

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

## Presentation Page (simple_list/view/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- Presentation page custom styles -->
  <style>
    /* Area above the table uses flex layout */
    .button-area {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      gap: 0.5em 1em;
    }
    /* TODO: Modify the following table layout as needed for your use case */
    #stock-table th,
    #stock-table td {
      white-space: nowrap;
    }
    #stock-table .col-remarks {
      white-space: normal;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .col-edit {
      width: 4em;
    }
  </style>
  <!-- Presentation page scripts (scope $data via an IIFE instead of leaving it in the global scope) -->
  <script>
  (function($data) {
  document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const STORAGE_KEY = 'product_stock_data';
    const PAGE_SIZE = 10;

    // Current page
    let currentPage = 1;

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

    // HTML escape
    function escapeHtml(str) {
      let div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    // Render table
    function renderTable() {
      let allData = getAllData();
      let totalItems = allData.length;
      let totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

      if (currentPage > totalPages) {
        currentPage = totalPages;
      }

      let startIndex = (currentPage - 1) * PAGE_SIZE;
      let endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
      let pageData = allData.slice(startIndex, endIndex);

      let tbody = document.getElementById('stock-table-body');
      tbody.innerHTML = '';

      if (pageData.length === 0) {
        let tr = document.createElement('tr');
        let td = document.createElement('td');
        td.setAttribute('colspan', '7');
        td.style.textAlign = 'center';
        td.style.padding = '2em';
        td.textContent = 'No data available.';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        pageData.forEach((item) => {
          let tr = document.createElement('tr');
          tr.innerHTML =
            '<td class="col-edit has-content-only">' +
            '<button type="button" class="imds-button is-ghost is-small" data-edit-code="' + escapeHtml(item.productCode) + '">' +
            '<span class="imds-icon"><i class="fa-regular fa-file-lines"></i></span></button></td>' +
            '<td><span>' + escapeHtml(item.productCode) + '</span></td>' +
            '<td><span>' + escapeHtml(item.productName) + '</span></td>' +
            '<td class="has-text-right"><span>' + Number(item.unitPrice).toLocaleString() + '</span></td>' +
            '<td class="has-text-right"><span>' + item.stockQuantity + '</span></td>' +
            '<td><span>' + escapeHtml(item.warehouseNumber || '') + '</span></td>' +
            '<td class="col-remarks"><span>' + escapeHtml(item.remarks || '') + '</span></td>';
          tbody.appendChild(tr);
        });
      }

      // Edit button event
      tbody.querySelectorAll('[data-edit-code]').forEach((button) => {
        button.addEventListener('click', () => {
          location.href = 'product_stock/edit?productCode=' + encodeURIComponent(button.getAttribute('data-edit-code'));
        });
      });

      renderPagination(totalPages, totalItems, startIndex + 1, endIndex);
    }

    // Calculate page number list for pagination
    function getPageNumbers(current, total) {
      let pages = [];
      let delta = 2;

      for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
          pages.push(i);
        } else if (pages[pages.length - 1]  !== '...') {
          pages.push('...');
        }
      }

      return pages;
    }

    // Render pagination
    function renderPagination(totalPages, totalItems, startNum, endNum) {
      let container = document.getElementById('pagination');
      container.innerHTML = '';

      if (totalItems === 0) {
        return;
      }

      let nav = document.createElement('nav');
      nav.className = 'imds-pagination';

      // Page navigation button group
      let controls = document.createElement('div');
      controls.className = 'imds-pagination-controls';

      // Previous button
      let prevButton = document.createElement('button');
      prevButton.type = 'button';
      prevButton.className = 'imds-button is-ghost';
      prevButton.title = 'Previous';
      prevButton.disabled = (currentPage <= 1);
      prevButton.innerHTML = '<span class="imds-icon"><i class="fa-solid fa-angle-left"></i></span>';
      prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });
      controls.appendChild(prevButton);

      // Page numbers
      let pageNumberContainer = document.createElement('div');
      pageNumberContainer.className = 'imds-pagination-page-number';

      let pageNumbers = getPageNumbers(currentPage, totalPages);
      pageNumbers.forEach((page) => {
        if (page === '...') {
          let ellipsis = document.createElement('div');
          ellipsis.className = 'imds-pagination-page-ellipsis';
          ellipsis.innerHTML = '<span>…</span>';
          pageNumberContainer.appendChild(ellipsis);
        } else {
          let pageButton = document.createElement('button');
          pageButton.type = 'button';
          pageButton.className = 'imds-button ' + (page === currentPage ? 'is-primary' : 'is-ghost');
          pageButton.textContent = String(page);
          pageButton.addEventListener('click', (function(p) {
            return function() {
              if (p !== currentPage) {
                currentPage = p;
                renderTable();
              }
            };
          })(page));
          pageNumberContainer.appendChild(pageButton);
        }
      });

      controls.appendChild(pageNumberContainer);

      // Next button
      let nextButton = document.createElement('button');
      nextButton.type = 'button';
      nextButton.className = 'imds-button is-ghost';
      nextButton.title = 'Next';
      nextButton.disabled = (currentPage >= totalPages);
      nextButton.innerHTML = '<span class="imds-icon"><i class="fa-solid fa-angle-right"></i></span>';
      nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
      controls.appendChild(nextButton);

      nav.appendChild(controls);

      // Count information
      let options = document.createElement('div');
      options.className = 'imds-pagination-options';
      let info = document.createElement('span');
      info.textContent = startNum + ' - ' + endNum + ' / ' + totalItems;
      options.appendChild(info);
      nav.appendChild(options);

      container.appendChild(nav);
    }

    // New create button click event
    document.getElementById('create-button').addEventListener('click', () => {
      location.href = 'sample/simple_list/edit';
    });

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

<!-- Page container -->
<div id="container">
  <div class="imds-container">
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
            <button type="button" id="create-button" class="imds-button is-primary">New</button>
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
  - Table list display and pagination
  - Search keyword input and new create button
  - Edit link placed in each row

### Example Instructions for Generation

When the user requests "create a list screen", use this asset's code as a reference and generate an appropriately customized version.
