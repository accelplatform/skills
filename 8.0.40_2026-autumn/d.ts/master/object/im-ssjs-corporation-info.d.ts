/**
 * 法人情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationInfo/index.html
 */
interface CorporationInfo {
  /** 会社コード */
  companyCd: string;
  /** 法人コード */
  corporationCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 国際化情報 */
  locales: CorporationInfo.Locales;
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

declare namespace CorporationInfo {
  type Locales = { [localeId: string]: LocalizedCorporationInfo };

  interface LocalizedCorporationInfo {
    /** 住所1 */
    address1: string;
    /** 住所2 */
    address2: string;
    /** 住所3 */
    address3: string;
    /** 法人番号 */
    corporateNumber: string;
    /** 法人名 */
    corporationName: string;
    /** 法人検索名 */
    corporationSearchName: string;
    /** 法人略称 */
    corporationShortName: string;
    /** 国コード */
    countryCd: string;
    /** メールアドレス１ */
    emailAddress1: string;
    /** メールアドレス２ */
    emailAddress2: string;
    /** 内線 FAX 番号 */
    extensionFaxNumber: string;
    /** 内線番号 */
    extensionNumber: string;
    /** FAX 番号 */
    faxNumber: string;
    /** 備考 */
    notes: string;
    /** 電話番号 */
    telephoneNumber: string;
    /** URL */
    url: string;
    /** 郵便番号 */
    zipCode: string;
  }
}
