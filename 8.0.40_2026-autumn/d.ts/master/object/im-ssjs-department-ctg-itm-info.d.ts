/**
 * 組織分類項目情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentCtgItmInfo/index.html
 */
interface DepartmentCtgItmInfo {
  /** 分類コード */
  categoryCd: string;
  /** 分類項目コード */
  categoryItemCd: string;
  /** 会社コード */
  companyCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: DepartmentCtgItmInfo.Locales;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace DepartmentCtgItmInfo {
  type Locales = { [localeId: string]: LocalizedDepartmentCtgItmInfo };

  interface LocalizedDepartmentCtgItmInfo {
    /** 分類項目名 */
    categoryItemName: string;
    /** 備考 */
    notes: string;
  }
}
