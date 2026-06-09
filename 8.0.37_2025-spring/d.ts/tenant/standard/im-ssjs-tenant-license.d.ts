/**
 * テナントライセンスクラス。
 *
 * テナント毎の利用可能なライセンスを扱います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/TenantLicense/index.html
 */
declare class TenantLicense {
  /**
   * テナントライセンスクラスのインスタンスを生成します。
   */
  constructor();

  /**
   * テナントのライセンス情報を削除します。
   *
   * @param tenantId テナントID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteLicense(tenantId: string): ResultObject<null>;

  /**
   * 設定済みのアカウントライセンス数を取得します。
   *
   * @param tenantId テナントID
   * @return data にアカウントライセンス数を格納した ResultObject
   */
  getAccountLicense(tenantId: string): ResultObject<number>;

  /**
   * 設定済みのアプリケーションライセンス数を取得します。
   *
   * @param applicationId アプリケーションID
   * @param tenantId テナントID
   * @return data にアプリケーションライセンス数を格納した ResultObject
   */
  getApplicationLicense(applicationId: string, tenantId: string): ResultObject<number>;

  /**
   * システム全体の最大アカウントライセンス数を取得します。
   *
   * @return data に最大アカウントライセンス数を格納した ResultObject
   */
  getMaxAccountLicense(): ResultObject<number>;

  /**
   * システム全体の最大アプリケーションライセンス数を取得します。
   *
   * @param applicationId アプリケーションID
   * @return data に最大アプリケーションライセンス数を格納した ResultObject
   */
  getMaxApplicationLicense(applicationId: string): ResultObject<number>;

  /**
   * 各テナント合計のアカウントライセンス数を取得します。
   *
   * @return data に合計アカウントライセンス数を格納した ResultObject
   */
  getTotalAccountLicense(): ResultObject<number>;

  /**
   * 各テナント合計のアプリケーションライセンス数を取得します。
   *
   * @param applicationId アプリケーションID
   * @return data に合計アプリケーションライセンス数を格納した ResultObject
   */
  getTotalApplicationLicense(applicationId: string): ResultObject<number>;

  /**
   * テナントの最大アカウント数を設定します。
   *
   * @param tenantId テナントID
   * @param maxLicense 最大アカウント数
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  setAccountLicense(tenantId: string, maxLicense: number): ResultObject<null>;

  /**
   * テナントの最大アプリケーション数を設定します。
   *
   * @param applicationId アプリケーションID
   * @param tenantId テナントID
   * @param maxLicense 最大アプリケーション数
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  setApplicationLicense(applicationId: string, tenantId: string, maxLicense: number): ResultObject<null>;
}
