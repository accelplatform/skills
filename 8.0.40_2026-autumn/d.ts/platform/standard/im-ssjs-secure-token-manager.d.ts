/**
 * セキュアトークンマネージャ。
 *
 * トークン検証により不正なリクエストを防止します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/SecureTokenManager/index.html
 */
declare class SecureTokenManager {
  /** リクエストパラメータ名（'im_secure_token'） */
  static readonly REQUEST_PARAMETER_NAME: 'im_secure_token';

  /**
   * セキュアトークンマネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * トークンを生成します。
   *
   * @param useOneTimeToken ワンタイムトークンを使用する場合 true
   * @param parameter トークン生成時に使用するパラメータ
   * @return data にトークン文字列を含む ResultObject
   */
  createToken(useOneTimeToken: boolean, parameter?: SecureTokenManager.Parameter): ResultObject<string>;

  /**
   * トークンの正当性を検証します。
   *
   * @param token 検証するトークン。省略時はリクエストパラメータから取得
   * @param parameter トークン生成時のパラメータ（比較用）
   * @return data に検証結果（boolean）を含む ResultObject
   */
  verify(token?: string, parameter?: SecureTokenManager.Parameter): ResultObject<boolean>;
}

declare namespace SecureTokenManager {
  type Parameter = any;
}
