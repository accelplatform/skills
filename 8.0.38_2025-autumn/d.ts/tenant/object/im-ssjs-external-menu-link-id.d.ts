/**
 * 外部メニューリンクID オブジェクト。
 *
 * 外部メニューの参照先を特定する情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/ExternalMenuLinkId/index.html
 */
interface ExternalMenuLinkId {
  /** メニューID */
  readonly menuId: string;
  /** プロバイダID */
  readonly providerId: string;
}
