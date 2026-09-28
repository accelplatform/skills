/**
 * IdP 遷移先情報オブジェクト。
 *
 * SAML 認証フローでアイデンティティプロバイダへリダイレクトするための情報を保持します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SAMLSpServiceRequestModel/index.html
 */
interface SAMLSpServiceRequestModel {
  /** HTTP メソッド */
  readonly method: SAMLSpServiceRequestModel.Method;
  /** リクエストパラメータのキーバリューマッピング */
  readonly params: { [key: string]: string };
  /** リダイレクト先 URL */
  readonly url: string;
}

declare namespace SAMLSpServiceRequestModel {
  type Method = 'GET' | 'POST';
}
