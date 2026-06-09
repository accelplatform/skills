/**
 * 役職情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyPostInfo/index.html
 */
interface CompanyPostInfo {
  /** 会社コード */
  companyCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 組織セットコード */
  departmentSetCd: string;
  /** 期間終了日 */
  endDate: Date;
  /** 国際化データ */
  locales: CompanyPostInfo.Locales;
  /** 役職コード */
  postCd: string;
  /** ランク */
  rank: number;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
  /** 期間開始日 */
  startDate: Date;
  /** 期間コード */
  termCd: string;
}

declare namespace CompanyPostInfo {
  type Locales = { [localeId: string]: LocalizedCompanyPostInfo };

  interface LocalizedCompanyPostInfo {
    /** 役職名 */
    postName: string;
    /** 備考 */
    notes: string;
  }
}
