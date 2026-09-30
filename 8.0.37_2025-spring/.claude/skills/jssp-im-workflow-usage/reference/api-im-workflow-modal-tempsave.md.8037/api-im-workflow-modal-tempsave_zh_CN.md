# imWorkflow.modal.showTemporarySave API 参考

IM-Workflow 的处理模态框 API。在客户端启动 IM-Workflow 的标准临时保存模态框。

## 导入

在画面的 `<imart type="head">` 内写入以下内容。`defer` 属性为必需。

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

此外，以下列格式写入用于安全令牌的 meta 标签。注意 `name` 形式无法工作。

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## 方法

### `imWorkflow.modal.showTemporarySave(parameter)`

打开临时保存模态框。

**返回值**: `Promise<{ isProcessDone: boolean, data: { userDataId: string } }>`

#### 参数

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

| 参数 | 类型 | 必需 | 说明 |
|-----------|-----|------|------|
| `flowId` | string | △ | 流程 ID。新建临时保存时必需。存在 `userDataId` 时则不需要 |
| `userDataId` | string | △ | 已有临时保存的用户数据 ID。更新已有临时保存时指定 |
| `matterName` | string | - | 案件名（最大 200 字节） |
| `applyBaseDate` | Date or string | - | 申请基准日。省略时为当天 |
| `applyAuthUserCd` | string | - | 代理申请者的用户代码 |
| `processComment` | string | - | 处理注释（最大 2000 字节） |
| `interfaceControl` | Object | - | 字段的显示、编辑、必填控制 |

#### interfaceControl

| 字段名 | 可控制的属性 |
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

| 参数 | 类型 | 说明 |
|-----------|-----|------|
| `userParameter` | Object | 作为 `userParam` 传递给动作处理的业务数据 |
| `formaParam.items` | Object | Forma 联动参数 |

#### rebootModal

| 值 | 行为 |
|----|------|
| `false`（默认） | 即使关闭模态框，也在内容画面上保留输入内容 |
| `true` | 关闭模态框时丢弃输入内容 |

#### 返回值

| 属性 | 类型 | 说明 |
|-----------|-----|------|
| `isProcessDone` | boolean | `true`: 临时保存已完成 / `false`: 用户关闭了模态框 |
| `data.userDataId` | string | 临时保存的用户数据 ID（仅当 `isProcessDone` 为 `true` 时有效） |

## 使用示例

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

## `flowId` 与 `userDataId` 的区分使用

| 操作 | flowId | userDataId |
|------|--------|-----------|
| 新建临时保存 | 必需 | 空字符串或省略 |
| 更新已有临时保存 | 可省略 | 必需（上次保存时的返回值） |

## 关于 `imWorkflow.transition.afterProcess()`

临时保存模态框关闭后（无论完成还是取消），务必调用 `imWorkflow.transition.afterProcess()`。它会执行 IM-Workflow 的标准页面跳转处理（如返回任务一览等）。

与 `showApply()` 不同，临时保存完成后多数情况下会返回任务一览，因此 `afterProcess()` 在此处很重要。

## 注意事项

- `imWorkflow.modal.showTemporarySave()` 是客户端 API。无法在服务器端（SSJS / Rhino）使用
- 如果保留 `isProcessDone: true` 时的 `data.userDataId`，下次访问时即可重新编辑同一份草稿
- 调用 `showApply()` 时无法传递 `userDataId`。将临时保存转换为正式申请的功能在 `showApply()` 模态框内提供
