/**
 * BPMN モデルコンテナソートオブジェクト。
 *
 * BPMN モデルのコンテナソート情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/ContainerSort.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface ContainerSort extends BaseElement {
    /** アクティビティ参照 */
    readonly activityRef: string;
  }
}
