# Workflow Confirmation Screen Template (workflowOpenPage approach / legacy)

## Overview

Template for IM-Workflow confirmation (pageType=5) screen programs.
This is a sample screen that displays the part code, part name, unit price, total amount, and reason entered on the application screen in read-only mode, allowing the confirmer to perform the confirmation operation.

It uses the same `workflowOpenPage` approach as `simple-approve-screen.md` (the approval screen), with the processing button call replaced by `workflowOpenPage('5')` (confirmation).
The selection of confirm/return and comment input are completed within the IM-Workflow engine's standard dialog after the `workflowOpenPage('5')` call.

> **When to use vs. the modal approach (new style)**: For the new style using `imWorkflow.modal.showConfirm()`, refer to `modal-confirm-screen.md`. The new style is recommended for new development. Use this template when a confirmation screen using the workflowOpenPage approach (legacy) is required.

## Restoring the Application Content (Important)

The confirmation screen and processing screen receive **only the `imwSystemMatterId` (system matter ID)** from the IM-Workflow engine.
**`imwUserDataId` is not passed** (in the "Required Attributes by Screen Type" table of `reference/imart-tag-workflow-open-page.md`, `imwUserDataId` is marked ○ only for temporary save (1); processing (4) and confirmation (5) are not targets).

Therefore, `UserActvMatterPropertyValue.getMatterPropertyList(userDataId)`, which uses the user data ID as the key, cannot be used to restore the application content.
**Use `ActvMatter`, which retrieves the matter properties of an incomplete matter using the system matter ID as the key** (`reference/api-user-actv-matter-property-value.md`: "Use `ActvMatter` when retrieving user data matter property information from an incomplete matter using the system matter ID as the key").

```javascript
// OK: The confirmation screen retrieves data with ActvMatter using systemMatterId as the key (getMatterPropertyList takes no arguments)
let manager = new ActvMatter(systemMatterId);
let result = manager.getMatterPropertyList();

// NG: imwUserDataId is not passed to the confirmation screen, so it is not restored
let manager = new UserActvMatterPropertyValue();
let result = manager.getMatterPropertyList(userDataId);  // userDataId is empty
```

---

## Function Container (confirm/index.js)

```javascript
/**
 * Workflow Confirmation Screen (workflowOpenPage approach)
 *
 * @file index.js
 * @description Constructs the parts ordering confirmation screen.
 *              Receives workflow parameters, retrieves applied data, and displays it.
 *              Delegates processing to the engine via workflowOpenPage('5') (confirmation) using the processing button.
 *              IM-Workflow parameters: imwSystemMatterId (system matter ID), imwNodeId (node ID)
 */

// ========================================
// Bind variables (for presentation page integration)
// ========================================

// Screen title
let $title = 'Parts Order Confirmation';
let $subTitle = 'Parts Management Workflow';

// Screen data
let $data = '{}';

// Workflow parameters
let $imwSystemMatterId = '';
let $imwAuthUserCode = '';
let $imwNodeId = '';
let $imwCallOriginalParams = '';
let $imwNextPagePath = '';
let $imwNextScriptPath = '';
let $imwNextApplicationId = '';
let $imwNextServiceId = '';

// ========================================
// Entry point
// ========================================
/**
 * Entry point for screen display.
 * Executed first when the screen is called from the workflow engine.
 *
 * @param {Object} request - Request object
 */
function init(request) {
  // Retrieve workflow parameters
  $imwSystemMatterId     = request['imwSystemMatterId']       || '';
  $imwAuthUserCode       = request['imwAuthUserCode']         || '';
  $imwNodeId             = request['imwNodeId']               || '';
  $imwCallOriginalParams = request['imwCallOriginalParams']   || '';
  $imwNextPagePath       = request['imwCallOriginalPagePath'] || '';
  $imwNextScriptPath     = request['imwNextScriptPath']       || '';
  $imwNextApplicationId  = request['imwNextApplicationId']    || '';
  $imwNextServiceId      = request['imwNextServiceId']        || '';

  // Execute main process
  let response = main(request);

  // Store in $data in JSON format
  $data = JSON.stringify(response).replace(/\//g, '\\/');
}

// ========================================
// Main process
// ========================================
/**
 * Executes the main process.
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
    logger.error('An error occurred while displaying the confirmation screen. {}', e.message);
    transferErrorPage('E001', 'An unexpected error occurred.');
    return response;
  }

  return response;
}

// ========================================
// Business logic
// ========================================
/**
 * Executes the main business logic process.
 * Retrieves the applied data (matter properties) using the system matter ID as the key.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  let systemMatterId = request['imwSystemMatterId'] || '';
  let nodeId         = request['imwNodeId']         || '';

  if (!systemMatterId || !nodeId) {
    throw new Error('imwSystemMatterId or imwNodeId is not specified.');
  }

  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // The confirmation screen does not receive imwUserDataId (only imwSystemMatterId).
  // The matter properties of an incomplete matter are retrieved with ActvMatter using the system matter ID as the key.
  getMatterProperties(result, systemMatterId);

  return result;
}

/**
 * Retrieves the application content from the matter properties and reflects it in processResult.
 * Retrieves the matter properties of an incomplete matter using the system matter ID as the key.
 *
 * @param {Object} processResult - Processing result
 * @param {String} systemMatterId - System matter ID
 */
function getMatterProperties(processResult, systemMatterId) {
  let manager = new ActvMatter(systemMatterId);
  let result = manager.getMatterPropertyList();
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
// Error page transition
// ========================================
/**
 * Displays the error message on the full screen when an error occurs.
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

## Presentation Page (confirm/index.html)

```html
<!-- Header -->
<imart type="head">
  <!-- Title -->
  <title><imart type="string" value=$title escapeXml="true" escapeJs="false"></imart></title>
  <!-- CSJS for workflow screen transition -->
  <imart type="workflowOpenPageCsjs" />
  <!-- Custom styles for the presentation page -->
  <style>
    .button-spacing {
      display: flex;
      gap: 3em;
    }
  </style>
  <!-- Presentation page script -->
  <script>
    (function($data) {

    document.addEventListener('DOMContentLoaded', () => {
      // Initial screen display
      function initializeView(result) {
        document.getElementById(':partCode:').textContent = result.partCode;
        document.getElementById(':partName:').textContent = result.partName;
        document.getElementById(':unitPrice:').textContent = result.unitPrice;
        document.getElementById(':quantity:').textContent = result.quantity;
        document.getElementById(':totalAmount:').textContent = result.totalAmount;
        document.getElementById(':reason:').textContent = result.reason;
      }

      // "Back" button click event
      document.getElementById('imw-back-button').addEventListener('click', () => {
        // Return to the previous screen
        document.getElementById('imw-back-form').submit();
      });

      // "Confirm" button click event
      // The selection of confirm/return and comment input are performed in the
      // IM-Workflow engine's standard dialog after the workflowOpenPage('5') call
      document.getElementById('confirm-button').addEventListener('click', () => {
        workflowOpenPage('5');
      });

      // Entry point
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
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
    imwNodeId=$imwNodeId
    imwCallOriginalParams=$imwCallOriginalParams
    imwNextPagePath=$imwNextPagePath
    imwNextScriptPath=$imwNextScriptPath
    imwNextApplicationId=$imwNextApplicationId
    imwNextServiceId=$imwNextServiceId>

  <!-- Container for the entire page -->
  <div id="container">
    <div class="imds-container">
      <header class="imds-header">
        <div class="imds-header-back-button">
          <button type="button" id="imw-back-button" class="imds-button is-ghost is-large" aria-label="Back">
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
          <section class="imds-section imds-pt-0 imds-pb-5 imds-px-4 imds-content-normal-width">
            <h2 class="imds-heading is-bordered is-size-2 is-cyan">Order Information</h2>
            <div class="imds-field-container has-accent-color">
              <div class="imds-field-group is-horizontal imds-w-15">
                <div class="imds-field-group-label">
                  <span>Part Code</span>
                </div>
                <div class="imds-field-group-control">
                  <div class="imds-field">
                    <div class="imds-field-control">
                      <span id=":partCode:" class="imds-text"></span>
                    </div>
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
                      <span id=":partName:" class="imds-text"></span>
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
                      <span id=":unitPrice:" class="imds-text"></span>
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
                      <span id=":quantity:" class="imds-text"></span>
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
                      <span id=":totalAmount:" class="imds-text"></span>
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
                      <span id=":reason:" class="imds-text"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div class="button-spacing imds-py-2 imds-px-8 imds-border-t-1">
          <button type="button" id="confirm-button" class="imds-button is-primary" style="min-width: 8em;">Confirm</button>
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

## Differences from the Approval Screen (simple-approve-screen.md)

The legacy confirmation screen is based on the approval screen template, with only the following changes.

| Item | Approval Screen | Confirmation Screen |
|------|-----------------|---------------------|
| Processing button call | `workflowOpenPage('4')` | `workflowOpenPage('5')` |
| Button label / id | `Process` / `process-button` | `Confirm` / `confirm-button` |
| Title | Parts Order Approval | Parts Order Confirmation |
| Restoring application content | Uses `ActvMatter(systemMatterId)` | Uses `ActvMatter(systemMatterId)` |

> **Note**: Both the approval and confirmation screens process incomplete matters, and `imwUserDataId` is not passed (only `imwSystemMatterId`). Therefore, restoring the application content uses `ActvMatter(systemMatterId).getMatterPropertyList()`, which keys on the system matter ID (`UserActvMatterPropertyValue.getMatterPropertyList(userDataId)` is an API that looks up applied incomplete matters by user data ID, so it cannot be used on the processing/confirmation screens where userDataId is not passed. Refer to the "Required Attributes by Screen Type" table in `reference/imart-tag-workflow-open-page.md`).

## When the Screen Is Displayed Inside an iframe

In operations where the confirmation screen is displayed inside the workflow engine's iframe, the return destination page path does not exist and transitions to a blank page. Therefore, following the section "When generating a detail screen (confirmation, processing detail, reference detail)" in `simple-approve-screen.md`, exclude the following.

- The header "Back" button (`imw-back-button`)
- The JS event listener for the "Back" button
- The return form (`imw-back-form`)

Keep the confirmation submission button (`confirm-button` / `workflowOpenPage('5')`).

## Required Verification After Generation

Following the "Required Verification After Generation" in `SKILL.md`, perform `validate-workflow-code.js` → manual checks → cross-checking against `.agents/skills/jssp-imds-theme/reference/`.
In particular, confirm that input fields under `<imart type="workflowOpenPage">` do not have a `name` attribute (only hidden fields have `name`).
