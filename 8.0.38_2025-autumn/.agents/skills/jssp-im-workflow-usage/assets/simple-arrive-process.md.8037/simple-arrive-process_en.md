# Workflow Arrival Process Template

## Overview

Template for the IM-Workflow arrival process program.
This is a batch-like process with no UI that is automatically executed when a matter arrives at each workflow node.
The function `execute(parameter)` is called by the workflow engine.

**Note**: When performing database insert/update/delete operations within this program, implement your own DB transaction control.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── arrive/
      └── arrive_process.js     # Arrival process
```

---

## parameter (Workflow Parameters)

| Property | Type | Description |
|-----------|------|------|
| loginGroupId | String | Login group ID (deprecated; same value as tenant ID) |
| localeId | String | Locale ID |
| targetLocales | String | Target locale ID |
| contentsId | String | Contents ID |
| contentsVersionId | String | Contents version ID |
| routeId | String | Route ID |
| routeVersionId | String | Route version ID |
| flowId | String | Flow ID |
| flowVersionId | String | Flow version ID |
| applyBaseDate | String | Application base date |
| processDate | String | Processing date / arrival date |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |
| matterName | String | Matter name |
| matterNumber | String | Matter number |
| priorityLevel | String | Priority level |
| parameter | String | Parameter |
| nodeId | String | Node ID |
| actFlag | String | Proxy flag |
| preNodeId | String | Previous node ID |
| preNodeAuthUserCd | String | Previous node processing authority user code |
| preNodeExecUserCd | String | Previous node processing executor user code |
| preNodeResultStatus | String | Previous node processing result status |
| preNodeAuthCompanyCode | String | Previous node authority company code |
| preNodeAuthOrgzSetCode | String | Previous node authority organization set code |
| preNodeAuthOrgzCode | String | Previous node authority organization code |
| preNodeProcessComment | String | Previous node processing comment |
| mailIds | String | Mail template ID |
| replaceMap | Object | Mail replacement string information |

## Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | Boolean | Mail send permission (`true`: can send / `false`: cannot send) |

---

## Arrival Process (arrive_process.js)

```javascript
/**
 * Workflow Arrival Process
 *
 * @file arrive_process.js
 * @description Process program executed when a matter arrives at each workflow node.
 *              When performing database insert/update/delete operations within this program,
 *              implement your own DB transaction control.
 */

/**
 * Executes the arrival process.
 *
 * @param {Object} parameter - Workflow parameter
 * @return {Object} Processing result
 */
function execute(parameter) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: true
    };

    logger.info('[arrive] Arrival process started systemMatterId={}, nodeId={}', parameter.systemMatterId, parameter.nodeId);
    try {
        processBusinessLogic(parameter);
        logger.info('[arrive] Arrival process completed systemMatterId={}, nodeId={}', parameter.systemMatterId, parameter.nodeId);
    } catch (e) {
        logger.error('[arrive] An error occurred. systemMatterId={}, nodeId={}, error={}', parameter.systemMatterId, parameter.nodeId, e.message);
        result.resultFlag = false;
        result.message = e.message;
        result.data = false;
    }

    return result;
}

// ========================================
// Business Logic
// ========================================
/**
 * Executes the main business logic.
 *
 * @param {Object} parameter - Workflow parameter
 */
function processBusinessLogic(parameter) {
    // TODO: Implement business logic for arrival here
    //
    // Available key parameters:
    //   parameter.systemMatterId       - System matter ID
    //   parameter.userDataId           - User data ID
    //   parameter.nodeId               - Arrival node ID
    //   parameter.preNodeId            - Previous node ID
    //   parameter.preNodeExecUserCd    - Previous node processing executor user code
    //   parameter.preNodeResultStatus  - Previous node processing result status
    //   parameter.preNodeProcessComment- Previous node processing comment
    //   parameter.mailIds              - Mail template ID
    //   parameter.replaceMap           - Mail replacement string information
}
```

---

## Mail Send Control

### Overview

The return value `data` of the arrival process can control whether mail is sent.
When a mail template is configured for a node in the route definition, mail is sent when the arrival process `data` is `true`.

### Mail Replacement Strings

`parameter.replaceMap` can be used to dynamically set replacement strings in mail templates.

```javascript
function execute(parameter) {
  let result = {
    resultFlag: true,
    message: '',
    data: true
  };

  // Set mail replacement strings
  parameter.replaceMap.put('applicantName', getApplicantName(parameter));
  parameter.replaceMap.put('matterTitle', parameter.matterName);

  return result;
}
```

---

## Available Templates

- **Arrival Process**: [assets/simple-arrive.md](assets/simple-arrive.md)
  - Processing executed when a matter arrives at each workflow node
  - Implements the `execute(parameter)` function
  - Implement your own DB transaction control
  - Control mail send permission via the `data` return value

### Generation Instruction Examples

When a user requests "Create a workflow arrival process", use the code in these assets as a reference and generate appropriately customized code.
