/**
 * クライアントタイプ切り替え API。
 *
 * クライアントタイプの切り替えを行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/ClientTypeSwitcher/index.html
 */
declare class ClientTypeSwitcher {
  /**
   * クライアントタイプの切り替えを行います。
   * この切り替えは一つのリクエストの間のみ有効です。
   *
   * @param clientTypeId クライアントタイプID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static oneTimeSwitchTo(clientTypeId: string): ResultObject<null>;

  /**
   * クライアントタイプの切り替えを行います。
   * この切り替えはセッションが切れるまで有効です。
   *
   * @param clientTypeId クライアントタイプID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static switchTo(clientTypeId: string): ResultObject<null>;
}
