/**
 * パブリックグループ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupInfo/index.html
 */
interface PublicGroupInfo {
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 国際化情報 */
  locales: PublicGroupInfo.Locales;
  /** パブリックグループコード */
  publicGroupCd: string;
  /** パブリックグループセットコード */
  publicGroupSetCd: string;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
  /** 開始日 */
  startDate: Date;
  /** 期間コード */
  termCd: string;
}

declare namespace PublicGroupInfo {
  type Locales = { [localeId: string]: LocalizedPublicGroupInfo };

  interface LocalizedPublicGroupInfo {
    /** パブリックグループ名 */
    publicGroupName: string;
    /** パブリックグループ検索名 */
    publicGroupSearchName: string;
    /** パブリックグループ略称 */
    publicGroupShortName: string;
    /** 備考 */
    notes: string;
  }
}
