/**
 * 会社グループリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyGroupListNodeInfo/index.html
 */
interface CompanyGroupListNodeInfo {
  /** 会社グループコード */
  companyGroupCd: string;
  /** 会社グループセットコード */
  companyGroupSetCd: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 説明 */
  description: string;
  /** 表示名 */
  displayName: string;
  /** 略称 */
  shortName: string;
}
