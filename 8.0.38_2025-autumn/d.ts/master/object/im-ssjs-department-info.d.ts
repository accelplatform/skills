/**
 * 組織情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentInfo/index.html
 */
interface DepartmentInfo {
  /** 会社コード */
  companyCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 組織コード */
  departmentCd: string;
  /** 組織セットコード */
  departmentSetCd: string;
  /** 終了日 */
  endDate: Date;
  /** 国際化情報 */
  locales: DepartmentInfo.Locales;
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

declare namespace DepartmentInfo {
  type Locales = { [localeId: string]: LocalizedDepartmentInfo };

  interface LocalizedDepartmentInfo {
    /** 住所１ */
    address1: string;
    /** 住所２ */
    address2: string;
    /** 住所３ */
    address3: string;
    /** 国コード */
    countryCd: string;
    /** 組織名 */
    departmentName: string;
    /** 組織検索名 */
    departmentSearchName: string;
    /** 組織略称 */
    departmentShortName: string;
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
