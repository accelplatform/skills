/**
 * モニタタスク情報オブジェクト。
 *
 * ジョブネット内の各タスクの実行結果を格納します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/MonitorTask/index.html
 */
interface MonitorTask {
  /** ジョブID */
  readonly jobId: string;
  /** 実行ステータス */
  readonly status: MonitorTask.Status;
  /** タスク開始日時 */
  readonly startDate: Date;
  /** タスク終了日時 */
  readonly endDate: Date;
  /** 実行メッセージ */
  readonly message: string;
}

declare namespace MonitorTask {
  type Status =
    /** スキップ */
    | 'SKIPED'
    /** 成功 */
    | 'SUCCESS'
    /** 警告 */
    | 'WARNING'
    /** エラー */
    | 'ERROR';
}
