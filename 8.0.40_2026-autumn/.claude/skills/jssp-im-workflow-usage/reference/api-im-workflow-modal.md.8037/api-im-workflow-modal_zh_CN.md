# imWorkflow.modal.showApply API 参考

IM-Workflow 的处理模态框 API。从申请表单在客户端启动 IM-Workflow 的标准申请模态框。

## 导入

在申请画面的 `<imart type="head">` 内编写以下内容。`defer` 属性为必填。

```html
<script src="im_workflow/js/api_base.js" defer></script>
```

另外，以下列形式编写安全令牌用的 meta 标签。注意 `name` 形式无法工作。

```html
<meta http-equiv="X-Intramart-Secure-Token" content="<imart type="imSecureToken" mode="value" />"/>
```

## 方法

### `imWorkflow.modal.showApply(parameter)`

打开申请处理模态框。

**返回值**: `Promise<{ isProcessDone: boolean, data: { matterNumber: string, systemMatterId: string, userDataId: string } }>`

#### 参数

```javascript
imWorkflow.modal.showApply({
  processParameter: {
    flowId:     'flw_my_workflow',  // 流程 ID（必填）
    matterName: '案件名'             // 案件名（必填）
  },
  optionalParameter: {
    userParameter: {                 // 传递给操作处理的业务数据（可选）
      key1: 'value1',
      key2: 'value2'
    }
  }
});
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `processParameter.flowId` | string | ✓ | IM-Workflow 的流程定义 ID |
| `processParameter.matterName` | string | ✓ | 申请案件名（显示在列表・搜索画面中） |
| `optionalParameter.userParameter` | Object | - | 作为 `userParam` 传递给操作处理的业务数据 |

#### 返回值

| 属性 | 类型 | 说明 |
|------|------|------|
| `isProcessDone` | boolean | `true`：申请已完成 / `false`：用户关闭了模态框（取消・临时保存等） |
| `data.matterNumber` | string | 已申请的案件编号（仅当 `isProcessDone` 为 `true` 时有效） |
| `data.systemMatterId` | string | 系统案件 ID |
| `data.userDataId` | string | 用户数据 ID |

#### 使用示例

```javascript
document.getElementById('apply-button').addEventListener('click', async () => {
  // 验证
  if (!validateCurrentStep()) {
    return;
  }

  // 打开处理模态框
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

  // 申请完成时的处理
  if (result && result.isProcessDone) {
    imuiShowSuccessMessage('申請が完了しました。案件番号: ' + result.data.matterNumber);
    clearForm();
  }
});
```

## 与操作处理的联动

设置在 `optionalParameter.userParameter` 中的对象，会作为操作处理（`action_process.js`）各函数的第 2 个参数（`userParam`）传递。

```javascript
// 操作处理侧（action_process.js）
function apply(parameter, userParam) {
  // 可通过 userParam.formCode、userParam.reason 引用业务数据
  saveToMatterProperty(parameter, userParam);
}
```

`userParameter` 的键名必须与操作处理引用的键名完全一致。

## 注意事项

- `imWorkflow.modal.showApply()` 是客户端（浏览器）的 API，无法在服务端（SSJS / Rhino）中使用
- 模态框显示期间，页面操作被阻塞（在 `await` 处 JS 的执行会停止）
- 关闭模态框不会发生异常。只是返回 `isProcessDone: false`
- 用户进行临时保存时，返回 `isProcessDone: false`（临时保存完成为 `false`，仅申请完成为 `true`）
- 安全令牌的 meta 标签请使用 `<meta http-equiv="X-Intramart-Secure-Token">` 形式，而非 `<meta name="im_secure_token">` 形式
- 采用处理模态框方式的申请画面是从 URL 直接访问的独立画面，因此需要在 `routing-jssp-config` XML 中进行路由注册
