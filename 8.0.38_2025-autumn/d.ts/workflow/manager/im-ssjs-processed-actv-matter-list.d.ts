/**
 * 処理済一覧（未完了案件）マネージャ。
 *
 * コンストラクタに指定したユーザが処理した未完了案件の処理済み一覧を取得します。
 * 取得される未完了案件は設定したユーザの権限で処理した案件及び
 * 設定したユーザが代理先として設定された場合、代理元のユーザの権限で処理した案件です。
 * 取得した案件情報には、コンストラクタに指定したユーザが引戻しできるかを判断するためのフラグが設定されています。
 *
 * 本オブジェクトでは、処理した案件単位で一覧を取得します。
 * 申請した案件だけに絞るには、処理権限条件の applyFlg のみを '1' にします。
 *
 * 本オブジェクトでは「imw_t_actv」で始まるトランザクション系の未完了案件関連テーブルから情報を取得します。
 * 完了した案件の処理済み一覧は ProcessedCplMatterList、過去案件は ArcMatterList を利用してください。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessedActvMatterList/index.html
 */
declare class ProcessedActvMatterList {
  // --- 検索・ソート条件定数（ActvMatterPullBackType 由来）---

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
  /** 検索・ソートの対象項目：最終処理日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  static readonly LAST_PROCESS_DATE: string;
  /** 検索・ソートの対象項目：案件名 */
  static readonly MATTER_NAME: string;
  /** 検索・ソートの対象項目：案件番号 */
  static readonly MATTER_NUMBER: string;
  /** 検索・ソートの対象項目：優先度 */
  static readonly PRIORITY_LEVEL: string;
  /** 検索・ソートの対象項目：引戻し可能フラグ */
  static readonly PULLBACK_ABLE_FLAG: string;
  /** 検索・ソートの対象項目：システム案件ID */
  static readonly SYSTEM_MATTER_ID: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 処理済一覧（未完了案件）マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(userCd: string, localeId?: string);

  // ==================== getProcessedList 系 ====================

  /**
   * ユーザが処理した未完了案件一覧を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * いずれかの権限取得フラグを「1」に設定する必要があります。
   * 全てのフラグを「0」にした場合は、取得処理を行わずに data 属性にサイズ 0 の配列を返却します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   * 結果オブジェクトには引戻し可否の判断フラグ（pullbackableFlag）が含まれます。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedList(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedList と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（フローID 指定）。
   *
   * 基本仕様は getProcessedList と同じです。
   * flowId にフローIDを指定することで listSearchCond にフローIDを完全一致で指定した場合と同じ情報を、
   * より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（フローID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithFlow と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithFlowAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（フローグループID 指定）。
   *
   * 基本仕様は getProcessedList と同じです。
   * flowGroupId にフローグループIDを指定することで listSearchCond にフローグループIDを完全一致で指定した場合と同じ情報を、
   * より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（フローグループID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithFlowGroup と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithFlowGroupAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  // ==================== getProcessedListCount 系 ====================

  /**
   * ユーザが処理した未完了案件件数を取得します。
   *
   * 処理権限条件オブジェクト・検索条件オブジェクトの設定は必須です。
   * 全ての権限取得フラグを「0」にした場合は、取得処理を行わずに data 属性に 0 を返却します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCount(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListCount と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（フローID 指定）。
   *
   * 基本仕様は getProcessedListCount と同じです。
   * flowId にフローIDを指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountWithFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（フローID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListCountWithFlow と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountWithFlowAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（フローグループID 指定）。
   *
   * 基本仕様は getProcessedListCount と同じです。
   * flowGroupId にフローグループIDを指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountWithFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（フローグループID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListCountWithFlowGroup と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCountWithFlowGroupAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数をフローID 毎に取得します。
   *
   * キーがフローID、値がフローID 毎の未完了案件情報件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessedListCountForEachFlow(): WorkflowResultInfo<ProcessedActvMatterList.CountForEachFlowResult>;

  /**
   * ユーザが処理した未完了案件件数をフローID 毎に取得します（到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListCountForEachFlow と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @return data にキーがフローID (string)、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessedListCountForEachFlowAsync(): WorkflowResultInfo<ProcessedActvMatterList.CountForEachFlowResult>;

  // ==================== getProcessedListWithAuth 系 ====================

  /**
   * ユーザが処理した未完了案件一覧を取得します（案件フィルタリング条件付き）。
   *
   * 案件フィルタリング条件が指定された場合は処理権限者の案件に対して絞り込んだ情報を取得します。
   * 処理権限者コードの設定は必須です。
   * 処理権限者の担当組織情報の配列が指定された場合は処理した時の担当組織が一致した案件のみ取得します。
   * 担当組織で絞込みを行う場合は組織フィルタリング対象のフローID の配列を設定する必要があります。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuth(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（案件フィルタリング条件付き、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuth と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（案件フィルタリング条件 + フローID 指定）。
   *
   * 基本仕様は getProcessedListWithAuth と同じです。
   * flowId にフローIDを指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（案件フィルタリング条件 + フローID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuthFlow と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthFlowAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（案件フィルタリング条件 + フローグループID 指定）。
   *
   * 基本仕様は getProcessedListWithAuth と同じです。
   * flowGroupId にフローグループIDを指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowGroupId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  /**
   * ユーザが処理した未完了案件一覧を取得します（案件フィルタリング条件 + フローグループID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuthFlowGroup と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報（引戻し可能フラグを含む）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthFlowGroupAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowGroupId: string): WorkflowResultInfo<ActvMatterPullBackInfo[]>;

  // ==================== getProcessedListWithAuthCount 系 ====================

  /**
   * ユーザが処理した未完了案件件数を取得します（案件フィルタリング条件付き）。
   *
   * 案件フィルタリング条件が指定された場合は処理権限者の案件に対して絞り込んだ件数を取得します。
   * 処理権限者コードの設定は必須です。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCount(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（案件フィルタリング条件付き、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuthCount と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（案件フィルタリング条件 + フローID 指定）。
   *
   * 基本仕様は getProcessedListWithAuthCount と同じです。
   * flowId にフローIDを指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountFlow(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（案件フィルタリング条件 + フローID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuthCountFlow と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowId フローID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountFlowAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（案件フィルタリング条件 + フローグループID 指定）。
   *
   * 基本仕様は getProcessedListWithAuthCount と同じです。
   * flowGroupId にフローグループIDを指定することで、より効率的なデータベース検索処理で取得します。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountFlowGroup(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数を取得します（案件フィルタリング条件 + フローグループID 指定、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuthCountFlowGroup と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @param flowGroupId フローグループID
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountFlowGroupAsync(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition, filterCond: MatterFilterConditionInfo, flowGroupId: string): WorkflowResultInfo<number>;

  /**
   * ユーザが処理した未完了案件件数をフローID 毎に取得します（案件フィルタリング条件付き）。
   *
   * キーがフローID、値がフローID 毎の未完了案件情報件数のマップを返却します。
   * 案件フィルタリング条件が null の場合等は getProcessedListCountForEachFlow と同じ情報を取得します。
   *
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data にキーがフローID (string)、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountForEachFlow(filterCond: MatterFilterConditionInfo): WorkflowResultInfo<ProcessedActvMatterList.CountForEachFlowResult>;

  /**
   * ユーザが処理した未完了案件件数をフローID 毎に取得します（案件フィルタリング条件付き、到達処理中・案件終了処理中の案件を含む）。
   *
   * 基本仕様は getProcessedListWithAuthCountForEachFlow と同じです。
   * 到達処理又は案件終了処理が実行中である案件も取得対象に含めます（8.0.32 で追加）。
   *
   * @param filterCond 案件フィルタリング条件オブジェクト
   * @return data にキーがフローID (string)、値がフローID 毎の件数 (number) のマップを格納した WorkflowResultInfo
   */
  getProcessedListWithAuthCountForEachFlowAsync(filterCond: MatterFilterConditionInfo): WorkflowResultInfo<ProcessedActvMatterList.CountForEachFlowResult>;
}

declare namespace ProcessedActvMatterList {
  type CountForEachFlowResult = { [flowId: string]: number };
}
