/**
 * 法人グループリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/CorporationGroupListNodeInfo/index.html
 */
interface CorporationGroupListNodeInfo {
  /** 会社コード */
  companyCd: string;
  /** 法人グループコード */
  corporationGroupCd: string;
  /** 法人グループセットコード */
  corporationGroupSetCd: string;
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 説明 */
  description: string;
  /** 表示名 */
  displayName: string;
  /** 略称 */
  shortName: string;
}
