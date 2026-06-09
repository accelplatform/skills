/**
 * 通貨レート情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyRateInfo/index.html
 */
interface CurrencyRateInfo {
  /** 相手先通貨コード */
  baseCurrencyCd: string;
  /** 会社コード */
  companyCd: string;
  /** 通貨コード */
  currencyCd: string;
  /** 通貨換算コード */
  currencyConversionCd: string;
  /** 通貨レート */
  currencyRate: number;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
  /** 開始日 */
  startDate: Date;
  /** 期間コード */
  termCd: string;
}
