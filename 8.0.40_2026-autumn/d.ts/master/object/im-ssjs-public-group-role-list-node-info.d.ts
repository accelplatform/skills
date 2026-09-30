/**
 * パブリックグループロールリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupRoleListNodeInfo/index.html
 */
interface PublicGroupRoleListNodeInfo {
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 記述名 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** パブリックグループセットコード */
  readonly publicGroupSetCd: string;
  /** ランク */
  readonly rank: number;
  /** 役割コード */
  readonly roleCd: string;
}
