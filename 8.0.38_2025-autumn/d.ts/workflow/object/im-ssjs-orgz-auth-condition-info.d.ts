/**
 * 組織権限条件オブジェクト。
 *
 * ユーザが申請可能なフロー一覧（ApplyFlowList）を取得する際に、ユーザの所属組織を絞り込む追加条件として利用します。
 * 「会社コード」「組織セットコード」「組織コード」の 3 項目を全て指定した場合のみ条件として使用され、
 * 1 項目でも未設定の場合は無視されます（絞り込まない場合は空のオブジェクト {} を渡します。null は不可）。
 *
 * プロパティ名の綴り（authOragnization*）はプラットフォームの実装どおりです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/OrgzAuthConditionInfo/index.html
 */
interface OrgzAuthConditionInfo {
  // --- 任意項目 ---

  /** 権限者会社コード */
  authCompanyCode?: string;
  /** 権限者組織セットコード */
  authOragnizationSetCode?: string;
  /** 権限者組織コード */
  authOragnizationCode?: string;
}
