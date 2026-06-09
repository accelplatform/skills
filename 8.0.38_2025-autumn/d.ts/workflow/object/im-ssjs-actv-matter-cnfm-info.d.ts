/**
 * 未完了案件情報（確認用）オブジェクト。
 *
 * 確認一覧用の未完了案件情報を保存します。
 * 本オブジェクトにマッピングされる値で、確認権限者情報は「imw_t_confirm_user」、「imw_t_confirm_orgz」から、
 * 案件情報は「imw_t_actv_matter」「imw_t_actv_matter_locale」から取得します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvMatterCnfmInfo/index.html
 */
interface ActvMatterCnfmInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フロー名 */
  readonly flowName: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** 案件名 */
  readonly matterName: string;
  /** 案件開始日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly matterStartDate: string;
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
  /** 確認済みフラグ（'0': 未確認 / '1': 確認済み） */
  readonly confirmCplFlag?: string;
  /** 最終処理日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly lastProcessDate?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティ情報オブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
}
