/**
 * 役職ビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyPostBizKeyInfo/index.html
 */
interface CompanyPostBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 組織セットコード */
  departmentSetCd: string;
  /** 役職コード */
  postCd: string;
}
