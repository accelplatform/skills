/**
 * パブリックグループロール情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupRoleInfo/index.html
 */
interface PublicGroupRoleInfo {
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 国際化情報 */
  locales: PublicGroupRoleInfo.Locales;
  /** パブリックグループセットコード */
  publicGroupSetCd: string;
  /** ランク */
  rank: number;
  /** 更新日時 */
  recordDate: Date;
  /** 更新者ユーザコード */
  recordUserCd: string;
  /** 役割コード */
  roleCd: string;
  /** ソートキー */
  sortKey: number;
  /** 開始日 */
  startDate: Date;
  /** 期間コード */
  termCd: string;
}

declare namespace PublicGroupRoleInfo {
  type Locales = { [localeId: string]: LocalizedPublicGroupRoleInfo };

  interface LocalizedPublicGroupRoleInfo {
    /** 役割名 */
    roleName: string;
    /** 備考 */
    notes: string;
  }
}
