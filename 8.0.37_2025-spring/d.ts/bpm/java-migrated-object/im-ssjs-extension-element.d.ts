/**
 * BPMN モデル拡張要素オブジェクト。
 *
 * BPMN モデルの拡張要素を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/ExtensionElement.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface ExtensionElement extends BaseElement {
    /** 子要素 */
    readonly childElements: { [name: string]: ExtensionElement[] };
    /** 要素テキスト */
    readonly elementText: string;
    /** 要素名 */
    readonly name: string;
    /** 名前空間 */
    readonly namespace: string;
    /** 名前空間プレフィックス */
    readonly namespacePrefix: string;
  }
}
