/**
 * BPMN モデルソートオブジェクト。
 *
 * BPMN モデルのソート情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Sort.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Sort extends BaseElement {
    /** アクティビティ参照 */
    readonly activityRef: string;
  }
}
