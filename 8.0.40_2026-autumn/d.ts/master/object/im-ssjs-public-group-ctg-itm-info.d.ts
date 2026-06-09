/**
 * パブリックグループ分類区分項目情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupCtgItmInfo/index.html
 */
interface PublicGroupCtgItmInfo {
  /** 分類コード */
  categoryCd: string;
  /** 分類項目コード */
  categoryItemCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 国際化情報 */
  locales: PublicGroupCtgItmInfo.Locales;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}

declare namespace PublicGroupCtgItmInfo {
  type Locales = { [localeId: string]: LocalizedPublicGroupCtgItmInfo };

  interface LocalizedPublicGroupCtgItmInfo {
    /** 分類項目名 */
    categoryItemName: string;
    /** 備考 */
    notes: string;
  }
}
