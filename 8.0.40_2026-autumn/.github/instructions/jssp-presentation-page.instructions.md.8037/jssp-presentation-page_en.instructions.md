---
applyTo: "src/main/jssp/**/*.html"
description: "プレゼンテーションページの実装方針"
---

# Presentation Page Standards

> **Application Scope**: 🟢 **Always** — Applies when generating presentation pages (`.html`): HTML structure, validation, `id` naming rules, etc.

## Standard Implementation Policy for Presentation Pages

### Basic Structure

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart>
  </title>
  <!-- Secure token -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- Custom styles for the presentation page -->
  <style>
    /* TODO: Add custom styles here */
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- Scripts for the presentation page -->
  <script>
    // Bind variable for presentation page integration
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

    // Processing after page load
    document.addEventListener('DOMContentLoaded', () => {
      // Get secure token
      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      // Initial display of the screen
      function initializeView(result) {
        // TODO: Add screen initialization processing here
      }

      // Initialize validation display
      function clearValidationError() {
        // TODO: Add validation display initialization processing here
      }

      // Show validation errors
      function showValidationError(errors) {
        // TODO: Add validation error display processing here
      }

      // Validate (consolidate logic here)
      function getValidationErrors() {
        // TODO: Add validation execution processing here
        return [];
      }

      // Create request parameters
      function createRequest() {
        // TODO: Add processing to create request parameters here
        return {
          foo: document.getElementById(':foo:').value,
          bar: document.getElementById(':bar:').value
        };
      }

      // Reset validation errors
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        } else {
          return true;
        }
      }

      // Registration processing and other business logic
      async function register(request) {
        // TODO: Add data registration processing here
      }

      // Event handling
      document.getElementById('register-button').addEventListener('click', () => {
        // TODO: Add event processing here
      });

      // Entry point
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
  </script>
</imart>

<!-- Full-page container -->
<div id="container">
  <div class="imds-container">
    <main>
      <!-- Main content -->
    </main>
  </div>
</div>
```

### Implementation Policy

- Additional JavaScript and CSS that are needed should be implemented inline within the `<imart type="head">` tag
  - Standard CSS is already configured by the intra-mart theme, so only define what is specifically instructed in separate design documents here
  - Do not define CSS unless there are explicit instructions for visual changes
- Required JavaScript libraries should be added inside the `<imart type="head">` tag using `<script>` tags
  - However, avoid adopting libraries as much as possible; implement in vanilla JavaScript when feasible
  - Write code that works in Microsoft Edge, Chrome, and Safari
- Use a `<div>` tag as the root tag and assign the `container` id attribute to it
  - Implement all required tags under the root tag
- The value attribute of `<imart>` tags must not be enclosed in double quotes
- Use the `DOMContentLoaded` event for initialization processing at page load

### Variable Declarations

JavaScript inside presentation pages runs in the browser, so Rhino restrictions do not apply.
The `const` restriction in `jssp-code-style.md` is exclusive to function containers (`.js`) and must not be applied to scripts inside HTML.

- **Variables that are not reassigned**: use `const`
- **Variables that are reassigned**: use `let`
- Do not use `var`

```javascript
// Good examples
const token = getSecureToken();        // Not reassigned → const
const roomList = result.roomList || []; // Not reassigned → const
let participants = [];                  // Reassigned later → let
let activeValidation = false;           // Reassigned later → let

// Bad examples
let token = getSecureToken();           // Using let when not reassigned
var participants = [];                  // Do not use var
```

### imart Tag Constraints

The `<imart>` tag differs from regular HTML tags in that it has strict rules for attribute value quoting.

| Attribute type | Double quotes | Example |
|-----------|:---:|-----|
| Fixed-value attributes such as type, escapeXml, escapeJs | Required | `type="string"` |
| Bind variable attributes such as value | Prohibited | `value=$data` |

#### 1. Attribute values other than bind variables must always be enclosed in double quotes (`"`)

Single quotes (`'`) or unquoted values (except bind variables) must not be used.

Bad examples:
```html
<imart type='string' escapeXml='true' escapeJs='false'>  <!-- Single quotes NG -->
<imart type=string escapeXml=true escapeJs=false>         <!-- Unquoted NG -->
```

Good example:
```html
<imart type="string" escapeXml="true" escapeJs="false">   <!-- Double quotes OK -->
```

#### 2. Bind variables (value attribute) must not be enclosed in double quotes

Bind variables are written as-is using the variable name with the `$` prefix.

Bad example:
```html
<imart type="string" value="$data" escapeXml="false" escapeJs="false" />  <!-- NG -->
```

Good example:
```html
<imart type="string" value=$data escapeXml="false" escapeJs="false" />    <!-- OK -->
```

## How to Use Bind Variables

### When Used for Simple String Output

```html
<title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
```

- The value attribute of the `<imart>` tag must not be enclosed in double quotes
- The `escapeXml` attribute must always be set to `true`
  - To prevent vulnerabilities
- The `escapeJs` attribute must always be set to `false`
  - To prevent strings from being corrupted by unnecessary escaping
- When using `<imart>` tags inside `<script>` tags, follow the "When embedding JSON" or "When used as a JavaScript string literal" patterns below

### When Embedding JSON

```javascript
const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;
```

- The value attribute of the `<imart>` tag must not be enclosed in double quotes
- The `escapeXml` attribute must always be set to `false`
  - To prevent JSON from being corrupted by unnecessary escaping
- The `escapeJs` attribute must always be set to `false`
  - To prevent JSON from being corrupted by unnecessary escaping

### When Used as a JavaScript String Literal

```javascript
let value = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
```

- The `escapeXml` attribute must always be set to `false`
  - XML escaping is unnecessary inside `<script>` because the HTML parser does not process it
- The `escapeJs` attribute must always be set to `true`
  - Escaping is required when the value contains JS special characters such as quotes or backslashes

**Note**: Setting `escapeXml="true" escapeJs="false"` will cause values containing `&` or `<` to be converted to `&amp;` etc., making them invalid as JavaScript strings

### Processing Order

Presentation pages are displayed in the following order.

1. Processing starts on the server side
2. The initial processing (init function) of the function container is executed
3. The processing result is bound to the bind variable `$data`
4. The HTML of the presentation page is generated
   - At this point, `<imart>` tags are interpreted and HTML source is dynamically generated
   - The JSON string bound to `$data` is output directly into the HTML
5. The response is sent to the client
6. Processing moves to the client side (browser, etc.) that received the response
7. Browser-side initialization processing is executed via DOMContentLoaded

## Policy on Using the maxlength Attribute

- The `maxlength` attribute is not used at all
- Character length limits are all communicated to users as validation error messages
- Silently cutting off input with `maxlength` means users cannot notice the character limit, and strings may be cut when pasting

## Naming Convention for the `id` Attribute

Different element kinds use different naming patterns for the `id` attribute. The deciding factors are **"frequency of JavaScript access"** and **"risk of polluting the global namespace"**: the higher the risk, the more aggressively the id is wrapped in colons `:` (a colon is not a valid JS identifier character, so `window.xxx` access is prevented).

| Element kind | id pattern | Example | Notes |
|---|---|---|---|
| **Form controls** (input / select / textarea) | **`:fieldName:`** (colons required) | `id=":userName:"` | Frequently accessed via `.value` etc. Colons prevent global variable exposure such as `window.userName`. |
| **Error spans** (`-error` suffix) | **`:fieldName:-error`** | `id=":userName:-error"` | Keeps visual correspondence with the input element id, so the colons are preserved. |
| **Always-required label spans** (accessibility use, `-label` suffix) | **`:fieldName:-label`** | `id=":locationType:-label"` | Used as the target of `aria-labelledby`. The field is always required, so `imds-required-label-required` is **applied statically** and **no JavaScript-side dynamic control is needed**. |
| **Conditionally-required label** (`-label` suffix, dynamically controlled) | **`fieldName-label`** (no colons) | `id="locationDetail-label"` | `imds-required-label-required` is **not** statically applied. Instead it is toggled by `toggleRequiredMark(id, condition)`. |
| **Buttons** (`-button` suffix) | **`xxx-button`** (no colons) | `id="apply-button"` | Contains a hyphen so it cannot pollute the global namespace, and it is not accessed via `.value` etc. |
| **Dialogs** (`-dialog` suffix) | **`xxx-dialog`** (no colons) | `id="user-select-dialog"` | Same as above. |
| **Forms** (`-form` suffix) | **`xxx-form`** (no colons) | `id="main-form"` | Same as above. |
| **Root containers and other structural elements** | No colons | `id="container"` | Same as above. |

### How to Distinguish Label Spans (Always-Required vs. Conditionally-Required)

**Always-required** (accessibility use with id) example:

```html
<div class="imds-field-label">
  <span id=":locationType:-label"
        class="imds-required-label-required"
        data-required-label="必須">Location</span>
</div>
<div class="imds-field-control">
  <div id=":locationType:"
       class="imds-radio-group is-horizontal"
       role="group"
       aria-labelledby=":locationType:-label">
    ...
  </div>
</div>
```

Key points:
- The `imds-required-label-required` class is **applied statically** in HTML.
- The id referenced via `aria-labelledby` follows the **`:fieldName:-label`** form.
- **No** `toggleRequiredMark()` call is needed in JavaScript.

**Conditionally-required** (dynamically controlled) example:

```html
<div class="imds-field-label">
  <label for=":locationDetail:" id="locationDetail-label">Location Detail</label>
</div>
<div class="imds-field-control">
  <input type="text" id=":locationDetail:" class="imds-textbox" />
</div>
```

```javascript
function toggleLocationDetailRequired() {
  const label = document.getElementById('locationDetail-label');
  if (getSelectedLocationType() === 'external') {
    label.classList.add('imds-required-label-required');
    label.setAttribute('data-required-label', '必須');
  } else {
    label.classList.remove('imds-required-label-required');
    label.removeAttribute('data-required-label');
  }
}
```

Key points:
- The initial HTML does **not** include the `imds-required-label-required` class.
- The id uses the **`fieldName-label`** (no-colon) form.
- JavaScript dynamically adds/removes the class with `classList.add/remove` based on the condition.

### Detection by the Validator

The `JSSP-HTML-018` rule in `jssp-page-generator/scripts/validate-jssp-code.js` uses the convention above to avoid false positives:

- id matching `:fieldName:-label` → **treated as accessibility use; skipped from the check**
- id matching `fieldName-label` → **subject to the `toggleRequiredMark()` call check**

## Date Input (imuiCalendar)

For date input, use `<imart type="imuiCalendar">` instead of `<input type="date">`.
For usage, attributes, notes, and the date-time input pattern (date + time combination), refer to `.github/skills/jssp-imds-theme/reference/imui-html-calendar.md`.

## Controlling Input Field Width

Input fields should have an appropriate width specified according to their content.
Without specification, fields expand to the full width of the parent element, which looks unnaturally large relative to the item content.

| Field type | Width control method | Guideline |
|--------------|----------|------|
| Date input (imuiCalendar) | `style="max-width: 10em;"` | Width appropriate for `yyyy-MM-dd` format |
| Time input (input type="time") | `style="max-width: 8em;"` | Width appropriate for HH:mm format |
| Select box | Size class (e.g. `is-small`) or `max-width` | Width that accommodates the longest option (e.g. `max-width: 15em;`) |
| Short text input (codes, numbers, etc.) | Size class or `max-width` | Width appropriate for the expected input character count |
| Long text input (names, descriptions, etc.) | Not required (full width by default) | - |
| Textarea | Not required (full width by default) | - |

### Anti-pattern: Do Not Define Custom `.max-width-NNem` / `.min-width-NNem` Classes

Do not define custom CSS classes such as `.max-width-12em { max-width: 12em; }` or `.min-width-8em { min-width: 8em; }` inside the `<style>` block for dimension control.
They share the same CSS specificity as imds defaults (e.g. `.imds-textbox`, `.imds-button`), so depending on declaration order, the imds rule may win and you end up forced to add `!important` everywhere as a workaround.

```css
/* NG: dimension control via a custom class */
.max-width-12em { max-width: 12em; }
.max-width-20em { max-width: 20em; }
.min-width-8em  { min-width: 8em; }
```

```html
<!-- NG: custom class can be overridden by imds-textbox / imds-button -->
<input type="text" class="imds-textbox max-width-12em" />
<button type="button" class="imds-button is-primary min-width-8em">Apply</button>

<!-- OK: inline style has higher specificity than any class rule, no !important needed -->
<input type="text" class="imds-textbox" style="max-width: 12em;" />
<button type="button" class="imds-button is-primary" style="min-width: 8em;">Apply</button>
```

Even if the same width value repeats in many places and DRY tempts you, write it inline first. Only consider higher-specificity solutions (e.g. CSS variables like `--w-input-date: 12em;`) once duplication actually becomes a maintenance problem.

This rule applies to **all dimension-related properties** (`max-width` / `min-width` / `width` / `height`, etc.) since they are likely to collide with imds defaults.

## Implementation Pattern for the getValidationErrors Function

A client-side validation function. It reads values directly from the DOM and returns an array of errors.
Because it is called from both `resetValidationError()` and `validateCurrentStep()`, consolidate the logic here.

### Basic Structure

```javascript
function getValidationErrors() {
  const errors = [];
  // Execute validation for each field
  return errors;
}
```

### Validation Patterns

#### Required Check

```javascript
const value = document.getElementById(':fieldName:').value;
if (!value || value.length === 0) {
  errors.push({ name: 'fieldName', message: 'fieldName is required.' });
}
```

#### Required + String Length Check (Compound)

```javascript
const userCode = document.getElementById(':userCode:').value;
if (!userCode || userCode.length === 0) {
  errors.push({ name: 'userCode', message: 'User code is required.' });
} else if (userCode.length > 100) {
  errors.push({ name: 'userCode', message: 'User code must be at most 100 characters.' });
}
```

For other patterns (numeric, regex, email, date format, optional fields, etc.), refer to the "Validation Pattern Catalogue" in `.github/skills/jssp-page-generator/assets/simple-form.md`.

### Implementation Policy

- When an error is found, add it to the array and continue checking the next field (to display all errors at once)
- Check order: required → length → format → cross-field correlation
- Use strict equality operator (`===`)

## Validation Execution Timing

### Basic Structure

- Do not display validation errors on the initial display of the screen even if there are input errors
- Perform the first validation check when the "Submit" or "Execute" button is pressed; if there are errors, re-run the validation check each time the content of each input element changes from that point on

### Implementation Policy

Overview of the architecture (see `.github/skills/jssp-page-generator/assets/simple-form.md` for the full implementation):

```javascript
document.addEventListener('DOMContentLoaded', () => {
  let activeValidation = false; // Do not show errors on initial display

  function clearValidationError() {
    document.querySelectorAll('.imds-field.imds-validation-error').forEach((el) => el.classList.remove('imds-validation-error'));
    document.querySelectorAll('.imds-error-text').forEach((el) => { el.style.display = 'none'; });
  }
  function showValidationError(errors) {
    errors.forEach((error) => {
      const field = document.querySelector(`.imds-field[for=":${error.name}:"]`);
      if (field) field.classList.add('imds-validation-error');
      const msg = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
      if (msg) { msg.textContent = error.message; msg.style.display = ''; }
    });
    activeValidation = true; // Enable real-time re-validation from this point
  }
  function getValidationErrors() { /* Consolidate validation logic in one place */ return []; }
  function resetValidationError() { clearValidationError(); showValidationError(getValidationErrors()); }
  function validateCurrentStep() {
    clearValidationError();
    const errors = getValidationErrors();
    if (errors.length > 0) { showValidationError(errors); return false; }
    return true;
  }

  // Text input: "input" / Select, date, checkbox: "change"
  [':textField:'].forEach((id) => { document.getElementById(id).addEventListener('input', () => { if (activeValidation) resetValidationError(); }); });
  [':selectField:'].forEach((id) => { document.getElementById(id).addEventListener('change', () => { if (activeValidation) resetValidationError(); }); });
});
```

### Notes on Fields Whose Values Are Set Programmatically

Real-time re-validation relies on native `input`/`change` events fired by user operations.
However, the following components set values programmatically, so native events do not fire and re-validation does not work.

#### imuiCalendar (altField)

The `altField` option of `imuiCalendar` sets the DOM property (`element.value`) using jQuery's `.val()`.
Since `.val()` does not fire a native `change` event, override the setter of the `value` property using `Object.defineProperty` to dispatch a `change` event.

```javascript
// Apply to the altField target fields of imuiCalendar
[':dateField1:', ':dateField2:'].forEach((id) => {
  const el = document.getElementById(id);
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(el, 'value', {
    get: function () {
      return descriptor.get.call(this);
    },
    set: function (val) {
      descriptor.set.call(this, val);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  el.addEventListener('change', () => {
    if (activeValidation) {
      resetValidationError();
    }
  });
});
```

#### Global Scope Callback Functions (imACMSearch, etc.)

Callback functions for `imACMSearch` (IM common master search) must be defined in the global scope.
Since `activeValidation` and `resetValidationError` inside `DOMContentLoaded` cannot be accessed directly due to scope, expose the re-validation function as `window._resetValidationError` and call it from within the callback.

```javascript
// Expose inside DOMContentLoaded
window._resetValidationError = () => {
  if (activeValidation) {
    resetValidationError();
  }
};

// Inside the global scope callback function
function callbackXxxSearch(result) {
  // ... value set processing ...
  if (window._resetValidationError) {
    window._resetValidationError();
  }
}
```

## URL Specification When Navigating Screens via Hyperlinks, etc.

### Implementation Policy

- When using hyperlinks or calling REST APIs within the same host, specify the path under the context path as a relative path
  - Example: To access `http://127.0.0.1/imart/foo/bar`, specify the URL as `foo/bar`
- This relative path matches the `path` attribute of the `file-mapping` tag defined in the routing configuration file, with the leading `/` removed
  - Example: If the routing configuration file has `<file-mapping path="/sample/user/list" page="sample/user/user_list">`, specify the URL to open the presentation page `sample/user/user_list` as `sample/user/list`

### Context Path

- The context path is the URL composed of the host name, port number, and root directory name of the deployment destination
  - Example: `http://127.0.0.1/imart/`
- Since the context path is specified in the `<base>` tag by the `<imart type="head">` tag, it is recommended to specify the path after the context path as a relative path when specifying URLs

## Calling APIs

### Basic Implementation

```javascript
async function register(request) {
  // Send to server side
  const response = await fetch('sample/simple_form/api/register', {
    method: 'POST',
    headers: {
      'X-Intramart-Secure-Token': getSecureToken()
    },
    body: new URLSearchParams(request)
  });

  // Response (the API is expected to return JSON in {error: true, errorMessage} format even on 4xx/5xx)
  // Fall back to null when the response is not JSON (e.g., proxy error)
  const result = await response.json().catch(() => null);
  if (!result) {
    imuiShowErrorMessage('A system error has occurred.');
    return false;
  }
  if (result.error) {
    imuiShowErrorMessage(result.errorMessage);
    return false;
  }

  imuiShowSuccessMessage('User registration was successful.');
  return true;
}
```

### Implementation Policy

- Use `fetch` for REST API calls
- Use `POST` for the method by default
- Set the secure token in the headers with key `X-Intramart-Secure-Token`
  - Whether to use the token is left to the API implementation side
  - On the client side, always set it in the request header regardless of whether it is used
- Change the body depending on the Content-Type expected by the API
  - If the API expects application/x-www-form-urlencoded, specify request parameters using `URLSearchParams`
  - If the API expects application/json, specify request parameters using `JSON.stringify()`
- Use Promises for asynchronous processing, and use `async` and `await` to make code readable
- The response format is `{error: bool, data | errorMessage}` (see `jssp-error-handling.md` "API Response Structure (JSON)")
  - Branch on `result.error` and, on error, display `result.errorMessage` (in `[code] message` format) directly
  - The HTTP status code (200 / 400 / 405 / 500) is set by the API. The client should not check it individually and should branch only on `result.error`
- On successful completion, display a completion message using `imuiShowSuccessMessage()`
- On error, display an error message using `imuiShowErrorMessage()`

## Events

### Basic Implementation

```javascript
// Create request parameters
function createRequest() {
  return {
    userCode: document.getElementById(':userCode:').value,
    userFirstName: document.getElementById(':userFirstName:').value,
    userLastName: document.getElementById(':userLastName:').value,
    age: document.getElementById(':age:').value
  };
}

document.getElementById('register-button').addEventListener('click', () => {
  // Create parameter information
  const request = createRequest();

  // Execute validation
  if (!resetValidationError()) return;

  // Confirmation message
  imdsConfirm(
    'Are you sure you want to register?',  // Message
    'Register',                            // Dialog title
    async () => {                          // Processing when OK button is clicked
      const isSuccess = await register(request);
      if (isSuccess) {
        clearValidationError();
      }
    }
  );
});
```

### Implementation Policy

- Define events using `addEventListener()`
- When creating request parameter information, change the retrieval method depending on the JavaScript library specified for use
  - If a JavaScript library such as React.js or Vue.js is specified for use, retrieve from state
  - Otherwise, retrieve using standard vanilla JavaScript DOM resolution methods
- Perform validation checks on request parameters
  1. Clear validation errors on the screen using `clearValidationError()`
  2. Execute validation checks using `getValidationErrors()`
  3. If there are errors in the validation check, display validation errors using `showValidationError()` and terminate
- When displaying a confirmation message, use `imdsConfirm()`
- Always specify a `mode` in the 5th argument `options` of `imdsConfirm()` according to the operation type
  - `info` (default): Normal confirmation (registration, search, etc.)
  - `warning`: Confirmation for data updates that cannot be undone
  - `danger`: Confirmation for data deletion (specify "Delete" for `okButton.text`)
- When the OK button is clicked, the callback in the 3rd argument is executed
  1. Call the API
  2. If the API processing is successful, clear the validation errors on the screen using `clearValidationError()`

## Implementing Enter Key Events

### IME Support (Required)

When Enter is pressed during Japanese IME conversion, `event.key === 'Enter'` fires.
If form submission or search processing is executed in this state, the conversion confirmation operation will accidentally trigger the processing.
**When capturing Enter key events, always add `!event.isComposing` as a condition.**

```javascript
textarea.addEventListener('keydown', (event) => {
  if (
    event.key === 'Enter' &&
    !event.isComposing &&   // Not in IME composition (unconfirmed state) ← Required
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    event.preventDefault();
    // Processing
  }
});
```

`event.isComposing` is `true` between `compositionstart` and `compositionend` (when characters are unconfirmed in IME). It becomes `false` on Enter after conversion is confirmed.

### Modifier Key Combinations

| Use case | Condition | Notes |
|-------------|------|------|
| Capture standalone Enter in textarea | `key==='Enter' && !isComposing && !ctrlKey && !shiftKey && !altKey && !metaKey` | Only for cases where line breaks are not needed |
| Submit with Ctrl+Enter (preserve line breaks) | `key==='Enter' && !isComposing && ctrlKey && !shiftKey && !altKey && !metaKey` | Recommended for multi-line comments, etc. |

## Error Message Display Patterns

### Displaying Error Messages

When displaying an error that interrupts processing and cannot be recovered from, use `imuiShowErrorMessage`

```javascript
imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
```

### Displaying Warning Messages

When displaying an error that interrupts processing but can be recovered from, use `imuiShowWarningMessage`

```javascript
imuiShowWarningMessage([$data.error.code, $data.error.message].join('\n'));
```
