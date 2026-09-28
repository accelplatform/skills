# BPM API Reference

## Overview

Generation guidelines for the APIs used for IM-BPM scratch-screen integration.

#### Screen Processing Tied to a Start Event
- **Add process instance start processing (bpm.RuntimeService's startProcessInstanceById) to screen processing tied to a start event.**
  - If the request parameter of the function container's init method has 'processDefinitionId', it is determined to be a start event.
  - If process variable manipulation is not required, start the process with startProcessInstanceById(processDefinitionId).
    ```
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId);
    ```
  - If process variable manipulation is required, start the process with startProcessInstanceById(processDefinitionId, variables). Set values into variables as follows.
    ```
    variables = {
      <process variable name>: <value>,
      <process variable name>: <value>,
      ‥‥‥
    }
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId, variables);
    ```

#### Screen Processing Tied to a User Task
- **Add task completion processing (bpm.TaskService's complete) to screen processing tied to a user task.**
  - **Before deciding whether variables are needed, always check the following:**
    When the business data is managed with a composite primary key of `process instance ID + task ID` (i.e. the "one task completion = one row" method),
    the determining factor is not "does this task's own processing need a process variable", but rather "will a subsequent
    start event or user task in the same process reference this task's input data". If it is possible that a subsequent
    task will reference it, **you must apply the pattern described later in "[Composite-primary-key method is required in
    principle] When passing your own task ID to a subsequent task"** instead of the plain complete(taskId) below.
    (The simple complete(taskId), used when process variable manipulation is unnecessary, is only for business data that does not use the composite-primary-key method.)
  - If process variable manipulation is not required, complete the task with complete(taskId).
    ```
    let taskService = new bpm.TaskService();
    taskService.complete(taskId);
    ```
  - If process variable manipulation is required, complete the task with complete(taskId, variables). Set values into variables as follows.
    ```
    variables = {
      <process variable name>: <value>,
      <process variable name>: <value>,
      ‥‥‥
    }
    let taskService = new bpm.TaskService();
    taskService.complete(taskId,variables);
    ```

#### [Composite-Primary-Key Method Is Required in Principle] When Passing Your Own Task ID to a Subsequent Task

When business data is managed with a composite primary key of `process instance ID + task ID`, following the "one task completion = one row" model (see `.claude/skills/bpm-docs-generator/reference/guide-business-data.md`), **setting your own `taskId` as a process variable at task completion is required in principle**, so that a subsequent start event or user task can display and carry over this task's input data (the plain complete(taskId), used "when process variable manipulation is unnecessary", must not be chosen).

```
// Example: when completing the "Purchase Application Input" task, hand off its own task ID as applyTaskId to subsequent tasks
variables = {
  applyTaskId: taskId
}
let taskService = new bpm.TaskService();
taskService.complete(taskId, variables);
```

For how to retrieve this on the subsequent task side (referencing the process variable), see "Business Data Retrieval" in `.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md`.

**Impact of not applying this pattern:** The subsequent task side implements its business data retrieval processing (`.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md`) on the assumption that "a process variable referencing this task's own input data has been set". Omitting this pattern will therefore always cause the subsequent task's business data retrieval processing to fail (the target record is not found, or the process variable is null).
