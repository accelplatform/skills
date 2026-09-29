/**
 * アカウントパスワードアダプタクラス。
 *
 * アカウントパスワードに関する機能を提供します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/AccountPasswordAdapter/index.html
 */
declare class AccountPasswordAdapter {
  /**
   * アカウントパスワードアダプタクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * パスワードが可逆な形式で保存されているかを取得します。
   *
   * @return data に可逆形式フラグを格納した ResultObject（true: 可逆形式）
   */
  canDecrypt(): ResultObject<boolean>;

  /**
   * パスワードの照合を行います。
   *
   * @param userCd ユーザコード
   * @param password パスワード
   * @return data に照合結果を格納した ResultObject（true: 一致）
   */
  collate(userCd: string, password: string): ResultObject<boolean>;
}
