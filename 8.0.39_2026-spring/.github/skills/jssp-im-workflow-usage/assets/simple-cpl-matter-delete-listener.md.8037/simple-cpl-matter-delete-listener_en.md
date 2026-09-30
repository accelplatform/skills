# Workflow Completed Matter Delete Listener Template

## Overview

Template for the IM-Workflow completed matter deletion listener program.
This is a batch-like process with no UI that is automatically executed when a completed matter is deleted.
The function `execute(loginGroupId, localeId, systemMatterId, userDataId)` is called by the workflow engine.

Unlike other workflow processing programs, arguments are passed as individual values rather than as a `parameter` object.

**Note**: Do not start a DB transaction within this program.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── cpl_matter_delete_listener.js    # Completed matter delete listener
```

---

## Arguments

| Argument Name | Type | Description |
|--------|------|------|
| loginGroupId | String | Login group ID (deprecated; same value as tenant ID) |
| localeId | String | Locale ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |

## Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |

---

## Completed Matter Delete Listener (cpl_matter_delete_listener.js)

```javascript
/**
 * Workflow Completed Matter Delete Listener
 *
 * @file cpl_matter_delete_listener.js
 * @description Listener program executed when a completed matter is deleted.
 *              Do not start a DB transaction within this program.
 */

/**
 * Executes the completed matter deletion process.
 *
 * @param {String} loginGroupId - Login group ID
 * @param {String} localeId - Locale ID
 * @param {String} systemMatterId - System matter ID
 * @param {String} userDataId - User data ID
 * @return {Object} Processing result
 */
function execute(loginGroupId, localeId, systemMatterId, userDataId) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic(systemMatterId, userDataId);
    } catch (e) {
        logger.error('[cplMatterDelete] An error occurred. systemMatterId={}, error={}', systemMatterId, e.message);
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
 * @param {String} systemMatterId - System matter ID
 * @param {String} userDataId - User data ID
 */
function processBusinessLogic(systemMatterId, userDataId) {
    // TODO: Implement business logic for completed matter deletion here
    //
    // Main use cases:
    //   - Delete data in custom tables linked to the matter
    //   - Notify external systems of the deletion
    //   - Clean up related resources such as attachments
}
```

---

## Available Templates

- **Completed Matter Delete Listener**: [assets/simple-cpl-matter-delete-listener.md](assets/simple-cpl-matter-delete-listener.md)
  - Listener processing executed when a completed matter is deleted
  - Arguments are passed as individual values, not as a `parameter` object
  - Do not start a DB transaction

### Generation Instruction Examples

When a user requests "Create a workflow completed matter delete listener", use the code in these assets as a reference and generate appropriately customized code.
