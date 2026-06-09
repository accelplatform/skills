# Workflow Processing Target User Plugin Template

## Overview

Template for the IM-Workflow processing target user plugin program.
This is a plugin with no UI that dynamically determines the processing target users for a node when a matter is processed.
Three functions need to be implemented.

| Function Name | Purpose |
|--------|------|
| execute | Get processing target users (called when a matter is processed) |
| getDisplayName | Get display name for plugin configuration information |
| getTargetUserList | Get user list for target user status confirmation screen |

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── plugin/
      └── authority_exec_event_listener.js      # Processing target user plugin
```

---

## execute - Get Processing Target Users

### workflowParam (Workflow Parameters)

| Property | Type | Description |
|-----------|------|------|
| loginGroupId | String | Login group ID (deprecated; same value as tenant ID) |
| localeId | String | Locale ID |
| targetLocales | String | Target locale ID |
| applyBaseDate | String | Application base date |
| parameter | String | Parameter |
| targetCodes | Array | Target code array (set when moving nodes via pull-back, send-back, or matter operation) |

### matterParam (Matter Parameters)

| Property | Type | Description |
|-----------|------|------|
| contentsId | String | Contents ID |
| contentsVersionId | String | Contents version ID |
| routeId | String | Route ID |
| routeVersionId | String | Route version ID |
| flowId | String | Flow ID |
| flowVersionId | String | Flow version ID |
| nodeId | String | Node ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |

### Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | Array | Array of processing target user information |

### Elements of the data Array

| Property | Type | Description |
|-----------|------|------|
| userCode | String | Processing target user code |
| userName | String | Processing target user name |
| localeId | String | Processing target user locale ID |
| userOrgzModels | Array | Array of processing target user's affiliation list (becomes options for the responsible organization) |

### Elements of the userOrgzModels Array

| Property | Type | Description |
|-----------|------|------|
| companyName | String | Company name |
| orgzName | String | Organization name |
| companyCode | String | Company code |
| orgzSetCode | String | Organization set code |
| orgzCode | String | Organization code |

---

## getDisplayName - Get Display Name

### workflowParam (Workflow Parameters)

Same items as `execute` (excluding `targetCodes`).

### Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | Object | Display name object with locale ID as key |

---

## getTargetUserList - Target User Status Confirmation

### Arguments

| Argument Name | Type | Description |
|--------|------|------|
| workflowParam | Object | Workflow parameters (same items as `execute`, excluding `targetCodes`) |
| matterParam | Object | Matter parameters (same items as `execute`) |
| sort | Array | Sort condition array |

### Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | Object | Processing target user array with locale ID as key |

### Elements of data[localeId] Array

| Property | Type | Description |
|-----------|------|------|
| userCode | String | Processing target user code |
| userName | String | Processing target user display name |
| localeId | String | Processing target user locale ID |

---

## Processing Target User Plugin (authority_exec_event_listener.js)

```javascript
/**
 * Workflow Processing Target User Plugin
 *
 * @file authority_exec_event_listener.js
 * @description Plugin that dynamically determines the processing target users for a node when a matter is processed.
 */

// ========================================
// Get Processing Target Users
// ========================================
/**
 * Gets the processing target users.
 * Executed when a matter is processed.
 *
 * @param {Object} workflowParam - Workflow parameter
 * @param {Object} matterParam - Matter parameter
 * @return {Object} Processing result
 */
function execute(workflowParam, matterParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: []
    };

    try {
        result.data = resolveTargetUsers(workflowParam, matterParam);
    } catch (e) {
        logger.error('[authorityPlugin] An error occurred. nodeId={}, error={}', matterParam.nodeId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Get Display Name
// ========================================
/**
 * Gets the plugin display name.
 * Must be set for each locale.
 *
 * @param {Object} workflowParam - Workflow parameter
 * @return {Object} Processing result
 */
function getDisplayName(workflowParam) {
    let result = {
        resultFlag: true,
        message: '',
        data: {
            'ja': '処理対象者プラグイン',
            'en': 'Authority Plugin'
        }
    };

    return result;
}

// ========================================
// Target User Status Confirmation
// ========================================
/**
 * Gets the user list to display on the target user status confirmation screen.
 * Called when the "Status Confirmation" button is pressed on the [Matter Operation]-[Node Edit] screen.
 *
 * @param {Object} workflowParam - Workflow parameter
 * @param {Object} matterParam - Matter parameter
 * @param {Array} sort - Sort condition array
 * @return {Object} Processing result
 */
function getTargetUserList(workflowParam, matterParam, sort) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: {}
    };

    try {
        result.data = resolveTargetUserList(workflowParam, matterParam, sort);
    } catch (e) {
        logger.error('[authorityPlugin] Target user list retrieval error. nodeId={}, error={}', matterParam.nodeId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Business Logic
// ========================================
/**
 * Resolves the processing target users.
 *
 * @param {Object} workflowParam - Workflow parameter
 * @param {Object} matterParam - Matter parameter
 * @return {Array} Array of processing target user information
 */
function resolveTargetUsers(workflowParam, matterParam) {
    // TODO: Implement business logic to determine processing target users here
    //
    // When workflowParam.targetCodes is set:
    //   Arrived via pull-back, send-back, or node move by matter operation
    //   Returning the previous processor can realize a re-processing wait state
    //
    // Return value example:
    //   [{
    //       userCode: "aoyagi",
    //       userName: "青柳 辰巳",
    //       localeId: "ja",
    //       userOrgzModels: [{
    //           companyName: "サンプル会社",
    //           orgzName: "営業部",
    //           companyCode: "comp_sample_01",
    //           orgzSetCode: "comp_sample_01_set_01",
    //           orgzCode: "comp_sample_01_section_sales"
    //       }]
    //   }]

    return [];
}

/**
 * Resolves the user list to display on the target user status confirmation screen.
 *
 * @param {Object} workflowParam - Workflow parameter
 * @param {Object} matterParam - Matter parameter
 * @param {Array} sort - Sort condition array
 * @return {Object} Processing target user array with locale ID as key
 */
function resolveTargetUserList(workflowParam, matterParam, sort) {
    // TODO: Implement business logic to return target user list here

    return {};
}
```

---

## About targetCodes

`workflowParam.targetCodes` is passed as an array of user codes in the following cases:

- Pull-back
- Send-back
- Node move back via matter operation feature

The user codes of those who last processed the node configured with this plugin are set.
By adopting the users passed via `targetCodes` in the return value, a re-processing wait state by the previous processor can be realized.

---

## Available Templates

- **Processing Target User Plugin**: [assets/simple-authority-exec-event-listener.md](assets/simple-authority-exec-event-listener.md)
  - Dynamically determines the processing target users for a node when a matter is processed
  - Implements 3 functions: `execute`, `getDisplayName`, `getTargetUserList`
  - Re-processing wait state can be realized via `targetCodes`

### Generation Instruction Examples

When a user requests "Create a workflow processing target user plugin", use the code in these assets as a reference and generate appropriately customized code.
