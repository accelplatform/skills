/**
 * SAML パラメータオブジェクト。
 *
 * SAML 認証操作に使用するパラメータを保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SAMLParameter/index.html
 */
interface SAMLParameter {
  /** saml-profile-handler-config.xml に定義されたプロファイルID */
  profId: string;
  /** クライアントリクエスト情報を含む Request オブジェクト */
  request: Request;
}
