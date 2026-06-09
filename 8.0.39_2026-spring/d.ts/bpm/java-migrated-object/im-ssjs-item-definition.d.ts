/**
 * BPMN モデルアイテム定義オブジェクト。
 *
 * BPMN モデルのアイテム定義情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/ItemDefinition.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface ItemDefinition extends BaseElement {
    /** アイテム種別 */
    readonly itemKind: string;
    /** 構造参照 */
    readonly structureRef: string;
  }
}
