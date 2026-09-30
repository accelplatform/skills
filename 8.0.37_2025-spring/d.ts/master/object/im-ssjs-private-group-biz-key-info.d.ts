/**
 * プライベートグループビジネスキーオブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PrivateGroupBizKeyInfo/index.html
 */
interface PrivateGroupBizKeyInfo {
  /** プライベートグループコード */
  privateGroupCd: string;
  /** オーナーユーザコード */
  userCd: string;
}
