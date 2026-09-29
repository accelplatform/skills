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
  - **variables の要否を判断する前に、必ず次を確認する:**
    業務データが `プロセスインスタンスID + タスクID` の複合主キーで管理されている場合（＝1タスク完了=1行方式）、
    判断基準は「このタスク自身の処理にプロセス変数が必要か」ではなく「同一プロセス内の後続の開始イベント・
    ユーザタスクが自タスクの入力データを参照するか」である。後続タスクが参照する可能性があるなら、
    以下の単純な complete(taskId) ではなく、**必ず後述「【複合主キー方式は原則必須】後続タスクへ自身の
    タスクIDを引き継ぐ場合」のパターンを適用すること。**
    （プロセス変数操作が不要な場合のシンプルな complete(taskId) は、複合主キー方式でない業務データにのみ使用する）
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

#### 【複合主キー方式は原則必須】後続タスクへ自身のタスクIDを引き継ぐ場合

業務データが `プロセスインスタンスID + タスクID` の複合主キーで「1タスク完了=1行」管理されている場合（`.claude/skills/bpm-docs-generator/reference/guide-business-data.md` 参照）、後続の開始イベント・ユーザタスクが自タスクの入力データを表示・引き継げるよう、**タスク完了時に自身の `taskId` をプロセス変数として設定することを原則必須とする**（「プロセス変数操作が不要な場合」の complete(taskId) を選んではならない）。

```
// 例: 「購入申請入力」タスク完了時、自身のタスクIDを applyTaskId として後続タスクに引き継ぐ
variables = {
  applyTaskId: taskId
}
let taskService = new bpm.TaskService();
taskService.complete(taskId, variables);
```

後続タスク側での取得方法（プロセス変数の参照）は `.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md` の「業務データ取得」を参照。

**本パターンを適用しなかった場合の影響:** 後続タスク側は「自タスクの入力データを参照するプロセス変数が設定されている」ことを前提に業務データ取得処理（`.claude/skills/bpm-scripts-generator/reference/guide-bpm-form.md`）を実装するため、本パターンを省略すると後続タスクの業務データ取得処理が常に失敗する（対象レコードが見つからない、またはプロセス変数が null になる）。
