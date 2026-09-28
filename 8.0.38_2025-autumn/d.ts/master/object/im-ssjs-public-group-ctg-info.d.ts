/**
 * パブリックグループ分類区分情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupCtgInfo/index.html
 */
interface PublicGroupCtgInfo {
  /** 分類コード */
  categoryCd: string;
  /** 分類タイプ */
  categoryType: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: PublicGroupCtgInfo.Locales;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace PublicGroupCtgInfo {
  type Locales = { [localeId: string]: LocalizedPublicGroupCtgInfo };

  interface LocalizedPublicGroupCtgInfo {
    /** 分類名 */
    categoryName: string;
    /** 備考 */
    notes: string;
  }
}
