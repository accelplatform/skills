/**
 * 会社グループ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CompanyGroupInfo/index.html
 */
interface CompanyGroupInfo {
  /** 会社グループコード */
  companyGroupCd: string;
  /** 会社グループセットコード */
  companyGroupSetCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 国際化情報 */
  locales: CompanyGroupInfo.Locales;
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

declare namespace CompanyGroupInfo {
  type Locales = { [localeId: string]: LocalizedCompanyGroupInfo };

  interface LocalizedCompanyGroupInfo {
    /** 会社グループ名 */
    companyGroupName: string;
    /** 会社グループ検索名 */
    companyGroupSearchName: string;
    /** 会社グループ略称 */
    companyGroupShortName: string;
    /** 備考 */
    notes: string;
  }
}
