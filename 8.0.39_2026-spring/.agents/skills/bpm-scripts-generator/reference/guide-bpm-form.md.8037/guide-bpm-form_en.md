# BPM Screen Form Reference

## Overview

Generation guidelines for the screen forms used for IM-BPM scratch-screen integration.

### Flow of Screen Processing (Business Data Retrieval)

1. Determine the Request Type
- Determine this from the request parameter of the function container's init function.
  - If the request has `processDefinitionId`, it is a request from a start event.
  - If the request has `historicProcessInstanceId`, it is a historical reference request for a start event.
  - If the request has `historicTaskId`, it is a historical reference request for a task.
  - If the request has `taskId`, it is a request from a user task. A user task's request may also include `processInstanceId`.

2. Check Permissions
- If the request is for a process start screen, determine permission via bpm.BPMAuthorityHelper#canStartProcess.
- If the request is for a task screen, determine permission via bpm.BPMAuthorityHelper#canCompleteTask.
- If the request is a historical reference of a task, determine permission via bpm.BPMAuthorityHelper#canReferTask.
- If the request is a historical reference of a start event (`historicProcessInstanceId`), or the init function's request parameter has `processInstanceId`, determine permission via bpm.BPMAuthorityHelper#canReferProcessInstance.

Note: If a request from a user task (`taskId`) also has `processInstanceId`, perform both the `canCompleteTask` and `canReferProcessInstance` permission checks (do not determine based on only one).

3. Determine the Request Pattern
- Determine the pattern from the request content.
  - If the request has `processDefinitionId`, the pattern is `startProcess`.
  - If the request has `historicProcessInstanceId`, the pattern is `referProcessInstance`.
  - If the request has `historicTaskId`, the pattern is `referTask`.
  - If the request has `taskId`, the pattern is `completeTask`.

4. Retrieve Business Data
- Retrieve the business data. The return value of `validateBPMRequest` is the request pattern, so use that value to determine whether data retrieval is needed and, if so, which primary key value to use for the retrieval.
  - If the request pattern is `startProcess`, do not retrieve business data.
  - If the request pattern is `referProcessInstance`, retrieve business data keyed by `historicProcessInstanceId`.
  - If the request pattern is `referTask`, retrieve business data keyed by `historicTaskId`.
  - Otherwise (`completeTask`), switch the retrieval condition according to the primary key method of the business data.
    - **Composite-primary-key method (managed as "one task completion = one row" using `process instance ID + task ID`; the default method)**: When displaying and carrying over the input data from a start event or user task completed before this task, retrieve the business data using `request.processInstanceId` (or the implicit object) and a process variable holding the task ID of the previous step (e.g. `applyTaskId`; retrieved via `bpm.RuntimeService#getVariable`, etc.) as the search conditions.
      - For tasks such as approval or confirmation that merely display the previous step's input data on screen, use this retrieval result as-is for display.
      - For tasks that register a new record by adding the current screen's input values to the previous step's input data, hold the retrieval result in hidden fields, etc., and carry it over to the registration processing (described later).
    - **Update method (when the business data has no task ID, or the Update method has been explicitly adopted per request)**: Retrieve the business data using its primary key (a value carried over via a process variable, etc.) as the search condition.

5. Determine the Mode
- If the request pattern is `referProcessInstance` or `referTask`, it is reference mode.
- If the request pattern is `startProcess`, it is new-entry mode.
- Otherwise, search the business data; if data exists it is edit mode, otherwise it is new-entry mode.

6. Control Screen Display Based on the Mode
- If it is reference mode:
  - Make the screen's input fields non-editable.
  - Hide search dialogs, etc., so they cannot be operated.
  - Hide the register/edit/delete/cancel buttons, etc.
  - Since a reference-mode screen is displayed in a separate window, no "Back" button is needed.

## Sample Code

### Function Container

```javascript

// ========================================
// IM-BPM Request Parameters and Permission Check
// ========================================
/**
 * Checks the IM-BPM request parameters and permissions.
 *
 * @param {Object} request - Request parameters
 * @return {string} - Request pattern
 * @throws {Error} Error message
 */
function validateBPMRequest(request) {

  if (!request) {
    throw new Error('The parameters required to process the BPM process are not specified.');
  }

  let reqPattern = '';
  let bpmAuthorityHelper = new bpm.BPMAuthorityHelper();

  // Request from a start event
  if (request['processDefinitionId']){
    const resultCanStart = bpmAuthorityHelper.canStartProcess(request['processDefinitionId']);
    if (resultCanStart.error) throw new Error(resultCanStart.errorMessage);
    if (resultCanStart.data) {
      reqPattern = 'startProcess';
      // Since this is a start event, business data retrieval is basically not needed
    } else {
      throw new Error('You do not have permission to start the process.');
    }
  }
  // Historical reference request for a start event?
  else if (request['historicProcessInstanceId']) {
    const resultCanReferProcess = bpmAuthorityHelper.canReferProcessInstance(request['historicProcessInstanceId']);
    if (resultCanReferProcess.error) throw new Error(resultCanReferProcess.errorMessage);
    if (resultCanReferProcess.data) {
      reqPattern = 'referProcessInstance';
    } else {
      throw new Error('You do not have reference permission.');
    }
  }
  // Historical reference request for a task?
  else if (request['historicTaskId']) {
    const resultCanReferTask = bpmAuthorityHelper.canReferTask(request['historicTaskId']);
    if (resultCanReferTask.error) throw new Error(resultCanReferTask.errorMessage);
    if (resultCanReferTask.data) {
      reqPattern = 'referTask';
    } else {
      throw new Error('You do not have reference permission.');
    }
  }
  // Request from a user task
  else if (request['taskId']) {
    const resultCanCompleteTask = bpmAuthorityHelper.canCompleteTask(request['taskId']);
    if (resultCanCompleteTask.error) throw new Error(resultCanCompleteTask.errorMessage);
    if (resultCanCompleteTask.data) {
      reqPattern = 'completeTask';
    } else {
      throw new Error('You do not have permission to complete the task.');
    }

    // Permission check for the process instance
    if (request['processInstanceId']) {
      const result = bpmAuthorityHelper.canReferProcessInstance(request['processInstanceId']);
      if (result.error) throw new Error(result.errorMessage);
      if (!result.data) {
        throw new Error('You do not have reference permission.');
      }
    }

  } else {
    throw new Error('The parameters required to process the BPM process are not specified.');
  }
  return reqPattern;
}


```

**About Screen Transition After Processing**
- After the screen processing is complete, transition to the screen specified by the callbackPath in the request parameters.
  - If the transition destination is explicitly specified in the specification, follow that specification.

**Required Conversion When Passing callbackPath to PageManager.redirect() (Important — Frequently Occurring Bug)**
- The `callbackPath` passed from IM-BPM (e.g. `'bpm/task/list?group.retains...'`) is **a context-path-relative path without a leading slash**.
- Because `PageManager.redirect(url)` sets the specified `url` as-is into the HTML form's `action` attribute, **passing the leading-slash-less `callbackPath` as-is causes it to be interpreted as a path relative to the currently displayed screen path (e.g. `/equipment_purchase/purchase_apply`), resulting in an incorrect URL such as `/equipment_purchase/bpm/task/list` and a 404** (this bug has actually occurred).
- Always convert it to an absolute path rooted at the web application root using `Web.getContextPath()` before passing it to `PageManager.redirect()`.

```javascript
// NG: passing callbackPath as-is → interpreted as a path relative to the current screen, resulting in a 404
let result = PageManager.redirect(callbackPath, 'GET');

// OK: convert to an absolute path with the context path prepended via Web.getContextPath()
function buildAbsoluteCallbackPath(callbackPath) {
  let relativePath = callbackPath.charAt(0) === '/' ? callbackPath.substring(1) : callbackPath;
  return Web.getContextPath() + '/' + relativePath;
}
let result = PageManager.redirect(buildAbsoluteCallbackPath(callbackPath), 'GET');
```

- Since `callbackPath` is passed via a request parameter (e.g. a hidden field in the POST body), before the conversion above, separately perform a safety validation to prevent an open redirect to an external site (rejecting URI schemes, `//`, backslashes, and control characters), following the whitelist approach described under "Input Validation" in `.agents/requirements/jssp-security/AGENTS.md`. Since that file contains no description of open-redirect countermeasures, implement them according to the validation points given in this item. Keep the safety validation and the path resolution (absolute-path conversion) as separate responsibilities, and call them in the order: validate → convert.
