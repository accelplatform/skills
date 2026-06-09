/**
 * システムタイムゾーン API。
 *
 * システムで利用可能なタイムゾーン情報を扱います。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/SystemTimeZone/index.html
 */
declare class SystemTimeZone {
  /**
   * 内部に保持している設定のクリアを行います。
   *
   * @deprecated 開発用途に限定されるため、一般的な使用は推奨されません
   * @return data に null を格納した ResultObject（処理の成否は error を参照）
   */
  static clearCache(): ResultObject<null>;

  /**
   * システムデフォルトのタイムゾーンを取得します。
   *
   * @return data にデフォルトタイムゾーンを格納した ResultObject
   */
  static getDefaultTimeZone(): ResultObject<TimeZone>;

  /**
   * 指定されたID のタイムゾーンを取得します。
   *
   * @param id タイムゾーンID
   * @return data にタイムゾーン（存在しない場合 null）を格納した ResultObject
   */
  static getTimeZone(id: string): ResultObject<TimeZone | null>;

  /**
   * システムで利用可能なタイムゾーンをすべて取得します。
   *
   * @return data にタイムゾーンの配列を格納した ResultObject
   */
  static getTimeZones(): ResultObject<TimeZone[]>;

  /**
   * 指定されたタイムゾーンID がシステムで利用可能かを判定します。
   *
   * @param id タイムゾーンID
   * @return data に利用可否を格納した ResultObject（true: 利用可能）
   */
  static isAvailableTimeZone(id: string): ResultObject<boolean>;
}
