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
    systemMatterId:        '',   // システム案件 ID
    nodeId:                '',   // ノード ID
    processType:           [],   // 処理種別の配列（省略時は自動決定）
    matterName:            '',   // 案件名
    authUserDepartmentInfo: {},  // 権限者所属組織情報
    priorityLevel:         '',   // 優先度
    processComment:        '',   // 処理コメントの初期値
    branchSelects:         [],   // 分岐選択情報
    sendBackNodeIds:       [],   // 差戻し先ノード ID
    dynamicNodeConfigs:    [],   // 動的ノード設定
    confirmNodeConfigs:    [],   // 確認ノード設定
    horizontalNodeConfigs: [],   // 水平ノード設定
    verticalNodeConfigs:   [],   // 垂直ノード設定
    interfaceControl:      {}    // フィールド表示・編集制御
  },
  optionalParameter: {
    userParameter: {}            // アクション処理に渡す業務データ
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

  // 処理完了後のページ遷移（完了・キャンセルどちらの場合も呼び出す）
  imWorkflow.transition.afterProcess();
});
```

## About `imWorkflow.transition.afterProcess()`

After the process modal closes (in both the completed and canceled cases), always call `imWorkflow.transition.afterProcess()`. It executes the IM-Workflow standard page transition processing (such as returning to the task list).

## Notes

- `imWorkflow.modal.showProcess()` is a client-side API. It cannot be used on the server side (SSJS / Rhino)
- `systemMatterId` and `nodeId` must be obtained from URL parameters, etc.
- When `processType` is omitted, all process types permitted by the flow definition are displayed in the modal
- Do not place your own "Back" button on the process screen. Delegate the transition to `imWorkflow.transition.afterProcess()`
