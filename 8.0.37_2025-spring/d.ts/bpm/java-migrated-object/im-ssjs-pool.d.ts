/**
 * BPMN モデルプールオブジェクト。
 *
 * BPMN モデルのプール情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Pool.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Pool extends BaseElement {
    /** 実行可能フラグ */
    readonly executable: boolean;
    /** 名前 */
    readonly name: string;
    /** プロセス参照 */
    readonly processRef: string;
  }
}
