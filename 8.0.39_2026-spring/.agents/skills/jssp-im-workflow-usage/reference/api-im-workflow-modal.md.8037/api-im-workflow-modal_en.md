# imWorkflow.modal.showApply API Reference

IM-Workflow process modal API. Launches the IM-Workflow standard apply modal from the client side of an apply form.

## Import

Add the following inside the `<imart type="head">` of the apply screen. The `defer` attribute is required.

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

Also add the secure token meta tag in the following form. Note that the `name` form does not work.

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## Method

### `imWorkflow.modal.showApply(parameter)`

Opens the apply process modal.

**Return value**: `Promise<{ isProcessDone: boolean, data: { matterNumber: string, systemMatterId: string, userDataId: string } }>`

#### Parameters

```javascript
imWorkflow.modal.showApply({
  processParameter: {
    flowId:     'flw_my_workflow',  // Flow ID (required)
    matterName: '案件名'             // Matter name (required)
  },
  optionalParameter: {
    userParameter: {                 // Business data passed to action processing (optional)
      key1: 'value1',
      key2: 'value2'
    }
  }
});
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `processParameter.flowId` | string | ✓ | IM-Workflow flow definition ID |
| `processParameter.matterName` | string | ✓ | Apply matter name (displayed in list / search screens) |
| `optionalParameter.userParameter` | Object | - | Business data passed to action processing as `userParam` |

#### Return value

| Property | Type | Description |
|----------|------|-------------|
| `isProcessDone` | boolean | `true`: the application is complete / `false`: the user closed the modal (cancel, temporary save, etc.) |
| `data.matterNumber` | string | Matter number of the submitted application (valid only when `isProcessDone` is `true`) |
| `data.systemMatterId` | string | System matter ID |
| `data.userDataId` | string | User data ID |

#### Usage example

```javascript
document.getElementById('apply-button').addEventListener('click', async () => {
  // Validation
  if (!validateCurrentStep()) {
    return;
  }

  // Open the process modal
  const result = await imWorkflow.modal.showApply({
    processParameter: {
      flowId:     'flw_my_workflow',
      matterName: 'フォーム申請_' + document.getElementById(':formCode:').value
    },
    optionalParameter: {
      userParameter: {
        formCode:   document.getElementById(':formCode:').value,
        reason:     document.getElementById(':reason:').value
      }
    }
  });

  // Processing when the application is complete
  if (result && result.isProcessDone) {
    imuiShowSuccessMessage('申請が完了しました。案件番号: ' + result.data.matterNumber);
    clearForm();
  }
});
```

## Integration with action processing

The object set in `optionalParameter.userParameter` is passed as the second argument (`userParam`) of each function in the action processing (`action_process.js`).

```javascript
// Action processing side (action_process.js)
function apply(parameter, userParam) {
  // Business data can be referenced via userParam.formCode, userParam.reason
  saveToMatterProperty(parameter, userParam);
}
```

The key names in `userParameter` must exactly match the key names referenced by the action processing.

## Notes

- `imWorkflow.modal.showApply()` is a client-side (browser) API and cannot be used on the server side (SSJS / Rhino)
- While the modal is displayed, page operations are blocked (JS execution stops at `await`)
- Closing the modal does not throw an exception. It simply returns `isProcessDone: false`
- When the user performs a temporary save, `isProcessDone: false` is returned (temporary save completion is `false`; only application completion is `true`)
- For the secure token meta tag, use the `<meta http-equiv="X-Intramart-Secure-Token">` form, not the `<meta name="im_secure_token">` form
- An apply screen using the process modal approach is a standalone screen accessed directly from a URL, so it must be registered for routing in the `routing-jssp-config` XML
