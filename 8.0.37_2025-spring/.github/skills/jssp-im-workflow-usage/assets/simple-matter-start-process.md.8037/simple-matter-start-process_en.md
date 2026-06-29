# Workflow Matter Start Process Template

## Overview

Template for the IM-Workflow matter start process program.
This is a batch-like process with no UI that is automatically executed when a matter starts.
The function `execute(parameter)` is called by the workflow engine.

**Note**: Do not start a DB transaction within this program.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── matter_start_process.js     # Matter start process
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
| parameter | String | Parameter |

## Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |

---

## Matter Start Process (matter_start_process.js)

```javascript
/**
 * Workflow Matter Start Process
 *
 * @file matter_start_process.js
 * @description Process program executed when a workflow matter starts.
 *              Do not start a DB transaction within this program.
 */

/**
 * Executes the matter start process.
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

    logger.info('[matterStart] Matter start process started systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic(parameter);
        logger.info('[matterStart] Matter start process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[matterStart] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
    // TODO: Implement business logic for matter start here
    //
    // Available key parameters:
    //   parameter.systemMatterId  - System matter ID
    //   parameter.userDataId      - User data ID
    //   parameter.applyBaseDate   - Application base date
    //   parameter.processDate     - Processing date
}
```

---

## Available Templates

- **Matter Start Process**: [assets/simple-matter-start-process.md](assets/simple-matter-start-process.md)
  - Processing executed when a workflow matter starts
  - Implements the `execute(parameter)` function
  - Do not start a DB transaction

### Generation Instruction Examples

When a user requests "Create a workflow matter start process", use the code in these assets as a reference and generate appropriately customized code.
