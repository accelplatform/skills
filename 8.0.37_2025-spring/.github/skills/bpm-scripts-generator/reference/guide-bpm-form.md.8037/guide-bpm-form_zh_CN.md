# BPM 画面表单参考

## 概要

用于 IM-BPM 与自建（scratch）画面联动的画面表单生成指南。

### 画面处理（业务数据获取）的流程

1. 请求种别的判定
- 根据功能容器 init 函数的 request 参数进行判定。
  - request 中存在 `processDefinitionId` 时，为来自开始事件的请求。
  - request 中存在 `historicProcessInstanceId` 时，为开始事件的履历参照请求。
  - request 中存在 `taskId` 时，为来自用户任务的请求。
  - request 中存在 `historicTaskId` 时，为任务的履历参照请求。

2. 权限的检查
- 请求为流程开始画面时，通过 `bpm.BPMAuthorityHelper#canStartProcess` 判定权限
- 请求为任务画面时，通过 `bpm.BPMAuthorityHelper#canCompleteTask` 判定权限
- 请求为任务的履历参照时，通过 `bpm.BPMAuthorityHelper#canReferTask` 判定权限
- 请求为开始事件的履历参照（`historicProcessInstanceId`）时，或 init 函数的 request 参数中存在 `processInstanceId` 时，通过 `bpm.BPMAuthorityHelper#canReferProcessInstance` 判定权限

※ 由于「任务的履历参照」与「开始事件的履历参照」的判定基准参数不同，请勿对同一请求重复适用 `canReferTask` 与 `canReferProcessInstance`。

3. 业务数据的获取
- 开始事件不进行业务数据的获取。
- 开始事件的履历参照请求，以 `historicProcessInstanceId` 为键获取业务数据。
- 任务的履历参照请求，以业务数据的主键或 `historicTaskId` 为键获取业务数据。
- 除上述以外的情况，利用业务数据的主键，或流程实例 ID・任务 ID 等获取业务数据。

4. 模式的判定
- 履历参照请求为参照模式。
- 开始事件为新建模式。
- 除上述以外的情况，检索业务数据，若存在数据则为编辑模式，若不存在则为新建模式。

5. 基于模式的画面显示控制
- 处于参照模式时
  - 使画面的输入项目不可编辑。
  - 隐藏检索对话框等，使其无法操作。
  - 隐藏登录・编辑・删除・取消按钮等。
  - 参照模式的画面显示为独立窗口，因此不需要「返回」按钮。

## 示例代码

### 功能容器

```javascript

// ========================================
// IM-BPM 自建画面联动 - 参照请求判定
// ========================================
/**
 * 根据请求参数的内容，判定是否为来自详细画面的请求。
 * 仅用于模式判定（4. 模式的判定）。由于不区分 historicProcessInstanceId / historicTaskId，
 * 请勿将其用于任务权限检查等的分支条件。
 *
 * @param {Object} request - 请求参数
 */
function isReferenceRequest(request) {
  return (request['historicProcessInstanceId'] || request['historicTaskId']);
}

// ========================================
// IM-BPM 自建画面联动 - 开始事件判定
// ========================================
/**
 * 根据请求参数的内容，判定是否为来自流程开始事件的请求
 *
 * @param {Object} request - 请求参数
 */
function isStartEventRequest(request) {
  return (request['processDefinitionId']);
}

// ========================================
// IM-BPM 流程的开始权限检查
// ========================================
/**
 * 检查 IM-BPM 的开始权限。
 *
 * @param {String} processDefinitionId - 流程定义 ID
 * @return {Boolean} - true: 有权限 false: 无权限
 * @throws {Error} 错误消息
 */
function hasStartProcessAuthority(processDefinitionId) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  const result = BPMAuthorityHelper.canStartProcess(processDefinitionId);
  if (result.error) throw new Error(result.errorMessage);
  if (!result.error && result.data) return true;
  return false;
}


// ========================================
// IM-BPM 流程实例的参照权限检查
// ========================================
/**
 * 检查 IM-BPM 的流程实例参照权限。
 *
 * @param {String} processInstanceId - 流程实例 ID
 * @return {Boolean} - true: 有权限 false: 无权限
 * @throws {Error} 错误消息
 */
function hasReferProcessAuthority(processInstanceId) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  const result = BPMAuthorityHelper.canReferProcessInstance(processInstanceId);
  if (result.error) throw new Error(result.errorMessage);
  if (!result.error && result.data) return true;
  return false;
}

// ========================================
// IM-BPM 任务权限检查
// ========================================
/**
 * 检查 IM-BPM 的任务权限。
 * 对象仅限持有 taskId / historicTaskId 的请求。
 * historicProcessInstanceId（开始事件的履历参照）不在对象范围内，请使用 hasReferProcessAuthority。
 *
 * @param {Object} request - 请求参数
 * @return {Boolean} - true: 有权限 false: 无权限
 * @throws {Error} 错误消息
 */
function hasTaskAuthority(request) {
  let BPMAuthorityHelper = new bpm.BPMAuthorityHelper();
  if (request['historicTaskId']) {
    const historicTaskId = request['historicTaskId'];
    const result = BPMAuthorityHelper.canReferTask(historicTaskId)
    if (result.error) throw new Error(result.errorMessage);
    if (!result.error && result.data) return true;
  } else {
    const taskId = request['taskId'];
    const result = BPMAuthorityHelper.canCompleteTask(taskId)
    if (result.error) throw new Error(result.errorMessage);
    if (!result.error && result.data) return true;
  }
  return false;
}

```

**关于处理后的画面迁移**
- 画面处理完成后，应迁移至请求参数 callbackPath 中指定的画面。
  - 若规格中明确记载了画面迁移目标，则遵循该指定。
