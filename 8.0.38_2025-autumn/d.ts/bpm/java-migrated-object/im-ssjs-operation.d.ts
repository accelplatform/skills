/**
 * BPMN モデルオペレーションオブジェクト。
 *
 * BPMN モデルのオペレーション情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Operation.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Operation extends BaseElement {
    /** エラーメッセージ参照 */
    readonly errorMessageRef: string[];
    /** 実装参照 */
    readonly implementationRef: string;
    /** 入力メッセージ参照 */
    readonly inMessageRef: string;
    /** 名前 */
    readonly name: string;
    /** 出力メッセージ参照 */
    readonly outMessageRef: string;
  }
}
