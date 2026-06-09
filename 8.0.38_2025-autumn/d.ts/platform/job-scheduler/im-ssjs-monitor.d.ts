/**
 * モニタ情報オブジェクト。
 *
 * ジョブネット実行結果を格納します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/Monitor/index.html
 */
interface Monitor {
  /** モニタID */
  readonly id: string;
  /** ジョブネットID */
  readonly jobnetId: string;
  /** トリガID */
  readonly triggerId: string;
  /** 実行開始日時 */
  readonly startDate: Date;
  /** 実行終了日時 */
  readonly endDate: Date;
  /** 実行ステータス */
  readonly status: Monitor.Status;
  /** 実行結果メッセージ */
  readonly message: string;
  /** 再実行時に使用するパラメータ */
  readonly parameters: { [key: string]: any };
  /** タスク別実行結果（タスクID → MonitorTask） */
  readonly tasks: { [taskId: string]: MonitorTask };
}

declare namespace Monitor {
  type Status =
    /** 実行中 */
    | 'RUNNING'
    /** 一時停止中 */
    | 'PAUSED'
    /** 成功 */
    | 'SUCCESS'
    /** 警告 */
    | 'WARNING'
    /** エラー */
    | 'ERROR'
    /** 終了 */
    | 'EXIT'
    /** 一時停止中（進行中） */
    | 'PAUSING'
    /** 再開中 */
    | 'RESUMING'
    /** 終了中 */
    | 'EXITING';
}
