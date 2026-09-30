/**
 * 案件フローの標準組織情報オブジェクト。
 *
 * 案件フロー情報・設定対象ノードセット情報（申請用・処理用）で標準組織情報を保持します。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/OrgzSetInfo/index.html
 */
interface OrgzSetInfo {
  // --- NULLABLE プロパティ ---

  /** 会社コード */
  readonly companyCode?: string;
  /** 組織セットコード */
  readonly orgzSetCode?: string;
}
