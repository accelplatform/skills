/**
 * BPMN モデルメッセージフローオブジェクト。
 *
 * BPMN モデルのメッセージフロー情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/MessageFlow.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface MessageFlow extends BaseElement {
    /** メッセージ参照 */
    readonly messageRef: string;
    /** 名前 */
    readonly name: string;
    /** ソース参照 */
    readonly sourceRef: string;
    /** ターゲット参照 */
    readonly targetRef: string;
  }
}
