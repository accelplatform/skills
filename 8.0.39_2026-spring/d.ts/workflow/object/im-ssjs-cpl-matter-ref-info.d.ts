/**
 * 完了案件情報（参照用）オブジェクト。
 *
 * 参照一覧用の完了案件情報を取得する処理で、処理結果である案件情報を保存するためのオブジェクトです。
 * 参照者情報は「imw_t_cpl_matter_handle_user」から、
 * 案件情報は「imw_t_cpl_matter」「imw_t_cpl_matter_locale」から取得します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/CplMatterRefInfo/index.html
 */
interface CplMatterRefInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フロー名 */
  readonly flowName: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** 案件名 */
  readonly matterName: string;
  /** タスクステータス */
  readonly status: TaskStatus;
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
  /** 申請日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly applyDate?: string;
  /** 申請基準日（'yyyy/MM/dd' 形式の文字列） */
  readonly applyBaseDate?: string;
  /** 申請実行者コード */
  readonly applyExecuteUserCode?: string;
  /** 申請実行者名 */
  readonly applyExecuteUserName?: string;
  /** 操作レベル */
  readonly handleLevel?: string;
  /** 案件終了日（'yyyy/MM/dd HH:mm:ss.SSS' 形式の文字列） */
  readonly matterCplDate?: string;
  /** 案件完了状態 */
  readonly matterEndStatus?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティオブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
}
