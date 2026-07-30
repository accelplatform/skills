# Workflow Application Screen Template (workflowOpenPage method / legacy)

## Overview

Template for IM-Workflow application screen programs.
This is a sample screen for entering part code, part name, unit price, total amount, and reason to submit an application.
On initial display, the function container receives workflow parameters and passes them to the presentation page.
Processing is delegated to the workflow engine via the `workflowOpenPage` function using the Apply and Temporary Save buttons.

The input items in the form are passed as `userParameter` to the action process.

> **Choosing between this and the modal method (new)**: For the new method using `imWorkflow.modal.showApply()` / `showTemporarySave()`, see `modal-apply-screen.md`. The new method is recommended for new development. Use this template when an application screen based on the workflowOpenPage method (legacy) is required.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  ├── apply/
  │   ├── index.js              # Function container
  │   └── index.html            # Presentation page
  └── action/
      └── action_process.js     # Action process (separate template)
```

**Note:** IM-Workflow screens specify the JSSP path directly in the content definition, so a routing table is not required.

---

## Function Container (apply/index.js)

```javascript
/**
 * Workflow Application Screen
 *
 * @file index.js
 * @description Constructs the parts ordering application screen.
 *              Receives workflow parameters and passes them to the presentation page.
 */

// ========================================
// Bind Variables (for presentation page linkage)
// ========================================

// Screen title
let $title = 'Parts Order Application';
let $subTitle = 'Parts Management Workflow';

// Screen data
let $data = '{}';

// Workflow parameters
let $imwSystemMatterId = '';
let $imwUserDataId = '';
let $imwApplyBaseDate = '';
let $imwFlowId = '';
let $imwAuthUserCode = '';
let $imwNodeId = '';
let $imwCallOriginalParams = '';
let $imwNextPagePath = '';
let $imwNextScriptPath = '';
let $imwNextApplicationId = '';
let $imwNextServiceId = '';

// ========================================
// Entry Point
// ========================================
/**
 * Entry point for screen display.
 * Executed first when the screen is called from the workflow engine.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  // Get workflow parameters
  $imwSystemMatterId     = request['imwSystemMatterId']       || '';
  // User data ID, which is the key for temporary save. For new applications (not in request), the application side issues it.
  // IM-Workflow specification: The user data ID is the key for temporary save information, so the user content side must always issue it.
  // (The workflowOpenPage method has no automatic numbering like showTemporarySave in the process modal method.)
  $imwUserDataId         = request['imwUserDataId']           || Identifier.get();
  $imwApplyBaseDate      = request['imwApplyBaseDate']        || '';
  $imwFlowId             = request['imwFlowId']               || '';
  $imwAuthUserCode       = request['imwAuthUserCode']         || '';
  $imwNodeId             = request['imwNodeId']               || '';
  $imwCallOriginalParams = request['imwCallOriginalParams']   || '';
  $imwNextPagePath       = request['imwCallOriginalPagePath'] || '';
  $imwNextScriptPath     = request['imwNextScriptPath']       || '';
  $imwNextApplicationId  = request['imwNextApplicationId']    || '';
  $imwNextServiceId      = request['imwNextServiceId']        || '';

  // Execute main processing
  let response = main(request);

  // Store in $data as JSON format
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
      code: '',
      message: ''
    }
  };

  try {
    response.result = processBusinessLogic(request);
  } catch (e) {
    logger.error('An error occurred while displaying the application screen. {}', e.message);
    transferErrorPage('E001', 'An unexpected error occurred.');
    return response;
  }

  return response;
}

// ========================================
// Business Logic
// ========================================
/**
 * Executes the main business logic.
 * Retrieves saved data when returning from temporary save.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // When returning from temporary save, retrieve saved data using userDataId as key
  let userDataId = request['imwUserDataId'];
  if (userDataId) {
    getMatterProperties(result, userDataId);
  }

  return result;
}

/**
 * Retrieves data from matter properties.
 *
 * @param {Object} processResult - Processing result
 * @param {String} userDataId - User data ID
 */
function getMatterProperties(processResult, userDataId) {
  let manager = new UserActvMatterPropertyValue();
  let result = manager.getMatterPropertyList(userDataId);
  if (!result.resultFlag) {
    throw new Error('Failed to retrieve matter properties.');
  }

  for (let i = 0; i < result.data.length; i++) {
    let matterProperty = result.data[i];
    if (matterProperty.matterPropertyKey in processResult) {
      processResult[matterProperty.matterPropertyKey] = matterProperty.matterPropertyValue || '';
    }
  }
}

// ========================================
// IM-Common Master Helper
// ========================================
/**
 * Gets the user name.
 * With null check of locales + locale fallback.
 *
 * @param {String} userCd - User code
 * @return {String} User name
 */
function getUserName(userCd) {
  let accountContext = Contexts.getAccountContext();
  let locale = accountContext.locale;
  let tenantLocale = new TenantInfoManager().getTenantInfo().data.locale;
  let manager = new IMMUserManager();
  let result = manager.getUser({ userCd: userCd }, new Date(), locale);

  if (!result.data || !result.data.locales) {
    return '';
  }
  let locales = result.data.locales;
  let localeInfo = locales[locale] || locales[tenantLocale] || locales[Object.keys(locales)[0]];
  return (localeInfo && localeInfo.userName) ? localeInfo.userName : '';
}

/**
 * Gets the affiliated department name.
 * With null check of locales + locale fallback.
 *
 * @param {String} userCd - User code
 * @return {String} Department name
 */
function getDepartmentName(userCd) {
  // For the logged-in user themselves, prioritize the current organization
  let accountContext = Contexts.getAccountContext();
  if (userCd === accountContext.userCd) {
    let userContext = Contexts.getUserContext();
    if (userContext && userContext.currentDepartment) {
      return userContext.currentDepartment.departmentName || '';
    }
  }

  // When the current organization cannot be retrieved, or for other users, get via IM-Common Master API
  let locale = accountContext.locale;
  let manager = new IMMCompanyManager();
  let condition = new AppCmnSearchCondition();
  // Return value is DepartmentListNodeInfo[] (flat structure directly holding displayName)
  let result = manager.listDepartmentWithUser({ userCd: userCd }, condition, false, new Date(), locale);

  if (!result.data || result.data.length === 0) {
    return '';
  }
  return result.data[0].displayName || '';
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
    message: [code, message].join('\n')
  };
  Transfer.toErrorPage(param);
}
```

---

## Presentation Page (apply/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
  <!-- CSJS for workflow screen transition -->
  <imart type="workflowOpenPageCsjs" />
  <!-- Presentation page custom styles -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- Presentation page scripts -->
  <script>
    (function($data) {

    document.addEventListener('DOMContentLoaded', () => {
      // Flag for always-on validation check
      let activeValidation = false;

      // Initial screen display
      function initializeView(result) {
        document.getElementById(':partCode:').value = result.partCode;
        document.getElementById(':partName:').value = result.partName;
        document.getElementById(':unitPrice:').value = result.unitPrice;
        document.getElementById(':quantity:').value = result.quantity;
        document.getElementById(':totalAmount:').value = result.totalAmount;
        document.getElementById(':reason:').value = result.reason;
      }

      // Initialize validation error display
      function clearValidationError() {
        document.querySelectorAll('.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });
        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // Show validation error
      function showValidationError(errors) {
        errors.forEach((error) => {
          const errorElement = document.querySelector(`.imds-error-text[for=":${error.name}:"]`);
          if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = '';
            const fieldElement = errorElement.closest('.imds-field');
            if (fieldElement) {
              fieldElement.classList.add('imds-validation-error');
            }
          }
        });
        activeValidation = true;
      }

      // Create request parameters
      function createRequest() {
        return {
          partCode:    document.getElementById(':partCode:').value,
          partName:    document.getElementById(':partName:').value,
          unitPrice:   document.getElementById(':unitPrice:').value,
          quantity:     document.getElementById(':quantity:').value,
          totalAmount: document.getElementById(':totalAmount:').value,
          reason:      document.getElementById(':reason:').value
        };
      }

      // Get validation errors
      // TODO: Customize validation rules according to field specifications
      function getValidationErrors() {
        const request = createRequest();
        const errors = [];

        // Part code: required
        const partCode = request['partCode'];
        if (!partCode || partCode.length === 0) {
          errors.push({ name: 'partCode', message: 'Part code is required.' });
        }

        // TODO: Add validation rules for other fields

        return errors;
      }

      // Real-time re-validation
      function resetValidationError() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
        }
      }

      // Execute validation
      function validateCurrentStep() {
        clearValidationError();
        const errors = getValidationErrors();
        if (errors.length > 0) {
          showValidationError(errors);
          return false;
        }
        return true;
      }

      // Event listeners for real-time re-validation
      // TODO: Register listeners for all validation target fields
      // Use "input" event for text input fields (input, textarea)
      [':partCode:', ':partName:', ':reason:'].forEach((id) => {
        document.getElementById(id).addEventListener('input', () => {
          if (activeValidation) {
            resetValidationError();
          }
        });
      });
      // Use "change" event for select boxes, date inputs, number inputs, etc.
      [':unitPrice:', ':quantity:', ':totalAmount:'].forEach((id) => {
        document.getElementById(id).addEventListener('change', () => {
          if (activeValidation) {
            resetValidationError();
          }
        });
      });

      // "Back" button click event
      document.getElementById('imw-back-button').addEventListener('click', () => {
        document.getElementById('imw-back-form').submit();
      });

      // Build matter name
      // TODO: Customize to match the matter name rule of the flow definition
      function buildMatterName() {
        return 'PartsOrderApplication_' + document.getElementById(':partCode:').value;
      }

      // Copy business data to the hidden fields for submission
      // In the legacy method (workflowOpenPage), the display input fields have no name;
      // values are copied to name-bearing hidden fields just before submission (the hidden values are passed as userParam to the action process).
      // * If a name is set directly on a display input, when it collides with a name on a hidden / select / radio field,
      //   userParam becomes an array (NativeArray) and causes an error in the action process, so always go through the hidden fields.
      function setUserDataToHidden() {
        document.getElementById('hidden-partCode').value    = document.getElementById(':partCode:').value;
        document.getElementById('hidden-partName').value    = document.getElementById(':partName:').value;
        document.getElementById('hidden-unitPrice').value   = document.getElementById(':unitPrice:').value;
        document.getElementById('hidden-quantity').value    = document.getElementById(':quantity:').value;
        document.getElementById('hidden-totalAmount').value = document.getElementById(':totalAmount:').value;
        document.getElementById('hidden-reason').value      = document.getElementById(':reason:').value;
      }

      // "Apply" button click event
      document.getElementById('apply-button').addEventListener('click', () => {
        if (!validateCurrentStep()) {
          return;
        }
        // Set matter name
        document.getElementById('imwMatterName').value = buildMatterName();
        // Copy business data to the hidden fields for submission
        setUserDataToHidden();

        // If imwSystemMatterId exists, re-application (after pull-back)
        // If not present, new application
        let systemMatterId = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
        if (systemMatterId) {
          workflowOpenPage('3');  // Re-application
        } else {
          workflowOpenPage('0');  // New application
        }
      });

      // "Temporary Save" button click event
      document.getElementById('temp-save-button').addEventListener('click', () => {
        document.getElementById('imwMatterName').value = buildMatterName();
        // Copy business data to the hidden fields for submission
        setUserDataToHidden();
        workflowOpenPage('1');
      });

      // Entry point
      clearValidationError();
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
        // Change button label in re-application mode
        let systemMatterId = '<imart type="string" value=$imwSystemMatterId escapeXml="false" escapeJs="true"></imart>';
        if (systemMatterId) {
          document.getElementById('apply-button').textContent = 'Re-apply';
        }
      }
    });
    })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Form for workflow screen call -->
<imart type="workflowOpenPage"
    name="workflowOpenPageForm"
    method="POST"
    target="_top"
    imwAuthUserCode=$imwAuthUserCode
    imwSystemMatterId=$imwSystemMatterId
    imwUserDataId=$imwUserDataId
    imwNodeId=$imwNodeId
    imwApplyBaseDate=$imwApplyBaseDate
    imwFlowId=$imwFlowId
    imwCallOriginalParams=$imwCallOriginalParams
    imwNextPagePath=$imwNextPagePath
    imwNextScriptPath=$imwNextScriptPath
    imwNextApplicationId=$imwNextApplicationId
    imwNextServiceId=$imwNextServiceId>

  <!-- Matter name (set by JavaScript when apply button is pressed) -->
  <input type="hidden" id="imwMatterName" name="imwMatterName" value="" />

  <!-- Hidden fields for submitting business data. Display input fields have no name;
       values are copied just before submission via setUserDataToHidden() (the name-bearing fields are passed as userParam). -->
  <input type="hidden" id="hidden-partCode" name="partCode" value="" />
  <input type="hidden" id="hidden-partName" name="partName" value="" />
  <input type="hidden" id="hidden-unitPrice" name="unitPrice" value="" />
  <input type="hidden" id="hidden-quantity" name="quantity" value="" />
  <input type="hidden" id="hidden-totalAmount" name="totalAmount" value="" />
  <input type="hidden" id="hidden-reason" name="reason" value="" />

  <!-- Page overall container -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">
        <div class="imds-header-back-button">
          <button type="button" id="imw-back-button" class="imds-button is-ghost is-large">
            <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left"></i></span>
          </button>
        </div>
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
      <main>
        <div class="imds-form has-background-color-gray sample-layout-content imds-scrollbar imds-py-4 imds-px-6">
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">Order Information</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span class="imds-required-label-required" data-required-label="Required">Part Code</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field" for=":partCode:">
                    <div class="imds-field-control">
                      <input type="text" id=":partCode:" class="imds-textbox" value="" />
                    </div>
                    <span class="imds-error-text" for=":partCode:" style="display:none;"></span>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>Part Name</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="text" id=":partName:" class="imds-textbox" value="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>Unit Price</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="number" id=":unitPrice:" class="imds-textbox" value="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>Quantity</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="number" id=":quantity:" class="imds-textbox" value="" />
                    </div>
                  </div>
                </div>
              </div>
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>Total Amount</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <input type="number" id=":totalAmount:" class="imds-textbox" value="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">Application Reason</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>Reason</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <textarea id=":reason:" class="imds-textarea" rows="4"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
          <button type="button" id="apply-button" class="imds-button is-primary" style="min-width: 8em;">Apply</button>
          <button type="button" id="temp-save-button" class="imds-button is-outlined is-primary" style="min-width: 8em;">Temporary Save</button>
        </div>
      </main>
    </div>
  </div>
</imart>

<!-- Form for workflow page transition -->
<imart type="tag" tagname="form" id="imw-back-form" method="POST" action=$imwNextPagePath escapeXml="true" escapeJs="false" >
  <imart type="hidden" imwCallOriginalParams=$imwCallOriginalParams escapeXml="true" escapeJs="false" />
</imart>
```

---

## Available Templates

- **Application Screen**: [assets/simple-apply.md](assets/simple-apply.md)
  - IM-Workflow application screen (using workflowOpenPage tag)
  - Workflow parameter passing pattern
  - Input items in the form are passed to `userParameter` of the action process
  - Apply button: `workflowOpenPage('0')`, Temporary Save button: `workflowOpenPage('1')`

### Generation Instruction Examples

When a user requests "Create a workflow application screen", use the code in these assets as a reference and generate appropriately customized code.

### Notes for Generation

- **When using temporary save (`workflowOpenPage('1')`), issue the userDataId on the application side**.
  - Per the IM-Workflow specification, the user data ID is the key for temporary save information, and **the user content side must always issue it** ([Temporary save specification](https://document.intra-mart.jp/library/iap/public/im_workflow/im_workflow_specification/texts/detail_guide/projects/temporary_save/index.html)).
  - The process modal method (`showTemporarySave`) issues it automatically internally, but **the workflowOpenPage method has no automatic numbering**, so issue it in `init` like `request['imwUserDataId'] || Identifier.get()`.
  - Without issuing it, the key stays empty when newly saving temporarily, and the entered content is not restored even when the application screen is redisplayed.
- **Do not add an `id` attribute to the `<imart type="workflowOpenPage">` tag**.
  - The `workflowOpenPage` tag does not support the `id` attribute, so the `id` is not assigned to the generated `<form>` element. `document.getElementById('workflowOpenPageForm')` returns `null`
  - When referencing form elements from JS, use the `name` attribute and access via `document.forms['workflowOpenPageForm']`
- **Do not add `name` attributes to input fields inside the `workflowOpenPage` form**.
  - If the same `name` exists for both `<input type="hidden" name="vendorId">` and `<select name="vendorId">` in the form, `userParam.vendorId` becomes an array (NativeArray) when the form is submitted, causing a `Cannot convert NativeArray` error in the action process.
  - Remove `name` from input fields (`select`, `input[type=text]`, `input[type=number]`, `textarea`), and copy values to hidden fields via JS when the apply button is pressed.
  - **Radio buttons** need `name` for grouping, but use a different name from the hidden field (e.g., input `name="urgencyTypeInput"` / hidden `name="urgencyType"`)
- **The `<imart>` tag does not have a `filter` attribute**.
  - To display individual values in JSON (user names, department names, etc.) in HTML, place `<span id="..."></span>` and set them with `element.textContent = result.xxx` in JavaScript's `initializeView`.
  - Notation like `<imart type="string" value=$data filter="json:result.xxx" />` does not work
- **For buttons combining icons and text**, always enclose the text in `<span class="imds-button-text">`. Placing direct text nodes causes layout issues (see imds-html-icon-button.md)
- **Icon-only buttons** (no text, e.g., delete trash icon) should use normal size. Using `is-small` / `is-x-small` makes the icon too small to operate
- Required input field labels must always have required marks (`imds-required-label-required` class + `data-required-label="Required"`)
- Use `imuiCalendar` (always specify `floatable="true"`) instead of `<input type="date">` for date input. Do not use inline display (without `floatable`)
- **Implement validation according to the conventions in `.github/instructions/jssp-presentation-page.instructions.md`** (key rules below):
  - Do not use `maxlength` attribute. Character count limits are communicated via validation error messages
  - Validation-related functions should be defined in this order: `clearValidationError` → `showValidationError` → `createRequest` → `getValidationErrors` → `resetValidationError` → `validateCurrentStep`
  - `showValidationError` gets the parent with `errorElement.closest('.imds-field')` and sets `activeValidation = true` at the end
  - After the first validation error, perform real-time re-validation when input values change (`activeValidation` flag + `input`/`change` event listeners)
  - Call `clearValidationError()` at the entry point
  - Add `for=":fieldName:"` attribute to `imds-field` tags for required fields, and place `<span class="imds-error-text" for=":fieldName:" style="display:none;"></span>` directly below
  - Register button events with `addEventListener`, not `onclick` attribute
- **Note on combining imuiCalendar (altField) with real-time re-validation**: imuiCalendar's `altField` sets the DOM property directly via jQuery's `.val()`, so the native `change` event does not fire. Override the `value` property setter with `Object.defineProperty` and dispatch a `change` event:
  ```javascript
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  Object.defineProperty(el, 'value', {
    get: function () { return descriptor.get.call(this); },
    set: function (val) {
      descriptor.set.call(this, val);
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  ```
- **Note on combining IM-Common Master search (imACMSearch) callbacks with real-time re-validation**:
  Since `imACMSearch` callback functions are defined in the global scope, they cannot directly access `activeValidation` or `resetValidationError` inside `DOMContentLoaded`. Expose the re-validation function as `window._resetValidationError` and call it from the callback:
  ```javascript
  // Inside DOMContentLoaded
  window._resetValidationError = () => {
    if (activeValidation) { resetValidationError(); }
  };
  // Inside global callback
  function callbackXxxSearch(result) {
    // ... value setting processing ...
    if (window._resetValidationError) { window._resetValidationError(); }
  }
  ```
