# BPM Screen Form Reference

## Overview

Guidelines for generating the screen forms used for integration between IM-BPM and scratch-built screens.

### Flow of Screen Processing (Business Data Retrieval)

1. Determining the request type
- Determine it from the `request` parameter of the function container's init function.
  - If `request` contains `processDefinitionId`, it is a request from a start event.
  - If `request` contains `historicProcessInstanceId`, it is a request to reference the history of a start event.
  - If `request` contains `taskId`, it is a request from a user task.
  - If `request` contains `historicTaskId`, it is a request to reference the history of a task.

2. Checking permissions
- If the request is for a process start screen, determine the permission with `bpm.BPMAuthorityHelper#canStartProcess`
- If the request is for a task screen, determine the permission with `bpm.BPMAuthorityHelper#canCompleteTask`
- If the request is to reference the history of a task, determine the permission with `bpm.BPMAuthorityHelper#canReferTask`
- If the request is to reference the history of a start event (`historicProcessInstanceId`), or if the `request` parameter of the init function contains `processInstanceId`, determine the permission with `bpm.BPMAuthorityHelper#canReferProcessInstance`

* Because "referencing the history of a task" and "referencing the history of a start event" are judged by different parameters, do not apply both `canReferTask` and `canReferProcessInstance` to the same request.

3. Retrieving business data
- A start event does not retrieve business data.
- A request to reference the history of a start event retrieves the business data keyed by `historicProcessInstanceId`.
- A request to reference the history of a task retrieves the business data keyed by the primary key of the business data or by `historicTaskId`.
- Any other request retrieves the business data using the primary key of the business data, or the process instance ID, task ID, etc.

4. Determining the mode
- History reference requests are reference mode.
- Start events are new mode.
- Otherwise, search the business data; if data exists it is edit mode, and if not it is new mode.

5. Controlling the screen display by mode
- In reference mode
  - Make the input items on the screen non-editable.
  - Hide search dialogs and the like so that they cannot be operated.
  - Hide the register / edit / delete / cancel buttons.
  - Since the reference mode screen is displayed in a separate window, a "Back" button is not required.

## Sample Code

### Function Container

```javascript

// ========================================
// IM-BPM scratch screen integration - reference request determination
// ========================================
/**
 * Determines from the contents of the request parameters whether this is a request from a detail screen.
 * For mode determination (4. Determining the mode) only. Because it does not distinguish between
 * historicProcessInstanceId and historicTaskId, do not use it as a branching condition for task permission checks, etc.
 *
 * @param {Object} request - request parameters
 */
function isReferenceRequest(request) {
  return (request['historicProcessInstanceId'] || request['historicTaskId']);
}

// ========================================
// IM-BPM scratch screen integration - start event determination
// ========================================
/**
 * Determines from the contents of the request parameters whether this is a request from a process start event.
 *
 * @param {Object} request - request parameters
 */
function isStartEventRequest(request) {
  return (request['processDefinitionId']);
}

// ========================================
// IM-BPM process start permission check
// ========================================
/**
 * Checks the start permission of IM-BPM.
 *
 * @param {String} processDefinitionId - process definition ID
 * @return {Boolean} - true: has permission, false: no permission
 * @throws {Error} error message
 */
function hasStartProcessAuthority(processDefinitionId) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  const result = BPMAuthorityHelper.canStartProcess(processDefinitionId);
  if (result.error) throw new Error(result.errorMessage);
  if (!result.error && result.data) return true;
  return false;
}


// ========================================
// IM-BPM process instance reference permission check
// ========================================
/**
 * Checks the process instance reference permission of IM-BPM.
 *
 * @param {String} processInstanceId - process instance ID
 * @return {Boolean} - true: has permission, false: no permission
 * @throws {Error} error message
 */
function hasReferProcessAuthority(processInstanceId) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  const result = BPMAuthorityHelper.canReferProcessInstance(processInstanceId);
  if (result.error) throw new Error(result.errorMessage);
  if (!result.error && result.data) return true;
  return false;
}

// ========================================
// IM-BPM task permission check
// ========================================
/**
 * Checks the task permission of IM-BPM.
 * Applies only to requests that have taskId / historicTaskId.
 * historicProcessInstanceId (referencing the history of a start event) is out of scope, so use hasReferProcessAuthority.
 *
 * @param {Object} request - request parameters
 * @return {Boolean} - true: has permission, false: no permission
 * @throws {Error} error message
 */
function hasTaskAuthority(request) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  if (request['historicTaskId']) {
    const historicTaskId = request['historicTaskId'];
    const result = BPMAuthorityHelper.canReferTask(historicTaskId)
    if (result.error) throw new Error(result.errorMessage);
    if (!result.error && result.data) return true;
  } else {
    const taskId = request['taskId'];
    const result = BPMAuthorityHelper.canCompleteTask(taskId)
    if (result.error) throw new Error(result.errorMessage);
    if (!result.error && result.data) return true;
  }
  return false;
}

```

**About screen transitions after processing**
- After the screen processing completes, transition to the screen specified in the `callbackPath` request parameter.
  - If the destination of the screen transition is explicitly stated in the specifications, follow that specification.
