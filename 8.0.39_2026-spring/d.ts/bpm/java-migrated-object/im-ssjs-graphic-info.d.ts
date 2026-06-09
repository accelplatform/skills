/**
 * BPMN モデルグラフィック情報オブジェクト。
 *
 * BPMN モデルのグラフィック情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/GraphicInfo.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface GraphicInfo {
    /** 要素 */
    readonly element: BaseElement;
    /** 展開状態 */
    readonly expanded: boolean;
    /** 高さ */
    readonly height: number;
    /** 幅 */
    readonly width: number;
    /** X 座標 */
    readonly x: number;
    /** XML 列番号 */
    readonly xmlColumnNumber: number;
    /** XML 行番号 */
    readonly xmlRowNumber: number;
    /** Y 座標 */
    readonly y: number;
  }
}
