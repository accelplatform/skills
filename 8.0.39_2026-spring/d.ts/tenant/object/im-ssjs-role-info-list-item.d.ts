/**
 * ロール情報リスト項目オブジェクト。
 *
 * ロール一覧の各項目に関する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/RoleInfoListItem/index.html
 */
interface RoleInfoListItem {
  /** カテゴリ */
  category: string;
  /** 表示名 */
  displayName: string;
  /** ロールID */
  roleId: string;
  /** ロール名 */
  roleName: string;
}
