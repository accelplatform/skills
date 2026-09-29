/**
 * システムロケール API。
 *
 * システムで利用可能なロケール情報を扱います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SystemLocale/index.html
 */
declare class SystemLocale {
  /**
   * 内部に保持している設定のクリアを行います。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static clearCache(): ResultObject<null>;

  /**
   * システムデフォルトのロケール情報を取得します。
   *
   * @return data にデフォルトロケール情報を格納した ResultObject
   */
  static getDefaultLocaleInfo(): ResultObject<LocaleInfo>;

  /**
   * 指定されたロケールID のロケール情報を取得します。
   *
   * @param id ロケールID
   * @return data にロケール情報（利用不可の場合 null）を格納した ResultObject
   */
  static getLocaleInfo(id: string): ResultObject<LocaleInfo | null>;

  /**
   * システムで利用可能なすべてのロケール情報を取得します。
   *
   * @return data にロケール情報の配列を格納した ResultObject
   */
  static getLocaleInfos(): ResultObject<LocaleInfo[]>;

  /**
   * 指定されたロケールID がシステムで利用可能かを判定します。
   *
   * @param id ロケールID
   * @return data に利用可否を格納した ResultObject（true: 利用可能）
   */
  static isAvailableLocale(id: string): ResultObject<boolean>;
}
