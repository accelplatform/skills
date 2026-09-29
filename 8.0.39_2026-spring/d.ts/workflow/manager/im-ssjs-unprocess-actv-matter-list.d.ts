/**
 * 未処理一覧マネージャ。
 *
 * コンストラクタに指定したユーザが処理対象者になっている未完了案件の未処理一覧を取得します。
 * 取得される未完了案件は設定したユーザの権限で処理できる案件及び
 * 設定したユーザが代理先として設定された場合、代理元のユーザの権限で処理できる案件です。
 * 処理できる案件の一覧又は一括で処理できる一覧を取得するのができます。
 *
 * 本オブジェクトでは、処理できる案件単位で一覧を取得します。
 * １つの案件に２つ以上のノードが未処理の状態になっている場合でも、本オブジェクトのメソッドでは１つの案件情報としてまとめて取得することになります。
 * ノード単位で処理できる案件情報を分けて取得するには UnprocessActvMatterNodeList を利用してください。
 *
 * 本オブジェクトでは「imw_t_actv」で始まるトランザクション系の未完了案件関連テーブルから情報を取得します。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UnprocessActvMatterList/index.html
 */
declare class UnprocessActvMatterList {
  // --- 検索・ソート条件定数（ActvMatterUnprocessType 由来）---

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
  /** 検索・ソートの対象項目：システム案件ID */
  static readonly SYSTEM_MATTER_ID: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 未処理一覧マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(userCd: string, localeId?: string);

  // ==================== getProcessList 系 ====================

  /**
   * ユーザが処理可能な案件一覧を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * 権限取得フラグのいずれかを「1:取得あり」に設定する必要があります。
   * 全てのフラグを「0:取得なし」にした場合は、取得処理を行わずに data 属性にサイズ 0 の空配列を返却します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessList(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvMatterInfo[]>;

  /**
   * ユーザが処理可能な案件一覧を取得します（到達処理中の案件を含む）。
   *
   * getProcessList との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessListAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvMatterInfo[]>;

  /**
   * ユーザが処理可能な案件件数を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * 検索条件オブジェクトの設定は必須です。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCount(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが処理可能な案件件数を取得します（到達処理中の案件を含む）。
   *
   * getProcessListCount との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessListCountAsync(procAuthCond: ProcessAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  // ==================== getLumpProcessList 系 ====================

  /**
   * ユーザが一括処理可能な案件一覧を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * 検索条件オブジェクトの設定は必須です。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括処理可能な案件のみを取得します。
   * true の場合、以下のカラムに設定された値は無視されます：
   * AUTH_COMPANY_CODE, AUTH_ORGZ_CODE, AUTH_ORGZ_NAME, AUTH_ORGZ_SET_CODE,
   * COMPANY_CODE, ORGZ_SET_CODE, ORGZ_CODE, ORGZ_NAME
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessList(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvMatterInfo[]>;

  /**
   * ユーザが一括処理可能な案件一覧を取得します（到達処理中の案件を含む）。
   *
   * getLumpProcessList との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpProcessListAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<ActvMatterInfo[]>;

  /**
   * ユーザが一括処理可能な案件件数を取得します。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括処理可能な案件のみを取得します。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCount(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが一括処理可能な案件件数を取得します（到達処理中の案件を含む）。
   *
   * getLumpProcessListCount との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param procAuthCond 処理権限条件オブジェクト
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param listSearchCond 検索条件オブジェクト
   * @return data に未完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getLumpProcessListCountAsync(procAuthCond: ProcessAuthConditionInfo, noOrgzConditionFlag: boolean, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;
}
