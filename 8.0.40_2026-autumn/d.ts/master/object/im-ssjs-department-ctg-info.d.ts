/**
 * 組織分類情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/DepartmentCtgInfo/index.html
 */
interface DepartmentCtgInfo {
  /** 分類コード */
  categoryCd: string;
  /** 分類種別 */
  categoryType: string;
  /** 会社コード */
  companyCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: DepartmentCtgInfo.Locales;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace DepartmentCtgInfo {
  type Locales = { [localeId: string]: LocalizedDepartmentCtgInfo };

  interface LocalizedDepartmentCtgInfo {
    /** 分類名 */
    categoryName: string;
    /** 備考 */
    notes: string;
  }
}
