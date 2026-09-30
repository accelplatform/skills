/**
 * ジョブ処理結果オブジェクト。
 *
 * ジョブの実行結果（ステータスとメッセージ）を格納します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://document.intra-mart.jp/library/iap/public/im_job_scheduler/im_job_scheduler_specification/texts/example/index.html
 */
interface JobResult {
  /** 実行ステータス */
  status: JobResult.Status;
  /** 実行結果メッセージ */
  message: string;
}

declare namespace JobResult {
  type Status =
    /** 正常終了 */
    | 'success'
    /** 警告（ジョブネット継続可能なエラー） */
    | 'warning'
    /** エラー（ジョブネット継続不可能なエラー） */
    | 'error';
}
