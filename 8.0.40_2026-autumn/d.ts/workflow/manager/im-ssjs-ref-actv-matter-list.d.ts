/**
 * 参照一覧（未完了案件）マネージャ。
 *
 * 処理中の未完了案件に対して、コンストラクタで指定した特定ユーザが参照できる案件の一覧を取得します。
 *
 * 特定のユーザをコンストラクタに設定せずに、ワークフロー運用管理者として全ての案件を参照したい場合は、
 * 管理者オブジェクトである RefActvMatterAdminList を利用してください。
 *
 * 本オブジェクトでは「imw_t_actv」で始まるトランザクション系の未完了案件関連テーブルから情報を取得します。
 * 完了した案件に対して、参照一覧を取得するには RefCplMatterList を利用してください。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/RefActvMatterList/index.html
 */
declare class RefActvMatterList {
  // --- 検索・ソート条件定数 ---

  /** 検索・ソートの対象項目：申請代理フラグ */
  static readonly APPLY_ACT_FLAG: string;
  /** 検索・ソートの対象項目：申請権限者コード */
  static readonly APPLY_AUTH_USER_CODE: string;
  /** 検索・ソートの対象項目：申請権限者名 */
  static readonly APPLY_AUTH_USER_NAME: string;
  /** 検索・ソートの対象項目：申請基準日 */
  static readonly APPLY_BASE_DATE: string;
  /** 検索・ソートの対象項目：申請日 */
  static readonly APPLY_DATE: string;
  /** 検索・ソートの対象項目：申請実行者コード */
  static readonly APPLY_EXECUTE_USER_CODE: string;
  /** 検索・ソートの対象項目：申請実行者名 */
  static readonly APPLY_EXECUTE_USER_NAME: string;
  /** 検索・ソートの対象項目：フローグループID */
  static readonly FLOW_GROUP_ID: string;
  /** 検索・ソートの対象項目：フローID */
  static readonly FLOW_ID: string;
  /** 検索・ソートの対象項目：フロー名 */
  static readonly FLOW_NAME: string;
  /** 検索・ソートの対象項目：フローバージョンID */
  static readonly FLOW_VERSION_ID: string;
  /** 検索・ソートの対象項目：最終処理日 */
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
   * 参照一覧（未完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   */
  constructor(userCd: string);

  /**
   * 参照一覧（未完了案件）マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID
   */
  constructor(userCd: string, localeId: string);

  // ==================== getRefList 系 ====================

  /**
   * ユーザが参照できる未完了案件一覧を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（参照用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getRefList(cond: ListSearchCondition): WorkflowResultInfo<ActvMatterRefInfo[]>;

  /**
   * ユーザが参照できる未完了案件一覧を取得します（到達処理中の案件を含む）。
   *
   * getRefList との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（参照用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getRefListAsync(cond: ListSearchCondition): WorkflowResultInfo<ActvMatterRefInfo[]>;

  /**
   * ユーザが参照できる未完了案件件数を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * IM-Workflow のシステム設定の「thread の設定」が非同期（標準）である場合、
   * 到達処理又は案件終了処理が実行中である案件は取得対象から除外されます。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（参照用）件数 (number) を格納した WorkflowResultInfo
   */
  getRefListCount(cond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが参照できる未完了案件件数を取得します（到達処理中の案件を含む）。
   *
   * getRefListCount との違いは、到達処理又は案件終了処理が実行中である案件も取得対象となる点です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に未完了案件情報（参照用）件数 (number) を格納した WorkflowResultInfo
   */
  getRefListCountAsync(cond: ListSearchCondition): WorkflowResultInfo<number>;

  // ==================== getRefListCountForEachFlow 系 ====================

  /**
   * ユーザが参照できる未完了案件件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の未完了案件情報（参照用）件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getRefListCountForEachFlow(): WorkflowResultInfo<RefActvMatterList.CountForEachFlowResult>;

  /**
   * ユーザが参照できる未完了案件件数をフロー毎に取得します（到達処理中の案件を含む）。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getRefListCountForEachFlowAsync(): WorkflowResultInfo<RefActvMatterList.CountForEachFlowResult>;
}

declare namespace RefActvMatterList {
  type CountForEachFlowResult = { [flowId: string]: number };
}
