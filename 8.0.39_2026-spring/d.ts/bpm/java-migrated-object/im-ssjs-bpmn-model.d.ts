/**
 * BPMN モデルオブジェクト。
 *
 * BPMN モデル全体の情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/BpmnModel.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface BpmnModel {
    /** データストアマップ */
    readonly dataStores: { [id: string]: DataStore };
    /** 定義属性 */
    readonly definitionsAttributes: { [name: string]: ExtensionAttribute[] };
    /** エッジスタイル */
    readonly edgeStyle: string;
    /** エラーマップ */
    readonly errors: { [errorRef: string]: string };
    /** フロー位置マップ */
    readonly flowLocationMap: { [key: string]: GraphicInfo[] };
    /** グローバルアーティファクト一覧 */
    readonly globalArtifacts: Artifact[];
    /** インポート一覧 */
    readonly imports: Import[];
    /** インターフェース一覧 */
    readonly interfaces: Interface[];
    /** アイテム定義マップ */
    readonly itemDefinitions: { [id: string]: ItemDefinition };
    /** ラベル位置マップ */
    readonly labelLocationMap: { [key: string]: GraphicInfo };
    /** 位置マップ */
    readonly locationMap: { [key: string]: GraphicInfo };
    /** メッセージフローマップ */
    readonly messageFlows: { [id: string]: MessageFlow };
    /** メッセージ一覧 */
    readonly messages: Message[];
    /** 名前空間マップ */
    readonly namespaces: { [prefix: string]: string };
    /** プール一覧 */
    readonly pools: Pool[];
    /** プロセス一覧 */
    readonly processes: Process[];
    /** リソース一覧 */
    readonly resources: Resource[];
    /** シグナル一覧 */
    readonly signals: Signal[];
    /** 開始イベントフォームタイプ一覧 */
    readonly startEventFormTypes: string[];
    /** ターゲット名前空間 */
    readonly targetNamespace: string;
    /** ユーザタスクフォームタイプ一覧 */
    readonly userTaskFormTypes: string[];
  }
}
