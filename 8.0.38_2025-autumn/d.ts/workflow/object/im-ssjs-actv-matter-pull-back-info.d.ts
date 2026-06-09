/**
 * 未完了案件引戻し情報オブジェクト。
 *
 * 引戻し可能な案件ノードの情報を保持します。
 * このオブジェクトにはデータベーステーブル「imw_t_actv_matter」、「imw_t_actv_matter_locale」、
 * 「imw_t_cpl_task」のデータが設定されます。
 * 引戻しの判断フラグ情報は「imw_t_before_task」から取得します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvMatterPullBackInfo/index.html
 */
interface ActvMatterPullBackInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フロー名 */
  readonly flowName: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** 案件名 */
  readonly matterName: string;
  /** システム案件ID */
  readonly systemMatterId: string;
  /** ユーザデータID */
  readonly userDataId: string;

  // --- NULLABLE プロパティ ---

  /** 申請代理フラグ（'0': 代理設定なし / '1': 代理設定あり） */
  readonly applyActFlag?: FlagStatus;
  /** 申請権限者コード */
  readonly applyAuthUserCode?: string;
  /** 申請権限者名 */
  readonly applyAuthUserName?: string;
  /** 申請基準日（'yyyy/MM/dd' 形式の文字列） */
  readonly applyBaseDate?: string;
  /** 申請日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly applyDate?: string;
  /** 申請実行者コード */
  readonly applyExecuteUserCode?: string;
  /** 申請実行者名 */
  readonly applyExecuteUserName?: string;
  /** 最終処理日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly lastProcessDate?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティ情報オブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
  /** 引戻し可能フラグ（'0': 引戻し不可 / '1': 引戻し可） */
  readonly pullbackableFlag?: FlagStatus;
}
