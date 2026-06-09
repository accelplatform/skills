/**
 * 確認一覧（未完了案件）マネージャ。
 *
 * 未完了案件に対して、コンストラクタに指定したユーザが、確認できる案件や一括で確認できる案件のリストを取得します。
 *
 * 本オブジェクトでは「imw_t_actv」で始まるトランザクション系の未完了案件関連テーブルから情報を取得します。
 * 完了した案件に対して、確認一覧を取得するには CnfmCplMatterList を利用してください。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CnfmActvMatterList/index.html
 */
declare class CnfmActvMatterList {
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
  /** 検索・ソートの対象項目：到達日（'yyyy/MM/dd HH:mm:ss' 形式の文字列） */
  static readonly ARRIVED_DATE: string;
  /** 検索・ソートの対象項目：確認者会社コード */
  static readonly COMPANY_CODE: string;
  /** 検索・ソートの対象項目：確認済みフラグ */
  static readonly CONFIRM_CPL_FLAG: string;
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
  /** 検索・ソートの対象項目：確認者組織コード */
  static readonly ORGZ_CODE: string;
  /** 検索・ソートの対象項目：確認者組織名 */
  static readonly ORGZ_NAME: string;
  /** 検索・ソートの対象項目：確認者組織セットコード */
  static readonly ORGZ_SET_CODE: string;
  /** 検索・ソートの対象項目：優先度 */
  static readonly PRIORITY_LEVEL: string;
  /** 検索・ソートの対象項目：システム案件ID */
  static readonly SYSTEM_MATTER_ID: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 確認一覧（未完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   */
  constructor(userCd: string);

  /**
   * 確認一覧（未完了案件）マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID
   */
  constructor(userCd: string, localeId: string);

  // ==================== getCnfmList 系 ====================

  /**
   * ユーザが確認できる未完了案件一覧を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmList(cond: ListSearchCondition): WorkflowResultInfo<ActvMatterCnfmInfo[]>;

  /**
   * ユーザが確認できる未完了案件一覧を取得します（到達処理中の案件を含む）。
   *
   * getCnfmList との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getCnfmListAsync(cond: ListSearchCondition): WorkflowResultInfo<ActvMatterCnfmInfo[]>;

  /**
   * ユーザが確認できる未完了案件件数を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）件数 (number) を格納した WorkflowResultInfo
   */
  getCnfmListCount(cond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが確認できる未完了案件件数を取得します（到達処理中の案件を含む）。
   *
   * getCnfmListCount との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）件数 (number) を格納した WorkflowResultInfo
   */
  getCnfmListCountAsync(cond: ListSearchCondition): WorkflowResultInfo<number>;

  // ==================== getCountForEachFlow 系 ====================

  /**
   * 確認済み未完了案件件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の確認済み未完了案件件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getConfirmedCountForEachFlow(): WorkflowResultInfo<CnfmActvMatterList.CountForEachFlowResult>;

  /**
   * 確認済み未完了案件件数をフロー毎に取得します（到達処理中の案件を含む）。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getConfirmedCountForEachFlowAsync(): WorkflowResultInfo<CnfmActvMatterList.CountForEachFlowResult>;

  /**
   * 未確認未完了案件件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の未確認未完了案件件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getUnconfirmedCountForEachFlow(): WorkflowResultInfo<CnfmActvMatterList.CountForEachFlowResult>;

  /**
   * 未確認未完了案件件数をフロー毎に取得します（到達処理中の案件を含む）。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getUnconfirmedCountForEachFlowAsync(): WorkflowResultInfo<CnfmActvMatterList.CountForEachFlowResult>;

  // ==================== getLumpCnfmList 系 ====================

  /**
   * ユーザが一括確認できる未完了案件一覧を取得します。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括確認可能な案件のみを取得します。
   * true の場合、以下のカラムに設定された値は無視されます：
   * AUTH_COMPANY_CODE, AUTH_ORGZ_CODE, AUTH_ORGZ_NAME, AUTH_ORGZ_SET_CODE,
   * COMPANY_CODE, ORGZ_SET_CODE, ORGZ_CODE, ORGZ_NAME
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpCnfmList(noOrgzConditionFlag: boolean, cond: ListSearchCondition): WorkflowResultInfo<ActvMatterCnfmInfo[]>;

  /**
   * ユーザが一括確認できる未完了案件一覧を取得します（到達処理中の案件を含む）。
   *
   * getLumpCnfmList との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getLumpCnfmListAsync(noOrgzConditionFlag: boolean, cond: ListSearchCondition): WorkflowResultInfo<ActvMatterCnfmInfo[]>;

  /**
   * ユーザが一括確認できる未完了案件件数を取得します。
   *
   * noOrgzConditionFlag を true に指定した場合、組織が指定されていない一括確認可能な案件のみを取得します。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）件数 (number) を格納した WorkflowResultInfo
   */
  getLumpCnfmListCount(noOrgzConditionFlag: boolean, cond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが一括確認できる未完了案件件数を取得します（到達処理中の案件を含む）。
   *
   * getLumpCnfmListCount との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param noOrgzConditionFlag 組織なし条件フラグ
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（確認用）件数 (number) を格納した WorkflowResultInfo
   */
  getLumpCnfmListCountAsync(noOrgzConditionFlag: boolean, cond: ListSearchCondition): WorkflowResultInfo<number>;
}

declare namespace CnfmActvMatterList {
  type CountForEachFlowResult = { [flowId: string]: number };
}
