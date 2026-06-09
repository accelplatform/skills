/**
 * 処理済一覧（完了案件）マネージャ。
 *
 * コンストラクタに指定したユーザが処理した完了案件の処理済み一覧を取得します。
 * 取得される完了案件は設定したユーザの権限で処理した案件及び
 * 設定したユーザが代理先として設定された場合、代理元のユーザの権限で処理した案件です。
 *
 * 本オブジェクトでは、処理した案件単位で一覧を取得します。
 * ノード単位で処理した案件情報を分けて取得するには ProcessedCplMatterNodeList を利用してください。
 *
 * 本オブジェクトでは「imw_t_cpl」で始まるトランザクション系の完了案件関連テーブルから情報を取得します。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessedCplMatterList/index.html
 */
declare class ProcessedCplMatterList {
  // --- 検索・ソート条件定数 ---

  /** 検索・ソートの対象項目：代理フラグ */
  static readonly ACT_FLAG: string;
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
  /** 検索・ソートの対象項目：フローグループID */
  static readonly FLOW_GROUP_ID: string;
  /** 検索・ソートの対象項目：フローID */
  static readonly FLOW_ID: string;
  /** 検索・ソートの対象項目：フロー名 */
  static readonly FLOW_NAME: string;
  /** 検索・ソートの対象項目：フローバージョンID */
  static readonly FLOW_VERSION_ID: string;
  /** 検索・ソートの対象項目：案件終了日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  static readonly MATTER_CPL_DATE: string;
  /** 検索・ソートの対象項目：案件名 */
  static readonly MATTER_NAME: string;
  /** 検索・ソートの対象項目：案件番号 */
  static readonly MATTER_NUMBER: string;
  /** 検索・ソートの対象項目：優先度 */
  static readonly PRIORITY_LEVEL: string;
  /** 検索・ソートの対象項目：案件完了状態 */
  static readonly STATUS: string;
  /** 検索・ソートの対象項目：システム案件ID */
  static readonly SYSTEM_MATTER_ID: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 処理済一覧（完了案件）マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(userCd: string, localeId?: string);

  // ==================== getProcessedList 系 ====================

  /**
   * ユーザが処理した完了案件一覧を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * 「処理権限条件」を設定する際に、どちらかの権限取得フラグを「1:本人申請、または 1:代理設定あり」に設定する必要があります。
   * 全てのフラグを「0」にした場合は、取得処理を行わずに data 属性にサイズ 0 の空オブジェクトを返却します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedList(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<CplMatterInfo[]>;

  /**
   * ユーザが処理した完了案件一覧を取得します。
   *
   * 基本仕様は getProcessedList と同じです。
   * flowId にフローID を指定することで cond にフローID を完全一致で指定した場合と同じ情報を、
   * より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<CplMatterInfo[]>;

  /**
   * ユーザが処理した完了案件一覧を取得します。
   *
   * 基本仕様は getProcessedList と同じです。
   * flowGroupId にフローグループID を指定することで cond にフローグループID を完全一致で指定した場合と同じ情報を、
   * より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<CplMatterInfo[]>;

  // ==================== getProcessedListCount 系 ====================

  /**
   * ユーザが処理した完了案件件数を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCount(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した完了案件件数を取得します。
   *
   * 基本仕様は getProcessedListCount と同じです。
   * flowId にフローID を指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountWithFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した完了案件件数を取得します。
   *
   * 基本仕様は getProcessedListCount と同じです。
   * flowGroupId にフローグループID を指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountWithFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した完了案件件数をフローID 毎に取得します。
   *
   * キーがフローID、値がフローID 毎の完了案件情報件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessedListCountForEachFlow(): WorkflowResultInfo<ProcessedCplMatterList.ProcessedListCountForEachFlowResult>;

  // ==================== getProcessedListWithAuth 系 ====================

  /**
   * ユーザが処理した完了案件一覧を取得します（案件フィルタリング条件付き）。
   *
   * 案件フィルタリング条件が指定された場合は処理権限者の案件に対して絞り込んだ情報を取得します。
   * 処理権限者コードの設定は必須です。
   * 処理権限者の担当組織情報の配列が指定された場合は処理した時の担当組織が一致した案件のみ取得します。
   * 担当組織で絞込みを行う場合は組織フィルタリング対象のフローID の配列を設定する必要があります。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data に完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuth(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo): WorkflowResultInfo<CplMatterInfo[]>;

  /**
   * ユーザが処理した完了案件一覧を取得します（案件フィルタリング条件 + フローID 指定）。
   *
   * 基本仕様は getProcessedListWithAuth と同じです。
   * flowId にフローID を指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowId フローID
   * @return data に完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowId: string): WorkflowResultInfo<CplMatterInfo[]>;

  /**
   * ユーザが処理した完了案件一覧を取得します（案件フィルタリング条件 + フローグループID 指定）。
   *
   * 基本仕様は getProcessedListWithAuth と同じです。
   * flowGroupId にフローグループID を指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowGroupId: string): WorkflowResultInfo<CplMatterInfo[]>;

  // ==================== getProcessedListWithAuthCount 系 ====================

  /**
   * ユーザが処理した完了案件件数を取得します（案件フィルタリング条件付き）。
   *
   * 案件フィルタリング条件が指定された場合は処理権限者の案件に対して絞り込んだ件数を取得します。
   * 処理権限者コードの設定は必須です。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCount(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した完了案件件数を取得します（案件フィルタリング条件 + フローID 指定）。
   *
   * 基本仕様は getProcessedListWithAuthCount と同じです。
   * flowId にフローID を指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowId フローID
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した完了案件件数を取得します（案件フィルタリング条件 + フローグループID 指定）。
   *
   * 基本仕様は getProcessedListWithAuthCount と同じです。
   * flowGroupId にフローグループID を指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した完了案件件数をフローID 毎に取得します（案件フィルタリング条件付き）。
   *
   * キーがフローID、値がフローID 毎の完了案件情報件数のマップを返却します。
   * 案件フィルタリング条件が指定された場合は処理権限者の案件に対して絞り込んだ件数を取得します。
   * 処理権限者コードの設定は必須です。
   *
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data にキーがフローID (string)、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountForEachFlow(filterCond: MatterFilterConditionInfo): WorkflowResultInfo<ProcessedCplMatterList.ProcessedCountOfNodeMap>;
}

declare namespace ProcessedCplMatterList {
  type ProcessedCountOfNodeMap = { [flowId: string]: number };
  type ProcessedListCountForEachFlowResult = { [flowId: string]: number };
}
