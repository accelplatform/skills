/**
 * プライベートグループリスト情報オブジェクト。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/im_master/PrivateGroupListNodeInfo/index.html
 */
interface PrivateGroupListNodeInfo {
  /** 削除フラグ */
  readonly deleteFlag: boolean;
  /** 説明 */
  readonly description: string;
  /** 表示名 */
  readonly displayName: string;
  /** プライベートグループコード */
  readonly privateGroupCd: string;
  /** オーナーユーザコード */
  readonly userCd: string;
}
