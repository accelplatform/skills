# imWorkflow.modal.showConfirm API 参考

IM-Workflow 的处理模态框 API。从客户端启动 IM-Workflow 的标准确认模态框。

## 导入

在画面的 `<imart type="head">` 内编写以下内容。`defer` 属性为必填。

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

另外，以下列形式编写安全令牌用的 meta 标签。注意 `name` 形式无法工作。

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## 方法

### `imWorkflow.modal.showConfirm(parameter)`

打开确认模态框。

**返回值**: `Promise<{ isProcessDone: boolean }>`

#### 参数

```javascript
imWorkflow.modal.showConfirm({
  processParameter: {
    systemMatterId:        '',   // 系统案件 ID
    nodeId:                '',   // 节点 ID
    authUserDepartmentInfo: {},  // 权限者所属组织信息
    confirmComment:        '',   // 确认评论的初始值
    interfaceControl:      {}    // 字段显示・编辑控制
  },
  optionalParameter: {
    userParameter: {}            // 传递给操作处理的业务数据
  },
  rebootModal: false
});
```

#### processParameter

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `systemMatterId` | string | - | 系统案件 ID。用于确定确认对象的案件 |
| `nodeId` | string | - | 节点 ID。用于确定确认对象的节点 |
| `authUserDepartmentInfo` | Object | - | 权限者所属组织信息 |
| `confirmComment` | string | - | 确认评论的初始值（2000 字节以内） |
| `interfaceControl` | Object | - | 字段的显示・编辑・必填控制 |

#### authUserDepartmentInfo

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `companyCd` | string | ✓ | 公司代码 |
| `departmentSetCd` | string | ✓ | 组织集代码 |
| `departmentCd` | string | ✓ | 组织代码 |

#### interfaceControl

可对以下各字段分别设置 `display`（显示控制）、`readonly`（只读）、`required`（必填）。

| 字段名 | 可控制的属性 |
|--------|------------|
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

| 参数 | 类型 | 说明 |
|------|------|------|
| `userParameter` | Object | 作为 `userParam` 传递给操作处理的业务数据 |
| `formaParam.items` | Object | Forma 联动参数 |

#### rebootModal

| 值 | 行为 |
|----|------|
| `false`（默认） | 即使关闭模态框，也将输入内容保持在内容画面上 |
| `true` | 关闭模态框时丢弃输入内容 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isProcessDone` | boolean | `true`：确认已完成 / `false`：用户关闭了模态框 |

## 使用示例

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

  // 处理完成后的页面跳转（完成・取消任一情况下都调用）
  imWorkflow.transition.afterProcess();
});
```

## 关于 `imWorkflow.transition.afterProcess()`

确认模态框关闭后（完成・取消任一情况下），务必调用 `imWorkflow.transition.afterProcess()`。它执行 IM-Workflow 的标准页面跳转处理（返回任务列表等）。

## 注意事项

- `imWorkflow.modal.showConfirm()` 是客户端的 API。无法在服务端（SSJS / Rhino）中使用
- `systemMatterId` 和 `nodeId` 需要从 URL 参数等处获取
- 请勿在确认画面上放置自己的「返回」按钮。请将跳转委托给 `imWorkflow.transition.afterProcess()`
- 与 `showProcess()` 不同，没有 `processType` 的指定（确认处理是单一操作）
