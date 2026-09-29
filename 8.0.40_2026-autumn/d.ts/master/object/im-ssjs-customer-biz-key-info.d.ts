/**
 * 取引先ビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CustomerBizKeyInfo/index.html
 */
interface CustomerBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 取引先コード */
  customerCd: string;
}
