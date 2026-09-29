/**
 * ユーザライセンスクラス。
 *
 * ユーザライセンスの登録や削除を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/UserLicense/index.html
 */
declare class UserLicense {
  /**
   * ユーザライセンスクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * アカウントライセンスを削除します。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteAccountLicense(userCd: string): ResultObject<null>;

  /**
   * アプリケーションライセンスを削除します。
   *
   * @param userCd ユーザコード
   * @param applicationId アプリケーションID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteApplicationLicense(userCd: string, applicationId: string): ResultObject<null>;

  /**
   * 登録アカウントライセンス数を取得します。
   *
   * @return data にアカウントライセンス数を格納した ResultObject
   */
  getAccountLicense(): ResultObject<number>;

  /**
   * 登録アプリケーションライセンス数を取得します。
   *
   * @param applicationId アプリケーションID
   * @return data にアプリケーションライセンス数を格納した ResultObject
   */
  getApplicationLicense(applicationId: string): ResultObject<number>;

  /**
   * 最大アカウントライセンス数を取得します。
   *
   * @return data に最大アカウントライセンス数を格納した ResultObject
   */
  getMaxAccountLicense(): ResultObject<number>;

  /**
   * 最大アプリケーションライセンス数を取得します。
   *
   * @param applicationId アプリケーションID
   * @return data に最大アプリケーションライセンス数を格納した ResultObject
   */
  getMaxApplicationLicense(applicationId: string): ResultObject<number>;

  /**
   * ユーザのアプリケーションライセンスを取得します。
   *
   * @param userCd ユーザコード
   * @return data にアプリケーションID の配列を格納した ResultObject
   */
  getUserApplicationLicenses(userCd: string): ResultObject<string[]>;

  /**
   * アカウントライセンスの登録状態を確認します。
   *
   * @param userCd ユーザコード
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  isRegisteredAccountLicense(userCd: string): ResultObject<boolean>;

  /**
   * アプリケーションライセンスの登録状態を確認します。
   *
   * @param userCd ユーザコード
   * @param applicationId アプリケーションID
   * @return data に登録有無を格納した ResultObject（true: 登録済み）
   */
  isRegisteredApplicationLicense(userCd: string, applicationId: string): ResultObject<boolean>;

  /**
   * アカウントライセンスを登録します。
   *
   * @param userCd ユーザコード
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  registerAccountLicense(userCd: string): ResultObject<null>;

  /**
   * アプリケーションライセンスを登録します。
   *
   * @param userCd ユーザコード
   * @param applicationId アプリケーションID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  registerApplicationLicense(userCd: string, applicationId: string): ResultObject<null>;

  /**
   * アカウントライセンス保持ユーザ数を検索します。
   *
   * @param userCd ユーザコード（部分一致）
   * @return data に検索結果件数を格納した ResultObject
   */
  searchAccountLicenseCount(userCd: string): ResultObject<number>;

  /**
   * アカウントライセンス保持ユーザコードを検索します。
   *
   * @param userCd ユーザコード（部分一致）
   * @param start 取得開始位置
   * @param length 取得件数
   * @param order ソート順
   * @return data にユーザコードの配列を格納した ResultObject
   */
  searchAccountLicenseUsers(userCd: string, start: number, length: number, order: string): ResultObject<string[]>;

  /**
   * アプリケーションライセンス保持ユーザ数を検索します。
   *
   * @param userCd ユーザコード（部分一致）
   * @param applicationId アプリケーションID
   * @return data に検索結果件数を格納した ResultObject
   */
  searchApplicationLicenseCount(userCd: string, applicationId: string): ResultObject<number>;

  /**
   * アプリケーションライセンス保持ユーザコードを検索します。
   *
   * @param userCd ユーザコード（部分一致）
   * @param applicationId アプリケーションID
   * @param start 取得開始位置
   * @param length 取得件数
   * @param order ソート順
   * @return data にユーザコードの配列を格納した ResultObject
   */
  searchApplicationLicenseUsers(userCd: string, applicationId: string, start: number, length: number, order: string): ResultObject<string[]>;
}
