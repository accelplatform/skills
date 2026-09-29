/**
 * 未完了案件情報オブジェクト。
 *
 * 未完了案件の情報を保持するオブジェクトです。
 * データベーステーブル「imw_t_actv_matter」と「imw_t_actv_matter_locale」のデータが設定されます。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/ActvMatterInfo/index.html
 */
interface ActvMatterInfo {
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
  /** 最終処理日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly lastProcessDate?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティ情報オブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
}
