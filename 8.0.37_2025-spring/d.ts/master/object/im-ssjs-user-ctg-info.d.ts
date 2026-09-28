/**
 * ユーザ分類情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/UserCtgInfo/index.html
 */
interface UserCtgInfo {
  /** 分類コード */
  categoryCd: string;
  /** 分類タイプ */
  categoryType: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報（キー: ロケールID、値: LocalizedUserCtgInfo） */
  locales: UserCtgInfo.Locales;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace UserCtgInfo {
  type Locales = { [localeId: string]: LocalizedUserCtgInfo };

  interface LocalizedUserCtgInfo {
    /** 分類項目名 */
    categoryItemName: string;
    /** 備考 */
    notes: string;
  }
}
