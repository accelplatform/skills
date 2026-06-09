/**
 * 確認一覧（完了案件）マネージャ。
 *
 * 完了案件に対して、コンストラクタに指定したユーザが、確認できる案件や一括で確認できる案件のリストを取得します。
 *
 * 本オブジェクトでは「imw_t_cpl」で始まるトランザクション系の完了案件関連テーブルから情報を取得します。
 * 処理中の未完了した案件に対して、確認一覧を取得するには CnfmActvMatterList を利用してください。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CnfmCplMatterList/index.html
 */
declare class CnfmCplMatterList {
  // --- 検索・ソート条件定数 ---

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
  /** 検索・ソートの対象項目：確認可能開始日時（'yyyy/MM/dd HH:mm:ss' 形式の文字列） */
  static readonly ARRIVED_DATE: string;
  /** 検索・ソートの対象項目：確認者会社コード */
  static readonly COMPANY_CODE: string;
  /** 検索・ソートの対象項目：確認済みフラグ */
  static readonly CONFIRM_CPL_FLAG: string;
  /** 検索・ソートの対象項目：確認可否フラグ */
  static readonly CONFIRM_FLAG: string;
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
  /** 検索・ソートの対象項目：確認者組織コード */
  static readonly ORGZ_CODE: string;
  /** 検索・ソートの対象項目：確認者組織名 */
  static readonly ORGZ_NAME: string;
  /** 検索・ソートの対象項目：確認者組織セットコード */
  static readonly ORGZ_SET_CODE: string;
  /** 検索・ソートの対象項目：優先度 */
  static readonly PRIORITY_LEVEL: string;
  /** 検索・ソートの対象項目：案件完了状態 */
  static readonly STATUS: string;
  /** 検索・ソートの対象項目：システム案件ID */
  static readonly SYSTEM_MATTER_ID: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 確認一覧（完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   */
  constructor(userCd: string);

  /**
   * 確認一覧（完了案件）マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID
   */
  constructor(userCd: string, localeId: string);

  // ==================== getCnfmUserSetList 系 ====================

  /**
   * ユーザが確認対象者として設定されている完了案件一覧を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param cond 検索条件オブジェクト
   * @return data に完了案件情報（確認用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmUserSetList(cond: ListSearchCondition): WorkflowResultInfo<CplMatterCnfmInfo[]>;

  /**
   * ユーザが確認対象者として設定されている完了案件件数を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に完了案件情報（確認用）件数 (number) を格納した WorkflowResultInfo
   */
  getCnfmUserSetListCount(cond: ListSearchCondition): WorkflowResultInfo<number>;

  // ==================== getCountForEachFlow 系 ====================

  /**
   * ユーザが確認できる未確認案件件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の未確認案件件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getConfirmedCountForEachFlow(): WorkflowResultInfo<CnfmCplMatterList.CountForEachFlowResult>;

  /**
   * 確認済み完了案件件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の確認済み完了案件件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getUnconfirmedCountForEachFlow(): WorkflowResultInfo<CnfmCplMatterList.CountForEachFlowResult>;

  // ==================== getLumpCnfmList 系 ====================

  /**
   * ユーザが一括確認できる完了案件一覧を取得します。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括確認可能な案件のみを取得します。
   * true の場合、以下のカラムに設定された値は無視されます：
   * AUTH_COMPANY_CODE, AUTH_ORGZ_CODE, AUTH_ORGZ_NAME, AUTH_ORGZ_SET_CODE,
   * COMPANY_CODE, ORGZ_SET_CODE, ORGZ_CODE, ORGZ_NAME
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param cond 検索条件オブジェクト
   * @return data に完了案件情報（確認用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpCnfmList(noOrgzConditionFlag: boolean, cond: ListSearchCondition): WorkflowResultInfo<CplMatterCnfmInfo[]>;

  /**
   * ユーザが一括確認できる完了案件件数を取得します。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括確認可能な案件のみを取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param cond 検索条件オブジェクト
   * @return data に完了案件情報（確認用）件数 (number) を格納した WorkflowResultInfo
   */
  getLumpCnfmListCount(noOrgzConditionFlag: boolean, cond: ListSearchCondition): WorkflowResultInfo<number>;
}

declare namespace CnfmCplMatterList {
  type CountForEachFlowResult = { [flowId: string]: number };
}
