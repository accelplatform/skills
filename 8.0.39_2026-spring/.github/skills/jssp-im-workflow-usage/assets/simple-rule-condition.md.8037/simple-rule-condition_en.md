# Workflow Branch Condition / Branch Merge Process Template

## Overview

Template for IM-Workflow branch condition and branch merge process programs.
This is a batch-like process with no UI that is automatically executed when a matter arrives at a branch or merge node on the route.
The function `execute(parameter)` is called by the workflow engine.

- **Branch condition**: If the return value `data` is `true`, the route transitions
- **Branch merge**: If the return value `data` is `true`, the branches merge

**Notes**:
- Do not start a DB transaction within this program
- Since branch condition programs are function containers, follow the coding conventions in `.github/instructions/` (use of `let`, naming conventions, etc.)

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── rule/
      └── rule_condition.js     # Branch condition / branch merge process
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
| nodeId | String | Node ID |

## Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | Boolean | Branch: `true` to transition / Merge: `true` to merge |

---

## Branch Condition / Branch Merge Process (rule_condition.js)

```javascript
/**
 * Workflow Branch Condition / Branch Merge Process
 *
 * @file rule_condition.js
 * @description Process program executed when a matter arrives at a branch or merge node on the route.
 *              Do not start a DB transaction within this program.
 */

// ========================================
// Entry Point
// ========================================
/**
 * Executes the branch condition / branch merge process.
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

    try {
        result.data = evaluateCondition(parameter);
    } catch (e) {
        logger.error('[RuleCondition] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Condition Evaluation
// ========================================
/**
 * Evaluates the branch condition.
 *
 * @param {Object} parameter - Workflow parameter
 * @return {Boolean} true: transition (merge) / false: do not transition (do not merge)
 */
function evaluateCondition(parameter) {
    // TODO: Implement branch condition business logic here
    //
    // Available key parameters:
    //   parameter.systemMatterId  - System matter ID
    //   parameter.userDataId      - User data ID
    //   parameter.nodeId          - Node ID

    return true;
}
```

---

## Available Templates

- **Branch Condition / Branch Merge Process**: [assets/simple-rule-condition.md](assets/simple-rule-condition.md)
  - Batch-like processing automatically executed at branch/merge nodes on the route
  - Route transition and merging are controlled by `true`/`false` of `data`
  - Do not start a DB transaction

### Generation Instruction Examples

When a user requests "Create a workflow branch condition process", use the code in these assets as a reference and generate appropriately customized code.
