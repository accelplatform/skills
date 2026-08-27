# Workflow Application Screen Template (modal method)

## Overview

Template for the IM-Workflow application screen program (modal method).
Uses the `imWorkflow.modal.showApply()` / `imWorkflow.modal.showTemporarySave()` APIs to
perform application and temporary save through the IM-Workflow standard modal UI.

Application and temporary save are provided on the same JSSP screen (the same as `simple-apply-screen.md`).
`showApply()` and `showTemporarySave()` are assigned to separate buttons on the same form.

The application screen is a standalone JSSP screen accessed directly via URL.
To re-edit a temporarily saved matter, access it with the user data ID appended to the URL parameter `userDataId`.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── apply/
      ├── index.js              # Function container
      └── index.html            # Presentation page

src/main/conf/routing-jssp-config/
  └── {feature-name}.xml        # Routing configuration (URL mapping to the application screen)
```

**Note:** Since the application screen of the modal method is a **standalone screen** accessed directly via URL, a routing XML registration under `src/main/conf/routing-jssp-config/` is required. (This differs from the workflowOpenPage method.)

---

## Routing Configuration (routing-jssp-config/{feature-name}.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<routing-jssp-config
    xmlns="http://www.intra-mart.jp/router/routing-jssp-config"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.intra-mart.jp/router/routing-jssp-config routing-jssp-config.xsd">

  <!-- TODO: Change path and page to match the feature name -->
  <file-mapping path="/{feature-name}/workflow/apply" page="{feature-name}/workflow/apply/index">
    <authz uri="service://{feature-name}/workflow/apply" action="execute" />
  </file-mapping>

</routing-jssp-config>
```

---

## Function Container (apply/index.js)

```javascript
/**
 * Workflow Application Screen (modal method)
 *
 * @file index.js
 * @description Constructs the application screen for {feature-name}.
 *              New application / temporary save use the processing modal (imWorkflow.modal.showApply / showTemporarySave).
 *              When imwSystemMatterId is already issued (an already-applied matter, e.g. an "unapplied" state after pull-back),
 *              re-application is required, so the screen switches to showProcess (re-apply) and temporary save is not available.
 *              IM-Workflow parameters:
 *                imwFlowId (-> flowId, for a new application)
 *                imwSystemMatterId (-> systemMatterId, re-apply mode if already issued)
 *                imwNodeId (-> nodeId, the target node when re-applying)
 *                imwUserDataId (-> userDataId, the retrieval/update key when re-editing a temporarily saved matter)
 */

// ========================================
// Bind Variables (for presentation page linkage)
// ========================================
let $title = '{Screen Title}';        // TODO: Set the screen title
let $subTitle = '{Subtitle}';         // TODO: Set the subtitle
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
  let response = main(request);
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
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  let result = {
    imwParameter: {
      // Re-apply mode when systemMatterId is already issued
      isReapply:      !isBlank(request['imwSystemMatterId']),
      // Information for the not-yet-applied state (when isReapply = false)
      flowId:         request['imwFlowId']         || '',
      userDataId:     request['imwUserDataId']     || '',
      applyBaseDate:  request['imwApplyBaseDate']  || '',
      // Information for the already-applied state (when isReapply = true)
      systemMatterId: request['imwSystemMatterId'] || '',
      nodeId:         request['imwNodeId']         || ''
    },
    formParameter: {
      // TODO: Define the form's initial value fields here
      // field1: '', field2: '', field3: ''
    }
  };

  if (result.imwParameter.userDataId) {
    getMatterProperties(result.formParameter, result.imwParameter.userDataId);
  }

  return result;
}

/**
 * Retrieves data from matter properties.
 * Used to reflect temporarily saved data as the initial values of the screen.
 *
 * @param {Object} processResult - Processing result object (each field is overwritten)
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
  <!-- Secure token (use the http-equiv form in the modal method) -->
  <meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
  <!-- Processing modal API (defer required) -->
  <script src="im_workflow/js/api_base.js" defer></script>
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
      // Flag to always run the validation check
      let activeValidation = false;

      // Whether this is re-apply mode
      const isReapply = $data.result.imwParameter.isReapply;

      // Initial screen display
      function initializeView(result) {
        // TODO: Change to match the fields
        // Example: document.getElementById(':field1:').value = result.formParameter.field1;

        // In re-apply mode, temporary save is not allowed, so hide the temporary-save button
        // and change the apply button label to "Re-apply".
        if (isReapply) {
          document.getElementById('temp-save-button').style.display = 'none';
          document.getElementById('apply-button').textContent = 'Re-apply';
        }
      }

      // Clear the form
      function clearForm() {
        // TODO: Change to match the fields
        // Example: document.getElementById(':field1:').value = '';
      }

      // Initialize validation error display
      function clearValidationError() {
        document.querySelectorAll('.imds-field.imds-validation-error').forEach((element) => {
          element.classList.remove('imds-validation-error');
        });
        document.querySelectorAll('.imds-error-text').forEach((element) => {
          element.style.display = 'none';
        });
      }

      // Display validation errors
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

      // Get validation errors
      // TODO: Customize the validation rules according to the field specifications
      function getValidationErrors() {
        const errors = [];

        // TODO: Example of required field validation
        // const fieldValue = document.getElementById(':field1:').value;
        // if (!fieldValue || fieldValue.length === 0) {
        //   errors.push({ name: 'field1', message: 'field1 is required.' });
        // }

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

      // Run validation
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
      // TODO: Register listeners on all fields subject to validation
      // Use the "input" event for text input fields (input, textarea)
      // [':field1:', ':field2:'].forEach((id) => {
      //   document.getElementById(id).addEventListener('input', () => {
      //     if (activeValidation) { resetValidationError(); }
      //   });
      // });
      // Use the "change" event for select boxes, numeric inputs, etc.
      // [':field3:'].forEach((id) => {
      //   document.getElementById(id).addEventListener('change', () => {
      //     if (activeValidation) { resetValidationError(); }
      //   });
      // });

      // Build the matter name
      // TODO: Customize according to the matter name rule of the flow definition
      function buildMatterName() {
        // TODO: Change to the actual matter name generation logic
        return '{Matter Name Prefix}_' + document.getElementById(':field1:').value;
      }

      // Build userParameter from the current form values
      // TODO: Change to match the fields. The key names must match the userParam of the action process.
      function buildUserParameter() {
        return {
          // field1: document.getElementById(':field1:').value,
          // field2: document.getElementById(':field2:').value
        };
      }

      // "Back" button click event
      document.getElementById('back-button').addEventListener('click', () => {
        imWorkflow.transition.returnTo();
      });

      // "Apply" / "Re-apply" button click event (async required)
      document.getElementById('apply-button').addEventListener('click', async () => {
        if (!validateCurrentStep()) {
          return;
        }

        let result;
        if (isReapply) {
          // Re-apply: since systemMatterId is already issued, use showProcess (re-apply).
          // The process type is auto-decided per the flow definition (re-apply etc. are offered in the unapplied state).
          result = await imWorkflow.modal.showProcess({
            processParameter: {
              systemMatterId: $data.result.imwParameter.systemMatterId,
              nodeId:         $data.result.imwParameter.nodeId,
              matterName:     buildMatterName()
            },
            optionalParameter: {
              userParameter: buildUserParameter()
            },
            rebootModal: false
          });
        } else {
          // New application: use showApply (systemMatterId is not yet issued).
          // userDataId is used to convert a temporarily-saved draft into a real application (empty for a brand-new application).
          result = await imWorkflow.modal.showApply({
            processParameter: {
              flowId:        $data.result.imwParameter.flowId,
              userDataId:    $data.result.imwParameter.userDataId,
              applyBaseDate: $data.result.imwParameter.applyBaseDate,
              matterName:    buildMatterName()
            },
            optionalParameter: {
              userParameter: buildUserParameter()
            }
          });
        }

        // Processing after application / re-application completion
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage(isReapply ? 'The re-application has been completed.' : 'The application has been completed.');
          imWorkflow.transition.afterProcess();
        }
      });

      // "Temporary Save" button click event (async required)
      document.getElementById('temp-save-button').addEventListener('click', async () => {
        if (!validateCurrentStep()) {
          return;
        }

        // Open the temporary save modal
        // If userDataId exists, update the existing temporary save; otherwise create a new one
        const result = await imWorkflow.modal.showTemporarySave({
          processParameter: {
            flowId:        $data.result.imwParameter.flowId,             // Used when newly saving temporarily
            userDataId:    $data.result.imwParameter.userDataId || '',   // Used when updating (new if empty string)
            applyBaseDate: $data.result.imwParameter.applyBaseDate,
            matterName:    buildMatterName()
          },
          optionalParameter: {
            userParameter: buildUserParameter()
          },
          rebootModal: false
        });

        // Processing after temporary save completion
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage('The temporary save has been completed.');
          imWorkflow.transition.afterProcess();
        }
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

<!-- Page overall container -->
<div id="container">
  <div class="imds-container">
    <header class="imds-header">
      <div class="imds-header-back-button">
        <button type="button" id="back-button" class="imds-button is-ghost is-large" aria-label="Back">
          <span class="imds-icon is-small"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i></span>
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
        <!-- TODO: Implement sections and fields here -->
        <!-- The following is a sample structure (example field implementation) -->
        <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
          <h2 class="imds-heading is-bordered is-size-2 is-cyan">{Section Title}</h2>
          <div class="imds-field-container has-accent-color">
            <!-- Required field example -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span class="imds-required-label-required" data-required-label="Required">{Field Label}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field" for=":field1:">
                  <div class="imds-field-control">
                    <input type="text" id=":field1:" class="imds-textbox" value="" />
                  </div>
                  <span class="imds-error-text" for=":field1:" style="display:none;"></span>
                </div>
              </div>
            </div>
            <!-- Optional field example -->
            <div class="imds-field-group is-horizontal imds-w-15">
              <div class="imds-field-group-label">
                <span>{Field Label}</span>
              </div>
              <div class="imds-field-group-control">
                <div class="imds-field">
                  <div class="imds-field-control">
                    <input type="text" id=":field2:" class="imds-textbox" value="" />
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
```

---

## Notes on Generation

- **Branch new application vs. re-application by `imwSystemMatterId` (required)**
  - **`imwSystemMatterId` being already issued means an already-applied matter** (e.g. an "unapplied" state after pull-back). In this state "re-application", not "application", is required, and re-application is done with **`showProcess()`, not `showApply()`** (calling `showApply()` causes a userDataId / matter duplication error).
  - When already issued (`isReapply`): switch the apply button handler to `showProcess({ processParameter: { systemMatterId, nodeId }, ... })`, **hide the temporary-save button** (temporary save is not allowed when re-applying), and change the button label to "Re-apply".
  - When not yet issued: use `showApply()` (new application) / `showTemporarySave()` (temporary save) as before.
  - Branch on **`systemMatterId`, not `userDataId`**. A temporarily-saved draft has a `userDataId` but no `systemMatterId`, so it is correctly treated as the new-application mode (converted to a formal application via `showApply`).
  - To enable re-apply mode, have the function container receive `imwSystemMatterId` / `imwNodeId` and store them in `imwParameter`.
- **Place application and temporary save on the same screen (new-application mode)**
  - As with `simple-apply-screen.md` (workflowOpenPage method), place the apply and temporary save buttons on the same form
  - Correspondence: Apply button -> `showApply()`, Temporary Save button -> `showTemporarySave()`
- **Re-editing a temporarily saved matter (new-application mode)**
  - When the URL parameter `userDataId` is received, display the form initially with `getMatterProperties()`
  - Pressing the temporary save button after re-editing updates the existing temporary save using `userDataId`
  - Pressing the apply button after re-editing converts it to a formal application via `showApply()` (passing `userDataId`)
- **Set the correct flow ID in `flowId`**
  - Use the flow ID specified in the IM-Workflow flow definition XML (the value of `<flow id="...">`)
  - Specifying the wrong flow ID will prevent the modal from launching properly
- **Match the key names of `userParameter` with the `userParam` of the action process**
  - Match exactly the key names that the action process (`action_process.js`) reads as `userParam.fieldName`
  - Consolidating into the `buildUserParameter()` function lets both the apply and temporary save buttons pass the same data
- **For both `showApply()` and `showTemporarySave()`, call `imWorkflow.transition.afterProcess()` only when `isProcessDone` is true**
  - `showApply()`: Call only when the application is completed (transition to the application list after completion)
  - `showTemporarySave()`: Call only when the temporary save is completed (on failure or cancel, stay on the screen so the user can make corrections)
- **Be careful with the format of the secure token tag**
  - Use `<meta http-equiv="X-Intramart-Secure-Token">` instead of `<meta name="im_secure_token">`
- **Do not omit the `defer` attribute of `api_base.js`**
- **Place a "Back" button in the header**
  - Place a button with the `imds-header-back-button` div + `back-button` id before `imds-header-icon`
  - On click, call `imWorkflow.transition.returnTo()`
- **Make the event listeners of the apply and temporary save buttons `async` functions**
- **Do not forget to create the routing XML**
  - If the URL to the application screen is not registered in `routing-jssp-config`, it will be inaccessible
