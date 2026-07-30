# imWorkflow.modal.showProcess API 参考

IM-Workflow 的处理模态框 API。在客户端启动 IM-Workflow 的标准处理（审批、否决、退回等）模态框。

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

### `imWorkflow.modal.showProcess(parameter)`

打开处理（审批、否决、退回等）模态框。

**返回值**: `Promise<{ isProcessDone: boolean }>`

#### 参数

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

#### processParameter（主要参数）

| 参数 | 类型 | 必需 | 说明 |
|-----------|-----|------|------|
| `systemMatterId` | string | - | 系统案件 ID。用于确定处理对象的案件 |
| `nodeId` | string | - | 节点 ID。用于确定处理对象的节点 |
| `processType` | string[] | - | 处理种别的数组。省略时按流程定义自动决定 |
| `matterName` | string | - | 案件名 |
| `authUserDepartmentInfo` | Object | - | 权限者所属组织信息 |
| `priorityLevel` | string | - | 优先级 |
| `processComment` | string | - | 处理注释的初始值（2000 字节以内） |
| `branchSelects` | Object[] | - | 分支选择信息 |
| `sendBackNodeIds` | string[] | - | 可选为退回目标的节点 ID 一览 |
| `interfaceControl` | Object | - | 字段的显示、编辑、必填控制 |

#### authUserDepartmentInfo

| 参数 | 类型 | 必需 | 说明 |
|-----------|-----|------|------|
| `companyCd` | string | ✓ | 公司代码 |
| `departmentSetCd` | string | ✓ | 组织集代码 |
| `departmentCd` | string | ✓ | 组织代码 |

#### interfaceControl

| 字段名 | 可控制的属性 |
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
| `isProcessDone` | boolean | `true`: 处理已完成 / `false`: 用户关闭了模态框 |

## 使用示例

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

## 关于 `imWorkflow.transition.afterProcess()`

处理模态框关闭后（无论完成还是取消），务必调用 `imWorkflow.transition.afterProcess()`。它会执行 IM-Workflow 的标准页面跳转处理（如返回任务一览等）。

## 注意事项

- `imWorkflow.modal.showProcess()` 是客户端 API。无法在服务器端（SSJS / Rhino）使用
- `systemMatterId` 和 `nodeId` 需要从 URL 参数等处获取
- 省略 `processType` 时，流程定义中允许的所有处理种别都会显示在模态框内
- 请勿在处理画面上放置自定义的「返回」按钮。应将跳转委托给 `imWorkflow.transition.afterProcess()`
