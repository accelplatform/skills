/**
 * BPMN モデルイベントリスナオブジェクト。
 *
 * グローバルイベント機構にフックするためのイベントリスナ定義を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/EventListener.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface EventListener extends BaseElement {
    /** エンティティタイプ */
    readonly entityType: string;
    /** イベント */
    readonly events: string;
    /** 実装 */
    readonly implementation: string;
    /** 実装タイプ */
    readonly implementationType: string;
  }
}
