/**
 * BPMN モデルリソースオブジェクト。
 *
 * アクティビティから参照可能なリソースを表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Resource.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Resource extends BaseElement {
    /** 名前 */
    readonly name: string;
  }
}
