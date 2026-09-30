/**
 * システム管理者マネージャ。
 *
 * システム管理者情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/AdministratorManager/index.html
 */
declare class AdministratorManager {
  /**
   * システム管理者マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * システム管理者情報を新規追加します。
   *
   * @param administrator 管理者情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  addAdministrator(administrator: Administrator): ResultObject<null>;

  /**
   * システム管理者情報を削除します。
   * 削除対象がログインユーザと同一の場合はエラーになります。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAdministrator(userCd: string): ResultObject<null>;

  /**
   * システム管理者情報を取得します。
   *
   * @param userCd ユーザコード
   * @return data に管理者情報を格納した ResultObject
   */
  getAdministrator(userCd: string): ResultObject<Administrator>;

  /**
   * システム管理者数を取得します。
   *
   * @return data に管理者数を格納した ResultObject
   */
  getAdministratorCount(): ResultObject<number>;

  /**
   * システム管理者情報の一覧を取得します（ユーザコード昇順）。
   *
   * @param start 取得開始位置
   * @param count 取得件数
   * @return data に管理者情報の配列を格納した ResultObject
   */
  getAdministrators(start?: number, count?: number): ResultObject<Administrator[]>;

  /**
   * システム管理者情報を更新します。
   *
   * @param administrator 管理者情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateAdministrator(administrator: Administrator): ResultObject<null>;
}
