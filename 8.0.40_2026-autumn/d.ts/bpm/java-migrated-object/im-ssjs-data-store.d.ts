/**
 * データストア情報オブジェクト。
 *
 * BPMN モデルのデータストアを表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/DataStore.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface DataStore extends BaseElement {
    /** データ状態 */
    readonly dataState: string;
    /** アイテム参照 */
    readonly itemSubjectRef: string;
    /** 名前 */
    readonly name: string;
  }
}
