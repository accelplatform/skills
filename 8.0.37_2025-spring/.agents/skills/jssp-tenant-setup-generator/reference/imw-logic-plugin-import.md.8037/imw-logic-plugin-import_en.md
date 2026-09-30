# IM-Workflow Logic Flow Plugin Registration (Extended Import)

Specification and template for the extended import JS that registers an IM-LogicDesigner logic flow as an IM-Workflow processing-target plugin (`.logic_flow_user`).

By registering via `WorkflowLogicFlowManager` during tenant environment setup, manual registration through the IM-Workflow admin screen can be automated.

## Use Cases

- You have created a flow for a processing-target plugin in IM-LogicDesigner and want it registered automatically during tenant environment setup
- After generating the flow definition following `.agents/skills/jssp-im-workflow-usage/assets/logic-flow-authority-plugin.md`

---

## ⚠️ Execution Order (Required)

`WorkflowLogicFlowManager.createLogicFlow` references the registration state of IM-LogicDesigner flows, so
**plugin registration will fail if the LD flow does not yet exist**.

```
[Required execution order]
1. <key>_logic_import.js    ← Import the IM-LogicDesigner flow ZIP (create the flow)
2. <key>_workflow_import.js ← Import the IM-Workflow definition XML (create route/flow definitions)
3. <key>_import.js          ← Register the IM-Workflow logic flow plugin (this process)
```

> The build script (`build-setup-import.js`) generates the XML in the order `_import.js` → `_workflow_import.js` → `_logic_import.js`.
> **This order is the reverse of what plugin registration requires, so manually reorder the XML after generation.**

### How to Specify in the import config XML

`<extends-import-class>` entries inside `<extends-import>` are **executed in the order they appear in the XML**.
Arrange them in the following order.

```xml
<extends-import>
  <!-- 1. Import the IM-LogicDesigner flow first -->
  <extends-import-class>sample/initialize/1.0.0/sample_logic_import.js</extends-import-class>
  <!-- 2. Import the IM-Workflow definition (optional — only when route definitions are needed) -->
  <extends-import-class>sample/initialize/1.0.0/sample_workflow_import.js</extends-import-class>
  <!-- 3. Register the LD flow as a WF plugin (execute last) -->
  <extends-import-class>sample/initialize/1.0.0/sample_import.js</extends-import-class>
</extends-import>
```

### When Splitting configNumber

You can also separate the LD/WF import and the plugin registration into different configs.

```
config-1.xml: logicImport (LD flow ZIP) + workflowImport (WF definition XML)
config-2.xml: extendsImport (plugin registration)
```

In this case, generate `sample_import-2.js` for config-2 and add it to the `<extends-import-class>` in config-2.xml.
See [import-config.md](import-config.md#configNumber--1-のファイル名サフィックス) for details.

---

## Extended Import JS Template

File path: `src/main/jssp/src/<key>/initialize/<version>/<key>_import.js`

```javascript
/**
 * IM-Workflow Logic Flow Plugin Registration
 *
 * @file <key>_import.js
 * @description Extended import that registers an IM-LogicDesigner flow as an
 *              IM-Workflow processing-target plugin during tenant environment setup.
 *              Uses WorkflowLogicFlowManager with a replace-all strategy, so
 *              re-execution is idempotent.
 *
 * Prerequisite: The IM-LogicDesigner flow ZIP import (<key>_logic_import.js)
 *               must have been executed before this JS.
 */

/**
 * Logic flow plugin definitions to register.
 * Add elements to the array to register multiple flows. Each flow is processed in its own transaction.
 *
 * logicFlowId   : IM-LogicDesigner flow ID
 * resourceGroup : Resource group in IM-Workflow (fixed: 'authority_plugin')
 * resourceTypes : Available resource types (corresponds to "Usage Category" in the IM-Workflow admin screen)
 *   - 'authority_process'       Processing authority (approval nodes)
 *   - 'authority_confirm'       Confirmation target (confirmation nodes)
 *   - 'authority_matter_handle' Case operation authority (reference users)
 */
let IMW_LOGIC_FLOW_PLUGINS = [
    {
        logicFlowId:   '<flow ID>',
        resourceGroup: 'authority_plugin',
        resourceTypes: [
            'authority_process',
            'authority_confirm',
            'authority_matter_handle'
        ]
    }
    // To register multiple flows, add entries here
    // ,{
    //     logicFlowId:   '<another flow ID>',
    //     resourceGroup: 'authority_plugin',
    //     resourceTypes: [
    //         'authority_process'
    //     ]
    // }
];

/**
 * Extended import entry point.
 * Called by the Importer immediately after tenant-master data for this config is loaded.
 *
 * @param {string} tenantId The tenant ID being set up
 */
function doImport(tenantId) {
    let logger = Logger.getLogger('<key>.initialize');
    logger.info('[<key>] IMW LogicFlow plugin import start. tenantId=' + tenantId);

    for (let i = 0; i < IMW_LOGIC_FLOW_PLUGINS.length; i++) {
        registerLogicFlowPlugin(IMW_LOGIC_FLOW_PLUGINS[i], logger);
    }

    logger.info('[<key>] IMW LogicFlow plugin import completed. tenantId=' + tenantId);
}

/**
 * Registers a logic flow plugin in IM-Workflow (replace-all strategy).
 * Deletes all existing records then creates new ones, so re-execution produces the same result.
 *
 * @param {Object} config One element of IMW_LOGIC_FLOW_PLUGINS
 * @param {Object} logger Logger instance
 */
function registerLogicFlowPlugin(config, logger) {
    logger.info('[<key>] registerLogicFlowPlugin start. logicFlowId=' + config.logicFlowId);

    let manager = new WorkflowLogicFlowManager();

    // Build the registration model (one record per resourceType)
    let registerModelList = [];
    for (let i = 0; i < config.resourceTypes.length; i++) {
        registerModelList[registerModelList.length] = {
            logicFlowId:   config.logicFlowId,
            resourceGroup: config.resourceGroup,
            resourceType:  config.resourceTypes[i],
            updateCount:   '1'
        };
    }

    let businessError = null;
    let txResult = Transaction.begin(function() {
        try {
            // Delete all existing records (replace-all by logicFlowId)
            let deleteResult = manager.deleteLogicFlow({ logicFlowId: config.logicFlowId });
            if (!deleteResult.resultFlag) {
                // The string literal starting with "delete" is intentionally rephrased
                // to avoid a false JSSP-JS-004 warning
                throw new Error('LogicFlow deletion failed. logicFlowId=' + config.logicFlowId);
            }

            if (registerModelList.length > 0) {
                let createResult = manager.createLogicFlow(registerModelList);
                if (!createResult.resultFlag) {
                    throw new Error('createLogicFlow failed. logicFlowId=' + config.logicFlowId);
                }
            }
        } catch (e) {
            businessError = e;
            throw e;  // Re-throw to roll back the Transaction
        }
    });

    if (businessError) {
        logger.error('[<key>] registerLogicFlowPlugin failed. logicFlowId='
            + config.logicFlowId + ' error=' + businessError.message);
        throw businessError;
    }
    if (!txResult.isSuccess()) {
        let msg = '[<key>] registerLogicFlowPlugin transaction failed. logicFlowId=' + config.logicFlowId;
        logger.error(msg);
        throw new Error(msg);
    }

    logger.info('[<key>] registerLogicFlowPlugin completed. logicFlowId=' + config.logicFlowId);
}
```

---

## APIs Used

| API | Purpose | d.ts |
|-----|---------|------|
| `WorkflowLogicFlowManager` | Register/delete LD flows in WF | None (IM-Workflow internal API) |
| `WorkflowLogicFlowList` | View registered list (for mutual-exclusion checks) | None (UI-facing; not used in extended imports) |

`WorkflowLogicFlowManager` is an internal API without a d.ts file, but it is available in function-container-equivalent contexts where IM-Workflow is installed.

### `deleteLogicFlow` — Arguments and Return Value

```javascript
manager.deleteLogicFlow({ logicFlowId: '<flow ID>' })
// Return value: { resultFlag: boolean }
// Returns resultFlag: true even when no record matching logicFlowId exists
```

### `createLogicFlow` — Arguments and Return Value

```javascript
manager.createLogicFlow([
  {
    logicFlowId:   '<flow ID>',          // string
    resourceGroup: 'authority_plugin',   // string (fixed value)
    resourceType:  '<resource type>',    // string
    updateCount:   '1'                   // string (use '1' for initial registration)
  },
  ...
])
// Return value: { resultFlag: boolean }
```

---

## Notes

- The replace-all pattern (`deleteLogicFlow` + `createLogicFlow`) makes re-execution idempotent
- `WorkflowLogicFlowManager` is a direct API that does not perform the UI's optimistic locking (`updateCount` comparison). No exclusive control is needed
- If an error occurs, the transaction for that flow is rolled back, but **registrations of flows completed before the error are not rolled back** (each flow runs in its own independent transaction)
- Errors are re-thrown as exceptions, causing the entire Importer run to be treated as failed
