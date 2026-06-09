/**
 * BPMN モデルレーンオブジェクト。
 *
 * BPMN モデルのレーン情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Lane.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Lane extends BaseElement {
    /** フロー参照一覧 */
    readonly flowReferences: string[];
    /** 名前 */
    readonly name: string;
    /** 親プロセス */
    readonly parentProcess: Process;
  }
}
