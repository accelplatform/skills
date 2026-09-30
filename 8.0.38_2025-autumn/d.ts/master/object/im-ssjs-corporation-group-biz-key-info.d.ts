/**
 * 法人グループビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationGroupBizKeyInfo/index.html
 */
interface CorporationGroupBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 法人グループコード */
  corporationGroupCd: string;
  /** 法人グループセットコード */
  corporationGroupSetCd: string;
}
