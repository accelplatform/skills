/**
 * BPMN モデルプロセスオブジェクト。
 *
 * BPMN モデルのプロセス情報を表すオブジェクトです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/bpm/apilist-bpm-javadoc/doc/jp/co/intra_mart/activiti/bpmn/model/Process.html
 */
declare namespace jp.co.intra_mart.activiti.bpmn.model {
  interface Process extends BaseElement {
    /** アドホックタスクフォームキー */
    readonly adHocTaskFormKey: string;
    /** アーティファクト一覧 */
    readonly artifacts: Artifact[];
    /** 候補開始グループ一覧 */
    readonly candidateStarterGroups: string[];
    /** 候補開始ユーザ一覧 */
    readonly candidateStarterUsers: string[];
    /** コンテナソート一覧 */
    readonly containerSorts: ContainerSort[];
    /** データオブジェクト一覧 */
    readonly dataObjects: ValuedDataObject[];
    /** ドキュメント */
    readonly documentation: string;
    /** イベントリスナー一覧 */
    readonly eventListeners: EventListener[];
    /** 実行可能フラグ */
    readonly executable: boolean;
    /** 実行リスナー一覧 */
    readonly executionListeners: ActivitiListener[];
    /** フロー要素一覧 */
    readonly flowElements: FlowElement[];
    /** ID リンクグループ一覧 */
    readonly identitylinkGroups: string[];
    /** ID リンク一覧 */
    readonly identitylinks: string[];
    /** IO 仕様 */
    readonly ioSpecification: IOSpecification;
    /** レーン一覧 */
    readonly lanes: Lane[];
    /** 名前 */
    readonly name: string;
    /** プロセス管理グループ一覧 */
    readonly processManagerGroups: string[];
    /** プロセス管理ユーザ一覧 */
    readonly processManagerUsers: string[];
    /** ソート一覧 */
    readonly sorts: Sort[];
    /** アドホックタスク使用フラグ */
    readonly useAdHocTask: boolean;
  }
}
