/**
 * 非同期処理マネージャ。
 *
 * 並列・直列タスクの登録・管理・実行制御を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/WorkManager/index.html
 */
declare class WorkManager {
  /**
   * 非同期処理マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * 並列処理キューにメッセージを追加します。
   *
   * @param jsPath JavaScript タスクのパス
   * @param parameter パラメータ
   * @param keepTaskMessageOnError エラー時にメッセージを保持するか
   * @return data にタスクメッセージID を格納した ResultObject
   */
  addParallelizedTask(jsPath: string, parameter: WorkManager.Parameter, keepTaskMessageOnError?: boolean): ResultObject<string>;

  /**
   * 直列処理キューにメッセージを追加します。
   *
   * @param queueId キューID
   * @param jsPath JavaScript タスクのパス
   * @param parameter パラメータ
   * @param stopQueueProcessingIfError エラー時にキュー処理を停止するか
   * @param keepTaskMessageOnError エラー時にメッセージを保持するか
   * @return data にタスクメッセージID を格納した ResultObject
   */
  addSerializedTask(queueId: string, jsPath: string, parameter: WorkManager.Parameter, stopQueueProcessingIfError: boolean, keepTaskMessageOnError?: boolean): ResultObject<string>;

  /**
   * 直列タスクキューを追加します。
   *
   * @param queueId キューID
   * @param active 有効/無効
   * @return data にキュー追加結果を格納した ResultObject
   */
  addSerializedTaskQueue(queueId: string, active: boolean): ResultObject<boolean>;

  /**
   * すべての直列キューの状況を取得します。
   *
   * @return data にキュー状況の配列を格納した ResultObject
   */
  getAllSerializedTaskQueuesStatus(): ResultObject<WorkManager.TaskQueueStatus>;

  /**
   * エラー終了した並列タスクを取得します。
   *
   * @param sort ソート対象
   * @param order ソート順
   * @param startIndex 開始位置
   * @param length 取得件数
   * @return data にエラータスク情報を格納した ResultObject
   */
  getParallelizedErroredTaskInfo(sort: string, order: string, startIndex: number, length: number): ResultObject<WorkManager.ParallelizedTaskInfo>;

  /**
   * 処理中の並列タスクを取得します。
   *
   * @param sort ソート対象
   * @param order ソート順
   * @param startIndex 開始位置
   * @param length 取得件数
   * @return data に処理中タスク情報を格納した ResultObject
   */
  getParallelizedRunningTaskInfo(sort: string, order: string, startIndex: number, length: number): ResultObject<WorkManager.ParallelizedTaskInfo>;

  /**
   * 並列キューの状況を取得します。
   *
   * @return data にキュー状況を格納した ResultObject
   */
  getParallelizedTaskQueuesStatus(): ResultObject<WorkManager.TaskQueuesStatus>;

  /**
   * 待機中の並列タスクを取得します。
   *
   * @param sort ソート対象
   * @param order ソート順
   * @param startIndex 開始位置
   * @param length 取得件数
   * @return data に待機中タスク情報を格納した ResultObject
   */
  getParallelizedWaitingTaskInfo(sort: string, order: string, startIndex: number, length: number): ResultObject<WorkManager.ParallelizedTaskInfo>;

  /**
   * キューの状態を取得します。
   *
   * @return data にキュー状態を格納した ResultObject
   */
  getRegisteredInfo(): ResultObject<WorkManager.RegisteredInfo>;

  /**
   * エラー終了した直列タスクを取得します。
   *
   * @param queueId キューID
   * @param sort ソート対象
   * @param order ソート順
   * @param startIndex 開始位置
   * @param length 取得件数
   * @return data にエラータスク情報を格納した ResultObject
   */
  getSerializedErroredTaskInfo(queueId: string, sort: string, order: string, startIndex: number, length: number): ResultObject<WorkManager.SerializedTaskInfo>;

  /**
   * 待機中の直列タスクを取得します。
   *
   * @param queueId キューID
   * @param sort ソート対象
   * @param order ソート順
   * @param startIndex 開始位置
   * @param length 取得件数
   * @return data に待機中タスク情報を格納した ResultObject
   */
  getSerializedTaskInfo(queueId: string, sort: string, order: string, startIndex: number, length: number): ResultObject<WorkManager.SerializedTaskInfo>;

  /**
   * 指定キューID のキュー状態を取得します。
   *
   * @param queueId キューID
   * @return data にキュー状態を格納した ResultObject
   */
  getSerializedTaskQueuesStatusById(queueId: string): ResultObject<WorkManager.TaskQueueStatusById | null>;

  /**
   * タスクの状況を取得します。
   *
   * @param messageId メッセージID
   * @return data にタスク状況を格納した ResultObject
   */
  getTaskStatusById(messageId: string): ResultObject<WorkManager.TaskStatusById | null>;

  /**
   * エラータスクを再登録します。
   *
   * @param messageId メッセージID
   * @param usePreviousContext 前回のコンテキストを使用するか
   * @param parameter パラメータ（省略時は前回のパラメータ）
   * @return data に再登録タスクメッセージID を格納した ResultObject
   */
  reentryErroredTask(messageId: string, usePreviousContext: boolean, parameter?: WorkManager.Parameter): ResultObject<string>;

  /**
   * 並列タスクに終了を通知します。
   *
   * @param messageId メッセージID
   * @param reentry 再登録するか
   * @param stop キュー処理を停止するか
   * @return data にタスク情報を格納した ResultObject
   */
  releaseRunningParallelizedTask(messageId: string, reentry: boolean, stop: boolean): ResultObject<WorkManager.ReleasedTaskInfo>;

  /**
   * 直列タスクに終了を通知します。
   *
   * @param messageId メッセージID
   * @param reentry 再登録するか
   * @param stop キュー処理を停止するか
   * @return data にタスク情報を格納した ResultObject
   */
  releaseRunningSerializedTask(messageId: string, reentry: boolean, stop: boolean): ResultObject<WorkManager.ReleasedTaskInfo>;

  /**
   * エラータスクを削除します。
   *
   * @param messageId メッセージID
   * @return data にタスク情報を格納した ResultObject
   */
  removeErroredTask(messageId: string): ResultObject<WorkManager.TaskInfo>;

  /**
   * 並列タスクを削除します。
   *
   * @param messageId メッセージID
   * @return data に削除結果を格納した ResultObject
   */
  removeParallelizedTask(messageId: string): ResultObject<boolean>;

  /**
   * 直列タスクを削除します。
   *
   * @param messageId メッセージID
   * @return data に削除結果を格納した ResultObject
   */
  removeSerializedTask(messageId: string): ResultObject<boolean>;

  /**
   * 直列タスクキューを削除します。
   *
   * @param queueId キューID
   * @return data に削除結果を格納した ResultObject
   */
  removeSerializedTaskQueue(queueId: string): ResultObject<boolean>;

  /**
   * 並列タスク処理の実行制御を行います。
   *
   * @param active 有効/無効
   * @return data に処理結果を格納した ResultObject
   */
  setParallelizedTaskQueueActive(active: boolean): ResultObject<void>;

  /**
   * 直列タスク処理の実行制御を行います。
   *
   * @param queueId キューID
   * @param active 有効/無効
   * @return data に処理結果を格納した ResultObject
   */
  setSerializedTaskQueueActive(queueId: string, active: boolean): ResultObject<void>;

  /**
   * 並列タスクを強制停止します。
   *
   * @deprecated releaseRunningParallelizedTask() を使用してください
   * @return data にタスク情報を格納した ResultObject
   */
  stopRunningParallelizedTask(messageId: string, reentry: boolean, stop: boolean): ResultObject<WorkManager.StoppedTaskInfo>;

  /**
   * 直列タスクを強制停止します。
   *
   * @deprecated releaseRunningSerializedTask() を使用してください
   * @return data にタスク情報を格納した ResultObject
   */
  stopRunningSerializedTask(messageId: string, reentry: boolean, stop: boolean): ResultObject<WorkManager.StoppedTaskInfo>;
}

declare namespace WorkManager {
  type Parameter = { [key: string]: any };

  type TaskQueueStatus = {
    taskQueueStatus: {
      isActive: boolean;
      waitingTaskCount: number;
      runningTaskCount: number;
      erroredTaskCount: number;
      queueId: string;
      hasRunningTask: boolean;
    }[];
  };

  type TaskInfo = {
    queueId?: string;
    isStoppingProgressOnError?: boolean;
    messageId: string;
    sentTime: Date;
    receivedTime: Date;
    taskClassName: string;
    node?: string;
    acceptTime?: Date;
    startTime?: Date;
    parameter: Parameter;
  };

  type ParallelizedTaskInfo = {
    parallelizedTaskInfo: TaskInfo[];
    count: number;
  };

  type SerializedTaskInfo = {
    serializedTaskInfo: TaskInfo[];
    count: number;
  };

  type TaskQueuesStatus = {
    isActive: boolean;
    waitingTaskCount: number;
    runningTaskCount: number;
    erroredTaskCount: number;
    queueId: string;
  };

  type TaskQueueStatusById = TaskQueuesStatus & {
    serializedTaskInfo: TaskInfo;
    hasRunningTasksInfo: boolean;
  };

  type RegisteredInfo = {
    parallelizedTasksInfo: {
      isActive: boolean;
      waitingTasks: TaskInfo[];
      runningTasks: TaskInfo[];
      erroredTasks: TaskInfo[];
    };
    serializedTasksInfo: { [queueId: string]: {
      isActive: boolean;
      waitingTasks: TaskInfo[];
      runningTasks: TaskInfo[];
      erroredTasks: TaskInfo[];
    } };
  };

  type TaskStatusById = {
    messageId: string;
    queueId: string;
    status: string;
    sentTime: Date;
    receivedTime: Date;
    node: string;
    parameter: Parameter;
    acceptTime: Date;
    startTime: Date;
    isQueueActive: boolean;
  };

  type ReleasedTaskInfo = {
    messageId: string;
    isJsTask: boolean;
    path: string;
    sentTime: Date;
    receivedTime: Date;
    taskClassName: string;
    parameter: Parameter;
  };

  type StoppedTaskInfo = {
    messageId: string;
    isJsTask: boolean;
    path: string;
    sentTime: Date;
    receivedTime: Date;
    taskClassName: string;
    parameter: Parameter;
  };
}
