/**
 * 通貨換算コードビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyConversionBizKeyInfo/index.html
 */
interface CurrencyConversionBizKeyInfo {
  /** 会社コード */
  companyCd: string;
  /** 通貨換算コード */
  currencyConversionCd: string;
}
