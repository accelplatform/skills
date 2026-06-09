/**
 * タスク情報オブジェクト。
 *
 * タスクの情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/Task/index.html
 */
interface Task {
  /** 担当者 */
  readonly assignee: string;
  /** カテゴリ名 */
  readonly category: string;
  /** 作成日時 */
  readonly createTime: Date;
  /** 委任状態 */
  readonly delegationState: string;
  /** 備考 */
  readonly description: string;
  /** 期限日時 */
  readonly dueDate: Date;
  /** 実行ID */
  readonly executionId: string;
  /** フォームキー */
  readonly formKey: string;
  /** タスクID */
  readonly id: string;
  /** タスク名 */
  readonly name: string;
  /** オーナ */
  readonly owner: string;
  /** 親タスクID */
  readonly parentTaskId: string;
  /** 優先度 */
  readonly priority: number;
  /** プロセス定義ID */
  readonly processDefinitionId: string;
  /** プロセスインスタンスID */
  readonly processInstanceId: string;
  /** 中断 */
  readonly suspended: boolean;
  /** タスク定義キー（アクティビティID） */
  readonly taskDefinitionKey: string;
  /** テナントID */
  readonly tenantId: string;
  /** 変数（Variable 情報オブジェクトの配列） */
  readonly variables: Variable[];
}
