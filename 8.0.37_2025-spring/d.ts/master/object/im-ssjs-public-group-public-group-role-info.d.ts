/**
 * パブリックグループ・パブリックグループロール情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PublicGroupPublicGroupRoleInfo/index.html
 */
interface PublicGroupPublicGroupRoleInfo {
  /** パブリックグループコード */
  readonly publicGroupCd: string;
  /** パブリックグループ名 */
  readonly publicGroupName: string;
  /** パブリックグループセットコード */
  readonly publicGroupSetCd: string;
  /** パブリックグループ略称 */
  readonly publicGroupShortName: string;
  /** ランク */
  readonly rank: number;
  /** 役割コード */
  readonly roleCd: string;
  /** 役割名 */
  readonly roleName: string;
  /** ユーザコード */
  readonly userCd: string;
}
