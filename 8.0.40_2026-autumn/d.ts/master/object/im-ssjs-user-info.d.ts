/**
 * ユーザ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserInfo/index.html
 */
interface UserInfo {
  /** デフォルトロケールID */
  defaultLocale: string;
  /** ユーザコード */
  userCd: string;
  /** 期間コード */
  termCd: string;
  /** 開始日 */
  startDate: Date;
  /** 終了日 */
  endDate: Date;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 性別 */
  sex: string;
  /** ソートキー */
  sortKey: number;
  /** 最終更新者 */
  recordUserCd: string;
  /** 最終更新日 */
  recordDate: Date;
  /** 国際化情報（キー: ロケールID、値: LocalizedUserInfo） */
  locales: UserInfo.Locales;
}

declare namespace UserInfo {
  type Locales = { [localeId: string]: LocalizedUserInfo };

  interface LocalizedUserInfo {
    /** 住所1 */
    address1: string;
    /** 住所2 */
    address2: string;
    /** 住所3 */
    address3: string;
    /** 国コード */
    countryCd: string;
    /** メールアドレス1 */
    emailAddress1: string;
    /** メールアドレス2 */
    emailAddress2: string;
    /** 内線 FAX 番号 */
    extensionFaxNumber: string;
    /** 内線番号 */
    extensionNumber: string;
    /** FAX 番号 */
    faxNumber: string;
    /** 携帯メールアドレス */
    mobileEmailAddress: string;
    /** 携帯電話番号 */
    mobileNumber: string;
    /** 備考 */
    notes: string;
    /** 電話番号 */
    telephoneNumber: string;
    /** URL */
    url: string;
    /** ユーザ名 */
    userName: string;
    /** ユーザ検索名 */
    userSearchName: string;
    /** 郵便番号 */
    zipCode: string;
  }
}
