# Raw JSON Receiving REST-API Template

## Overview

A template for an echo-style API that receives raw JSON (`application/json`) sent in the request body via POST and returns a summary of the parsed result as JSON, together with a verification screen.

- Receiver API: `POST /sample_api/api/post_json` (requires `Content-Type: application/json` and `X-Intramart-Secure-Token`)
- Test screen: `/sample_api/view/post_json_test`

Use this template as the **canonical pattern** for "obtain the raw JSON body with `request.getMessageBodyAsString()` and `JSON.parse` it". For multipart/form-data file uploads use `file-upload-download-api.md` instead.

## Replacement Points When Using in Another Category

This asset uses `sample_api` as the category name. When applying it to a different feature (for example `inventory_api`), replace **all** of the following at once. **Missing replacements will silently break error code consistency or shift API URLs even though the build still succeeds.**

| Type | Target | Example |
|------|--------|---------|
| Placement path | `src/main/jssp/src/sample_api/` | `src/main/jssp/src/{feature}/` |
| API URL (routing XML `path`) | `/sample_api/api/post_json` | `/{feature}/post_json` |
| Routing XML `page` attribute | `sample_api/api/post_json`, `sample_api/view/post_json_test` | `{feature}/api/post_json`, etc. |
| HTML `POST_JSON_API_PATH` | `'sample_api/api/post_json'` | `'{feature}/post_json'` |
| Error code prefix | `E.IWP.SAMPLE.POST_JSON.*` | `E.IWP.{FEATURE}.POST_JSON.*` |
| `$subTitle` | `'sample_api'` | `'{feature}'` |
| Log tag | `[post_json]` | (no change required) |

Perform the category-name replacement by **reviewing the entire sample one character at a time**. Always verify residue with `grep -n 'sample_api\|SAMPLE\.' {file}`.

## File Layout

```
src/main/jssp/src/sample_api/
  ├── api/
  │    └── post_json.js          # Raw JSON receiver API
  └── view/
       ├── post_json_test.js     # Test screen function container
       └── post_json_test.html   # Test screen presentation page

src/main/conf/routing-jssp-config/
  └── sample_api.xml             # Routing configuration
```

## Design Points

### Reading the Request Body

To obtain the raw JSON, use `request.getMessageBodyAsString()`.
Internally it converts to a Unicode string according to the ServletRequest encoding setting, so behavior is controlled by the `charset` parameter of the `Content-Type` header. Clients should send `Content-Type: application/json; charset=utf-8`.

### Content-Type Validation

Obtain `request.getContentType()` and verify it starts with `application/json`.
Neglecting this check leads to a hazardous situation where a value sent with `application/x-www-form-urlencoded` is parsed as JSON and a 500-class error is returned.

### Body Size Limit

Always **reject excessive sizes up front** with `request.getContentLength()` (default 1 MB).
This mitigates the risk of an attacker pressuring memory by sending a huge JSON.

### Security

| Item | Countermeasure |
|------|----------------|
| CSRF | `X-Intramart-Secure-Token` verification (mandatory because of POST) |
| Invalid Content-Type | Strict `application/json` prefix check |
| Size attack | Pre-check with `getContentLength()` (default 1 MB) |
| Malformed JSON | Return the `JSON.parse` exception as 400 |

### Error Response

- Success: `application/json` with `{error:false, data:{...}}`
- Failure: `application/json` with `{error:true, errorMessage:"[code] message"}` together with HTTP 4xx/5xx
- Follow `.github/instructions/jssp-error-handling.instructions.md` for error code naming.

### Handling of the `ApiError` Type

**Do not declare `@typedef {Error & {code, httpStatus}} ApiError` per file.**
Placing multiple API files in the same feature folder forces `tsc` to raise `TS2300 Duplicate identifier`. **Always cast with an inline `@type` annotation** (see the code example).

---

## Raw JSON Receiver API (sample_api/api/post_json.js)

```javascript
/**
 * Raw JSON receiver REST-API
 *
 * @file post_json.js
 * @description Echo-style API that receives raw JSON sent in the POST request body
 *              and returns a summary (type, key count, received content) as JSON.
 */

// ========================================
// Constants
// ========================================
let CONTENT_TYPE_JSON_PREFIX = 'application/json';
let MAX_BODY_LENGTH_BYTES = 1 * 1024 * 1024;

let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.POST_JSON.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.POST_JSON.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.POST_JSON.00003';
let ERROR_CODE_INVALID_CONTENT_TYPE = 'E.IWP.SAMPLE.POST_JSON.00004';
let ERROR_CODE_BODY_TOO_LARGE = 'E.IWP.SAMPLE.POST_JSON.00005';
let ERROR_CODE_INVALID_JSON = 'E.IWP.SAMPLE.POST_JSON.00006';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.POST_JSON.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// Entry Point
// ========================================
/**
 * REST-API entry point.
 * Receives the raw JSON body and returns summary information as JSON.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    checkMethod(request);
    verifySecureToken(request);
    checkContentType(request);
    let parsedBody = readJsonBody(request);
    response = {
      error: false,
      data: buildSummary(parsedBody, request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || 'An unexpected error has occurred.';

    if (statusCode >= 500) {
      logger.error('[post_json] An error occurred during API processing. code={} message={}', [code, message]);
    } else {
      logger.warn('[post_json] API request could not be accepted. code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// Method / Secure Token / Content Type Verification
// ========================================
/**
 * Checks whether the HTTP method is allowed.
 *
 * @param {Object} request - Request object
 */
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'Method ' + method + ' is not allowed.');
  }
}

/**
 * Verifies the secure token (CSRF protection).
 *
 * @param {Object} request - Request object
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token was not specified.');
  }

  let secureTokenManager = new SecureTokenManager();
  let result = secureTokenManager.verify(token);

  if (result.error) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token verification failed.');
  } else if (!result.data) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token is invalid.');
  }
}

/**
 * Checks whether the Content-Type is of the application/json family.
 *
 * @param {Object} request - Request object
 */
function checkContentType(request) {
  let contentType = request.getContentType();
  if (!contentType) {
    throwApiError(ERROR_CODE_INVALID_CONTENT_TYPE, 400,
      'Content-Type was not specified. Send with application/json.');
  }
  let normalized = String(contentType).toLowerCase();
  if (normalized.indexOf(CONTENT_TYPE_JSON_PREFIX) !== 0) {
    throwApiError(ERROR_CODE_INVALID_CONTENT_TYPE, 400,
      'Content-Type must be application/json. received=' + contentType);
  }
}

// ========================================
// Body Retrieval / JSON Parsing
// ========================================
/**
 * Retrieves the request body and parses it as JSON.
 *
 * @param {Object} request - Request object
 * @return {*} Parsed result (object, array, primitive)
 */
function readJsonBody(request) {
  let contentLength = request.getContentLength();
  if (contentLength > MAX_BODY_LENGTH_BYTES) {
    throwApiError(ERROR_CODE_BODY_TOO_LARGE, 400,
      'Request body exceeds the limit (' + MAX_BODY_LENGTH_BYTES + ' bytes).');
  }

  let body = request.getMessageBodyAsString();
  if (!body || body.length === 0) {
    throwApiError(ERROR_CODE_INVALID_REQUEST, 400, 'Request body is empty.');
  }

  if (body.length > MAX_BODY_LENGTH_BYTES) {
    throwApiError(ERROR_CODE_BODY_TOO_LARGE, 400,
      'Request body exceeds the limit (' + MAX_BODY_LENGTH_BYTES + ' characters).');
  }

  try {
    return JSON.parse(body);
  } catch (e) {
    throwApiError(ERROR_CODE_INVALID_JSON, 400,
      'Failed to parse JSON. message=' + e.message);
  }
}

// ========================================
// Business Logic
// ========================================
/**
 * Builds summary information to be included in the response from the parsed body.
 *
 * @param {*} parsedBody - Parsed request body
 * @param {Object} request - Request object
 * @return {Object} Response data
 */
function buildSummary(parsedBody, request) {
  let valueType = detectValueType(parsedBody);
  let summary = {
    receivedAt: formatDateTime(new Date()),
    contentType: request.getContentType(),
    contentLength: request.getContentLength(),
    valueType: valueType,
    received: parsedBody,
  };

  if (valueType === 'object') {
    let keys = Object.keys(parsedBody);
    summary.keyCount = keys.length;
    summary.keys = keys;
  } else if (valueType === 'array') {
    summary.itemCount = parsedBody.length;
  }

  return summary;
}

/**
 * Detects the type of a value.
 *
 * @param {*} value - Value to inspect
 * @return {string} Type name (object / array / string / number / boolean / null)
 */
function detectValueType(value) {
  if (value === null) {
    return 'null';
  }
  if (value instanceof Array) {
    return 'array';
  }
  return typeof value;
}

/**
 * Formats a Date as a YYYY-MM-DD HH:mm:ss string.
 *
 * @param {Date} value - Date value
 * @return {string} Formatted string
 */
function formatDateTime(value) {
  return value.getFullYear()
    + '-' + padZero(value.getMonth() + 1)
    + '-' + padZero(value.getDate())
    + ' ' + padZero(value.getHours())
    + ':' + padZero(value.getMinutes())
    + ':' + padZero(value.getSeconds());
}

/**
 * Zero-pads a single-digit number to two digits.
 *
 * @param {number} value - Number
 * @return {string} Zero-padded string
 */
function padZero(value) {
  return value < 10 ? '0' + value : String(value);
}

// ========================================
// Exceptions and Response Transmission
// ========================================
/**
 * Throws an exception with an error code and HTTP status.
 *
 * @param {string} code - Error code
 * @param {number} httpStatus - HTTP status code
 * @param {string} message - Error message
 */
function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

/**
 * Sends a JSON response. Execution of JavaScript stops after sending.
 *
 * @param {Object} response - Response object to send
 * @param {number} statusCode - HTTP status code
 */
function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

---

## Test Screen Function Container (sample_api/view/post_json_test.js)

```javascript
/**
 * Raw JSON receiver REST-API test screen
 *
 * @file post_json_test.js
 * @description Verification screen for /sample_api/api/post_json.
 *              Enter a request JSON in the textarea, send it, and display the response on screen.
 */

// ========================================
// Bound Variables (for presentation page linking)
// ========================================
let $title = 'Raw JSON Receiver API Test';
let $subTitle = 'sample_api';
let $data = '{}';

// ========================================
// Entry Point
// ========================================
/**
 * Entry point for screen display.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  let response = {
    result: {},
    error: {
      code: '',
      message: '',
    },
  };
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}
```

---

## Test Screen Presentation Page (sample_api/view/post_json_test.html)

A verification screen with a textarea for the request body and a textarea for displaying the response. "Load sample" populates a sample JSON, "Send" performs `fetch`, and the HTTP status / received type / summary / response body are displayed.

```html
<imart type="head">
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <style>
    .post-json-actions {
      display: flex;
      gap: 0.75em;
      align-items: center;
      margin-top: 0.5em;
    }
    .post-json-response {
      background-color: var(--imds-color-background-secondary, #f5f7fa);
      border: 1px solid var(--imds-color-border, #d0d7de);
      border-radius: 0.5em;
      padding: 1em 1.5em;
      margin-top: 1em;
    }
    .post-json-response-meta {
      display: flex;
      gap: 1.5em;
      flex-wrap: wrap;
      margin-bottom: 0.75em;
      font-size: 0.875em;
    }
    .post-json-response-meta dt {
      font-weight: bold;
      display: inline;
      margin-right: 0.5em;
    }
    .post-json-response-meta dd {
      display: inline;
      margin: 0;
    }
    .post-json-response-body {
      width: 100%;
      min-height: 12em;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
    .post-json-request-body {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.875em;
    }
  </style>
  <!-- Scope $data via an IIFE instead of leaving it in the global scope -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      const POST_JSON_API_PATH = 'sample_api/api/post_json';
      const SAMPLE_REQUEST = {
        userId: 'user001',
        userName: 'Taro Yamada',
        age: 30,
        roles: ['admin', 'user'],
        active: true
      };

      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      function getElement(id) {
        return document.getElementById(id);
      }

      function clearResponse() {
        getElement('post-json-response').style.display = 'none';
        getElement(':responseStatus:').textContent = '';
        getElement(':responseValueType:').textContent = '';
        getElement(':responseSummary:').textContent = '';
        getElement(':responseBody:').value = '';
      }

      function showResponse(status, result) {
        getElement(':responseStatus:').textContent = String(status);

        if (result && result.error === false && result.data) {
          const data = result.data;
          getElement(':responseValueType:').textContent = data.valueType || '';
          let summaryParts = [];
          if (data.keyCount !== undefined) {
            summaryParts.push('keys=' + data.keyCount);
          }
          if (data.itemCount !== undefined) {
            summaryParts.push('items=' + data.itemCount);
          }
          if (data.contentLength !== undefined) {
            summaryParts.push('contentLength=' + data.contentLength);
          }
          getElement(':responseSummary:').textContent = summaryParts.join(' / ');
        } else {
          getElement(':responseValueType:').textContent = '';
          getElement(':responseSummary:').textContent = '';
        }

        getElement(':responseBody:').value = JSON.stringify(result, null, 2);
        getElement('post-json-response').style.display = '';
      }

      async function sendPostJson(rawBody) {
        const response = await fetch(POST_JSON_API_PATH, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Intramart-Secure-Token': getSecureToken()
          },
          body: rawBody
        });

        let result = null;
        try {
          result = await response.json();
        } catch (error) {
          result = null;
        }

        if (!result) {
          imuiShowErrorMessage('Could not read the response as JSON.');
          showResponse(response.status, { error: true, errorMessage: '(JSON parse failed)' });
          return false;
        }

        showResponse(response.status, result);

        if (result.error) {
          imuiShowErrorMessage(result.errorMessage);
          return false;
        }

        imuiShowSuccessMessage('Request sent.');
        return true;
      }

      getElement('send-button').addEventListener('click', () => {
        const rawBody = getElement(':requestBody:').value;
        if (!rawBody || rawBody.trim().length === 0) {
          imuiShowWarningMessage('Please enter a request body.');
          return;
        }
        clearResponse();
        sendPostJson(rawBody);
      });

      getElement('load-sample-button').addEventListener('click', () => {
        getElement(':requestBody:').value = JSON.stringify(SAMPLE_REQUEST, null, 2);
        clearResponse();
      });

      getElement('clear-button').addEventListener('click', () => {
        getElement(':requestBody:').value = '';
        clearResponse();
      });

      if ($data.error && $data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      }
    });
  })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Page-wide container (no id is added, since it is placed inside the intra-mart theme's <div id="imui-container">) -->
<div class="imds-container">
  <header class="imds-header">
    <div class="imds-header-icon">
      <span class="imds-icon-wrapper is-large">
        <span class="imds-icon is-medium"><i class="fa-solid fa-code"></i></span>
      </span>
    </div>
    <div class="imds-header-title">
      <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
      <h1 id="page-title"><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
    </div>
  </header>

  <main>
    <imart type="imSecureToken" />

    <section class="imds-py-3 imds-px-4" aria-labelledby="request-section-title">
      <h2 id="request-section-title" class="imds-mb-3">Request</h2>
      <div class="imds-field" for=":requestBody:">
        <div class="imds-field-label">
          <label for=":requestBody:" class="has-text-weight-bold">JSON body</label>
        </div>
        <div class="imds-field-control">
          <textarea
            id=":requestBody:"
            name="requestBody"
            class="imds-textarea post-json-request-body"
            rows="10"
            placeholder='{ "key": "value" }'></textarea>
          <span class="imds-help-text">Sent as POST with Content-Type: application/json.</span>
        </div>
      </div>
      <div class="post-json-actions">
        <button type="button" class="imds-button is-primary" id="send-button">
          <span class="imds-icon"><i class="fa-solid fa-paper-plane" aria-hidden="true"></i></span>
          <span class="imds-button-text">Send</span>
        </button>
        <button type="button" class="imds-button is-outlined" id="load-sample-button">
          <span class="imds-button-text">Load sample</span>
        </button>
        <button type="button" class="imds-button is-ghost" id="clear-button">
          <span class="imds-button-text">Clear</span>
        </button>
      </div>
    </section>

    <section class="imds-py-3 imds-px-4" aria-labelledby="response-section-title">
      <h2 id="response-section-title" class="imds-mb-3">Response</h2>
      <div id="post-json-response" class="post-json-response" style="display:none;" role="status" aria-live="polite">
        <dl class="post-json-response-meta">
          <div>
            <dt>HTTP status</dt>
            <dd id=":responseStatus:"></dd>
          </div>
          <div>
            <dt>Received type</dt>
            <dd id=":responseValueType:"></dd>
          </div>
          <div>
            <dt>Summary</dt>
            <dd id=":responseSummary:"></dd>
          </div>
        </dl>
        <div class="imds-field" for=":responseBody:">
          <div class="imds-field-label">
            <label for=":responseBody:" class="has-text-weight-bold">Response body</label>
          </div>
          <div class="imds-field-control">
            <textarea
              id=":responseBody:"
              name="responseBody"
              class="imds-textarea post-json-response-body"
              rows="15"
              readonly></textarea>
          </div>
        </div>
      </div>
    </section>
  </main>
</div>
```

---

## Routing Configuration (sample_api.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <file-mapping path="/sample_api/api/post_json" page="sample_api/api/post_json">
    <authz uri="service://sample_api/api/post_json" action="execute" />
  </file-mapping>

  <file-mapping path="/sample_api/view/post_json_test" page="sample_api/view/post_json_test">
    <authz uri="service://sample_api/view/post_json_test" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

Specify an explicit `<authz uri/action>` for each `file-mapping`, and define the authorization resources with `jssp-tenant-setup-generator`.

---

## Implementation Points

### Use `getMessageBodyAsString()` Only for POST/PUT/PATCH

GET requests have an empty message body by specification. Calling `getMessageBodyAsString()` does not raise an error but returns an empty string. The template is POST-only; if you extend it to PUT/PATCH, just add them like `ALLOWED_METHODS = ['POST', 'PUT', 'PATCH']`.

### Always Catch `JSON.parse` Exceptions

Malformed JSON coming from the client must be **returned as 400**. If you call `JSON.parse` without surrounding it with `try`, it surfaces as 500 and becomes indistinguishable from a server fault.

### Validate the Size with Both Content-Length and String Length

`getContentLength()` is a declared value from an HTTP header that a malicious client may forge. Combine it with the length of the string obtained via `getMessageBodyAsString()` for defense in depth.

### Normalizing Content-Type Validation

`Content-Type` arrives with parameters like `application/json; charset=utf-8`, so check with a **prefix match** (`indexOf(...) === 0`). An equality comparison (`===`) always fails when a charset is specified.

### Secure Token

POST is treated as a mutating operation, so `X-Intramart-Secure-Token` is required.
Clients obtain it from `<meta name="im_secure_token">` and attach it to the `fetch` headers (see the "Test Screen Presentation Page" section above for an example).

### Do Not Use the `ApiError` typedef (Reminder)

Declaring `@typedef {Error & {code, httpStatus}} ApiError` per file triggers `tsc` `TS2300 Duplicate identifier`. **Casting with an inline `@type` annotation is the canonical form of this template.** See `.github/instructions/jssp-error-handling.instructions.md` for details.

## Related

- `reference/argument-request.md` - Specification of `request.getMessageBodyAsString()`
- `reference/api-secure-token-manager.md` - CSRF token verification
- `reference/secure-token-check.md` - End-to-end client + server verification pattern
- `.github/instructions/jssp-error-handling.instructions.md` - Error code naming and API error response format
- `.github/instructions/jssp-security.instructions.md` - Overall input validation policy
- `assets/file-upload-download-api.md` - For multipart/form-data (file) uploads
