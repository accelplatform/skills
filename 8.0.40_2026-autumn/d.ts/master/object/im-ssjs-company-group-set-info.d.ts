/**
 * 会社グループセット情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyGroupSetInfo/index.html
 */
interface CompanyGroupSetInfo {
  /** 会社グループセットコード */
  companyGroupSetCd: string;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}
