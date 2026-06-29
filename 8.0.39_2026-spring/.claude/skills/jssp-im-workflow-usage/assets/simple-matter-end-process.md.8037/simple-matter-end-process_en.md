# Workflow Matter End Process Template

## Overview

Template for the IM-Workflow matter end process program.
This is a batch-like process with no UI that is automatically executed when a matter ends.
The function `execute(parameter)` is called by the workflow engine.

There are two types of matter end processes: **with transaction** and **without transaction**.

| Type | File Name | DB Transaction | Mail Send Control |
|------|-----------|-------------------|--------------|
| With transaction | matter_end_process.js | Controlled by IM-Workflow (do not start your own) | Yes (controlled via `data`) |
| Without transaction | matter_end_process_no_tran.js | Implement your own transaction control | No |

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  ├── matter_end_process.js           # Matter end process (with transaction)
  └── matter_end_process_no_tran.js   # Matter end process (without transaction)
```

---

## With Transaction

### Overview

Matter end process executed within IM-Workflow's transaction.
Whether mail is sent can be controlled via the return value `data`.

**Note**: Do not start a DB transaction within this program.

### parameter (Workflow Parameters)

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
| parameter | String | Parameter |
| actFlag | String | Proxy flag |
| lastProcessNodeId | String | (Last) processing node ID |
| lastAuthUserCd | String | (Last) processing authority user code |
| lastExecUserCd | String | (Last) processing executor user code |
| lastResultStatus | String | (Last) processing result status |
| mailIds | String | Mail template ID |
| replaceMap | Object | Mail replacement string information |

### Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | Boolean | Mail send permission (`true`: can send / `false`: cannot send) |

### Matter End Process (matter_end_process.js)

```javascript
/**
 * Workflow Matter End Process (with transaction)
 *
 * @file matter_end_process.js
 * @description Process program executed when a workflow matter ends.
 *              Executed within IM-Workflow's transaction, so
 *              do not start a DB transaction within this program.
 */

/**
 * Executes the matter end process.
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

    logger.info('[matterEnd] Matter end process started systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterEnd] Matter end process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterEnd] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
    // TODO: Implement business logic for matter end here
    //
    // Available key parameters:
    //   parameter.systemMatterId      - System matter ID
    //   parameter.userDataId          - User data ID
    //   parameter.lastProcessNodeId   - (Last) processing node ID
    //   parameter.lastAuthUserCd      - (Last) processing authority user code
    //   parameter.lastExecUserCd      - (Last) processing executor user code
    //   parameter.lastResultStatus    - (Last) processing result status
    //   parameter.mailIds             - Mail template ID
    //   parameter.replaceMap          - Mail replacement string information
}
```

---

## Without Transaction

### Overview

Matter end process executed outside IM-Workflow's transaction.
When performing database insert/update/delete operations, implement your own DB transaction control.
Mail send control (`data`, `mailIds`, `replaceMap`) cannot be used.

### parameter (Workflow Parameters)

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
| parameter | String | Parameter |
| actFlag | String | Proxy flag |
| lastProcessNodeId | String | (Last) processing node ID |
| lastAuthUserCd | String | (Last) processing authority user code |
| lastExecUserCd | String | (Last) processing executor user code |
| lastResultStatus | String | (Last) processing result status |

### Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |

### Matter End Process (matter_end_process_no_tran.js)

```javascript
/**
 * Workflow Matter End Process (without transaction)
 *
 * @file matter_end_process_no_tran.js
 * @description Process program executed when a workflow matter ends.
 *              When performing database insert/update/delete operations within this program,
 *              implement your own DB transaction control.
 */

/**
 * Executes the matter end process.
 *
 * @param {Object} parameter - Workflow parameter
 * @return {Object} Processing result
 */
function execute(parameter) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    logger.info('[matterEndNoTran] Matter end process started systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterEndNoTran] Matter end process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterEndNoTran] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
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
    // TODO: Implement business logic for matter end here
    //
    // Available key parameters:
    //   parameter.systemMatterId      - System matter ID
    //   parameter.userDataId          - User data ID
    //   parameter.lastProcessNodeId   - (Last) processing node ID
    //   parameter.lastAuthUserCd      - (Last) processing authority user code
    //   parameter.lastExecUserCd      - (Last) processing executor user code
    //   parameter.lastResultStatus    - (Last) processing result status
}
```

---

## When to Use With/Without Transaction

| Aspect | With Transaction | Without Transaction |
|------|--------------------|--------------------|
| DB Transaction | Managed by IM-Workflow | Implement your own control |
| On failure | IM-Workflow side also rolls back | No effect on IM-Workflow side |
| Mail send control | Can control via `data` | Not available |
| Mail replacement strings | Can set via `replaceMap` | Not available |
| Use case | Processing that needs to maintain consistency together with the workflow | External integration or logging that should not be affected by WF success/failure |

---

## Available Templates

- **Matter End Process (with transaction)**: [assets/simple-matter-end-process.md](assets/simple-matter-end-process.md)
  - Executed within IM-Workflow's transaction
  - Do not start a DB transaction
  - Control mail send permission via the `data` return value
- **Matter End Process (without transaction)**: [assets/simple-matter-end-process.md](assets/simple-matter-end-process.md)
  - Executed outside IM-Workflow's transaction
  - Implement your own transaction control when performing DB operations

### Generation Instruction Examples

When a user requests "Create a workflow matter end process", use the code in these assets as a reference and generate appropriately customized code.
Confirm whether a transaction is needed and select the appropriate type.
