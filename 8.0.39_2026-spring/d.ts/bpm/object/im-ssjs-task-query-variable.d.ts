/**
 * タスク変数検索情報オブジェクト。
 *
 * タスクの変数検索情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/TaskQueryVariable/index.html
 */
interface TaskQueryVariable {
  /** 変数名 */
  name: string;
  /** オペレーション */
  operation: TaskQueryVariable.Operation;
  /** タイプ */
  type: TaskQueryVariable.Type;
  /** 値 */
  value: any;
}

declare namespace TaskQueryVariable {
  type Operation =
    | 'equals'
    | 'notEquals'
    | 'equalsIgnoreCase'
    | 'notEqualsIgnoreCase'
    | 'like'
    | 'greaterThan'
    | 'greaterThanOrEquals'
    | 'lessThan'
    | 'lessThanOrEquals';
  type Type =
    | 'string'
    | 'integer'
    | 'long'
    | 'short'
    | 'double'
    | 'boolean'
    | 'date';
}
