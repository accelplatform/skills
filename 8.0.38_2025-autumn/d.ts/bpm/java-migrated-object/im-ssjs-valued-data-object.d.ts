/**
 * BPMN モデル値付きデータオブジェクト。
 *
 * BPMN モデルの値を持つデータオブジェクト情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/ValuedDataObject.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface ValuedDataObject extends DataObject {
    /** 値 */
    readonly value: any;
  }
}
