/**
 * オプショナルタスク情報オブジェクト。
 *
 * オプショナルタスク情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/OptionalTaskInfo/index.html
 */
interface OptionalTaskInfo {
  /** アクティビティID */
  readonly activityId?: string;
  /** アクティビティ名 */
  readonly activityName?: string;
  /** 即実行 */
  readonly directExecution?: boolean;
  /** パラメータ */
  readonly parameters?: any[];
  /** バージョン */
  readonly version?: number;
}
