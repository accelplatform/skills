# Workflow Action Process Template

## Overview

Template for IM-Workflow action process programs.
This is a batch-like process with no UI that is executed at each workflow processing timing (application, approval, denial, send-back, etc.).
Each function receives `parameter` (workflow parameter) and `userParam` (user data) and returns a processing result.

**Note**: Do not start a DB transaction within this program.

## File Structure

```
src/main/jssp/src/{feature-name}/workflow/
  └── action/
      └── action_process.js     # Action process
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
| parameter | String | Execution program path |
| actFlag | String | Proxy flag |
| nodeId | String | Node ID |
| nextNodeIds | String | Destination node ID (set during send-back, pull-back, or matter operation) |
| authUserCd | String | Processing authority user code |
| execUserCd | String | Processing executor user code |
| resultStatus | String | Processing result status |
| authCompanyCode | String | Authority company code |
| authOrgzSetCode | String | Authority organization set code |
| authOrgzCode | String | Authority organization code |
| processComment | String | Processing comment |
| lumpProcessFlag | String | Bulk processing flag |
| autoProcessFlag | String | Auto-processing flag (set during auto approval or batch auto processing) |
| DCNodeConfigModels | Object | Dynamic/confirmation node configuration info (set during application/re-application/approval from unapplied state) |
| HVNodeConfigModels | Object | Horizontal/vertical node configuration info (set during application/re-application/approval from unapplied state) |
| branchSelectModels | Object | Branch destination selection info (set during application/re-application/approval from unapplied state) |

## Return Values

| Property | Type | Description |
|-----------|------|------|
| resultFlag | Boolean | Result flag (`true`: success / `false`: failure) |
| message | String | Result message (only on failure) |
| data | String | Matter number (max 20 bytes; application/re-application only; overwrites matter number if not `null`) |

## Function List

| Function Name | Processing Timing | data Return |
|--------|--------------|-----------|
| apply | Application | Yes (matter number can be overwritten) |
| reapply | Re-application | Yes |
| applyFromTempSave | Application (temporary save matter) | Yes |
| applyFromUnapply | Application (unapplied state matter) | Yes |
| approve | Approval | No |
| approveEnd | Approval end | No |
| deny | Denial | No |
| sendBack | Send-back | No |
| pullBack | Pull-back | No |
| sendBackToPullBack | Pull-back after send-back | No |
| discontinue | Discontinue | No |
| reserve | Reserve (hold) | No |
| reserveCancel | Cancel reserve | No |
| matterHandle | Matter operation | No |
| tempSaveCreate | Temporary save (new) | No |
| tempSaveUpdate | Temporary save (update) | No |
| tempSaveDelete | Temporary save (delete) | No |

---

## Action Process (action_process.js)

```javascript
/**
 * Workflow Action Process
 *
 * @file action_process.js
 * @description Action process program executed at each workflow processing timing.
 *              Do not start a DB transaction within this program.
 */

// ========================================
// Application
// ========================================
/**
 * Executes the application process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function apply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[apply] Application process started systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('apply', parameter, userParam);
        logger.info('[apply] Application process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[apply] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the re-application process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function reapply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[reapply] Re-application process started systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('reapply', parameter, userParam);
        logger.info('[reapply] Re-application process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[reapply] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the application process (from temporary save matter).
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function applyFromTempSave(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[applyFromTempSave] Application (temporary save matter) process started systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('applyFromTempSave', parameter, userParam);
        logger.info('[applyFromTempSave] Application (temporary save matter) process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[applyFromTempSave] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the application process (from unapplied state matter).
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function applyFromUnapply(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: '',
        data: null
    };
    logger.info('[applyFromUnapply] Application (unapplied state matter) process started systemMatterId={}', parameter.systemMatterId);
    try {
        result.data = createMatterNumber();
        processBusinessLogic('applyFromUnapply', parameter, userParam);
        logger.info('[applyFromUnapply] Application (unapplied state matter) process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[applyFromUnapply] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Generates a matter number.
 *
 * @return {String} Matter number
 */
function createMatterNumber() {
    let result = WorkflowNumberingManager.getNumber();
    if (!result.resultFlag) {
        throw new Error('Failed to generate matter number.');
    }

    return result.data;
}

// ========================================
// Approval
// ========================================
/**
 * Executes the approval process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function approve(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('approve', parameter, userParam);
    } catch (e) {
        logger.error('[approve] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the approval end process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function approveEnd(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('approveEnd', parameter, userParam);
    } catch (e) {
        logger.error('[approveEnd] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the denial process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function deny(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('deny', parameter, userParam);
    } catch (e) {
        logger.error('[deny] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the send-back process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function sendBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('sendBack', parameter, userParam);
    } catch (e) {
        logger.error('[sendBack] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Pull-back
// ========================================
/**
 * Executes the pull-back process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function pullBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('pullBack', parameter, userParam);
    } catch (e) {
        logger.error('[pullBack] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the pull-back after send-back process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function sendBackToPullBack(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('sendBackToPullBack', parameter, userParam);
    } catch (e) {
        logger.error('[sendBackToPullBack] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Discontinue / Reserve
// ========================================
/**
 * Executes the discontinue process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function discontinue(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('discontinue', parameter, userParam);
    } catch (e) {
        logger.error('[discontinue] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the reserve (hold) process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function reserve(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('reserve', parameter, userParam);
    } catch (e) {
        logger.error('[reserve] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the cancel reserve process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function reserveCancel(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('reserveCancel', parameter, userParam);
    } catch (e) {
        logger.error('[reserveCancel] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Matter Operation
// ========================================
/**
 * Executes the matter operation process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function matterHandle(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('matterHandle', parameter, userParam);
    } catch (e) {
        logger.error('[matterHandle] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

// ========================================
// Temporary Save
// ========================================
/**
 * Executes the temporary save (new) process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function tempSaveCreate(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };
    logger.info('[tempSaveCreate] Temporary save (new) process started systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('tempSaveCreate', parameter, userParam);
        logger.info('[tempSaveCreate] Temporary save (new) process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[tempSaveCreate] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the temporary save (update) process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function tempSaveUpdate(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };
    logger.info('[tempSaveUpdate] Temporary save (update) process started systemMatterId={}', parameter.systemMatterId);
    try {
        processBusinessLogic('tempSaveUpdate', parameter, userParam);
        logger.info('[tempSaveUpdate] Temporary save (update) process completed systemMatterId={}', parameter.systemMatterId);
    } catch (e) {
        logger.error('[tempSaveUpdate] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
        result.resultFlag = false;
        result.message = e.message;
    }

    return result;
}

/**
 * Executes the temporary save (delete) process.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 * @return {Object} Processing result
 */
function tempSaveDelete(parameter, userParam) {
    let logger = Logger.getLogger();
    let result = {
        resultFlag: true,
        message: ''
    };

    try {
        processBusinessLogic('tempSaveDelete', parameter, userParam);
    } catch (e) {
        logger.error('[tempSaveDelete] An error occurred. systemMatterId={}, error={}', parameter.systemMatterId, e.message);
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
 * Called from each action function.
 *
 * @param {String} actionType - Action type
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 */
function processBusinessLogic(actionType, parameter, userParam) {
    // TODO: Implement business logic according to actionType here
    //
    // Available key parameters:
    //   parameter.systemMatterId  - System matter ID
    //   parameter.userDataId      - User data ID
    //   parameter.authUserCd      - Processing authority user code
    //   parameter.execUserCd      - Processing executor user code
    //   parameter.processComment  - Processing comment

    // Save user data to matter property
    saveToMatterProperty(parameter, userParam);
}

/**
 * Saves user data to matter properties.
 *
 * @param {Object} parameter - Workflow parameter
 * @param {Object} userParam - User data
 */
function saveToMatterProperty(parameter, userParam) {
    let matterPropertyInfo = [{
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'partCode',
        matterPropertyValue: userParam.partCode
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'partName',
        matterPropertyValue: userParam.partName
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'unitPrice',
        matterPropertyValue: userParam.unitPrice
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'quantity',
        matterPropertyValue: userParam.quantity
    }, {
        userDataId         : parameter.userDataId,
        matterPropertyKey  : 'totalAmount',
        matterPropertyValue: String(Number(userParam.unitPrice) * Number(userParam.quantity))
    }];

    let property = new UserActvMatterPropertyValue();
    let result = property.createMatterProperty(matterPropertyInfo);
    if (!result.resultFlag) {
        throw new Error('Failed to save matter property.');
    }
}
```

---

## Matter Properties

### Overview

Matter properties are user-defined key-value data associated with a workflow matter.
They are stored in the IM-Workflow managed table `imw_t_user_data` using `userDataId` (user data ID) as the key.

They are registered/updated using the `UserActvMatterPropertyValue` API within the action process (`apply` / `approve`, etc.).

### Purpose

The main purpose of matter properties is **displaying items in the workflow standard list screen**.

To display application data (amounts, subject, applicant's department, etc.) as columns in IM-Workflow's standard list screens (unprocessed list, processed list, matter list, etc.), the data must be saved as matter properties.
Values saved as matter properties can be configured as display columns in the "Matter Property Definition" in the admin screen.

### Criteria for Use

Use matter properties when the following conditions are met:
- When you want to use them in route branch condition evaluations
  - Example: If the total amount exceeds 50,000 yen, separate executive approval is required
  - Example: If it is a business trip expense application with accommodation, separate accounting department approval is required
- When you want to display values as items in the matter list on the application/approval list screen

### Notes

Maximum number of characters for matter property values:
- The `matter_property_value` column is **VARCHAR(2000)** (2000 characters)
- If surrogate pair characters are included, it can be up to approximately 8000 bytes in UTF-8
- In PostgreSQL environments, an error may occur when a matter is completed (when migrating to `imw_t_cpl_matter_user_data`) due to index size limits
- Be mindful of the character count when saving long text to matter properties

### How to Save User Data Without Using Matter Properties

If matter properties are not needed, or if they cannot be used due to character limit constraints, save data directly to a custom table within the action process.
By using `parameter.systemMatterId` or `parameter.userDataId` as a foreign key, data can be retrieved later linked to the matter.

```javascript
function processBusinessLogic(actionType, parameter, userParam) {
    // Example of saving to a custom table
    let db = new TenantDatabase();
    let sql = 'INSERT INTO my_order_data'
            + ' (system_matter_id, user_data_id, part_code, part_name, unit_price, quantity)'
            + ' VALUES (?, ?, ?, ?, ?, ?)';
    let params = [
        DbParameter.string(parameter.systemMatterId),
        DbParameter.string(parameter.userDataId),
        DbParameter.string(userParam.partCode),
        DbParameter.string(userParam.partName),
        DbParameter.number(Number(userParam.unitPrice)),
        DbParameter.number(Number(userParam.quantity))
    ];
    let result = db.execute(sql, params);
    if (result.error) {
        throw new Error('Failed to save data.');
    }
}
```

In this case, for list display, either create a custom screen or search the custom table using `userDataId` as the key from the approval screen to display the data.
Using matter properties and saving user data in a database can be combined.

---

## Available Templates

- **Action Process**: [assets/simple-action.md](assets/simple-action.md)
  - Batch-like processing executed at each workflow processing timing
  - Covers all 17 functions including application, approval, denial, send-back, etc.
  - Do not start a DB transaction

### Generation Instruction Examples

When a user requests "Create a workflow action process", use the code in these assets as a reference and generate appropriately customized code.

### Notes for Generation

#### Function signature must always have 2 arguments `(parameter, userParam)`

All action process functions must be defined with **2 arguments `(parameter, userParam)`**.
The IM-Workflow engine passes workflow parameters as the first argument and form input values (hidden field name/value pairs) as the second argument.

```javascript
// OK: Receives 2 arguments
function apply(parameter, userParam) {
    let vendorId = userParam.vendorId;  // Value from hidden field in the form
}

// NG: 1 argument accessing parameter.userParameter → undefined
function apply(parameter) {
    let vendorId = parameter.userParameter.vendorId;  // Error
}
```

#### `executeByTemplate` parameter keys must match SQL template bind variable names

The bind variable names in the 2WaySQL template (`/*user_data_id*/`, `/*vendor_id*/`, etc.) and the key names in the parameter object passed to `executeByTemplate` must **match exactly**.
If the SQL uses snake_case (`user_data_id`), the JS side must also use snake_case.

```javascript
// OK: Matches SQL's /*user_data_id*/
db.executeByTemplate('/purchase/sql/select_request', {
    user_data_id: DbParameter.string(userDataId)
});

// NG: Passed in camelCase → "user_data_id" is not defined error
db.executeByTemplate('/purchase/sql/select_request', {
    userDataId: DbParameter.string(userDataId)
});
```

#### Matter number generation is required

Even if the specification does not specify a matter number format, use `WorkflowNumberingManager.getNumber()` within the `apply` function to generate a matter number and set it in `result.data`.
Without a matter number, it becomes difficult to identify matters on IM-Workflow list screens.

- `apply` — Generate at the time of new application
- `applyFromTempSave` / `applyFromUnapply` — If delegating to `apply`, generation happens automatically
- `reapply` — Do not generate at re-application (matter number already exists) (`data: null`)

```javascript
function apply(parameter, userParam) {
    let result = { resultFlag: true, message: '', data: null };
    try {
        result.data = createMatterNumber();  // Generate matter number
        // ... business logic ...
    } catch (e) { /* ... */ }
    return result;
}

function createMatterNumber() {
    let result = WorkflowNumberingManager.getNumber();
    if (!result.resultFlag) {
        throw new Error('Failed to generate matter number.');
    }
    return result.data;
}
```

#### All values in userParam are string type

Values in `userParam` (user data passed from the screen form) are **all string type**.
When passing to `DbParameter.number()`, always convert to a number with `Number()` first.
Passing as a string without conversion will cause `IllegalArgumentException: Data must be Number or null in case TYPE_NUMBER specified.`.

```javascript
// NG: userParam values are strings, so DbParameter.number() will throw an exception
DbParameter.number(userParam.unitPrice)

// OK: Convert with Number() before passing
DbParameter.number(Number(userParam.unitPrice))
```

#### Data saving in apply / applyFromUnapply

When INSERTing user data (business table) in the `apply` function, note that **data already exists when re-applying after pull-back (`applyFromUnapply`)**.

- Pull-back: Applicant pulls back the application → Matter returns to "unapplied state"
- Re-application: Re-applying an unapplied matter → **`applyFromUnapply` is called**
- If `applyFromUnapply` delegates to `apply`, the INSERT in `apply` will cause a unique constraint violation

**Solution:** Check for existing data before INSERT in `apply`, and switch between INSERT / UPDATE accordingly.

```javascript
function apply(parameter, userParam) {
    // ...
    saveLeaveRequest(parameter, userParam);  // INSERT or UPDATE
    // ...
}

function saveLeaveRequest(parameter, userParam) {
    let db = new TenantDatabase();
    let checkSql = 'SELECT COUNT(*) AS record_count FROM your_table WHERE user_data_id = ?';
    let checkResult = db.select(checkSql, [DbParameter.string(parameter.userDataId)]);
    let exists = checkResult.isSuccess() && checkResult.data.length > 0 &&
        (parseInt(checkResult.data[0].record_count, 10) || 0) > 0;

    if (exists) {
        updateRecord(parameter, userParam);
    } else {
        insertRecord(parameter, userParam);
    }
}
```
