---
paths:
  - "src/main/jssp/**/*.js"
---

# Function Container Standards

> **Application Scope**: 🟢 **Always** — Applies when generating function containers (`.js`): `init()` structure, validation, IM Common Master API, etc.

## Standard Implementation Policy for Function Containers

### Basic Structure

```javascript
/**
 * {Screen name}
 *
 * @file {File name}
 * @description {Brief description of this file}
 */

// ========================================
// Constant Definitions
// ========================================
// TODO: Add constants to be used here

// ========================================
// Bound Variables (for presentation page linking)
// ========================================
let $title = 'Screen Title';        // Name of the screen itself
let $subTitle = 'Subtitle';         // Sub-name of the screen (name of the category the screen belongs to)
let $data = '{}';
// TODO: Add additional bound variables if needed

// ========================================
// Initialization Processing
// ========================================
/**
 * Screen initialization processing
 *
 * @param {Object} request - Request object
 */
// ========================================
// Entry Point
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

  // Store in $data in JSON format
  // If </script> is included in the JSON, it can cause vulnerabilities such as script termination
  // and arbitrary code injection, so replace all '/' with '\/' in the response
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// Main Processing
// ========================================
/**
 * Executes main processing.
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
    // Validate request parameters
    validateRequest(request);
  } catch (e) {
    logger.error('An error occurred while displaying the screen. {}', e.message);
    transferErrorPage('E001', 'Request parameters are invalid.');
    return response;
  }

  try {
    // Execute main business logic processing
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the screen. {}', e.message);
    transferErrorPage('E002', 'An unexpected error has occurred.');
    return response;
  }

  return response;
}

// ========================================
// Validation
// ========================================
/**
 * Validates request parameters.
 * Checks parameters that must not be incorrect.
 *
 * @param {Object} request - Request parameters
 */
function validateRequest(request) {
  // TODO: Add validation check logic here
}

// ========================================
// Business Logic
// ========================================
/**
 * Executes main business logic processing.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  let result = {};

  // TODO: Add main business logic processing here
  // Store processing results in result

  return result;
}

// ========================================
// Error Page Transition
// ========================================
/**
 * Displays an error message full-screen when an error occurs.
 *
 * @param {String} code - Error code
 * @param {String} message - Error message
 */
function transferErrorPage(code, message) {
  let param = {
    title: 'A system error has occurred',
    message: [code, message].join('\n'),
  };
  Transfer.toErrorPage(param);
}
```

### Implementation Policy

- Define bound variables for title display (`$title` and `$subTitle`) and for presentation screen display (`$data`)
  - Avoid defining additional bound variables beyond these if possible
- `$data` should be a JSON string to pass information to the presentation screen
  - Use `JSON.stringify()` to convert to a JSON string
  - Escape the output JSON string using `.replace(/\//g, '\\/')` to neutralize slashes
    - This prevents unintended script termination when `</script>` is included in the JSON string on the presentation page
- Do not use `new Packages.***` (direct instantiation of Java classes). This can cause memory leaks and processing locks that affect performance. Instead, use the SSJS global classes and APIs defined in `d.ts/`
- **Call APIs according to the type definitions in d.ts**
  - If the argument type does not include `null` (no `?` or `| null`), do not pass `null`. Determine whether it is optional by the presence of `?` (optional argument). Even when expressing "no conditions", pass an empty object of the appropriate type (e.g., `new AppCmnSearchCondition()`)
  - **Do not guess and call method names not defined in d.ts**. Always verify method names and argument types in d.ts or the reference (`reference/` directory) before implementing.
    - Example: `UserActvMatterPropertyValue` does not have `setMatterProperty()`. The correct methods are `createMatterProperty(Array)` / `updateMatterProperty(Array)`
- Completely separate responsibilities per function
  - For example, the validateRequest function only checks request parameter constraints
- Aim for functions of 50 lines or fewer
  - Consider splitting when exceeding 50 lines
- Maximum 4 levels of nesting

### Notes on IM Common Master API (IMMUserManager / IMMCompanyManager, etc.)

- **Do not pass `null`** to search condition arguments (`AppCmnSearchCondition` type). An `IllegalArgumentException` will occur on the Java side
- Even when retrieving all records without conditions, **pass an empty `new AppCmnSearchCondition()`**
- Use IM Common Master API rather than direct DB access (e.g., `SELECT FROM im_user`) to retrieve user names and departments
  - User name: `IMMUserManager.getUser(bizKey, date, localeId)` → `result.data.locales[locale].userName`
  - Department (current organization priority): `Contexts.getUserContext().currentDepartment.departmentName`
    - Prioritize current organization for the logged-in user themselves
    - When current organization cannot be retrieved or for other users: `IMMCompanyManager.listDepartmentWithUser()` → `result.data[0].displayName` (return type is `DepartmentListNodeInfo[]`)

- **Include null checks and fallbacks when accessing the `locales` object**. Errors will occur when `result.data.locales` itself is `undefined` or when there is a locale mismatch

```javascript
// OK: Pass an empty search condition object
let condition = new AppCmnSearchCondition();
let result = manager.listDepartmentWithUser(bizKey, condition, true, new Date(), localeId);

// NG: Passing null → IllegalArgumentException
let result = manager.listDepartmentWithUser(bizKey, null, true, new Date(), localeId);

// Retrieving tenant locale
let tenantLocale = new TenantInfoManager().getTenantInfo().data.locale;

// OK: Access with null check for locales itself + fallback
if (result.data && result.data.locales) {
  let locales = result.data.locales;
  let localeInfo = locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
  if (localeInfo) {
    userName = localeInfo.userName || '';
  }
}

// NG: No null check for locales → exception when locales is undefined
let locales = result.data.locales;
let localeInfo = locales[locale];  // locales is undefined → TypeError

// NG: Direct access without fallback → error on locale mismatch
let localeInfo = result.data.locales[locale];
userName = localeInfo.userName;  // localeInfo is undefined → TypeError
```

## Implementation Patterns for validateRequest Function

Basic implementation patterns for request parameter validation functions in JavaScript.

### Basic Structure

```javascript
/**
 * Validates request parameters.
 *
 * @param {Object} request - Request parameters
 * @throws {Error} On validation error
 */
function validateRequest(request) {
  // Execute validation for each parameter
  validateParameter1(request);
  validateParameter2(request);
  // ... Add necessary validations
}
```

### Validation Patterns

#### Required Check

```javascript
let value = request['parameterName'];
if (!value || value.length === 0) {
  throw new Error('parameterName is required.');
}
```

#### String Length Check

```javascript
let value = request['parameterName'];
if (value.length > maxLength) {
  throw new Error(`parameterName must be ${maxLength} characters or fewer.`);
} else if (value.length < minLength) {
  throw new Error(`parameterName must be at least ${minLength} characters.`);
}
```

#### Numeric Check

```javascript
let value = request['parameterName'];
if (isNaN(value)) {
  throw new Error('parameterName must be a number.');
} else if (value < min || value > max) {
  throw new Error(`parameterName must be between ${min} and ${max}.`);
}
```

#### Regex Pattern Matching

```javascript
let value = request['parameterName'];
let pattern = /^[a-zA-Z0-9_-]+$/;
if (!pattern.test(value)) {
  throw new Error('parameterName can only use alphanumerics, hyphens, and underscores.');
}
```

#### Email Address Format Check

```javascript
let value = request['parameterName'];
let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!pattern.test(value)) {
  throw new Error('parameterName format is invalid.');
}
```

#### Date Format Check

```javascript
let value = request['parameterName'];
let pattern = /^\d{4}-\d{2}-\d{2}$/;
if (!pattern.test(value)) {
  throw new Error('parameterName must be in YYYY-MM-DD format.');
}
```

#### User Code Format Check

```javascript
let value = request['parameterName'];
let pattern = /^[0-9A-Za-z_@\.\+\!\-]$/;  // Half-width alphanumerics and _-@.+!
if (!pattern.test(value)) {
  throw new Error('parameterName must be in user code format.');
}
```

#### Composite Pattern Examples

```javascript
// 1. Required check + string length check
let userCode = request['userCode'];
if (!userCode || userCode.length === 0) {
  throw new Error('userCode is required.');
} else if (userCode.length > 100) {
  throw new Error('userCode must be 100 characters or fewer.');
}

// 2. Optional item check (validates only when value exists)
let age = request['age'];
if (age !== undefined && age !== null && age !== '') {
  if (isNaN(age)) {
    throw new Error('age must be a number.');
  } else if (age < 0 || age > 150) {
    throw new Error('age must be between 0 and 150.');
  }
}
```

### Implementation Policy

- Throw an exception as soon as an error is found
- Clearly state which parameter has what problem
- Execute in the following order of basic checks
  1. Required check
  2. Digit count check
  3. Format check
  4. Correlation check with other parameters
- Use strict equality operators (`===`)

## Handling the request Object

### Retrieving Request Parameters

```javascript
// Retrieving GET and POST parameters
let userId = request['userId'];
let keyword = request['keyword'];

// Setting default values
let page = request['page'] || '1';
let sortKey = request['sortKey'] || 'user_id';

// Retrieving array parameters
let selectedIds = request['selectedIds'];
if (selectedIds) {
  let idArray = selectedIds.split(',');
}
```

### Implementation Policy

- Always validate values obtained from request parameters
- Since parameters are retrieved as strings from request, convert to numbers using `parseInt()` or `parseFloat()` when needed
- Always sanitize request parameters, and be careful of injection when using them as SQL parameters or storage file names
