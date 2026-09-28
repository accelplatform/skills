/**
 * アクセスコンテキスト状態取得 API。
 *
 * 主にアカウントコンテキストで管理するアクセスコンテキストの状態を提供するクラスです。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ContextStatus/index.html
 */
declare class ContextStatus {
  /**
   * システム管理者かどうかを確認します。
   *
   * @return システム管理者の場合 true
   */
  static isAdministrator(): boolean;

  /**
   * 認証ユーザかどうかを確認します。
   *
   * @return 認証ユーザの場合 true
   */
  static isAuthenticated(): boolean;

  /**
   * ログイン署名の整合性をチェックします。
   * 未認証ユーザの場合、常に false となります。
   *
   * @return ログイン署名が正常な場合 true
   */
  static validate(): boolean;
}
