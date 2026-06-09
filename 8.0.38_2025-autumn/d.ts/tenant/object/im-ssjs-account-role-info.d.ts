/**
 * アカウントロール情報オブジェクト。
 *
 * アカウントに付与されたロールに関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/AccountRoleInfo/index.html
 */
interface AccountRoleInfo {
  /** ロールID */
  roleId: string;
  /** ロール有効開始日 */
  roleValidStartDate: Date;
  /** ロール有効終了日 */
  roleValidEndDate: Date;
}
