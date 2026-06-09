/**
 * 法人ビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationBizKeyInfo/index.html
 */
interface CorporationBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 法人コード */
  corporationCd: string;
}
