/**
 * タイムゾーンフォーマッタ API。
 *
 * タイムゾーンの表示名をパターンを利用して整形します。
 *
 * @since 8.0.37 (2025 Spring)
 * @see https://api.intra-mart.jp/iap/apilist-ssjs/doc/tenant/TimeZoneFormatter/index.html
 */
declare class TimeZoneFormatter {
  /**
   * パターンを使ってタイムゾーンの表示名を整形します。
   * システム現在日付でオフセット値を計算します。
   *
   * @param timeZone 整形対象のタイムゾーン
   * @param pattern パターン文字列
   * @param localeId 表示名のロケールID
   * @return data に整形されたタイムゾーン表示名を格納した ResultObject
   */
  static format(timeZone: TimeZone, pattern: string, localeId?: string): ResultObject<string>;

  /**
   * 指定された日付でのオフセット値を使用してタイムゾーンの表示名を整形します。
   *
   * @param timeZone 整形対象のタイムゾーン
   * @param pattern パターン文字列
   * @param targetDate オフセット値取得用の日付
   * @param localeId 表示名のロケールID
   * @return data に整形されたタイムゾーン表示名を格納した ResultObject
   */
  static formatByDate(timeZone: TimeZone, pattern: string, targetDate: Date, localeId?: string): ResultObject<string>;
}
