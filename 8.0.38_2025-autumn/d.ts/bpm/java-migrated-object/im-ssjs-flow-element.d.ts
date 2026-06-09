/**
 * BPMN モデルフロー要素オブジェクト。
 *
 * BPMN モデルのフロー要素の基底となるオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/FlowElement.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface FlowElement extends BaseElement {
    /** ドキュメント */
    readonly documentation: string;
    /** 実行リスナー */
    readonly executionListeners: ActivitiListener[];
    /** 名前 */
    readonly name: string;
  }
}
