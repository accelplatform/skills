/**
 * BPMN モデルフィールド拡張オブジェクト。
 *
 * BPMN モデルのフィールド拡張情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/FieldExtension.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface FieldExtension extends BaseElement {
    /** 式 */
    readonly expression: string;
    /** フィールド名 */
    readonly fieldName: string;
    /** 文字列値 */
    readonly stringValue: string;
  }
}
