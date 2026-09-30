# imWorkflow.modal.showConfirm API Reference

IM-Workflow process modal API. Launches the IM-Workflow standard confirm modal from the client side.

## Import

Add the following inside the `<imart type="head">` of the screen. The `defer` attribute is required.

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

Also add the secure token meta tag in the following form. Note that the `name` form does not work.

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## Method

### `imWorkflow.modal.showConfirm(parameter)`

Opens the confirm modal.

**Return value**: `Promise<{ isProcessDone: boolean }>`

#### Parameters

```javascript
imWorkflow.modal.showConfirm({
  processParameter: {
    systemMatterId:        '',   // System matter ID
    nodeId:                '',   // Node ID
    authUserDepartmentInfo: {},  // Authorizer's affiliated organization information
    confirmComment:        '',   // Initial value of the confirm comment
    interfaceControl:      {}    // Field display / edit control
  },
  optionalParameter: {
    userParameter: {}            // Business data passed to action processing
  },
  rebootModal: false
});
```

#### processParameter

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `systemMatterId` | string | - | System matter ID. Identifies the matter to be confirmed |
| `nodeId` | string | - | Node ID. Identifies the node to be confirmed |
| `authUserDepartmentInfo` | Object | - | Authorizer's affiliated organization information |
| `confirmComment` | string | - | Initial value of the confirm comment (within 2000 bytes) |
| `interfaceControl` | Object | - | Field display / edit / required control |

#### authUserDepartmentInfo

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `companyCd` | string | ✓ | Company code |
| `departmentSetCd` | string | ✓ | Organization set code |
| `departmentCd` | string | ✓ | Organization code |

#### interfaceControl

For each of the following fields, you can set `display` (display control), `readonly` (read-only), and `required` (required).

| Field name | Controllable attributes |
|------------|-------------------------|
| `matterNumber` | `display` |
| `matterName` | `display`, `readonly` |
| `applyBaseDate` | `display` |
| `applyDate` | `display` |
| `applyAuthUserCd` | `display` |
| `authUserDepartmentInfo` | `display` |
| `priorityLevel` | `display`, `readonly` |
| `confirmComment` | `display`, `readonly`, `required` |

```javascript
interfaceControl: {
  confirmComment: { display: true, readonly: false, required: true }
}
```

#### optionalParameter

| Parameter | Type | Description |
|-----------|------|-------------|
| `userParameter` | Object | Business data passed to action processing as `userParam` |
| `formaParam.items` | Object | Forma integration parameter |

#### rebootModal

| Value | Behavior |
|-------|----------|
| `false` (default) | Keeps the entered content on the content screen even after the modal is closed |
| `true` | Discards the entered content when the modal is closed |

#### Return value

| Property | Type | Description |
|----------|------|-------------|
| `isProcessDone` | boolean | `true`: the confirmation is complete / `false`: the user closed the modal |

## Usage example

```javascript
document.getElementById('confirm-button').addEventListener('click', async () => {

  const result = await imWorkflow.modal.showConfirm({
    processParameter: {
      systemMatterId: $data.result.systemMatterId,
      nodeId:         $data.result.nodeId,
      interfaceControl: {
        confirmComment: { display: true, required: false }
      }
    },
    optionalParameter: {
      userParameter: {
        reviewNote: document.getElementById(':review-note:').value
      }
    },
    rebootModal: false
  });

  // Page transition after processing (call this whether completed or canceled)
  imWorkflow.transition.afterProcess();
});
```

## About `imWorkflow.transition.afterProcess()`

After the confirm modal is closed (whether completed or canceled), always call `imWorkflow.transition.afterProcess()`. It executes the IM-Workflow standard page transition processing (returning to the task list, etc.).

## Notes

- `imWorkflow.modal.showConfirm()` is a client-side API. It cannot be used on the server side (SSJS / Rhino)
- `systemMatterId` and `nodeId` must be obtained from URL parameters, etc.
- Do not place your own "Back" button on the confirm screen. Delegate the transition to `imWorkflow.transition.afterProcess()`
- Unlike `showProcess()`, there is no `processType` specification (confirmation is a single action)
