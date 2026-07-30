# BPM API 参考

## 概要

用于 IM-BPM 与自建（scratch）画面联动的 API 生成指南。

#### 与开始事件关联的画面处理
- **在与开始事件关联的画面处理中，需添加流程实例开始处理（`bpm.RuntimeService` 的 `startProcessInstanceById`）。**
  - 当功能容器 init 方法的请求参数中存在 'processDefinitionId' 时，判定为开始事件。
  - 无需操作流程变量时，通过 `startProcessInstanceById(processDefinitionId)` 开始流程。
    ```
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId);
    ```
  - 需要操作流程变量时，通过 `startProcessInstanceById(processDefinitionId, variables)` 开始流程。variables 中按如下方式设置值。
    ```
    variables = {
      <流程变量名>: <值>,
      <流程变量名>: <值>,
      ‥‥‥
    }
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId, variables);
    ```

#### 与用户任务关联的画面处理
- **在与用户任务关联的画面处理中，需添加任务的完成处理（`bpm.TaskService` 的 `complete`）。**
  - 无需操作流程变量时，通过 `complete(taskId)` 完成任务。
    ```
    let taskService = new bpm.TaskService();
    taskService.complete(taskId);
    ```
  - 需要操作流程变量时，通过 `complete(taskId, variables)` 完成任务。variables 中按如下方式设置值。
    ```
    variables = {
      <流程变量名>: <值>,
      <流程变量名>: <值>,
      ‥‥‥
    }
    let taskService = new bpm.TaskService();
    taskService.complete(taskId,variables);
    ```
