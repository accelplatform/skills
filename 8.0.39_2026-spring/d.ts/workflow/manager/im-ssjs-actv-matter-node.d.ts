/**
 * 案件（未完了案件）ノードマネージャ。
 *
 * 未完了案件のノード情報取得、処理履歴取得、画面パス取得、ノード設定情報取得などの機能を提供します。
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されてないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvMatterNode/index.html
 */
declare class ActvMatterNode {
  // --- getExecutableUserList 用の検索・ソート条件定数（ActvMatterExecutableUserType 由来）---

  /** あいまい検索・ソートの対象項目：権限者コード */
  static readonly AUTH_USER_CODE: 'authUserCode';
  /** あいまい検索・ソートの対象項目：権限者名 */
  static readonly AUTH_USER_NAME: 'authUserName';
  /** あいまい検索・ソートの対象項目：無効フラグ */
  static readonly INVALID_FLAG: 'invalidFlag';
  /** あいまい検索・ソートの対象項目：ノードID */
  static readonly NODE_ID: 'nodeId';

  // --- getCnfmAuthUserList 用のソート条件定数（CnfmAuthUserType 由来）---

  /** ソートの対象項目：確認済みフラグ */
  static readonly CONFIRM_CPL_FLAG: 'confirmCplFlag';
  /** ソートの対象項目：確認対象者コード */
  static readonly USER_CODE: 'userCode';
  /** ソートの対象項目：確認対象者名 */
  static readonly USER_NAME: 'userName';

  /**
   * 案件（未完了案件）ノードマネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param systemMatterId システム案件ID
   */
  constructor(systemMatterId: string);

  /**
   * 案件（未完了案件）ノードマネージャのインスタンスを生成します。
   *
   * @param localeId ロケールID
   * @param systemMatterId システム案件ID
   */
  constructor(localeId: string, systemMatterId: string);

  /**
   * 対象のノードで実施可能な処理種別を取得します。
   *
   * @param nodeId ノードID
   * @return data に処理種別情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAvailableProcessTypeList(nodeId: string): WorkflowResultInfo<NodeProcessTypeInfo[]>;

  /**
   * 対象ノードの前に処理が行われたノードの情報を取得します。
   *
   * @param nodeId ノードID
   * @return data に処理済ノード情報オブジェクトを格納した WorkflowResultInfo
   */
  getBeforeProcessedNode(nodeId: string): WorkflowResultInfo<CplNodeInfo>;

  /**
   * 未完了案件の特定ノード確認処理権限者情報をすべて取得します。
   *
   * WorkflowResultInfo の data 属性には確認処理権限者情報オブジェクトの配列が設定されます。
   *
   * @param nodeId ノードID
   * @param condition ソート条件オブジェクト
   * @return data に確認処理権限者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmAuthUserList(nodeId: string, condition?: SortConditionForAuthUser): WorkflowResultInfo<CnfmAuthUserInfo[]>;

  /**
   * 未完了案件の特定ノード確認処理権限者情報の件数を取得します。
   *
   * WorkflowResultInfo の data 属性には件数が設定されます。
   *
   * @param nodeId ノードID
   * @return data に件数を格納した WorkflowResultInfo
   */
  getCnfmAuthUserListCount(nodeId: string): WorkflowResultInfo<number>;

  /**
   * 実行中フローのノード設定情報を取得します。
   *
   * WorkflowResultInfo の data 属性には案件ノード設定情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件ノード設定情報オブジェクトを格納した WorkflowResultInfo
   */
  getExecNodeConfig(nodeId: string): WorkflowResultInfo<MatterNodeConfigInfo>;

  /**
   * 実行中フローのノードの処理対象をすべて取得します。
   *
   * WorkflowResultInfo の data 属性には処理対象者情報オブジェクトの配列が設定されます。
   * ノードID には実行中フローのルート上に存在するノードID を指定してください。
   *
   * @param nodeId ノードID
   * @return data に処理対象者情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getExecProcessTargetList(nodeId: string): WorkflowResultInfo<ProcessTargetInfo[]>;

  /**
   * 対象のノードを処理可能な権限者情報を取得します。
   *
   * WorkflowResultInfo の data 属性にはタスク実行可能ユーザ情報オブジェクトの配列が設定されます。
   *
   * @param condition 検索条件オブジェクト
   * @return data にタスク実行可能ユーザ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getExecutableUserList(condition: ListSearchConditionNoMatterProperty): WorkflowResultInfo<ActvExecutableUserInfo[]>;

  /**
   * マスタフローのノード設定情報を取得します。
   *
   * WorkflowResultInfo の data 属性には案件ノード設定情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件ノード設定情報オブジェクトを格納した WorkflowResultInfo
   */
  getMasterNodeConfig(nodeId: string): WorkflowResultInfo<MatterNodeConfigInfo>;

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
   * 対象ノードでルート選択対象となっている分岐開始ノード情報を取得します。
   *
   * WorkflowResultInfo の data 属性には案件ノード情報オブジェクトの配列が設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodesToConfigBranchStart(nodeId: string): WorkflowResultInfo<MatterNodeInfo[]>;

  /**
   * 対象ノードで処理対象者設定対象となっているノード情報を取得します。
   *
   * WorkflowResultInfo の data 属性には案件ノード情報オブジェクトの配列が設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getNodesToConfigProcessTarget(nodeId: string): WorkflowResultInfo<MatterNodeInfo[]>;

  /**
   * 特定のノードの処理を行う上で有効な画面パスを取得します。
   *
   * WorkflowResultInfo の data 属性には案件画面定義情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件画面定義情報オブジェクトを格納した WorkflowResultInfo
   */
  getPageAvailable(nodeId: string): WorkflowResultInfo<MatterPageInfo>;

  /**
   * 特定のノードにおいて指定されている申請画面パスを取得します。
   *
   * WorkflowResultInfo の data 属性には案件画面定義情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件画面定義情報オブジェクトを格納した WorkflowResultInfo
   */
  getPageForApply(nodeId: string): WorkflowResultInfo<MatterPageInfo>;

  /**
   * 特定のノードにおいて指定されている確認画面パスを取得します。
   *
   * WorkflowResultInfo の data 属性には案件画面定義情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件画面定義情報オブジェクトを格納した WorkflowResultInfo
   */
  getPageForConfirm(nodeId: string): WorkflowResultInfo<MatterPageInfo>;

  /**
   * 特定のノードにおいて指定されている処理画面パスを取得します。
   *
   * WorkflowResultInfo の data 属性には案件画面定義情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件画面定義情報オブジェクトを格納した WorkflowResultInfo
   */
  getPageForProcess(nodeId: string): WorkflowResultInfo<MatterPageInfo>;

  /**
   * 特定のノードにおいて指定されている再申請画面パスを取得します。
   *
   * WorkflowResultInfo の data 属性には案件画面定義情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件画面定義情報オブジェクトを格納した WorkflowResultInfo
   */
  getPageForReapply(nodeId: string): WorkflowResultInfo<MatterPageInfo>;

  /**
   * 特定のノードにおいて指定されている一時保存画面パスを取得します。
   *
   * WorkflowResultInfo の data 属性には案件画面定義情報オブジェクトが設定されます。
   *
   * @param nodeId ノードID
   * @return data に案件画面定義情報オブジェクトを格納した WorkflowResultInfo
   */
  getPageForTempSave(nodeId: string): WorkflowResultInfo<MatterPageInfo>;

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
