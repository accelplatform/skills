/**
 * オプショナルタスクオブジェクト。
 *
 * オプショナルタスクを格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/OptionalTaskInstance/index.html
 */
interface OptionalTaskInstance {
  /** アクティビティID */
  activityId?: string;
  /** パラメータマップ */
  parameterMap?: OptionalTaskInstance.ParameterMap;
  /** バージョン */
  version?: number;
}

declare namespace OptionalTaskInstance {
  type ParameterMap = { [key: string]: any };
}
