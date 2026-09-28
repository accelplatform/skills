/**
 * 案件状態情報オブジェクト。
 *
 * 特定の案件の案件状態情報を格納します。
 * 案件のステータスによって、このオブジェクトには、
 * 未完了「imw_t_actv_matter」、完了「imw_t_cpl_matter」、過去「imw_ayyyymm_matter」テーブルからのデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UserMatterStatusInfo/index.html
 */
interface UserMatterStatusInfo {
  // --- NOT NULL プロパティ ---

  /** フローID */
  readonly flowId: string;
  /** フローバージョンID */
  readonly flowVersionId: string;
  /** システム案件ID */
  readonly systemMatterId: string;
  /** ユーザデータID */
  readonly userDataId: string;

  // --- NULLABLE プロパティ ---

  /** アーカイブ年月（yyyyMM） */
  readonly archiveMonth?: string;
  /** 案件完了状態 */
  readonly matterEndStatusCode?: MatterEndStatus;
  /** 案件状態 */
  readonly matterStatusCode?: MatterStatus;
}
