/**
 * 権限者所属組織情報オブジェクト。
 *
 * あるユーザが申請・承認・確認等の処理を行う際に、処理組織として選択できる所属組織を保持します。
 * このオブジェクトには、処理種別や案件ステータスによって、
 * 「imw_t_actv_user_orgz」や「imw_t_confirm_orgz」、「imw_t_cpl_matter_confirm_orgz」のデータが設定されます。
 *
 * 値の取得時にのみ使用します（新規作成・更新・削除には使用しません）。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_workflow/AuthUserOrgzInfo/index.html
 */
interface AuthUserOrgzInfo {
  // --- NOT NULL プロパティ ---

  /** 権限者会社コード */
  readonly companyCode: string;
  /** 権限者組織コード */
  readonly orgzCode: string;
  /** 権限者組織セットコード */
  readonly orgzSetCode: string;
  /** 権限者コード */
  readonly userCode: string;

  // --- NULLABLE プロパティ ---

  /** 権限者組織名 */
  readonly orgzName?: string;
}
