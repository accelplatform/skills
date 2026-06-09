/**
 * 案件（過去案件）ノードマネージャ。
 *
 * アーカイブ処理で退避させた過去案件に対して、案件のノードに関連している情報を取得する際に使用します。
 * ノードの処理履歴、ノードの処理対象者、ノードの設定情報等の特定ノードに関連する情報を取得します。
 * 本オブジェクトでは主に「imw_ayyyymm」で始まるトランザクション系の過去案件のデータベースのデータを取得します。
 *
 * 過去案件に対して、案件関連情報を取得するには ArcMatter を使用します。
 * 過去案件以外に、処理中の案件や完了案件のノード関連情報取得には ActvMatterNode、CplMatterNode を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ArcMatterNode/index.html
 */
declare class ArcMatterNode {
  /**
   * 案件（過去案件）ノードマネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   * @param archiveMonth アーカイブ年月（yyyyMM 形式の文字列）
   */
  constructor(systemMatterId: string, archiveMonth: string);

  /**
   * 案件（過去案件）ノードマネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   * @param archiveMonth アーカイブ年月（yyyyMM 形式の文字列）
   */
  constructor(localeId: string, systemMatterId: string, archiveMonth: string);

  /**
   * 実行フローのノード設定情報を取得します。
   *
   * WorkflowResultInfo の data 属性には案件ノード設定情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件ノード設定情報オブジェクトを格納した WorkflowResultInfo
   */
  getExecNodeConfig(nodeId: string): WorkflowResultInfo<MatterNodeConfigInfo>;

  /**
   * ノード情報を取得します。
   *
   * WorkflowResultInfo の data 属性には案件ノード情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件ノード情報オブジェクトを格納した WorkflowResultInfo
   */
  getMatterNode(nodeId: string): WorkflowResultInfo<MatterNodeInfo>;

  /**
   * 対象ノードにおける最新の処理履歴を取得します。
   *
   * WorkflowResultInfo の data 属性には案件処理履歴情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件処理履歴情報オブジェクトを格納した WorkflowResultInfo
   */
  getProcessHistoryLatest(nodeId: string): WorkflowResultInfo<MatterProcessHistoryInfo>;

  /**
   * 対象ノードの処理履歴をすべて取得します。
   *
   * WorkflowResultInfo の data 属性には案件処理履歴情報オブジェクトの配列が設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件処理履歴情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessHistoryList(nodeId: string): WorkflowResultInfo<MatterProcessHistoryInfo[]>;

  /**
   * 対象ノードの処理履歴の件数を取得します。
   *
   * WorkflowResultInfo の data 属性には件数が設定されます。
   *
   * @param nodeId ノードID
   * @return data に件数を格納した WorkflowResultInfo
   */
  getProcessHistoryListCount(nodeId: string): WorkflowResultInfo<number>;
}
