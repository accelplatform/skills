# Search Result Template Template

## Overview

A template for displaying custom Contents search results, called from the IM-ContentsSearch standard search screen.
iAP calls `init(request)` for each Contents item in the search results one at a time.
The template itself does not call the search API (it is a passive implementation).

## File Structure

```
src/main/jssp/src/im_contents_search/template/
├── {feature_name}.js     # Template (Function container)
└── {feature_name}.html   # Template (Presentation page)
```

---

## {feature_name}.js (Function container)

```javascript
let $data = '{}';

// ========================================
// Entry point
// ========================================
/**
 * Entry point called by IM-ContentsSearch for each search result item.
 * Builds a response object from the request argument and binds it to $data as a JSON string.
 *
 * @param {Object} request - Request parameters (search result Contents)
 *   request.id              - Contents ID (e.g., "{feature_name}_001")
 *   request.id_original     - Primary key of the source data
 *   request.title           - Title
 *   request.url             - URL set in the Crawler
 *   request.record_date     - Last updated (Date type)
 *   request.snippets        - Highlighted snippets (Array<String>) ※generated internally by iAP
 *   request.typeBreadcrumbs - TYPE hierarchy breadcrumb ※generated internally by iAP
 *   // Only fields declared in require-dynamic-fields are present
 *   request.category        - Dynamic field (STRING)
 *   request.price           - Dynamic field (INT)
 */
function init(request) {
  // Execute main processing
  let response = main(request);

  // Store in $data as JSON
  // Replace all '/' with '\/' to prevent </script> in JSON
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// Main processing
// ========================================
/**
 * Performs main processing.
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
    // Execute main business logic
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the Search Result Template. {}', e.message);
    response.error.code = 'E001';
    response.error.message = 'An unexpected error has occurred.';
    return response;
  }

  return response;
}

// ========================================
// Business logic
// ========================================
/**
 * Performs the main business logic.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  return {
    id:          request.id,
    originalId:  request.id_original,
    title:       request.title || '',
    detailUrl:   request.url + '/' + (request.id_original || ''),
    recordDate:  formatDate(request.record_date),
    breadcrumbs: request.typeBreadcrumbs || '',
    category:    request.category || '',
    price:       formatPrice(request.price),
    snippets:    request.snippets || [],
    labels: {
      category: MessageManager.getMessage('CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.CATEGORY'),
      price:    MessageManager.getMessage('CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.PRICE')
    }
  };
}

// ========================================
// Utilities
// ========================================
/**
 * Converts a date to the standard date format.
 *
 * @param {Date} date - Date to convert
 * @returns {String} Formatted date string
 */
function formatDate(date) {
  if (isBlank(date)) {
    return '';
  }
  return AccountDateTimeFormatter.format(
    date,
    'IM_DATETIME_FORMAT_DATE_STANDARD',
    'IM_DATETIME_FORMAT_TIME_TIMESTAMP'
  );
}

/**
 * Converts a price (INT type Dynamic field) to an integer string.
 *
 * @param {*} price - Price value to convert
 * @returns {String} Integer string, or empty string
 */
function formatPrice(price) {
  if (isNull(price)) {
    return '';
  }
  return String(price);
}
```

**Properties of the `request` object:**

Standard fields (always present):

| Property | Type | Description |
|----------|----|------|
| `request.id` | String | Contents ID (in the format `"{feature_name}_primary_key"`) |
| `request.id_original` | String | Primary key of the source data |
| `request.title` | String | Value set via `setTitle()` in the Crawler |
| `request.url` | String | Value set via `setUrl()` in the Crawler |
| `request.type` | String | Contents TYPE |
| `request.record_date` | Date | Value set via `setRecordDate()` in the Crawler |

> The `text` set by `addText()` and the `attachment` set by `addAttachment()` are **not included**.

iAP-generated fields (always present):

| Property | Type | Description |
|----------|----|------|
| `request.typeBreadcrumbs` | String | TYPE hierarchy breadcrumb |
| `request.snippets` | Array\<String\> | Highlighted snippets |

Dynamic fields (only those declared in `<require-dynamic-fields>` are present):

| Property | Type | Description |
|----------|----|------|
| `request.{key_name}` | Type-dependent | Accessible via a property name matching the key name of `Fields.*.toField("{key_name}")` |

---

## {feature_name}.html (Presentation page)

```html
<div>
  <h3 class="imcs-content-detail-title">
    <a target="_blank"></a>
  </h3>

  <div class="imcs-content-detail-subtitle">
    <span class="imcs-content-detail-subtitle-date"></span>
    <span class="imcs-content-detail-subtitle-breadcrumbs"></span>
  </div>

  <div class="imcs-content-detail-option">
    <div class="imcs-content-detail-option-row">
      <div class="imcs-content-detail-option-cell">
        <span class="imcs-content-detail-option-label"></span>
        <span class="imcs-content-detail-option-value"></span>
      </div>
    </div>
    <div class="imcs-content-detail-option-row">
      <div class="imcs-content-detail-option-cell">
        <span class="imcs-content-detail-option-label"></span>
        <span class="imcs-content-detail-option-value"></span>
      </div>
    </div>
  </div>

  <div class="imcs-content-detail-snippets"></div>

  <script type="text/javascript">
    (function() {
      const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;
      const container = document.currentScript.parentElement;

      if ($data.error.code) {
        container.style.display = 'none';
        return;
      }

      const result = $data.result;

      // Title / link
      const anchor = container.querySelector('.imcs-content-detail-title a');
      anchor.href = result.detailUrl;
      anchor.textContent = result.title;

      // Date
      container.querySelector('.imcs-content-detail-subtitle-date').textContent = result.recordDate;
      // Breadcrumbs
      container.querySelector('.imcs-content-detail-subtitle-breadcrumbs').textContent = result.breadcrumbs;

      // Option items
      const optionRows = container.querySelectorAll('.imcs-content-detail-option-row');
      const categoryCell = optionRows[0].querySelector('.imcs-content-detail-option-cell');
      categoryCell.querySelector('.imcs-content-detail-option-label').textContent = result.labels.category;
      categoryCell.querySelector('.imcs-content-detail-option-value').textContent = result.category;

      const priceCell = optionRows[1].querySelector('.imcs-content-detail-option-cell');
      priceCell.querySelector('.imcs-content-detail-option-label').textContent = result.labels.price;
      priceCell.querySelector('.imcs-content-detail-option-value').textContent = result.price;

      // Snippets (highlighted text)
      const snippetsContainer = container.querySelector('.imcs-content-detail-snippets');
      result.snippets.forEach(function(snippet) {
        const span = document.createElement('span');
        span.innerHTML = snippet;
        snippetsContainer.appendChild(span);
      });
    })();
  </script>
</div>
```

**CSS Class Roles:**

| CSS Class | Description |
|-----------|------|
| `imcs-content-detail-title` | Search result title row |
| `imcs-content-detail-subtitle` | Subtitle row (date, TYPE breadcrumbs) |
| `imcs-content-detail-subtitle-date` | Date text |
| `imcs-content-detail-option` | Additional information area (Dynamic field display) |
| `imcs-content-detail-option-row` | One row of additional information |
| `imcs-content-detail-option-cell` | Label + value cell |
| `imcs-content-detail-option-label` | Field label |
| `imcs-content-detail-option-value` | Field value |
| `imcs-content-detail-snippets` | Snippet (highlighted text) display area |

**XSS Countermeasures (DOM API Usage Guidelines):**

| Value | DOM API | Reason |
|---|---------|------|
| `$data.result.title` / Dynamic field values | `textContent` | User-derived data — auto-escaped |
| `$data.result.detailUrl` | `a.href = ...` | Assignment to the href property is interpreted as a URL |
| `$data.result.breadcrumbs` (typeBreadcrumbs) | `textContent` | TYPE hierarchy breadcrumbs generated by iAP (plain text format) |
| Snippets (snippet) | `innerHTML` | Text in which iAP has marked up keywords with `<b>` tags (sanitized except for the marked-up portions) |

> `innerHTML` must not be used for user-derived data. Restrict the use of `innerHTML` to `snippets` only.

---

## Message Properties

### caption.properties (default, same as English)

```properties
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=Category
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.PRICE=Price
```

### caption_ja.properties (Japanese — written in Unicode escape format)

```properties
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=カテゴリ
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.PRICE=価格
```

### caption_en.properties (English)

```properties
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=Category
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.PRICE=Price
```

### caption_zh_CN.properties (Simplified Chinese — written in Unicode escape format)

```properties
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.CATEGORY=类别
CAP.Z.APP.{FEATURE_NAME}.CONTENTSSEARCH.FIELD_NAME.PRICE=价格
```

**Note:** Japanese and Chinese Message properties files must be written in Unicode escape format (`\uXXXX`).
