/**
 * タスク検索クエリオブジェクト。
 *
 * タスクの検索情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/TaskQuery/index.html
 */
interface TaskQuery {
  /** 有効状態 */
  active?: boolean;
  /** 担当者 */
  assignee?: string;
  /** 担当者（部分一致） */
  assigneeLike?: string;
  /** 関連グループ */
  candidateGroup?: string;
  /** 関連グループリスト */
  candidateGroupIn?: string[];
  /** 関連者、または担当者 */
  candidateOrAssigned?: string;
  /** 関連者 */
  candidateUser?: string;
  /** 作成日時（以後） */
  createdAfter?: Date;
  /** 作成日時（以前） */
  createdBefore?: Date;
  /** 作成日時 */
  createdOn?: Date;
  /** 委任状態 */
  delegationState?: TaskQuery.DelegationState;
  /** 備考 */
  description?: string;
  /** 備考（部分一致） */
  descriptionLike?: string;
  /** 期限日時（以後） */
  dueAfter?: Date;
  /** 期限日時（以前） */
  dueBefore?: Date;
  /** 期限日時 */
  dueDate?: Date;
  /** サブタスクの除外 */
  excludeSubTasks?: boolean;
  /** 実行ID */
  executionId?: string;
  /** プロセスインスタンス変数の情報を結果に含める */
  includeProcessVariables?: boolean;
  /** タスク変数の情報を結果に含める */
  includeTaskLocalVariables?: boolean;
  /** 関係者 */
  involvedUser?: string;
  /** 優先度（最大） */
  maximumPriority?: number;
  /** 優先度（最小） */
  minimumPriority?: number;
  /** タスク名 */
  name?: string;
  /** タスク名（部分一致） */
  nameLike?: string;
  /** オーナ */
  owner?: string;
  /** オーナ（部分一致） */
  ownerLike?: string;
  /** 優先度 */
  priority?: number;
  /** プロセス定義ID */
  processDefinitionId?: string;
  /** プロセス定義キー */
  processDefinitionKey?: string;
  /** プロセス定義キー（部分一致） */
  processDefinitionKeyLike?: string;
  /** プロセス定義名 */
  processDefinitionName?: string;
  /** プロセス定義名（部分一致） */
  processDefinitionNameLike?: string;
  /** 業務キー */
  processInstanceBusinessKey?: string;
  /** 業務キー（部分一致） */
  processInstanceBusinessKeyLike?: string;
  /** プロセスインスタンスID */
  processInstanceId?: string;
  /** プロセスインスタンス変数（TaskQueryVariable 情報オブジェクトの配列） */
  processInstanceVariables?: TaskQueryVariable[];
  /** カテゴリ名 */
  taskCategory?: string;
  /** タスク定義キー（アクティビティID） */
  taskDefinitionKey?: string;
  /** タスク定義キー（部分一致） */
  taskDefinitionKeyLike?: string;
  /** タスク変数、またはプロセスインスタンス変数（TaskQueryVariable 情報オブジェクトの配列） */
  taskOrProcessInstanceVariables?: TaskQueryVariable[];
  /** タスク変数（TaskQueryVariable 情報オブジェクトの配列） */
  taskVariables?: TaskQueryVariable[];
  /** テナントID */
  tenantId?: string;
  /** テナントID（部分一致） */
  tenantIdLike?: string;
  /** 担当者なし */
  unassigned?: boolean;
  /** 期限日時なし */
  withoutDueDate?: boolean;
  /** テナントID なし */
  withoutTenantId?: boolean;
}

declare namespace TaskQuery {
  type DelegationState =
    | 'pending'
    | 'resolved';
}
