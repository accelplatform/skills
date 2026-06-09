/**
 * 表示名オブジェクト。
 *
 * ロケール別の表示名情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/DisplayName/index.html
 */
interface DisplayName {
  /** 表示名 */
  displayName: string;
  /** ロケール */
  locale: string;
}
