/**
 * 法人グループセット情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationGroupSetInfo/index.html
 */
interface CorporationGroupSetInfo {
  /** 会社コード */
  companyCd: string;
  /** 法人グループセットコード */
  corporationGroupSetCd: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 最終更新日 */
  recordDate: Date;
  /** 最終更新者 */
  recordUserCd: string;
  /** ソートキー */
  sortKey: number;
}
