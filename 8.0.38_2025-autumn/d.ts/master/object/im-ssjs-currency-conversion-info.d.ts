/**
 * 通貨換算コード情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyConversionInfo/index.html
 */
interface CurrencyConversionInfo {
  /** 会社コード */
  companyCd: string;
  /** 通貨換算コード */
  currencyConversionCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: CurrencyConversionInfo.Locales;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace CurrencyConversionInfo {
  type Locales = { [localeId: string]: LocalizedCurrencyConversionInfo };

  interface LocalizedCurrencyConversionInfo {
    /** 通貨換算コード名 */
    currencyConvName: string;
    /** 通貨換算コード検索名 */
    currencyConvSearchName: string;
    /** 通貨換算コード略称 */
    currencyConvShortName: string;
  }
}
