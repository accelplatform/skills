/**
 * BPMN モデル IO 仕様オブジェクト。
 *
 * BPMN モデルの入出力仕様情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/IOSpecification.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface IOSpecification extends BaseElement {
    /** データ入力参照一覧 */
    readonly dataInputRefs: string[];
    /** データ入力一覧 */
    readonly dataInputs: DataSpec[];
    /** データ出力参照一覧 */
    readonly dataOutputRefs: string[];
    /** データ出力一覧 */
    readonly dataOutputs: DataSpec[];
  }
}
