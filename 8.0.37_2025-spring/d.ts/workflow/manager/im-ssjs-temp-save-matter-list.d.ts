/**
 * 一時保存一覧マネージャ。
 *
 * コンストラクタに指定した特定ユーザが保存した一時保存案件の一覧情報を取得します。
 *
 * 特定ユーザを指定せずに、ユーザを検索条件として指定し、複数ユーザに関する情報を取得する場合には、
 * 管理者のオブジェクトである TempSaveMatterAdminList を使用してください。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TempSaveMatterList/index.html
 */
declare class TempSaveMatterList {
  // --- 検索・ソート条件定数 ---

  /** 検索・ソートの対象項目：代理フラグ */
  static readonly ACT_FLAG: string;
  /** 検索・ソートの対象項目：申請基準日（'yyyy/MM/dd' 形式の文字列） */
  static readonly APPLY_BASE_DATE: string;
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
  /** 検索・ソートの対象項目：備考（フロー） */
  static readonly FLOW_NOTE: string;
  /** 検索・ソートの対象項目：フローバージョンID */
  static readonly FLOW_VERSION_ID: string;
  /** 検索・ソートの対象項目：案件名 */
  static readonly MATTER_NAME: string;
  /** 検索・ソートの対象項目：申請ノードID */
  static readonly NODE_ID: string;
  /** 検索・ソートの対象項目：処理コメント */
  static readonly PROCESS_COMMENT: string;
  /** 検索・ソートの対象項目：保存日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  static readonly SAVE_DATE: string;
  /** 検索・ソートの対象項目：ユーザデータID */
  static readonly USER_DATA_ID: string;

  /**
   * 一時保存一覧マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   */
  constructor(userCd: string);

  /**
   * 一時保存一覧マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID
   */
  constructor(userCd: string, localeId: string);

  /**
   * 特定ユーザが保存した一時保存情報一覧を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param cond 検索条件オブジェクト
   * @return data にユーザ一時保存案件情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getTempSaveMatterList(cond: ListSearchCondition): WorkflowResultInfo<TempSaveMatterInfo[]>;

  /**
   * 特定ユーザが保存した一時保存情報の件数を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param cond 検索条件オブジェクト
   * @return data にユーザ一時保存案件情報件数 (number) を格納した WorkflowResultInfo
   */
  getTempSaveMatterListCount(cond: ListSearchCondition): WorkflowResultInfo<number>;

  /**
   * 特定ユーザが保存した一時保存情報の件数をフロー毎に取得します。
   *
   * キーがフローID、値がフローID 毎の一時保存情報件数のマップを返却します。
   *
   * @return data にキーがフローID (string)、値が件数 (number) のマップを格納した WorkflowResultInfo
   */
  getTempSaveMatterListCountForEachFlow(): WorkflowResultInfo<TempSaveMatterList.CountForEachFlowResult>;
}

declare namespace TempSaveMatterList {
  type CountForEachFlowResult = { [flowId: string]: number };
}
