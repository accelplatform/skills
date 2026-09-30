# BPM API 参考

## 概述

IM-BPM 自研（scratch）画面联动所使用 API 的生成指南。

#### 与开始事件关联的画面处理
- **与开始事件关联的画面处理中，须追加流程实例启动处理（bpm.RuntimeService 的 startProcessInstanceById）。**
  - 若函数容器 init 方法的请求参数中含有 'processDefinitionId'，则判定为开始事件。
  - 若不需要操作流程变量，则通过 startProcessInstanceById(processDefinitionId) 启动流程。
    ```
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId);
    ```
  - 若需要操作流程变量，则通过 startProcessInstanceById(processDefinitionId, variables) 启动流程。variables 的取值设置如下。
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
- **与用户任务关联的画面处理中，须追加任务完成处理（bpm.TaskService 的 complete）。**
  - **在判断是否需要 variables 之前，必须先确认以下事项：**
    当业务数据以 `流程实例 ID + 任务 ID` 复合主键方式管理时（即「一次任务完成 = 一行」方式），
    判断标准并非「该任务自身的处理是否需要流程变量」，而是「同一流程中后续的开始事件・
    用户任务是否需要参照本任务的输入数据」。若后续任务有可能参照，
    则**必须采用后文「【复合主键方式原则上必须】将自身任务 ID 传递给后续任务的情况」中的模式**，
    而不能使用下面简单的 complete(taskId)。
    （不需要操作流程变量时的简单 complete(taskId)，仅用于非复合主键方式的业务数据）
  - 若不需要操作流程变量，则通过 complete(taskId) 完成任务。
    ```
    let taskService = new bpm.TaskService();
    taskService.complete(taskId);
    ```
  - 若需要操作流程变量，则通过 complete(taskId, variables) 完成任务。variables 的取值设置如下。
    ```
    variables = {
      <流程变量名>: <值>,
      <流程变量名>: <值>,
      ‥‥‥
    }
    let taskService = new bpm.TaskService();
    taskService.complete(taskId,variables);
    ```

#### 【复合主键方式原则上必须】将自身任务 ID 传递给后续任务的情况

当业务数据以 `流程实例 ID + 任务 ID` 复合主键方式按「一次任务完成 = 一行」进行管理时（参见 `.github/skills/bpm-docs-generator/reference/guide-business-data.md`），为了让后续的开始事件、用户任务能够显示并传承本任务的输入数据，**原则上必须在任务完成时将自身的 `taskId` 设置为流程变量**（不得选择「不需要操作流程变量时」的 complete(taskId)）。

```
// 示例：「采购申请输入」任务完成时，将自身任务 ID 以 applyTaskId 的形式传递给后续任务
variables = {
  applyTaskId: taskId
}
let taskService = new bpm.TaskService();
taskService.complete(taskId, variables);
```

后续任务侧的获取方法（对流程变量的参照）请参见 `.github/skills/bpm-scripts-generator/reference/guide-bpm-form.md` 中的「业务数据获取」。

**未应用本模式时的影响：** 由于后续任务侧是在「已设置参照本任务输入数据的流程变量」这一前提下实现业务数据获取处理（`.github/skills/bpm-scripts-generator/reference/guide-bpm-form.md`）的，因此若省略本模式，后续任务的业务数据获取处理将始终失败（找不到目标记录，或流程变量为 null）。
