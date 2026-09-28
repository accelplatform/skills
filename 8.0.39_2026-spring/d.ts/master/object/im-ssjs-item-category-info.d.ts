/**
 * 品目カテゴリ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemCategoryInfo/index.html
 */
interface ItemCategoryInfo {
  /** 会社コード */
  companyCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 品目カテゴリコード */
  itemCategoryCd: string;
  /** 品目カテゴリセットコード */
  itemCategorySetCd: string;
  /** 国際化情報 */
  locales: ItemCategoryInfo.Locales;
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

declare namespace ItemCategoryInfo {
  type Locales = { [localeId: string]: LocalizedItemCategoryInfo };

  interface LocalizedItemCategoryInfo {
    /** 品目カテゴリ名 */
    itemCategoryName: string;
    /** 品目カテゴリ検索名 */
    itemCategorySearchName: string;
    /** 品目カテゴリ略称 */
    itemCategoryShortName: string;
    /** 備考 */
    notes: string;
  }
}
