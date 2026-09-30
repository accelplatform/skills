/**
 * ロール情報オブジェクト。
 *
 * ロールに関する詳細情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/RoleInfo/index.html
 */
interface RoleInfo {
  /** ロールID */
  roleId: string;
  /** ロール名 */
  roleName: string;
  /** カテゴリ */
  category: string;
  /** ロケールID をキー、表示名を値とするマップ */
  displayName: { [localeId: string]: string };
  /** 備考 */
  notes: string;
}
