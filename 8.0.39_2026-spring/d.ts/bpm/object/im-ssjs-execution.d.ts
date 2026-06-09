/**
 * エグゼキューション情報オブジェクト。
 *
 * エグゼキューションの情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/Execution/index.html
 */
interface Execution {
  /** アクティビティID */
  readonly activityId: string;
  /** 説明 */
  readonly description: string;
  /** 終了しているかどうか */
  readonly ended: boolean;
  /** 実行ID */
  readonly id: string;
  /** エグゼキューション名 */
  readonly name: string;
  /** 親実行ID */
  readonly parentId: string;
  /** プロセスインスタンスID */
  readonly processInstanceId: string;
  /** 親プロセスの実行ID */
  readonly superExecutionId: string;
  /** 一時停止しているかどうか */
  readonly suspended: boolean;
  /** テナントID */
  readonly tenantId: string;
  /** Variable 情報オブジェクトの配列 */
  readonly variables: Variable[];
}
