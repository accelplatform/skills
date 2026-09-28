/**
 * 通貨ビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyBizKeyInfo/index.html
 */
interface CurrencyBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 通貨コード */
  currencyCd: string;
}
