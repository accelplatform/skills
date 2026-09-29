/**
 * 処理済一覧（完了案件）ノードマネージャ。
 *
 * コンストラクタに指定したユーザが処理した完了案件の処理済みノード一覧を取得します。
 * 取得される完了案件は設定したユーザの権限で処理した案件及び
 * 設定したユーザが代理先として設定された場合、代理元のユーザの権限で処理した案件です。
 *
 * 本オブジェクトでは、処理したノード単位で一覧を取得します。
 * 1つの案件に2つ以上のノードが処理された状態であれば、ノード毎の処理したノード情報が取得されます。
 * 案件単位で取得するには ProcessedCplMatterList を利用してください。
 *
 * 本オブジェクトでは「imw_t_cpl」で始まるトランザクション系の完了案件関連テーブルから情報を取得します。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ProcessedCplMatterNodeList/index.html
 */
declare class ProcessedCplMatterNodeList {
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
  /** 検索・ソートの対象項目：処理日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  static readonly END_DATE: string;
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
  /** 検索・ソートの対象項目：操作者コード */
  static readonly OPERATE_USER_CODE: string;
  /** 検索・ソートの対象項目：操作者名 */
  static readonly OPERATE_USER_NAME: string;
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
   * 処理済一覧（完了案件）ノードマネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(userCd: string, localeId?: string);

  // ==================== getProcessedList 系 ====================

  /**
   * ユーザが処理した完了案件ノード一覧を取得します。
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
   * @return data に処理済ノード情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getProcessedList(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<CplNodeInfo[]>;

  // ==================== getProcessedListCount 系 ====================

  /**
   * ユーザが処理した完了案件ノード件数を取得します。
   *
   * 処理権限条件オブジェクトの設定は必須です。
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param processedAuthCond 処理権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト
   * @return data に処理済ノード情報件数 (number) を格納した WorkflowResultInfo
   */
  getProcessedListCount(processedAuthCond: ProcessedAuthConditionInfo, listSearchCond: ListSearchCondition): WorkflowResultInfo<number>;
}
