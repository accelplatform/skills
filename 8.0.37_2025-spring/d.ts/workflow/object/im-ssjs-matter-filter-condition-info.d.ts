/**
 * 案件フィルタリング条件オブジェクト。
 *
 * DB からデータを取得する際のフィルタリング条件を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/MatterFilterConditionInfo/index.html
 */
interface MatterFilterConditionInfo {
  // --- 任意項目 ---

  /** 処理権限者コード */
  authUserCd?: string;
  /** フローID の配列 */
  filterFlowIdList?: string[];
  /** 権限者所属組織情報オブジェクトの配列 */
  orgz?: AuthUserOrgzInfo[];
}
