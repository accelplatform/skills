/**
 * タスクイベント情報オブジェクト。
 *
 * 非同期タスクの実行中に発生する各種イベント情報を表します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/TaskEvent/index.html
 */
interface TaskEvent {
  /** エラーフラグ */
  error: boolean;
  /** エラーメッセージ */
  errorMessage: string;
  /** イベント種別 */
  type: TaskEvent.EventType;
}

declare namespace TaskEvent {
  type EventType =
    /** タスクが受理された場合 */
    | 'TASK_ACCEPTED'
    /** タスクが開始された場合 */
    | 'TASK_STARTED'
    /** タスクが完了した場合 */
    | 'TASK_COMPLETED'
    /** タスクが拒否された場合 */
    | 'TASK_REJECTED';
}
