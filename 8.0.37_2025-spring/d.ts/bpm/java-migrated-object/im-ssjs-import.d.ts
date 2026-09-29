/**
 * BPMN モデルインポートオブジェクト。
 *
 * BPMN モデルのインポート情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Import.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Import extends BaseElement {
    /** インポートタイプ */
    readonly importType: string;
    /** ロケーション */
    readonly location: string;
    /** 名前空間 */
    readonly namespace: string;
  }
}
