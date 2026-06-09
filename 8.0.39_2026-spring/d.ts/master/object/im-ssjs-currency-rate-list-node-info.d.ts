/**
 * 通貨レートリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyRateListNodeInfo/index.html
 */
interface CurrencyRateListNodeInfo {
  /** 相手先通貨コード */
  readonly baseCurrencyCd: string;
  /** 会社コード */
  readonly companyCd: string;
  /** 通貨コード */
  readonly currencyCd: string;
  /** 通貨換算コード */
  readonly currencyConversionCd: string;
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 表示名 */
  readonly description: string;
  /** 記述名 */
  readonly displayName: string;
}
