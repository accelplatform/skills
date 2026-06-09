/**
 * 取引先情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CustomerInfo/index.html
 */
interface CustomerInfo {
  /** 会社コード */
  companyCd: string;
  /** 取引先コード */
  customerCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 開始日 */
  startDate: Date;
  /** 終了日 */
  endDate: Date;
  /** 期間コード */
  termCd: string;
  /** ソートキー */
  sortKey: number;
  /** 最終更新者 */
  recordUserCd: string;
  /** 最終更新日 */
  recordDate: Date;
  /** 国際化情報（キー: ロケールID、値: LocalizedCustomerInfo） */
  locales: CustomerInfo.Locales;
}

declare namespace CustomerInfo {
  type Locales = { [localeId: string]: LocalizedCustomerInfo };

  interface LocalizedCustomerInfo {
    /** 取引先名 */
    customerName: string;
    /** 取引先略名 */
    customerShortName: string;
    /** 取引先検索名 */
    customerSearchName: string;
    /** 法人番号 */
    corporateNumber: string;
    /** 担当者名 */
    chargePersonName: string;
    /** 国コード */
    countryCd: string;
    /** 郵便番号 */
    zipCode: string;
    /** 住所1 */
    address1: string;
    /** 住所2 */
    address2: string;
    /** 住所3 */
    address3: string;
    /** 電話番号 */
    telephoneNumber: string;
    /** 内線番号 */
    extensionNumber: string;
    /** FAX 番号 */
    faxNumber: string;
    /** 内線 FAX 番号 */
    extensionFaxNumber: string;
    /** メールアドレス1 */
    emailAddress1: string;
    /** メールアドレス2 */
    emailAddress2: string;
    /** URL */
    url: string;
    /** 備考 */
    notes: string;
  }
}
