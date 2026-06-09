/**
 * 法人グループ情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationGroupInfo/index.html
 */
interface CorporationGroupInfo {
  /** 会社コード */
  companyCd: string;
  /** 法人グループコード */
  corporationGroupCd: string;
  /** 法人グループセットコード */
  corporationGroupSetCd: string;
  /** デフォルトロケールID */
  defaultLocale: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 終了日 */
  endDate: Date;
  /** 国際化情報 */
  locales: CorporationGroupInfo.Locales;
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

declare namespace CorporationGroupInfo {
  type Locales = { [localeId: string]: LocalizedCorporationGroupInfo };

  interface LocalizedCorporationGroupInfo {
    /** 法人グループ名 */
    corporationGroupName: string;
    /** 法人グループ検索名 */
    corporationGroupSearchName: string;
    /** 法人グループ略称 */
    corporationGroupShortName: string;
    /** 備考 */
    notes: string;
  }
}
