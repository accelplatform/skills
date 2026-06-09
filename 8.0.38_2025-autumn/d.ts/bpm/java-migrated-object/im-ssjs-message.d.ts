/**
 * BPMN モデルメッセージオブジェクト。
 *
 * BPMN モデルのメッセージ情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Message.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Message extends BaseElement {
    /** アイテム参照 */
    readonly itemRef: string;
    /** 名前 */
    readonly name: string;
  }
}
