/**
 * ユーザ分類項目情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserCtgItmInfo/index.html
 */
interface UserCtgItmInfo {
  /** 分類コード */
  categoryCd: string;
  /** 分類項目コード */
  categoryItemCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報（キー: ロケールID、値: LocalizedUserCtgItmInfo） */
  locales: UserCtgItmInfo.Locales;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace UserCtgItmInfo {
  type Locales = { [localeId: string]: LocalizedUserCtgItmInfo };

  interface LocalizedUserCtgItmInfo {
    /** 分類項目名 */
    categoryItemName: string;
    /** 備考 */
    notes: string;
  }
}
