# Workflow Archive Matter Delete Listener Template

## Overview

Template for the IM-Workflow archive matter deletion listener program.
This is a batch-like process with no UI that is automatically executed when an archive (past) matter is deleted.
The function `execute(loginGroupId, localeId, systemMatterId, userDataId, archiveMonth)` is called by the workflow engine.

Unlike other workflow processing programs, arguments are passed as individual values rather than as a `parameter` object.
Compared to the active matter and completed matter delete listeners, `archiveMonth` (archive year-month) is additionally passed.

**Note**: Do not start a DB transaction within this program.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── arc_matter_delete_listener.js    # Archive matter delete listener
```

---

## Arguments

| Argument Name | Type | Description |
|--------|------|------|
| loginGroupId | String | Login group ID (deprecated; same value as tenant ID) |
| localeId | String | Locale ID |
| systemMatterId | String | System matter ID |
| userDataId | String | User data ID |
| archiveMonth | String | Archive year-month (yyyyMM format) |

## Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |

---

## Archive Matter Delete Listener (arc_matter_delete_listener.js)

```javascript
/**
 * Workflow Archive Matter Delete Listener
 *
 * @file arc_matter_delete_listener.js
 * @description Listener program executed when an archive matter is deleted.
 *              Do not start a DB transaction within this program.
 */

/**
 * Executes the archive matter deletion process.
 *
 * @param {String} loginGroupId - Login group ID
 * @param {String} localeId - Locale ID
 * @param {String} systemMatterId - System matter ID
 * @param {String} userDataId - User data ID
 * @param {String} archiveMonth - Archive year-month (yyyyMM format)
 * @return {Object} Processing result
 */
function execute(loginGroupId, localeId, systemMatterId, userDataId, archiveMonth) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic(systemMatterId, userDataId, archiveMonth);
    } catch (e) {
        logger.error('[arcMatterDelete] An error occurred. systemMatterId={}, archiveMonth={}, error={}', systemMatterId, archiveMonth, e.message);
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
 * @param {String} archiveMonth - Archive year-month (yyyyMM format)
 */
function processBusinessLogic(systemMatterId, userDataId, archiveMonth) {
    // TODO: Implement business logic for archive matter deletion here
    //
    // Main use cases:
    //   - Delete data in custom tables linked to the matter
    //   - Notify external systems of the deletion
    //   - Clean up related resources such as attachments
    //
    // archiveMonth is the archive year-month (yyyyMM format)
    //   - Can be used to identify partitions in archive matter tables
}
```

---

## Available Templates

- **Archive Matter Delete Listener**: [assets/simple-arc-matter-delete-listener.md](assets/simple-arc-matter-delete-listener.md)
  - Listener processing executed when an archive matter is deleted
  - Arguments are passed as individual values, not as a `parameter` object
  - The difference from other delete listeners is the additional `archiveMonth` (archive year-month) argument
  - Do not start a DB transaction

### Generation Instruction Examples

When a user requests "Create a workflow archive matter delete listener", use the code in these assets as a reference and generate appropriately customized code.
