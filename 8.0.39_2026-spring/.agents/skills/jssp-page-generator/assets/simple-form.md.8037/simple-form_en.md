# Simple Form Screen Template

## Overview

A basic screen template with a simple input form and a registration feature using an API.
On initial display, values retrieved from the server are shown in the presentation page; AJAX is used when saving input data.
The initial value of the user code is retrieved from query parameters.

## File Structure

```
src/main/jssp/src/simple_form/view/
  ├── index.js              # Function container
  └── index.html            # Presentation page

src/main/jssp/src/simple_form/api/
  └── register.js           # Registration API

src/main/conf/routing-jssp-config/
  └── simple_form.xml       # Routing configuration
```

---

## Function Container (simple_form/view/index.js)

```javascript
/**
 * Simple form screen
 *
 * @file index.js
 * @description Constructs a form that accepts user code, user name (first/last), and age as input.
 */

// ========================================
// Bind variables (for presentation page integration)
// ========================================
let $title = 'User Registration / Deletion';
let $subTitle = 'User Management';
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
    // Validate request parameters
    validateRequest(request);
  } catch (e) {
    logger.error('An error occurred during screen display. {}', e.message);
    transferErrorPage('E001', 'Invalid request parameters.');
    return response;
  }

  try {
    // Execute main business logic processing
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred during screen display. {}', e.message);
    transferErrorPage('E002', 'An unexpected error occurred.');
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
  // Nothing in particular
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
  let result = {
    userCode: '',               // User code
    userFirstName: '',          // User first name
    userLastName: '',           // User last name
    age: ''                     // Age
  };

  // Retrieve request parameters
  let userCode = request['userCode'];
  if (userCode != null) {
    result.userCode = userCode;
  }

  return result;
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

## Presentation Page (simple_form/view/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart> - <imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></title>
  <!-- Secure token -->
  <meta name="im_secure_token" content="<imart type="imSecureToken" mode="value" />">
  <!-- Presentation page custom styles -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- Presentation page scripts (scope $data via an IIFE instead of leaving it in the global scope) -->
  <script>
  (function($data) {
    document.addEventListener('DOMContentLoaded', () => {
      // Flag to always run validation check
      let activeValidation = false;

      // Display confirmation dialog
      function imdsConfirm(message, title, onOk, onCancel, options) {
        // If already displayed, return false immediately
        if (imdsConfirm._active) {
          return Promise.resolve(false);
        }
        imdsConfirm._active = true;

        const VALID_MODES = ['info', 'danger', 'warning'];
        let mode = (options && options.mode) || 'info';
        if (!VALID_MODES.includes(mode)) mode = 'info';

        const okText = (options && options.okButton && options.okButton.text) || 'Execute';
        const cancelText = (options && options.cancelButton && options.cancelButton.text) || 'Cancel';
        const dialogTitle = title || 'Confirm';

        // Settings by mode
        const iconClass = mode === 'info' ? 'fa-circle-question' : 'fa-triangle-exclamation';
        const okButtonClass = mode === 'danger' ? 'imds-button is-danger' : 'imds-button is-primary';

        // Create dialog element
        const dialog = document.createElement('dialog');
        dialog.className = 'imds-confirm-wrapper';

        dialog.innerHTML =
          '<div class="imds-confirm is-' + mode + '">' +
            '<div class="imds-confirm-content-wrapper">' +
              '<button class="imds-confirm-close imds-button is-ghost" aria-label="Close">' +
                '<span class="imds-icon" aria-hidden="true"><i class="fa-solid fa-xmark"></i></span>' +
              '</button>' +
              '<div class="imds-confirm-content">' +
                '<div class="imds-confirm-message-wrapper">' +
                  '<div class="imds-confirm-icon">' +
                    '<span class="imds-icon is-x-small is-' + mode + '">' +
                      '<i class="fa-solid ' + iconClass + '"></i>' +
                    '</span>' +
                  '</div>' +
                  '<div class="imds-confirm-message">' +
                    '<p class="imds-confirm-message-title"></p>' +
                    '<div class="imds-confirm-message-content"></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div class="imds-confirm-footer">' +
              '<div class="imds-confirm-footer-content">' +
                '<button type="button" class="imds-button imds-confirm-cancel-button"></button>' +
                '<button type="button" class="' + okButtonClass + ' imds-confirm-ok-button"></button>' +
              '</div>' +
            '</div>' +
          '</div>';

        // Safely insert user input via textContent (XSS countermeasure)
        dialog.querySelector('.imds-confirm-message-title').textContent = dialogTitle;
        dialog.querySelector('.imds-confirm-cancel-button').textContent = cancelText;
        dialog.querySelector('.imds-confirm-ok-button').textContent = okText;

        // Allow line breaks with newline characters in message
        const contentEl = dialog.querySelector('.imds-confirm-message-content');
        const lines = String(message).split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (i > 0) contentEl.appendChild(document.createElement('br'));
          contentEl.appendChild(document.createTextNode(lines[i]));
        }

        // Remember trigger element before opening dialog (to return focus after closing)
        const triggerElement = document.activeElement;

        // ARIA attributes
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        const titleId = 'imds-confirm-title-' + Date.now();
        dialog.setAttribute('aria-labelledby', titleId);
        dialog.querySelector('.imds-confirm-message-title').id = titleId;

        document.body.appendChild(dialog);

        return new Promise(function(resolve) {
          let settled = false;

          function close(result) {
            if (settled) return;
            settled = true;
            imdsConfirm._active = false;
            dialog.removeEventListener('keydown', onKeyDown);
            dialog.close();
            document.body.removeChild(dialog);
            // Return focus to trigger element
            if (triggerElement && typeof triggerElement.focus === 'function') {
              triggerElement.focus();
            }
            resolve(result);
          }

          const okButton = dialog.querySelector('.imds-confirm-ok-button');
          const cancelButton = dialog.querySelector('.imds-confirm-cancel-button');
          const closeButton = dialog.querySelector('.imds-confirm-close');

          // OK button
          okButton.addEventListener('click', function() {
            if (typeof onOk === 'function') onOk();
            close(true);
          });

          // Cancel button
          cancelButton.addEventListener('click', function() {
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // × button (treated as cancel)
          closeButton.addEventListener('click', function() {
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // Close with Escape key (treated as cancel)
          dialog.addEventListener('cancel', function(e) {
            e.preventDefault();
            if (typeof onCancel === 'function') onCancel();
            close(false);
          });

          // Keyboard operation
          // - Enter:  Confirm as OK button (if cancel/× has focus, those button actions take priority)
          // - Tab:    No additional implementation needed as native dialog provides focus trap
          // - Escape: Handled by cancel event
          function onKeyDown(e) {
            if (e.key === 'Enter') {
              const focused = document.activeElement;
              if (focused === cancelButton || focused === closeButton) {
                return;
              }
              e.preventDefault();
              okButton.click();
            }
          }
          dialog.addEventListener('keydown', onKeyDown);

          dialog.showModal();

          // Initial focus
          // - danger mode: Focus on cancel button to prevent accidental operation
          // - Others:      Focus on OK button
          setTimeout(function() {
            if (mode === 'danger') {
              cancelButton.focus();
            } else {
              okButton.focus();
            }
          }, 0);
        });
      }

      /** @type {boolean} Display flag (to prevent double display) */
      imdsConfirm._active = false;

      // Get secure token
      function getSecureToken() {
        return document.querySelector('meta[name=im_secure_token]').content;
      }

      // Initial screen display
      function initializeView(result) {
        document.getElementById(':userCode:').value = result.userCode;
        document.getElementById(':userFirstName:').value = result.userFirstName;
        document.getElementById(':userLastName:').value = result.userLastName;
        document.getElementById(':age:').value = result.age;
      }

      // Initialize validation display
      function clearValidationError() {
        document.querySelectorAll('.imds-field.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });

        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // Show validation error
      function showValidationError(errors) {
        errors.forEach((error) => {
          const fieldElement = document.querySelector(`.imds-field[for=":${error.name}:"]`);
          if (fieldElement) {
            fieldElement.classList.add('imds-validation-error');
          }

          const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
          if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = '';
          }
        });

        // Always run validation check
        activeValidation = true;
      }

      // Validation (logic consolidated here; called by both resetValidationError and validateCurrentStep)
      function getValidationErrors() {
        const errors = [];

        // User code: required, max 100 characters
        const userCode = document.getElementById(':userCode:').value;
        if (!userCode || userCode.length === 0) {
          errors.push({name: 'userCode', message: 'User code is required.'});
        } else if (userCode.length > 100) {
          errors.push({name: 'userCode', message: 'User code must be at most 100 characters.'});
        }

        // User name (last name): required, max 30 characters
        const userLastName = document.getElementById(':userLastName:').value;
        if (!userLastName || userLastName.length === 0) {
          errors.push({name: 'userLastName', message: 'Last name is required.'});
        } else if (userLastName.length > 30) {
          errors.push({name: 'userLastName', message: 'Last name must be at most 30 characters.'});
        }

        // User name (first name): required, max 30 characters
        const userFirstName = document.getElementById(':userFirstName:').value;
        if (!userFirstName || userFirstName.length === 0) {
          errors.push({name: 'userFirstName', message: 'First name is required.'});
        } else if (userFirstName.length > 30) {
          errors.push({name: 'userFirstName', message: 'First name must be at most 30 characters.'});
        }

        return errors;
      }

      // Create request parameters
      function createRequest() {
        return {
          userCode: document.getElementById(':userCode:').value,
          userFirstName: document.getElementById(':userFirstName:').value,
          userLastName: document.getElementById(':userLastName:').value,
          age: document.getElementById(':age:').value
        };
      }

      // Reset validation error (re-check on input change after an error has been shown, and update the display)
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

      // Registration processing
      async function register(request) {
        // Send to server
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

      // Input element change event
      document.getElementById(':userCode:').addEventListener('input', () => {
        if (activeValidation) {
          resetValidationError();
        }
      });
      document.getElementById(':userLastName:').addEventListener('input', () => {
        if (activeValidation) {
          resetValidationError();
        }
      });
      document.getElementById(':userFirstName:').addEventListener('input', () => {
        if (activeValidation) {
          resetValidationError();
        }
      });

      // Register button click event
      document.getElementById('register-button').addEventListener('click', () => {
        // Create parameter information
        const request = createRequest();

        // Run validation
        if (!resetValidationError()) return;

        // Confirmation message
        imdsConfirm(
          'Are you sure you want to register?',
          'Register',
          async () => {
            const isSuccess = await register(request);
            if (isSuccess) {
              clearValidationError();
            }
          }
        );
      });

      // Entry point
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
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
      <div class="imds-header-back-button">
        <button type="button" class="imds-button is-ghost is-large">
          <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
        </button>
      </div>
      <div class="imds-header-title">
        <p><imart type="string" value=$subTitle escapeXml="true" escapeJs="false"></imart></p>
        <h1><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></h1>
      </div>
    </header>

    <!-- Main content -->
    <main>
      <form id="main-form" class="imds-form has-background-color-gray imds-scrollbar imds-py-4 imds-px-6">
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">Basic Information</h2>
          <div class="imds-field-container has-accent-color">
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="Required">User Code</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field" for=":userCode:">
                  <div class="imds-field-control">
                    <input type="text" id=":userCode:" class="imds-textbox" name="userCode" value="" />
                  </div>
                  <span class="imds-error-text" for=":userCode:">Error message is displayed here.</span>
                </div>
              </div>
            </div>
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="Required">Full Name</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field-group">
                  <div class="imds-field-group-control is-horizontal">
                    <div class="imds-field" for=":userLastName:">
                      <div class="imds-field-label">
                        <label for=":userLastName:">Last Name</label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userLastName:" class="imds-textbox" name="userLastName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userLastName:">Error message is displayed here.</span>
                    </div>
                    <div class="imds-field" for=":userFirstName:">
                      <div class="imds-field-label">
                        <label for=":userFirstName:">First Name</label>
                      </div>
                      <div class="imds-field-control">
                        <input type="text" id=":userFirstName:" class="imds-textbox" name="userFirstName" value="" />
                      </div>
                      <span class="imds-error-text" for=":userFirstName:">Error message is displayed here.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label"><span>Other Information</span></div>
              <div class="imds-field-group-control is-horizontal">
                <div class="imds-field" for=":age:">
                  <div class="imds-field-label">
                    <label for=":age:">Age</label>
                  </div>
                  <div class="imds-field-control">
                    <select id=":age:" class="imds-select" name="age">
                      <option value="">Please select</option>
                      <option value="10">Teens</option>
                      <option value="20">Twenties</option>
                      <option value="30">Thirties</option>
                      <option value="40">Forties</option>
                      <option value="50">Fifties</option>
                      <option value="60">Sixties and above</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
      <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
        <button type="button" id="register-button" class="imds-button is-primary" style="min-width: 8em;">Register</button>
        <button type="button" id="temporary-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">Save Draft</button>
        <button type="button" id="delete-button" class="imds-button is-outlined is-danger" style="min-width: 8em;">Delete</button>
      </div>
    </main>
  </div>
</div>
```

---

## Registration API (simple_form/api/register.js)

```javascript
/**
 * User Registration API
 *
 * @file register.js
 * @description Accepts user code, user name (first/last), and age as input and registers them in the database.
 */

// ========================================
// Constants
// ========================================
let ERROR_CODE_INVALID_REQUEST = 'E.IWP.SAMPLE.SIMPLE_FORM.00001';
let ERROR_CODE_METHOD_NOT_ALLOWED = 'E.IWP.SAMPLE.SIMPLE_FORM.00002';
let ERROR_CODE_INVALID_TOKEN = 'E.IWP.SAMPLE.SIMPLE_FORM.00003';
let ERROR_CODE_INTERNAL = 'E.IWP.SAMPLE.SIMPLE_FORM.99999';

let ALLOWED_METHODS = ['POST'];

// ========================================
// Entry point
// ========================================
/**
 * Entry point for the API.
 * Executed first when the API is called.
 *
 * @param {Object} request - Request object
 */
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
    let message = apiError.message || 'An unexpected error occurred.';

    if (statusCode >= 500) {
      logger.error('[register] An error occurred during API processing. code={} message={}', [code, message]);
    } else {
      logger.warn('[register] API request was not accepted. code={} status={} message={}', [code, statusCode, message]);
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

// ========================================
// Method / Secure token / Validation
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
 * Validates request parameters.
 *
 * @param {Object} request - Request object
 */
function validateRequest(request) {
  // User code: required, max 100 characters
  let userCode = request['userCode'];
  if (!userCode || userCode.length === 0) {
    throwValidationError('userCode is required.');
  } else if (userCode.length > 100) {
    throwValidationError('userCode must be at most 100 characters.');
  }

  // User name (last name): required, max 30 characters
  let userLastName = request['userLastName'];
  if (!userLastName || userLastName.length === 0) {
    throwValidationError('userLastName is required.');
  } else if (userLastName.length > 30) {
    throwValidationError('userLastName must be at most 30 characters.');
  }

  // User name (first name): required, max 30 characters
  let userFirstName = request['userFirstName'];
  if (!userFirstName || userFirstName.length === 0) {
    throwValidationError('userFirstName is required.');
  } else if (userFirstName.length > 30) {
    throwValidationError('userFirstName must be at most 30 characters.');
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
  let result = {
    userCode: '',               // User code
    userFirstName: '',          // User first name
    userLastName: '',           // User last name
    age: ''                     // Age
  };

  // Retrieve request parameters
  let request = {
    userCode: request['userCode'],
    userFirstName: request['userFirstName'],
    userLastName: request['userLastName'],
    age: request['age']
  };

  // TODO: Use the parameter values here to perform database registration processing

  return result;
}
```

---

## Routing Configuration (simple_form.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- Presentation page -->
  <file-mapping path="/sample/simple_form" page="sample/simple_form/view/index">
    <authz uri="service://sample/simple_form" action="execute" />
  </file-mapping>

  <!-- REST-API for AJAX communication -->
  <file-mapping path="/sample/simple_form/api/register" page="sample/simple_form/api/register">
    <authz uri="service://sample/simple_form/api/register" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## Available Templates

- **Simple Form**: [assets/simple-form.md](assets/simple-form.md)
  - Screen with intra-mart Design System (imds) theme applied
  - Form with multiple text inputs
  - Registration is executed via REST-API

### Example Instructions for Generation

When the user requests "create a form screen", use this asset's code as a reference and generate an appropriately customized version.

---

## Validation Pattern Reference

Snippets for various checks used inside `getValidationErrors()`.
Use a consistent pattern of reading values directly from the DOM.

### String Length Check (Upper and Lower Bounds)

```javascript
const value = document.getElementById(':fieldName:').value;
if (value.length > 200) {
  errors.push({ name: 'fieldName', message: 'fieldName must be at most 200 characters.' });
} else if (value.length < 8) {
  errors.push({ name: 'fieldName', message: 'fieldName must be at least 8 characters.' });
}
```

### Numeric Check (NaN and Range)

```javascript
const value = document.getElementById(':age:').value;
if (value !== '') {
  const num = Number(value);
  if (isNaN(num)) {
    errors.push({ name: 'age', message: 'Age must be a number.' });
  } else if (num < 0 || num > 150) {
    errors.push({ name: 'age', message: 'Age must be between 0 and 150.' });
  }
}
```

### Regular Expression Pattern Matching

```javascript
const value = document.getElementById(':code:').value;
if (value && !/^[A-Za-z0-9_-]+$/.test(value)) {
  errors.push({ name: 'code', message: 'Code may only contain alphanumeric characters, hyphens, and underscores.' });
}
```

### Email Address Format

```javascript
const value = document.getElementById(':email:').value;
if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
  errors.push({ name: 'email', message: 'The email address format is invalid.' });
}
```

### Date Format (YYYY-MM-DD)

```javascript
const value = document.getElementById(':startDate:').value;
if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
  errors.push({ name: 'startDate', message: 'Start date must be in YYYY-MM-DD format.' });
}
```

### Optional Field (Check Only When a Value Is Present)

```javascript
const value = document.getElementById(':memo:').value;
if (value && value.length > 500) {
  errors.push({ name: 'memo', message: 'Memo must be at most 500 characters.' });
}
```

### Date Order Check (Start Before End)

```javascript
const startDate = document.getElementById(':startDate:').value;
const endDate = document.getElementById(':endDate:').value;
if (startDate && endDate && startDate > endDate) {
  errors.push({ name: 'endDate', message: 'End date must be on or after the start date.' });
}
```
