# imWorkflow.modal.showTemporarySave API Reference

The IM-Workflow process modal API. Launches the IM-Workflow standard temporary save modal on the client side.

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

### `imWorkflow.modal.showTemporarySave(parameter)`

Opens the temporary save modal.

**Return value**: `Promise<{ isProcessDone: boolean, data: { userDataId: string } }>`

#### Parameters

```javascript
imWorkflow.modal.showTemporarySave({
  processParameter: {
    flowId:         '',        // 新規一時保存時に必要（更新時は不要）
    userDataId:     '',        // 既存一時保存の更新時に指定
    matterName:     '',        // 案件名（200 バイト以内）
    applyBaseDate:  '',        // 申請基準日（省略時は当日）
    applyAuthUserCd: '',       // 代理申請者ユーザコード
    processComment: '',        // 処理コメント（2000 バイト以内）
    interfaceControl: {}       // フィールド表示・編集制御
  },
  optionalParameter: {
    userParameter: {}          // アクション処理に渡す業務データ
  },
  rebootModal: false           // モーダルを閉じたときに入力内容を破棄するか
});
```

#### processParameter

| Parameter | Type | Required | Description |
|-----------|-----|------|------|
| `flowId` | string | △ | Flow ID. Required for a new temporary save. Not needed when `userDataId` is present |
| `userDataId` | string | △ | User data ID of an existing temporary save. Specify when updating an existing temporary save |
| `matterName` | string | - | Matter name (up to 200 bytes) |
| `applyBaseDate` | Date or string | - | Apply base date. When omitted, the current date is used |
| `applyAuthUserCd` | string | - | User code of the proxy applicant |
| `processComment` | string | - | Process comment (up to 2000 bytes) |
| `interfaceControl` | Object | - | Display / edit / required control for fields |

#### interfaceControl

| Field name | Controllable attributes |
|------------|--------------|
| `matterName` | `display`, `readonly` |
| `applyBaseDate` | `display` |
| `applyAuthUserCd` | `display` |
| `processComment` | `display`, `readonly`, `required` |

```javascript
interfaceControl: {
  processComment: { display: true, readonly: false, required: true }
}
```

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
| `isProcessDone` | boolean | `true`: the temporary save completed / `false`: the user closed the modal |
| `data.userDataId` | string | The user data ID that was temporarily saved (valid only when `isProcessDone` is `true`) |

## Usage Example

```javascript
document.getElementById('tempsave-button').addEventListener('click', async () => {
  if (!validateCurrentStep()) { return; }

  const result = await imWorkflow.modal.showTemporarySave({
    processParameter: {
      flowId:     $data.result.flowId || '',
      userDataId: $data.result.userDataId || '',
      matterName: '申請下書き_' + document.getElementById(':field1:').value
    },
    optionalParameter: {
      userParameter: {
        field1: document.getElementById(':field1:').value,
        field2: document.getElementById(':field2:').value
      }
    },
    rebootModal: false
  });

  if (result && result.isProcessDone) {
    // 次回アクセス時に同じ下書きを再編集できるよう、userDataId を保持する
    imuiShowSuccessMessage('一時保存が完了しました。');
  }

  // 処理モーダルを閉じた後のページ遷移（完了・キャンセルどちらの場合も呼び出す）
  imWorkflow.transition.afterProcess();
});
```

## Choosing Between `flowId` and `userDataId`

| Operation | flowId | userDataId |
|------|--------|-----------|
| New temporary save | Required | Empty string or omitted |
| Update an existing temporary save | Optional | Required (the return value from the previous save) |

## About `imWorkflow.transition.afterProcess()`

After the temporary save modal closes (in both the completed and canceled cases), always call `imWorkflow.transition.afterProcess()`. It executes the IM-Workflow standard page transition processing (such as returning to the task list).

Unlike `showApply()`, a temporary save often returns to the task list once it completes, so `afterProcess()` is important here.

## Notes

- `imWorkflow.modal.showTemporarySave()` is a client-side API. It cannot be used on the server side (SSJS / Rhino)
- If you keep the `data.userDataId` from an `isProcessDone: true` result, the same draft can be re-edited on the next access
- You cannot pass `userDataId` when calling `showApply()`. The feature to convert a temporary save into a formal application is provided inside the `showApply()` modal
