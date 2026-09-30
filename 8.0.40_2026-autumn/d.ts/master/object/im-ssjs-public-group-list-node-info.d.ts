/**
 * パブリックグループリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupListNodeInfo/index.html
 */
interface PublicGroupListNodeInfo {
  /** 削除フラグ */
  deleteFlag: boolean;
  /** 記述名 */
  description: string;
  /** 表示名 */
  displayName: string;
  /** パブリックグループコード */
  publicGroupCd: string;
  /** パブリックグループセットコード */
  publicGroupSetCd: string;
  /** 略称 */
  shortName: string;
}
