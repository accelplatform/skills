/**
 * BPMN モデルデータオブジェクト。
 *
 * BPMN モデルのデータオブジェクト情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/DataObject.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface DataObject extends FlowElement {
    /** アイテムサブジェクト参照 */
    readonly itemSubjectRef: ItemDefinition;
  }
}
