/**
 * 案件（完了案件）ノードマネージャ。
 *
 * 完了した案件に対して、案件のノードに関連している情報を取得する際に使用します。
 * ノードの処理履歴、ノードの処理対象者や確認権限者、ノードの設定情報等の特定ノードに関連する情報を取得します。
 * 本オブジェクトでは主に「imw_t_cpl」で始まるトランザクション系の完了案件のデータベースのデータを取得します。
 *
 * 完了した案件に対して、案件関連情報を取得するには CplMatter を使用します。
 * 完了した案件以外に、処理中の案件や過去案件のノード関連情報取得には ActvMatterNode、ArcMatterNode を利用してください。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CplMatterNode/index.html
 */
declare class CplMatterNode {
  // --- getCnfmAuthUserList 用のソート条件定数 ---

  /** ソートの対象項目：確認済みフラグ */
  static readonly CONFIRM_CPL_FLAG: 'confirmCplFlag';
  /** ソートの対象項目：確認対象者コード */
  static readonly USER_CODE: 'userCode';
  /** ソートの対象項目：確認対象者名 */
  static readonly USER_NAME: 'userName';

  /**
   * 案件（完了案件）ノードマネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   */
  constructor(systemMatterId: string);

  /**
   * 案件（完了案件）ノードマネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   */
  constructor(localeId: string, systemMatterId: string);

  /**
   * 完了案件の特定ノード確認処理権限者情報をすべて取得します。
   *
   * WorkflowResultInfo の data 属性には確認処理権限者情報オブジェクトの配列が設定されます。
   *
   * @param nodeId ノードID
   * @param cond ソート条件オブジェクト
   * @return data に確認処理権限者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmAuthUserList(nodeId: string, cond: SortConditionForAuthUser): WorkflowResultInfo<CnfmAuthUserInfo[]>;

  /**
   * 完了案件の特定ノード確認処理権限者情報の件数を取得します。
   *
   * WorkflowResultInfo の data 属性には件数が設定されます。
   *
   * @param nodeId ノードID
   * @return data に件数を格納した WorkflowResultInfo
   */
  getCnfmAuthUserListCount(nodeId: string): WorkflowResultInfo<number>;

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
   * 結果フローのノードの処理対象をすべて取得します。
   *
   * WorkflowResultInfo の data 属性には処理対象者情報オブジェクトの配列が設定されます。
   *
   * @param nodeId ノードID
   * @return data に処理対象者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getExecProcessTargetList(nodeId: string): WorkflowResultInfo<ProcessTargetInfo[]>;

  /**
   * マスタフローのノードの処理対象をすべて取得します。
   *
   * WorkflowResultInfo の data 属性には処理対象者情報オブジェクトの配列が設定されます。
   * ノードID にはルート定義上のノードID を指定してください。動的に展開されたノードのID を指定するとエラーになります。
   *
   * @param nodeId ノードID
   * @return data に処理対象者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getMasterProcessTargetList(nodeId: string): WorkflowResultInfo<ProcessTargetInfo[]>;

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
