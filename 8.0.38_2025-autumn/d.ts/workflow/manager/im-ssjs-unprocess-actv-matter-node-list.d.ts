/**
 * 未処理一覧ノードマネージャ。
 *
 * コンストラクタに指定したユーザが処理対象者になっている未完了案件の未処理ノード一覧を取得します。
 * 取得される未完了案件のノード情報は設定したユーザの権限で処理できる案件のノード情報及び
 * 設定したユーザが代理先として設定された場合、代理元のユーザの権限で処理できる案件のノード情報です。
 * 処理できるノード一覧又は一括で処理できるノード一覧を取得するのができます。
 *
 * 本オブジェクトでは、処理できるノード単位で一覧を取得します。
 * １つの案件に２つ以上のノードが未処理の状態であれば、ノード毎の未処理ノード情報が取得されます。
 * ノード単位での情報ではなく、案件単位で取得するには UnprocessActvMatterList を利用してください。
 *
 * 本オブジェクトでは「imw_t_actv」で始まるトランザクション系の未完了案件関連テーブルから情報を取得します。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UnprocessActvMatterNodeList/index.html
 */
declare class UnprocessActvMatterNodeList {
  // --- 検索・ソート条件定数（ActvMatterNodeUnprocessType 由来）---

  /** 検索・ソートの対象項目：申請代理フラグ */
  static readonly APPLY_ACT_FLAG: string;
  /** 検索・ソートの対象項目：申請権限者コード */
  static readonly APPLY_AUTH_USER_CODE: string;
  /** 検索・ソートの対象項目：申請権限者名 */
  static readonly APPLY_AUTH_USER_NAME: string;
  /** 検索・ソートの対象項目：申請基準日（'yyyy/MM/dd' 形式の文字列） */
  static readonly APPLY_BASE_DATE: string;
  /** 検索・ソートの対象項目：申請日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  static readonly APPLY_DATE: string;
  /** 検索・ソートの対象項目：申請実行者コード */
  static readonly APPLY_EXECUTE_USER_CODE: string;
  /** 検索・ソートの対象項目：申請実行者名 */
  static readonly APPLY_EXECUTE_USER_NAME: string;
  /** 検索・ソートの対象項目：権限者会社コード */
  static readonly AUTH_COMPANY_CODE: string;
  /** 検索・ソートの対象項目：権限者組織コード */
  static readonly AUTH_ORGZ_CODE: string;
  /** 検索・ソートの対象項目：権限者組織名 */
  static readonly AUTH_ORGZ_NAME: string;
  /** 検索・ソートの対象項目：権限者組織セットコード */
  static readonly AUTH_ORGZ_SET_CODE: string;
  /** 検索・ソートの対象項目：権限者コード */
  static readonly AUTH_USER_CODE: string;
  /** 検索・ソートの対象項目：権限者名 */
  static readonly AUTH_USER_NAME: string;
  /** 検索・ソートの対象項目：自動処理期限 */
  static readonly AUTO_PROCESS_LIMIT_DATE: string;
  /** 検索・ソートの対象項目：フローグループID */
  static readonly FLOW_GROUP_ID: string;
  /** 検索・ソートの対象項目：フローID */
  static readonly FLOW_ID: string;
  /** 検索・ソートの対象項目：フロー名 */
  static readonly FLOW_NAME: string;
  /** 検索・ソートの対象項目：フローバージョンID */
  static readonly FLOW_VERSION_ID: string;
  /** 検索・ソートの対象項目：案件名 */
  static readonly MATTER_NAME: string;
  /** 検索・ソートの対象項目：案件番号 */
  static readonly MATTER_NUMBER: string;
  /** 検索・ソートの対象項目：ノードID */
  static readonly NODE_ID: string;
  /** 検索・ソートの対象項目：ノード名 */
  static readonly NODE_NAME: string;
  /** 検索・ソートの対象項目：ノード種別 */
  static readonly NODE_TYPE: string;
  /** 検索・ソートの対象項目：催促処理期限 */
  static readonly PRESS_LIMIT_DATE: string;
  /** 検索・ソートの対象項目：優先度 */
  static readonly PRIORITY_LEVEL: string;
  /** 検索・ソートの対象項目：到達日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  static readonly START_DATE: string;
  /** 検索・ソートの対象項目：ノード状態 */
  static readonly STATUS: string;
  /** 検索・ソートの対象項目：システム案件ID */
  static readonly SYSTEM_MATTER_ID: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 未処理一覧ノードマネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(userCd: string, localeId?: string);

  // ==================== getProcessList 系 ====================

  /**
   * ユーザが処理可能な案件ノード一覧を取得します。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessList(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * ユーザが処理可能な案件ノード一覧を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessListAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * ユーザが処理可能な案件ノード件数を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCount(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが処理可能な案件ノード件数を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCountAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  // ==================== getProcessListWithFlow 系 ====================

  /**
   * 特定フローID で絞り込んだ未完了案件ノード一覧を取得します。
   *
   * flowId にフローID を指定することで、検索条件にフローID を完全一致で指定した場合と同じ情報をより効率的に取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessListWithFlow(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローID で絞り込んだ未完了案件ノード一覧を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessListWithFlowAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローID で絞り込んだ未完了案件ノードの件数を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCountWithFlow(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  /**
   * 特定フローID で絞り込んだ未完了案件ノードの件数を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCountWithFlowAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  // ==================== getProcessListWithFlowGroup 系 ====================

  /**
   * 特定フローグループID で絞り込んだ未完了案件ノード一覧を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessListWithFlowGroup(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローグループID で絞り込んだ未完了案件ノード一覧を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessListWithFlowGroupAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローグループID で絞り込んだ未完了案件ノードの件数を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCountWithFlowGroup(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * 特定フローグループID で絞り込んだ未完了案件ノードの件数を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCountWithFlowGroupAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;

  // ==================== getProcessListCountForEachFlow 系 ====================

  /**
   * ユーザが処理可能な案件ノード件数をフローID 毎に取得します。
   *
   * フローID をキーとし、値をフローID 毎の未完了案件の件数となるマップを返却します。
   *
   * @return data にキーがフローID、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessListCountForEachFlow(): WorkflowResultInfo<UnprocessActvMatterNodeList.ProcessCountOfNodeMap>;

  /**
   * ユーザが処理可能な案件ノード件数をフローID 毎に取得します（到達処理中の案件を含む）。
   *
   * @return data にキーがフローID、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessListCountForEachFlowAsync(): WorkflowResultInfo<UnprocessActvMatterNodeList.ProcessCountOfNodeMap>;

  // ==================== getLumpProcessList 系 ====================

  /**
   * ユーザが一括処理可能な案件ノード一覧を取得します。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括処理可能な案件のみを取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessList(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * ユーザが一括処理可能な案件ノード一覧を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessListAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * ユーザが一括処理可能な案件ノード件数を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCount(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが一括処理可能な案件ノード件数を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCountAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  // ==================== getLumpProcessListWithFlow 系 ====================

  /**
   * 特定フローID で絞り込んだ一括処理可能な未完了案件ノード一覧を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessListWithFlow(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローID で絞り込んだ一括処理可能な未完了案件ノード一覧を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessListWithFlowAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローID で絞り込んだ一括処理可能な未完了案件ノードの件数を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCountWithFlow(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  /**
   * 特定フローID で絞り込んだ一括処理可能な未完了案件ノードの件数を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCountWithFlowAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  // ==================== getLumpProcessListWithFlowGroup 系 ====================

  /**
   * 特定フローグループID で絞り込んだ一括処理可能な未完了案件ノード一覧を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessListWithFlowGroup(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローグループID で絞り込んだ一括処理可能な未完了案件ノード一覧を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessListWithFlowGroupAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<ActvNodeInfo[]>;

  /**
   * 特定フローグループID で絞り込んだ一括処理可能な未完了案件ノードの件数を取得します。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCountWithFlowGroup(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * 特定フローグループID で絞り込んだ一括処理可能な未完了案件ノードの件数を取得します（到達処理中の案件を含む）。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了（アクティブ）ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCountWithFlowGroupAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;
}

declare namespace UnprocessActvMatterNodeList {
  type ProcessCountOfNodeMap = { [flowId: string]: number };
}
