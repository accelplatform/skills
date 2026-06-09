/**
 * エグゼキューション変数検索情報オブジェクト。
 *
 * エグゼキューションの変数検索情報を格納するオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-ssjs/doc/bpm/ExecutionQueryVariable/index.html
 */
interface ExecutionQueryVariable {
  /** 変数名 */
  name: string;
  /** オペレーション */
  operation: ExecutionQueryVariable.Operation;
  /** タイプ */
  type: ExecutionQueryVariable.Type;
  /** 値 */
  value: any;
}

declare namespace ExecutionQueryVariable {
  type Operation =
    | 'equals'
    | 'notEquals'
    | 'equalsIgnoreCase'
    | 'notEqualsIgnoreCase';
  type Type =
    | 'string'
    | 'integer'
    | 'long'
    | 'short'
    | 'double'
    | 'boolean'
    | 'date';
}
