# OAuth Resource JSSP Implementation Policy

Implementation rules for JSSP (`.js`) called as OAuth REST-API.
The basic structure is the same as a regular REST-API (function container of `jssp-page-generator`), but **secure token verification is not required** (because the OAuth access token functions as authentication), which is the major difference.

> Note: That `.html` pair files are not required **applies to both regular REST-API (under `/api/`) and OAuth REST-API (under `/oauth/`)**. The `.html` pair is required only for screens (under `view/`).

## Location

```
src/main/jssp/src/{feature-name}/oauth/{file}.js
```

Set up an `oauth/` subdirectory directly under the feature directory to aggregate the REST-API published via OAuth.
This is a structure that exists in parallel with `{feature-name}/view/`, `{feature-name}/api/` (CSRF secure token version REST-API), `{feature-name}/job/`, `{feature-name}/workflow/`, etc.

Match the path specified by `<client-resource target="..." />` in `oauth-client-resources-config`.

| `target` value | Actual file |
|-------------|--------------|
| `sample_oauth/oauth/get_user` | `src/main/jssp/src/sample_oauth/oauth/get_user.js` |
| `equipment_api/oauth/list` | `src/main/jssp/src/equipment_api/oauth/list.js` |

> **Do not create `.html` pair files.** OAuth resources do not return presentation pages, so they are unnecessary. Placing empty `.html` files causes confusion.

## Mandatory Items

| Item | Regular REST-API | OAuth REST-API |
|------|:-------------:|:--------------:|
| Implementing `init(request)` as entry point | ○ | ○ |
| HTTP method verification (405 rejection) | ○ | ○ |
| Request parameter validation (400) | ○ | ○ |
| **Secure token verification** | ○ (required for write APIs) | × (not required because authenticated by OAuth token) |
| Setting appropriate HTTP status with `Web.getHTTPResponse().setStatus()` | ○ | ○ |
| Error JSON in `{ error: true, errorMessage: "[code] message" }` format | ○ | ○ |
| Normal JSON in `{ error: false, data: {...} }` format | ○ | ○ |
| Use of bound variables (`$data`, etc.) | ○ (referenced on the screen side) | × (not required because HTML is not returned) |

## Entry Point Skeleton

```javascript
/**
 * {API name} REST-API (OAuth Published)
 *
 * @file {file}.js
 * @description {API description}
 */

// ========================================
// Constant Definitions
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.{product}.{feature}.{API name}.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.{product}.{feature}.{API name}.00002';
let ERROR_CODE_INTERNAL = 'E.{product}.{feature}.{API name}.99999';

let ALLOWED_METHODS = ['GET'];   // Published HTTP methods

// ========================================
// Entry Point
// ========================================
/**
 * Entry point of OAuth REST-API.
 *
 * @param {Object} request - request object
 */
function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP method check (405)
    checkMethod(request);
    // Request parameter validation (400)
    validateRequest(request);
    // Business logic
    response = {
      error: false,
      data: processBusinessLogic(request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || 'An unexpected error occurred.';

    if (statusCode >= 500) {
      logger.error('[{API name}] An error occurred while processing the API. code={} message={}', [code, message]);
    } else {
      logger.warn('[{API name}] The API request could not be accepted. code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  sendJsonResponse(response, statusCode);
}

// ========================================
// Method / Validation
// ========================================
function checkMethod(request) {
  let method = request.getMethod();
  if (ALLOWED_METHODS.indexOf(method) === -1) {
    throwApiError(ERROR_CODE_METHOD_NOT_ALLOWED, 405,
      'Method ' + method + ' is not allowed.');
  }
}

function validateRequest(request) {
  // TODO: Parameter validation
}

function throwApiError(code, httpStatus, message) {
  let error = /** @type {Error & {code: string, httpStatus: number}} */ (new Error(message));
  error.code = code;
  error.httpStatus = httpStatus;
  throw error;
}

// ========================================
// Business Logic
// ========================================
function processBusinessLogic(request) {
  // TODO: Business processing
  return {};
}

// ========================================
// Response Sending
// ========================================
function sendJsonResponse(response, statusCode) {
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}
```

## Differences from Regular REST-API (in Code)

**Delete** the secure token verification related items (`verifySecureToken` function, `SecureTokenManager` instantiation, `ERROR_CODE_INVALID_TOKEN` constant).
The reason is that the OAuth access token functions as authentication (see `oauth-overview.md` for details).
For specific diff list (rewrite example of CSRF secure token version → OAuth version), see "Differences from existing `sample_api/api/get_user.js`" in `assets/sample-oauth-get-user.md`.

## Retrieving Authenticated User

You can retrieve the context of the "token-issued user" who is the owner of the OAuth access token.

```javascript
let accountContext = Contexts.getAccountContext();
let userCd = accountContext.userCd;        // user code
let locale = accountContext.locale;        // locale
// ... AccountContext fields are mostly equivalent to a regular screen
```

> For details, see `.github/skills/jssp-page-generator/reference/api-account-context.md`.

## Retrieving Request Parameters

As with regular REST-API, you can retrieve via `request[key]` or `request.getParameter(key)`.

| Retrieval method | Description |
|---------|------|
| `request['paramName']` | Query string or form parameter |
| `request.getMethod()` | `GET` / `POST` / `PUT` / `DELETE`, etc. |
| `request.getHeader('Header-Name')` | Request header |
| `request.getContentType()` | Content-Type |
| `request.getInputStream()` | Request body (binary / JSON, etc.). When receiving `application/json`, read from the stream |

For implementation patterns when receiving `application/json` body, see `.github/skills/jssp-page-generator/assets/post-json-api.md` (the body retrieval procedure is the same in the OAuth version).

## Response and Status Code

```javascript
let httpResponse = Web.getHTTPResponse();
httpResponse.setStatus(statusCode);
httpResponse.setContentType('application/json; charset=utf-8');
httpResponse.sendMessageBodyString(JSON.stringify(response));
```

| Status | Use |
|-----------|------|
| `200` | Normal response |
| `400` | Request parameter invalid |
| `404` | Resource / user not found |
| `405` | Unexpected HTTP method |
| `500` | Server internal error |

`401` / `403` are returned **on the platform's OAuth dispatcher side** (token invalid, expired, or insufficient scope). No need to build them within the resource implementation.

## Handling Confidential Information

- Do not include **passwords, authentication tokens, personal information (unmasked phone numbers and emails, etc.)** in the response JSON
- Same when outputting logs (use `MaskUtil` in `.github/instructions/jssp-logging.instructions.md`)
- The `userCd` (user code) in the response is information also returned in regular REST-API, so it is OK, but **password hashes, session IDs, etc. are strictly prohibited**

## Related References

- `oauth-overview.md` - Overall picture
- `oauth-resources-config.md` - URL mapping and scope specification
- `.github/skills/jssp-page-generator/reference/api-web.md` - `Web.getHTTPResponse()` details
- `.github/skills/jssp-page-generator/reference/api-account-context.md` - Authenticated user context
- `.github/skills/jssp-page-generator/reference/argument-request.md` - request argument
- `.github/instructions/jssp-error-handling.instructions.md` - Error response format / HTTP status
- `.github/instructions/jssp-security.instructions.md` - SQL injection / XSS countermeasures (applied similarly in OAuth API)

## Checklist

(Basic items covered in the "Mandatory Items" table above are omitted. Listed are only feature-specific items to check additionally during implementation and review)

- [ ] Are the error codes in `E.{product}.{feature}.{API name}.{sequence}` format (`ERROR_CODE_INTERNAL` assigned to 5xx)?
- [ ] Are 4xx logged with `logger.warn` and 5xx with `logger.error`?
- [ ] Is the response free from confidential information (passwords, tokens, unmasked personal information, etc.)?
- [ ] When using SQL access, is `DbParameter` used for binding (string concatenation forbidden, see `.github/instructions/jssp-2way-sql.instructions.md`)?
- [ ] When referencing the user context with `Contexts.getAccountContext()`, is a null check included?
