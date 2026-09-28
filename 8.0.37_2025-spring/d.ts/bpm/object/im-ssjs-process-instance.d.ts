/**
 * プロセスインスタンス情報オブジェクト。
 *
 * プロセスインスタンスの情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/ProcessInstance/index.html
 */
interface ProcessInstance {
  /** アクティビティID */
  readonly activityId: string;
  /** 業務キー */
  readonly businessKey: string;
  /** 完了フラグ */
  readonly ended: boolean;
  /** 親プロセスインスタンスID */
  readonly parentId: string;
  /** プロセス定義ID */
  readonly processDefinitionId: string;
  /** プロセス定義キー */
  readonly processDefinitionKey: string;
  /** プロセスインスタンスID */
  readonly processInstanceId: string;
  /** 停止フラグ */
  readonly suspended: boolean;
}
