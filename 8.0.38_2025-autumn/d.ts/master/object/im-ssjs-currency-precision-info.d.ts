/**
 * 通貨精度情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyPrecisionInfo/index.html
 */
interface CurrencyPrecisionInfo {
  /** 会社コード */
  companyCd: string;
  /** 通貨コード */
  currencyCd: string;
  /** 通貨精度 */
  currencyPrecision: number;
  /** 通貨精度区分 */
  currencyPrecisionType: string;
  /** 通貨スケール */
  currencyScale: number;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: CurrencyPrecisionInfo.Locales;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace CurrencyPrecisionInfo {
  type Locales = { [localeId: string]: LocalizedCurrencyPrecisionInfo };

  interface LocalizedCurrencyPrecisionInfo {
    /** 通貨精度区分名 */
    currencyPrecTypeName: string;
    /** 通貨精度区分検索名 */
    currencyPrecTypeSearchName: string;
    /** 通貨精度区分略称 */
    currencyPrecTypeShortName: string;
  }
}
