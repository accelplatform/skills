/**
 * 通貨レートビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyRateBizKeyInfo/index.html
 */
interface CurrencyRateBizKeyInfo {
  /** 相手先通貨コード */
  baseCurrencyCd: string;
  /** 会社コード */
  companyCd: string;
  /** 通貨コード */
  currencyCd: string;
  /** 通貨換算コード */
  currencyConversionCd: string;
}
