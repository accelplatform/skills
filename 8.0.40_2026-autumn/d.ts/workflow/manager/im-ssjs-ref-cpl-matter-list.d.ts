/**
 * 参照一覧（完了案件）マネージャ。
 *
 * 完了案件に対して、コンストラクタで指定した特定ユーザが参照できる案件の一覧を取得します。
 *
 * 特定のユーザをコンストラクタに設定せずに、ワークフロー運用管理者として全ての案件を参照したい場合は、
 * 管理者オブジェクトである RefCplMatterAdminList を利用してください。
 *
 * 本オブジェクトでは「imw_t_cpl」で始まるトランザクション系の完了案件関連テーブルから情報を取得します。
 * 処理中の未完了案件に対して、参照一覧を取得するには RefActvMatterList を利用してください。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/RefCplMatterList/index.html
 */
declare class RefCplMatterList {
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
   * 参照一覧（完了案件）マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   */
  constructor(userCd: string);

  /**
   * 参照一覧（完了案件）マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID
   */
  constructor(userCd: string, localeId: string);

  /**
   * ユーザが参照できる完了案件一覧を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param cond 検索条件オブジェクト
   * @return data に完了案件情報（参照用）オブジェクトの配列を格納した WorkflowResultInfo
   */
  getRefList(cond: ListSearchCondition): WorkflowResultInfo<CplMatterRefInfo[]>;

  /**
   * ユーザが参照できる完了案件件数を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に完了案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getRefListCount(cond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * ユーザが参照できる完了案件件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の完了案件情報件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getRefListCountForEachFlow(): WorkflowResultInfo<RefCplMatterList.CountForEachFlowResult>;
}

declare namespace RefCplMatterList {
  type CountForEachFlowResult = { [flowId: string]: number };
}
