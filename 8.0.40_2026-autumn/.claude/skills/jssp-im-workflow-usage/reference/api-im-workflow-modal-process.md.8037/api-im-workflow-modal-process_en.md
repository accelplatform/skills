# imWorkflow.modal.showProcess API Reference

The IM-Workflow process modal API. Launches the IM-Workflow standard process (approve, deny, send back, etc.) modal on the client side.

## Import

Add the following inside the screen's `<imart type="head">`. The `defer` attribute is required.

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

Also add the meta tag for the secure token in the following format. Note that the `name` form does not work.

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## Method

### `imWorkflow.modal.showProcess(parameter)`

Opens the process (approve, deny, send back, etc.) modal.

**Return value**: `Promise<{ isProcessDone: boolean }>`

#### Parameters

```javascript
imWorkflow.modal.showProcess({
  processParameter: {
    systemMatterId:        '',   // System matter ID
    nodeId:                '',   // Node ID
    processType:           [],   // Array of process types (determined automatically when omitted)
    matterName:            '',   // Matter name
    authUserDepartmentInfo: {},  // Department information of the authorized user
    priorityLevel:         '',   // Priority
    processComment:        '',   // Initial value of the process comment
    branchSelects:         [],   // Branch selection information
    sendBackNodeIds:       [],   // Send-back destination node ID
    dynamicNodeConfigs:    [],   // Dynamic node settings
    confirmNodeConfigs:    [],   // Confirmation node settings
    horizontalNodeConfigs: [],   // Horizontal node settings
    verticalNodeConfigs:   [],   // Vertical node settings
    interfaceControl:      {}    // Field display/edit control
  },
  optionalParameter: {
    userParameter: {}            // Business data passed to the action processing
  },
  rebootModal: false
});
```

#### processParameter (main parameters)

| Parameter | Type | Required | Description |
|-----------|-----|------|------|
| `systemMatterId` | string | - | System matter ID. Identifies the matter to be processed |
| `nodeId` | string | - | Node ID. Identifies the node to be processed |
| `processType` | string[] | - | Array of process types. When omitted, determined automatically per the flow definition |
| `matterName` | string | - | Matter name |
| `authUserDepartmentInfo` | Object | - | Authorizer's affiliated organization information |
| `priorityLevel` | string | - | Priority level |
| `processComment` | string | - | Initial value of the process comment (up to 2000 bytes) |
| `branchSelects` | Object[] | - | Branch selection information |
| `sendBackNodeIds` | string[] | - | List of node IDs selectable as send-back targets |
| `interfaceControl` | Object | - | Display / edit / required control for fields |

#### authUserDepartmentInfo

| Parameter | Type | Required | Description |
|-----------|-----|------|------|
| `companyCd` | string | ✓ | Company code |
| `departmentSetCd` | string | ✓ | Organization set code |
| `departmentCd` | string | ✓ | Organization code |

#### interfaceControl

| Field name | Controllable attributes |
|------------|--------------|
| `matterNumber` | `display` |
| `matterName` | `display`, `readonly` |
| `applyBaseDate` | `display` |
| `applyDate` | `display` |
| `applyAuthUserCd` | `display` |
| `authUserDepartmentInfo` | `display` |
| `priorityLevel` | `display`, `readonly` |
| `processComment` | `display`, `readonly`, `required` |

#### optionalParameter

| Parameter | Type | Description |
|-----------|-----|------|
| `userParameter` | Object | Business data passed to the action process as `userParam` |
| `formaParam.items` | Object | Forma integration parameter |

#### rebootModal

| Value | Behavior |
|----|------|
| `false` (default) | Keeps the entered content on the content screen even after the modal is closed |
| `true` | Discards the entered content when the modal is closed |

#### Return value

| Property | Type | Description |
|-----------|-----|------|
| `isProcessDone` | boolean | `true`: the process completed / `false`: the user closed the modal |

## Usage Example

```javascript
document.getElementById('process-button').addEventListener('click', async () => {

  const result = await imWorkflow.modal.showProcess({
    processParameter: {
      systemMatterId: $data.result.systemMatterId,
      nodeId:         $data.result.nodeId,
      interfaceControl: {
        processComment: { display: true, required: true }
      }
    },
    optionalParameter: {
      userParameter: {
        reviewNote: document.getElementById(':review-note:').value
      }
    },
    rebootModal: false
  });

  // Page transition after processing (call it on both completion and cancel)
  imWorkflow.transition.afterProcess();
});
```

## About `imWorkflow.transition.afterProcess()`

After the process modal closes (in both the completed and canceled cases), always call `imWorkflow.transition.afterProcess()`. It executes the IM-Workflow standard page transition processing (such as returning to the task list).

## Notes

- `imWorkflow.modal.showProcess()` is a client-side API. It cannot be used on the server side (SSJS / Rhino)
- `systemMatterId` and `nodeId` must be obtained from URL parameters, etc.
- When `processType` is omitted, all process types permitted by the flow definition are displayed in the modal
- Place a "Back" button in the header of the process screen, and on click return to the calling screen with `imWorkflow.transition.returnTo()`. Delegate the transition after the processing modal closes to `imWorkflow.transition.afterProcess()`
