# Workflow Approval Screen Template (workflowOpenPage method / legacy)

## Overview

Template for IM-Workflow approval (processing) screen programs.
This is a sample screen that displays the part code, part name, unit price, total amount, and reason entered on the application screen in read-only mode, allowing the approver to perform processing.
On initial display, the applied data is retrieved based on the workflow parameters and user data ID and displayed.
Processing is delegated to the workflow engine via the `workflowOpenPage` function using the Process button.

> **Choosing between this and the modal method (new)**: For the new method using `imWorkflow.modal.showProcess()`, see `modal-approve-screen.md`. The new method is recommended for new development. Use this template when an approval (processing) screen based on the workflowOpenPage method (legacy) is required.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  ├── approve/
  │   ├── index.js              # Function container
  │   └── index.html            # Presentation page
  └── action/
      └── action_process.js     # Action process (separate template)
```

**Note:** IM-Workflow screens specify the JSSP path directly in the content definition, so a routing table is not required.

---

## Function Container (approve/index.js)

```javascript
/**
 * Workflow Approval Screen
 *
 * @file index.js
 * @description Constructs the parts ordering approval screen.
 *              Receives workflow parameters, retrieves applied data, and displays it.
 */

// ========================================
// Bind Variables (for presentation page linkage)
// ========================================

// Screen title
let $title = 'Parts Order Approval';
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
  $imwUserDataId         = request['imwUserDataId']           || '';
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
    logger.error('An error occurred while displaying the approval screen. {}', e.message);
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
 * Retrieves applied data (matter properties) using the system matter ID as the key.
 *
 * @param {Object} request - Request parameters
 * @return {Object} Processing result
 */
function processBusinessLogic(request) {
  let systemMatterId = request['imwSystemMatterId'] || '';

  if (!systemMatterId) {
    throw new Error('imwSystemMatterId is not specified.');
  }

  let result = {
    partCode: '',
    partName: '',
    unitPrice: '',
    quantity: '',
    totalAmount: '',
    reason: ''
  };

  // The processing screen does not receive imwUserDataId (only imwSystemMatterId).
  // Retrieve the matter properties of the in-progress matter using the system matter ID as the key, via ActvMatter.
  getMatterProperties(result, systemMatterId);

  return result;
}

/**
 * Retrieves the application content from matter properties and applies it to processResult.
 * Retrieves the matter properties of the in-progress matter using the system matter ID as the key.
 * (The processing screen does not receive imwUserDataId, so UserActvMatterPropertyValue(userDataId) cannot be used.
 *  See the "Required attributes per screen type" table in reference/imart-tag-workflow-open-page.md.)
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

## Presentation Page (approve/index.html)

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
    // Bind variable for presentation page linkage
    const $data = <imart type="string" value=$data escapeXml="false" escapeJs="false" />;

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
        // Go back to previous screen
        document.getElementById('imw-back-form').submit();
      });

      // "Process" button click event
      // Selection of approval/send-back/denial/hold/cancel-hold is done
      // via the IM-Workflow engine's standard dialog after calling workflowOpenPage('4')
      document.getElementById('process-button').addEventListener('click', () => {
        workflowOpenPage('4');
      });

      // Entry point
      if ($data.error.code) {
        imuiShowErrorMessage([$data.error.code, $data.error.message].join('\n'));
      } else {
        initializeView($data.result);
      }
    });
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
          <button type="button" id="process-button" class="imds-button is-primary" style="min-width: 8em;">Process</button>
        </div>
      </main>
    </div>
  </div>
</imart>

<!-- Form for workflow page transition -->
<imart type="tag" tagname="form" name="imwBackForm" id="imwBackForm" method="POST" action=$imwNextPagePath escapeXml="true" escapeJs="false" >
  <imart type="hidden" imwCallOriginalParams=$imwCallOriginalParams escapeXml="true" escapeJs="false" />
</imart>
```

---

## Business Constraints That Cannot Be Enforced at the Screen Layer

The standard IM-Workflow processing dialog opened by `workflowOpenPage('4')` lets the user choose **approve / send back / reject** and enter a comment, but the choice and comment are confirmed inside that dialog itself. As a result, **the screen's JavaScript cannot conditionally enforce things like "make the comment required only when the user picks reject"**.

For this reason, business constraints such as the following **cannot be implemented on the screen layer**:

- "Make the reason comment required for reject (optional for approve)"
- "Limit comment length to 300 characters"
- "Require additional fields when a specific action is chosen"

When such requirements apply, **do not try to force a screen-side workaround; instead, validate inside the action processing** (`{feature}/workflow/action/`).
Pick the actual implementation style (return failure via the result, throw an exception, wrap with a dedicated validation screen, etc.) to fit the requirement — this skill intentionally does not prescribe a single solution.

See [`simple-action-process.md`](simple-action-process.md) for action processing details.

---

## Available Templates

- **Approval Screen**: [assets/simple-approve.md](assets/simple-approve.md)
  - IM-Workflow approval screen (using workflowOpenPage tag)
  - Displays applied data in read-only mode
  - Process button: `workflowOpenPage('4')`

### Generation Instruction Examples

When a user requests "Create a workflow approval screen", use the code in these assets as a reference and generate appropriately customized code.

### When Generating a Detail Screen (confirmation/processing detail/reference detail)

Based on the approval screen template, **exclude all** of the following elements:
- Header "Back" button (`imw-back-button`)
- "Back" button JS event listener
- Back form (`imw-back-form`)
- Process button (`workflowOpenPage('4')`)

Detail screens are displayed within an iframe of the workflow engine, so the back destination page path does not exist and would navigate to an empty page.
