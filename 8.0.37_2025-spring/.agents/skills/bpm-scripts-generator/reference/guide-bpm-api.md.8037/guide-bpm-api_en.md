# BPM API Reference

## Overview

Guidelines for generating the APIs used for integration between IM-BPM and scratch-built screens.

#### Screen Processing Linked to a Start Event
- **Add the process instance start operation (`startProcessInstanceById` of `bpm.RuntimeService`) to the screen processing linked to a start event.**
  - If the request parameters of the function container's init method contain `processDefinitionId`, it is determined to be a start event.
  - When process variable operations are not required, start the process with `startProcessInstanceById(processDefinitionId)`.
    ```
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId);
    ```
  - When process variable operations are required, start the process with `startProcessInstanceById(processDefinitionId, variables)`. Set the values in `variables` as follows.
    ```
    variables = {
      <process variable name>: <value>,
      <process variable name>: <value>,
      ‥‥‥
    }
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId, variables);
    ```

#### Screen Processing Linked to a User Task
- **Add the task completion operation (`complete` of `bpm.TaskService`) to the screen processing linked to a user task.**
  - When process variable operations are not required, complete the task with `complete(taskId)`.
    ```
    let taskService = new bpm.TaskService();
    taskService.complete(taskId);
    ```
  - When process variable operations are required, complete the task with `complete(taskId, variables)`. Set the values in `variables` as follows.
    ```
    variables = {
      <process variable name>: <value>,
      <process variable name>: <value>,
      ‥‥‥
    }
    let taskService = new bpm.TaskService();
    taskService.complete(taskId,variables);
    ```
