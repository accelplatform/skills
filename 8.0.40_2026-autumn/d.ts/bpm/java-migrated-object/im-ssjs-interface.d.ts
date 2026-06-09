/**
 * BPMN モデルインタフェースオブジェクト。
 *
 * BPMN モデルのインタフェース情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Interface.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Interface extends BaseElement {
    /** 実装参照 */
    readonly implementationRef: string;
    /** 名前 */
    readonly name: string;
    /** オペレーション */
    readonly operations: Operation[];
  }
}
