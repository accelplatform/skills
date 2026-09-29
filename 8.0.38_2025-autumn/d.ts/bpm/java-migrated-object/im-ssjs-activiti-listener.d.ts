/**
 * BPMN モデルリスナオブジェクト。
 *
 * BPMN モデルのリスナ情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/ActivitiListener.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface ActivitiListener extends BaseElement {
    /** イベント */
    readonly event: string;
    /** フィールド拡張 */
    readonly fieldExtensions: FieldExtension[];
    /** 実装 */
    readonly implementation: string;
    /** 実装タイプ */
    readonly implementationType: string;
  }
}
