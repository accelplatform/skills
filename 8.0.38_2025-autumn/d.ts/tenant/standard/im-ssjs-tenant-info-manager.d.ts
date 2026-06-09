/**
 * テナント情報マネージャ。
 *
 * テナント情報の操作を行います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/TenantInfoManager/index.html
 */
declare class TenantInfoManager {
  /** テナント属性: 数値フォーマットID（'im_i18n_decimal_format_id'） */
  static readonly ATTR_DECIMAL_FORMAT: 'im_i18n_decimal_format_id';

  /**
   * テナント情報マネージャのインスタンスを生成します。
   */
  constructor();

  /**
   * テナントの存在を確認します。
   *
   * @param tenantId テナントID
   * @return data に存在有無を格納した ResultObject（true: 存在する）
   */
  exists(tenantId: string): ResultObject<boolean>;

  /**
   * デフォルトテナントID を取得します。
   *
   * @return data にデフォルトテナントID 文字列を格納した ResultObject
   */
  getDefaultTenantId(): ResultObject<string>;

  /**
   * テナント情報を取得します。
   * 未設定項目は null のまま返却されます。
   *
   * システムロケールの取得に失敗した場合、エンコーディングが null になることがあります。
   *
   * @return data に TenantInfo を格納した ResultObject
   */
  getTenantInfo(): ResultObject<TenantInfo>;

  /**
   * テナント情報を取得します。
   * isFill が true の場合、未設定値をシステムデフォルトで補完します。
   *
   * @param isFill 未設定値をデフォルトで補完する場合 true
   * @return data に TenantInfo を格納した ResultObject
   */
  getTenantInfo(isFill: boolean): ResultObject<TenantInfo>;

  /**
   * 指定テナントID のテナント情報を取得します。
   *
   * @param tenantId テナントID
   * @return data に TenantInfo を格納した ResultObject
   */
  getTenantInfo(tenantId: string): ResultObject<TenantInfo>;

  /**
   * 指定テナントID のテナント情報を取得します。
   *
   * @param tenantId テナントID
   * @param isFill 未設定値をデフォルトで補完する場合 true
   * @return data に TenantInfo を格納した ResultObject
   */
  getTenantInfo(tenantId: string, isFill: boolean): ResultObject<TenantInfo>;

  /**
   * テナントID 一覧を取得します。
   *
   * @return data にテナントID の配列を格納した ResultObject
   */
  getTenantIds(): ResultObject<string[]>;

  /**
   * テナント情報を登録します。
   *
   * @param tenantInfo テナント情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  insertTenantInfo(tenantInfo: TenantInfo): ResultObject<null>;

  /**
   * テナント情報を更新します。
   *
   * @param tenantInfo テナント情報
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  updateTenantInfo(tenantInfo: TenantInfo): ResultObject<null>;

  /**
   * テナント情報を削除します。
   *
   * @param tenantId テナントID
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteTenantInfo(tenantId: string): ResultObject<null>;
}
