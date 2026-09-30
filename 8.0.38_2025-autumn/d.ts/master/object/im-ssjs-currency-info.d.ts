/**
 * 通貨情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CurrencyInfo/index.html
 */
interface CurrencyInfo {
  /** 会社コード */
  companyCd: string;
  /** 通貨コード */
  currencyCd: string;
  /** 通貨 ISO コード */
  currencyIsoCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: CurrencyInfo.Locales;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
  /** 通貨単位記号 */
  unitSign: string;
}

declare namespace CurrencyInfo {
  type Locales = { [localeId: string]: LocalizedCurrencyInfo };

  interface LocalizedCurrencyInfo {
    /** 通貨名 */
    currencyName: string;
    /** 備考 */
    notes: string;
  }
}
