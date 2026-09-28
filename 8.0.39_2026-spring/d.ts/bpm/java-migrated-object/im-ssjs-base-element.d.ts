/**
 * BPMN モデル基底要素オブジェクト。
 *
 * BPMN モデルの各要素の基底となるオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/BaseElement.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface BaseElement {
    /** 拡張属性 */
    readonly attributes: { [name: string]: ExtensionAttribute[] };
    /** 拡張要素 */
    readonly extensionElements: { [name: string]: ExtensionElement[] };
    /** 要素ID */
    readonly id: string;
    /** 要素の値 */
    readonly value?: string;
    /** XML 列番号 */
    readonly xmlColumnNumber: number;
    /** XML 行番号 */
    readonly xmlRowNumber: number;
  }
}
