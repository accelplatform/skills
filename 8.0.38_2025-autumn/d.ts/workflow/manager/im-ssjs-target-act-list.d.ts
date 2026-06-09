/**
 * 代理先一覧マネージャ。
 *
 * 特定ユーザ（代理元ユーザ）に対して、代理先ユーザの一覧を取得します。
 * ユーザの代理や特定業務代理のリストを取得することができます。
 *
 * 本オブジェクトと逆機能である代理元一覧を取得したい場合には OriginalActList を使用します。
 * ユーザを検索条件として指定したい場合には管理者のオブジェクトである TargetActAdminList を使用します。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/TargetActList/index.html
 */
declare class TargetActList {
  // --- 検索・ソート条件定数 ---

  /** 検索・ソートの対象項目：申請権限 */
  static readonly APPLY_AUTH: string;
  /** 検索・ソートの対象項目：承認権限 */
  static readonly APPROVE_AUTH: string;
  /** 検索・ソートの対象項目：拡張ポイントID */
  static readonly EXTENSION_POINT_ID: string;
  /** 検索・ソートの対象項目：フローID（特定業務代理先専用） */
  static readonly FLOW_ID: string;
  /** 検索・ソートの対象項目：フロー名（特定業務代理先専用） */
  static readonly FLOW_NAME: string;
  /** 検索・ソートの対象項目：代理期間終了日（'yyyy/MM/dd' 形式の文字列） */
  static readonly LIMIT_DATE: string;
  /** 検索・ソートの対象項目：連番 */
  static readonly NO: string;
  /** 検索・ソートの対象項目：備考 */
  static readonly NOTE: string;
  /** 検索・ソートの対象項目：代理元対象コード（権限代理先専用） */
  static readonly ORIGINAL_ACT_TARGET_CODE: string;
  /** 検索・ソートの対象項目：代理元対象種別（権限代理先専用） */
  static readonly ORIGINAL_ACT_TARGET_TYPE: string;
  /** 検索・ソートの対象項目：パラメータ */
  static readonly PARAMETER: string;
  /** 検索・ソートの対象項目：プラグインID */
  static readonly PLUGIN_ID: string;
  /** 検索・ソートの対象項目：代理期間開始日（'yyyy/MM/dd' 形式の文字列） */
  static readonly START_DATE: string;
  /** 検索・ソートの対象項目：代理先ユーザコード（代理先専用） */
  static readonly TARGET_ACT_USER_CODE: string;

  /**
   * 代理先一覧マネージャのインスタンスを生成します。
   * ロケールID はログインユーザのロケールが使用されます。
   *
   * @param userCd ユーザコード
   */
  constructor(userCd: string);

  /**
   * 代理先一覧マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID
   */
  constructor(userCd: string, localeId: string);

  /**
   * 特定ユーザの代理先一覧を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   *
   * @param cond 検索条件オブジェクト
   * @return data に代理先情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getPersList(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<TargetPersActInfo[]>;

  /**
   * 特定ユーザの代理先件数を取得します。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に代理先情報件数 (number) を格納した WorkflowResultInfo
   */
  getPersListCount(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<number>;

  /**
   * 特定ユーザの特定業務代理先一覧を取得します。
   *
   * getPersList の検索条件と比べて、フロー関連検索条件が追加されています。
   * フローに対して設定した代理情報を取得することができます。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に特定業務代理先情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAppliList(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<TargetAppliActInfo[]>;

  /**
   * 特定ユーザの特定業務代理先件数を取得します。
   *
   * getPersListCount の検索条件と比べて、フロー関連検索条件が追加されています。
   *
   * 検索条件オブジェクトの設定は必須です。
   *
   * @param cond 検索条件オブジェクト
   * @return data に特定業務代理先情報件数 (number) を格納した WorkflowResultInfo
   */
  getAppliListCount(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<number>;

  /**
   * 特定ユーザの代理先・特定業務代理先・権限代理先ユーザ一覧を取得します。
   *
   * getAppliList と getPersList の結果でユーザ関連情報のみを同時に取得できます。
   * ユーザ情報は重複なし、かつ、ユーザ名の昇順によるソート済みで取得します。
   *
   * ソート機能に対応していないため、ソート条件は指定しないでください。
   *
   * @param cond 検索条件オブジェクト
   * @return data に簡易ユーザ情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getPersAppliUserList(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<SimpleUserInfo[]>;

  /**
   * 特定ユーザの代理先・特定業務代理先・権限代理先ユーザ件数を取得します。
   *
   * getAppliListCount と getPersListCount の結果でユーザ情報から重複なしのユーザ件数を取得します。
   *
   * @param cond 検索条件オブジェクト
   * @return data に代理先情報件数 (number) を格納した WorkflowResultInfo
   */
  getPersAppliUserListCount(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<number>;

  /**
   * 特定ユーザの権限代理先一覧を取得します。
   *
   * @param cond 検索条件オブジェクト
   * @return data に権限代理先情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getAuthList(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<TargetAuthActInfo[]>;

  /**
   * 特定ユーザの権限代理先件数を取得します。
   *
   * @param cond 検索条件オブジェクト
   * @return data に権限代理先情報件数 (number) を格納した WorkflowResultInfo
   */
  getAuthListCount(cond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<number>;
}
