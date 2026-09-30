# Workflow Matter Archive Listener Template

## Overview

Template for the IM-Workflow matter archive listener program.
This is a batch-like process with no UI that is automatically executed when completed matters are archived (moved) to the past matters table.
The function `execute(loginGroupId, localeId, systemMatterId, userDataId)` is called by the workflow engine.

Unlike other workflow processing programs, arguments are passed as individual values rather than as a `parameter` object.

**Note**: Do not start a DB transaction within this program.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── matter_archive_listener.js       # Matter archive listener
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

## Matter Archive Listener (matter_archive_listener.js)

```javascript
/**
 * Workflow Matter Archive Listener
 *
 * @file matter_archive_listener.js
 * @description Listener program executed when completed matters are archived (moved) to the past matters table.
 *              Do not start a DB transaction within this program.
 */

/**
 * Executes the matter archive process.
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
        logger.error('[matterArchive] An error occurred. systemMatterId={}, error={}', systemMatterId, e.message);
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
    // TODO: Implement business logic for matter archiving here
    //
    // Main use cases:
    //   - Migrate data in custom tables to past matter tables
    //   - Notify external systems of archiving
    //   - Archive related resources such as attachments
}
```

---

## Available Templates

- **Matter Archive Listener**: [assets/simple-matter-archive-listener.md](assets/simple-matter-archive-listener.md)
  - Listener processing executed when completed matters are moved to the past matters table
  - Arguments are passed as individual values, not as a `parameter` object
  - Do not start a DB transaction

### Generation Instruction Examples

When a user requests "Create a workflow matter archive listener", use the code in these assets as a reference and generate appropriately customized code.
