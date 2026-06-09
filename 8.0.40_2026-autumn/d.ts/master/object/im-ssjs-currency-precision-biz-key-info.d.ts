/**
 * 通貨精度ビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyPrecisionBizKeyInfo/index.html
 */
interface CurrencyPrecisionBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 通貨コード */
  currencyCd: string;
  /** 通貨精度区分 */
  currencyPrecisionType: string;
}
