/**
 * エグゼキューション検索クエリオブジェクト。
 *
 * エグゼキューションの検索条件を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/ExecutionQuery/index.html
 */
interface ExecutionQuery {
  /** アクティビティID */
  activityId?: string;
  /** 実行ID */
  id?: string;
  /** エグゼキューション変数の情報を結果に含める */
  includeExecutionLocalVariables?: boolean;
  /** プロセスインスタンス変数の情報を結果に含める */
  includeProcessVariables?: boolean;
  /** メッセージ名 */
  messageEventSubscriptionName?: string;
  /** 親実行ID */
  parentId?: string;
  /** 業務キー */
  processBusinessKey?: string;
  /** プロセス定義ID */
  processDefinitionId?: string;
  /** プロセス定義キー */
  processDefinitionKey?: string;
  /** プロセスインスタンスID */
  processInstanceId?: string;
  /** プロセスインスタンス変数（ExecutionQueryVariable 情報オブジェクトの配列） */
  processInstanceVariables?: ExecutionQueryVariable[];
  /** シグナル名 */
  signalEventSubscriptionName?: string;
  /** テナントID */
  tenantId?: string;
  /** テナントID（部分一致） */
  tenantIdLike?: string;
  /** エグゼキューション変数（ExecutionQueryVariable 情報オブジェクトの配列） */
  variables?: ExecutionQueryVariable[];
  /** テナントID なし */
  withoutTenantId?: boolean;
}
