/**
 * BPMN モデルデータ仕様オブジェクト。
 *
 * BPMN モデルのデータ仕様情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/DataSpec.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface DataSpec extends BaseElement {
    /** コレクションフラグ */
    readonly collection: boolean;
    /** アイテムサブジェクト参照 */
    readonly itemSubjectRef: string;
    /** 名前 */
    readonly name: string;
  }
}
