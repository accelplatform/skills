/**
 * WSSE 認証ダイジェスト生成ユーティリティ API。
 *
 * WS-Security の UsernameToken 形式の認証用文字列を生成します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/WSAuthDigestGenerator4WSSE/index.html
 */
declare class WSAuthDigestGenerator4WSSE {
  /**
   * 認証タイプを返却します。
   *
   * @return 認証タイプ文字列
   */
  static getAuthType(): string;

  /**
   * WSSE 認証用文字列を生成します。
   *
   * @param userID ユーザID
   * @param password パスワード
   * @return UsernameToken 形式の認証用文字列
   */
  static getDigest(userID: string, password: string): string;
}
