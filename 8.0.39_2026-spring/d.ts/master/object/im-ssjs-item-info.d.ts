/**
 * 品目情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/ItemInfo/index.html
 */
interface ItemInfo {
  /** 会社コード */
  companyCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 品目コード */
  itemCd: string;
  /** 国際化情報 */
  locales: ItemInfo.Locales;
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

declare namespace ItemInfo {
  type Locales = { [localeId: string]: LocalizedItemInfo };

  interface LocalizedItemInfo {
    /** 品目名 */
    itemName: string;
    /** 品目検索名 */
    itemSearchName: string;
    /** 品目略称 */
    itemShortName: string;
    /** 備考 */
    notes: string;
  }
}
