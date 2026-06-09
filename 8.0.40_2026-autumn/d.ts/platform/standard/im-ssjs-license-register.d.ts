/**
 * ライセンス登録クラス。
 *
 * ライセンスキーの登録・削除やアプリケーション情報を取得します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/platform/LicenseRegister/index.html
 */
declare class LicenseRegister {
  /**
   * ライセンス登録クラスのインスタンスを生成します。
   */
  constructor();

  /**
   * ライセンスキーを削除します。
   *
   * @param licenseKey ライセンスキー
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  deleteLicenseKey(licenseKey: string): ResultObject<null>;

  /**
   * インストール済みアプリケーション一覧を取得します。
   *
   * @return アプリケーション情報の配列
   */
  getApplications(): ApplicationInfo[];

  /**
   * ライセンス認証コードを取得します。
   *
   * @param applicationId アプリケーションID
   * @return data に認証コード（アクティベーション不要の場合 null）を格納した ResultObject
   */
  getAuthorizationCode(applicationId: string): ResultObject<string | null>;

  /**
   * インストール済みエクステンション一覧を取得します。
   *
   * @return エクステンション情報の配列
   */
  getExtensions(): ApplicationInfo[];

  /**
   * インストール済み言語パック一覧を取得します。
   *
   * @return 言語パック情報の配列
   */
  getLanguagePacks(): ApplicationInfo[];

  /**
   * 指定されたアプリケーションのライセンス情報を取得します。
   *
   * @param applicationId アプリケーションID
   * @return アプリケーション情報オブジェクト。未インストールの場合 null
   */
  getLicenseInfo(applicationId: string): ApplicationInfo | null;

  /**
   * プラットフォーム情報を取得します。
   *
   * @return プラットフォーム情報オブジェクト
   */
  getPlatform(): ApplicationInfo;

  /**
   * ライセンスキーが登録済みの未インストールアプリケーション一覧を取得します。
   *
   * @return アプリケーション情報の配列
   */
  getUninstalledApplications(): ApplicationInfo[];

  /**
   * アプリケーションがアクティベーションを必要とするかを判定します。
   *
   * @param applicationId アプリケーションID
   * @return アクティベーションが必要な場合 true
   */
  needActivation(applicationId: string): boolean;

  /**
   * アクティベーションキーを登録します。
   *
   * @param data アクティベーションキーデータ
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  registerActivationKey(data: string): ResultObject<null>;

  /**
   * ライセンスキーを登録します。
   *
   * @param licenseKey ライセンスキー
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  registerLicenseKey(licenseKey: string): ResultObject<null>;
}
