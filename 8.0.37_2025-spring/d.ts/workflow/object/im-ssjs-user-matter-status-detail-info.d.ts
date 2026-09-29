/**
 * 案件状態詳細情報オブジェクト。
 *
 * 特定の案件の案件状態詳細情報を格納します。
 * 案件の詳細情報と、案件完了状態、過去案件の場合にはアーカイブ年月の情報が格納されています。
 * 案件のステータスによって、このオブジェクトには、
 * 未完了「imw_t_actv_matter」「imw_t_actv_matter_locale」、
 * 完了「imw_t_cpl_matter」「imw_t_cpl_matter_locale」、
 * 過去「imw_ayyyymm_matter」「imw_ayyyymm_matter_locale」テーブルからのデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UserMatterStatusDetailInfo/index.html
 */
interface UserMatterStatusDetailInfo {
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

  /** 申請代理フラグ（0:代理設定なし / 1:代理設定あり） */
  readonly applyActFlag?: FlagStatus;
  /** 申請権限者コード */
  readonly applyAuthUserCode?: string;
  /** 申請権限者名 */
  readonly applyAuthUserName?: string;
  /** 申請基準日（'yyyy/MM/dd' 形式） */
  readonly applyBaseDate?: string;
  /** 申請日（'yyyy/MM/dd HH:mm:ss.SSS' 形式） */
  readonly applyDate?: string;
  /** 申請実行者コード */
  readonly applyExecuteUserCode?: string;
  /** 申請実行者名 */
  readonly applyExecuteUserName?: string;
  /** アーカイブ年月（yyyyMM） */
  readonly archiveMonth?: string;
  /** 最終処理日（'yyyy/MM/dd HH:mm:ss.SSS' 形式） */
  readonly lastProcessDate?: string;
  /** 案件終了日（'yyyy/MM/dd HH:mm:ss.SSS' 形式） */
  readonly matterCplDate?: string;
  /** 案件完了状態 */
  readonly matterEndStatusCode?: string;
  /** 案件番号 */
  readonly matterNumber?: string;
  /** ユーザデータ案件プロパティオブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 案件開始日（'yyyy/MM/dd HH:mm:ss.SSS' 形式） */
  readonly matterStartDate: string;
  /** 案件状態 */
  readonly matterStatusCode?: MatterStatus;
  /** 優先度 */
  readonly priorityLevel?: PriorityLevel;
}
