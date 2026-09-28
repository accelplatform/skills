# BPM 画面表单参考

## 概述

IM-BPM 自研（scratch）画面联动所使用画面表单的生成指南。

### 画面处理（业务数据获取）的流程

1. 请求类型的判定
- 根据函数容器 init 函数的 request 参数进行判定。
  - request 中含有 `processDefinitionId` 时，为来自开始事件的请求。
  - request 中含有 `historicProcessInstanceId` 时，为开始事件的历史参照请求。
  - request 中含有 `historicTaskId` 时，为任务的历史参照请求。
  - request 中含有 `taskId` 时，为来自用户任务的请求。用户任务的 request 中也可能包含 `processInstanceId`。

2. 权限检查
- 若请求为流程启动画面，通过 bpm.BPMAuthorityHelper#canStartProcess 判定权限。
- 若请求为任务画面，通过 bpm.BPMAuthorityHelper#canCompleteTask 判定权限。
- 若请求为任务的历史参照，通过 bpm.BPMAuthorityHelper#canReferTask 判定权限。
- 若请求为开始事件的历史参照（`historicProcessInstanceId`），或 init 函数的 request 参数中含有 `processInstanceId`，通过 bpm.BPMAuthorityHelper#canReferProcessInstance 判定权限。

※ 若来自用户任务的请求（`taskId`）同时含有 `processInstanceId`，须同时进行 `canCompleteTask` 和 `canReferProcessInstance` 两项权限检查（不能仅凭其中一项判定）。

3. 请求模式的判定
- 根据请求内容判定模式。
  - request 中含有 `processDefinitionId` 时为 `startProcess`。
  - request 中含有 `historicProcessInstanceId` 时为 `referProcessInstance`。
  - request 中含有 `historicTaskId` 时为 `referTask`。
  - request 中含有 `taskId` 时为 `completeTask`。

4. 业务数据获取
- 获取业务数据。`validateBPMRequest` 的返回值即为请求模式，根据该值判断是否需要获取数据，以及获取数据时使用的主键值。
  - 请求模式为 `startProcess` 时，不获取业务数据。
  - 请求模式为 `referProcessInstance` 时，以 `historicProcessInstanceId` 为键获取业务数据。
  - 请求模式为 `referTask` 时，以 `historicTaskId` 为键获取业务数据。
  - 除上述以外（`completeTask`），根据业务数据的主键方式切换获取条件。
    - **复合主键方式（以 `流程实例 ID + 任务 ID` 按「一次任务完成 = 一行」管理。默认方式）**：若要显示并传承本任务之前完成的开始事件・用户任务的输入数据，则以 `request.processInstanceId`（或隐式对象）与保存前一工序任务 ID 的流程变量（例如 `applyTaskId`。可通过 `bpm.RuntimeService#getVariable` 等获取）作为检索条件获取业务数据。
      - 对于审批、确认等仅在画面上显示前一工序输入数据的任务，直接将该获取结果用于显示。
      - 对于在前一工序输入数据基础上加上本次画面输入值来登记新记录的任务，将获取结果保存于 hidden 项目等，传递给后续的登记处理（后述）。
    - **Update 方式（业务数据没有任务 ID，或根据明确要求采用 Update 方式的情况）**：以业务数据的主键（通过流程变量等方式传递的值）作为检索条件获取业务数据。

5. 画面模式判定
- 请求模式为 `referProcessInstance` 或 `referTask` 时，为参照模式。
- 请求模式为 `startProcess` 时，为新增模式。
- 除上述以外，检索业务数据，若有数据则为编辑模式，若无数据则为新增模式。

6. 根据画面模式控制画面显示
- 处于参照模式时
  - 应使画面的输入项不可编辑。
  - 应隐藏检索对话框等，使其无法操作。
  - 应隐藏登记、编辑、删除、取消等按钮。
  - 由于参照模式的画面显示会在另一窗口中打开，因此不需要「返回」按钮。

## 示例代码

### 函数容器

```javascript

// ========================================
// IM-BPM 请求参数与权限检查
// ========================================
/**
 * 检查 IM-BPM 请求参数与权限。
 *
 * @param {Object} request - 请求参数
 * @return {string} - 请求模式
 * @throws {Error} 错误消息
 */
function validateBPMRequest(request) {

  if (!request) {
    throw new Error('未指定处理 BPM 流程所需的参数。');
  }

  let reqPattern = '';
  let bpmAuthorityHelper = new bpm.BPMAuthorityHelper();

  // 来自开始事件的请求
  if (request['processDefinitionId']){
    const resultCanStart = bpmAuthorityHelper.canStartProcess(request['processDefinitionId']);
    if (resultCanStart.error) throw new Error(resultCanStart.errorMessage);
    if (resultCanStart.data) {
      reqPattern = 'startProcess';
      // 由于是开始事件，基本上不需要获取业务数据
    } else {
      throw new Error('没有启动流程的权限。');
    }
  }
  // 是否为开始事件的历史参照请求？
  else if (request['historicProcessInstanceId']) {
    const resultCanReferProcess = bpmAuthorityHelper.canReferProcessInstance(request['historicProcessInstanceId']);
    if (resultCanReferProcess.error) throw new Error(resultCanReferProcess.errorMessage);
    if (resultCanReferProcess.data) {
      reqPattern = 'referProcessInstance';
    } else {
      throw new Error('没有参照权限。');
    }
  }
  // 是否为任务的历史参照请求？
  else if (request['historicTaskId']) {
    const resultCanReferTask = bpmAuthorityHelper.canReferTask(request['historicTaskId']);
    if (resultCanReferTask.error) throw new Error(resultCanReferTask.errorMessage);
    if (resultCanReferTask.data) {
      reqPattern = 'referTask';
    } else {
      throw new Error('没有参照权限。');
    }
  }
  // 来自用户任务的请求
  else if (request['taskId']) {
    const resultCanCompleteTask = bpmAuthorityHelper.canCompleteTask(request['taskId']);
    if (resultCanCompleteTask.error) throw new Error(resultCanCompleteTask.errorMessage);
    if (resultCanCompleteTask.data) {
      reqPattern = 'completeTask';
    } else {
      throw new Error('没有完成任务的权限。');
    }

    // 流程实例的权限判定
    if (request['processInstanceId']) {
      const result = bpmAuthorityHelper.canReferProcessInstance(request['processInstanceId']);
      if (result.error) throw new Error(result.errorMessage);
      if (!result.data) {
        throw new Error('没有参照权限。');
      }
    }

  } else {
    throw new Error('未指定处理 BPM 流程所需的参数。');
  }
  return reqPattern;
}


```

**关于处理完成后的画面跳转**
- 画面处理完成后，应跳转到请求参数中 callbackPath 指定的画面。
  - 若规格书中明确记载了画面跳转目标，则按其指定执行。

**将 callbackPath 传递给 PageManager.redirect() 时的必要转换（重要・高频缺陷）**
- IM-BPM 传递的 `callbackPath`（例如：`'bpm/task/list?group.retains...'`）是**不带前导斜杠的、相对于上下文路径的路径**。
- 由于 `PageManager.redirect(url)` 的规格是将指定的 `url` 原样设置到 HTML 表单的 `action` 属性中，因此**若将不带前导斜杠的 `callbackPath` 原样传入，会被解释为以当前显示画面路径（例如 `/equipment_purchase/purchase_apply`）为基准的相对路径，从而生成诸如 `/equipment_purchase/bpm/task/list` 之类的错误 URL 并导致 404**（此问题已实际发生）。
- 必须使用 `Web.getContextPath()` 转换为以 Web 应用根目录为基准的绝对路径后，再传递给 `PageManager.redirect()`。

```javascript
// NG：原样传递 callbackPath → 会被解释为以当前画面为基准的相对路径，导致 404
let result = PageManager.redirect(callbackPath, 'GET');

// OK：使用 Web.getContextPath() 转换为附加了上下文路径的绝对路径
function buildAbsoluteCallbackPath(callbackPath) {
  let relativePath = callbackPath.charAt(0) === '/' ? callbackPath.substring(1) : callbackPath;
  return Web.getContextPath() + '/' + relativePath;
}
let result = PageManager.redirect(buildAbsoluteCallbackPath(callbackPath), 'GET');
```

- 由于 `callbackPath` 是通过请求参数（POST 正文中的 hidden 字段等）传递的，因此在进行上述转换之前，须另行实施安全性验证（拒绝 URI 协议、`//`、反斜杠、控制字符），以防止发生指向外部站点的开放重定向（遵循 `.github/instructions/jssp-security.instructions.md` 中「输入验证」的白名单方式的思路。由于该文件中没有关于开放重定向对策的记载，请按照本条所列的验证观点进行实现）。安全性验证与路径解析（绝对路径转换）应职责分离，按「验证 → 转换」的顺序调用。
