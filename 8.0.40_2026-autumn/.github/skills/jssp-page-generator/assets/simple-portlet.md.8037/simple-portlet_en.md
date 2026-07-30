# Simple Portlet Screen Template

## Overview

A template for a small list screen embedded as a portlet (widget) on a portal page.
Unlike a normal screen (assumed to be accessed standalone via a URL), **the same screen may be placed multiple times on the same portal page**, so this template differs from the standard template (`assets/simple-list.md`) in the following point.

- **No header or footer**: Do not add the `imds-header` (the large heading area with an icon and title) or peripheral UI such as pagination; place only the content body (e.g., a table)
- **Do not create routing configuration (`.xml`) or routing authorization**: A portlet is invoked directly by the portal feature (`b_m_portlet_info.path`) and does not go through the routing table under `routing-jssp-config/`. Therefore, routing authorization via `file-mapping` / `<authz uri="service://...">` is not needed (access control is instead handled by the portlet's own authorization, `im-portal-portlet` / `im-portal-portlet-editmode`; see `.github/skills/jssp-tenant-setup-generator/reference/portlet-import.md` for details)

Note that scoping the bind variable `$data` with an IIFE is not a portlet-specific difference; it is the standard implementation for every screen (see the "Scoping the Bind Variable `$data` (IIFE)" section in `.github/instructions/jssp-presentation-page.instructions.md`).

## File Structure

```
src/main/jssp/src/{feature}/view/
  └── index.js              # Function container
  └── index.html            # Presentation page
```

Do not create routing configuration (`src/main/conf/routing-jssp-config/`).

---

## Function Container ({feature}/view/index.js)

```javascript
/**
 * {Screen Name}
 *
 * @file index.js
 * @description Configures a list displayed as a portlet component on a portal page.
 */

// ========================================
// Bind variables (for presentation page integration)
// ========================================
let $title = 'List';
let $subTitle = 'Portlet';
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

  // Store as a JSON string in $data
  // If </script> is included in the JSON, the script would terminate early, creating an
  // opportunity to inject arbitrary code, so all '/' characters in the response are escaped
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
      message: ''                // Error message
    }
  };

  try {
    // Execute the main business logic
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the portlet. {}', e.message);
    transferErrorPage('E001', 'An unexpected error occurred.');
    return response;
  }

  return response;
}

// ========================================
// Business logic
// ========================================
/**
 * Executes the main business logic.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  // TODO: Replace this with actual list data retrieval from the database
  return {
    list: [
      { itemCode: 'ITM001', itemName: 'Sample Item A', status: 'In Progress' },
      { itemCode: 'ITM002', itemName: 'Sample Item B', status: 'Completed' },
      { itemCode: 'ITM003', itemName: 'Sample Item C', status: 'Not Started' }
    ]
  };
}

// ========================================
// Error page transfer
// ========================================
/**
 * Displays an error message on a full-screen page when an error occurs.
 *
 * @param {String} code - Error code
 * @param {String} message - Error message
 */
function transferErrorPage(code, message) {
  let parameter = {
    title: 'A System Error Has Occurred',
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(parameter);
}
```

---

## Presentation Page ({feature}/view/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- Secure token -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- Presentation page script (since this portlet may be placed multiple times on one page, scope $data with an IIFE instead of the global scope) -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      // HTML escape
      function escapeHtml(value) {
        const div = document.createElement('div');
        div.textContent = value;
        return div.innerHTML;
      }

      // Render the list table
      function renderTable(list) {
        const tbody = document.getElementById('portlet-sample-table-body');
        tbody.innerHTML = '';

        if (list.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.setAttribute('colspan', '3');
          td.style.textAlign = 'center';
          td.textContent = 'No data available.';
          tr.appendChild(td);
          tbody.appendChild(tr);
          return;
        }

        list.forEach((item) => {
          const tr = document.createElement('tr');
          tr.innerHTML =
            '<td><span>' + escapeHtml(item.itemCode) + '</span></td>' +
            '<td><span>' + escapeHtml(item.itemName) + '</span></td>' +
            '<td><span>' + escapeHtml(item.status) + '</span></td>';
          tbody.appendChild(tr);
        });
      }

      // Entry point
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        renderTable($data.result.list);
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Full-page container (no header or footer, since this is a portlet component) -->
<div id="container">
  <div class="imds-container">
    <main>
      <div class="imds-table is-narrow" id="portlet-sample-table">
        <div class="imds-table-inner">
          <table>
            <thead>
              <tr>
                <th><span>Item Code</span></th>
                <th><span>Item Name</span></th>
                <th><span>Status</span></th>
              </tr>
            </thead>
            <tbody id="portlet-sample-table-body"></tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</div>
```

---

## Available Template

- **Simple Portlet**: [assets/simple-portlet.md](assets/simple-portlet.md)
  - A small list embedded as a portlet component on a portal page
  - No header/footer; `$data` is scoped with an IIFE
  - Minimal structure with no peripheral UI such as search, pagination, or edit links

### Example Generation Instructions

When the user requests something like "create a portlet screen" or "create a list as a portal component," refer to this asset's code and customize it for the user's requirements while keeping the structure and scoping that assume multiple placements.
The content (table columns, number of rows displayed, etc.) may be changed according to the user's requirements, but do not change the following:

- Do not add a visual header/footer such as `imds-header`
- Do not define `$data` outside the IIFE (in the global scope)
- Do not create routing configuration (`.xml`) or routing authorization (`service://...`)
