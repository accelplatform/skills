/**
 * 案件プロパティ状態情報オブジェクト。
 *
 * 特定の案件の案件プロパティ状態詳細情報を格納します。
 * 案件のプロパティ状態や、案件完了状態、過去案件の場合にはアーカイブ年月の情報が格納されています。
 * 案件のステータスによって、オブジェクト内にある「ユーザデータ案件プロパティオブジェクトの配列「UserMatterPropertyInfo」には、
 * 「imw_t_user_data」、「imw_t_cpl_matter_user_data」、「imw_ayyyymm_matter_user_data」のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/UserMatterPropertyStatusInfo/index.html
 */
interface UserMatterPropertyStatusInfo {
  // --- NOT NULL プロパティ ---

  /** ユーザデータID */
  readonly userDataId: string;

  // --- NULLABLE プロパティ ---

  /** アーカイブ年月（yyyyMM） */
  readonly archiveMonth?: string;
  /** ユーザデータ案件プロパティオブジェクトの配列 */
  readonly matterProperty?: UserMatterPropertyInfo[];
  /** 案件状態 */
  readonly matterStatusCode?: MatterStatus;
}
