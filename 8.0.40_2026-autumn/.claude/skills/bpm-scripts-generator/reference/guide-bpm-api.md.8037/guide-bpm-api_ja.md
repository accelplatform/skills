# BPM API リファレンス

## 概要

IM-BPM のスクラッチ画面連携に利用するAPIの生成ガイドライン。

#### 開始イベントと紐づけられた画面処理
- **開始イベントと紐づけられた画面処理には、プロセスインスタンス開始処理（bpm.RuntimeServiceのstartProcessInstanceById）を追加すること。**
  - ファンクションコンテナ init メソッドのリクエストパラメータに 'processDefinitionId' がある場合、開始イベントと判定する。
  - プロセス変数操作が不要な場合、startProcessInstanceById(processDefinitionId) にてプロセスを開始する。
    ```
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId);
    ```
  - プロセス変数操作が必要な場合、startProcessInstanceById(processDefinitionId, variables) にてプロセスを開始する。variables には以下のように値を設定する。
    ```
    variables = {
      <プロセス変数名>: <値>,
      <プロセス変数名>: <値>,
      ‥‥‥
    }
    let runtimeService = new bpm.RuntimeService();
    runtimeService.startProcessInstanceById(processDefinitionId, variables);
    ```

#### ユーザタスクと紐づけられた画面処理
- **ユーザタスクと紐づけられた画面処理には、タスクの完了処理（bpm.TaskServiceのcomplete）を追加すること。**
  - プロセス変数操作が不要な場合、complete(taskId) にてタスク完了する。
    ```
    let taskService = new bpm.TaskService();
    taskService.complete(taskId);
    ```
  - プロセス変数操作が必要な場合、complete(taskId, variables) にてタスク完了する。variables には以下のように値を設定する。
    ```
    variables = {
      <プロセス変数名>: <値>,
      <プロセス変数名>: <値>,
      ‥‥‥
    }
    let taskService = new bpm.TaskService();
    taskService.complete(taskId,variables);
    ```
