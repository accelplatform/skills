/**
 * BPMN モデル拡張属性オブジェクト。
 *
 * BPMN モデルの拡張属性を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/ExtensionAttribute.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface ExtensionAttribute {
    /** 属性名 */
    readonly name: string;
    /** 名前空間 */
    readonly namespace: string;
    /** 名前空間プレフィックス */
    readonly namespacePrefix: string;
    /** 属性値 */
    readonly value: string;
  }
}
