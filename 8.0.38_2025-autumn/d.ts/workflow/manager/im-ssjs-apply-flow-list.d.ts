/**
 * 申請一覧マネージャ。
 *
 * コンストラクタに指定したユーザが申請可能なフローの一覧（本人権限・代理権限）を取得します。
 * フロー関連情報は「imw_m_flow」、「imw_m_flow_detail」、ルート関連情報は「imw_m_route_detail」、
 * コンテンツ・プラグイン情報は「imw_m_route_plugin」、「imw_m_contents_detail」から取得します。
 *
 * オブジェクトに定義されている定数値は検索、ソート条件で利用されますが、
 * 返却オブジェクトに指定されていないフィールドでのソートはできません。
 *
 * 組織権限条件（OrgzAuthConditionInfo）に有意な値を指定した場合、申請ノードの処理対象者として以下のプラグインのみが
 * 設定されているフローは検索されません。
 * - 組織とその上位組織全て（＋役職 / ＋ロール）
 * - 組織とその下位組織全て（＋役職 / ＋ロール）
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ApplyFlowList/index.html
 */
declare class ApplyFlowList {
  // --- 検索・ソート条件定数（ApplyFlowType 由来）---

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
  /** 検索・ソートの対象項目：備考（フローバージョン） */
  static readonly FLOW_VERSION_NOTE: string;
  /** 検索・ソートの対象項目：システム日で対象者を展開するフラグ */
  static readonly SYS_DATE_TARGET_EXPAND_FLAG: string;

  /**
   * 申請一覧マネージャのインスタンスを生成します。
   *
   * @param userCd ユーザコード
   * @param localeId ロケールID（省略時はログインユーザのロケール）
   */
  constructor(userCd: string, localeId?: string);

  // ==================== 本人権限 ====================

  /**
   * ユーザが本人権限で申請可能なフローの一覧を取得します。
   *
   * applyBaseDate（申請基準日）を基準に取得します。形式が 'yyyy/MM/dd' でない場合はエラー情報を格納した結果を返却します。
   *
   * orgzAuthCond は必須の引数です（絞り込まない場合は空のオブジェクト {} を渡します。null・未指定はエラー）。
   * 会社コード・組織セットコード・組織コードの 3 項目を全て設定した場合のみ、ユーザの所属組織の絞り込み条件として使用します。
   *
   * 検索条件オブジェクトの設定は必須です。
   * 条件を設定しない場合でもインスタンスを作成して設定する必要があります。
   * 検索結果が存在しない場合は data 属性にサイズ 0 の配列を返却します。
   *
   * @param applyBaseDate 申請基準日（'yyyy/MM/dd' 形式の文字列）
   * @param orgzAuthCond 組織権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト（案件プロパティなし）
   * @return data にユーザ申請用フロー情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getApplyFlowList(applyBaseDate: string, orgzAuthCond: OrgzAuthConditionInfo, listSearchCond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<ApplyFlowInfo[]>;

  /**
   * ユーザが本人権限で申請可能なフローの件数を取得します。
   *
   * 引数の仕様は getApplyFlowList と同じです。
   *
   * @param applyBaseDate 申請基準日（'yyyy/MM/dd' 形式の文字列）
   * @param orgzAuthCond 組織権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト（案件プロパティなし）
   * @return data に申請可能なフロー件数 (number) を格納した WorkflowResultInfo
   */
  getApplyFlowListCount(applyBaseDate: string, orgzAuthCond: OrgzAuthConditionInfo, listSearchCond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<number>;

  // ==================== 代理権限 ====================

  /**
   * ユーザが代理権限で、指定した代理元ユーザの申請可能なフローの一覧を取得します。
   *
   * 代理の情報は申請基準日ではなくシステム日付で取得します（代理設定の変更は即時に反映されます）。
   * 取得するには「申請権限」を持つ代理の設定が必要です。
   * その他の引数の仕様は getApplyFlowList と同じです。
   *
   * @param applyBaseDate 申請基準日（'yyyy/MM/dd' 形式の文字列）
   * @param originalActUserCode 代理元ユーザコード
   * @param orgzAuthCond 組織権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト（案件プロパティなし）
   * @return data にユーザ申請用フロー情報オブジェクトの配列を格納した WorkflowResultInfo
   */
  getActApplyFlowList(applyBaseDate: string, originalActUserCode: string, orgzAuthCond: OrgzAuthConditionInfo, listSearchCond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<ApplyFlowInfo[]>;

  /**
   * ユーザが代理権限で、指定した代理元ユーザの申請可能なフローの件数を取得します。
   *
   * 引数の仕様は getActApplyFlowList と同じです。
   *
   * @param applyBaseDate 申請基準日（'yyyy/MM/dd' 形式の文字列）
   * @param originalActUserCode 代理元ユーザコード
   * @param orgzAuthCond 組織権限条件オブジェクト
   * @param listSearchCond 検索条件オブジェクト（案件プロパティなし）
   * @return data に申請可能なフロー件数 (number) を格納した WorkflowResultInfo
   */
  getActApplyFlowListCount(applyBaseDate: string, originalActUserCode: string, orgzAuthCond: OrgzAuthConditionInfo, listSearchCond: ListSearchConditionNoMatterProperty): WorkflowResultInfo<number>;
}
