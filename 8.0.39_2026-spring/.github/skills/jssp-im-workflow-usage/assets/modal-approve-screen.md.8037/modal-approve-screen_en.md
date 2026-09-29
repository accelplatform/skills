# Workflow Process Screen Template (modal method)

## Overview

Template for the IM-Workflow process screen program (modal method).
Uses the `imWorkflow.modal.showProcess()` API to perform processing such as approval, rejection, and send-back through the IM-Workflow standard modal UI.

The process screen is a screen that performs IM-Workflow processing via the content definition (or direct URL access).
The processing modal is launched using `imwSystemMatterId` and `imwNodeId` passed by the IM-Workflow engine.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── approve/
      ├── index.js              # Function container
      └── index.html            # Presentation page

src/main/conf/routing-jssp-config/
  └── {feature-name}.xml        # Routing configuration (URL mapping to the process screen)
```

**Note:** Since the process screen of the modal method is a **standalone screen** accessed directly via URL, a routing XML registration under `src/main/conf/routing-jssp-config/` is required.

---

## Routing Configuration (routing-jssp-config/{feature-name}.xml)

When adding to an existing `{feature-name}.xml`, append only the `<file-mapping>` element.

```xml
<!-- TODO: Change path and page to match the feature name -->
<file-mapping path="/{feature-name}/workflow/approve" page="{feature-name}/workflow/approve/index">
  <authz uri="service://{feature-name}/workflow/approve" action="execute" />
</file-mapping>
```

---

## Function Container (approve/index.js)

```javascript
/**
 * Workflow Process Screen (modal method)
 *
 * @file index.js
 * @description Constructs the process screen (approval/rejection/send-back) for {feature-name}.
 *              Processes using the processing modal (imWorkflow.modal.showProcess).
 *              IM-Workflow parameters: imwSystemMatterId (system matter ID), imwNodeId (node ID)
 */

// ========================================
// Bind Variables (for presentation page linkage)
// ========================================
let $title = '{Screen Title} (Process)';    // TODO: Set the screen title
let $subTitle = '{Subtitle}';                // TODO: Set the subtitle
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
    logger.error('An error occurred while displaying the process screen. {}', e.message);
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
      systemMatterId: request['imwSystemMatterId'] || '',
      nodeId:         request['imwNodeId']         || ''
    },
    formParameter: {
      // TODO: Define the application content fields here
    }
  };

  if (!result.imwParameter.systemMatterId || !result.imwParameter.nodeId) {
    throw new Error('imwSystemMatterId or imwNodeId is not specified.');
  }

  // The process screen targets an active (incomplete) matter and does not receive imwUserDataId,
  // so retrieve by system matter ID.
  getMatterProperties(result.formParameter, result.imwParameter.systemMatterId);

  return result;
}

// ========================================
// Matter Property Retrieval
// ========================================
/**
 * Retrieves the application content from matter properties and applies it to processResult.
 * The process screen targets an active (incomplete) matter and does not receive userDataId,
 * so it retrieves properties by system matter ID via ActvMatter.
 * (Do not use UserActvMatterPropertyValue, which is keyed by userDataId.)
 *
 * @param {Object} processResult - Target object (formParameter)
 * @param {String} systemMatterId - System matter ID
 */
function getMatterProperties(processResult, systemMatterId) {
  let actvMatter = new ActvMatter(systemMatterId);
  let result = actvMatter.getMatterPropertyList();
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

## Presentation Page (approve/index.html)

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

      // Initial screen display (display the application content in read-only mode)
      function initializeView(result) {
        // TODO: Display the application content fields
        // Example: document.getElementById(':field1:').textContent = result.field1;
      }

      // "Back" button click event
      document.getElementById('back-button').addEventListener('click', () => {
        imWorkflow.transition.returnTo();
      });

      // "Process" button click event (async required)
      document.getElementById('process-button').addEventListener('click', async () => {

        // TODO: Set userParameter as needed (data passed to the action process)
        const userParameter = {
          // TODO: Change to match the fields
          // field1: document.getElementById(':field1:').textContent,
        };

        // Open the processing modal
        const result = await imWorkflow.modal.showProcess({
          processParameter: {
            systemMatterId: $data.result.imwParameter.systemMatterId,
            nodeId:         $data.result.imwParameter.nodeId
            // processType: [],           // TODO: Specify the process types to use as an array (all types are selectable if unspecified)
            // processComment: '',        // TODO: Specify if setting an initial value for the process comment
          },
          optionalParameter: {
            userParameter: userParameter
          },
          rebootModal: false
        });

        // Processing after completion
        if (result && result.isProcessDone) {
          imuiShowSuccessMessage('The processing has been completed.');
          imWorkflow.transition.afterProcess();
        }
      });

      // Entry point
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result.formParameter);
      }
    });
    })(<imart type="string" value=$data escapeXml="false" escapeJs="false" />);
  </script>
</imart>

<!-- Page overall container (the theme already wraps the page in imui-container, so no id is added here) -->
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
      <!-- TODO: Implement a section here that displays the application content in read-only mode -->
      <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
        <h2 class="imds-heading is-bordered is-size-2 is-cyan">{Section Title}</h2>
        <div class="imds-field-container has-accent-color">
          <!-- Read-only field example (displays the value entered by the applicant) -->
          <div class="imds-field-group is-horizontal imds-w-15">
            <div class="imds-field-group-label">
              <span>{Field Label}</span>
            </div>
            <div class="imds-field-group-control">
              <div class="imds-field">
                <div class="imds-field-control">
                  <!-- Displayed with span because it is read-only (the id is referenced from initializeView) -->
                  <span id=":field1:" class="imds-text"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    <!-- Process button (approval/rejection/send-back, etc. are selected within the modal) -->
    <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
      <button type="button" id="process-button" class="imds-button is-primary" style="min-width: 8em;">Process</button>
    </div>
  </main>
</div>
```

---

## Notes on Generation

- **`imwSystemMatterId` and `imwNodeId` are parameters passed by the IM-Workflow engine**
  - When this process screen is opened via the `scriptPath` of the content definition, the IM-Workflow engine passes them automatically
  - Perform required validation inside `processBusinessLogic()` and transition to the error page if unspecified
- **Separate `imwParameter` and `formParameter`**
  - `imwParameter`: Parameters passed to the IM-Workflow engine (`systemMatterId`, `nodeId`)
  - `formParameter`: The application content displayed on the process screen (read-only data retrieved from matter properties)
  - Separating them prevents business fields from being mistakenly mixed into `processParameter`
- **After `showProcess()` completes, call `imWorkflow.transition.afterProcess()` only when `isProcessDone` is true**
  - Transition only when the processing is completed (also display a completion message)
  - On cancel (`isProcessDone` is false), stay on the screen so the processor can reopen the modal
- **Specifying the `processType` parameter**
  - If unspecified (empty array or omitted), the process types that the user can select within the modal are determined automatically
  - To allow only specific process types, specify the `processType` array
- **Place a "Back" button in the header**
  - Place a button with the `imds-header-back-button` div + `back-button` id before `imds-header-icon`
  - On click, call `imWorkflow.transition.returnTo()` (the API that returns to the caller's application list, matter list, etc.)
- **Display the application content in read-only mode**
  - On the process screen, the processor only needs to review the content entered by the applicant; editing is not required
  - The process screen targets an active (incomplete) matter and does not receive `imwUserDataId`, so retrieve matter properties with **`ActvMatter(systemMatterId).getMatterPropertyList()` (no arguments)**. Do not use `UserActvMatterPropertyValue`, which is keyed by `userDataId` (the retrieval source differs from the apply screen's temporary-save re-edit)
  - For the matter property value API, see `reference/api-user-actv-matter-property-value.md` (the `ActvMatter` description is also at the top of that file)
- **The secure token and `api_base.js` are the same as the application screen**
  - Use the `<meta http-equiv="X-Intramart-Secure-Token">` form
  - The `defer` attribute is required
