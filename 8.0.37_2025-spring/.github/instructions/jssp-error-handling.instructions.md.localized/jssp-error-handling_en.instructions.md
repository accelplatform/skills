---
applyTo: "src/main/jssp/**/*.js"
description: "エラー処理の方針"
---

# Error Handling Standards

> **Application Scope**: 🟢 **Always** — Applies to every JSSP implementation. try-catch, error response shape, error code naming, etc.

## Basic Principles

1. Always catch errors and handle them appropriately
2. Distinguish between **recoverable errors** and **non-recoverable errors**
3. Generalize user-facing messages
4. Output detailed information to logs
5. **Do not include confidential information in logs**

## Error Types and Handling Methods

Errors are classified into two types: "recoverable" and "non-recoverable", each handled differently.

### Recoverable Errors (Bound Variable Method)

Errors that can be resolved by the user correcting input or retrying the operation.

**Examples:**

- Input validation errors (validated within the function container, transitions to error page)
- Validation errors when calling APIs (include errors in the response)

**Implementation pattern (screen):**

```javascript
let $data = '{}';

function init(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',
      message: '',
    },
  };

  try {
    // Validate request parameters
    validateRequest(request);
    // Execute main business logic processing
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the screen. {}', e.message);
    transferErrorPage('E001', 'An unexpected error has occurred.');
  }

  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function transferErrorPage(code, message) {
  let param = {
    title: 'A system error has occurred',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### Non-Recoverable Errors (Screen Transition Method)

Errors that cannot be resolved by user operations, such as system failures.

**Examples:**

- Database connection errors
- External API connection errors
- Unexpected exceptions
- Session expiration

**Implementation pattern:**

```javascript
function init(request) {
  let logger = Logger.getLogger();
  try {
    // processing
  } catch (e) {
    logger.error('System error: {}', e.message);
    transferErrorPage('E001', 'An unexpected error has occurred.');
  }
}

function transferErrorPage(code, message) {
  let param = {
    title: 'A system error has occurred',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

## Error Information Structure (Screen)

The response stored in the screen bound variable `$data` has the following structure.

```javascript
let response = {
  result: null,          // Result of normal processing
  error: {
    code: 'E001',        // Error code
    message: 'Error message', // User-facing message
  },
};
```

## API Response Structure (JSON)

JSON responses returned by REST APIs take one of the following two formats.

### On Success

```json
{
  "error": false,
  "data": { ... }
}
```

### On Error

```json
{
  "error": true,
  "errorMessage": "[E.IWP.FOO.BAR.00001] Error message"
}
```

- `error` is a boolean. The response includes `errorMessage` only when `true`, and `data` only when `false` (do not mix both).
- `errorMessage` follows the format `[error-code] message`, embedding the error code in the leading square brackets. Do not keep the error code as a separate field.

### Error Code Naming Convention

Name error codes in the format `E.<Product>.<Module>.<Submodule>.<Sequence>`.

| Segment | Content | Example |
|---------|---------|---------|
| `E` | Fixed value indicating an error | `E` |
| `<Product>` | Product identifier (shared across the project) | `IWP` |
| `<Module>` | Functional category | `EQUIP`, `WORKFLOW` |
| `<Submodule>` | Classification within the module | `LENDING`, `MASTER` |
| `<Sequence>` | 5-digit sequence number | `00001` |

Example: `E.IWP.EQUIP.LENDING.00001`

### HTTP Status Codes

For REST APIs returning JSON, set the appropriate status code by error type.
Use `httpResponse.setStatus(sc)` to set the status code.

| Status | Usage |
|--------|-------|
| `200` | Successful completion |
| `400` | Request parameter validation error, secure token verification error |
| `405` | Unsupported HTTP method |
| `500` | Internal server error (DB error, unexpected exceptions, etc.) |

**Notes:**
- `401` (Unauthorized) / `403` (Forbidden) are determined by the intra-mart platform and returned before reaching the `init` function. Application-level implementation is not required.
- Attach `httpStatus` to the Error object you throw and read it in the catch block to pass to `setStatus()` (see "API Error Handling" below for the implementation).

### Secure Token (CSRF Protection)

For mutation APIs (POST/PUT/DELETE), always verify the secure token as CSRF protection.

- The client sends the token via the `X-Intramart-Secure-Token` request header (see `jssp-presentation-page.instructions.md`).
- The server verifies it with `SecureTokenManager.verify(token)` and, on failure, returns **400** with `{error: true, errorMessage}`.
- Missing tokens, verification failures, and expired tokens are all treated as 400.
- For read-only APIs (GET), apply the same verification when returning sensitive data.

## Displaying Errors on Presentation Pages

```html
<script>
  const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

  document.addEventListener('DOMContentLoaded', function() {
    if ($data.error.code) {
      imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
    } else {
      renderPage($data.result);
    }
  });

  function renderPage(result) {
    // Screen rendering processing
  }
</script>
```

## Error Message Guidelines

### User-Facing Messages

| Type | Example Message |
|------|----------------|
| Input error | Please enter a user ID. |
| No search results | No matching data found. |
| Permission error | You do not have permission to perform this operation. |
| System error | A system error has occurred. Please contact your administrator. |

### Log Messages

```javascript
let logger = Logger.getLogger();

// Error log example
logger.error('[E001] User retrieval error: userId={}, message={}', userId, e.message);

// Also output stack trace
logger.error('[E001] User retrieval error: {}', e.message);
if (e.stack) {
  logger.error('Stack trace: {}', e.stack);
}
```

## Validation Errors

```javascript
/**
 * Validation processing
 * Throws an exception if there are errors
 */
function validateRequest(request) {
  // User code: required, max 100 characters
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throw new Error('userCode is required.');
  } else if (userCode.length > 100) {
    throw new Error('userCode must be 100 characters or fewer.');
  }

  // Last name: required, max 30 characters
  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throw new Error('userLastName is required.');
  } else if (userLastName.length > 30) {
    throw new Error('userLastName must be 30 characters or fewer.');
  }

  // First name: required, max 30 characters
  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throw new Error('userFirstName is required.');
  } else if (userFirstName.length > 30) {
    throw new Error('userFirstName must be 30 characters or fewer.');
  }
}
```

## Complete Error Handling Example for the init Function

### Screen Error Handling

```javascript
let $title = 'Screen Title';        // Name of the screen itself
let $subTitle = 'Subtitle';         // Sub-name of the screen (name of the category the screen belongs to)
let $data = '{}';

function init(request) {
  let logger = Logger.getLogger();
  let response = {
    result: null,
    error: {
      code: '',
      message: '',
    },
  };

  try {
    // Validate request parameters
    validateRequest(request);
    // Execute main business logic processing
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the screen. {}', e.message);
    transferErrorPage('E001', 'An unexpected error has occurred.');
  }

  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

function validateRequest(request) {
  // Validation processing
}

function processBusinessLogic(request) {
  // Main business logic processing
  return {
    userCode: '',
    userFirstName: '',
    userLastName: '',
    age: '',
  };
}

function transferErrorPage(code, message) {
  let param = {
    title: 'A system error has occurred',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### API Error Handling

APIs return the format described in "API Response Structure (JSON)".
Attach `code` and `httpStatus` to the thrown Error object, then read them in the catch block to assemble `errorMessage` and call `setStatus()`.

Because the standard `Error` type does not have `code` / `httpStatus` properties, cast the result of `new Error()` and the `e` from the catch clause **with an inline `@type` annotation** so that future TypeScript type checking passes.

> **Note:** Do not declare an `@typedef ApiError` per file.
> When multiple API files (e.g., `api/foo.js`, `api/bar.js`) coexist in the same feature folder, running `tsc` over the whole folder always produces `TS2300 Duplicate identifier 'ApiError'`.
> If you need a shared type alias, declare it once as an `interface` under `d.ts/`.

```javascript
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.FOO.BAR.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.FOO.BAR.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.FOO.BAR.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.FOO.BAR.99999';

let ALLOWED_METHODS = ['POST'];

function init(request) {
  let logger = Logger.getLogger();
  let response;
  let statusCode = 200;

  try {
    // HTTP method check (405)
    checkMethod(request);
    // Secure token verification (400)
    verifySecureToken(request);
    // Request parameter validation (400)
    validateRequest(request);
    // Execute main business logic (500 on exception)
    response = {
      error: false,
      data: processBusinessLogic(request),
    };
  } catch (e) {
    let apiError = /** @type {Error & {code: string, httpStatus: number}} */ (e);
    statusCode = apiError.httpStatus || 500;
    let code = apiError.code || ERROR_CODE_INTERNAL;
    let message = apiError.message || 'An unexpected error has occurred.';

    if (statusCode >= 500) {
      logger.error('An error occurred during API processing. code={} message={}', [code, message]);
    } else {
      logger.warn('Invalid API request. code={} status={} message={}', [code, statusCode, message]);
    }

    response = {
      error: true,
      errorMessage: '[' + code + '] ' + message,
    };
  }

  // Return in JSON format
  let httpResponse = Web.getHTTPResponse();
  httpResponse.setStatus(statusCode);
  httpResponse.setContentType('application/json; charset=utf-8');
  httpResponse.sendMessageBodyString(JSON.stringify(response));
}

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
 * Verifies the `X-Intramart-Secure-Token` request header with `SecureTokenManager.verify()`.
 * Throws 400 on failure.
 *
 * @param {Object} request - Request object
 */
function verifySecureToken(request) {
  let token = request.getHeader('X-Intramart-Secure-Token');
  if (!token) {
    throwApiError(ERROR_CODE_INVALID_TOKEN, 400, 'Secure token is not specified.');
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
 * Throws a validation error (400).
 *
 * @param {string} message - Error message
 */
function throwValidationError(message) {
  throwApiError(ERROR_CODE_INVALID_REQUEST, 400, message);
}

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
```
